"use server";

import { db } from "@/db";
import {
  commoditiesTable,
  categoriesTable,
  usersTable,
  ImageUpload,
} from "@/db/schema";
import {
  eq,
  and,
  desc,
  ilike,
  or,
  gt,
  gte,
  lte,
  asc,
  sql,
  inArray,
} from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/types/auth";

export async function getCategories() {
  return db.select().from(categoriesTable).orderBy(asc(categoriesTable.name));
}

export async function getCategoriesWithCount() {
  return db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      icon: categoriesTable.icon,
      count: sql<number>`count(${commoditiesTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(
      commoditiesTable,
      and(
        eq(commoditiesTable.categoryId, categoriesTable.id),
        or(
          eq(commoditiesTable.status, "available"),
          eq(commoditiesTable.status, "verified"),
        ),
      ),
    )
    .groupBy(categoriesTable.id, categoriesTable.name, categoriesTable.icon)
    .orderBy(asc(categoriesTable.name));
}

export async function getPublicCommodities(params?: {
  search?: string;
  categoryId?: number;
  farmerId?: number;
  status?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  quality?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [
    eq(commoditiesTable.isPublished, true),
    or(
      eq(commoditiesTable.status, "available"),
      eq(commoditiesTable.status, "verified"),
    ),
  ];
  if (params?.search) {
    conditions.push(
      or(
        ilike(commoditiesTable.name, `%${params.search}%`),
        ilike(usersTable.fullName, `%${params.search}%`),
      )!,
    );
  }
  if (params?.categoryId) {
    conditions.push(eq(commoditiesTable.categoryId, params.categoryId));
  }
  if (params?.farmerId) {
    conditions.push(eq(commoditiesTable.farmerId, params.farmerId));
  }
  if (params?.location) {
    conditions.push(ilike(commoditiesTable.location, `%${params.location}%`));
  }
  if (params?.minPrice !== undefined) {
    conditions.push(gte(commoditiesTable.price, String(params.minPrice)));
  }
  if (params?.maxPrice !== undefined) {
    conditions.push(lte(commoditiesTable.price, String(params.maxPrice)));
  }
  if (params?.quality) {
    conditions.push(eq(commoditiesTable.quality, params.quality));
  }

  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;

  let orderBy;
  switch (params?.sort) {
    case "price_asc":
      orderBy = asc(commoditiesTable.price);
      break;
    case "price_desc":
      orderBy = desc(commoditiesTable.price);
      break;
    case "newest":
      orderBy = desc(commoditiesTable.createdAt);
      break;
    default:
      orderBy = desc(commoditiesTable.createdAt);
  }

  return db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      price: commoditiesTable.price,
      minPrice: commoditiesTable.minPrice,
      maxPrice: commoditiesTable.maxPrice,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      image: ImageUpload.secureUrl,
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
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);
}

export async function countPublicCommodities(params?: {
  search?: string;
  categoryId?: number;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  quality?: string;
}) {
  const conditions = [
    or(
      eq(commoditiesTable.status, "available"),
      eq(commoditiesTable.status, "verified"),
    ),
  ];

  if (params?.search) {
    conditions.push(
      or(
        ilike(commoditiesTable.name, `%${params.search}%`),
        ilike(usersTable.fullName, `%${params.search}%`),
      )!,
    );
  }
  if (params?.categoryId) {
    conditions.push(eq(commoditiesTable.categoryId, params.categoryId));
  }
  if (params?.location) {
    conditions.push(ilike(commoditiesTable.location, `%${params.location}%`));
  }
  if (params?.minPrice !== undefined) {
    conditions.push(gte(commoditiesTable.price, String(params.minPrice)));
  }
  if (params?.maxPrice !== undefined) {
    conditions.push(lte(commoditiesTable.price, String(params.maxPrice)));
  }
  if (params?.quality) {
    conditions.push(eq(commoditiesTable.quality, params.quality));
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(commoditiesTable)
    .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
    .where(and(...conditions));

  return result?.count ?? 0;
}

export async function getCommoditiesByIds(ids: number[]) {
  if (ids.length === 0) return [];
  const uniqueIds = [...new Set(ids)];
  return db
    .select({
      id: commoditiesTable.id,
      farmerId: commoditiesTable.farmerId,
      categoryId: commoditiesTable.categoryId,
      name: commoditiesTable.name,
      price: commoditiesTable.price,
      minPrice: commoditiesTable.minPrice,
      maxPrice: commoditiesTable.maxPrice,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      image: ImageUpload.secureUrl,
      status: commoditiesTable.status,
      rating: commoditiesTable.rating,
      reviewCount: commoditiesTable.reviewCount,
      categoryName: categoriesTable.name,
      farmerName: usersTable.fullName,
    })
    .from(commoditiesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .where(inArray(commoditiesTable.id, uniqueIds));
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
      minPrice: commoditiesTable.minPrice,
      maxPrice: commoditiesTable.maxPrice,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      harvestEstimate: commoditiesTable.harvestEstimate,
      image: ImageUpload.secureUrl,
      images: commoditiesTable.images,
      videoUrl: commoditiesTable.videoUrl,
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
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
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
      minPrice: commoditiesTable.minPrice,
      maxPrice: commoditiesTable.maxPrice,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      categoryId: commoditiesTable.categoryId,
      harvestEstimate: commoditiesTable.harvestEstimate,
      image: ImageUpload.secureUrl,
      imageId: commoditiesTable.image,
      images: commoditiesTable.images,
      videoUrl: commoditiesTable.videoUrl,
      status: commoditiesTable.status,
      isPublished: commoditiesTable.isPublished,
      createdAt: commoditiesTable.createdAt,
      categoryName: categoriesTable.name,
    })
    .from(commoditiesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
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
  const minPriceRaw = data.get("minPrice") as string | null;
  const maxPriceRaw = data.get("maxPrice") as string | null;
  const minPrice = minPriceRaw ? Number(minPriceRaw) : null;
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : null;
  const stock = Number(data.get("stock"));
  const unit = (data.get("unit") as string) || "kg";
  const quality = (data.get("quality") as string) || "A";
  const location = (data.get("location") as string)?.trim() || "";
  const harvestEstimateRaw = data.get("harvestEstimate") as string | null;
  const imageRaw = (data.get("image") as string)?.trim() || "";
  const image = imageRaw ? Number(imageRaw) : null;
  const imagesRaw = data.get("images") as string | null;
  const images: string[] = imagesRaw
    ? (() => {
        try {
          return JSON.parse(imagesRaw) as string[];
        } catch {
          return [];
        }
      })()
    : [];
  const videoUrl = (data.get("videoUrl") as string)?.trim() || null;

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
      minPrice: minPrice ? String(minPrice) : null,
      maxPrice: maxPrice ? String(maxPrice) : null,
      stock: String(stock),
      unit,
      quality,
      location,
      harvestEstimate: harvestEstimateRaw
        ? new Date(harvestEstimateRaw)
        : null,
      image,
      images,
      videoUrl,
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
  const minPriceRaw = data.get("minPrice") as string | null;
  const maxPriceRaw = data.get("maxPrice") as string | null;
  const minPrice = minPriceRaw ? Number(minPriceRaw) : null;
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : null;
  const stock = Number(data.get("stock"));
  const unit = (data.get("unit") as string) || "kg";
  const quality = (data.get("quality") as string) || "A";
  const location = (data.get("location") as string)?.trim() || "";
  const harvestEstimateRaw = data.get("harvestEstimate") as string | null;
  const imageRaw = (data.get("image") as string)?.trim() || "";
  const image = imageRaw ? Number(imageRaw) : null;
  const imagesRaw = data.get("images") as string | null;
  const images: string[] = imagesRaw
    ? (() => {
        try {
          return JSON.parse(imagesRaw) as string[];
        } catch {
          return [];
        }
      })()
    : [];
  const videoUrl = (data.get("videoUrl") as string)?.trim() || null;
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
        minPrice: minPrice ? String(minPrice) : null,
        maxPrice: maxPrice ? String(maxPrice) : null,
        stock: String(stock),
        unit,
        quality,
        location,
        harvestEstimate: harvestEstimateRaw
          ? new Date(harvestEstimateRaw)
          : null,
        image,
        images,
        videoUrl,
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

export async function toggleCommodityPublication(
  id: number,
  farmerId: number,
): Promise<ActionState> {
  const user = await getAuthUser(farmerId);
  if (!user || user.role !== "petani") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const [existing] = await db
      .select({
        farmerId: commoditiesTable.farmerId,
        isPublished: commoditiesTable.isPublished,
      })
      .from(commoditiesTable)
      .where(eq(commoditiesTable.id, id));

    if (!existing || existing.farmerId !== farmerId) {
      return { success: false, message: "Komoditas tidak ditemukan" };
    }

    const newIsPublished = !existing.isPublished;

    await db
      .update(commoditiesTable)
      .set({ isPublished: newIsPublished })
      .where(eq(commoditiesTable.id, id));

    revalidatePath("/petani/dashboard");
    revalidatePath("/petani/commodities");
    revalidatePath("/kompas-desa/cari-komoditas");
    revalidatePath("/user/home");

    return {
      success: true,
      message: newIsPublished
        ? "Komoditas berhasil dipublikasikan"
        : "Komoditas berhasil disembunyikan dari marketplace",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Gagal mengubah status publikasi",
    };
  }
}

/**
 * Perbarui stok satu komoditas milik petani.
 * Status otomatis mengikuti aturan yang sama dengan alur pesanan:
 * habis -> sold_out, kembali tersedia dari sold_out -> available.
 */
export async function updateStock(
  id: number,
  farmerId: number,
  stock: number,
): Promise<ActionState> {
  const user = await getAuthUser(farmerId);
  if (!user || user.role !== "petani") {
    return { success: false, message: "Unauthorized" };
  }

  if (!Number.isFinite(stock) || stock < 0) {
    return { success: false, message: "Jumlah stok tidak valid" };
  }

  try {
    const [existing] = await db
      .select({
        status: commoditiesTable.status,
        stock: commoditiesTable.stock,
      })
      .from(commoditiesTable)
      .where(
        and(eq(commoditiesTable.id, id), eq(commoditiesTable.farmerId, farmerId)),
      );

    if (!existing) {
      return { success: false, message: "Komoditas tidak ditemukan" };
    }

    let nextStatus = existing.status;
    if (stock <= 0) {
      nextStatus = "sold_out";
    } else if (existing.status === "sold_out") {
      nextStatus = "available";
    }

    await db
      .update(commoditiesTable)
      .set({ stock: String(stock), status: nextStatus })
      .where(eq(commoditiesTable.id, id));

    revalidatePath("/petani/stok");
    revalidatePath("/petani/dashboard");
    revalidatePath("/user/home");
    return { success: true, message: "Stok berhasil diperbarui" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui stok" };
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
      minPrice: commoditiesTable.minPrice,
      maxPrice: commoditiesTable.maxPrice,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      image: ImageUpload.secureUrl,
      rating: commoditiesTable.rating,
      reviewCount: commoditiesTable.reviewCount,
      categoryName: categoriesTable.name,
      farmerName: usersTable.fullName,
    })
    .from(commoditiesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .where(
      and(
        eq(commoditiesTable.categoryId, categoryId),
        gt(commoditiesTable.id, -1),
        eq(commoditiesTable.isPublished, true),
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
