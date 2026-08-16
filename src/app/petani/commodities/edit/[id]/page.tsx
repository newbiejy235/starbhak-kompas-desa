"use client";

import { useParams, useRouter } from "next/navigation";
import { useActionState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  getCategories,
  getFarmerCommodities,
  updateCommodity,
} from "@/actions/commodity";
import { getClientUser } from "@/lib/auth/client";
import { LoadingState } from "@/components/shared/States";
import { formatNumber } from "@/lib/format";
import ImageUploadField from "@/components/shared/ImageUploadField";
import { useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import type { FarmerCommodity } from "@/lib/types/market";

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
      if (res.success) router.push("/petani/dashboard");
      return res;
    },
    null,
  );

  if (loading) return <LoadingState />;

  if (!commodity) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
        Komoditas tidak ditemukan.
      </div>
    );
  }

  const fmtDate = commodity.harvestEstimate
    ? new Date(commodity.harvestEstimate).toISOString().slice(0, 10)
    : "";

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#025246]";

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#025246] mb-6"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <h1 className="text-2xl font-bold text-[#111111] mb-6">Edit Komoditas</h1>

      <form action={formAction} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Komoditas *</label>
          <input name="name" required defaultValue={commodity.name} className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Deskripsi</label>
          <textarea name="description" rows={3} defaultValue={commodity.description ?? ""} className={inputCls} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Kualitas</label>
            <select name="quality" className={inputCls} defaultValue={commodity.quality}>
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
            <input type="number" name="price" required min="1" defaultValue={formatNumber(commodity.price)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Stok *</label>
            <input type="number" name="stock" required min="1" defaultValue={formatNumber(commodity.stock)} className={inputCls} />
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

        <ImageUploadField
          defaultValue={commodity.image ?? undefined}
          defaultImageId={commodity.imageId}
        />

        {state && !state.success && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-[#025246] py-4 text-sm font-bold text-white hover:bg-[#024036] transition-colors disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
