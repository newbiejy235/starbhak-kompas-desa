"use client";

import { useState } from "react";
import { getAllOrders, updateOrderStatus } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { LoadingState, EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { Store, Truck } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { AdminOrder } from "@/lib/types/market";

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

  if (loading) return <LoadingState />;

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
    <div>
      <h1 className="text-2xl font-bold text-[#111111] mb-2">Manajemen Pesanan</h1>
      <p className="text-sm text-gray-500 mb-6">Pantau dan kelola seluruh pesanan marketplace.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {["all", ...statusOptions].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors capitalize ${
              filter === s
                ? "bg-[#025246] text-white border-[#025246]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#025246]"
            }`}
          >
            {s === "all" ? "Semua" : ORDER_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Tidak Ada Pesanan" message="Tidak ada pesanan yang cocok dengan filter." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
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
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
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
                  <td className="px-5 py-4 font-extrabold text-[#025246]">{formatRupiah(o.totalPrice)}</td>
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
                      className="rounded-lg border border-gray-200 px-2 py-2 text-xs font-medium bg-white focus:outline-none focus:border-[#025246]"
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
