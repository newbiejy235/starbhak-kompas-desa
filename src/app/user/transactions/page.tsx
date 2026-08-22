"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getUserOrders } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";
import type { BuyerOrder } from "@/lib/types/market";
import CountUp from "@/components/ui/CountUp";
import { Skeleton } from "@/components/ui/Skeleton";

function TransactionsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-28 rounded-card" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-card" />
      ))}
    </div>
  );
}

export default function UserTransactions() {
  const user = getClientUser();

  const { data: orders, loading } = useFetch(
    () =>
      user
        ? getUserOrders(user.id)
        : Promise.resolve([] as BuyerOrder[]),
    [user?.id],
  );

  if (loading) return <TransactionsSkeleton />;

  const paidOrders = (orders ?? []).filter((o) => o.paymentStatus === "paid");
  const totalSpent = paidOrders.reduce((acc, o) => acc + Number(o.totalPrice), 0);

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Riwayat Transaksi</h1>
      <p className="text-sm text-gray-500 mb-6">Riwayat pembelian yang telah dibayar.</p>

      <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 mb-6">
        <p className="text-sm text-gray-500">Total Pengeluaran</p>
        <CountUp
          value={totalSpent}
          prefix="Rp "
          className="text-2xl font-extrabold text-primary"
        />
        <p className="text-xs text-gray-400 mt-1">{paidOrders.length} transaksi selesai</p>
      </div>

      {paidOrders.length === 0 ? (
        <EmptyState
          title="Belum Ada Transaksi"
          message="Transaksi yang sudah dibayar akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {paidOrders.map((o, i) => (
            <Link
              key={o.id}
              href={`/user/checkout/${o.id}`}
              className="bg-white rounded-card border border-gray-200/80 shadow-soft p-5 flex items-center justify-between gap-4 hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300 ease-smooth animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 60, 360)}ms`, animationFillMode: "backwards" }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{o.commodityName}</p>
                  <p className="text-xs text-gray-500">
                    {o.orderCode} · {formatDateTime(o.createdAt)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {PAYMENT_METHOD_LABEL[o.paymentMethod ?? ""] ?? "Transfer"} ·{" "}
                    <StatusBadge status={o.paymentStatus ?? "paid"} />
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-extrabold text-primary">{formatRupiah(o.totalPrice)}</p>
                <p className="text-[11px] text-gray-400">Termasuk biaya layanan</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
