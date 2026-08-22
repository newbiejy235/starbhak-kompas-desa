"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
} from "@/actions/category";
import { getClientUser } from "@/lib/auth/client";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import type { CategoryStats } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function CategoriesSkeleton() {
  return (
    <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-6">
      <Skeleton className="h-96 rounded-card" />
      <div className="lg:col-span-2 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-card" />
        ))}
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const admin = getClientUser();
  const [editing, setEditing] = useState<CategoryStats | null>(null);

  const { data: categories, loading, reload } = useFetch(
    () => getCategoryStats(),
    [],
  );

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      if (!admin) return { success: false, message: "Silakan masuk" };
      const res = editing
        ? await updateCategory(editing.id, admin.id, data)
        : await createCategory(admin.id, data);
      if (res.success) {
        setEditing(null);
        reload();
      }
      return res;
    },
    null,
  );

  const remove = async (id: number) => {
    if (!admin) return;
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    const res = await deleteCategory(id, admin.id);
    if (!res.success) alert(res.message);
    reload();
  };

  if (loading) return <CategoriesSkeleton />;

  const categoryList = categories ?? [];

  const inputCls =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Manajemen Kategori</h1>
      <p className="text-sm text-gray-500 mb-6">Kelola kategori komoditas marketplace.</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 h-fit">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-primary" /> {editing ? "Edit Kategori" : "Tambah Kategori"}
          </h2>
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama *</label>
              <input name="name" required defaultValue={editing?.name ?? ""} placeholder="Contoh: Buah-buahan" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Icon (emoji)</label>
              <input name="icon" defaultValue={editing?.icon ?? ""} placeholder="🍎" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Deskripsi</label>
              <textarea name="description" rows={3} defaultValue={editing?.description ?? ""} className={inputCls} />
            </div>
            {state && (
              <p className={`text-sm animate-fade-in ${state.success ? "text-success" : "text-danger"}`}>
                {state.message}
              </p>
            )}
            <div className="flex gap-3">
              {editing && (
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
              >
                {isPending ? "Menyimpan..." : editing ? "Simpan" : "Tambah"}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-3">
            {categoryList.map((c, i) => (
              <div
                key={c.id}
                className="bg-white rounded-card border border-gray-200/80 shadow-soft p-5 flex items-center gap-4 hover:shadow-lift transition-all duration-300 ease-smooth animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 60, 360)}ms`, animationFillMode: "backwards" }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-2xl flex-shrink-0">
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{c.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{c.description || "-"}</p>
                  <p className="text-xs text-primary mt-1 font-medium">{c.count} komoditas</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditing(c)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white active:scale-95 transition-all"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    aria-label={`Hapus kategori ${c.name}`}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-danger bg-danger/10 hover:bg-danger hover:text-white active:scale-95 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {categoryList.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-10">Belum ada kategori.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
