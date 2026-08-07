"use server";

import { db } from "@/db";
import {
  commoditiesTable,
  categoriesTable,
  usersTable,
} from "@/db/schema";
import {
  eq,
  and,
  desc,
  like,
  or,
  gt,
  asc,
  sql,
} from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/types/auth";

export async function getCategories() {
  return db.select().from(categoriesTable).orderBy(asc(categoriesTable.name));
}

export async function getPublicCommodities(params?: {
  search?: string;
  categoryId?: number;
  farmerId?: number;
  status?: string;
}) {
  const conditions = [
    or(
      eq(commoditiesTable.status, "available"),
      eq(commoditiesTable.status, "verified"),
    ),
  ];

  if (params?.search) {
    conditions.push(
      like(commoditiesTable.name, `%${params.search}%`),
    );
  }
  if (params?.categoryId) {
    conditions.push(eq(commoditiesTable.categoryId, params.categoryId));
  }
  if (params?.farmerId) {
    conditions.push(eq(commoditiesTable.farmerId, params.farmerId));
  }

  return db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      price: commoditiesTable.price,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      image: commoditiesTable.image,
      status: commoditiesTable.status,
      rating: commoditiesTable.rating,
      reviewCount: commoditiesTable.reviewCount,
      createdAt: commoditiesTable.createdAt,
      categoryName: categoriesTable.name,
      farmerName: usersTable.fullName,
      farmerId: usersTable.id,
      farmerStatus: usersTable.status,
    })
    .from(commoditiesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
    .where(and(...conditions))
    .orderBy(desc(commoditiesTable.createdAt));
}

export async function getCommodityById(id: number) {
  const [row] = await db
    .select({
      id: commoditiesTable.id,
      farmerId: commoditiesTable.farmerId,
      categoryId: commoditiesTable.categoryId,
      name: commoditiesTable.name,
      description: commoditiesTable.description,
      price: commoditiesTable.price,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      harvestEstimate: commoditiesTable.harvestEstimate,
      image: commoditiesTable.image,
      status: commoditiesTable.status,
      rating: commoditiesTable.rating,
      reviewCount: commoditiesTable.reviewCount,
      createdAt: commoditiesTable.createdAt,
      categoryName: categoriesTable.name,
      farmerName: usersTable.fullName,
      farmerEmail: usersTable.email,
      farmerNoTelp: usersTable.noTelp,
      farmerAddress: usersTable.address,
      farmerFoto: usersTable.fotoProfile,
      farmerStatus: usersTable.status,
    })
    .from(commoditiesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
    .where(eq(commoditiesTable.id, id));

  return row ?? null;
}

export async function getFarmerCommodities(farmerId: number) {
  return db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      description: commoditiesTable.description,
      price: commoditiesTable.price,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      categoryId: commoditiesTable.categoryId,
      harvestEstimate: commoditiesTable.harvestEstimate,
      image: commoditiesTable.image,
      status: commoditiesTable.status,
      createdAt: commoditiesTable.createdAt,
      categoryName: categoriesTable.name,
    })
    .from(commoditiesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .where(eq(commoditiesTable.farmerId, farmerId))
    .orderBy(desc(commoditiesTable.createdAt));
}

export async function createCommodity(
  farmerId: number,
  data: FormData,
): Promise<ActionState> {
  const user = await getAuthUser(farmerId);
  if (!user || user.role !== "petani") {
    return { success: false, message: "Unauthorized" };
  }

  const name = (data.get("name") as string)?.trim() || "";
  const description = (data.get("description") as string)?.trim() || "";
  const categoryId = Number(data.get("categoryId"));
  const price = Number(data.get("price"));
  const stock = Number(data.get("stock"));
  const unit = (data.get("unit") as string) || "kg";
  const quality = (data.get("quality") as string) || "A";
  const location = (data.get("location") as string)?.trim() || "";
  const harvestEstimateRaw = data.get("harvestEstimate") as string | null;
  const image = (data.get("image") as string)?.trim() || "";

  if (!name || !categoryId || !price || !stock || !location) {
    return { success: false, message: "Lengkapi semua field wajib" };
  }

  try {
    await db.insert(commoditiesTable).values({
      farmerId,
      categoryId,
      name,
      description,
      price: String(price),
      stock: String(stock),
      unit,
      quality,
      location,
      harvestEstimate: harvestEstimateRaw
        ? new Date(harvestEstimateRaw)
        : null,
      image,
      status: "pending",
    });

    revalidatePath("/petani/dashboard");
    revalidatePath("/admin/commodities");
    return {
      success: true,
      message: "Komoditas berhasil ditambahkan. Menunggu verifikasi admin.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menambahkan komoditas" };
  }
}

export async function updateCommodity(
  id: number,
  farmerId: number,
  data: FormData,
): Promise<ActionState> {
  const user = await getAuthUser(farmerId);
  if (!user || user.role !== "petani") {
    return { success: false, message: "Unauthorized" };
  }

  const [existing] = await db
    .select({ farmerId: commoditiesTable.farmerId })
    .from(commoditiesTable)
    .where(eq(commoditiesTable.id, id));
  if (!existing || existing.farmerId !== farmerId) {
    return { success: false, message: "Komoditas tidak ditemukan" };
  }

  const name = (data.get("name") as string)?.trim() || "";
  const description = (data.get("description") as string)?.trim() || "";
  const categoryId = Number(data.get("categoryId"));
  const price = Number(data.get("price"));
  const stock = Number(data.get("stock"));
  const unit = (data.get("unit") as string) || "kg";
  const quality = (data.get("quality") as string) || "A";
  const location = (data.get("location") as string)?.trim() || "";
  const harvestEstimateRaw = data.get("harvestEstimate") as string | null;
  const image = (data.get("image") as string)?.trim() || "";
  const status = (data.get("status") as string) || undefined;

  if (!name || !categoryId || !price || !stock || !location) {
    return { success: false, message: "Lengkapi semua field wajib" };
  }

  try {
    await db
      .update(commoditiesTable)
      .set({
        name,
        description,
        categoryId,
        price: String(price),
        stock: String(stock),
        unit,
        quality,
        location,
        harvestEstimate: harvestEstimateRaw
          ? new Date(harvestEstimateRaw)
          : null,
        image,
        ...(status ? { status: status as never } : {}),
      })
      .where(eq(commoditiesTable.id, id));

    revalidatePath("/petani/dashboard");
    return { success: true, message: "Komoditas berhasil diperbarui" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui komoditas" };
  }
}

export async function deleteCommodity(
  id: number,
  farmerId: number,
): Promise<ActionState> {
  const user = await getAuthUser(farmerId);
  if (!user || user.role !== "petani") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await db
      .delete(commoditiesTable)
      .where(
        and(
          eq(commoditiesTable.id, id),
          eq(commoditiesTable.farmerId, farmerId),
        ),
      );
    revalidatePath("/petani/dashboard");
    return { success: true, message: "Komoditas berhasil dihapus" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menghapus komoditas" };
  }
}

export async function setCommodityStatus(
  id: number,
  status: string,
  actorRole: string,
): Promise<ActionState> {
  if (actorRole !== "petani" && actorRole !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  const validStatuses = ["available", "sold_out", "pending", "verified"];
  if (!validStatuses.includes(status)) {
    return { success: false, message: "Status tidak valid" };
  }

  try {
    await db
      .update(commoditiesTable)
      .set({ status: status as never })
      .where(eq(commoditiesTable.id, id));
    revalidatePath("/petani/dashboard");
    revalidatePath("/admin/commodities");
    revalidatePath("/user/home");
    return { success: true, message: "Status komoditas diperbarui" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui status" };
  }
}

export async function getRelatedCommodities(
  categoryId: number,
  excludeId: number,
) {
  const rows = await db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      price: commoditiesTable.price,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      image: commoditiesTable.image,
      rating: commoditiesTable.rating,
      reviewCount: commoditiesTable.reviewCount,
      categoryName: categoriesTable.name,
      farmerName: usersTable.fullName,
    })
    .from(commoditiesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
    .where(
      and(
        eq(commoditiesTable.categoryId, categoryId),
        gt(commoditiesTable.id, -1),
        or(
          eq(commoditiesTable.status, "available"),
          eq(commoditiesTable.status, "verified"),
        ),
      ),
    )
    .orderBy(sql`${commoditiesTable.id} <> ${excludeId}`)
    .limit(4);

  return rows.filter((r) => r.id !== excludeId);
}
