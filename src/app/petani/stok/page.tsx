"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Package, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getFarmerCommodities, updateStock } from "@/actions/commodity";
import type { FarmerCommodity } from "@/lib/types/market";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { formatNumber, formatRupiah } from "@/lib/format";
import { LOW_STOCK_THRESHOLD } from "@/constants/commodities";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  EmptyState,
  ErrorState,
  formatImage,
} from "@/components/shared/States";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

type StockFilter = "all" | "aman" | "menipis" | "habis";

function stockState(
  item: FarmerCommodity,
): Exclude<StockFilter, "all"> {
  const stock = Number(item.stock);

  if (stock <= 0) return "habis";
  if (stock <= LOW_STOCK_THRESHOLD) return "menipis";

  return "aman";
}

/* ---------------------- SKELETON ---------------------- */

function StokSkeleton() {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:px-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-xl" />
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />

        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-gray-100 py-4"
          >
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>

            <Skeleton className="hidden h-8 w-24 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

const FILTERS: {
  value: StockFilter;
  label: string;
  countKey?: "menipis" | "habis";
}[] = [
    { value: "all", label: "Semua" },
    { value: "aman", label: "Aman" },
    { value: "menipis", label: "Menipis", countKey: "menipis" },
    { value: "habis", label: "Habis", countKey: "habis" },
  ];

/* ---------------------- PAGE ---------------------- */

export default function StokPage() {
  const user = getClientUser();

  const { data, loading, error, reload } = useFetch(
    () =>
      user
        ? getFarmerCommodities(user.id)
        : Promise.resolve([] as FarmerCommodity[]),
    [user?.id],
  );

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [editTarget, setEditTarget] =
    useState<FarmerCommodity | null>(null);
  const [newStock, setNewStock] = useState("");
  const [saving, setSaving] = useState(false);

  const commodities = useMemo(() => data ?? [], [data]);

  const counts = useMemo(() => {
    let aman = 0;
    let menipis = 0;
    let habis = 0;

    for (const item of commodities) {
      const state = stockState(item);

      if (state === "aman") aman++;
      else if (state === "menipis") menipis++;
      else habis++;
    }

    return {
      total: commodities.length,
      aman,
      menipis,
      habis,
    };
  }, [commodities]);

  const filtered = useMemo(() => {
    let list = [...commodities];

    if (filter !== "all") {
      list = list.filter(
        (item) => stockState(item) === filter,
      );
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();

      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.categoryName ?? "").toLowerCase().includes(q),
      );
    }

    // Stok paling kritis tampil lebih dulu.
    return list.sort(
      (a, b) => Number(a.stock) - Number(b.stock),
    );
  }, [commodities, filter, query]);

  const openEdit = (item: FarmerCommodity) => {
    setEditTarget(item);
    setNewStock(String(Number(item.stock)));
  };

  const submitStock = async () => {
    if (!user || !editTarget) return;

    const value = Number(newStock);

    if (!Number.isFinite(value) || value < 0) {
      toast.error("Masukkan jumlah stok yang valid.");
      return;
    }

    setSaving(true);

    try {
      const res = await updateStock(
        editTarget.id,
        user.id,
        value,
      );

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success("Stok berhasil diperbarui");
      setEditTarget(null);
      reload();
    } catch {
      toast.error(
        "Gagal memperbarui stok. Silakan coba lagi.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <StokSkeleton />;
  }

  return (
    <div className="w-full animate-fade-up px-4 py-5 sm:px-6 lg:px-8">
      <PageHeader
        icon={Package}
        title="Stok Komoditas"
        subtitle="Pantau dan perbarui ketersediaan hasil panen Anda."
      />

      {/* RINGKASAN */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill
          label="Total Komoditas"
          value={counts.total}
        />

        <StatPill
          label="Stok Aman"
          value={counts.aman}
          tone="success"
          icon={CheckCircle2}
        />

        <StatPill
          label={`Menipis (≤ ${LOW_STOCK_THRESHOLD})`}
          value={counts.menipis}
          tone="warning"
          icon={AlertTriangle}
        />

        <StatPill
          label="Stok Habis"
          value={counts.habis}
          tone="danger"
        />
      </section>

      {/* SEARCH + FILTER */}
      <section className="mb-5 border-b border-gray-200 pb-4">
        <div className="relative max-w-xl">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari komoditas atau kategori..."
            aria-label="Cari komoditas"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div
          role="group"
          aria-label="Filter status stok"
          className="mt-3 flex gap-1.5 overflow-x-auto"
        >
          {FILTERS.map((f) => {
            const isActive = filter === f.value;
            const count = f.countKey
              ? counts[f.countKey]
              : undefined;

            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={isActive}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isActive
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
              >
                {f.label}

                {typeof count === "number" &&
                  count > 0 &&
                  ` (${count})`}
              </button>
            );
          })}
        </div>
      </section>

      {/* LIST */}
      {error ? (
        <ErrorState onRetry={() => reload()} />
      ) : commodities.length === 0 ? (
        <EmptyState
          title="Belum Ada Komoditas"
          message="Tambahkan komoditas terlebih dahulu untuk mengelola stok di sini."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ditemukan"
          message="Coba ubah kata kunci atau filter status stok."
        />
      ) : (
        <section>
          {/* HEADER DESKTOP */}
          <div className="hidden border-b border-gray-200 px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:grid sm:grid-cols-[minmax(0,1fr)_150px_180px_130px] sm:items-center sm:gap-5">
            <span>Komoditas</span>
            <span>Stok</span>
            <span>Harga</span>
            <span className="text-right">Aksi</span>
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.map((item, i) => {
              const state = stockState(item);
              const img = formatImage(item.image);

              return (
                <article
                  key={item.id}
                  className="group py-4 transition-colors hover:bg-gray-50/70"
                  style={{
                    animationDelay: `${Math.min(i * 30, 180)}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_150px_180px_130px] sm:gap-5">
                    {/* IDENTITY */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {img ? (
                          <Image
                            src={img}
                            alt={item.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-base font-black text-white">
                            {item.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {item.name}
                          </p>

                          <StatusBadge
                            status={item.status}
                          />
                        </div>

                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {item.categoryName ??
                            "Tanpa kategori"}
                        </p>
                      </div>
                    </div>

                    {/* STOCK */}
                    <div className="sm:text-left">
                      <p
                        className={`text-sm font-bold ${state === "habis"
                          ? "text-danger"
                          : state === "menipis"
                            ? "text-warning"
                            : "text-gray-900"
                          }`}
                      >
                        {formatNumber(item.stock)}{" "}
                        <span className="font-medium text-gray-400">
                          {item.unit}
                        </span>
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {state === "habis"
                          ? "Stok habis"
                          : state === "menipis"
                            ? "Stok menipis"
                            : "Stok aman"}
                      </p>
                    </div>

                    {/* PRICE */}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatRupiah(item.price)}
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        per {item.unit}
                      </p>
                    </div>

                    {/* ACTION */}
                    <div className="flex sm:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(item)}
                      >
                        Perbarui Stok
                      </Button>
                    </div>
                  </div>

                  {/* MOBILE EXTRA INFO */}
                  <div className="mt-3 flex items-center justify-between sm:hidden">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {state === "menipis" && (
                        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
                          Stok Menipis
                        </span>
                      )}

                      {state === "habis" &&
                        item.status !== "sold_out" && (
                          <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger">
                            Stok Habis
                          </span>
                        )}
                    </div>

                    <span className="text-xs text-gray-400">
                      {formatRupiah(item.price)}/{item.unit}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* LIST FOOTER */}
          <div className="border-t border-gray-200 py-3 text-xs text-gray-400">
            Menampilkan{" "}
            <span className="font-semibold text-gray-700">
              {filtered.length}
            </span>{" "}
            komoditas
          </div>
        </section>
      )}

      {/* MODAL UPDATE STOCK */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Perbarui Stok"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Perbarui stok untuk{" "}
            <span className="font-bold text-gray-800">
              {editTarget?.name}
            </span>
            .
          </p>

          <div>
            <label
              htmlFor="stock-input"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Jumlah Stok ({editTarget?.unit ?? "kg"})
            </label>

            <input
              id="stock-input"
              type="number"
              min="0"
              step="any"
              required
              value={newStock}
              onChange={(e) =>
                setNewStock(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submitStock();
                }
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />

            <p className="mt-1.5 text-xs text-gray-400">
              Isi 0 jika stok sedang tidak tersedia.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTarget(null)}
            >
              Batal
            </Button>

            <Button
              size="sm"
              loading={saving}
              onClick={submitStock}
            >
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ---------------------- STAT ---------------------- */

function StatPill({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning" | "danger";
  icon?: typeof CheckCircle2;
}) {
  const valueColor =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : "text-gray-900";

  return (
    <div className="border-b border-gray-200 px-1 py-3 sm:px-2">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-gray-500">
          {label}
        </p>

        {Icon && (
          <Icon
            size={15}
            className={valueColor}
          />
        )}
      </div>

      <p
        className={`mt-1 text-xl font-black ${valueColor}`}
      >
        {value}
      </p>
    </div>
  );
}