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

function CommoditiesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-card border border-gray-200/80 overflow-hidden">
          <Skeleton className="h-44 rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        </div>
      ))}
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
        // Terbaru — data dari backend sudah diurutkan berdasarkan tanggal.
        break;
    }
    return list;
  }, [allCommodities, query, statusFilter, sort]);

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

  if (loading) return <CommoditiesSkeleton />;

  const controlCls =
    "rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-primary focus:outline-none";

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Komoditas Pertanian
          </h1>
          <p className="text-sm text-gray-500">
            {allCommodities.length > 0
              ? `Kamu sudah mempunyai ${allCommodities.length} Komoditas`
              : "Mulai tambahkan komoditas Anda."}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary-dark active:scale-95 transition-all duration-200 shadow-md hover:shadow-lift"
        >
          <Plus size={16} />
          Tambah Komoditas
        </button>
      </div>

      {/* Pencarian & filter — hanya tampil saat ada data */}
      {allCommodities.length > 3 && (
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
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter status komoditas"
                className={`${controlCls} flex-1 cursor-pointer sm:flex-none`}
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Urutkan komoditas"
                className={`${controlCls} flex-1 cursor-pointer sm:flex-none`}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(commodityList.length !== allCommodities.length ||
            query.trim() ||
            statusFilter !== "all") && (
            <p className="mt-2 px-1 text-xs text-gray-400">
              Menampilkan {commodityList.length} dari {allCommodities.length}{" "}
              komoditas
            </p>
          )}
        </section>
      )}

      {allCommodities.length === 0 ? (
        <EmptyState
          title="Belum Ada Komoditas"
          message="Mulai tambahkan komoditas Anda untuk dijual di marketplace."
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
        <EmptyState
          title="Tidak Ditemukan"
          message="Coba ubah kata kunci atau filter pencarian Anda."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {commodityList.map((item, i) => (
            <div
              key={item.id}
              className="bg-white rounded-card shadow-soft border border-gray-200/80 flex flex-col overflow-hidden hover:shadow-lift hover:-translate-y-1 transition-all duration-300 ease-smooth animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 60, 480)}ms`, animationFillMode: "backwards" }}
            >
              <div className="w-full h-44 bg-gray-100 overflow-hidden relative group">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-smooth"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Tidak ada gambar
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {item.name}
                  </h3>
                  <StatusBadge status={item.status} />
                </div>

                <p className="text-primary font-bold text-sm mb-2">
                  {formatRupiah(item.price)} / {item.unit}
                </p>

                {/* Stok: beri peringatan halus saat menipis */}
                {(() => {
                  const stock = Number(item.stock);
                  const lowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
                  return (
                    <p
                      className={`mb-3 flex items-center gap-1 text-xs ${
                        lowStock
                          ? "font-medium text-warning"
                          : "text-gray-500"
                      }`}
                    >
                      <Package size={12} className="shrink-0" />
                      {stock <= 0
                        ? "Stok habis"
                        : `Stok ${formatNumber(stock)} ${item.unit}${lowStock ? " — stok menipis" : ""}`}
                    </p>
                  );
                })()}

                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {item.description || "Tidak ada deskripsi"}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.categoryName && (
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-full">
                      {item.categoryName}
                    </span>
                  )}
                  {item.quality && (
                    <span className="inline-block px-2 py-0.5 bg-[#F2E0DC] text-[#8B5E3C] text-[10px] font-medium rounded-full">
                      {item.quality}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-3">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-primary font-medium hover:bg-primary/5 active:scale-95 rounded-lg transition-all"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-danger font-medium hover:bg-danger/10 active:scale-95 rounded-lg transition-all"
                  >
                    <Trash2 size={13} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
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
