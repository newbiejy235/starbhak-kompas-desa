"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { ChevronLeft, PackagePlus } from "lucide-react";
import { getCategories, createCommodity } from "@/actions/commodity";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import ImageUploadField from "@/components/shared/ImageUploadField";

export default function AddCommodity() {
  const router = useRouter();
  const user = getClientUser();

  const { data: categories } = useFetch(() => getCategories(), []);

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      if (!user) return { success: false, message: "Silakan masuk" };
      const res = await createCommodity(user.id, data);
      if (res.success) router.push("/petani/dashboard");
      return res;
    },
    null,
  );

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#025246]";

  const categoryList = categories ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#025246] mb-6"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <h1 className="text-2xl font-bold text-[#111111] mb-1 flex items-center gap-2">
        <PackagePlus className="text-[#025246]" /> Tambah Komoditas
      </h1>
      <p className="text-sm text-gray-500 mb-6">Unggah informasi hasil panen Anda.</p>

      <form action={formAction} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Komoditas *</label>
          <input name="name" required placeholder="Contoh: Beras Pandan Wangi" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Deskripsi</label>
          <textarea
            name="description"
            placeholder="Deskripsi singkat hasil panen Anda"
            rows={3}
            className={inputCls}
          />
        </div>

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

        <ImageUploadField />

        {state && !state.success && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-[#025246] py-4 text-sm font-bold text-white hover:bg-[#024036] transition-colors disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan Komoditas"}
        </button>
        <p className="text-[11px] text-gray-400 text-center">
          Komoditas akan diverifikasi admin sebelum tampil di marketplace.
        </p>
      </form>
    </div>
  );
}
