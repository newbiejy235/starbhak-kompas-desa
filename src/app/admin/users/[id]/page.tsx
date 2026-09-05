"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Ban,
  RotateCcw,
  ShoppingBag,
  ScrollText,
  Boxes,
} from "lucide-react";
import {
  getAdminUserDetail,
  suspendUserAccount,
  restoreUserAccount,
} from "@/actions/admin";
import { getClientUser } from "@/lib/auth/client";
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatRupiah,
  ROLE_LABEL,
  BUSINESS_TYPE_LABEL,
} from "@/lib/format";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import ReasonDialog from "@/components/adminpage/ReasonDialog";
import { useFetch } from "@/lib/hooks";
import { toast } from "sonner";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const admin = getClientUser();

  const { data: user, loading, error, reload } = useFetch(
    () => getAdminUserDetail(id),
    [id],
  );

  const [dialog, setDialog] = useState<
    null | { type: "suspend" } | { type: "restore" }
  >(null);
  const [pending, setPending] = useState(false);

  if (loading) return <LoadingState label="Memuat detail pengguna..." />;
  if (error || !user) {
    return (
      <ErrorState
        title="Pengguna tidak ditemukan"
        message="Data pengguna tidak dapat dimuat."
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

  const isSelf = admin?.id === id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary transition"
        >
          <ArrowLeft size={14} /> Kembali
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-neutral-900 truncate">Detail Pengguna</h1>
          <p className="text-sm text-gray-500">Profil, aktivitas, dan riwayat pesanan pengguna.</p>
        </div>
        <StatusBadge status={user.status} label={user.status === "verified" ? "Aktif" : user.status} />
        <StatusBadge status={user.role} label={ROLE_LABEL[user.role]} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-2xl font-bold text-white overflow-hidden">
                {user.fotoProfile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.fotoProfile} alt={user.fullName} className="h-full w-full object-cover" />
                ) : (
                  user.fullName?.charAt(0)?.toUpperCase() ?? "?"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-gray-900 truncate">{user.fullName}</h2>
                <p className="text-sm text-gray-400">@{user.username} · ID #{user.id}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <StatusBadge status={user.status} />
                  <StatusBadge status={user.role} label={ROLE_LABEL[user.role]} />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {!isSelf && user.status === "verified" && (
                  <button
                    type="button"
                    onClick={() => setDialog({ type: "suspend" })}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-danger/10 px-4 py-2.5 text-xs font-bold text-danger hover:bg-danger hover:text-white transition"
                  >
                    <Ban size={14} /> Tangguhkan
                  </button>
                )}
                {!isSelf && user.status === "suspended" && (
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
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={15} className="text-gray-400 shrink-0" />
                {user.noTelp}
              </div>
              <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                <MapPin size={15} className="text-gray-400 shrink-0" />
                <span className="truncate">{user.address || user.village || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={15} className="text-gray-400 shrink-0" />
                Terdaftar {formatDate(user.createdAt)}
              </div>
              {user.businessType && (
                <div className="flex items-center gap-2 text-gray-600">
                  Tipe bisnis: {BUSINESS_TYPE_LABEL[user.businessType] ?? user.businessType}
                </div>
              )}
            </dl>

            {user.bio && (
              <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                <p className="whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}
          </section>

          {/* Pesanan */}
          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" /> Riwayat Pesanan
            </h2>
            {user.orders.length === 0 ? (
              <EmptyState title="Belum Ada Pesanan" message="Pengguna ini belum memiliki pesanan." />
            ) : (
              <div className="space-y-2">
                {user.orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900">{o.orderCode}</span>
                      <span className="block truncate text-xs text-gray-400">
                        {o.commodityName} · {formatDateTime(o.createdAt)}
                      </span>
                    </span>
                    <span className="text-sm font-extrabold text-primary">{formatRupiah(o.totalPrice)}</span>
                    <StatusBadge status={o.status} />
                    <StatusBadge status={o.paymentStatus ?? "pending"} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-3">
            {user.role === "petani"
              ? [
                  ["Komoditas", formatNumber(user.commodityCount)],
                  ["Total Pesanan", formatNumber(user.totalOrders)],
                  ["Pesanan Aktif", formatNumber(user.activeOrders)],
                  ["Pesanan Selesai", formatNumber(user.completedOrders)],
                ]
              : [
                  ["Total Order", formatNumber(user.totalOrders)],
                  ["Order Aktif", formatNumber(user.activeOrders)],
                  ["Order Selesai", formatNumber(user.completedOrders)],
                  ["Total Belanja", formatRupiah(user.totalSpent)],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white rounded-card border border-gray-200/80 shadow-soft p-4">
                    <p className="text-lg font-extrabold text-gray-900 truncate">{value}</p>
                    <p className="text-[11px] text-gray-400">{label}</p>
                  </div>
                ))}
          </section>

          {user.role === "petani" && (
            <Link
              href={`/admin/farmers/${user.id}`}
              className="flex items-center gap-3 rounded-card border border-gray-200/80 bg-white p-4 shadow-soft hover:border-primary/40 transition-all"
            >
              <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Boxes size={17} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-gray-800">Buka Detail Petani</span>
                <span className="block text-xs text-gray-400">Profil petani, komoditas, dan verifikasi</span>
              </span>
            </Link>
          )}

          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ScrollText size={18} className="text-primary" /> Aktivitas Admin
            </h2>
            {user.activity.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-xl">
                Belum ada aktivitas admin terkait pengguna ini.
              </p>
            ) : (
              <ul className="space-y-3">
                {user.activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800">{a.action}</p>
                      {a.reason && <p className="text-xs text-gray-500 truncate">{a.reason}</p>}
                      <p className="text-[11px] text-gray-300">{formatDateTime(a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <ReasonDialog
        open={dialog?.type === "suspend"}
        title={`Tangguhkan akun "${user.fullName}"?`}
        message="Akun tidak dapat login sampai dipulihkan."
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
        title={`Pulihkan akun "${user.fullName}"?`}
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