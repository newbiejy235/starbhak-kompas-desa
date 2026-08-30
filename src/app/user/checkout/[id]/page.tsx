"use client";

import { useState } from "react";
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
  Loader2,
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
import { useAuth, useFetch } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="mb-6">
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mb-6 h-28 rounded-card" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-44 rounded-card" />
          <Skeleton className="h-64 rounded-card" />
        </div>
        <Skeleton className="h-48 rounded-card" />
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [snapError, setSnapError] = useState<string | null>(null);
  const { user } = useAuth();

  const { data: order, loading, reload } = useFetch(
    () => getOrderById(Number(id)),
    [id],
  );

  if (loading) return <OrderDetailSkeleton />;

  if (!order) {
    return (
      <div className="rounded-card border border-gray-200/80 bg-white p-10 text-center text-gray-500 shadow-soft">
        Pesanan tidak ditemukan.
      </div>
    );
  }

  const isPendingPayment = order.paymentStatus === "pending";
  const isPaid = order.paymentStatus === "paid";

  const loadSnapScript = (snapUrl: string) =>
    new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined" || window.snap) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = snapUrl;
      script.setAttribute(
        "data-client-key",
        (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ??
          process.env.NEXT_PUBLIC_CLIENT) ??
          "",
      );
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap"));
      document.head.appendChild(script);
    });

  const payNow = async () => {
    if (paying || !user) return;
    setPaying(true);
    setSnapError(null);
    try {
      const res = await fetch("/api/tokenizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error ?? "Gagal menyiapkan pembayaran");
      }

      await loadSnapScript(data.snapUrl);
      setPaying(false);

      window.snap?.pay(data.token, {
        onSuccess: () => {
          reload();
        },
        onPending: () => {
          reload();
        },
        onError: () => {
          reload();
          setSnapError("Terjadi kesalahan saat memproses pembayaran.");
        },
        onClose: () => {
          reload();
        },
      });
    } catch (e) {
      console.error(e);
      setPaying(false);
      setSnapError(
        e instanceof Error ? e.message : "Gagal menyiapkan pembayaran",
      );
    }
  };

  const steps = [
    { key: "pending", label: "Pesanan Dibuat", icon: Clock },
    { key: "confirmed", label: "Dikonfirmasi", icon: CheckCircle2 },
    { key: "processing", label: "Diproses", icon: Package },
    { key: "shipped", label: "Dikirim", icon: Truck },
    { key: "completed", label: "Selesai", icon: CheckCircle2 },
  ];

  const statusOrder = ["pending", "confirmed", "processing", "shipped", "completed"];
  const currentStep = statusOrder.indexOf(order.status);
  const cancelled = order.status === "cancelled";

  const orderImage =
    formatImage(order.commodityImage) ??
    formatImage(order.commodityImages?.[0] ?? null);

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <div className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-5 text-white flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70">No. Pesanan</p>
            <p className="font-bold text-lg">{order.orderCode}</p>
          </div>
          <div className="text-right">
            <StatusBadge status={order.status} />
            <p className="text-xs text-white/70 mt-1">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>

        {!cancelled && (
          <div className="p-6">
            <div className="flex items-center">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        i <= currentStep
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <s.icon size={18} />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        i < currentStep ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Store size={18} className="text-primary" /> Detail Produk
            </h2>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {orderImage ? (
                  <Image
                    src={orderImage}
                    alt={order.commodityName ?? "Komoditas"}
                    width={80}
                    height={80}
                    sizes="80px"
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-black">
                    {order.commodityName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{order.commodityName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatWeight(order.quantity, order.commodityUnit)} × {formatRupiah(order.unitPrice)}
                </p>
                <p className="text-sm font-semibold text-primary mt-2">
                  {formatRupiah(order.subtotal)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-sm space-y-1.5">
              <p className="flex items-center gap-2 text-gray-600">
                <Store size={14} className="text-primary" /> Petani: {order.farmerName}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <MapPin size={14} className="text-primary" />
                {order.deliveryMethod === "pickup"
                  ? "Metode: Pick Up (ambil di lokasi petani)"
                  : `Metode: Ekspedisi — ${order.deliveryAddress}`}
              </p>
              {order.notes && (
                <p className="text-gray-500 text-xs italic">Catatan: {order.notes}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-primary" /> Pembayaran
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Biaya Layanan</span>
                <span className="font-semibold">{formatRupiah(order.serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span className="font-semibold">{formatRupiah(order.deliveryFee)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold">Total Pembayaran</span>
                <span className="text-xl font-extrabold text-primary">
                  {formatRupiah(order.totalPrice)}
                </span>
              </div>
            </div>

            {isPendingPayment && (
              <div className="mt-6 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5">
                <p className="text-sm font-bold text-amber-800 mb-1">Menunggu Pembayaran</p>
                <p className="text-xs text-amber-700 mb-4">
                  Selesaikan pembayaran melalui Midtrans untuk pesanan {order.orderCode}.
                </p>

                <div className="rounded-xl bg-white border border-amber-200 p-4 mb-4 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-500">Total yang harus dibayar</span>
                  <span className="font-extrabold text-primary text-lg">
                    {formatRupiah(order.totalPrice)}
                  </span>
                </div>

                <button
                  onClick={payNow}
                  disabled={paying}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {paying ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <Loader2 size={16} className="animate-spin" /> Menyiapkan Pembayaran...
                    </span>
                  ) : (
                    "Bayar Sekarang"
                  )}
                </button>

                {snapError && (
                  <p className="mt-3 text-center text-xs font-medium text-red-600">{snapError}</p>
                )}
                <p className="mt-3 text-center text-[11px] text-amber-700">
                  Status pembayaran diperbarui otomatis setelah pembayaran Anda dikonfirmasi Midtrans.
                </p>
              </div>
            )}

            {isPaid && (
              <div className="mt-6 rounded-2xl bg-green-50 border border-green-200 p-5 flex items-center gap-3">
                <CheckCircle2 className="text-green-600" size={24} />
                <div>
                  <p className="text-sm font-bold text-green-800">Pembayaran Lunas</p>
                  <p className="text-xs text-green-700">
                    Dibayar {formatDate(order.paymentPaidAt, true)} via{" "}
                    {PAYMENT_METHOD_LABEL[order.paymentMethod ?? ""] ?? order.paymentMethod}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 h-fit sticky top-4">
          <h2 className="font-bold text-gray-900 mb-4">Aksi</h2>
          <div className="space-y-3">
            <StatusBadge status={order.status} label={`Status: ${order.status}`} />
            {order.status === "pending" && (
              <button
                onClick={() => user && router.push(`/user/orders`)}
                className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Lihat Pesanan Saya
              </button>
            )}
            <button
              onClick={() => router.push("/user/home")}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
            >
              Belanja Lagi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
