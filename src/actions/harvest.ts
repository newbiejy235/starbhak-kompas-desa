"use server";

import { db } from "@/db";
import {
  commoditiesTable,
  harvestRecordsTable,
  ImageUpload,
} from "@/db/schema";
import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
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

/* ======================== CATATAN PANEN ======================== */

export type HarvestRecordRow = {
  id: number;
  commodityId: number;
  commodityName: string;
  commodityUnit: string;
  harvestDate: Date;
  quantity: string;
  unit: string;
  quality: string;
  notes: string | null;
  createdAt: Date;
};

export async function getHarvestRecords(
  farmerId: number,
): Promise<HarvestRecordRow[]> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return [];

  return db
    .select({
      id: harvestRecordsTable.id,
      commodityId: harvestRecordsTable.commodityId,
      commodityName: commoditiesTable.name,
      commodityUnit: commoditiesTable.unit,
      harvestDate: harvestRecordsTable.harvestDate,
      quantity: harvestRecordsTable.quantity,
      unit: harvestRecordsTable.unit,
      quality: harvestRecordsTable.quality,
      notes: harvestRecordsTable.notes,
      createdAt: harvestRecordsTable.createdAt,
    })
    .from(harvestRecordsTable)
    .innerJoin(
      commoditiesTable,
      eq(commoditiesTable.id, harvestRecordsTable.commodityId),
    )
    .where(eq(harvestRecordsTable.farmerId, farmerId))
    .orderBy(desc(harvestRecordsTable.harvestDate));
}

const QUALITIES = ["A", "B", "C"] as const;

export async function addHarvestRecord(
  farmerId: number,
  data: FormData,
): Promise<ActionState & { recordId?: number }> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return { success: false, message: "Unauthorized" };

  const commodityId = Number(data.get("commodityId"));
  const harvestDate = String(data.get("harvestDate") ?? "");
  const quantity = Number(data.get("quantity"));
  const unit = (String(data.get("unit") ?? "kg")).trim() || "kg";
  const quality = String(data.get("quality") ?? "A");
  const notes = (data.get("notes") as string)?.trim() || "";

  if (!commodityId) {
    return { success: false, message: "Pilih komoditas terlebih dahulu" };
  }
  if (!harvestDate || Number.isNaN(new Date(harvestDate).getTime())) {
    return { success: false, message: "Tanggal panen tidak valid" };
  }
  if (!quantity || quantity <= 0) {
    return { success: false, message: "Jumlah hasil panen harus lebih dari 0" };
  }
  if (!QUALITIES.includes(quality as (typeof QUALITIES)[number])) {
    return { success: false, message: "Kualitas tidak valid" };
  }

  try {
    // Pastikan komoditas benar-benar milik petani ini.
    const [commodity] = await db
      .select({ id: commoditiesTable.id })
      .from(commoditiesTable)
      .where(
        and(
          eq(commoditiesTable.id, commodityId),
          eq(commoditiesTable.farmerId, farmerId),
        ),
      );

    if (!commodity) {
      return { success: false, message: "Komoditas tidak ditemukan" };
    }

    const [record] = await db
      .insert(harvestRecordsTable)
      .values({
        farmerId,
        commodityId,
        harvestDate: new Date(harvestDate),
        quantity: String(quantity),
        unit,
        quality,
        notes: notes || null,
      })
      .returning({ id: harvestRecordsTable.id });

    revalidatePath("/petani/catatan-panen");
    return {
      success: true,
      message: "Catatan panen berhasil disimpan",
      recordId: record.id,
    };
  } catch (error) {
    console.error("addHarvestRecord error:", error);
    return { success: false, message: "Gagal menyimpan catatan panen" };
  }
}

export async function deleteHarvestRecord(
  farmerId: number,
  recordId: number,
): Promise<ActionState> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return { success: false, message: "Unauthorized" };

  try {
    const deleted = await db
      .delete(harvestRecordsTable)
      .where(
        and(
          eq(harvestRecordsTable.id, recordId),
          eq(harvestRecordsTable.farmerId, farmerId),
        ),
      )
      .returning({ id: harvestRecordsTable.id });

    if (deleted.length === 0) {
      return { success: false, message: "Catatan tidak ditemukan" };
    }

    revalidatePath("/petani/catatan-panen");
    return { success: true, message: "Catatan panen dihapus" };
  } catch (error) {
    console.error("deleteHarvestRecord error:", error);
    return { success: false, message: "Gagal menghapus catatan panen" };
  }
}
