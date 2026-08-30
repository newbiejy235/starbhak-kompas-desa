"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Package, XCircle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import TransactionTabs from "@/components/userpage/TransactionTabs";
import { getUserOrders } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import {
  formatDate,
  formatNumber,
  formatRupiah,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/format";
import { EmptyState, formatImage } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";
import type { BuyerOrder } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

const FAILED_PAYMENT_STATUSES = ["failed", "refunded"];

function FailedSkeleton() {
  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Skeleton className="mb-1 h-8 w-52" />
        <Skeleton className="mb-4 h-4 w-72" />

        <div className="mb-6 flex items-center gap-6 border-b border-gray-200">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-12" />
        </div>

        <div className="divide-y divide-gray-200">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="py-6">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="mt-5 flex items-start gap-4">
                <Skeleton className="h-20 w-20 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="hidden shrink-0 space-y-2 text-right sm:block">
                  <Skeleton className="ml-auto h-3 w-20" />
                  <Skeleton className="ml-auto h-4 w-24" />
                  <Skeleton className="ml-auto mt-3 h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UserFailedTransactions() {
  const user = getClientUser();

  const { data: orders, loading } = useFetch(
    () =>
      user
        ? getUserOrders(user.id)
        : Promise.resolve([] as BuyerOrder[]),
    [user?.id],
  );

  if (loading) return <FailedSkeleton />;

  const failedOrders = (orders ?? []).filter((o) =>
    FAILED_PAYMENT_STATUSES.includes(o.paymentStatus ?? ""),
  );

  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8 animate-fade-up">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          icon={XCircle}
          title="Transaksi Gagal"
          subtitle="Pembayaran yang gagal, dibatalkan, atau kedaluwarsa."
        />

        <TransactionTabs active="failed" />

        {failedOrders.length === 0 ? (
          <EmptyState
            title="Tidak Ada Transaksi Gagal"
            message="Belum ada pembayaran yang gagal, dibatalkan, atau kedaluwarsa."
          />
        ) : (
          <section>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                  Pembayaran Tidak Berhasil
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Transaksi yang perlu Anda tinjau.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                {formatNumber(failedOrders.length)} transaksi
              </span>
            </div>

            <div className="border-b border-gray-200">
              {failedOrders.map((o, i) => {
                const img =
                  formatImage(o.commodityImage) ??
                  formatImage(o.commodityImages?.[0] ?? null);
                const payLabel =
                  PAYMENT_STATUS_LABEL[o.paymentStatus ?? "failed"] ??
                  "Gagal";
                const payMethod = o.paymentMethod
                  ? PAYMENT_METHOD_LABEL[o.paymentMethod] ??
                    o.paymentMethod
                  : null;

                return (
                  <section
                    key={o.id}
                    className="py-6 animate-fade-up"
                    style={{
                      animationDelay: `${Math.min(i * 50, 250)}ms`,
                      animationFillMode: "backwards",
                    }}
                    aria-label={`Transaksi ${o.orderCode}`}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {o.orderCode}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <StatusBadge
                        status={o.paymentStatus ?? "failed"}
                        label={payLabel}
                      />
                    </div>

                    {/* Produk */}
                    <div className="mt-5 flex items-start gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
                        {img ? (
                          <Image
                            src={img}
                            alt={o.commodityName}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
                            <Package size={22} strokeWidth={1.5} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-bold text-gray-900">
                          {o.commodityName}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {formatNumber(o.quantity)} kg ×{" "}
                          {formatRupiah(o.unitPrice)}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Petani: {o.farmerName}
                        </p>
                        {payMethod && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            Pembayaran: {payMethod}
                          </p>
                        )}
                      </div>

                      {/* Total + aksi — desktop */}
                      <div className="hidden shrink-0 text-right sm:block">
                        <p className="text-[11px] uppercase tracking-wider text-gray-400">
                          Total
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-gray-900">
                          {formatRupiah(o.totalPrice)}
                        </p>
                        <Link
                          href={`/user/checkout/${o.id}`}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 hover:text-primary-dark transition-colors"
                        >
                          Lihat Detail <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>

                    {/* Total + aksi — mobile */}
                    <div className="mt-4 flex items-end justify-between gap-3 sm:hidden">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-gray-400">
                          Total
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-gray-900">
                          {formatRupiah(o.totalPrice)}
                        </p>
                      </div>
                      <Link
                        href={`/user/checkout/${o.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 hover:text-primary-dark transition-colors"
                      >
                        Lihat Detail <ChevronRight size={16} />
                      </Link>
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
