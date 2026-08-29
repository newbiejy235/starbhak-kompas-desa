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
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  BadgeCheck,
  Ban,
  Pencil,
  Trash2,
  X,
  Mail,
  Phone,
} from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { AdminUser } from "@/lib/types/market";
import type { ActionState } from "@/lib/types/auth";
import { Skeleton } from "@/components/ui/Skeleton";

function UsersSkeleton() {
  return (
    <div className="w-full space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-card" />
    </div>
  );
}

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

  if (loading) return <UsersSkeleton />;

  const list: AdminUser[] = users ?? [];
  const filtered = list.filter((u) => {
    if (filter !== "all" && u.role !== filter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const inputCls =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

  const chipCls = (active: boolean, dark = false) =>
    `px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 ${
      active
        ? dark
          ? "bg-gray-800 text-white border-gray-800"
          : "bg-primary text-white border-primary shadow-sm"
        : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
    }`;

  return (
    <div className="w-full animate-fade-up px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex flex-col gap-1 py-5 sm:py-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Manajemen Pengguna
        </h1>
        <p className="text-sm text-gray-500">
          Verifikasi akun, perbarui informasi, dan atur status akun.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-5">
        {[
          { id: "all", label: "Semua" },
          { id: "petani", label: "Petani" },
          { id: "pembeli", label: "Pembeli" },
          { id: "admin", label: "Admin" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={chipCls(filter === f.id)}
          >
            {f.label}
          </button>
        ))}
        <span className="mx-2 hidden h-6 w-px bg-gray-200 sm:block" />
        {[
          { id: "all", label: "Semua Status" },
          { id: "pending", label: "Menunggu" },
          { id: "verified", label: "Terverifikasi" },
          { id: "suspended", label: "Ditangguhkan" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={chipCls(statusFilter === f.id, true)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pengguna"
          message="Tidak ada pengguna yang cocok dengan filter."
        />
      ) : (
        <div className="w-full overflow-x-auto rounded-card border border-gray-200/80 bg-white shadow-soft">
          <table className="w-full min-w-[680px] text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200/80 bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500">
                <th className="w-[52%] px-4 py-4 font-semibold sm:px-5">Pengguna</th>
                <th className="w-[18%] px-4 py-4 font-semibold sm:px-5">Peran</th>
                <th className="w-[14%] px-4 py-4 font-semibold sm:px-5">Status</th>
                <th className="w-[16%] px-4 py-4 font-semibold sm:px-5">Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-primary/[0.03]"
                >
                  <td className="px-4 py-4 align-top sm:px-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark font-bold text-white">
                        {u.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
                            {u.fullName}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                            <Mail size={11} className="shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            <Phone size={11} className="shrink-0" />
                            <span className="truncate">
                              {u.noTelp} · @{u.username}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setEditing(u)}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-95"
                          >
                            <Pencil size={13} /> Edit
                          </button>

                          {u.status === "pending" && (
                            <button
                              onClick={() => setStatus(u.id, "verified")}
                              className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-all hover:bg-success hover:text-white active:scale-95"
                            >
                              <BadgeCheck size={13} /> Verifikasi
                            </button>
                          )}
                          {u.status === "verified" && (
                            <button
                              onClick={() => setStatus(u.id, "suspended")}
                              className="inline-flex items-center gap-1 rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger transition-all hover:bg-danger hover:text-white active:scale-95"
                            >
                              <Ban size={13} /> Tangguhkan
                            </button>
                          )}
                          {u.status === "suspended" && (
                            <button
                              onClick={() => setStatus(u.id, "verified")}
                              className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-all hover:bg-success hover:text-white active:scale-95"
                            >
                              <BadgeCheck size={13} /> Pulihkan
                            </button>
                          )}

                          <button
                            onClick={() => remove(u.id)}
                            aria-label="Hapus pengguna"
                            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 transition-all hover:bg-danger hover:text-white active:scale-95"
                          >
                            <Trash2 size={13} /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top sm:px-5">
                    <StatusBadge
                      status={u.role}
                      label={ROLE_LABEL[u.role]}
                    />
                    {u.businessType && (
                      <p className="mt-1 text-xs text-gray-400">
                        {BUSINESS_TYPE_LABEL[u.businessType] ?? u.businessType}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 align-top sm:px-5">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 align-top text-gray-500 sm:px-5">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setEditing(null)}
          />
          <div className="relative z-10 my-auto w-full max-w-lg rounded-card bg-white shadow-lift animate-scale-in sm:max-w-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Pengguna</h2>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 active:scale-90"
                aria-label="Tutup"
              >
                <X size={22} />
              </button>
            </div>
            <form action={formAction} className="space-y-4 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Nama Lengkap</label>
                  <input name="fullName" required defaultValue={editing.fullName} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Nama Pengguna</label>
                  <input name="username" required defaultValue={editing.username} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Nomor Telepon</label>
                <input name="noTelp" required defaultValue={editing.noTelp} className={inputCls} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Peran</label>
                  <select name="role" defaultValue={editing.role} className={inputCls}>
                    <option value="petani">Petani</option>
                    <option value="pembeli">Pembeli</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Tipe Bisnis</label>
                  <select name="businessType" defaultValue={editing.businessType ?? ""} className={inputCls}>
                    <option value="">-</option>
                    <option value="distributor">Distributor</option>
                    <option value="umkm">UMKM</option>
                    <option value="restoran">Restoran</option>
                    <option value="koperasi">Koperasi</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Status</label>
                  <select name="status" defaultValue={editing.status} className={inputCls}>
                    <option value="pending">Menunggu</option>
                    <option value="verified">Terverifikasi</option>
                    <option value="suspended">Ditangguhkan</option>
                  </select>
                </div>
              </div>

              {state && (
                <p className={`animate-fade-in text-sm ${state.success ? "text-success" : "text-danger"}`}>
                  {state.message}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 active:scale-[0.98]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50"
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
