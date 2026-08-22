"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  CheckCircle2,
  Scale,
  Wallet,
  TrendingUp,
  Star,
  Bell,
  CalendarDays,
} from "lucide-react";
import { getClientUser } from "@/lib/auth/client";
import { formatNumber, formatDate } from "@/lib/format";
import { getFarmerDashboard, getSalesChart } from "@/actions/dashboard";
import type {
  DashboardStats,
  SalesChartPoint,
} from "@/actions/dashboard";
import CountUp from "@/components/ui/CountUp";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

type ChartRange = "30d" | "3m" | "1y";

type DashboardData = {
  stats: DashboardStats;
  topProducts: Awaited<ReturnType<typeof getFarmerDashboard>>["topProducts"];
  activities: Awaited<ReturnType<typeof getFarmerDashboard>>["activities"];
  harvestSchedule: Awaited<ReturnType<typeof getFarmerDashboard>>["harvestSchedule"];
};

export default function PetaniDashboard() {
  const user = getClientUser();
  const [chartRange, setChartRange] = useState<ChartRange>("30d");

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState(false);

  // Loading grafik diturunkan dari data: true saat range belum ter-load
  const [chart, setChart] = useState<{ range: ChartRange; data: SalesChartPoint[] } | null>(null);
  const chartLoading = chart?.range !== chartRange;

  // Referensi waktu untuk klasifikasi jadwal (diambil di effect agar render murni)
  const [now, setNow] = useState(0);

  // Fetch data utama (sekali saat mount)
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    const id = requestAnimationFrame(() => setNow(Date.now()));

    getFarmerDashboard(user.id)
      .then((result) => {
        if (isMounted) {
          setDashboard({
            stats: result.stats,
            topProducts: result.topProducts,
            activities: result.activities,
            harvestSchedule: result.harvestSchedule,
          });
        }
      })
      .catch((error) => {
        console.error("Gagal memuat dashboard:", error);
        if (isMounted) setDashboardError(true);
      });

    return () => {
      isMounted = false;
      cancelAnimationFrame(id);
    };
  }, [user?.id]);

  // Fetch grafik (saat range berubah)
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    getSalesChart(user.id, chartRange)
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
  }, [user?.id, chartRange]);

  // Skeleton loading saat data dimuat (PRD 8.3 & 16)
  if (dashboardError) {
    return (
      <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-10 text-center">
        <p className="text-sm text-gray-500">
          Gagal memuat data dashboard. Coba muat ulang halaman.
        </p>
      </div>
    );
  }

  if (!dashboard) return <DashboardSkeleton />;

  const { stats, topProducts, activities, harvestSchedule } = dashboard;
  const salesChart = chartLoading ? [] : (chart?.data ?? []);
  const maxKg = Math.max(...salesChart.map((p) => p.kg), 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard Petani</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola hasil panen dan pesanan Anda.
        </p>
      </div>

      {/* Stat card count-up + entrance staggered (PRD 8.3 & 9.2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard delay={0} icon={<Package size={18} />} value={stats.totalCommodities} label="Total Komoditas" />
        <StatCard delay={80} icon={<ShoppingCart size={18} />} value={stats.pendingOrders} label="Pesanan Masuk" highlight />
        <StatCard delay={160} icon={<CheckCircle2 size={18} />} value={stats.completedOrdersThisMonth} label="Pesanan Selesai" />
        <StatCard delay={240} icon={<Scale size={18} />} value={stats.totalSoldThisMonth} label="Total Penjualan (kg)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniCard delay={320} icon={<Wallet size={16} />} label="Pendapatan Hari Ini">
          <p className="text-2xl font-bold text-primary">
            <CountUp value={Number(stats.revenueToday)} prefix="Rp " />
          </p>
        </MiniCard>

        <MiniCard
          delay={400}
          icon={<TrendingUp size={16} />}
          label="Pendapatan Bulanan"
          badge={
            stats.percentChange !== 0 ? (
              <Badge tone={stats.percentChange > 0 ? "success" : "danger"}>
                {stats.percentChange > 0 ? "▲" : "▼"} {stats.percentChange > 0 ? "+" : ""}
                {stats.percentChange}%
              </Badge>
            ) : undefined
          }
        >
          <p className="text-2xl font-bold text-primary">
            <CountUp value={Number(stats.revenueThisMonth)} prefix="Rp " />
          </p>
        </MiniCard>

        <MiniCard delay={480} icon={<Star size={16} />} label="Penilaian">
          <p className="text-2xl font-bold text-primary">
            {stats.avgRating.toFixed(1)}
            <span className="text-sm font-normal text-gray-400 ml-1">
              ({stats.reviewCount} ulasan)
            </span>
          </p>
        </MiniCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_455px] gap-4">
        {/* Grafik penjualan dengan draw-in bertahap (PRD 8.3 & 9.2) */}
        <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 transition-all duration-300 ease-smooth hover:shadow-lift">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Grafik Penjualan</h2>
              <p className="text-xs text-gray-500 mt-0.5">Volume penjualan komoditas Anda.</p>
            </div>
            <div className="flex items-center gap-0 rounded-lg overflow-hidden border border-gray-200">
              {([
                { value: "30d" as const, label: "30 Hari" },
                { value: "3m" as const, label: "3 Bulan" },
                { value: "1y" as const, label: "1 Tahun" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setChartRange(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium active:scale-95 transition-all duration-100 ${
                    chartRange === opt.value
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {chartLoading ? (
            <div className="flex items-end gap-3 h-[280px] pt-6">
              {[50, 75, 40, 85, 60, 90].map((h, i) => (
                <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
              ))}
            </div>
          ) : (
            <div className="relative" key={chartRange}>
              <div className="relative h-[240px]">
                {[0, 0.25, 0.5, 0.75, 1].reverse().map((frac, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-black/10"
                    style={{ top: `${frac * 100}%` }}
                  >
                    <span className="absolute -left-1 -top-2.5 text-[10px] text-gray-400 -translate-x-full pr-2">
                      {formatNumber(Math.round(maxKg * frac))}
                    </span>
                  </div>
                ))}

                <div className="absolute inset-0 flex items-end justify-around px-4 ml-8">
                  {salesChart.map((point, i) => {
                    const height = maxKg > 0 ? (point.kg / maxKg) * 100 : 0;
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1">
                        {/* Bar draw-in via scaleY + stagger (PRD 9.2) */}
                        <div
                          className="w-full max-w-[40px] bg-gradient-to-t from-primary to-emerald-600 rounded-t-md origin-bottom animate-grow-y"
                          style={{
                            height: `${Math.max(height, 2)}%`,
                            animationDelay: `${i * 50}ms`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-around px-4 ml-8 mt-3">
                {salesChart.map((point, i) => (
                  <span key={i} className="text-[10px] text-gray-500 flex-1 text-center">
                    {point.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 transition-all duration-300 ease-smooth hover:shadow-lift">
          <h2 className="text-lg font-bold text-neutral-900 mb-1">Aktivitas Terbaru</h2>
          <p className="text-xs text-gray-500 mb-4">Notifikasi dan aktivitas terkini.</p>

          <div className="space-y-0">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Belum ada aktivitas.</p>
            ) : (
              activities.map((act, i) => (
                <div
                  key={i}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 opacity-0 animate-fade-up"
                >
                  <div className="mt-0.5 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Bell size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900 line-clamp-2">{act.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(act.timestamp, true)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {topProducts.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold text-neutral-900 mb-3">Produk Terlaris</h3>
              <div className="space-y-2">
                {topProducts.map((p, i) => (
                  <div
                    key={i}
                    style={{ animationDelay: `${300 + i * 60}ms` }}
                    className="flex items-center justify-between opacity-0 animate-fade-up"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                        {p.rank}
                      </span>
                      <span className="text-sm text-neutral-900">{p.name}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{formatNumber(p.totalKg)} kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 transition-all duration-300 ease-smooth hover:shadow-lift">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-neutral-900">Jadwal Panen</h2>
        </div>

        {harvestSchedule.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Belum ada jadwal panen.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Komoditas</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Estimasi Panen</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {harvestSchedule.map((item, i) => {
                  const date = item.date ? new Date(item.date) : null;
                  const isPast = date ? date.getTime() < now : false;
                  const isSoon = date
                    ? !isPast && date.getTime() - now < 7 * 24 * 60 * 60 * 1000
                    : false;

                  return (
                    <tr
                      key={i}
                      // Baris tabel hover halus (PRD 9.2)
                      className="border-b border-gray-50 last:border-0 transition-colors duration-150 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-neutral-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.date ? formatDate(item.date) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={isPast ? "neutral" : isSoon ? "warning" : "success"}>
                          {isPast ? "Lewat" : isSoon ? "Mendatang" : "Terjadwal"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Sub-komponen ------------------------------ */

function StatCard({
  icon,
  value,
  label,
  delay,
  highlight = false,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`bg-white rounded-card border shadow-soft p-5 opacity-0 animate-fade-up transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift ${
        highlight ? "border-primary/30" : "border-gray-200/80"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
          highlight ? "bg-warning/15 text-warning" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-neutral-900">
        <CountUp value={value} />
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function MiniCard({
  icon,
  label,
  children,
  delay,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  delay: number;
  badge?: React.ReactNode;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="bg-white rounded-card border border-gray-200/80 shadow-soft p-5 opacity-0 animate-fade-up transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
          {children}
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-card" />
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
