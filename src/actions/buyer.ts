"use server";

import { db } from "@/db";
import { ordersTable, usersTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";

/** Validasi identitas petani dari sesi sebelum menyentuh database. */
async function requireFarmer(farmerId: number) {
  const user = await getAuthUser(farmerId);
  if (!user || user.role !== "petani") return null;
  return user;
}

export type FarmerBuyerRow = {
  buyerId: number;
  buyerName: string;
  buyerFoto: string | null;
  accountStatus: string;
  totalOrders: number;
  totalPurchase: number;
  lastOrderAt: Date | null;
};

export async function getFarmerBuyers(
  farmerId: number,
): Promise<FarmerBuyerRow[]> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return [];

  const rows = await db
    .select({
      buyerId: usersTable.id,
      buyerName: usersTable.fullName,
      buyerFoto: usersTable.fotoProfile,
      accountStatus: usersTable.status,
      totalOrders: sql<number>`count(*)::int`,
      totalPurchase: sql<number>`coalesce(sum(${ordersTable.totalPrice}), 0)::float`,
      lastOrderAt: sql<Date | null>`max(${ordersTable.createdAt})`,
    })
    .from(ordersTable)
    .innerJoin(usersTable, eq(usersTable.id, ordersTable.buyerId))
    .where(eq(ordersTable.farmerId, farmerId))
    .groupBy(
      usersTable.id,
      usersTable.fullName,
      usersTable.fotoProfile,
      usersTable.status,
    )
    .orderBy(sql`max(${ordersTable.createdAt}) desc`);

  return rows.map((r) => ({
    ...r,
    totalPurchase: Number(r.totalPurchase),
    lastOrderAt: r.lastOrderAt ? new Date(r.lastOrderAt) : null,
  }));
}
