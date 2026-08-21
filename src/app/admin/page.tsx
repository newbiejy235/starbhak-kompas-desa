"use client";

import { DollarSign, Users, Package, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/actions/admin";
import { formatRupiah, formatNumber } from "@/lib/format";
import { LoadingState } from "@/components/shared/States";
import { useFetch } from "@/lib/hooks";

export default function AdminPage() {
  const { data: stats, loading } = useFetch(() => getDashboardStats(), []);

  if (loading) return <LoadingState />;

  const kpis = [
    {
      label: "Total Transaksi",
      value: formatRupiah(stats?.totalTransactionVolume ?? 0),
      icon: DollarSign,
      color: "bg-[#025246]",
    },
    {
      label: "Total User",
      value: formatNumber(stats?.totalUsers ?? 0),
      icon: Users,
      color: "bg-blue-600",
    },
    {
      label: "Total Komoditas",
      value: formatNumber(stats?.totalCommodities ?? 0),
      icon: Package,
      color: "bg-green-600",
    },
    {
      label: "Pesanan Pending",
      value: formatNumber(stats?.pendingOrders ?? 0),
      icon: AlertTriangle,
      color: "bg-amber-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111111] mb-2">Dashboard Admin</h1>
      <p className="text-sm text-gray-500 mb-6">Ringkasan performa platform Kompas Desa.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${kpi.color} text-white flex items-center justify-center mb-3`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 truncate">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
