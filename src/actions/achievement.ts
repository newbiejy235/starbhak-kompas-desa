"use server";

import { db } from "@/db";
import { commoditiesTable, ordersTable, reviewsTable } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";

/** Validasi identitas petani dari sesi sebelum menyentuh database. */
async function requireFarmer(farmerId: number) {
  const user = await getAuthUser(farmerId);
  if (!user || user.role !== "petani") return null;
  return user;
}

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  /** Label progres nyata, mis. "7/10 pesanan". */
  progressLabel: string;
};

export async function getFarmerAchievements(
  farmerId: number,
): Promise<Achievement[]> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return [];

  // Semua metrik dihitung dari data nyata secara paralel.
  const [commodityRows, orderRows, revenueRows, ratingRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(commoditiesTable)
      .where(eq(commoditiesTable.farmerId, farmerId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(ordersTable)
      .where(
        and(eq(ordersTable.farmerId, farmerId), eq(ordersTable.status, "completed")),
      ),
    db
      .select({ total: sql<number>`coalesce(sum(${ordersTable.totalPrice}), 0)::float` })
      .from(ordersTable)
      .where(
        and(eq(ordersTable.farmerId, farmerId), eq(ordersTable.status, "completed")),
      ),
    db
      .select({
        avg: sql<number>`coalesce(avg(${reviewsTable.rating}), 0)::float`,
        count: sql<number>`count(*)::int`,
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.farmerId, farmerId)),
  ]);

  const products = commodityRows[0]?.count ?? 0;
  const completedOrders = orderRows[0]?.count ?? 0;
  const revenue = Number(revenueRows[0]?.total ?? 0);
  const avgRating = Number(ratingRows[0]?.avg ?? 0);
  const reviewCount = ratingRows[0]?.count ?? 0;
  const isVerified = farmer.status === "verified";

  return [
    {
      id: "first-product",
      title: "Produk Pertama",
      description: "Menambahkan komoditas pertama ke katalog.",
      unlocked: products >= 1,
      progressLabel: `${products}/1 produk`,
    },
    {
      id: "orders-10",
      title: "10 Pesanan Selesai",
      description: "Menyelesaikan 10 pesanan dengan sukses.",
      unlocked: completedOrders >= 10,
      progressLabel: `${Math.min(completedOrders, 10)}/10 pesanan`,
    },
    {
      id: "orders-50",
      title: "50 Pesanan Selesai",
      description: "Menyelesaikan 50 pesanan dengan sukses.",
      unlocked: completedOrders >= 50,
      progressLabel: `${Math.min(completedOrders, 50)}/50 pesanan`,
    },
    {
      id: "revenue-1jt",
      title: "Penjualan Rp1 Juta",
      description: "Total penjualan mencapai Rp1.000.000.",
      unlocked: revenue >= 1_000_000,
      progressLabel: `${Math.min(Math.floor(revenue / 100_000), 10)}/10 × Rp100rb`,
    },
    {
      id: "rating-45",
      title: "Rating 4,5+",
      description: "Mempertahankan rating rata-rata di atas 4,5.",
      unlocked: avgRating >= 4.5,
      progressLabel:
        reviewCount > 0
          ? `Rating saat ini ${avgRating.toFixed(1)}`
          : "Belum ada ulasan",
    },
    {
      id: "verified",
      title: "Petani Terverifikasi",
      description: "Akun terverifikasi oleh tim Kompas Desa.",
      unlocked: isVerified,
      progressLabel: isVerified ? "Terverifikasi" : "Menunggu verifikasi",
    },
  ];
}
