"use server";

import { db } from "@/db";
import { wishlistItemsTable, commoditiesTable, ImageUpload } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/types/auth";

export async function addToWishlist(
  userId: number,
  commodityId: number,
): Promise<ActionState> {
  const user = await getAuthUser(userId);
  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  if (!commodityId) {
    return { success: false, message: "Parameter tidak valid" };
  }

  const [commodity] = await db
    .select()
    .from(commoditiesTable)
    .where(eq(commoditiesTable.id, commodityId));

  if (!commodity) {
    return { success: false, message: "Komoditas tidak ditemukan" };
  }

  try {
    const [existing] = await db
      .select()
      .from(wishlistItemsTable)
      .where(
        and(
          eq(wishlistItemsTable.userId, userId),
          eq(wishlistItemsTable.commodityId, commodityId),
        ),
      );

    if (existing) {
      return { success: true, message: "Sudah ada di wishlist" };
    }

    await db.insert(wishlistItemsTable).values({
      userId,
      commodityId,
    });

    revalidatePath("/user/home");
    revalidatePath(`/user/product/${commodityId}`);
    return { success: true, message: "Ditambahkan ke wishlist" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menambahkan ke wishlist" };
  }
}

export async function removeFromWishlist(
  userId: number,
  commodityId: number,
): Promise<ActionState> {
  const user = await getAuthUser(userId);
  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await db
      .delete(wishlistItemsTable)
      .where(
        and(
          eq(wishlistItemsTable.userId, userId),
          eq(wishlistItemsTable.commodityId, commodityId),
        ),
      );

    revalidatePath("/user/home");
    revalidatePath(`/user/product/${commodityId}`);
    return { success: true, message: "Dihapus dari wishlist" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menghapus dari wishlist" };
  }
}

export async function toggleWishlist(
  userId: number,
  commodityId: number,
): Promise<ActionState & { wishlisted?: boolean }> {
  const user = await getAuthUser(userId);
  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  if (!commodityId) {
    return { success: false, message: "Parameter tidak valid" };
  }

  try {
    const [existing] = await db
      .select()
      .from(wishlistItemsTable)
      .where(
        and(
          eq(wishlistItemsTable.userId, userId),
          eq(wishlistItemsTable.commodityId, commodityId),
        ),
      );

    if (existing) {
      await db
        .delete(wishlistItemsTable)
        .where(
          and(
            eq(wishlistItemsTable.userId, userId),
            eq(wishlistItemsTable.commodityId, commodityId),
          ),
        );
      revalidatePath("/user/home");
      revalidatePath("/user/wishlist");
      revalidatePath(`/user/product/${commodityId}`);
      return { success: true, message: "Dihapus dari wishlist", wishlisted: false };
    }

    await db.insert(wishlistItemsTable).values({
      userId,
      commodityId,
    });

    revalidatePath("/user/home");
    revalidatePath(`/user/product/${commodityId}`);
    return { success: true, message: "Ditambahkan ke wishlist", wishlisted: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memproses wishlist" };
  }
}

export async function isCommodityWishlisted(
  userId: number,
  commodityId: number,
): Promise<boolean> {
  try {
    const [existing] = await db
      .select({ id: wishlistItemsTable.id })
      .from(wishlistItemsTable)
      .where(
        and(
          eq(wishlistItemsTable.userId, userId),
          eq(wishlistItemsTable.commodityId, commodityId),
        ),
      )
      .limit(1);

    return !!existing;
  } catch {
    return false;
  }
}

export async function getUserWishlist(userId: number) {
  try {
    const items = await db
      .select({
        id: wishlistItemsTable.id,
        commodityId: wishlistItemsTable.commodityId,
        createdAt: wishlistItemsTable.createdAt,
        commodityName: commoditiesTable.name,
        commodityPrice: commoditiesTable.price,
        commodityMinPrice: commoditiesTable.minPrice,
        commodityMaxPrice: commoditiesTable.maxPrice,
        commodityStock: commoditiesTable.stock,
        commodityUnit: commoditiesTable.unit,
        commodityLocation: commoditiesTable.location,
        commodityStatus: commoditiesTable.status,
        commodityImage: ImageUpload.secureUrl,
        commodityImages: commoditiesTable.images,
      })
      .from(wishlistItemsTable)
      .innerJoin(commoditiesTable, eq(commoditiesTable.id, wishlistItemsTable.commodityId))
      .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
      .where(eq(wishlistItemsTable.userId, userId))
      .orderBy(desc(wishlistItemsTable.createdAt));

    return items;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getWishlistCount(userId: number): Promise<number> {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(wishlistItemsTable)
      .where(eq(wishlistItemsTable.userId, userId));

    return result?.count || 0;
  } catch {
    return 0;
  }
}
