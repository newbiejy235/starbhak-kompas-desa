"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Package, ChevronRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { getUserOrders } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { EmptyState, formatImage } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";
import type { BuyerOrder } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

const GRID_COLS =
  "sm:grid-cols-[minmax(240px,1.6fr)_minmax(110px,0.7fr)_minmax(120px,0.7fr)_minmax(110px,0.7fr)_minmax(130px,auto)]";

function OrderImage({
  src,
  name,
  className,
}: {
  src: string | null;
  name: string;
  className: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100 ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="64px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
          <Package size={22} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-48 mb-1" />
      <Skeleton className="h-4 w-72 mb-6" />

      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden animate-pulse">
        <div
          className={`hidden sm:grid ${GRID_COLS} gap-4 px-5 py-3 bg-gray-50/60 border-b border-gray-100`}
        >
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-12 ml-auto" />
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`hidden sm:grid ${GRID_COLS} gap-4 items-center px-5 py-4 border-b border-gray-100`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}

        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`m-${i}`}
            className="sm:hidden px-5 py-5 border-b border-gray-100"
          >
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="mt-4 flex items-start gap-3">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <div className="space-y-1.5 text-right">
                <Skeleton className="h-3 w-10 ml-auto" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserOrders() {
  const user = getClientUser();

  const { data: orders, loading } = useFetch(
    () =>
      user ? getUserOrders(user.id) : Promise.resolve([] as BuyerOrder[]),
    [user?.id],
  );

  if (loading) return <OrdersSkeleton />;

  const orderList = (orders ?? []).filter(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  );

  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8 animate-fade-up">
      <PageHeader
        icon={ShoppingBag}
        title="Pesanan Saya"
        subtitle="Pantau status pesanan yang sedang berjalan."
      />

      {orderList.length === 0 ? (
        <div className="pt-4">
          <EmptyState
            title="Belum Ada Pesanan Aktif"
            message="Anda belum memiliki pesanan yang sedang berjalan. Yuk mulai belanja komoditas segar!"
          />
        </div>
      ) : (
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div
            className={`hidden sm:grid ${GRID_COLS} gap-4 px-5 py-3 bg-gray-50/60 border-b border-gray-100 text-[11px] uppercase tracking-wider font-semibold text-gray-400`}
          >
            <span>Produk</span>
            <span>Petani</span>
            <span>Pembayaran</span>
            <span>Total</span>
            <span className="text-right">Status</span>
          </div>

          {orderList.map((o, i) => {
            const img =
              formatImage(o.commodityImage) ??
              formatImage(o.commodityImages?.[0] ?? null);

            return (
              <div
                key={o.id}
                className="border-b border-gray-100 last:border-b-0 animate-fade-up"
                style={{
                  animationDelay: `${Math.min(i * 50, 300)}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <Link
                  href={`/user/checkout/${o.id}`}
                  className={`group hidden sm:grid ${GRID_COLS} gap-4 items-center px-5 py-4 transition-colors duration-200 hover:bg-gray-50/70`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <OrderImage
                      src={img}
                      name={o.commodityName}
                      className="h-14 w-14"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate transition-colors duration-200 group-hover:text-primary">
                        {o.commodityName}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {Number(o.quantity)} × {formatRupiah(o.unitPrice)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400 truncate">
                        {o.orderCode} · {formatDateTime(o.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400">Petani</p>
                    <p className="mt-0.5 text-sm text-gray-700 truncate">
                      {o.farmerName}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-gray-400">Pembayaran</p>
                    <div className="mt-1">
                      <StatusBadge status={o.paymentStatus ?? "pending"} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-gray-400">Total</p>
                    <p className="mt-0.5 text-sm font-bold text-primary">
                      {formatRupiah(o.totalPrice)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={o.status} />
                    {o.paymentStatus === "pending" ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-colors duration-200 group-hover:text-primary-dark">
                          Bayar Sekarang
                          <ChevronRight size={14} />
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Lihat Detail →
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors duration-200 group-hover:text-primary-dark">
                        Lihat Detail
                        <ChevronRight size={14} />
                      </span>
                    )}
                  </div>
                </Link>

                <Link
                  href={`/user/checkout/${o.id}`}
                  className="group block sm:hidden px-5 py-5 transition-colors duration-200 hover:bg-gray-50/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-500 truncate">
                      {o.orderCode} · {formatDateTime(o.createdAt)}
                    </p>
                    <StatusBadge status={o.status} />
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <OrderImage
                      src={img}
                      name={o.commodityName}
                      className="h-16 w-16"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold leading-snug text-gray-900 line-clamp-2 transition-colors duration-200 group-hover:text-primary">
                        {o.commodityName}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {Number(o.quantity)} × {formatRupiah(o.unitPrice)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Petani: {o.farmerName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] text-gray-400">Pembayaran</p>
                      <div className="mt-1">
                        <StatusBadge status={o.paymentStatus ?? "pending"} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-400">Total</p>
                      <p className="mt-0.5 text-sm font-bold text-primary">
                        {formatRupiah(o.totalPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-4">
                    {o.paymentStatus === "pending" ? (
                      <>
                        <span className="text-[11px] text-gray-400">
                          Lihat Detail
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-primary transition-colors duration-200 group-hover:text-primary-dark">
                          Bayar Sekarang
                          <ChevronRight size={16} />
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors duration-200 group-hover:text-primary-dark">
                        Lihat Detail
                        <ChevronRight size={16} />
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
