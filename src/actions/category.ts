"use server";

import { db } from "@/db";
import { categoriesTable, commoditiesTable } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/types/auth";

export async function createCategory(
  adminId: number,
  data: FormData,
): Promise<ActionState> {
  const admin = await getAuthUser(adminId);
  if (!admin || admin.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  const name = (data.get("name") as string)?.trim() || "";
  const description = (data.get("description") as string)?.trim() || "";
  const icon = (data.get("icon") as string)?.trim() || "";

  if (!name) return { success: false, message: "Nama kategori wajib diisi" };

  try {
    await db.insert(categoriesTable).values({ name, description, icon });
    revalidatePath("/admin/categories");
    return { success: true, message: "Kategori berhasil ditambahkan" };
  } catch {
    return { success: false, message: "Gagal menambahkan kategori" };
  }
}

export async function updateCategory(
  id: number,
  adminId: number,
  data: FormData,
): Promise<ActionState> {
  const admin = await getAuthUser(adminId);
  if (!admin || admin.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  const name = (data.get("name") as string)?.trim() || "";
  const description = (data.get("description") as string)?.trim() || "";
  const icon = (data.get("icon") as string)?.trim() || "";

  if (!name) return { success: false, message: "Nama kategori wajib diisi" };

  try {
    await db
      .update(categoriesTable)
      .set({ name, description, icon })
      .where(eq(categoriesTable.id, id));
    revalidatePath("/admin/categories");
    return { success: true, message: "Kategori berhasil diperbarui" };
  } catch {
    return { success: false, message: "Gagal memperbarui kategori" };
  }
}

export async function deleteCategory(
  id: number,
  adminId: number,
): Promise<ActionState> {
  const admin = await getAuthUser(adminId);
  if (!admin || admin.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const [used] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(commoditiesTable)
      .where(eq(commoditiesTable.categoryId, id));
    if (used && Number(used.count) > 0) {
      return {
        success: false,
        message: "Kategori masih digunakan oleh komoditas",
      };
    }
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    revalidatePath("/admin/categories");
    return { success: true, message: "Kategori berhasil dihapus" };
  } catch {
    return { success: false, message: "Gagal menghapus kategori" };
  }
}

export async function getCategoryStats() {
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      icon: categoriesTable.icon,
      description: categoriesTable.description,
      count: sql<number>`count(${commoditiesTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(
      commoditiesTable,
      eq(commoditiesTable.categoryId, categoriesTable.id),
    )
    .groupBy(categoriesTable.id)
    .orderBy(asc(categoriesTable.name));

  return rows;
}
