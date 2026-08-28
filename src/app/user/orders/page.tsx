"use client";

import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { getUserOrders } from "@/actions/order";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { useAuth, useFetch } from "@/lib/hooks";
import type { BuyerOrder } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function OrdersSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-card border border-gray-200/80 bg-white">
            <Skeleton className="h-14 rounded-none bg-gray-100" />
            <div className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-20 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserOrders() {
  const { user } = useAuth();

  const { data: orders, loading } = useFetch(
    () =>
      user ? getUserOrders(user.id) : Promise.resolve([] as BuyerOrder[]),
    [user?.id],
  );

  if (loading) return <OrdersSkeleton />;

  const orderList = orders ?? [];

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <PageHeader
        icon={ShoppingBag}
        title="Pesanan Saya"
        subtitle="Pantau status pesanan dan pembayaran Anda."
      />

      {orderList.length === 0 ? (
        <EmptyState
          title="Belum Ada Pesanan"
          message="Pesanan Anda akan muncul di sini setelah berbelanja."
        />
      ) : (
        <div className="space-y-4">
          {orderList.map((o, i) => (
            <div
              key={o.id}
              className="overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 60, 360)}ms`, animationFillMode: "backwards" }}
            >
              {/* Strip kepala kartu — sama dengan kartu pesanan petani */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-3">
                <div>
                  <p className="text-sm font-bold text-gray-800">{o.orderCode}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <Link
                href={`/user/checkout/${o.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-primary/[0.03]"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-dark text-lg font-bold text-white">
                  {o.commodityName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{o.commodityName}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {Number(o.quantity)} × {formatRupiah(o.unitPrice)} · {o.farmerName}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="shrink-0 text-[11px] text-gray-400">Pembayaran</span>
                    <StatusBadge status={o.paymentStatus ?? "pending"} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-bold text-primary">{formatRupiah(o.totalPrice)}</p>
                  {o.status === "completed" && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
                      <Star size={12} aria-hidden /> Beri Ulasan
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
