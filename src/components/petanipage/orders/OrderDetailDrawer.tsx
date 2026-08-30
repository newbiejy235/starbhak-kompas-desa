"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Package,
  Printer,
  Truck,
  XCircle,
} from "lucide-react";
import { getOrderById } from "@/actions/order";
import { useFetch } from "@/lib/hooks";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatImage } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  formatDateTime,
  formatNumber,
  formatRupiah,
} from "@/lib/format";
import type { FarmerOrder } from "@/lib/types/market";
import { nextActionLabel, nextOrderStatus } from "./statusFlow";

/* ---------------------- TIMELINE ---------------------- */
const STEPS = ["pending", "confirmed", "processing", "shipped", "completed"] as const;
const STEP_LABEL: Record<string, string> = {
  pending: "Pesanan Dibuat",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
};
const STEP_ICON: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: Check,
  processing: Package,
  shipped: Truck,
  completed: CheckCircle2,
};

function OrderTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3">
        <XCircle size={20} className="shrink-0 text-danger" />
        <div>
          <p className="text-sm font-bold text-danger">Pesanan Dibatalkan</p>
          <p className="text-xs text-gray-500">
            Pesanan ini dibatalkan dan stok telah dikembalikan.
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(status as (typeof STEPS)[number]);
  return (
    <div className="flex items-start justify-between gap-1 overflow-x-auto sm:gap-0">
      {STEPS.map((step, idx) => {
        const Icon = STEP_ICON[step];
        const done = idx < currentIdx;
        const current = idx === currentIdx;
        const active = done || current;
        return (
          <div key={step} className="flex min-w-[64px] flex-1 flex-col items-center">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                active ? "border-primary bg-primary" : "border-gray-200 bg-white"
              }`}
            >
              <Icon size={16} className={active ? "text-white" : "text-gray-400"} />
            </div>
            <p
              className={`mt-2 text-center text-[11px] font-semibold leading-tight ${
                active ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {STEP_LABEL[step]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------- SMALL PRIMITIVES ---------------------- */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-bold text-gray-900" : "text-gray-500"}>{label}</span>
      <span className={bold ? "font-bold text-primary" : "font-semibold text-gray-800"}>
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-gray-200/80 bg-white">
      {title && (
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ---------------------- DRAWER ---------------------- */
interface OrderDetailDrawerProps {
  orderId: number;
  summary: FarmerOrder;
  /** Bertambah setiap kali data berubah agar detail ikut ter-refresh. */
  version: number;
  onClose: () => void;
  onAdvance: (id: number, status: string) => void;
  onCancelRequest: (order: FarmerOrder) => void;
  advancingKey: string | null;
}

export default function OrderDetailDrawer({
  orderId,
  summary,
  version,
  onClose,
  onAdvance,
  onCancelRequest,
  advancingKey,
}: OrderDetailDrawerProps) {
  const [tab, setTab] = useState<"detail" | "invoice">("detail");
  const { data: detail, loading } = useFetch(
    () => getOrderById(orderId),
    [orderId, version],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const status = detail?.status ?? summary.status;
  const next = nextOrderStatus(status);
  const actionLabel = nextActionLabel(status);
  const busy = advancingKey !== null;

  const qty = detail?.quantity ?? summary.quantity;
  const unitPrice = detail?.unitPrice ?? summary.unitPrice;
  const subtotal = detail?.subtotal ?? summary.subtotal;
  const serviceFee = detail?.serviceFee ?? summary.serviceFee;
  const deliveryFee = detail?.deliveryFee ?? summary.deliveryFee;
  const totalPrice = detail?.totalPrice ?? summary.totalPrice;
  const unit = detail?.commodityUnit;

  const paymentStatus = detail?.paymentStatus ?? summary.paymentStatus ?? "pending";
  const paymentMethod =
    detail?.paymentMethod ?? summary.paymentMethod ?? null;
  const qtyLabel = unit ? `${formatNumber(qty)} ${unit}` : formatNumber(qty);
  const img = formatImage(detail?.commodityImage ?? summary.commodityImage) ?? formatImage(detail?.commodityImages?.[0] ?? summary.commodityImages?.[0] ?? null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in-fast bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detail pesanan ${summary.orderCode}`}
        className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[#F8FAF9] shadow-lift animate-scale-in sm:h-auto sm:max-h-[calc(100vh-2rem)]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail pesanan"
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-900">
              {summary.orderCode}
            </p>
            <p className="text-xs text-gray-500">{formatDateTime(summary.createdAt)}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-1 border-b border-gray-100 bg-white px-5 pt-3">
          {[
            { id: "detail" as const, label: "Detail Pesanan" },
            { id: "invoice" as const, label: "Invoice" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition-colors"
              style={{
                borderColor: tab === t.id ? "#025246" : "transparent",
                color: tab === t.id ? "#025246" : "#6B7280",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {loading && !detail ? (
            <>
              <Skeleton className="h-24 rounded-card" />
              <Skeleton className="h-48 rounded-card" />
              <Skeleton className="h-40 rounded-card" />
            </>
          ) : tab === "detail" ? (
            <>
              <SectionCard title="Status Transaksi">
                <OrderTimeline status={status} />
              </SectionCard>

              <SectionCard title="Komoditas">
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {img ? (
                      <Image
                        src={img}
                        alt={summary.commodityName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-xl font-black text-white">
                        {summary.commodityName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">{summary.commodityName}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {qtyLabel} × {formatRupiah(unitPrice)}
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Pembeli"
                action={
                  <Link
                    href="/petani/chat"
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <MessageCircle size={13} /> Buka Chat
                  </Link>
                }
              >
                <div className="space-y-2">
                  <Field label="Nama" value={summary.buyerName} />
                  <Field label="Telepon" value={summary.buyerNoTelp ?? "—"} />
                  {(detail?.deliveryAddress || summary.deliveryAddress) && (
                    <div className="flex items-start gap-1 text-sm">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                      <span className="font-semibold text-gray-800">
                        {detail?.deliveryAddress || summary.deliveryAddress}
                      </span>
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Pembayaran">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Status</p>
                    <StatusBadge
                      status={paymentStatus}
                      label={PAYMENT_STATUS_LABEL[paymentStatus]}
                    />
                  </div>
                  <Field
                    label="Metode"
                    value={
                      paymentMethod
                        ? PAYMENT_METHOD_LABEL[paymentMethod] ?? paymentMethod
                        : "—"
                    }
                  />
                  <Field label="Referensi" value={detail?.paymentReference ?? "—"} />
                  <Field
                    label="Tanggal Bayar"
                    value={
                      detail?.paymentPaidAt ? formatDateTime(detail.paymentPaidAt) : "—"
                    }
                  />
                </div>
                {paymentStatus === "pending" && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    <AlertTriangle size={14} /> Pembeli belum menyelesaikan pembayaran.
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Rincian Harga">
                <div className="space-y-2 text-sm">
                  <Row
                    label={`Komoditas (${qtyLabel} × ${formatRupiah(unitPrice)})`}
                    value={formatRupiah(subtotal)}
                  />
                  <Row label="Biaya Layanan" value={formatRupiah(serviceFee)} />
                  <Row label="Biaya Pengiriman" value={formatRupiah(deliveryFee)} />
                  <div className="mt-2 border-t border-gray-100 pt-2">
                    <Row label="Total" value={formatRupiah(totalPrice)} bold />
                  </div>
                </div>
              </SectionCard>

              {summary.notes && (
                <SectionCard title="Catatan Pembeli">
                  <p className="text-sm italic text-gray-800">&ldquo;{summary.notes}&rdquo;</p>
                </SectionCard>
              )}
            </>
          ) : (
            /* ---------- INVOICE ---------- */
            <SectionCard>
              <div className="rounded-xl border border-gray-200 p-6">
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-lg font-black text-primary">Kompas Desa</p>
                    <p className="text-xs text-gray-500">Invoice / {summary.orderCode}</p>
                  </div>
                  <p className="text-right text-xs text-gray-500">
                    {formatDateTime(summary.createdAt)}
                  </p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Penjual</p>
                    <p className="font-semibold text-gray-800">{detail?.farmerName ?? "—"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Pembeli</p>
                    <p className="font-semibold text-gray-800">{summary.buyerName}</p>
                    {(detail?.deliveryAddress || summary.deliveryAddress) && (
                      <p className="text-xs text-gray-500">
                        {detail?.deliveryAddress || summary.deliveryAddress}
                      </p>
                    )}
                  </div>
                </div>

                <table className="mb-4 w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="pb-2 text-left font-medium">Item</th>
                      <th className="pb-2 text-right font-medium">Jumlah</th>
                      <th className="pb-2 text-right font-medium">Harga</th>
                      <th className="pb-2 text-right font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="py-2 text-gray-800">{summary.commodityName}</td>
                      <td className="py-2 text-right">{qtyLabel}</td>
                      <td className="py-2 text-right">{formatRupiah(unitPrice)}</td>
                      <td className="py-2 text-right">{formatRupiah(subtotal)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="ml-auto max-w-[220px] space-y-1.5 text-sm">
                  <Row label="Biaya Layanan" value={formatRupiah(serviceFee)} />
                  <Row label="Biaya Kirim" value={formatRupiah(deliveryFee)} />
                  <div className="mt-1.5 border-t border-gray-100 pt-1.5">
                    <Row label="Total" value={formatRupiah(totalPrice)} bold />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
                  <span>
                    Metode:{" "}
                    {paymentMethod
                      ? PAYMENT_METHOD_LABEL[paymentMethod] ?? paymentMethod
                      : "—"}
                  </span>
                  <StatusBadge
                    status={paymentStatus}
                    label={PAYMENT_STATUS_LABEL[paymentStatus]}
                  />
                </div>
              </div>

              {/* Cetak invoice via dialog print browser */}
              <div className="mt-4 flex">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                >
                  <Printer size={15} /> Cetak Invoice
                </button>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Footer actions */}
        {tab === "detail" && status !== "completed" && status !== "cancelled" && (
          <div className="flex shrink-0 gap-2 border-t border-gray-100 bg-white px-5 py-4">
            {status === "pending" && (
              <button
                type="button"
                onClick={() => onCancelRequest(summary)}
                disabled={busy}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                Batalkan
              </button>
            )}
            {next && actionLabel && (
              <button
                type="button"
                onClick={() => onAdvance(orderId, next)}
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-60"
              >
                {advancingKey === `${orderId}-${next}` ? "Memproses..." : actionLabel}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
