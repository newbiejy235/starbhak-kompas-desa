"use server";

import { db } from "@/db";
import { commoditiesTable, ordersTable } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";

/** Validasi identitas petani dari sesi sebelum menyentuh database. */
async function requireFarmer(farmerId: number) {
  const user = await getAuthUser(farmerId);
  if (!user || user.role !== "petani") return null;
  return user;
}

export type PriceCommodityOption = {
  id: number;
  name: string;
  unit: string;
};

export type PricePoint = {
  /** Format YYYY-MM */
  month: string;
  label: string;
  avgPrice: number;
  txCount: number;
};

export type PriceHistoryData = {
  commodityId: number;
  commodityName: string;
  unit: string;
  points: PricePoint[];
  currentPrice: number;
  previousPrice: number | null;
  changePercent: number;
};

const MONTH_LABEL = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function monthLabel(ym: string): string {
  const [year, month] = ym.split("-");
  const idx = Number(month) - 1;
  return `${MONTH_LABEL[idx] ?? month} ${year.slice(2)}`;
}

/** Komoditas milik petani yang pernah tercatat di pesanan selesai. */
export async function getPriceCommodities(
  farmerId: number,
): Promise<PriceCommodityOption[]> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return [];

  return db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      unit: commoditiesTable.unit,
    })
    .from(ordersTable)
    .innerJoin(commoditiesTable, eq(commoditiesTable.id, ordersTable.commodityId))
    .where(
      and(
        eq(ordersTable.farmerId, farmerId),
        eq(ordersTable.status, "completed"),
      ),
    )
    .groupBy(commoditiesTable.id, commoditiesTable.name, commoditiesTable.unit)
    .orderBy(commoditiesTable.name);
}

/**
 * Riwayat harga didefinisikan dari harga transaksi nyata (pesanan selesai),
 * dirata-ratakan per bulan selama 6 bulan terakhir — tanpa data palsu.
 */
export async function getPriceHistory(
  farmerId: number,
  commodityId: number,
): Promise<PriceHistoryData | null> {
  const farmer = await requireFarmer(farmerId);
  if (!farmer) return null;

  // Pastikan komoditas milik petani ini sebelum menampilkan harganya.
  const [commodity] = await db
    .select({ name: commoditiesTable.name, unit: commoditiesTable.unit })
    .from(commoditiesTable)
    .where(
      and(
        eq(commoditiesTable.id, commodityId),
        eq(commoditiesTable.farmerId, farmerId),
      ),
    );
  if (!commodity) return null;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${ordersTable.createdAt}), 'YYYY-MM')`,
      avgPrice: sql<number>`avg(${ordersTable.unitPrice})::float`,
      txCount: sql<number>`count(*)::int`,
    })
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.farmerId, farmerId),
        eq(ordersTable.commodityId, commodityId),
        eq(ordersTable.status, "completed"),
        gte(ordersTable.createdAt, sixMonthsAgo),
      ),
    )
    .groupBy(sql`date_trunc('month', ${ordersTable.createdAt})`)
    .orderBy(sql`date_trunc('month', ${ordersTable.createdAt})`);

  const points: PricePoint[] = rows.map((r) => ({
    month: r.month,
    label: monthLabel(r.month),
    avgPrice: Math.round(Number(r.avgPrice)),
    txCount: r.txCount,
  }));

  const currentPrice = points.length > 0 ? points[points.length - 1].avgPrice : 0;
  const previous =
    points.length > 1 ? points[points.length - 2].avgPrice : null;
  const changePercent =
    previous && previous > 0
      ? Math.round(((currentPrice - previous) / previous) * 1000) / 10
      : 0;

  return {
    commodityId,
    commodityName: commodity.name,
    unit: commodity.unit,
    points,
    currentPrice,
    previousPrice: previous,
    changePercent,
  };
}
