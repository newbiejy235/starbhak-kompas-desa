"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  Search,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { getFarmerDashboard } from "@/actions/dashboard";
import { getFarmerOrders } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import type { FarmerOrder } from "@/lib/types/market";
import { EmptyState, formatImage } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import CountUp from "@/components/ui/CountUp";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  formatDate,
  formatNumber,
  getInitials,
  formatRupiah,
} from "@/lib/format";

/* ---------------------- SKELETON ---------------------- */
function SalesSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-44 rounded-card" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-14 rounded-card" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[88px] rounded-card" />
      ))}
    </div>
  );
}

/* ---------------------- HELPERS ---------------------- */

function paymentLabel(method: string | null): string {
  if (!method) return "—";
  return PAYMENT_METHOD_LABEL[method] ?? method;
}

const selectClass =
  "rounded-xl border border-gray-200 bg-white px-2.5 py-2.5 text-sm text-gray-800 focus:border-primary focus:outline-none";

/* ---------------------- PAGE ---------------------- */
export default function PetaniSales() {
  const user = getClientUser();

  const { data: orders, loading } = useFetch(
    () =>
      user ? getFarmerOrders(user.id) : Promise.resolve([] as FarmerOrder[]),
    [user?.id],
  );

  const { data: dashboard } = useFetch(
    () => (user ? getFarmerDashboard(user.id) : Promise.resolve(null)),
    [user?.id],
  );

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  // Hanya transaksi yang sudah dibayar yang dihitung sebagai penjualan.
  const paidOrders = useMemo(
    () => (orders ?? []).filter((o) => o.paymentStatus === "paid"),
    [orders],
  );

  const totals = useMemo(() => {
    const revenue = paidOrders.reduce((acc, o) => acc + Number(o.totalPrice), 0);
    const fee = paidOrders.reduce((acc, o) => acc + Number(o.serviceFee), 0);
    return {
      revenue,
      fee,
      net: revenue - fee,
      count: paidOrders.length,
      items: paidOrders.reduce((acc, o) => acc + Number(o.quantity), 0),
      avg: paidOrders.length > 0 ? revenue / paidOrders.length : 0,
    };
  }, [paidOrders]);

  const filtered = useMemo(() => {
    let list = [...paidOrders];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(q) ||
          o.buyerName.toLowerCase().includes(q) ||
          o.commodityName.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);

    list.sort((a, b) => {
      if (sort === "highest") return Number(b.totalPrice) - Number(a.totalPrice);
      if (sort === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [paidOrders, query, statusFilter, sort]);

  // Kelompokkan per bulan untuk riwayat yang lebih mudah dipindai.
  const grouped = useMemo(() => {
    const map = new Map<string, FarmerOrder[]>();
    for (const o of filtered) {
      const key = new Date(o.createdAt).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      const arr = map.get(key) ?? [];
      arr.push(o);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (loading) return <SalesSkeleton />;

  const stats = dashboard?.stats;
  const upTrend = (stats?.percentChange ?? 0) >= 0;

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6 lg:p-0">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wallet size={22} strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Riwayat Penjualan
            </h1>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              Rekap pendapatan dan transaksi yang sudah dibayar pembeli.
            </p>
          </div>
        </div>
      </header>

      {/* Hero revenue */}
      <section className="relative mb-4 overflow-hidden rounded-card bg-gradient-to-br from-primary to-primary-dark p-6 shadow-lift sm:p-8">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/5"
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/70">Total Pendapatan</p>
              <CountUp
                value={totals.revenue}
                prefix="Rp "
                className="mt-1 block text-3xl font-black tracking-tight text-white sm:text-4xl"
              />
              <p className="mt-1.5 text-xs text-white/60">
                Bersih{" "}
                <span className="font-semibold text-white/90">
                  {formatRupiah(totals.net)}
                </span>{" "}
                · Fee platform {formatRupiah(totals.fee)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-white/60">
                Bulan Ini
              </p>
              <p className="text-lg font-extrabold text-white">
                {formatRupiah(stats?.revenueThisMonth ?? 0)}
              </p>
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  upTrend ? "bg-emerald-300/20 text-emerald-100" : "bg-red-300/20 text-red-100"
                }`}
              >
                {upTrend ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {Math.abs(stats?.percentChange ?? 0)}% vs bulan lalu
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Mini stats */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
          <p className="text-xs text-gray-500">Transaksi Lunas</p>
          <p className="mt-0.5 text-xl font-black text-gray-900">{totals.count}</p>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <ShoppingBag size={12} /> Komoditas Terjual
          </p>
          <p className="mt-0.5 text-xl font-black text-gray-900">
            {formatNumber(totals.items)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
          <p className="text-xs text-gray-500">Rata-rata / Transaksi</p>
          <p className="mt-0.5 text-base font-black text-gray-900">
            {formatRupiah(totals.avg)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
          <p className="text-xs text-gray-500">Selesai Bulan Ini</p>
          <p className="mt-0.5 text-xl font-black text-gray-900">
            {stats?.completedOrdersThisMonth ?? 0}
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="mb-5 rounded-card border border-gray-200/80 bg-white p-3 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kode pesanan, pembeli, atau komoditas..."
              aria-label="Cari penjualan"
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter status"
              className={`${selectClass} flex-1 sm:flex-none`}
            >
              <option value="all">Semua Status</option>
              {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Urutkan"
              className={`${selectClass} flex-1 sm:flex-none`}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="highest">Nilai Tertinggi</option>
            </select>
          </div>
        </div>
        {filtered.length !== totals.count && (
          <p className="mt-2 px-1 text-xs text-gray-400">
            Menampilkan {filtered.length} dari {totals.count} transaksi lunas
          </p>
        )}
      </section>

      {/* List per bulan */}
      {filtered.length === 0 ? (
        <EmptyState
          title={totals.count === 0 ? "Belum Ada Penjualan" : "Tidak Ditemukan"}
          message={
            totals.count === 0
              ? "Transaksi yang sudah dibayar akan tampil di sini beserta rekap pendapatannya."
              : "Coba ubah kata kunci atau filter pencarian Anda."
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([month, list]) => {
            const monthTotal = list.reduce(
              (acc, o) => acc + Number(o.totalPrice),
              0,
            );
            return (
              <section key={month}>
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {month}
                  </h2>
                  <p className="text-xs font-semibold text-gray-500">
                    {formatRupiah(monthTotal)}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {list.map((o, i) => {
                    const img = formatImage(o.commodityImage);
                    return (
                      <article
                        key={o.id}
                        className="group rounded-card border border-gray-200/80 bg-white p-4 shadow-soft transition-all duration-300 ease-smooth animate-fade-up hover:-translate-y-0.5 hover:shadow-lift"
                        style={{
                          animationDelay: `${Math.min(i * 50, 300)}ms`,
                          animationFillMode: "backwards",
                        }}
                      >
                        <div className="flex gap-3.5">
                          {/* Thumbnail */}
                          <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            {img ? (
                              <Image
                                src={img}
                                alt={o.commodityName}
                                fill
                                sizes="52px"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-lg font-black text-white">
                                {o.commodityName?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-[15px] font-semibold text-gray-900">
                                  {o.commodityName}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-gray-500">
                                  {getInitials(o.buyerName)} · {o.buyerName}
                                  <span className="mx-1.5 text-gray-300">|</span>
                                  <span className="font-medium text-gray-400">
                                    {o.orderCode}
                                  </span>
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="font-extrabold text-primary">
                                  {formatRupiah(o.totalPrice)}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  Net {formatRupiah(Number(o.totalPrice) - Number(o.serviceFee))}
                                </p>
                              </div>
                            </div>

                            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                {formatDate(o.createdAt)}
                              </span>
                              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                {paymentLabel(o.paymentMethod)}
                              </span>
                              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                {formatNumber(o.quantity)} × {formatRupiah(o.unitPrice)}
                              </span>
                              <span className="ml-auto">
                                <StatusBadge status={o.status} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
