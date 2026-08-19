"use client";

import { useRef, useState, useEffect } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import {
  createCommodity,
  updateCommodity,
  getCategories,
} from "@/actions/commodity";
import { uploadImageAction } from "@/actions/upload.action";
import { getClientUser } from "@/lib/auth/client";
import { formatNumber } from "@/lib/format";
import type { ActionState } from "@/lib/types/auth";
import type { FarmerCommodity, CategoryRow } from "@/lib/types/market";
import Image from "next/image";

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
  const [preview, setPreview] = useState(commodity?.image ?? "");
  const [imageId, setImageId] = useState<number | "">(commodity?.imageId ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      getCategories().then(setCategories);
      setServerError(null);
      if (commodity) {
        setPreview(commodity.image ?? "");
        setImageId(commodity.imageId ?? "");
      } else {
        setPreview("");
        setImageId("");
      }
    }
  }, [open, commodity]);

  const inputCls =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm focus:outline-none focus:border-[#025246] bg-white placeholder:text-gray-400";

  const fmtDate = commodity?.harvestEstimate
    ? new Date(commodity.harvestEstimate).toISOString().slice(0, 10)
    : "";

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const result = await uploadImageAction(fd);
      setImageId(result.id);
      setPreview(result.secureUrl);
    } catch {
      setUploadError("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[520px] lg:absolute lg:inset-y-0 lg:left-full lg:w-[565px] lg:-translate-x-full bg-white shadow-2xl flex flex-col animate-slide-in">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setServerError(null);
            handleSubmit(new FormData(e.currentTarget));
          }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h2 className="text-lg font-bold text-[#111111]">
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
                  defaultValue={commodity ? formatNumber(commodity.price) : ""}
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
                  defaultValue={commodity ? formatNumber(commodity.stock) : ""}
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
                  defaultValue={commodity?.minPrice ? formatNumber(commodity.minPrice) : ""}
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
                  defaultValue={commodity?.maxPrice ? formatNumber(commodity.maxPrice) : ""}
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Latar Gambar
              </label>
              <input type="hidden" name="image" value={imageId} />
              {preview ? (
                <div className="flex items-center gap-3">
                  <div className="relative w-36 h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                    <Image
                      src={preview}
                      alt="Pratinjau"
                      fill
                      sizes="144px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setImageId("");
                        setPreview("");
                      }}
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={13} /> Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-xs text-[#025246] hover:text-[#013e34]"
                    >
                      <ImagePlus size={13} /> Ganti
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-28 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#025246] hover:text-[#025246] transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <ImagePlus size={22} />
                  )}
                  <span className="text-xs">
                    {uploading ? "Mengunggah..." : "Pilih gambar"}
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              {uploadError && (
                <p className="text-xs text-red-500 mt-1">{uploadError}</p>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600">{serverError}</p>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-gray-100 px-5 py-4 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#025246] py-3.5 text-sm font-bold text-white hover:bg-[#013e34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
