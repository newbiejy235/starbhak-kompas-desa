"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { getFarmerBuyers } from "@/actions/buyer";
import type { FarmerBuyerRow } from "@/lib/types/market";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatNumber, formatRupiah, getInitials } from "@/lib/format";


/* ---------------------- SKELETON ---------------------- */
function BuyerSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-14 rounded-card" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-[104px] rounded-card" />
        <Skeleton className="h-[104px] rounded-card" />
        <Skeleton className="h-[104px] rounded-card" />
        <Skeleton className="h-[104px] rounded-card" />
      </div>
    </div>
  );
}

/* ---------------------- PAGE ---------------------- */
export default function PembeliPage() {
  const user = getClientUser();

  const {
    data: buyers,
    loading,
    error,
    reload,
  } = useFetch(() =>
    user ? getFarmerBuyers(user.id) : Promise.resolve([] as FarmerBuyerRow[]),
    [user?.id],
  );

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const list = [...(buyers ?? [])];
    if (query.trim()) {
      const q = query.toLowerCase();
      return list.filter((b) => b.buyerName.toLowerCase().includes(q));
    }
    // Pembeli paling aktif di atas.
    return list.sort((a, b) => b.totalOrders - a.totalOrders);
  }, [buyers, query]);

  if (loading) return <BuyerSkeleton />;

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6 lg:p-0">
      <PageHeader
        icon={Users}
        title="Pembeli"
        subtitle="Kelola dan lihat riwayat pembeli Anda."
      />

      {/* Pencarian */}
      <section className="mb-5 rounded-card border border-gray-200/80 bg-white p-3 shadow-soft">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama pembeli..."
            aria-label="Cari pembeli"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
          />
        </div>
        {(buyers ?? []).length > 0 && (
          <p className="mt-2 px-1 text-xs text-gray-400">
            {(buyers ?? []).length} pembeli pernah bertransaksi dengan Anda
          </p>
        )}
      </section>

      {error ? (
        <ErrorState onRetry={() => reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={(buyers ?? []).length === 0 ? "Belum Ada Pembeli" : "Tidak Ditemukan"}
          message={
            (buyers ?? []).length === 0
              ? "Pembeli yang pernah memesan produk Anda akan otomatis tampil di sini."
              : "Coba ubah kata kunci pencarian Anda."
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((b, i) => (
            <article
              key={b.buyerId}
              className="flex items-start gap-3.5 rounded-card border border-gray-200/80 bg-white p-4 shadow-soft transition-all duration-300 ease-smooth animate-fade-up hover:-translate-y-0.5 hover:shadow-lift"
              style={{
                animationDelay: `${Math.min(i * 40, 240)}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-black text-white">
                {getInitials(b.buyerName)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-[15px] font-semibold text-gray-900">
                    {b.buyerName}
                  </p>
                  <StatusBadge status={b.accountStatus} />
                </div>

                <dl className="mt-2 grid grid-cols-3 gap-x-2 gap-y-1 text-xs">
                  <div>
                    <dt className="text-gray-400">Pesanan</dt>
                    <dd className="font-bold text-gray-900">
                      {formatNumber(b.totalOrders)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Total Belanja</dt>
                    <dd className="font-bold text-primary">
                      {formatRupiah(b.totalPurchase)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Pesanan Terakhir</dt>
                    <dd className="font-medium text-gray-600">
                      {formatDate(b.lastOrderAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
