"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin,
  Package,
  Star,
  Store,
  ArrowLeft,
  Boxes,
  Scale,
  Banknote,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";
import { getAdminCommodityDetail, verifyCommodityAdmin } from "@/actions/admin";
import { getClientUser } from "@/lib/auth/client";
import {
  formatRupiah,
  formatNumber,
  formatDate,
  formatDateTime,
  COMMODITY_STATUS_LABEL,
} from "@/lib/format";
import { LoadingState, ErrorState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import ReasonDialog from "@/components/adminpage/ReasonDialog";
import { useFetch } from "@/lib/hooks";
import { toast } from "sonner";

export default function AdminCommodityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const admin = getClientUser();

  const { data: commodity, loading, error, reload } = useFetch(
    () => getAdminCommodityDetail(id),
    [id],
  );

  const [dialog, setDialog] = useState<
    null | { type: "approve" } | { type: "reject" }
  >(null);
  const [pending, setPending] = useState(false);

  if (loading) return <LoadingState label="Memuat detail komoditas..." />;
  if (error || !commodity) {
    return (
      <ErrorState
        title="Komoditas tidak ditemukan"
        message="Data komoditas tidak dapat dimuat."
        onRetry={reload}
      />
    );
  }

  const runAction = async (action: "verified" | "rejected", reason?: string) => {
    if (!admin) return;
    setPending(true);
    try {
      const res = await verifyCommodityAdmin(id, action, reason ?? null, admin.id);
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

  const images = [
    commodity.image,
    ...(Array.isArray(commodity.images) ? commodity.images : []),
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/commodities"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary transition"
        >
          <ArrowLeft size={14} /> Kembali
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-neutral-900 truncate">Detail Komoditas</h1>
          <p className="text-sm text-gray-500">Informasi lengkap komoditas dan petani pemiliknya.</p>
        </div>
        <StatusBadge status={commodity.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Produk */}
        <section className="lg:col-span-2 bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden">
          <div className="p-6 pb-4 border-b border-gray-100 flex items-center gap-2">
            <Package size={18} className="text-primary" />
            <h2 className="font-bold text-gray-900">Produk</h2>
          </div>

          {images.length > 0 ? (
            <div className="aspect-[16/7] bg-gray-50 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[0]} alt={commodity.name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="aspect-[16/7] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-7xl font-black text-white/90">
                {commodity.name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </div>
          )}

          <div className="p-6 space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900">{commodity.name}</h3>
                <StatusBadge status={commodity.status} />
              </div>
              <p className="text-xs text-gray-400">
                {commodity.categoryName} · Dibuat {formatDateTime(commodity.createdAt)}
              </p>
            </div>

            {commodity.description && (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{commodity.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-100 p-3">
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Banknote size={11} /> Harga
                </p>
                <p className="text-base font-extrabold text-primary">{formatRupiah(commodity.price)}</p>
                <p className="text-[11px] text-gray-400">/ {commodity.unit}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3">
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Scale size={11} /> Stok
                </p>
                <p className="text-base font-extrabold text-gray-900">
                  {formatNumber(commodity.stock)} {commodity.unit}
                </p>
                <p className="text-[11px] text-gray-400">Kualitas {commodity.quality}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3">
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <MapPin size={11} /> Lokasi
                </p>
                <p className="text-sm font-semibold text-gray-800 truncate">{commodity.location}</p>
              </div>
            </div>

            {(commodity.minPrice || commodity.maxPrice || commodity.minWeightForNego || commodity.fixedPrice) && (
              <div className="rounded-xl bg-amber-50/60 border border-amber-200/60 p-4">
                <p className="text-xs font-semibold text-amber-700 mb-2">Info Negosiasi</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  {commodity.minPrice && (
                    <p className="text-gray-600">
                      Min: <span className="font-semibold">{formatRupiah(commodity.minPrice)}</span>
                    </p>
                  )}
                  {commodity.maxPrice && (
                    <p className="text-gray-600">
                      Max: <span className="font-semibold">{formatRupiah(commodity.maxPrice)}</span>
                    </p>
                  )}
                  {commodity.minWeightForNego && (
                    <p className="text-gray-600">
                      Min. nego:{" "}
                      <span className="font-semibold">{formatNumber(commodity.minWeightForNego)} {commodity.unit}</span>
                    </p>
                  )}
                  {commodity.fixedPrice && (
                    <p className="text-gray-600">
                      Harga tetap: <span className="font-semibold">{formatRupiah(commodity.fixedPrice)}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-gray-400">Status</dt>
                <dd className="text-gray-700">{COMMODITY_STATUS_LABEL[commodity.status] ?? commodity.status}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-400">Dipublish</dt>
                <dd className="text-gray-700">{commodity.isPublished ? "Ya" : "Belum"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-400">Rating</dt>
                <dd className="text-gray-700">
                  {Number(commodity.rating) > 0 ? `${Number(commodity.rating).toFixed(1)} ⭐ (${commodity.reviewCount})` : "-"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-400">Estimasi Panen</dt>
                <dd className="text-gray-700">{commodity.harvestEstimate ? formatDate(commodity.harvestEstimate) : "-"}</dd>
              </div>
            </dl>

            {commodity.rejectedReason && (
              <div className="rounded-xl bg-danger/5 border border-danger/20 p-4">
                <p className="text-xs font-semibold text-danger mb-1">Alasan Penolakan</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{commodity.rejectedReason}</p>
                {commodity.reviewedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Direview {formatDateTime(commodity.reviewedAt)} oleh {commodity.reviewer?.fullName ?? "-"}
                  </p>
                )}
              </div>
            )}

            {commodity.status === "pending" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDialog({ type: "approve" })}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-success px-4 py-2.5 text-sm font-bold text-white hover:brightness-95 active:scale-[0.98] transition-all"
                >
                  <BadgeCheck size={16} /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => setDialog({ type: "reject" })}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-danger px-4 py-2.5 text-sm font-bold text-white hover:brightness-95 active:scale-[0.98] transition-all"
                >
                  Tolak
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Petani + Sales */}
        <div className="space-y-6">
          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Store size={18} className="text-primary" /> Petani
              </h2>
              <Link
                href={`/admin/farmers/${commodity.farmerId}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Detail Petani <ExternalLink size={12} />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-xl font-bold text-white overflow-hidden">
                {commodity.farmerFotoProfile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={commodity.farmerFotoProfile} alt={commodity.farmerName} className="h-full w-full object-cover" />
                ) : (
                  commodity.farmerName?.charAt(0)?.toUpperCase() ?? "?"
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{commodity.farmerName}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={11} /> {commodity.farmerVillage || "-"}
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={commodity.farmerStatus} />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Boxes size={18} className="text-primary" /> Informasi Penjualan
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center rounded-xl border border-gray-100 p-3">
                <p className="text-lg font-extrabold text-gray-900">{formatNumber(commodity.totalSold)}</p>
                <p className="text-[11px] text-gray-400">Terjual ({commodity.unit})</p>
              </div>
              <div className="text-center rounded-xl border border-gray-100 p-3">
                <p className="text-lg font-extrabold text-gray-900">{formatNumber(commodity.totalOrderCount)}</p>
                <p className="text-[11px] text-gray-400">Total Order</p>
              </div>
              <div className="text-center rounded-xl border border-gray-100 p-3">
                <p className="text-lg font-extrabold text-gray-900">{formatNumber(commodity.activeOrderCount)}</p>
                <p className="text-[11px] text-gray-400">Order Aktif</p>
              </div>
            </div>
            <div className="mt-3 text-center rounded-xl border border-gray-100 p-3">
              <p className="text-lg font-extrabold text-gray-900 flex items-center justify-center gap-1">
                {commodity.farmerAvgRating ? Number(commodity.farmerAvgRating).toFixed(1) : "-"}
                <Star size={14} className="text-amber-400 fill-amber-400" />
              </p>
              <p className="text-[11px] text-gray-400">Rating Petani ({commodity.farmerReviewCount} ulasan)</p>
            </div>
          </section>
        </div>
      </div>

      <ReasonDialog
        open={dialog?.type === "approve"}
        title={`Approve komoditas "${commodity.name}"?`}
        message="Komoditas akan ditandai terverifikasi dan dapat dipasarkan."
        confirmLabel="Approve Komoditas"
        tone="success"
        isPending={pending}
        onConfirm={() => runAction("verified")}
        onCancel={() => setDialog(null)}
      />

      <ReasonDialog
        open={dialog?.type === "reject"}
        title={`Tolak komoditas "${commodity.name}"?`}
        message="Alasan penolakan wajib diisi dan akan dikirim ke petani."
        confirmLabel="Tolak Komoditas"
        tone="danger"
        requireReason
        reasonPlaceholder="Contoh: Foto produk tidak jelas, informasi harga tidak lengkap..."
        isPending={pending}
        onConfirm={(reason) => runAction("rejected", reason)}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}