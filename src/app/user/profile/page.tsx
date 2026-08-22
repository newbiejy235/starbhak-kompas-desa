"use client";

import { useActionState } from "react";
import { getProfile, updateProfile } from "@/actions/profile";
import { getClientUser } from "@/lib/auth/client";
import { formatDate, ROLE_LABEL } from "@/lib/format";
import StatusBadge from "@/components/shared/StatusBadge";
import { CircleUser, Mail, Phone, MapPin } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import type { AuthUser } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-28 rounded-card" />
      <Skeleton className="h-32 rounded-card" />
      <Skeleton className="h-96 rounded-card" />
    </div>
  );
}

export default function UserProfile() {
  const user = getClientUser();

  const { data: profile, loading, reload } = useFetch(
    () => (user ? getProfile(user.id) : Promise.resolve(null)),
    [user?.id],
  );

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      if (!user) return { success: false, message: "Silakan masuk" };
      const res = await updateProfile(user.id, data);
      if (res.success) reload();
      return res;
    },
    null,
  );

  if (loading || !profile) return <ProfileSkeleton />;

  const p = profile as AuthUser;

  const inputCls =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil Saya</h1>

      <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
          {p.fullName?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">{p.fullName}</h2>
          <p className="text-sm text-gray-500">@{p.username}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <StatusBadge status={p.role} label={ROLE_LABEL[p.role]} />
            <StatusBadge status={p.status} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-4 mb-6 grid sm:grid-cols-2 gap-4 text-sm">
        <p className="flex items-center gap-2 text-gray-600"><Mail size={16} className="text-primary" /> {p.email}</p>
        <p className="flex items-center gap-2 text-gray-600"><Phone size={16} className="text-primary" /> {p.noTelp}</p>
        <p className="flex items-center gap-2 text-gray-600"><CircleUser size={16} className="text-primary" /> {ROLE_LABEL[p.role]}</p>
        <p className="flex items-center gap-2 text-gray-600 sm:col-span-2"><MapPin size={16} className="text-primary" /> {p.address || "-"}</p>
        <p className="text-xs text-gray-400 sm:col-span-2">Terdaftar sejak {formatDate(p.createdAt)}</p>
      </div>

      <form action={formAction} className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-gray-900">Edit Profil</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Lengkap *</label>
            <input name="fullName" required defaultValue={p.fullName} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Pengguna *</label>
            <input name="username" required defaultValue={p.username} className={inputCls} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nomor Telepon *</label>
            <input name="noTelp" required defaultValue={p.noTelp} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Foto Profil (URL)</label>
            <input name="fotoProfile" defaultValue={p.fotoProfile ?? ""} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Alamat</label>
          <textarea name="address" rows={2} defaultValue={p.address ?? ""} className={inputCls} />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h4 className="font-semibold text-sm text-gray-800 mb-3">Ubah Kata Sandi (opsional)</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Sandi Saat Ini</label>
              <input type="password" name="currentPassword" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Sandi Baru</label>
              <input type="password" name="newPassword" className={inputCls} />
            </div>
          </div>
        </div>

        {state && (
          <p className={`text-sm animate-fade-in ${state.success ? "text-success" : "text-danger"}`}>
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Menyimpan..." : "Simpan Profil"}
        </button>
      </form>
    </div>
  );
}
