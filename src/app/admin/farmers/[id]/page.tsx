"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Store,
  Boxes,
  ArrowLeft,
  Star,
  Ban,
  RotateCcw,
  BadgeCheck,
  PackageCheck,
  Undo2,
} from "lucide-react";
import {
  getAdminFarmerDetail,
  suspendUserAccount,
  restoreUserAccount,
} from "@/actions/admin";
import { getClientUser } from "@/lib/auth/client";
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatRupiah,
} from "@/lib/format";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import ReasonDialog from "@/components/adminpage/ReasonDialog";
import { useFetch } from "@/lib/hooks";
import { toast } from "sonner";

export default function AdminFarmerDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = Number(params.id);
  const admin = getClientUser();
  const fromReview = searchParams.get("from") === "verification";

  const { data: farmer, loading, error, reload } = useFetch(
    () => getAdminFarmerDetail(id),
    [id],
  );

  const [dialog, setDialog] = useState<
    null | { type: "suspend" } | { type: "restore" }
  >(null);
  const [pending, setPending] = useState(false);

  if (loading) return <LoadingState label="Memuat detail petani..." />;
  if (error || !farmer) {
    return (
      <ErrorState
        title="Petani tidak ditemukan"
        message="Data petani tidak dapat dimuat."
        onRetry={reload}
      />
    );
  }

  const runSuspend = async (reason?: string) => {
    if (!admin) return;
    setPending(true);
    try {
      const res = await suspendUserAccount(id, reason ?? null, admin.id);
      if (!res.success) toast.error(res.message);
      else {
        toast.success(res.message);
        setDialog(null);
        reload();
      }
    } finally {
      setPending(false);
    }
  };

  const runRestore = async () => {
    if (!admin) return;
    setPending(true);
    try {
      const res = await restoreUserAccount(id, admin.id);
      if (!res.success) toast.error(res.message);
      else {
        toast.success(res.message);
        setDialog(null);
        reload();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={fromReview ? `/admin/verification/commodities` : "/admin/farmers"}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary transition"
        >
          <ArrowLeft size={14} />
          {fromReview ? "Daftar Verifikasi" : "Kembali"}
        </Link>
        {fromReview && (
          <Link
            href="/admin/verification"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-primary hover:border-primary transition"
          >
            <Undo2 size={14} /> Kembali ke Review
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-neutral-900 truncate">
            Detail Petani
          </h1>
          <p className="text-sm text-gray-500">Profil, verifikasi, dan aktivitas petani.</p>
        </div>
        <StatusBadge status={farmer.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profil */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-2xl font-bold text-white overflow-hidden">
                {farmer.fotoProfile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={farmer.fotoProfile} alt={farmer.fullName} className="h-full w-full object-cover" />
                ) : (
                  farmer.fullName?.charAt(0)?.toUpperCase() ?? "?"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-gray-900 truncate">{farmer.fullName}</h2>
                <p className="text-sm text-gray-400">@{farmer.username}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <StatusBadge status={farmer.status} />
                  {farmer.status === "pending" && (
                    <Link
                      href={`/admin/verification/farmers/${farmer.id}`}
                      className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success hover:bg-success hover:text-white transition"
                    >
                      <BadgeCheck size={12} /> Review Verifikasi
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {farmer.status === "verified" && (
                  <button
                    type="button"
                    onClick={() => setDialog({ type: "suspend" })}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-danger/10 px-4 py-2.5 text-xs font-bold text-danger hover:bg-danger hover:text-white transition"
                  >
                    <Ban size={14} /> Tangguhkan
                  </button>
                )}
                {farmer.status === "suspended" && (
                  <button
                    type="button"
                    onClick={() => setDialog({ type: "restore" })}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-success/10 px-4 py-2.5 text-xs font-bold text-success hover:bg-success hover:text-white transition"
                  >
                    <RotateCcw size={14} /> Pulihkan
                  </button>
                )}
              </div>
            </div>

            <dl className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={15} className="text-gray-400 shrink-0" />
                <span className="truncate">{farmer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={15} className="text-gray-400 shrink-0" />
                {farmer.noTelp}
              </div>
              <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                <MapPin size={15} className="text-gray-400 shrink-0" />
                <span className="truncate">{farmer.village || farmer.address || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={15} className="text-gray-400 shrink-0" />
                Bergabung {formatDate(farmer.createdAt)}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Star size={15} className="text-gray-400 shrink-0" />
                {farmer.avgRating ? `${Number(farmer.avgRating).toFixed(1)} / 5` : "Belum ada rating"} ({farmer.reviewCount} ulasan)
              </div>
            </dl>

            {farmer.bio && (
              <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-700 mb-1">Bio</p>
                <p className="whitespace-pre-wrap">{farmer.bio}</p>
              </div>
            )}

            {(farmer.farmingExperience || farmer.farmArea || farmer.farmingMethod) && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ["Pengalaman", farmer.farmingExperience],
                  ["Luas Lahan", farmer.farmArea],
                  ["Metode", farmer.farmingMethod],
                ]
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div key={label as string} className="rounded-xl border border-gray-100 px-3 py-2.5">
                      <p className="text-[11px] text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {/* Komoditas */}
          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Boxes size={18} className="text-primary" /> Komoditas ({farmer.commodities.length})
            </h2>
            {farmer.commodities.length === 0 ? (
              <EmptyState title="Belum Ada Komoditas" message="Petani ini belum menambahkan komoditas." />
            ) : (
              <div className="space-y-2">
                {farmer.commodities.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/commodities/${c.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-sm font-bold text-amber-600 overflow-hidden">
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                      ) : (
                        c.name?.charAt(0)?.toUpperCase() ?? "?"
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900">{c.name}</span>
                      <span className="block truncate text-xs text-gray-400">
                        {c.categoryName} · {formatRupiah(c.price)} · {formatNumber(c.stock)} {c.unit}
                      </span>
                    </span>
                    <StatusBadge status={c.status} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Samping */}
        <div className="space-y-6">
          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PackageCheck size={18} className="text-primary" /> Informasi Verifikasi
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">Status</dt>
                <dd><StatusBadge status={farmer.status} /></dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">Pengajuan</dt>
                <dd className="text-gray-700">{formatDateTime(farmer.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">Direview</dt>
                <dd className="text-gray-700">{farmer.reviewedAt ? formatDateTime(farmer.reviewedAt) : "-"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">Reviewer</dt>
                <dd className="text-gray-700 truncate">{farmer.reviewer?.fullName ?? "-"}</dd>
              </div>
              {farmer.rejectedReason && (
                <div className="rounded-xl bg-danger/5 border border-danger/20 p-3">
                  <dt className="text-xs font-semibold text-danger mb-1">Alasan Penolakan</dt>
                  <dd className="text-sm text-gray-700 whitespace-pre-wrap">{farmer.rejectedReason}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="grid grid-cols-2 gap-3">
            {[
              ["Total Pesanan", formatNumber(farmer.totalOrders)],
              ["Pesanan Aktif", formatNumber(farmer.activeOrders)],
              ["Pesanan Selesai", formatNumber(farmer.completedOrders)],
              ["Pendapatan", formatRupiah(farmer.revenue)],
            ].map(([label, value]) => (
              <div key={label} className="bg-white rounded-card border border-gray-200/80 shadow-soft p-4">
                <p className="text-lg font-extrabold text-gray-900 truncate">{value}</p>
                <p className="text-[11px] text-gray-400">{label}</p>
              </div>
            ))}
          </section>

          {farmer.farmImages.length > 0 && (
            <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Store size={18} className="text-primary" /> Foto Usaha
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {farmer.farmImages.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={img.secureUrl}
                    alt={img.caption || "Foto usaha"}
                    className="h-20 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <ReasonDialog
        open={dialog?.type === "suspend"}
        title={`Tangguhkan petani "${farmer.fullName}"?`}
        message="Akun tidak dapat login dan komoditasnya tidak aktif. Dapat dipulihkan kapan saja."
        confirmLabel="Tangguhkan"
        tone="danger"
        requireReason
        reasonPlaceholder="Contoh: Melanggar aturan platform..."
        isPending={pending}
        onConfirm={runSuspend}
        onCancel={() => setDialog(null)}
      />

      <ReasonDialog
        open={dialog?.type === "restore"}
        title={`Pulihkan petani "${farmer.fullName}"?`}
        message="Akun akan kembali aktif."
        confirmLabel="Pulihkan"
        tone="success"
        isPending={pending}
        onConfirm={runRestore}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}