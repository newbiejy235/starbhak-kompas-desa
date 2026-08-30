"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CreditCard,
  Store,
  MapPin,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { getOrderById } from "@/actions/order";
import {
  formatRupiah,
  formatDate,
  formatDateTime,
  formatWeight,
  PAYMENT_METHOD_LABEL,
} from "@/lib/format";
import { formatImage } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";

const STEPS = [
  { key: "pending", label: "Pesanan Dibuat", icon: Clock },
  { key: "confirmed", label: "Dikonfirmasi", icon: CheckCircle2 },
  { key: "processing", label: "Diproses", icon: Package },
  { key: "shipped", label: "Dikirim", icon: Truck },
  { key: "completed", label: "Selesai", icon: CheckCircle2 },
] as const;

const STATUS_ORDER = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "completed",
] as const;

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold tracking-wide text-gray-900 mb-4 uppercase">
      {children}
    </h2>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 animate-fade-up">
      <Skeleton className="mb-6 h-4 w-24" />
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-5 w-24 rounded-full" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-soft divide-y divide-gray-100">
        <div className="p-6">
          <Skeleton className="mb-5 h-4 w-40" />
          <div className="flex items-center justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-6">
          <Skeleton className="mb-4 h-4 w-40" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
        <div className="p-6">
          <Skeleton className="mb-4 h-4 w-40" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <Skeleton className="mb-4 h-4 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: order, loading } = useFetch(
    () => getOrderById(Number(id)),
    [id],
  );

  if (loading) return <OrderDetailSkeleton />;

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-12 text-center text-gray-500 shadow-soft">
          Pesanan tidak ditemukan.
        </div>
      </div>
    );
  }

  const currentStep = STATUS_ORDER.indexOf(order.status as (typeof STATUS_ORDER)[number]);
  const cancelled = order.status === "cancelled";
  const isPaid = order.paymentStatus === "paid";
  const isFailed = order.paymentStatus === "failed";
  const isRefunded = order.paymentStatus === "refunded";

  const orderImage =
    formatImage(order.commodityImage) ??
    formatImage(order.commodityImages?.[0] ?? null);

  const goPay = () => router.push(`/user/payment/${order.id}`);
  const payMethodLabel = order.paymentMethod
    ? PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-up">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6"
        >
          <ChevronLeft size={16} /> Kembali
        </button>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              No. Pesanan
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
              {order.orderCode}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Dibuat {formatDateTime(order.createdAt)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {cancelled ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={22} />
            <div>
              <p className="text-sm font-bold text-red-800">
                Pesanan Dibatalkan
              </p>
              <p className="mt-1 text-sm text-red-700">
                Pesanan ini telah dibatalkan dan tidak dapat dilanjutkan.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-white rounded-2xl border border-gray-200/80 shadow-soft px-4 py-6 sm:px-8">
            <ol className="flex">
              {STEPS.map((s, i) => {
                const active = i <= currentStep;
                const done = i < currentStep;
                const last = i === STEPS.length - 1;
                return (
                  <li key={s.key} className={`flex items-start ${last ? "" : "flex-1"}`}>
                    <div className="flex w-full flex-col items-center">
                      <div className="flex w-full items-center">
                        <div
                          className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                            active
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 bg-white text-gray-300"
                          }`}
                        >
                          {done ? <CheckCircle2 size={18} /> : <s.icon size={18} />}
                        </div>
                        {!last && (
                          <span
                            className={`-mx-0.5 h-0.5 min-w-4 flex-1 ${
                              done ? "bg-primary" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                      <p
                        className={`mt-2 text-center text-[11px] leading-tight ${
                          active ? "font-semibold text-primary" : "text-gray-400"
                        }`}
                      >
                        {s.label}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-soft divide-y divide-gray-100 overflow-hidden">
          <section className="px-6 py-6">
            <SectionHeader>Pembayaran</SectionHeader>

            {isPaid ? (
              <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-5">
                <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={24} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-800">
                    Pembayaran Berhasil
                  </p>
                  <p className="text-sm text-green-700 mt-0.5">
                    Pembayaran telah dikonfirmasi.
                  </p>
                  <p className="mt-2 text-xs text-green-700">
                    Dibayar:{" "}
                    {formatDate(order.paymentPaidAt, true)}
                    {payMethodLabel ? ` · Metode: ${payMethodLabel}` : ""}
                  </p>
                </div>
              </div>
            ) : isRefunded ? (
              <div className="flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-200 p-5">
                <RotateCcw className="text-gray-500 shrink-0 mt-0.5" size={22} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    Pembayaran Dikembalikan
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Dana untuk pesanan ini telah dikembalikan.
                  </p>
                </div>
              </div>
            ) : isFailed ? (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-5">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={22} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-800">
                    Pembayaran Gagal
                  </p>
                  <p className="text-sm text-red-700 mt-0.5">
                    Pembayaran belum berhasil diproses.
                  </p>
                  <button
                    onClick={goPay}
                    className="mt-4 w-full sm:w-auto rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Coba Bayar Lagi
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-bold text-amber-800">
                  Menunggu Pembayaran
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  Selesaikan pembayaran untuk melanjutkan pesanan.
                </p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-amber-700">Total</p>
                    <p className="mt-0.5 text-xl font-extrabold text-amber-900">
                      {formatRupiah(order.totalPrice)}
                    </p>
                  </div>
                  <button
                    onClick={goPay}
                    className="w-full sm:w-auto rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="px-6 py-6">
            <SectionHeader>Detail Produk</SectionHeader>
            <div className="flex gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
                {orderImage ? (
                  <Image
                    src={orderImage}
                    alt={order.commodityName ?? "Komoditas"}
                    width={80}
                    height={80}
                    sizes="80px"
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-lg font-black text-white">
                    {order.commodityName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900">{order.commodityName}</h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  {formatWeight(order.quantity, order.commodityUnit)} ×{" "}
                  {formatRupiah(order.unitPrice)}
                </p>
                <p className="mt-2 text-sm font-semibold text-primary">
                  {formatRupiah(order.subtotal)}
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Store size={14} className="text-primary shrink-0" />
                <dt className="text-gray-400">Petani</dt>
                <dd className="font-medium text-gray-900">{order.farmerName}</dd>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={14} className="text-primary shrink-0" />
                <dt className="text-gray-400">Pengiriman</dt>
                <dd className="font-medium text-gray-900">
                  {order.deliveryMethod === "pickup"
                    ? "Pick Up (ambil di lokasi petani)"
                    : `Ekspedisi — ${order.deliveryAddress}`}
                </dd>
              </div>
              {order.notes && (
                <div className="flex items-start gap-2 text-gray-600">
                  <dt className="text-gray-400 shrink-0">Catatan</dt>
                  <dd className="italic text-gray-500">{order.notes}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="px-6 py-6">
            <SectionHeader>
              <span className="inline-flex items-center gap-2">
                <CreditCard size={15} className="text-primary" /> Ringkasan
                Pembayaran
              </span>
            </SectionHeader>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Subtotal</dt>
                <dd className="font-medium text-gray-900">
                  {formatRupiah(order.subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Biaya Layanan</dt>
                <dd className="font-medium text-gray-900">
                  {formatRupiah(order.serviceFee)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Ongkos Kirim</dt>
                <dd className="font-medium text-gray-900">
                  {formatRupiah(order.deliveryFee)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <dt className="font-bold text-gray-900">Total Pembayaran</dt>
                <dd className="text-xl font-extrabold text-primary">
                  {formatRupiah(order.totalPrice)}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {isPaid && (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-green-700">
              <CheckCircle2 size={18} /> Pembayaran Lunas
            </p>
          )}
          {cancelled && (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
              <AlertCircle size={18} /> Pesanan Dibatalkan
            </p>
          )}
          {order.status === "completed" && (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <CheckCircle2 size={18} /> Pesanan Selesai
            </p>
          )}
          <span className="flex-1" />
          <button
            onClick={() => router.push("/user/home")}
            className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary transition-colors"
          >
            Belanja Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
