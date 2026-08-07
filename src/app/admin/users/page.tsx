"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  getAllUsers,
  updateUserStatus,
  updateUser,
  deleteUser,
} from "@/actions/admin";
import { getClientUser } from "@/lib/auth/client";
import {
  formatDate,
  ROLE_LABEL,
  BUSINESS_TYPE_LABEL,
} from "@/lib/format";
import { LoadingState, EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { BadgeCheck, Ban, Pencil, Trash2, X, Mail, Phone } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { AdminUser } from "@/lib/types/market";
import type { ActionState } from "@/lib/types/auth";

export default function AdminUsers() {
  const admin = getClientUser();
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const { data: users, loading, reload } = useFetch(
    () => getAllUsers(),
    [],
  );

  const setStatus = async (id: number, status: string) => {
    if (!admin) return;
    const res = await updateUserStatus(id, status, admin.id);
    if (!res.success) alert(res.message);
    reload();
  };

  const remove = async (id: number) => {
    if (!admin) return;
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    const res = await deleteUser(id, admin.id);
    if (!res.success) alert(res.message);
    reload();
  };

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      if (!admin || !editing) return { success: false, message: "Error" };
      const res = await updateUser(editing.id, admin.id, data);
      if (res.success) {
        setEditing(null);
        reload();
      }
      return res;
    },
    null,
  );

  if (loading) return <LoadingState />;

  const list: AdminUser[] = users ?? [];
  const filtered = list.filter((u) => {
    if (filter !== "all" && u.role !== filter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#025246]";

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111111] mb-2">Manajemen Pengguna</h1>
      <p className="text-sm text-gray-500 mb-6">
        Verifikasi akun, perbarui informasi, dan atur status akun.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "all", label: "Semua" },
          { id: "petani", label: "Petani" },
          { id: "pembeli", label: "Pembeli" },
          { id: "admin", label: "Admin" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              filter === f.id
                ? "bg-[#025246] text-white border-[#025246]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#025246]"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="w-px bg-gray-200 mx-2" />
        {[
          { id: "all", label: "Semua Status" },
          { id: "pending", label: "Menunggu" },
          { id: "verified", label: "Terverifikasi" },
          { id: "suspended", label: "Ditangguhkan" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === f.id
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Tidak Ada Pengguna" message="Tidak ada pengguna yang cocok dengan filter." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                <th className="px-5 py-4 font-medium">Pengguna</th>
                <th className="px-5 py-4 font-medium">Peran</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Terdaftar</th>
                <th className="px-5 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#025246] text-white flex items-center justify-center font-bold flex-shrink-0">
                        {u.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{u.fullName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={11} /> {u.email}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone size={11} /> {u.noTelp} · @{u.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <StatusBadge status={u.role} label={ROLE_LABEL[u.role]} />
                      {u.businessType && (
                        <p className="text-xs text-gray-400 mt-1">
                          {BUSINESS_TYPE_LABEL[u.businessType] ?? u.businessType}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {u.status === "pending" && (
                        <button
                          onClick={() => setStatus(u.id, "verified")}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-600 hover:text-white transition-colors"
                        >
                          <BadgeCheck size={14} /> Verifikasi
                        </button>
                      )}
                      {u.status === "verified" && (
                        <button
                          onClick={() => setStatus(u.id, "suspended")}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <Ban size={14} /> Tangguhkan
                        </button>
                      )}
                      {u.status === "suspended" && (
                        <button
                          onClick={() => setStatus(u.id, "verified")}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-600 hover:text-white transition-colors"
                        >
                          <BadgeCheck size={14} /> Pulihkan
                        </button>
                      )}
                      <button
                        onClick={() => setEditing(u)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-[#025246] bg-[#025246]/10 hover:bg-[#025246] hover:text-white transition-colors"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => remove(u.id)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#111111]">Edit Pengguna</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>
            <form action={formAction} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Lengkap</label>
                  <input name="fullName" required defaultValue={editing.fullName} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Pengguna</label>
                  <input name="username" required defaultValue={editing.username} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nomor Telepon</label>
                <input name="noTelp" required defaultValue={editing.noTelp} className={inputCls} />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Peran</label>
                  <select name="role" defaultValue={editing.role} className={inputCls}>
                    <option value="petani">Petani</option>
                    <option value="pembeli">Pembeli</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipe Bisnis</label>
                  <select name="businessType" defaultValue={editing.businessType ?? ""} className={inputCls}>
                    <option value="">-</option>
                    <option value="distributor">Distributor</option>
                    <option value="umkm">UMKM</option>
                    <option value="restoran">Restoran</option>
                    <option value="koperasi">Koperasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <select name="status" defaultValue={editing.status} className={inputCls}>
                    <option value="pending">Menunggu</option>
                    <option value="verified">Terverifikasi</option>
                    <option value="suspended">Ditangguhkan</option>
                  </select>
                </div>
              </div>

              {state && (
                <p className={`text-sm ${state.success ? "text-green-600" : "text-red-500"}`}>
                  {state.message}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-2xl bg-[#025246] py-3 text-sm font-bold text-white hover:bg-[#024036] disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
