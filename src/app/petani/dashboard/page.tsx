"use client";

import { useState, useEffect } from "react";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatNumber, formatDate } from "@/lib/format";
import { LoadingState } from "@/components/shared/States";
import {
  getFarmerDashboard,
  getSalesChart,
  type DashboardStats,
  type SalesChartPoint,
  type TopProduct,
  type ActivityItem,
  type HarvestScheduleItem,
} from "@/actions/dashboard"; // Sesuaikan path ini dengan project lu

type ChartRange = "30d" | "3m" | "1y";

type DashboardData = {
  stats: DashboardStats;
  topProducts: TopProduct[];
  activities: ActivityItem[];
  harvestSchedule: HarvestScheduleItem[];
};

export default function PetaniDashboard() {
  const user = getClientUser();
  const [chartRange, setChartRange] = useState<ChartRange>("30d");

  // State terpisah yang jauh lebih aman dari infinite loop
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  
  const [chartData, setChartData] = useState<SalesChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // 1. Fetch Data Utama (HANYA JALAN SEKALI saat halaman dimuat)
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    setDashboardLoading(true);

    getFarmerDashboard(user.id)
      .then((result) => {
        if (isMounted) {
          setDashboard({
            stats: result.stats,
            topProducts: result.topProducts,
            activities: result.activities,
            harvestSchedule: result.harvestSchedule,
          });
          setDashboardLoading(false);
        }
      })
      .catch((error) => {
        console.error("Gagal memuat dashboard:", error);
        if (isMounted) setDashboardLoading(false);
      });

    return () => {
      isMounted = false; // Cleanup biar gak memory leak
    };
  }, [user?.id]); // Dependency hanya user.id

  // 2. Fetch Data Grafik (HANYA JALAN saat range waktu diubah)
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    setChartLoading(true);

    getSalesChart(user.id, chartRange)
      .then((result) => {
        if (isMounted) {
          setChartData(result);
          setChartLoading(false);
        }
      })
      .catch((error) => {
        console.error("Gagal memuat grafik:", error);
        if (isMounted) setChartLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, chartRange]); // Dependency user.id & chartRange

  // Loading State
  if (dashboardLoading || !dashboard) return <LoadingState />;

  const { stats, topProducts, activities, harvestSchedule } = dashboard;
  const salesChart = chartData ?? [];
  const maxKg = Math.max(...salesChart.map((p) => p.kg), 1);

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111111]">Dashboard Petani</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola hasil panen dan pesanan Anda.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          iconBg="bg-[#DCF2E3]"
          iconType="package"
          value={formatNumber(stats.totalCommodities)}
          label="Total Komoditas"
        />
        <StatCard
          iconBg="bg-[#FFFDF8]"
          iconType="shopping"
          iconBorder
          value={formatNumber(stats.pendingOrders)}
          label="Pesanan Masuk"
        />
        <StatCard
          iconBg="bg-[#FFFDF8]"
          iconType="check"
          iconBorder
          value={formatNumber(stats.completedOrdersThisMonth)}
          label="Pesanan Selesai"
        />
        <StatCard
          iconBg="bg-[#DCF2E3]"
          iconType="dollar"
          value={formatNumber(stats.totalSoldThisMonth)}
          label="Total Penjualan (kg)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-[10px] shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Pendapatan Hari Ini</p>
              <p className="text-2xl font-bold text-[#025246]">{formatRupiah(stats.revenueToday)}</p>
            </div>
            <div className="w-8 h-8 rounded-[4.465px] bg-[#DCF2E3] flex items-center justify-center">
              <IconPlaceholder type="dollar" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Pendapatan Bulanan</p>
              <p className="text-2xl font-bold text-[#025246]">{formatRupiah(stats.revenueThisMonth)}</p>
            </div>
            <div className="flex items-center gap-2">
              {stats.percentChange !== 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    stats.percentChange > 0
                      ? "bg-[#DCF2E3] text-[#025246]"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <span className="text-[8px]">{stats.percentChange > 0 ? "▲" : "▼"}</span>
                  {stats.percentChange > 0 ? "+" : ""}{stats.percentChange}%
                </span>
              )}
              <div className="w-8 h-8 rounded-[4.465px] bg-[#FFFDF8] border border-[#D8D8D8] flex items-center justify-center">
                <IconPlaceholder type="trend" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Penilaian</p>
              <p className="text-2xl font-bold text-[#025246]">
                {stats.avgRating.toFixed(1)}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  ({stats.reviewCount} ulasan)
                </span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-[4.465px] bg-[#FFFDF8] border border-[#D8D8D8] flex items-center justify-center">
              <IconPlaceholder type="star" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_455px] gap-4 mb-5">
        <div className="bg-white rounded-[10px] shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">Grafik Penjualan</h2>
              <p className="text-xs text-gray-500 mt-0.5">Volume penjualan komoditas Anda.</p>
            </div>
            <div className="flex items-center gap-0 rounded-md overflow-hidden border border-[#E5E7EB]">
              {([
                { value: "30d" as const, label: "30 Hari" },
                { value: "3m" as const, label: "3 Bulan" },
                { value: "1y" as const, label: "1 Tahun" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setChartRange(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    chartRange === opt.value
                      ? "bg-[#025246] text-white"
                      : "bg-[#DCF2E3] text-[#025246] hover:bg-[#c8e8db]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {chartLoading ? (
            <div className="h-[280px] flex items-center justify-center">
              <p className="text-sm text-gray-400">Memuat grafik...</p>
            </div>
          ) : (
            <div className="relative">
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
                        <div
                          className="w-full max-w-[40px] bg-[#025246] rounded-t-sm transition-all duration-500"
                          style={{ height: `${Math.max(height, 2)}%` }}
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

        <div className="bg-white rounded-[10px] shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#111111] mb-1">Aktivitas Terbaru</h2>
          <p className="text-xs text-gray-500 mb-4">Notifikasi dan aktivitas terkini.</p>

          <div className="space-y-0">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Belum ada aktivitas.</p>
            ) : (
              activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="mt-0.5 w-8 h-8 rounded-full bg-[#DCF2E3] flex items-center justify-center flex-shrink-0">
                    <IconPlaceholder type="bell" small />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#111111] line-clamp-2">{act.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(act.timestamp, true)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {topProducts.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold text-[#111111] mb-3">Produk Terlaris</h3>
              <div className="space-y-2">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#025246] text-white text-[10px] font-bold flex items-center justify-center">
                        {p.rank}
                      </span>
                      <span className="text-sm text-[#111111]">{p.name}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{formatNumber(p.totalKg)} kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[10px] shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 flex items-center justify-center">
            <IconPlaceholder type="calendar" />
          </div>
          <h2 className="text-lg font-bold text-[#111111]">Jadwal Panen</h2>
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
                  const isPast = date ? date < new Date() : false;
                  const isSoon = date
                    ? !isPast && date.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                    : false;

                  return (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 text-sm font-medium text-[#111111]">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.date ? formatDate(item.date) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            isPast
                              ? "bg-gray-100 text-gray-500"
                              : isSoon
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-[#DCF2E3] text-[#025246]"
                          }`}
                        >
                          {isPast ? "Lewat" : isSoon ? "Mendatang" : "Terjadwal"}
                        </span>
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

function IconPlaceholder({ type, small = false }: { type: string; small?: boolean }) {
  const size = small ? "w-3.5 h-3.5" : "w-4 h-4";
  const color = "text-[#025246]";

  if (type === "package") {
    return (
      <div className={`${size} rounded-sm border-2 ${color}`} style={{ borderColor: "currentColor" }}>
        <div className="w-1/2 h-full border-r-2" style={{ borderColor: "inherit" }} />
      </div>
    );
  }

  if (type === "shopping") {
    return (
      <div className={`${size} border-2 rounded-sm relative ${color}`} style={{ borderColor: "currentColor" }}>
        <div className="absolute -top-1 left-0.5 w-2 h-1 border-2 border-b-0 rounded-t-sm" style={{ borderColor: "inherit" }} />
      </div>
    );
  }

  if (type === "check") {
    return (
      <div className={`${size} border-2 rounded-full ${color}`} style={{ borderColor: "currentColor" }}>
        <div className="w-1 h-2 border-b-2 border-r-2 rotate-45 mx-auto mt-0.5" style={{ borderColor: "inherit" }} />
      </div>
    );
  }

  if (type === "dollar") {
    return <span className={`text-sm font-bold ${color}`}>Rp</span>;
  }

  if (type === "trend") {
    return (
      <div className={`${color}`}>
        <span className="text-[10px]">▲</span>
      </div>
    );
  }

  if (type === "star") {
    return (
      <div className={`${color}`}>
        <span className="text-sm">★</span>
      </div>
    );
  }

  if (type === "bell") {
    return (
      <div className={`${color}`}>
        <span className="text-[10px]">♪</span>
      </div>
    );
  }

  if (type === "calendar") {
    return (
      <div className={`${size} border-2 rounded-sm ${color}`} style={{ borderColor: "currentColor" }}>
        <div className="w-full h-1 border-b-2" style={{ borderColor: "inherit" }} />
      </div>
    );
  }

  return <div className={`${size} bg-current rounded-sm opacity-20`} />;
}

function StatCard({
  iconBg,
  iconType,
  iconBorder,
  value,
  label,
}: {
  iconBg: string;
  iconType: string;
  iconBorder?: boolean;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-white rounded-[10px] shadow-sm p-5">
      <div
        className={`w-8 h-8 rounded-[4.465px] ${iconBg} ${
          iconBorder ? "border border-[#D8D8D8]" : ""
        } flex items-center justify-center mb-3`}
      >
        <IconPlaceholder type={iconType} />
      </div>
      <p className="text-2xl font-bold text-[#111111]">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}