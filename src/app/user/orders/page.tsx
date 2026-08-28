"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, SlidersHorizontal, Star } from "lucide-react";
import { getUserOrders } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";
import { ORDER_STATUS_LABEL } from "@/lib/format";
import type { BuyerOrder } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#025246]";

function OrdersSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-11 w-11 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-card border border-gray-200/80 bg-white"
          >
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

const selectClass =
  "rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-colors duration-200 hover:border-gray-300";

export default function UserOrders() {
  const user = getClientUser();

  const { data: orders, loading } = useFetch(
    () =>
      user ? getUserOrders(user.id) : Promise.resolve([] as BuyerOrder[]),
    [user?.id],
  );

  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const orderList = useMemo(() => orders ?? [], [orders]);

  const filtered = useMemo(() => {
    let list = [...orderList];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(q) ||
          o.commodityName.toLowerCase().includes(q) ||
          o.farmerName.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    return list;
  }, [orderList, query, statusFilter]);

  const stats = useMemo(
    () => ({
      total: orderList.length,
      pending: orderList.filter((o) => o.status === "pending").length,
      completed: orderList.filter((o) => o.status === "completed").length,
    }),
    [orderList],
  );

  if (loading) return <OrdersSkeleton />;

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <div className="mx-auto max-w-4xl animate-fade-up px-4 py-6 sm:px-6 sm:py-8 lg:px-0">
        {/* Header */}
        <header className="mb-6 sm:mb-7">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              <ShoppingBag size={22} strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Pesanan Saya
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Pantau status pesanan dan pembayaran Anda.
              </p>
            </div>
          </div>
        </header>

        {/* Stats */}
        {orderList.length > 0 && (
          <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
              <p className="text-xs text-gray-500">Total Pesanan</p>
              <p className="mt-0.5 text-xl font-black text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
              <p className="text-xs text-gray-500">Menunggu</p>
              <p className="mt-0.5 text-xl font-black text-gray-900">{stats.pending}</p>
            </div>
            <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
              <p className="text-xs text-gray-500">Selesai</p>
              <p className="mt-0.5 text-xl font-black text-primary">{stats.completed}</p>
            </div>
          </div>
        )}

        {/* Filter bar */}
        {orderList.length > 0 && (
          <div className="mb-4 rounded-card border border-gray-200/80 bg-white p-3 shadow-soft">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari kode pesanan, komoditas, atau petani..."
                  aria-label="Cari pesanan"
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-colors duration-200 hover:border-gray-300"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-label="Tampilkan filter"
                aria-expanded={showFilters}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors sm:hidden ${
                  showFilters
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                <SlidersHorizontal size={15} />
              </button>
            </div>

            <div
              className={`${showFilters ? "grid" : "hidden"} mt-3 grid-cols-1 gap-2 sm:grid sm:grid-cols-3`}
            >
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter status pesanan"
                className={selectClass}
              >
                <option value="all">Semua Status</option>
                {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* List */}
        {orderList.length === 0 ? (
          <EmptyState
            title="Belum Ada Pesanan"
            message="Pesanan Anda akan muncul di sini setelah berbelanja."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Tidak Ada Pesanan"
            message="Tidak ada pesanan yang cocok dengan filter saat ini."
          >
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setQuery("");
              }}
              className={`mt-4 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary/5 ${focusRing}`}
            >
              Reset Filter
            </button>
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {filtered.map((o, i) => (
              <div
                key={o.id}
                className="overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift animate-fade-up"
                style={{
                  animationDelay: `${Math.min(i * 60, 360)}ms`,
                  animationFillMode: "backwards",
                }}
              >
                {/* Card header strip */}
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
                    <p className="truncate text-sm font-bold text-gray-900">
                      {o.commodityName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {Number(o.quantity)} x {formatRupiah(o.unitPrice)} &middot;{" "}
                      {o.farmerName}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="shrink-0 text-[11px] text-gray-400">
                        Pembayaran
                      </span>
                      <StatusBadge status={o.paymentStatus ?? "pending"} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-bold text-primary">
                      {formatRupiah(o.totalPrice)}
                    </p>
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
    </div>
  );
}
