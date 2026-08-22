"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Pencil, Trash2, MapPin, Plus } from "lucide-react";
import {
  getFarmerCommodities,
  deleteCommodity,
} from "@/actions/commodity";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { formatRupiah } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import CommodityFormPopup from "@/components/petanipage/CommodityFormPopup";
import DeleteConfirmDialog from "@/components/petanipage/DeleteConfirmDialog";
import StatusBadge from "@/components/shared/StatusBadge";
import type { FarmerCommodity } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

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

  const fetchCommodities = useCallback(
    async () => (userId ? getFarmerCommodities(userId) : []),
    [userId],
  );

  const { data: commodities, loading, reload } = useFetch(fetchCommodities, [userId]);

  const commodityList = (commodities ?? []) as FarmerCommodity[];

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
        setDeleteTarget(null);
        reload();
      }
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) return <CommoditiesSkeleton />;

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Komoditas Pertanian
          </h1>
          <p className="text-sm text-gray-500">
            {commodityList.length > 0
              ? `Kamu sudah mempunyai ${commodityList.length} Komoditas`
              : "Mulai tambahkan komoditas Anda."}
          </p>
        </div>
        {commodityList.length > 0 && (
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary-dark active:scale-95 transition-all duration-200 shadow-md hover:shadow-lift"
          >
            <Plus size={16} />
            Tambah Komoditas
          </button>
        )}
      </div>

      {commodityList.length === 0 ? (
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
