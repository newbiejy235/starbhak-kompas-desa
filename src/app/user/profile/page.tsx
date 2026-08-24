"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { getProfile, updateProfile } from "@/actions/profile";
import { getClientUser, saveSession } from "@/lib/auth/client";
import { formatDate, ROLE_LABEL } from "@/lib/format";
import StatusBadge from "@/components/shared/StatusBadge";
import { CircleUser, Mail, Phone, MapPin, Camera, Trash2, Loader2 } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import type { AuthUser } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeFoto, setRemoveFoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: profile, loading, reload } = useFetch(
    () => (user ? getProfile(user.id) : Promise.resolve(null)),
    [user?.id],
  );

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      if (!user) return { success: false, message: "Silakan masuk" };

      if (selectedFile) {
        data.set("fotoProfileFile", selectedFile);
      }
      if (removeFoto) {
        data.set("removeFoto", "true");
      }

      const res = await updateProfile(user.id, data);
      if (res.success) {
        setPreviewUrl(null);
        setSelectedFile(null);
        setRemoveFoto(false);
        const updated = await getProfile(user.id);
        if (updated) {
          saveSession(localStorage.getItem("kd_token") || "", {
            id: updated.id,
            email: updated.email,
            role: updated.role,
            fullName: updated.fullName,
            status: updated.status,
            businessType: updated.businessType ?? undefined,
            username: updated.username ?? undefined,
            fotoProfile: updated.fotoProfile ?? null,
          });
        }
        reload();
      }
      return res;
    },
    null,
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Format file harus JPG, JPEG, atau PNG");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 5MB");
      return;
    }

    setSelectedFile(file);
    setRemoveFoto(false);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveFoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveFoto(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading || !profile) return <ProfileSkeleton />;

  const p = profile as AuthUser;
  const currentFoto = removeFoto ? null : (previewUrl || p.fotoProfile);

  const inputCls =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil Saya</h1>

      <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 mb-6 flex items-center gap-4">
        <Avatar src={currentFoto} name={p.fullName} size="xl" />
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

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Foto Profil</label>
          <div className="flex items-center gap-4">
            <Avatar src={currentFoto} name={p.fullName} size="lg" />
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
                id="foto-upload"
              />
              <label
                htmlFor="foto-upload"
                className="flex items-center gap-2 px-4 py-2 bg-[#025246] text-white text-xs font-bold rounded-xl hover:bg-[#024036] cursor-pointer transition-colors"
              >
                <Camera size={14} />
                Pilih Foto
              </label>
              {(p.fotoProfile || selectedFile) && (
                <button
                  type="button"
                  onClick={handleRemoveFoto}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} />
                  Hapus Foto
                </button>
              )}
            </div>
          </div>
          {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
        </div>

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
          className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Profil"
          )}
        </button>
      </form>
    </div>
  );
}
