"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChartColumn,
  Repeat,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { getFarmerDashboard, getSalesChart } from "@/actions/dashboard";
import type { SalesChartPoint } from "@/actions/dashboard";
import { getFarmerBuyers } from "@/actions/buyer";
import type { FarmerBuyerRow } from "@/lib/types/market";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { formatNumber, formatRupiah } from "@/lib/format";
import PageHeader from "@/components/shared/PageHeader";
import { EmptyState, ErrorState } from "@/components/shared/States";
import SalesChartCard, {
  type ChartRange,
} from "@/components/petanipage/dashboard/SalesChartCard";
import TopCommoditiesCard from "@/components/petanipage/dashboard/TopCommoditiesCard";
import CountUp from "@/components/ui/CountUp";
import { Skeleton } from "@/components/ui/Skeleton";

function AnalitikSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-card" />
      <Skeleton className="h-48 rounded-card" />
    </div>
  );
}

function SummaryCard({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 px-1 py-3 sm:px-2">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        <span className="shrink-0 text-gray-500">{icon}</span>
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/* ---------------------- PAGE ---------------------- */
export default function AnalitikPage() {
  const user = getClientUser();

  const [chartRange, setChartRange] = useState<ChartRange>("30d");
  const [chart, setChart] = useState<{
    range: ChartRange;
    data: SalesChartPoint[];
  } | null>(null);
  const chartLoading = chart?.range !== chartRange;

  const { data: dashboard, error, reload } = useFetch(
    () => (user ? getFarmerDashboard(user.id) : Promise.resolve(null)),
    [user?.id],
  );

  const { data: buyers } = useFetch(
    () =>
      user
        ? getFarmerBuyers(user.id)
        : Promise.resolve([] as FarmerBuyerRow[]),
    [user?.id],
  );

  // Grafik mengikuti rentang yang dipilih.
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    getSalesChart(user.id, chartRange)
      .then((data) => {
        if (isMounted) setChart({ range: chartRange, data });
      })
      .catch((error) => {
        console.error("Gagal memuat grafik:", error);
        if (isMounted) setChart({ range: chartRange, data: [] });
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, chartRange]);

  const buyerStats = useMemo(() => {
    const list = buyers ?? [];
    return {
      total: list.length,
      repeat: list.filter((b) => b.totalOrders >= 2).length,
    };
  }, [buyers]);

  if (error) {
    return (
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8 animate-fade-up">
        <PageHeader
          icon={ChartColumn}
          title="Analitik"
          subtitle="Pahami performa penjualan dan perkembangan usaha Anda."
        />
        <ErrorState onRetry={() => reload()} />
      </div>
    );
  }

  if (!dashboard) return <AnalitikSkeleton />;

  const { stats, topProducts } = dashboard;
  const upTrend = stats.percentChange >= 0;
  const hasSales =
    buyerStats.total > 0 ||
    stats.completedOrdersThisMonth > 0 ||
    stats.revenueThisMonth > 0;

  if (!hasSales && topProducts.length === 0) {
    return (
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8 animate-fade-up">
        <PageHeader
          icon={ChartColumn}
          title="Analitik"
          subtitle="Pahami performa penjualan dan perkembangan usaha Anda."
        />
        <EmptyState
          title="Belum Ada Data Penjualan"
          message="Analitik akan terisi otomatis setelah Anda menerima pesanan pertama. Tambahkan komoditas untuk mulai berjualan."
        />
      </div>
    );
  }

  const topInsight =
    topProducts.length > 0
      ? `${topProducts[0].name} menjadi komoditas dengan penjualan tertinggi Anda tahun ini (${formatNumber(topProducts[0].totalKg)} kg terjual).`
      : null;

  const trendInsight =
    stats.revenueLastMonth > 0 || stats.revenueThisMonth > 0
      ? upTrend
        ? `Pendapatan bulan ini ${stats.percentChange > 0 ? `naik ${stats.percentChange}%` : "setara"} dibanding bulan lalu. Pertahankan momentumnya.`
        : `Pendapatan bulan ini turun ${Math.abs(stats.percentChange)}% dibanding bulan lalu. Coba aktifkan kembali stok terlaris Anda.`
      : null;

  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8 animate-fade-up space-y-5">
      <PageHeader
        icon={ChartColumn}
        title="Analitik"
        subtitle="Pahami performa penjualan dan perkembangan usaha Anda."
      />

      {/* Ringkasan performa */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <SummaryCard label="Pendapatan Bulan Ini" icon={<TrendingUp size={12} />}>
          <p className="text-lg font-black text-primary">
            {formatRupiah(stats.revenueThisMonth)}
          </p>
          {(trendInsight !== null) && (
            <span
              className={`mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-bold ${upTrend ? "text-success" : "text-danger"
                }`}
            >
              {upTrend ? (
                <TrendingUp size={11} />
              ) : (
                <TrendingDown size={11} />
              )}
              {upTrend ? "+" : ""}
              {stats.percentChange}% vs bulan lalu
            </span>
          )}
        </SummaryCard>

        <SummaryCard label="Pesanan Selesai" icon={<CheckCircle2 size={12} />}>
          <p className="text-lg font-black text-gray-900">
            {formatNumber(stats.completedOrdersThisMonth)}
          </p>
          <span className="text-[11px] text-gray-400">bulan ini</span>
        </SummaryCard>

        <SummaryCard label="Total Pembeli" icon={<Users size={12} />}>
          <p className="text-lg font-black text-gray-900">
            <CountUp value={buyerStats.total} />
          </p>
          <span className="text-[11px] text-gray-400">pernah memesan</span>
        </SummaryCard>

        <SummaryCard label="Pembeli Berulang" icon={<Repeat size={12} />}>
          <p className="text-lg font-black text-gray-900">
            <CountUp value={buyerStats.repeat} />
          </p>
          <span className="text-[11px] text-gray-400">
            {buyerStats.total > 0
              ? `${Math.round((buyerStats.repeat / buyerStats.total) * 100)}% dari total`
              : "belum ada"}
          </span>
        </SummaryCard>
      </section>

      <SalesChartCard
        data={chartLoading ? [] : (chart?.data ?? [])}
        loading={chartLoading}
        range={chartRange}
        onRangeChange={setChartRange}
      />  


      {topProducts.length > 0 && (
        <TopCommoditiesCard products={topProducts} />
      )}

      {(topInsight || trendInsight) && (
        <section
          aria-label="Ringkasan insight"
          className="rounded-card border border-primary/20 bg-primary/5 px-5 py-4"
        >
          <h2 className="mb-1.5 text-sm font-bold text-primary">
            Ringkasan untuk Anda
          </h2>
          <ul className="space-y-1 text-sm leading-relaxed text-gray-700">
            {topInsight && <li>{topInsight}</li>}
            {trendInsight && <li>{trendInsight}</li>}
          </ul>
        </section>
      )}
    </div>
  );
}
