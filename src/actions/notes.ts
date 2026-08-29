"use server";

import { db } from "@/db";
import { commoditiesTable, farmerNotesTable } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/auth.service";
import type { ActionState } from "@/lib/types/auth";

/** Validasi identitas petani dari sesi sebelum menyentuh database. */
async function requireFarmer(farmerId: number) {
  const user = await getAuthUser(farmerId);
  if (!user || user.role !== "petani") return null;
  return user;
}

export type FarmerNoteRow = {
  id: number;
  farmerId: number;
  commodityId: number | null;
  commodityName: string | null;
  title: string | null;
  content: string;
  category: string;
  noteDate: Date;
  location: string | null;
  weather: string | null;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getFarmerNotes(
  farmerId: number,
): Promise<FarmerNoteRow[]> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return [];

  return db
    .select({
      id: farmerNotesTable.id,
      farmerId: farmerNotesTable.farmerId,
      commodityId: farmerNotesTable.commodityId,
      commodityName: commoditiesTable.name,
      title: farmerNotesTable.title,
      content: farmerNotesTable.content,
      category: farmerNotesTable.category,
      noteDate: farmerNotesTable.noteDate,
      location: farmerNotesTable.location,
      weather: farmerNotesTable.weather,
      tags: farmerNotesTable.tags,
      createdAt: farmerNotesTable.createdAt,
      updatedAt: farmerNotesTable.updatedAt,
    })
    .from(farmerNotesTable)
    .leftJoin(
      commoditiesTable,
      eq(commoditiesTable.id, farmerNotesTable.commodityId),
    )
    .where(eq(farmerNotesTable.farmerId, farmerId))
    .orderBy(desc(farmerNotesTable.noteDate), desc(farmerNotesTable.id));
}

export async function addFarmerNote(
  farmerId: number,
  data: FormData,
): Promise<ActionState & { noteId?: number }> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return { success: false, message: "Unauthorized" };

  const title = (String(data.get("title") ?? "").trim() || null);
  const content = (String(data.get("content") ?? "")).trim();
  const categoryRaw = String(data.get("category") ?? "lainnya").trim();
  const noteDateRaw = String(data.get("noteDate") ?? "");
  const commodityRaw = String(data.get("commodityId") ?? "").trim();
  const location = (String(data.get("location") ?? "").trim() || null);
  const weather = (String(data.get("weather") ?? "").trim() || null);
  const tags = (String(data.get("tags") ?? "").trim() || null);

  if (!content) {
    return { success: false, message: "Isi catatan tidak boleh kosong" };
  }
  const category = categoryRaw || "lainnya";
  const noteDate = noteDateRaw
    ? new Date(noteDateRaw)
    : new Date();
  if (noteDateRaw && Number.isNaN(noteDate.getTime())) {
    return { success: false, message: "Tanggal tidak valid" };
  }
  const commodityId = commodityRaw ? Number(commodityRaw) : null;
  if (commodityRaw && (!commodityId || Number.isNaN(commodityId))) {
    return { success: false, message: "Komoditas tidak valid" };
  }

  try {
    let validCommodity = true;
    if (commodityId !== null) {
      const [commodity] = await db
        .select({ id: commoditiesTable.id })
        .from(commoditiesTable)
        .where(
          and(
            eq(commoditiesTable.id, commodityId),
            eq(commoditiesTable.farmerId, farmerId),
          ),
        );
      validCommodity = !!commodity;
    }
    if (!validCommodity) {
      return { success: false, message: "Komoditas tidak ditemukan" };
    }

    const [note] = await db
      .insert(farmerNotesTable)
      .values({
        farmerId,
        commodityId,
        title,
        content,
        category,
        noteDate,
        location,
        weather,
        tags,
      })
      .returning({ id: farmerNotesTable.id });

    revalidatePath("/petani/catatan-panen");
    return {
      success: true,
      message: "Catatan berhasil disimpan",
      noteId: note.id,
    };
  } catch (error) {
    console.error("addFarmerNote error:", error);
    return { success: false, message: "Gagal menyimpan catatan" };
  }
}

export async function updateFarmerNote(
  farmerId: number,
  noteId: number,
  data: FormData,
): Promise<ActionState> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return { success: false, message: "Unauthorized" };

  const title = (String(data.get("title") ?? "").trim() || null);
  const content = (String(data.get("content") ?? "")).trim();
  const categoryRaw = String(data.get("category") ?? "lainnya").trim();
  const noteDateRaw = String(data.get("noteDate") ?? "");
  const commodityRaw = String(data.get("commodityId") ?? "").trim();
  const location = (String(data.get("location") ?? "").trim() || null);
  const weather = (String(data.get("weather") ?? "").trim() || null);
  const tags = (String(data.get("tags") ?? "").trim() || null);

  if (!content) {
    return { success: false, message: "Isi catatan tidak boleh kosong" };
  }
  const category = categoryRaw || "lainnya";
  const noteDate = noteDateRaw ? new Date(noteDateRaw) : new Date();
  if (noteDateRaw && Number.isNaN(noteDate.getTime())) {
    return { success: false, message: "Tanggal tidak valid" };
  }
  const commodityId = commodityRaw ? Number(commodityRaw) : null;
  if (commodityRaw && (!commodityId || Number.isNaN(commodityId))) {
    return { success: false, message: "Komoditas tidak valid" };
  }

  try {
    let validCommodity = true;
    if (commodityId !== null) {
      const [commodity] = await db
        .select({ id: commoditiesTable.id })
        .from(commoditiesTable)
        .where(
          and(
            eq(commoditiesTable.id, commodityId),
            eq(commoditiesTable.farmerId, farmerId),
          ),
        );
      validCommodity = !!commodity;
    }
    if (!validCommodity) {
      return { success: false, message: "Komoditas tidak ditemukan" };
    }

    // Scope ke farmerId milik sesi agar tidak bisa mengubah catatan petani lain.
    const updated = await db
      .update(farmerNotesTable)
      .set({
        commodityId,
        title,
        content,
        category,
        noteDate,
        location,
        weather,
        tags,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(farmerNotesTable.id, noteId),
          eq(farmerNotesTable.farmerId, farmerId),
        ),
      )
      .returning({ id: farmerNotesTable.id });

    if (updated.length === 0) {
      return { success: false, message: "Catatan tidak ditemukan" };
    }

    revalidatePath("/petani/catatan-panen");
    return { success: true, message: "Catatan berhasil diperbarui" };
  } catch (error) {
    console.error("updateFarmerNote error:", error);
    return { success: false, message: "Gagal memperbarui catatan" };
  }
}

export async function deleteFarmerNote(
  farmerId: number,
  noteId: number,
): Promise<ActionState> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return { success: false, message: "Unauthorized" };

  try {
    const deleted = await db
      .delete(farmerNotesTable)
      .where(
        and(
          eq(farmerNotesTable.id, noteId),
          eq(farmerNotesTable.farmerId, farmerId),
        ),
      )
      .returning({ id: farmerNotesTable.id });

    if (deleted.length === 0) {
      return { success: false, message: "Catatan tidak ditemukan" };
    }

    revalidatePath("/petani/catatan-panen");
    return { success: true, message: "Catatan berhasil dihapus" };
  } catch (error) {
    console.error("deleteFarmerNote error:", error);
    return { success: false, message: "Gagal menghapus catatan" };
  }
}
