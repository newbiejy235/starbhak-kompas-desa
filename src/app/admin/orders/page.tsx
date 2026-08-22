"use client";

import { useState } from "react";
import { getAllOrders, updateOrderStatus } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { Store, Truck } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { AdminOrder } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-card" />
    </div>
  );
}

export default function AdminOrders() {
  const admin = getClientUser();
  const [filter, setFilter] = useState("all");

  const { data: orders, loading, reload } = useFetch(
    () => getAllOrders(),
    [],
  );

  const setStatus = async (id: number, status: string) => {
    if (!admin) return;
    const res = await updateOrderStatus(id, status, admin.id);
    if (!res.success) alert(res.message);
    reload();
  };

  if (loading) return <OrdersSkeleton />;

  const list: AdminOrder[] = orders ?? [];
  const filtered = list.filter((o) => filter === "all" || o.status === filter);

  const statusOptions = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "completed",
    "cancelled",
  ];

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Manajemen Pesanan</h1>
      <p className="text-sm text-gray-500 mb-6">Pantau dan kelola seluruh pesanan marketplace.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {["all", ...statusOptions].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 ${
              filter === s
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {s === "all" ? "Semua" : ORDER_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Tidak Ada Pesanan" message="Tidak ada pesanan yang cocok dengan filter." />
      ) : (
        <div className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                <th className="px-5 py-4 font-medium">Kode Pesanan</th>
                <th className="px-5 py-4 font-medium">Produk</th>
                <th className="px-5 py-4 font-medium">Pembeli / Petani</th>
                <th className="px-5 py-4 font-medium">Total</th>
                <th className="px-5 py-4 font-medium">Pembayaran</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-primary/[0.03] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{o.orderCode}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(o.createdAt)}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">{o.commodityName}</td>
                  <td className="px-5 py-4">
                    <p className="flex items-center gap-1 text-xs text-gray-600">
                      <Store size={12} /> {o.buyerName}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Truck size={12} /> {o.farmerName}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-extrabold text-primary">{formatRupiah(o.totalPrice)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={o.paymentStatus ?? "pending"} />
                    <p className="text-xs text-gray-400 mt-1">
                      {PAYMENT_METHOD_LABEL[o.paymentMethod ?? ""] ?? "-"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o.id, e.target.value)}
                      aria-label={`Ubah status pesanan ${o.orderCode}`}
                      className="rounded-lg border border-gray-200 px-2 py-2 text-xs font-medium bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
