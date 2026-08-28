"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Package, Search } from "lucide-react";
import { getFarmerCommodities, updateStock } from "@/actions/commodity";
import type { FarmerCommodity } from "@/lib/types/market";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { formatNumber, formatRupiah } from "@/lib/format";
import { LOW_STOCK_THRESHOLD } from "@/constants/commodities";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { EmptyState, ErrorState, formatImage } from "@/components/shared/States";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

type StockFilter = "all" | "aman" | "menipis" | "habis";

function stockState(item: FarmerCommodity): Exclude<StockFilter, "all"> {
  const stock = Number(item.stock);
  if (stock <= 0) return "habis";
  if (stock <= LOW_STOCK_THRESHOLD) return "menipis";
  return "aman";
}

/* ---------------------- SKELETON ---------------------- */
function StokSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-8 w-52" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-14 rounded-card" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[76px] rounded-card" />
      ))}
    </div>
  );
}

const FILTERS: { value: StockFilter; label: string; countKey?: "menipis" | "habis" }[] = [
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
  const [editTarget, setEditTarget] = useState<FarmerCommodity | null>(null);
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
    return { total: commodities.length, aman, menipis, habis };
  }, [commodities]);

  // Stok paling kritis tampil lebih dulu agar mudah ditindaklanjuti.
  const filtered = useMemo(() => {
    let list = [...commodities];
    if (filter !== "all") {
      list = list.filter((item) => stockState(item) === filter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.categoryName ?? "").toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => Number(a.stock) - Number(b.stock));
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
      const res = await updateStock(editTarget.id, user.id, value);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success("Stok berhasil diperbarui");
      setEditTarget(null);
      reload();
    } catch {
      toast.error("Gagal memperbarui stok. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <StokSkeleton />;

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6 lg:p-0">
      <PageHeader
        icon={Package}
        title="Stok Komoditas"
        subtitle="Pantau dan perbarui ketersediaan hasil panen Anda."
      />

      {/* Ringkasan */}
      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill label="Total Komoditas" value={counts.total} />
        <StatPill label="Stok Aman" value={counts.aman} tone="success" />
        <StatPill label={`Menipis (\u2264 ${LOW_STOCK_THRESHOLD})`} value={counts.menipis} tone="warning" />
        <StatPill label="Habis" value={counts.habis} tone="danger" />
      </section>

      {/* Pencarian & filter */}
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
            placeholder="Cari komoditas atau kategori..."
            aria-label="Cari komoditas"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
          />
        </div>
        <div
          role="group"
          aria-label="Filter status stok"
          className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-0.5"
        >
          {FILTERS.map((f) => {
            const isActive = filter === f.value;
            const count = f.countKey ? counts[f.countKey] : undefined;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={isActive}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
                }`}
              >
                {f.label}
                {typeof count === "number" && count > 0 && ` (${count})`}
              </button>
            );
          })}
        </div>
      </section>

      {/* Daftar stok */}
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
        <div className="space-y-2.5">
          {filtered.map((item, i) => {
            const state = stockState(item);
            const img = formatImage(item.image) ?? formatImage(item.images?.[0] ?? null);
            return (
              <article
                key={item.id}
                className="flex flex-col gap-3 rounded-card border border-gray-200/80 bg-white p-4 shadow-soft transition-all duration-300 ease-smooth animate-fade-up hover:-translate-y-0.5 hover:shadow-lift sm:flex-row sm:items-center"
                style={{
                  animationDelay: `${Math.min(i * 40, 240)}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {img ? (
                      <Image
                        src={img}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-lg font-black text-white">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="truncate text-[15px] font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <StatusBadge status={item.status} />
                      {state === "menipis" && (
                        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
                          Stok Menipis
                        </span>
                      )}
                      {state === "habis" && item.status !== "sold_out" && (
                        <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger">
                          Stok Habis
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatNumber(item.stock)} {item.unit} tersisa ·{" "}
                      {formatRupiah(item.price)}/{item.unit}
                    </p>
                  </div>
                </div>

                <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                  Perbarui Stok
                </Button>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal perbarui stok */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Perbarui Stok"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Perbarui stok untuk{" "}
            <span className="font-bold text-gray-800">{editTarget?.name}</span>.
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
              onChange={(e) => setNewStock(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitStock()}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Isi 0 jika stok sedang tidak tersedia.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setEditTarget(null)}>
              Batal
            </Button>
            <Button size="sm" loading={saving} onClick={submitStock}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning" | "danger";
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
    <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-soft">
      <p className="truncate text-xs text-gray-500">{label}</p>
      <p className={`mt-0.5 text-xl font-black ${valueColor}`}>{value}</p>
    </div>
  );
}
