"use server";

import { db } from "@/db";
import {
  reviewsTable,
  ordersTable,
  commoditiesTable,
  usersTable,
  notificationsTable,
} from "@/db/schema";
import { eq, desc, avg, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getAuthUser } from "@/lib/auth/auth.service";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/types/auth";

const buyerUser = alias(usersTable, "review_buyer");
const farmerUser = alias(usersTable, "review_farmer");

export async function createReview(
  buyerId: number,
  data: FormData,
): Promise<ActionState> {
  const buyer = await getAuthUser(buyerId);
  if (!buyer || buyer.role !== "pembeli") {
    return { success: false, message: "Unauthorized" };
  }

  const orderId = Number(data.get("orderId"));
  const rating = Number(data.get("rating"));
  const comment = (data.get("comment") as string)?.trim() || "";

  if (!orderId || rating < 1 || rating > 5) {
    return { success: false, message: "Rating harus 1-5" };
  }

  try {
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));
    if (!order || order.buyerId !== buyerId) {
      return { success: false, message: "Pesanan tidak ditemukan" };
    }
    if (order.status !== "completed") {
      return {
        success: false,
        message: "Ulasan hanya dapat diberikan untuk pesanan selesai",
      };
    }

    const [existingReview] = await db
      .select({ id: reviewsTable.id })
      .from(reviewsTable)
      .where(eq(reviewsTable.orderId, orderId));
    if (existingReview) {
      return { success: false, message: "Anda sudah memberi ulasan" };
    }

    await db.insert(reviewsTable).values({
      orderId,
      buyerId,
      farmerId: order.farmerId,
      commodityId: order.commodityId,
      rating,
      comment,
    });

    const agg = await db
      .select({
        avg: avg(reviewsTable.rating),
        count: sql<number>`count(*)::int`,
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.commodityId, order.commodityId));

    await db
      .update(commoditiesTable)
      .set({
        rating: String(Number(agg[0].avg).toFixed(2)),
        reviewCount: Number(agg[0].count),
      })
      .where(eq(commoditiesTable.id, order.commodityId));

    await db.insert(notificationsTable).values({
      userId: order.farmerId,
      title: "Ulasan Baru",
      message: `Pembeli memberi ulasan bintang ${rating} untuk komoditas Anda.`,
      type: "review",
    });

    revalidatePath("/user/orders");
    revalidatePath("/user/reviews");
    revalidatePath("/user/transactions");
    return { success: true, message: "Ulasan berhasil dikirim" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal mengirim ulasan" };
  }
}

export async function getReviewsForFarmer(farmerId: number) {
  return db
    .select({
      id: reviewsTable.id,
      rating: reviewsTable.rating,
      comment: reviewsTable.comment,
      createdAt: reviewsTable.createdAt,
      buyerName: usersTable.fullName,
      commodityName: commoditiesTable.name,
    })
    .from(reviewsTable)
    .innerJoin(usersTable, eq(usersTable.id, reviewsTable.buyerId))
    .innerJoin(
      commoditiesTable,
      eq(commoditiesTable.id, reviewsTable.commodityId),
    )
    .where(eq(reviewsTable.farmerId, farmerId))
    .orderBy(desc(reviewsTable.createdAt));
}

export async function getReviewsForCommodity(commodityId: number) {
  return db
    .select({
      id: reviewsTable.id,
      rating: reviewsTable.rating,
      comment: reviewsTable.comment,
      createdAt: reviewsTable.createdAt,
      buyerName: usersTable.fullName,
    })
    .from(reviewsTable)
    .innerJoin(usersTable, eq(usersTable.id, reviewsTable.buyerId))
    .where(eq(reviewsTable.commodityId, commodityId))
    .orderBy(desc(reviewsTable.createdAt));
}

export async function getReviewsByBuyer(buyerId: number) {
  return db
    .select({
      id: reviewsTable.id,
      orderId: reviewsTable.orderId,
      rating: reviewsTable.rating,
      comment: reviewsTable.comment,
      createdAt: reviewsTable.createdAt,
      commodityName: commoditiesTable.name,
    })
    .from(reviewsTable)
    .innerJoin(
      commoditiesTable,
      eq(commoditiesTable.id, reviewsTable.commodityId),
    )
    .where(eq(reviewsTable.buyerId, buyerId))
    .orderBy(desc(reviewsTable.createdAt));
}

export async function getAllReviews() {
  return db
    .select({
      id: reviewsTable.id,
      rating: reviewsTable.rating,
      comment: reviewsTable.comment,
      createdAt: reviewsTable.createdAt,
      buyerName: buyerUser.fullName,
      commodityName: commoditiesTable.name,
      farmerName: farmerUser.fullName,
    })
    .from(reviewsTable)
    .innerJoin(buyerUser, eq(buyerUser.id, reviewsTable.buyerId))
    .innerJoin(
      commoditiesTable,
      eq(commoditiesTable.id, reviewsTable.commodityId),
    )
    .innerJoin(farmerUser, eq(farmerUser.id, reviewsTable.farmerId))
    .orderBy(desc(reviewsTable.createdAt));
}
