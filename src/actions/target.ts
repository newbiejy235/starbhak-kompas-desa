"use server";

import { db } from "@/db";
import { ordersTable, paymentsTable, salesTargetsTable } from "@/db/schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/auth.service";
import type { ActionState } from "@/lib/types/auth";

/** Validasi identitas petani dari sesi sebelum menyentuh database. */
async function requireFarmer(farmerId: number) {
  const user = await getAuthUser(farmerId);
  if (!user || user.role !== "petani") return null;
  return user;
}

export type SalesTargetRow = {
  id: number;
  targetAmount: string;
  startDate: Date;
  endDate: Date;
  status: string;
};

export type SalesTargetOverview = {
  target: SalesTargetRow | null;
  achievedAmount: number;
  percent: number;
  remaining: number;
};

export async function getSalesTargetOverview(
  farmerId: number,
): Promise<SalesTargetOverview> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return { target: null, achievedAmount: 0, percent: 0, remaining: 0 };

  const now = new Date();

  // Target aktif diprioritaskan; jika tidak ada, ambil target terbaru.
  const [active] = await db
    .select({
      id: salesTargetsTable.id,
      targetAmount: salesTargetsTable.targetAmount,
      startDate: salesTargetsTable.startDate,
      endDate: salesTargetsTable.endDate,
      status: salesTargetsTable.status,
    })
    .from(salesTargetsTable)
    .where(
      and(
        eq(salesTargetsTable.farmerId, farmerId),
        eq(salesTargetsTable.status, "active"),
        gte(salesTargetsTable.endDate, now),
      ),
    )
    .orderBy(desc(salesTargetsTable.createdAt))
    .limit(1);

  const [latest] = active
    ? [active]
    : await db
        .select({
          id: salesTargetsTable.id,
          targetAmount: salesTargetsTable.targetAmount,
          startDate: salesTargetsTable.startDate,
          endDate: salesTargetsTable.endDate,
          status: salesTargetsTable.status,
        })
        .from(salesTargetsTable)
        .where(eq(salesTargetsTable.farmerId, farmerId))
        .orderBy(desc(salesTargetsTable.createdAt))
        .limit(1);

  if (!latest) {
    return { target: null, achievedAmount: 0, percent: 0, remaining: 0 };
  }

  // Pencapaian dihitung dari transaksi lunas nyata pada periode target.
  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${ordersTable.totalPrice}), 0)::float`,
    })
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.farmerId, farmerId),
        gte(ordersTable.createdAt, latest.startDate),
        lte(ordersTable.createdAt, latest.endDate),
        sql`exists (select 1 from ${paymentsTable} where ${paymentsTable.orderId} = ${ordersTable.id} and ${paymentsTable.status} = 'paid')`,
      ),
    );

  const achieved = Number(row?.total ?? 0);
  const targetAmount = Number(latest.targetAmount);
  const percent =
    targetAmount > 0 ? Math.min(100, Math.round((achieved / targetAmount) * 100)) : 0;

  return {
    target: latest,
    achievedAmount: achieved,
    percent,
    remaining: Math.max(0, targetAmount - achieved),
  };
}

export async function saveSalesTarget(
  farmerId: number,
  data: FormData,
): Promise<ActionState> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return { success: false, message: "Unauthorized" };

  const targetAmount = Number(data.get("targetAmount"));
  const startDateRaw = String(data.get("startDate") ?? "");
  const endDateRaw = String(data.get("endDate") ?? "");

  const startDate = new Date(startDateRaw);
  const endDate = new Date(endDateRaw);

  if (!targetAmount || targetAmount <= 0) {
    return { success: false, message: "Nominal target harus lebih dari 0" };
  }
  if (!startDateRaw || Number.isNaN(startDate.getTime())) {
    return { success: false, message: "Tanggal mulai tidak valid" };
  }
  if (!endDateRaw || Number.isNaN(endDate.getTime())) {
    return { success: false, message: "Tanggal selesai tidak valid" };
  }
  if (endDate <= startDate) {
    return { success: false, message: "Tanggal selesai harus setelah tanggal mulai" };
  }

  try {
    // Target aktif lama digantikan agar hanya satu target berjalan.
    await db
      .update(salesTargetsTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        and(
          eq(salesTargetsTable.farmerId, farmerId),
          eq(salesTargetsTable.status, "active"),
        ),
      );

    await db.insert(salesTargetsTable).values({
      farmerId,
      targetAmount: String(targetAmount),
      startDate,
      endDate,
      status: "active",
    });

    revalidatePath("/petani/target-penjualan");
    revalidatePath("/petani/dashboard");
    return { success: true, message: "Target penjualan berhasil disimpan" };
  } catch (error) {
    console.error("saveSalesTarget error:", error);
    return { success: false, message: "Gagal menyimpan target penjualan" };
  }
}
