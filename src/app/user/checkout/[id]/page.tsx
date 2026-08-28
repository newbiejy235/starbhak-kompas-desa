"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Copy,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CreditCard,
  Store,
  MapPin,
} from "lucide-react";
import { getOrderById, markOrderPaid } from "@/actions/order";
import { formatRupiah, formatDate, formatDateTime, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { LoadingState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useAuth, useFetch } from "@/lib/hooks";
import type { OrderDetail } from "@/lib/types/market";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const { data: order, loading, reload } = useFetch(
    () => getOrderById(Number(id)),
    [id],
  );

  if (loading) return <LoadingState />;

  if (!order) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
        Pesanan tidak ditemukan.
      </div>
    );
  }

  const isPendingPayment = order.paymentStatus === "pending";
  const isPaid = order.paymentStatus === "paid";

  const copyRef = (ref: string) => {
    navigator.clipboard?.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const confirmPaid = async () => {
    if (!user) return;
    await markOrderPaid(order.id, user.id);
    reload();
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

  const vaNumber = "8801 0826 0000 " + String(order.id).padStart(6, "0");

  return (
    <div className="max-w-4xl mx-auto">
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
              <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-white text-2xl font-black">
                {order.commodityName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{order.commodityName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {order.quantity} {order.commodityUnit} × {formatRupiah(order.unitPrice)}
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
                  Metode: {PAYMENT_METHOD_LABEL[order.paymentMethod ?? ""] ?? order.paymentMethod}
                </p>

                {order.paymentMethod !== "cod" && (
                  <div className="rounded-xl bg-white border border-amber-200 p-4 mb-4">
                    <p className="text-[11px] text-gray-500 mb-1">Nomor Rekening Virtual</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-gray-800">{vaNumber}</span>
                      <button
                        onClick={() => copyRef(vaNumber)}
                        className="inline-flex items-center gap-1 text-xs text-primary font-medium"
                      >
                        <Copy size={14} /> {copied ? "Tersalin!" : "Salin"}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2">
                      A/n Kompas Desa · Kode: {order.paymentReference}
                    </p>
                  </div>
                )}

                <button
                  onClick={confirmPaid}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors duration-150 active:scale-[0.98]"
                >
                  Saya Sudah Bayar
                </button>
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
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors duration-150 active:scale-[0.98]"
            >
              Belanja Lagi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
