"use client";

import Link from "next/link";
import Image from "next/image";
import { Wallet, Package, ChevronRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import TransactionTabs from "@/components/userpage/TransactionTabs";
import { getUserOrders } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { EmptyState, formatImage } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";
import type { BuyerOrder } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function OrderImage({
  src,
  name,
}: {
  src: string | null;
  name: string;
}) {
  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
      {src ? (
        <Image src={src} alt={name} fill sizes="80px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
          <Package size={22} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Skeleton className="mb-1 h-8 w-48" />
        <Skeleton className="mb-5 h-4 w-72" />
        <Skeleton className="mb-6 h-4 w-64" />

        <div className="divide-y divide-gray-200">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-6">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
              <div className="mt-5 flex items-start gap-4">
                <Skeleton className="h-20 w-20 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="hidden shrink-0 space-y-2 text-right sm:block">
                  <Skeleton className="ml-auto h-3 w-16" />
                  <Skeleton className="ml-auto h-4 w-24" />
                  <Skeleton className="ml-auto mt-3 h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UserCheckout() {
  const user = getClientUser();

  const { data: orders, loading } = useFetch(
    () =>
      user ? getUserOrders(user.id) : Promise.resolve([] as BuyerOrder[]),
    [user?.id],
  );

  if (loading) return <CheckoutSkeleton />;

  const pendings = (orders ?? []).filter(
    (o) => o.paymentStatus === "pending" && o.status !== "cancelled",
  );

  const totalPending = pendings.reduce(
    (sum, o) => sum + Number(o.totalPrice || 0),
    0,
  );

  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8 animate-fade-up">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          icon={Wallet}
          title="Checkout Saya"
          subtitle="Selesaikan pembayaran pesanan Anda sebelum diproses petani."
        />

        <TransactionTabs active="checkout" />

        {pendings.length > 0 && (
          <p className="mb-2 pb-5 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {pendings.length}{" "}
              {pendings.length === 1 ? "pesanan" : "pesanan"}
            </span>{" "}
            menunggu pembayaran · Total{" "}
            <span className="font-bold text-primary">
              {formatRupiah(totalPending)}
            </span>
          </p>
        )}

        {pendings.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              title="Belum Ada Checkout"
              message="Belum ada pembayaran yang perlu diselesaikan. Cari komoditas dan mulai membuat pesanan."
            >
              <Link
                href="/user/home"
                className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
              >
                Cari Komoditas
              </Link>
            </EmptyState>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendings.map((o, i) => {
              const img =
                formatImage(o.commodityImage) ??
                formatImage(o.commodityImages?.[0] ?? null);

              return (
                <section
                  key={o.id}
                  className="py-6 animate-fade-up"
                  style={{
                    animationDelay: `${Math.min(i * 50, 250)}ms`,
                    animationFillMode: "backwards",
                  }}
                  aria-label={`Checkout ${o.orderCode}`}
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {o.orderCode}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatDateTime(o.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={o.paymentStatus ?? "pending"} />
                  </div>

                  {/* Product row */}
                  <div className="mt-5 flex items-start gap-4">
                    <OrderImage src={img} name={o.commodityName} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-gray-900">
                        {o.commodityName}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {Number(o.quantity)} × {formatRupiah(o.unitPrice)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Petani: {o.farmerName}
                      </p>
                    </div>

                    {/* Total + action — desktop */}
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400">
                        Total Pembayaran
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-primary">
                        {formatRupiah(o.totalPrice)}
                      </p>
                      <Link
                        href={`/user/checkout/${o.id}`}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 hover:text-primary-dark transition-colors"
                      >
                        Bayar Sekarang <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>

                  {/* Total + action — mobile */}
                  <div className="mt-4 flex items-end justify-between gap-3 sm:hidden">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-400">
                        Total Pembayaran
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-primary">
                        {formatRupiah(o.totalPrice)}
                      </p>
                    </div>
                    <Link
                      href={`/user/checkout/${o.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 hover:text-primary-dark transition-colors"
                    >
                      Bayar Sekarang <ChevronRight size={16} />
                    </Link>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
