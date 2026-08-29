"use server";

import { db } from "@/db";
import { commoditiesTable, ImageUpload } from "@/db/schema";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/auth.service";
import type { ActionState } from "@/lib/types/auth";

/** Validasi identitas petani dari sesi sebelum menyentuh database. */
async function requireFarmer(farmerId: number) {
  const user = await getAuthUser(farmerId);
  if (!user || user.role !== "petani") return null;
  return user;
}

/* ======================= KALENDER PANEN ======================= */

export type HarvestScheduleRow = {
  id: number;
  name: string;
  image: string | null;
  images: string[] | null;
  stock: string;
  unit: string;
  harvestEstimate: Date | null;
  status: string;
};

export async function getHarvestCalendar(
  farmerId: number,
): Promise<HarvestScheduleRow[]> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return [];

  const rows = await db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      image: ImageUpload.secureUrl,
      images: commoditiesTable.images,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      harvestEstimate: commoditiesTable.harvestEstimate,
      status: commoditiesTable.status,
    })
    .from(commoditiesTable)
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .where(
      and(
        eq(commoditiesTable.farmerId, farmerId),
        isNotNull(commoditiesTable.harvestEstimate),
      ),
    )
    .orderBy(asc(commoditiesTable.harvestEstimate));

  return rows;
}

export async function updateHarvestEstimate(
  farmerId: number,
  commodityId: number,
  date: string | null,
): Promise<ActionState> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return { success: false, message: "Unauthorized" };

  const parsed = date ? new Date(date) : null;
  if (date && (!parsed || Number.isNaN(parsed.getTime()))) {
    return { success: false, message: "Tanggal panen tidak valid" };
  }

  try {
    // Scope selalu ke farmerId milik sesi agar tidak bisa menyentuh petani lain.
    const updated = await db
      .update(commoditiesTable)
      .set({ harvestEstimate: parsed })
      .where(
        and(
          eq(commoditiesTable.id, commodityId),
          eq(commoditiesTable.farmerId, farmerId),
        ),
      )
      .returning({ id: commoditiesTable.id });

    if (updated.length === 0) {
      return { success: false, message: "Komoditas tidak ditemukan" };
    }

    revalidatePath("/petani/kalender-panen");
    revalidatePath("/petani/dashboard");
    return { success: true, message: "Jadwal panen diperbarui" };
  } catch (error) {
    console.error("updateHarvestEstimate error:", error);
    return { success: false, message: "Gagal memperbarui jadwal panen" };
  }
}
