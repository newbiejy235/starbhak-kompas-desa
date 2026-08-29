"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import {
  Camera,
  Trash2,
  Loader2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { updateProfile } from "@/actions/profile";
import { getProfile } from "@/actions/profile";
import { saveSession } from "@/lib/auth/client";
import { toast } from "sonner";
import Avatar from "@/components/ui/Avatar";
import ImageCropModal from "@/components/ui/ImageCropModal";
import type { ActionState } from "@/lib/types/auth";
import type { ProfileData } from "./types";

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-150 hover:border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

const textareaCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-150 hover:border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none";

const cardCls = "rounded-2xl border border-gray-200/80 bg-white";

export default function EditProfileForm({
  profile,
  userId,
  currentFoto,
  onReload,
}: {
  profile: ProfileData;
  userId: number;
  currentFoto: string | null;
  onReload: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeFoto, setRemoveFoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      if (selectedFile) {
        data.set("fotoProfileFile", selectedFile);
      }
      if (removeFoto) {
        data.set("removeFoto", "true");
      }

      const res = await updateProfile(userId, data);
      if (res.success) {
        toast.success("Profil berhasil diperbarui");
        setPreviewUrl(null);
        setSelectedFile(null);
        setRemoveFoto(false);
        const updated = await getProfile(userId);
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
        onReload();
      } else {
        toast.error(res.message);
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
    setCropImageSrc(URL.createObjectURL(file));
  };

  const handleCropComplete = (file: File) => {
    setSelectedFile(file);
    setRemoveFoto(false);
    setPreviewUrl(URL.createObjectURL(file));
    setCropImageSrc(null);
  };

  const handleRemoveFoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveFoto(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayFoto = removeFoto ? null : previewUrl || currentFoto;

  return (
    <>
      <form action={formAction} className={cardCls}>
        {/* Foto Profil */}
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Camera size={16} className="text-primary" />
            Foto Profil
          </h3>
          <div className="flex items-center gap-4">
            <Avatar
              src={displayFoto}
              name={profile.fullName}
              size="lg"
              className="w-16 h-16 text-xl"
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
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark cursor-pointer transition-colors duration-150"
              >
                <Camera size={14} />
                {profile.fotoProfile || selectedFile ? "Ganti Foto" : "Pilih Foto"}
              </label>
              {(profile.fotoProfile || selectedFile) && (
                <button
                  type="button"
                  onClick={handleRemoveFoto}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} />
                  Hapus Foto
                </button>
              )}
            </div>
          </div>
          {uploadError && <p className="text-xs text-red-500 mt-3">{uploadError}</p>}
        </div>

        {/* Informasi Pribadi */}
        <div className="p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Informasi Pribadi</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Lengkap *</label>
              <input name="fullName" required defaultValue={profile.fullName} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Pengguna *</label>
              <input name="username" required defaultValue={profile.username} className={inputCls} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nomor Telepon *</label>
              <input name="noTelp" required defaultValue={profile.noTelp} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Alamat</label>
              <input
                name="address"
                defaultValue={profile.address ?? ""}
                className={inputCls}
                placeholder="Kota / Alamat lengkap"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Desa / Lokasi</label>
            <input
              name="village"
              defaultValue={profile.village ?? ""}
              className={inputCls}
              placeholder="Nama desa atau lokasi usaha"
            />
          </div>
        </div>

        {/* Informasi Usaha */}
        <div className="p-5 sm:p-6 border-t border-gray-100 space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Informasi Usaha</h3>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Cerita / Tentang Saya
            </label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={profile.bio ?? ""}
              className={textareaCls}
              placeholder="Ceritakan tentang usaha tani Anda, pengalaman, atau fokus komoditas..."
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Pengalaman</label>
              <input
                name="farmingExperience"
                defaultValue={profile.farmingExperience ?? ""}
                className={inputCls}
                placeholder="contoh: 5 tahun"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Luas Lahan</label>
              <input
                name="farmArea"
                defaultValue={profile.farmArea ?? ""}
                className={inputCls}
                placeholder="contoh: 2,5 ha"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Metode Bertani</label>
              <input
                name="farmingMethod"
                defaultValue={profile.farmingMethod ?? ""}
                className={inputCls}
                placeholder="contoh: Organik"
              />
            </div>
          </div>
        </div>

        {/* Keamanan */}
        <div className="p-5 sm:p-6 border-t border-gray-100">
          <div className="flex items-start gap-3 mb-4">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <KeyRound size={15} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Keamanan</h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Kosongkan kedua kolom jika tidak ingin mengganti kata sandi.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="current-password" className="block text-xs font-medium text-gray-600 mb-1.5">
                Sandi Saat Ini
              </label>
              <input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan sandi saat ini"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-xs font-medium text-gray-600 mb-1.5">
                Sandi Baru
              </label>
              <input
                id="new-password"
                name="newPassword"
                type="password"
                minLength={6}
                autoComplete="new-password"
                placeholder="Minimal 6 karakter"
                className={inputCls}
              />
            </div>
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck size={12} className="text-primary" />
            Sandi disimpan terenkripsi dan tidak dapat dilihat siapa pun.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50/80">
          {state ? (
            <p className={`text-sm flex-1 ${state.success ? "text-green-600" : "text-red-500"}`}>
              {state.message}
            </p>
          ) : (
            <p className="text-xs text-gray-400 flex-1">Pastikan data sudah benar sebelum menyimpan.</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
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

      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
    </>
  );
}
