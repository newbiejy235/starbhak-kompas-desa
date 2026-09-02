"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import {
  getCategories,
  getFarmerCommodities,
  updateCommodity,
} from "@/actions/commodity";
import { getClientUser } from "@/lib/auth/client";
import MediaUploadField, { type UploadedMedia } from "@/components/shared/MediaUploadField";
import { useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import type { FarmerCommodity } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function EditSkeleton() {
  return (
    <div className="w-full space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-52" />
      <div className="border-b border-gray-100 pb-5">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="mt-5 h-16 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}

export default function EditCommodity() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = getClientUser();

  const { data, loading } = useFetch(
    async () => {
      if (!user) {
        return { categories: [], commodity: null as FarmerCommodity | null };
      }
      const [cats, prods] = await Promise.all([
        getCategories(),
        getFarmerCommodities(user.id),
      ]);
      const found = prods.find((p) => p.id === Number(id)) ?? null;
      return {
        categories: cats,
        commodity: found as FarmerCommodity | null,
      };
    },
    [id, user?.id],
  );

  const categories = data?.categories ?? [];
  const commodity = data?.commodity ?? null;

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      if (!user) return { success: false, message: "Silakan masuk" };
      const res = await updateCommodity(Number(id), user.id, data);
      if (res.success) {
        toast.success("Komoditas berhasil diperbarui");
        router.push("/petani/commodities");
      } else {
        toast.error(res.message);
      }
      return res;
    },
    null,
  );

  const [mediaItems, setMediaItems] = useState<UploadedMedia[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [isValidPhotos, setIsValidPhotos] = useState(false);

  const handleMediaChange = useCallback((items: UploadedMedia[]) => {
    setMediaItems(items);
  }, []);

  const handleMediaUploadStateChange = useCallback((state: boolean) => {
    setMediaUploading(state);
  }, []);

  const handleMediaValidationChange = useCallback((valid: boolean) => {
    setIsValidPhotos(valid);
  }, []);

  if (loading) return <EditSkeleton />;

  if (!commodity) {
    return (
      <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-10 text-center text-gray-500 animate-fade-up">
        Komoditas tidak ditemukan.
      </div>
    );
  }

  const fmtDate = commodity.harvestEstimate
    ? new Date(commodity.harvestEstimate).toISOString().slice(0, 10)
    : "";

  const inputCls =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

  return (
    <div className="w-full animate-fade-up px-4 py-5 sm:px-6 lg:px-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary active:scale-95 transition-all mb-4"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Edit Komoditas
        </h1>
      </header>

      <form action={formAction} className="space-y-5">
        <div className="border-b border-gray-100 pb-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Komoditas *</label>
            <input name="name" required defaultValue={commodity.name} className={inputCls} />
          </div>

          <div className="mt-5">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Deskripsi</label>
            <textarea name="description" rows={3} defaultValue={commodity.description ?? ""} className={inputCls} />
          </div>
        </div>

        <div className="border-b border-gray-100 pb-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Kategori *</label>
            <select name="categoryId" className={inputCls} defaultValue={commodity.categoryId}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-b border-gray-100 pb-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga (Rp) *</label>
              <input type="number" name="price" required min="1" defaultValue={Number(commodity.price) || ""} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Stok *</label>
              <input type="number" name="stock" required min="1" defaultValue={Number(commodity.stock) || ""} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Satuan</label>
              <select name="unit" className={inputCls} defaultValue={commodity.unit}>
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="karung">karung</option>
                <option value="kuintal">kuintal</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga Minimum Nego (Rp)</label>
              <input type="number" name="minPrice" min="0" defaultValue={commodity.minPrice ?? ""} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga Maksimum Nego (Rp)</label>
              <input type="number" name="maxPrice" min="0" defaultValue={commodity.maxPrice ?? ""} className={inputCls} />
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Minimal Berat untuk Nego (kg) *</label>
              <input type="number" name="minWeightForNego" required min="1" defaultValue={commodity.minWeightForNego ?? ""} className={inputCls} />
              <p className="mt-1 text-[11px] text-gray-400">Pembelian ≥ berat ini masuk alur negosiasi</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga Pas / kg (Rp) *</label>
              <input type="number" name="fixedPrice" required min="1" defaultValue={commodity.fixedPrice ?? ""} className={inputCls} />
              <p className="mt-1 text-[11px] text-gray-400">Harga tetap untuk pembelian di bawah berat minimum</p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100 pb-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Lokasi *</label>
              <input name="location" required defaultValue={commodity.location} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Estimasi Panen</label>
              <input type="date" name="harvestEstimate" defaultValue={fmtDate} className={inputCls} />
            </div>
          </div>
        </div>

        <div>
          <MediaUploadField
            defaultImages={
              commodity.image
                ? [commodity.image, ...(commodity.images ?? [])].filter(
                    (url, i, arr) => url && arr.indexOf(url) === i,
                  )
                : commodity.images?.length
                  ? commodity.images
                  : undefined
            }
            defaultVideoUrl={commodity.videoUrl ?? undefined}
            onChange={handleMediaChange}
            onUploadStateChange={handleMediaUploadStateChange}
            onValidationChange={handleMediaValidationChange}
          />
        </div>

        <input
          type="hidden"
          name="image"
          value={mediaItems.find((i) => i.type === "image")?.id ?? ""}
        />
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

        {state && !state.success && (
          <p className="text-sm text-danger animate-shake">{state.message}</p>
        )}

        <div className="sticky bottom-0 -mx-4 border-t border-gray-200 bg-[#F6F6F6]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={isPending || mediaUploading || (!commodity.image && !isValidPhotos)}
              className="w-full rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
