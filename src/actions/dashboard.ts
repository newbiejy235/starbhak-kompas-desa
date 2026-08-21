"use server";

import { db } from "@/db";
import {
  commoditiesTable,
  ordersTable,
  reviewsTable,
  notificationsTable,
} from "@/db/schema";
import { eq, and, desc, sql, gte, lte, asc } from "drizzle-orm";

export type DashboardStats = {
  totalCommodities: number;
  pendingOrders: number;
  completedOrdersThisMonth: number;
  totalSoldThisMonth: number;
  revenueToday: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  percentChange: number;
  avgRating: number;
  reviewCount: number;
};

export type SalesChartPoint = {
  label: string;
  kg: number;
};

export type TopProduct = {
  rank: number;
  name: string;
  totalKg: number;
};

export type ActivityItem = {
  title: string;
  timestamp: string;
};

export type HarvestScheduleItem = {
  name: string;
  date: string | null;
};

export async function getFarmerDashboard(farmerId: number) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // OPTIMASI: Semua query dashboard jalan BERSAMAAN
  const [stats, topProducts, activities, harvestSchedule] = await Promise.all([
    computeStats(farmerId, startOfToday, startOfMonth, startOfLastMonth, endOfLastMonth),
    getTopProducts(farmerId),
    getActivities(farmerId, 5),
    getHarvestSchedule(farmerId)
  ]);

  return { stats, topProducts, activities, harvestSchedule };
}

async function computeStats(
  farmerId: number,
  startOfToday: Date,
  startOfMonth: Date,
  startOfLastMonth: Date,
  endOfLastMonth: Date,
): Promise<DashboardStats> {
  // OPTIMASI: 8 Query Drizzle jalan BERSAMAAN biar nggak lemot
  const [
    commodityCountRows,
    pendingOrdersRows,
    completedThisMonthRows,
    soldThisMonthRows,
    revTodayRows,
    revThisMonthRows,
    revLastMonthRows,
    ratingAggRows
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` })
      .from(commoditiesTable).where(eq(commoditiesTable.farmerId, farmerId)),
      
    db.select({ count: sql<number>`count(*)::int` })
      .from(ordersTable).where(and(eq(ordersTable.farmerId, farmerId), eq(ordersTable.status, "pending"))),
      
    db.select({ count: sql<number>`count(*)::int` })
      .from(ordersTable).where(and(eq(ordersTable.farmerId, farmerId), eq(ordersTable.status, "completed"), gte(ordersTable.updatedAt, startOfMonth))),
      
    db.select({ total: sql<number>`coalesce(sum(${ordersTable.quantity}), 0)::float` })
      .from(ordersTable).where(and(eq(ordersTable.farmerId, farmerId), eq(ordersTable.status, "completed"), gte(ordersTable.updatedAt, startOfMonth))),
      
    db.select({ total: sql<number>`coalesce(sum(${ordersTable.totalPrice}), 0)::float` })
      .from(ordersTable).where(and(eq(ordersTable.farmerId, farmerId), eq(ordersTable.status, "completed"), gte(ordersTable.createdAt, startOfToday))),
      
    db.select({ total: sql<number>`coalesce(sum(${ordersTable.totalPrice}), 0)::float` })
      .from(ordersTable).where(and(eq(ordersTable.farmerId, farmerId), eq(ordersTable.status, "completed"), gte(ordersTable.createdAt, startOfMonth))),
      
    db.select({ total: sql<number>`coalesce(sum(${ordersTable.totalPrice}), 0)::float` })
      .from(ordersTable).where(and(eq(ordersTable.farmerId, farmerId), eq(ordersTable.status, "completed"), gte(ordersTable.createdAt, startOfLastMonth), lte(ordersTable.createdAt, endOfLastMonth))),
      
    db.select({ avg: sql<number>`coalesce(avg(${reviewsTable.rating}), 0)::float`, count: sql<number>`count(*)::int` })
      .from(reviewsTable).where(eq(reviewsTable.farmerId, farmerId))
  ]);

  const revenueToday = Number(revTodayRows[0]?.total ?? 0);
  const revenueThisMonthVal = Number(revThisMonthRows[0]?.total ?? 0);
  const revenueLastMonthVal = Number(revLastMonthRows[0]?.total ?? 0);
  const percentChange =
    revenueLastMonthVal > 0
      ? Math.round(((revenueThisMonthVal - revenueLastMonthVal) / revenueLastMonthVal) * 100)
      : revenueThisMonthVal > 0
        ? 100
        : 0;

  return {
    totalCommodities: commodityCountRows[0]?.count ?? 0,
    pendingOrders: pendingOrdersRows[0]?.count ?? 0,
    completedOrdersThisMonth: completedThisMonthRows[0]?.count ?? 0,
    totalSoldThisMonth: Number(soldThisMonthRows[0]?.total ?? 0),
    revenueToday,
    revenueThisMonth: revenueThisMonthVal,
    revenueLastMonth: revenueLastMonthVal,
    percentChange,
    avgRating: Number(ratingAggRows[0]?.avg ?? 0),
    reviewCount: ratingAggRows[0]?.count ?? 0,
  };
}

export async function getSalesChart(farmerId: number, range: string) {
  const now = new Date();
  let startDate: Date;
  let periods: { label: string; start: Date; end: Date }[] = [];

  if (range === "30d") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);
    for (let i = 0; i < 5; i++) {
      const s = new Date(startDate);
      s.setDate(s.getDate() + i * 6);
      const e = new Date(s);
      e.setDate(e.getDate() + 5);
      if (e > now) e.setTime(now.getTime());
      periods.push({ label: `${s.getDate()}-${Math.min(s.getDate() + 5, now.getDate())}`, start: s, end: e });
    }
  } else if (range === "3m") {
    for (let i = 2; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59);
      periods.push({ label: m.toLocaleDateString("id-ID", { month: "short" }), start: m, end: mEnd > now ? now : mEnd });
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const m = new Date(now.getFullYear(), i, 1);
      const mEnd = new Date(m.getFullYear(), i + 1, 0, 23, 59, 59);
      periods.push({ label: m.toLocaleDateString("id-ID", { month: "short" }), start: m, end: mEnd > now ? now : mEnd });
    }
  }

  // OPTIMASI: Jalankan loop query secara BERSAMAAN
  const queryPromises = periods.map(period => 
    db.select({ kg: sql<number>`coalesce(sum(${ordersTable.quantity}), 0)::float` })
      .from(ordersTable)
      .where(and(
        eq(ordersTable.farmerId, farmerId), 
        eq(ordersTable.status, "completed"), 
        gte(ordersTable.updatedAt, period.start), 
        lte(ordersTable.updatedAt, period.end)
      ))
  );

  const resultsRows = await Promise.all(queryPromises);

  return periods.map((period, i) => ({
    label: period.label,
    kg: Number(resultsRows[i][0]?.kg ?? 0)
  }));
}

export async function getTopProducts(farmerId: number) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const rows = await db
    .select({
      name: commoditiesTable.name,
      totalKg: sql<number>`coalesce(sum(${ordersTable.quantity}), 0)::float`,
    })
    .from(ordersTable)
    .innerJoin(commoditiesTable, eq(commoditiesTable.id, ordersTable.commodityId))
    .where(
      and(
        eq(ordersTable.farmerId, farmerId),
        eq(ordersTable.status, "completed"),
        gte(ordersTable.updatedAt, startOfYear),
      ),
    )
    .groupBy(commoditiesTable.name)
    .orderBy(sql`sum(${ordersTable.quantity}) desc`)
    .limit(4);

  return rows.map((r, i) => ({
    rank: i + 1,
    name: r.name,
    totalKg: Number(r.totalKg),
  }));
}

export async function getActivities(farmerId: number, limit: number) {
  const rows = await db
    .select({
      title: notificationsTable.title,
      message: notificationsTable.message,
      createdAt: notificationsTable.createdAt,
    })
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, farmerId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    title: `${r.title} - ${r.message}`,
    timestamp: r.createdAt?.toISOString() ?? "",
  }));
}

export async function getHarvestSchedule(farmerId: number) {
  const rows = await db
    .select({
      name: commoditiesTable.name,
      date: commoditiesTable.harvestEstimate,
    })
    .from(commoditiesTable)
    .where(
      and(
        eq(commoditiesTable.farmerId, farmerId),
        sql`${commoditiesTable.harvestEstimate} IS NOT NULL`,
      ),
    )
    .orderBy(asc(commoditiesTable.harvestEstimate))
    .limit(5);

  return rows.map((r) => ({
    name: r.name,
    date: r.date?.toISOString() ?? null,
  }));
}