"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Store,
  Truck,
  CreditCard,
  Package,
  MapPin,
  ArrowLeft,
  Phone,
  Mail,
  UserRound,
  FileText,
} from "lucide-react";
import { getAdminOrderDetail } from "@/actions/admin";
import {
  formatRupiah,
  formatDateTime,
  PAYMENT_METHOD_LABEL,
  DELIVERY_METHOD_LABEL,
} from "@/lib/format";
import { LoadingState, ErrorState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: order, loading, error, reload } = useFetch(
    () => getAdminOrderDetail(id),
    [id],
  );

  if (loading) return <LoadingState label="Memuat detail pesanan..." />;
  if (error || !order) {
    return (
      <ErrorState
        title="Pesanan tidak ditemukan"
        message="Data pesanan tidak dapat dimuat."
        onRetry={reload}
      />
    );
  }

  const shippingAddress = [
    order.addressStreet,
    order.addressDistrict,
    order.addressCity,
    order.addressProvince,
    order.addressPostalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const imageSrc = order.commodityImage ?? order.commodityImages?.[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary transition"
        >
          <ArrowLeft size={14} /> Kembali
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-neutral-900 truncate">
            Detail Pesanan {order.orderCode}
          </h1>
          <p className="text-sm text-gray-500">
            Dibuat {formatDateTime(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
        <StatusBadge status={order.paymentStatus ?? "pending"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Kolom utama */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item */}
          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={18} className="text-primary" /> Item Pesanan
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg font-bold text-amber-600 overflow-hidden">
                {imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt={order.commodityName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  order.commodityName?.charAt(0)?.toUpperCase() ?? "?"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/commodities/${order.commodityId}`}
                  className="block truncate font-bold text-gray-900 hover:text-primary transition-colors"
                >
                  {order.commodityName}
                </Link>
                <p className="text-xs text-gray-400">
                  {order.commodityLocation || "-"} · Satuan {order.commodityUnit}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-extrabold text-primary">
                  {formatRupiah(order.totalPrice)}
                </p>
                <p className="text-xs text-gray-400">
                  {order.quantity} {order.commodityUnit} ×{" "}
                  {formatRupiah(order.unitPrice)}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">
                  {formatRupiah(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Biaya Layanan</span>
                <span className="font-semibold text-gray-800">
                  {formatRupiah(order.serviceFee)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Biaya Pengiriman</span>
                <span className="font-semibold text-gray-800">
                  {formatRupiah(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-primary">
                  {formatRupiah(order.totalPrice)}
                </span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 flex items-start gap-2">
                <FileText size={15} className="text-gray-400 shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold text-gray-700">Catatan: </span>
                  {order.notes}
                </span>
              </div>
            )}
          </section>

          {/* Pengiriman */}
          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={18} className="text-primary" /> Pengiriman
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">Metode</dt>
                <dd className="text-gray-700">
                  {DELIVERY_METHOD_LABEL[order.deliveryMethod] ?? order.deliveryMethod}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">Status Pesanan</dt>
                <dd>
                  <StatusBadge status={order.status} />
                </dd>
              </div>
              {order.recipientName && (
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-400">Penerima</dt>
                  <dd className="text-gray-700">
                    {order.recipientName}
                    {order.recipientPhone ? ` · ${order.recipientPhone}` : ""}
                  </dd>
                </div>
              )}
              {(order.deliveryAddress || shippingAddress) && (
                <div className="sm:col-span-2 flex items-start gap-2">
                  <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
                  <dd className="text-gray-700">
                    {order.deliveryAddress || shippingAddress}
                    {order.addressNotes && (
                      <span className="block text-xs text-gray-400 mt-1">
                        Catatan: {order.addressNotes}
                      </span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        {/* Kolom samping */}
        <div className="space-y-6">
          {/* Buyer */}
          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserRound size={18} className="text-primary" /> Pembeli
            </h2>
            <Link
              href={`/admin/users/${order.buyerId}`}
              className="block text-lg font-bold text-gray-900 hover:text-primary transition-colors truncate"
            >
              {order.buyerName}
            </Link>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400" /> {order.buyerNoTelp}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={14} className="text-gray-400" />{" "}
                <span className="truncate">{order.buyerEmail}</span>
              </div>
            </dl>
            <div className="mt-3">
              <StatusBadge status={order.buyerStatus} />
            </div>
          </section>

          {/* Petani */}
          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Store size={18} className="text-primary" /> Petani
            </h2>
            <Link
              href={`/admin/farmers/${order.farmerId}`}
              className="block text-lg font-bold text-gray-900 hover:text-primary transition-colors truncate"
            >
              {order.farmerName}
            </Link>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400" /> {order.farmerNoTelp}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={14} className="text-gray-400" />{" "}
                <span className="truncate">{order.farmerEmail}</span>
              </div>
            </dl>
            <div className="mt-3">
              <StatusBadge status={order.farmerStatus} />
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-primary" /> Pembayaran
            </h2>
            {!order.paymentId ? (
              <p className="text-sm text-gray-400">Belum ada data pembayaran.</p>
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-400">Status</dt>
                  <dd>
                    <StatusBadge status={order.paymentStatus ?? "pending"} />
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-400">Metode</dt>
                  <dd className="text-gray-700">
                    {PAYMENT_METHOD_LABEL[order.paymentMethod ?? ""] ?? "-"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-400">Referensi</dt>
                  <dd className="text-gray-700 truncate">
                    {order.paymentReference ?? "-"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-400">Dibayar</dt>
                  <dd className="text-gray-700">
                    {order.paymentPaidAt ? formatDateTime(order.paymentPaidAt) : "-"}
                  </dd>
                </div>
              </dl>
            )}
            <p className="mt-4 text-[11px] text-gray-400">
              Status pembayaran dikelola oleh sistem pembayaran. Admin tidak
              mengubah status secara manual.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}