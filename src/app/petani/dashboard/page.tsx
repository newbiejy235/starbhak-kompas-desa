"use client";

import { useEffect, useState } from "react";
import { getClientUser } from "@/lib/auth/client";
import { formatDate } from "@/lib/format";
import {
  getFarmerDashboard,
  getSalesChart,
} from "@/actions/dashboard";
import type {
  DashboardStats as DashboardStatsData,
  LowStockSummary,
  OrderStatusCounts,
  SalesChartPoint,
} from "@/actions/dashboard";
import type { TopProduct, ActivityItem, HarvestScheduleItem } from "@/actions/dashboard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/shared/States";
import DashboardStats, {
  DashboardStatsSkeleton,
} from "@/components/petanipage/dashboard/DashboardStats";
import AttentionPanel from "@/components/petanipage/dashboard/AttentionPanel";
import QuickActions from "@/components/petanipage/dashboard/QuickActions";
import RevenueCards from "@/components/petanipage/dashboard/RevenueCards";
import SalesChartCard, {
  type ChartRange,
} from "@/components/petanipage/dashboard/SalesChartCard";
import ActivityCard from "@/components/petanipage/dashboard/ActivityCard";
import TopCommoditiesCard from "@/components/petanipage/dashboard/TopCommoditiesCard";
import HarvestScheduleCard from "@/components/petanipage/dashboard/HarvestScheduleCard";

type DashboardData = {
  stats: DashboardStatsData;
  topProducts: TopProduct[];
  activities: ActivityItem[];
  harvestSchedule: HarvestScheduleItem[];
  statusCounts: OrderStatusCounts;
  lowStock: LowStockSummary;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export default function PetaniDashboard() {
  const user = getClientUser();
  const userId = user?.id;

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState(false);
  // Naikkan nilai ini untuk memuat ulang data (tombol "Coba Lagi").
  const [reloadKey, setReloadKey] = useState(0);

  const [chartRange, setChartRange] = useState<ChartRange>("30d");
  // Grafik menyimpan rentangnya sendiri agar tahu kapan perlu memuat ulang.
  const [chart, setChart] = useState<{ range: ChartRange; data: SalesChartPoint[] } | null>(
    null,
  );
  const chartLoading = chart?.range !== chartRange;

  // Data utama dimuat sekali per user/reload — semua setState hanya di callback async.
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    getFarmerDashboard(userId)
      .then((result) => {
        if (!cancelled) setDashboard(result);
      })
      .catch((error) => {
        console.error("Gagal memuat dashboard:", error);
        if (!cancelled) setDashboardError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  const retryLoad = () => {
    setDashboard(null);
    setDashboardError(false);
    setReloadKey((key) => key + 1);
  };

  // Grafik dimuat terpisah karena mengikuti perubahan rentang waktu.
  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    getSalesChart(userId, chartRange)
      .then((result) => {
        if (isMounted) setChart({ range: chartRange, data: result });
      })
      .catch((error) => {
        console.error("Gagal memuat grafik:", error);
        if (isMounted) setChart({ range: chartRange, data: [] });
      });

    return () => {
      isMounted = false;
    };
  }, [userId, chartRange]);

  if (dashboardError) {
    return (
      <div className="mx-auto max-w-6xl animate-fade-up p-4 sm:p-6 lg:p-0">
        <ErrorState
          title="Dashboard belum dapat dimuat"
          message="Terjadi masalah saat mengambil data usaha Anda."
          onRetry={retryLoad}
        />
      </div>
    );
  }

  if (!dashboard) return <DashboardSkeleton />;

  const { stats, topProducts, activities, harvestSchedule, statusCounts, lowStock } =
    dashboard;
  const salesChart = chartLoading ? [] : (chart?.data ?? []);

  const firstName = (user?.fullName ?? "").trim().split(/\s+/)[0];

  return (
    <div className="space-y-5">
      {/* Sapaan & konteks */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          {getGreeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan usaha Anda hari ini, {formatDate(new Date())}.
        </p>
      </header>

      <DashboardStats
        totalCommodities={stats.totalCommodities}
        pendingOrders={stats.pendingOrders}
        completedOrdersThisMonth={stats.completedOrdersThisMonth}
        totalSoldThisMonth={stats.totalSoldThisMonth}
      />

      {/* Apa yang harus dikerjakan hari ini */}
      <AttentionPanel statusCounts={statusCounts} lowStock={lowStock} />

      <QuickActions />

      <RevenueCards
        revenueToday={Number(stats.revenueToday)}
        revenueThisMonth={Number(stats.revenueThisMonth)}
        percentChange={stats.percentChange}
        avgRating={stats.avgRating}
        reviewCount={stats.reviewCount}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_455px] gap-4">
        <SalesChartCard
          data={salesChart}
          loading={chartLoading}
          range={chartRange}
          onRangeChange={setChartRange}
        />

        <div className="space-y-4">
          <ActivityCard activities={activities} />
          <TopCommoditiesCard products={topProducts} />
        </div>
      </div>

      <HarvestScheduleCard schedule={harvestSchedule} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-56" />
      <DashboardStatsSkeleton />
      <Skeleton className="h-28 rounded-card" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-card" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_455px] gap-4">
        <Skeleton className="h-96 rounded-card" />
        <Skeleton className="h-96 rounded-card" />
      </div>
    </div>
  );
}
