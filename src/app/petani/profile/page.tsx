"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { getProfile, updateProfile } from "@/actions/profile";
import { getClientUser, saveSession } from "@/lib/auth/client";
import { formatDate, ROLE_LABEL, BUSINESS_TYPE_LABEL } from "@/lib/format";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  CircleUser,
  Mail,
  Phone,
  MapPin,
  UserRound,
  Camera,
  Trash2,
  Loader2,
  Shield,
  CalendarDays,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
  Save,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import type { AuthUser } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";
import ImageCropModal from "@/components/ui/ImageCropModal";
import { toast } from "sonner";

/* ============================================================
   Design system lokal
   ============================================================ */
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-150 hover:border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

const labelCls = "block text-xs font-medium text-gray-700 mb-1.5";

/* ============================================================
   Helpers
   ============================================================ */

/**
 * Kelengkapan profil dihitung dari field nyata yang ada — tanpa nilai hardcode.
 */
function getProfileCompletion(p: AuthUser): number {
  const fields: (string | null | undefined)[] = [
    p.fullName,
    p.username,
    p.email,
    p.noTelp,
    p.address,
    p.fotoProfile,
    p.businessType,
  ];
  const filled = fields.filter((v) => Boolean(v && v.trim())).length;
  return Math.round((filled / fields.length) * 100);
}

/* ============================================================
   Komponen kecil
   ============================================================ */
function FieldSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="flex gap-6">
        <Skeleton className="w-[380px] h-[420px] rounded-2xl" />
        <Skeleton className="flex-1 h-[420px] rounded-2xl" />
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E4F1EB] text-[#025246]"
      >
        <Icon size={15} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  valueClass = "",
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  valueClass?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 flex items-start gap-1.5 text-sm font-medium text-gray-900">
        <Icon size={14} aria-hidden className="mt-0.5 shrink-0 text-primary" />
        <span className={`min-w-0 break-words ${valueClass}`}>
          {value && value.trim() ? value : "-"}
        </span>
      </p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Hero */}
        <div className="mt-6 rounded-card border border-gray-200/80 bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <Skeleton className="h-20 w-20 shrink-0 rounded-full sm:h-24 sm:w-24" />
              <div className="min-w-0 space-y-2.5">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3.5 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton className="hidden h-10 w-40 md:block" />
          </div>
        </div>

        {/* Settings + Sidebar */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-6 rounded-card border border-gray-200/80 bg-white p-5 sm:p-7">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3.5 w-72" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>

            <FieldSkeleton />
            <Skeleton className="h-20 w-full rounded-xl" />

            <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
              <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>

            <div className="grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-6">
              <Skeleton className="h-11 w-44 rounded-xl" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3 rounded-card border border-[#E4F1EB] bg-[#F3F8F5] p-5">
              <div className="flex items-baseline justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-7 w-12" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-3 w-full" />
            </div>

            <div className="space-y-4 rounded-card border border-gray-200/80 bg-white p-5 shadow-soft">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-44" />
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full max-w-[220px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   Form pengaturan profil (identitas + kontak + foto + keamanan)
   ============================================================ */
function ProfileSettings({
  p,
  state,
  isPending,
  formAction,
}: {
  p: AuthUser;
  state: ActionState | null;
  isPending: boolean;
  formAction: (formData: FormData) => void;
}) {
  const [photoUrl, setPhotoUrl] = useState(p.fotoProfile ?? "");
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = photoUrl.trim() !== "" && !photoFailed;

  return (
    <form action={formAction} className="rounded-card border border-gray-200/80 bg-white shadow-soft">
      <div className="p-5 sm:p-7">
        <h2 className="text-lg font-bold text-gray-900">Pengaturan Profil</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Perbarui informasi pribadi dan kontak yang digunakan di Kompas Desa.
        </p>

        {/* Informasi Pribadi */}
        <section aria-label="Informasi pribadi" className="mt-6">
          <SectionHeader
            icon={UserRound}
            title="Informasi Pribadi"
            description="Gunakan nama yang mudah dikenali oleh pengguna lain."
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className={labelCls}>
                Nama Lengkap <span className="text-danger">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                required
                autoComplete="name"
                defaultValue={p.fullName}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="username" className={labelCls}>
                Nama Pengguna <span className="text-danger">*</span>
              </label>
              <input
                id="username"
                name="username"
                required
                autoComplete="username"
                defaultValue={p.username}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Informasi Kontak */}
        <section
          aria-label="Informasi kontak"
          className="mt-6 border-t border-gray-100 pt-6"
        >
          <SectionHeader
            icon={Phone}
            title="Informasi Kontak"
            description="Nomor dan alamat digunakan untuk keperluan transaksi."
          />
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="noTelp" className={labelCls}>
                Nomor Telepon <span className="text-danger">*</span>
              </label>
              <input
                id="noTelp"
                name="noTelp"
                required
                inputMode="tel"
                autoComplete="tel"
                defaultValue={p.noTelp}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="address" className={labelCls}>
                Alamat
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                autoComplete="street-address"
                defaultValue={p.address ?? ""}
                className={`${inputCls} resize-y`}
              />
            </div>
          </div>
        </section>

        {/* Foto Profil */}
        <section
          aria-label="Foto profil"
          className="mt-6 border-t border-gray-100 pt-6"
        >
          <SectionHeader
            icon={Camera}
            title="Foto Profil"
            description="Gunakan foto yang jelas untuk membantu mengenali akun Anda."
          />
          <div className="mt-4 flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-[#E4F1EB]">
              {showPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Pratinjau foto profil"
                  onError={() => setPhotoFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="flex h-full w-full items-center justify-center bg-[#E4F1EB] text-base font-bold text-[#025246]"
                >
                  {(p.fullName?.charAt(0) ?? "U").toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor="fotoProfile" className={labelCls}>
                URL Foto Profil
              </label>
              <input
                id="fotoProfile"
                name="fotoProfile"
                autoComplete="url"
                placeholder="https://..."
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.target.value);
                  setPhotoFailed(false);
                }}
                className={inputCls}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Masukkan URL gambar untuk foto profil Anda.
              </p>
            </div>
          </div>
        </section>

        {/* Keamanan Akun */}
        <section
          aria-label="Keamanan akun"
          className="mt-6 border-t border-gray-100 pt-6"
        >
          <SectionHeader
            icon={LockKeyhole}
            title="Keamanan Akun"
            description="Kosongkan jika Anda tidak ingin mengubah kata sandi."
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="currentPassword" className={labelCls}>
                Sandi Saat Ini
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className={labelCls}>
                Sandi Baru
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                className={inputCls}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Footer aksi + umpan balik */}
      <div className="flex flex-col gap-4 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div aria-live="polite" className="min-w-0 flex-1">
          {state && (
            <div
              className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm animate-fade-in ${state.success
                ? "border-success/20 bg-success/10 text-success"
                : "border-danger/20 bg-danger/10 text-danger"
                }`}
            >
              {state.success ? (
                <CheckCircle2 size={16} aria-hidden className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={16} aria-hidden className="mt-0.5 shrink-0" />
              )}
              <span className="font-medium">{state.message}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[190px]"
        >
          {isPending ? (
            <>
              <Loader2 size={16} aria-hidden className="animate-spin" />
              Menyimpan Perubahan...
            </>
          ) : (
            <>
              <Save size={16} aria-hidden />
              Simpan Perubahan
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ============================================================
   Sidebar pendukung: kelengkapan + informasi akun (read-only)
   ============================================================ */
function ProfileSidebar({ p, completion }: { p: AuthUser; completion: number }) {
  return (
    <aside className="space-y-6">
      {/* Kelengkapan Profil */}
      <section
        aria-label="Kelengkapan profil"
        className="rounded-card border border-[#E4F1EB] bg-[#F3F8F5] p-5"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Kelengkapan Profil</h3>
          <span className="text-2xl font-black tabular-nums text-primary">
            {completion}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={completion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Kelengkapan profil"
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-white"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          {completion >= 100
            ? "Informasi profil Anda sudah lengkap."
            : "Lengkapi informasi profil Anda agar data akun tetap informatif."}
        </p>
      </section>

      {/* Informasi Akun (read-only) */}
      <section
        aria-label="Informasi akun"
        className="rounded-card border border-gray-200/80 bg-white p-5 shadow-soft"
      >
        <h3 className="text-sm font-semibold text-gray-900">Informasi Akun</h3>
        <p className="mt-0.5 text-xs text-gray-500">
          Data akun Anda yang terdaftar di Kompas Desa.
        </p>
        <div className="mt-4 space-y-4">
          <InfoItem icon={Mail} label="Email" value={p.email} valueClass="break-all" />
          <InfoItem icon={Phone} label="Nomor Telepon" value={p.noTelp} />
          {p.businessType && (
            <InfoItem
              icon={Building2}
              label="Jenis Usaha"
              value={BUSINESS_TYPE_LABEL[p.businessType] ?? p.businessType}
            />
          )}
          <InfoItem icon={MapPin} label="Alamat" value={p.address} />
        </div>
      </section>
    </aside>
  );
}

/* ============================================================
   Page
   ============================================================ */
export default function PetaniProfile() {
  const user = getClientUser();
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
        toast.success("Profil berhasil diperbarui");
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

  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── Left Column: Profile Identity ─── */}
        <div className="lg:w-[380px] shrink-0 space-y-5">
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-[#025246] to-[#047857]" />
            <div className="px-6 pb-6 -mt-12 text-center">
              <div className="relative inline-block">
                <Avatar src={currentFoto} name={p.fullName} size="xl" className="w-24 h-24 text-3xl ring-4 ring-white shadow-lg" />
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Informasi Akun</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#025246]/10 flex items-center justify-center shrink-0">
                  <Mail size={15} className="text-[#025246]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">Email</p>
                  <p className="text-gray-800 truncate">{p.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#025246]/10 flex items-center justify-center shrink-0">
                  <Phone size={15} className="text-[#025246]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">Telepon</p>
                  <p className="text-gray-800">{p.noTelp}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#025246]/10 flex items-center justify-center shrink-0">
                  <CircleUser size={15} className="text-[#025246]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">Peran</p>
                  <p className="text-gray-800">{ROLE_LABEL[p.role]}</p>
                </div>
              </div>
              {p.businessType && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#025246]/10 flex items-center justify-center shrink-0">
                    <UserRound size={15} className="text-[#025246]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400">Jenis Usaha</p>
                    <p className="text-gray-800">{BUSINESS_TYPE_LABEL[p.businessType] ?? p.businessType}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#025246]/10 flex items-center justify-center shrink-0">
                  <MapPin size={15} className="text-[#025246]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">Alamat</p>
                  <p className="text-gray-800">{p.address || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#025246]/10 flex items-center justify-center shrink-0">
                  <CalendarDays size={15} className="text-[#025246]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400">Terdaftar</p>
                  <p className="text-gray-800">{formatDate(p.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Edit Form ─── */}
        <div className="flex-1 min-w-0">
          <form action={formAction} className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Photo Section */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Foto Profil</h3>
              <div className="flex items-center gap-5">
                <Avatar src={currentFoto} name={p.fullName} size="lg" className="w-20 h-20 text-2xl" />
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#025246] text-white text-xs font-bold rounded-xl hover:bg-[#024036] cursor-pointer transition-colors"
                  >
                    <Camera size={14} />
                    {p.fotoProfile || selectedFile ? "Ganti Foto" : "Pilih Foto"}
                  </label>
                  {(p.fotoProfile || selectedFile) && (
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

            {/* Form Fields */}
            <div className="p-6 space-y-5">
              <h3 className="text-sm font-semibold text-gray-900">Informasi Profil</h3>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Alamat</label>
                  <input name="address" defaultValue={p.address ?? ""} className={inputCls} placeholder="Kota / Alamat lengkap" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50">
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
                className="px-8 py-3 bg-[#025246] text-white text-sm font-bold rounded-xl hover:bg-[#024036] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
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