"use client";

import { useState, useCallback } from "react";
import { Pencil, Trash2, MapPin, Plus } from "lucide-react";
import {
  getFarmerCommodities,
  deleteCommodity,
} from "@/actions/commodity";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { formatRupiah } from "@/lib/format";
import { LoadingState, EmptyState } from "@/components/shared/States";
import CommodityFormPopup from "@/components/petanipage/CommodityFormPopup";
import DeleteConfirmDialog from "@/components/petanipage/DeleteConfirmDialog";
import type { FarmerCommodity } from "@/lib/types/market";

export default function CommoditiesPage() {
  const user = getClientUser();
  const [showForm, setShowForm] = useState(false);
  const [editingCommodity, setEditingCommodity] = useState<FarmerCommodity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FarmerCommodity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCommodities = useCallback(
    async () => (user ? getFarmerCommodities(user.id) : []),
    [user?.id],
  );

  const { data: commodities, loading, reload } = useFetch(fetchCommodities, [user?.id]);

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

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111111] mb-1">
          Komoditas Pertanian
        </h1>
        <p className="text-sm text-gray-500">
          {commodityList.length > 0
            ? `Kamu sudah mempunyai ${commodityList.length} Komoditas`
            : "Mulai tambahkan komoditas Anda."}
        </p>
      </div>

      <button
        onClick={handleAdd}
        className="inline-flex items-center gap-2 bg-[#025246] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#013e34] transition mb-6"
      >
        <Plus size={16} />
        Tambah Komoditas
      </button>

      {commodityList.length === 0 ? (
        <EmptyState
          title="Belum Ada Komoditas"
          message="Mulai tambahkan komoditas Anda untuk dijual di marketplace."
        >
          <button
            onClick={handleAdd}
            className="mt-4 inline-flex items-center gap-2 bg-[#025246] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#013e34] transition"
          >
            <Plus size={16} />
            Tambah Komoditas
          </button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {commodityList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[10px] shadow-sm border border-gray-100 flex flex-col overflow-hidden"
            >
              <div className="w-full h-44 bg-gray-100 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Tidak ada gambar
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 p-4">
                <h3 className="font-semibold text-[#111111] text-sm mb-1 truncate">
                  {item.name}
                </h3>

                <p className="text-[#025246] font-bold text-sm mb-2">
                  {formatRupiah(item.price)} / {item.unit}
                </p>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {item.description || "Tidak ada deskripsi"}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.categoryName && (
                    <span className="inline-block px-2 py-0.5 bg-[#DCF2E3] text-[#025246] text-[10px] font-medium rounded">
                      {item.categoryName}
                    </span>
                  )}
                  {item.quality && (
                    <span className="inline-block px-2 py-0.5 bg-[#F2E0DC] text-[#8B5E3C] text-[10px] font-medium rounded">
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
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-[#025246] font-medium hover:bg-gray-50 rounded transition-colors"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-red-500 font-medium hover:bg-red-50 rounded transition-colors"
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
