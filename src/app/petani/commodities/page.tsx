"use client";

import { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  MapPin,
  Plus,
  Package,
  Search,
  MoreHorizontal,
  Sprout,
  TrendingUp,
  AlertTriangle,
  X,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import {
  getFarmerCommodities,
  deleteCommodity,
} from "@/actions/commodity";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { formatRupiah, formatNumber } from "@/lib/format";
import { LOW_STOCK_THRESHOLD } from "@/constants/commodities";
import { EmptyState } from "@/components/shared/States";
import CommodityFormPopup from "@/components/petanipage/CommodityFormPopup";
import DeleteConfirmDialog from "@/components/petanipage/DeleteConfirmDialog";
import StatusBadge from "@/components/shared/StatusBadge";
import type { FarmerCommodity } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

const STATUS_FILTERS = [
  { value: "all", label: "Semua Status" },
  { value: "available", label: "Tersedia" },
  { value: "verified", label: "Terverifikasi" },
  { value: "pending", label: "Menunggu Verifikasi" },
  { value: "sold_out", label: "Habis" },
  { value: "rejected", label: "Ditolak" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "name", label: "Nama A-Z" },
  { value: "price_desc", label: "Harga Tertinggi" },
  { value: "price_asc", label: "Harga Terendah" },
  { value: "stock_asc", label: "Stok Tersedikit" },
] as const;

const controlCls =
  "rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors duration-200";

function CommoditiesSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-card border border-gray-200/80 bg-white p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-gray-200/80 bg-white p-3 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-card border border-gray-200/80 overflow-hidden shadow-soft">
            <Skeleton className="h-40 rounded-none" />
            <div className="p-4 space-y-2.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-card border border-gray-200/80 bg-white p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            danger
              ? "bg-danger/10 text-danger"
              : accent
                ? "bg-primary/10 text-primary"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 truncate">{label}</p>
          <p
            className={`text-xl font-black tracking-tight ${
              danger
                ? "text-danger"
                : accent
                  ? "text-primary"
                  : "text-gray-900"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function CommodityCard({
  item,
  index,
  onEdit,
  onDelete,
}: {
  item: FarmerCommodity;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const stock = Number(item.stock);
  const lowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  const outOfStock = stock <= 0;

  return (
    <div
      className="group bg-white rounded-card shadow-soft border border-gray-200/80 flex flex-col overflow-hidden hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300 ease-smooth animate-fade-up"
      style={{
        animationDelay: `${Math.min(index * 50, 300)}ms`,
        animationFillMode: "backwards",
      }}
    >
      <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
        {(item.image ?? item.images?.[0]) ? (
          <Image
            src={item.image ?? item.images?.[0] ?? ""}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-smooth"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1.5">
            <Package size={28} strokeWidth={1.5} />
            <span className="text-[11px] font-medium">Tidak ada gambar</span>
          </div>
        )}

        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={item.status} />
        </div>

        <div className="absolute top-2.5 left-2.5">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm text-gray-600 shadow-sm hover:bg-white hover:text-gray-900 active:scale-90 transition-all duration-200"
              aria-label="Aksi komoditas"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1 z-20 w-36 bg-white rounded-xl border border-gray-200 shadow-lift py-1 animate-scale-in origin-top-left">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="mb-1.5">
          <h3 className="font-semibold text-gray-900 text-[15px] leading-snug truncate">
            {item.name}
          </h3>
          {item.categoryName && (
            <p className="text-xs text-gray-500 mt-0.5">{item.categoryName}</p>
          )}
        </div>

        <div className="flex items-baseline gap-1 mb-2.5">
          <span className="text-primary font-bold text-base">
            {formatRupiah(item.price)}
          </span>
          <span className="text-gray-400 text-xs">/ {item.unit}</span>
        </div>

        <div className="flex items-center gap-3 mb-2.5">
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              outOfStock
                ? "text-danger"
                : lowStock
                  ? "text-warning"
                  : "text-gray-600"
            }`}
          >
            <Package size={12} className="shrink-0" />
            {outOfStock
              ? "Stok habis"
              : `${formatNumber(stock)} ${item.unit}`}
            {lowStock && !outOfStock && (
              <span className="text-warning ml-0.5">· Menipis</span>
            )}
          </div>
        </div>

        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2.5 leading-relaxed">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {item.quality && (
            <span className="inline-flex items-center px-2 py-0.5 bg-[#F2E0DC] text-[#8B5E3C] text-[10px] font-semibold rounded-full">
              {item.quality}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-auto pt-2 border-t border-gray-100">
          <MapPin size={11} className="shrink-0 text-gray-400" />
          <span className="truncate">{item.location}</span>
        </div>
      </div>
    </div>
  );
}

export default function CommoditiesPage() {
  const user = getClientUser();
  const userId = user?.id;
  const [showForm, setShowForm] = useState(false);
  const [editingCommodity, setEditingCommodity] = useState<FarmerCommodity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FarmerCommodity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const fetchCommodities = useCallback(
    async () => (userId ? getFarmerCommodities(userId) : []),
    [userId],
  );

  const { data: commodities, loading, reload } = useFetch(fetchCommodities, [userId]);

  const allCommodities = useMemo(
    () => (commodities ?? []) as FarmerCommodity[],
    [commodities],
  );

  const stats = useMemo(() => {
    const total = allCommodities.length;
    const active = allCommodities.filter(
      (c) => c.status === "available" || c.status === "verified",
    ).length;
    const totalStock = allCommodities.reduce(
      (sum, c) => sum + Number(c.stock),
      0,
    );
    const outOfStock = allCommodities.filter(
      (c) => Number(c.stock) <= 0,
    ).length;
    return { total, active, totalStock, outOfStock };
  }, [allCommodities]);

  const commodityList = useMemo(() => {
    let list = [...allCommodities];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.categoryName ?? "").toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }
    switch (sort) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name, "id"));
        break;
      case "price_desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "price_asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "stock_asc":
        list.sort((a, b) => Number(a.stock) - Number(b.stock));
        break;
      default:
        break;
    }
    return list;
  }, [allCommodities, query, statusFilter, sort]);

  const hasActiveFilters = query.trim() || statusFilter !== "all";

  function handleAdd() {
    setEditingCommodity(null);
    setShowForm(true);
  }

  function handleEdit(item: FarmerCommodity) {
    setEditingCommodity(item);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingCommodity(null);
  }

  function handleFormSuccess() {
    reload();
  }

  function handleDeleteClick(item: FarmerCommodity) {
    setDeleteTarget(item);
  }

  async function handleDeleteConfirm() {
    if (!user || !deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteCommodity(deleteTarget.id, user.id);
      if (res.success) {
        toast.success("Komoditas berhasil dihapus");
        setDeleteTarget(null);
        reload();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
  }

  if (loading) return <CommoditiesSkeleton />;

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sprout size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Komoditas Saya
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Kelola produk pertanian, harga, stok, dan ketersediaan dalam satu
              tempat.
            </p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary-dark active:scale-95 transition-all duration-200 shadow-md hover:shadow-lift"
        >
          <Plus size={16} />
          Tambah Komoditas
        </button>
      </div>

      {allCommodities.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Package}
            label="Total Komoditas"
            value={stats.total}
          />
          <StatCard
            icon={Sprout}
            label="Aktif"
            value={stats.active}
            accent
          />
          <StatCard
            icon={TrendingUp}
            label="Total Stok"
            value={`${formatNumber(stats.totalStock)}`}
          />
          <StatCard
            icon={AlertTriangle}
            label="Stok Habis"
            value={stats.outOfStock}
            danger={stats.outOfStock > 0}
          />
        </div>
      )}

      {allCommodities.length > 0 && (
        <section
          aria-label="Pencarian dan filter komoditas"
          className="mb-5 rounded-card border border-gray-200/80 bg-white p-3 shadow-soft"
        >
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
                placeholder="Cari nama komoditas atau kategori..."
                aria-label="Cari komoditas"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors duration-200"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Filter
                  size={13}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter status komoditas"
                  className={`${controlCls} w-full cursor-pointer pl-8 pr-8 sm:w-auto appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat`}
                >
                  {STATUS_FILTERS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1 sm:flex-none">
                <ArrowUpDown
                  size={13}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Urutkan komoditas"
                  className={`${controlCls} w-full cursor-pointer pl-8 pr-8 sm:w-auto appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat`}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-2.5 flex items-center justify-between px-1">
              <p className="text-xs text-gray-400">
                Menampilkan {commodityList.length} dari {allCommodities.length}{" "}
                komoditas
              </p>
              <button
                onClick={clearFilters}
                className="text-xs text-primary font-medium hover:text-primary-dark active:scale-95 transition-all"
              >
                Reset filter
              </button>
            </div>
          )}
        </section>
      )}

      {allCommodities.length === 0 ? (
        <EmptyState
          title="Belum Ada Komoditas"
          message="Tambahkan produk pertanian pertama Anda untuk mulai menawarkannya kepada pembeli di marketplace."
        >
          <button
            onClick={handleAdd}
            className="mt-4 inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary-dark active:scale-95 transition-all duration-200 shadow-md"
          >
            <Plus size={16} />
            Tambah Komoditas
          </button>
        </EmptyState>
      ) : commodityList.length === 0 ? (
        <div className="bg-white rounded-card border border-gray-200 border-dashed shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center w-full">
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Tidak Ditemukan
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mb-4">
            Tidak ada komoditas yang cocok dengan pencarian atau filter Anda.
            Coba ubah kata kunci atau filter yang digunakan.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark active:scale-95 transition-all"
          >
            <X size={14} />
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {commodityList.map((item, i) => (
            <CommodityCard
              key={item.id}
              item={item}
              index={i}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDeleteClick(item)}
            />
          ))}
        </div>
      )}

      <CommodityFormPopup
        open={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        commodity={editingCommodity}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        commodityName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isPending={isDeleting}
      />
    </div>
  );
}
