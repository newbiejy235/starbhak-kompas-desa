"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { ChevronLeft, PackagePlus } from "lucide-react";
import { getCategories, createCommodity } from "@/actions/commodity";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import MediaUploadField, { type UploadedMedia } from "@/components/shared/MediaUploadField";

export default function AddCommodity() {
  const router = useRouter();
  const user = getClientUser();

  const { data: categories } = useFetch(() => getCategories(), []);

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      if (!user) return { success: false, message: "Silakan masuk" };
      const res = await createCommodity(user.id, data);
      if (res.success) {
        toast.success("Komoditas berhasil ditambahkan", {
          description: "Menunggu verifikasi admin sebelum tayang.",
        });
        router.push("/petani/dashboard");
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

  const inputCls =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

  const categoryList = categories ?? [];

  return (
    <div className="w-full animate-fade-up px-4 py-5 sm:px-6 lg:px-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary active:scale-95 transition-all mb-4"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <header className="mb-6 flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <PackagePlus size={20} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Tambah Komoditas
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Unggah informasi hasil panen Anda.
          </p>
        </div>
      </header>

      <form action={formAction} className="space-y-5">
        <div className="border-b border-gray-100 pb-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Komoditas *</label>
            <input name="name" required placeholder="Contoh: Beras Pandan Wangi" className={inputCls} />
          </div>

          <div className="mt-5">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Deskripsi</label>
            <textarea
              name="description"
              placeholder="Deskripsi singkat hasil panen Anda"
              rows={3}
              className={inputCls}
            />
          </div>
        </div>

        <div className="border-b border-gray-100 pb-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Kategori *</label>
              <select name="categoryId" required className={inputCls} defaultValue="">
                <option value="" disabled>Pilih kategori</option>
                {categoryList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Kualitas</label>
              <select name="quality" className={inputCls} defaultValue="A">
                <option value="Premium">Premium</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100 pb-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga (Rp) *</label>
              <input type="number" name="price" required min="1" placeholder="12500" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Stok *</label>
              <input type="number" name="stock" required min="1" placeholder="500" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Satuan</label>
              <select name="unit" className={inputCls} defaultValue="kg">
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
              <input type="number" name="minPrice" min="0" placeholder="10000" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga Maksimum Nego (Rp)</label>
              <input type="number" name="maxPrice" min="0" placeholder="15000" className={inputCls} />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100 pb-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Lokasi *</label>
              <input name="location" required placeholder="Contoh: Cibinong, Bogor" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Estimasi Panen</label>
              <input type="date" name="harvestEstimate" className={inputCls} />
            </div>
          </div>
        </div>

        <div>
          <MediaUploadField
            onChange={handleMediaChange}
            onUploadStateChange={handleMediaUploadStateChange}
            onValidationChange={handleMediaValidationChange}
          />
        </div>

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
            <p className="text-[11px] leading-relaxed text-gray-400 sm:max-w-xs">
              Komoditas akan diverifikasi admin sebelum tampil di marketplace.
            </p>
            <button
              type="submit"
              disabled={isPending || mediaUploading || !isValidPhotos}
              className="w-full rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
            >
              {isPending ? "Menyimpan..." : "Simpan Komoditas"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
