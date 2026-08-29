"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Loader2,
  Upload,
} from "lucide-react";
import {
  createCommodity,
  updateCommodity,
  getCategories,
} from "@/actions/commodity";
import { getClientUser } from "@/lib/auth/client";
import type { ActionState } from "@/lib/types/auth";
import type { FarmerCommodity, CategoryRow } from "@/lib/types/market";
import MediaUploadField, { type UploadedMedia } from "@/components/shared/MediaUploadField";

interface CommodityFormPopupProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  commodity?: FarmerCommodity | null;
}

export default function CommodityFormPopup({
  open,
  onClose,
  onSuccess,
  commodity,
}: CommodityFormPopupProps) {
  const user = getClientUser();
  const isEdit = !!commodity;

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [imageId, setImageId] = useState<number | "">(commodity?.imageId ?? "");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaItems, setMediaItems] = useState<UploadedMedia[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [isValidPhotos, setIsValidPhotos] = useState(false);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      getCategories().then(setCategories);
      setServerError(null);
      setMediaItems([]);
      setMediaUploading(false);
      setIsValidPhotos(false);
      if (commodity) {
        setImageId(commodity.imageId ?? "");
      } else {
        setImageId("");
      }
    });
    return () => cancelAnimationFrame(id);
  }, [open, commodity]);

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-white placeholder:text-gray-400 transition";

  const fmtDate = commodity?.harvestEstimate
    ? new Date(commodity.harvestEstimate).toISOString().slice(0, 10)
    : "";

  const handleMediaChange = useCallback((items: UploadedMedia[]) => {
    setMediaItems(items);
    const firstImage = items.find((i) => i.type === "image");
    setImageId(firstImage?.id ?? "");
  }, []);

  const handleMediaUploadStateChange = useCallback((state: boolean) => {
    setMediaUploading(state);
  }, []);

  const handleMediaValidationChange = useCallback((valid: boolean) => {
    setIsValidPhotos(valid);
  }, []);

  async function handleSubmit(formData: FormData) {
    if (!user) {
      setServerError("Silakan masuk terlebih dahulu");
      return;
    }
    setIsSubmitting(true);
    setServerError(null);
    try {
      let res: ActionState;
      if (isEdit && commodity) {
        res = await updateCommodity(commodity.id, user.id, formData);
      } else {
        res = await createCommodity(user.id, formData);
      }
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setServerError(res.message);
      }
    } catch {
      setServerError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in-fast"
        onClick={onClose}
        aria-hidden
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setServerError(null);
          handleSubmit(new FormData(e.currentTarget));
        }}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit Komoditas" : "Tambah Komoditas"}
        className="relative z-10 flex w-full max-w-2xl max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-lift animate-scale-in"
      >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 active:scale-90 transition-all"
              aria-label="Tutup"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Komoditas" : "Tambah Komoditas"}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Komoditas *
              </label>
              <input
                name="name"
                required
                placeholder="Contoh: Bawang Merah"
                defaultValue={commodity?.name ?? ""}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Deskripsi
              </label>
              <textarea
                name="description"
                placeholder="Deskripsi singkat hasil panen Anda"
                rows={4}
                defaultValue={commodity?.description ?? ""}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kategori *
                </label>
                <select
                  name="categoryId"
                  required
                  defaultValue={commodity?.categoryId ?? ""}
                  className={inputCls}
                >
                  <option value="" disabled>
                    Pilih kategori
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kualitas
                </label>
                <select
                  name="quality"
                  defaultValue={commodity?.quality ?? "A"}
                  className={inputCls}
                >
                  <option value="Premium">Premium</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Harga (Rp) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="1"
                  placeholder="12500"
                  defaultValue={commodity ? Number(commodity.price) : ""}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stok/kg *
                </label>
                <input
                  type="number"
                  name="stock"
                  required
                  min="1"
                  placeholder="500"
                  defaultValue={commodity ? Number(commodity.stock) : ""}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Harga Minimum Nego (Rp)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  min="0"
                  placeholder="10000"
                  defaultValue={commodity?.minPrice ? Number(commodity.minPrice) : ""}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Harga Maksimum Nego (Rp)
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  min="0"
                  placeholder="15000"
                  defaultValue={commodity?.maxPrice ? Number(commodity.maxPrice) : ""}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Estimasi Panen
                </label>
                <input
                  type="date"
                  name="harvestEstimate"
                  defaultValue={fmtDate}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Satuan
                </label>
                <select
                  name="unit"
                  defaultValue={commodity?.unit ?? "kg"}
                  className={inputCls}
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                  <option value="karung">karung</option>
                  <option value="kuintal">kuintal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lokasi *
              </label>
              <textarea
                name="location"
                required
                rows={2}
                placeholder="Contoh: Cibinong, Bogor"
                defaultValue={commodity?.location ?? ""}
                className={inputCls}
              />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <input type="hidden" name="image" value={imageId} />
              <input
                type="hidden"
                name="images"
                value={JSON.stringify(mediaItems.filter((i) => i.type === "image").map((i) => i.url))}
              />
              <input
                type="hidden"
                name="videoUrl"
                value={mediaItems.find((i) => i.type === "video")?.url ?? ""}
              />
              <MediaUploadField
                defaultImages={
                  isEdit && commodity?.image
                    ? [commodity.image, ...(commodity.images ?? [])].filter(
                        (url, i, arr) => url && arr.indexOf(url) === i,
                      )
                    : undefined
                }
                defaultVideoUrl={isEdit ? commodity?.videoUrl ?? undefined : undefined}
                onChange={handleMediaChange}
                onUploadStateChange={handleMediaUploadStateChange}
                onValidationChange={handleMediaValidationChange}
              />
            </div>

            {serverError && (
              <div className="rounded-lg bg-danger/5 border border-danger/20 px-4 py-3 animate-shake">
                <p className="text-sm text-danger">{serverError}</p>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-gray-100 px-5 py-4 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || mediaUploading || (!imageId && !isValidPhotos)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : isEdit ? (
                <>
                  <Upload size={16} />
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Unggah Komoditas
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Komoditas akan diverifikasi terlebih dahulu oleh admin sebelum
              tampil di marketplace.
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
