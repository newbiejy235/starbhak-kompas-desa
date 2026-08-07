"use client";

import { useActionState } from "react";
import { getFeeSettings, saveFeeSettings, toggleFee } from "@/actions/admin";
import { getCategories } from "@/actions/commodity";
import { getClientUser } from "@/lib/auth/client";
import { formatDate } from "@/lib/format";
import { LoadingState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { Plus, Power, Percent } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { FeeSettingRow, CategoryRow } from "@/lib/types/market";
import type { ActionState } from "@/lib/types/auth";

export default function AdminFees() {
  const admin = getClientUser();

  const { data: feeData, loading, reload } = useFetch(
    () => Promise.all([getFeeSettings(), getCategories()]),
    [],
  );

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      if (!admin) return { success: false, message: "Silakan masuk" };
      const res = await saveFeeSettings(admin.id, data);
      if (res.success) reload();
      return res;
    },
    null,
  );

  const toggle = async (id: number) => {
    if (!admin) return;
    await toggleFee(id, admin.id);
    reload();
  };

  if (loading) return <LoadingState />;

  const fees: FeeSettingRow[] = feeData?.[0] ?? [];
  const categories: CategoryRow[] = feeData?.[1] ?? [];

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#025246]";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#111111] mb-2">Manajemen Fee Transaksi</h1>
      <p className="text-sm text-gray-500 mb-6">
        Atur besaran biaya layanan platform berdasarkan kategori komoditas.
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-fit">
          <h2 className="font-bold text-[#111111] mb-4 flex items-center gap-2">
            <Plus size={18} className="text-[#025246]" /> Tambah Kebijakan Fee
          </h2>
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Kebijakan *</label>
              <input name="name" required placeholder="Biaya Layanan Sayuran" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Persentase (%) *</label>
              <input name="percentage" type="number" required min="0" max="100" step="0.01" defaultValue="2.5" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Kategori (opsional)</label>
              <select name="categoryId" className={inputCls} defaultValue="">
                <option value="">Semua kategori (umum)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="active" defaultChecked className="accent-[#025246]" />
              Aktif
            </label>
            {state && (
              <p className={`text-sm ${state.success ? "text-green-600" : "text-red-500"}`}>
                {state.message}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-[#025246] py-3 text-sm font-bold text-white hover:bg-[#024036] disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan Kebijakan"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-3">
            {fees.map((f) => (
              <div key={f.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#025246]/10 flex items-center justify-center flex-shrink-0">
                  <Percent size={20} className="text-[#025246]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{f.name}</h3>
                  <p className="text-xs text-gray-500">
                    {f.categoryName ? `Kategori: ${f.categoryName}` : "Berlaku untuk semua kategori"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Diperbarui {formatDate(f.updatedAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-extrabold text-[#025246]">{f.percentage}%</p>
                  <StatusBadge status={f.active ? "verified" : "suspended"} label={f.active ? "Aktif" : "Nonaktif"} />
                </div>
                <button
                  onClick={() => toggle(f.id)}
                  title={f.active ? "Nonaktifkan" : "Aktifkan"}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    f.active
                      ? "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`}
                >
                  <Power size={18} />
                </button>
              </div>
            ))}
            {fees.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-10">Belum ada kebijakan fee.</p>
            )}
          </div>

          <div className="bg-[#025246] rounded-2xl p-6 mt-6 text-white">
            <h3 className="font-bold mb-1">Ringkasan Biaya Layanan</h3>
            <p className="text-sm text-white/80">
              Biaya layanan otomatis dihitung dari subtotal pesanan menggunakan kebijakan fee yang
              aktif. Petani menerima hasil penjualan setelah dikurangi fee platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
