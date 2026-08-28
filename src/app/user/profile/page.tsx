"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { getProfile, updateProfile } from "@/actions/profile";
import { saveSession } from "@/lib/auth/client";
import { formatDate, ROLE_LABEL } from "@/lib/format";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  CircleUser,
  Mail,
  Phone,
  MapPin,
  Camera,
  Trash2,
  Loader2,
  Shield,
  CalendarDays,
  Star,
} from "lucide-react";
import { useAuth, useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import type { AuthUser } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";
import ImageCropModal from "@/components/ui/ImageCropModal";

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="flex flex-col lg:flex-row gap-6">
        <Skeleton className="lg:w-[380px] h-[420px] rounded-card" />
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

  const p = profile as AuthUser & { avgRating: number; reviewCount: number };
  const currentFoto = removeFoto ? null : (previewUrl || p.fotoProfile);

  const inputCls =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-200 hover:border-gray-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15";

  return (
    <div className="space-y-6 animate-fade-up">
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CircleUser size={22} strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Profil Saya
          </h1>
          <p className="mt-0.5 truncate text-sm text-gray-500">
            Kelola informasi profil dan keamanan akun Anda.
          </p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Profile Identity */}
        <div className="lg:w-[380px] shrink-0 space-y-5">
          {/* Avatar Card */}
          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-primary to-primary-dark" />
            <div className="px-6 pb-6 -mt-12 text-center">
              <div className="relative inline-block">
                <Avatar
                  src={currentFoto}
                  name={p.fullName}
                  size="xl"
                  className="w-24 h-24 text-3xl ring-4 ring-white shadow-lg"
                />
              </div>
              <h2 className="mt-3 text-lg font-bold text-gray-900">{p.fullName}</h2>
              <p className="text-sm text-gray-500">@{p.username}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <StatusBadge status={p.role} label={ROLE_LABEL[p.role]} />
                <StatusBadge status={p.status} />
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Informasi Akun
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail size={15} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">Email</p>
                  <p className="text-gray-800 truncate">{p.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone size={15} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">Telepon</p>
                  <p className="text-gray-800">{p.noTelp}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CircleUser size={15} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">Peran</p>
                  <p className="text-gray-800">{ROLE_LABEL[p.role]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin size={15} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">Alamat</p>
                  <p className="text-gray-800">{p.address || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarDays size={15} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">Terdaftar</p>
                  <p className="text-gray-800">{formatDate(p.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ulasan Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ulasan</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#025246]/10 flex items-center justify-center shrink-0">
                <span className="text-2xl font-extrabold text-[#025246]">
                  {p.avgRating > 0 ? p.avgRating.toFixed(1) : "0"}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={
                        star <= Math.round(p.avgRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {p.reviewCount} ulasan
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <form
            action={formAction}
            className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden"
          >
            {/* Photo Section */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Foto Profil</h3>
              <div className="flex items-center gap-5">
                <Avatar
                  src={currentFoto}
                  name={p.fullName}
                  size="lg"
                  className="w-20 h-20 text-2xl"
                />
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark cursor-pointer transition-colors duration-150 active:scale-[0.98]"
                  >
                    <Camera size={14} />
                    {p.fotoProfile || selectedFile ? "Ganti Foto" : "Pilih Foto"}
                  </label>
                  {(p.fotoProfile || selectedFile) && (
                    <button
                      type="button"
                      onClick={handleRemoveFoto}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors duration-150"
                    >
                      <Trash2 size={14} />
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>
              {uploadError && (
                <p className="text-xs text-danger mt-3">{uploadError}</p>
              )}
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-5">
              <h3 className="text-sm font-semibold text-gray-900">Informasi Profil</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    Nama Lengkap <span className="text-danger">*</span>
                  </label>
                  <input
                    name="fullName"
                    required
                    defaultValue={p.fullName}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    Nama Pengguna <span className="text-danger">*</span>
                  </label>
                  <input
                    name="username"
                    required
                    defaultValue={p.username}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    Nomor Telepon <span className="text-danger">*</span>
                  </label>
                  <input
                    name="noTelp"
                    required
                    defaultValue={p.noTelp}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    Alamat
                  </label>
                  <input
                    name="address"
                    defaultValue={p.address ?? ""}
                    className={inputCls}
                    placeholder="Kota / Alamat lengkap"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="px-6 pb-6">
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={16} className="text-gray-400" />
                  <h4 className="text-sm font-semibold text-gray-800">Ubah Kata Sandi</h4>
                  <span className="text-[11px] text-gray-400 font-normal">(opsional)</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                      Sandi Saat Ini
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      className={inputCls}
                      placeholder="Masukkan sandi saat ini"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                      Sandi Baru
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      className={inputCls}
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
              {state ? (
                <p className={`text-sm flex-1 ${state.success ? "text-success" : "text-danger"}`}>
                  {state.message}
                </p>
              ) : (
                <p className="text-xs text-gray-400 flex-1">
                  Pastikan data sudah benar sebelum menyimpan.
                </p>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-soft hover:bg-primary-dark hover:shadow-lift transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none shrink-0"
              >
                {isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Profil"
                )}
              </button>
            </div>
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
