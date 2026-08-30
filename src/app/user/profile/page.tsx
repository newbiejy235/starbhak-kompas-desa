"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { getProfile, updateProfile } from "@/actions/profile";
import { saveSession } from "@/lib/auth/client";
import { formatDate, ROLE_LABEL } from "@/lib/format";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Camera,
  Trash2,
  Loader2,
  LockKeyhole,
  Pencil,
  X,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { useAuth, useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import type { AuthUser } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";
import ImageCropModal from "@/components/ui/ImageCropModal";
import PageHeader from "@/components/shared/PageHeader";
import { CircleUser } from "lucide-react";
import Link from "next/link";

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="flex gap-6">
        <Skeleton className="w-[380px] h-[420px] rounded-card" />
        <Skeleton className="flex-1 h-[420px] rounded-card" />
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeFoto, setRemoveFoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);

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
        setIsEditing(false);
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
    e.target.value = "";

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

    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
  };

  const handleCropComplete = (file: File) => {
    setSelectedFile(file);
    setRemoveFoto(false);
    setPreviewUrl(URL.createObjectURL(file));
    setCropImageSrc(null);
  };

  const handleCropCancel = () => {
    setCropImageSrc(null);
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
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition hover:border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";

  return (
    <div className="space-y-6 animate-fade-up max-w-7xl mx-auto">
      <PageHeader
        icon={CircleUser}
        title="Profile Saya"
        subtitle="Kelola informasi identitas dan detail akun Anda."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-card border border-gray-200 shadow-soft overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-primary to-primary-dark" />
            <div className="px-6 pb-6 -mt-14 text-center">
              <div className="relative inline-block">
                <Avatar src={currentFoto} name={p.fullName} size="xl" className="w-28 h-28 text-3xl ring-4 ring-white shadow-lg" />
                {isEditing && (
                  <label
                    htmlFor="foto-upload"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-primary-dark transition-colors"
                    title="Ganti Foto"
                  >
                    <Camera size={14} />
                  </label>
                )}
              </div>
              <h2 className="mt-3 text-lg font-bold text-gray-900">{p.fullName}</h2>
              <p className="text-sm text-gray-500 mb-3">@{p.username}</p>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <StatusBadge status={p.role} label={ROLE_LABEL[p.role]} />
              </div>

              {isEditing && (
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="foto-upload"
                    form="profile-form"
                  />
                  <label
                    htmlFor="foto-upload"
                    className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Camera size={13} />
                    {p.fotoProfile || selectedFile ? "Ganti Foto Profil" : "Pilih Foto"}
                  </label>
                  {(p.fotoProfile || selectedFile) && (
                    <button
                      type="button"
                      onClick={handleRemoveFoto}
                      className="w-full py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      Hapus Foto
                    </button>
                  )}
                  {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 text-left space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <Mail size={14} className="text-primary shrink-0" />
                  <span className="truncate">{p.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <Phone size={14} className="text-primary shrink-0" />
                  <span>{p.noTelp || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span className="truncate">{p.address || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <CalendarDays size={14} className="text-primary shrink-0" />
                  <span>Bergabung {formatDate(p.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <form id="profile-form" action={formAction} className="bg-white rounded-card border border-gray-200 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Informasi Lengkap Profile</h3>
                <p className="text-xs text-gray-500 mt-0.5">Kelola informasi identitas dan detail akun Anda.</p>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
                >
                  <Pencil size={14} />
                  Ubah Informasi
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <X size={14} />
                  Batal
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Lengkap *</label>
                  <input name="fullName" required defaultValue={p.fullName} disabled={!isEditing} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Pengguna *</label>
                  <input name="username" required defaultValue={p.username} disabled={!isEditing} className={inputCls} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nomor Telepon *</label>
                  <input name="noTelp" required defaultValue={p.noTelp} disabled={!isEditing} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Alamat</label>
                  <input name="address" defaultValue={p.address ?? ""} disabled={!isEditing} className={inputCls} placeholder="Kota / Alamat lengkap" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email (Tidak dapat diubah)</label>
                  <input value={p.email} disabled className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Peran Akun</label>
                  <input value={ROLE_LABEL[p.role]} disabled className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <LockKeyhole size={18} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">Keamanan & Sandi</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Amankan akun Anda dengan kata sandi yang lebih kuat.</p>
                  </div>
                </div>
                <Link
                  href="#"
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all shrink-0"
                >
                  Ubah Kata Sandi
                </Link>
              </div>
            </div>

            {isEditing && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50 animate-fade-up">
                {state ? (
                  <p className={`text-sm flex-1 ${state.success ? "text-green-600" : "text-red-500"}`}>
                    {state.message}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 flex-1">Pastikan data sudah benar sebelum menyimpan perubahan.</p>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-300 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {!isEditing && state && (
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
                <p className={`text-xs ${state.success ? "text-green-600" : "text-red-500"}`}>
                  {state.message}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}