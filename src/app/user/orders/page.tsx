"use client";

import { useEffect } from "react";
import Link from "next/link";
import { getUserOrders } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";
import type { BuyerOrder } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function OrdersSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64 mb-6" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-card" />
      ))}
    </div>
  );
}

export default function UserOrders() {
  const user = getClientUser();

  const { data: orders, loading, reload } = useFetch(
    () =>
      user ? getUserOrders(user.id) : Promise.resolve([] as BuyerOrder[]),
    [user?.id],
  );

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     reload();
  //   }, 5000);
  //   return () => clearInterval(timer);
  // }, [reload]);

  if (loading) return <OrdersSkeleton />;

  const orderList = (orders ?? []).filter(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Saya</h1>
      <p className="text-sm text-gray-500 mb-6">Pantau status pesanan yang sedang berjalan.</p>

      {orderList.length === 0 ? (
        <EmptyState
          title="Belum Ada Pesanan Aktif"
          message="Anda belum memiliki pesanan yang sedang berjalan. Yuk mulai belanja komoditas segar!"
        />
      ) : (
        <div className="space-y-4">
          {orderList.map((o, i) => (
            <div
              key={o.id}
              className="bg-white rounded-card border border-gray-200/80 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300 ease-smooth overflow-hidden animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 60, 360)}ms`, animationFillMode: "backwards" }}
            >
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <p className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</p>
                  <p className="text-sm font-bold text-gray-800">{o.orderCode}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <Link
                href={`/user/checkout/${o.id}`}
                className="px-5 py-4 flex items-center gap-4 hover:bg-primary/[0.03] transition-colors group"
              >
                <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-2xl font-black group-hover:scale-105 transition-transform duration-300">
                  {o.commodityName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{o.commodityName}</p>
                  <p className="text-xs text-gray-500">
                    {Number(o.quantity)} ├ù {formatRupiah(o.unitPrice)} ┬╖ {o.farmerName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                    Pembayaran: <StatusBadge status={o.paymentStatus ?? "pending"} />
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-primary">{formatRupiah(o.totalPrice)}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
