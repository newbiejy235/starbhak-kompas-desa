"use client";

import Image from "next/image";
import { ArrowRight, ChevronRight, Store, XCircle } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatImage } from "@/components/shared/States";
import {
  PAYMENT_STATUS_LABEL,
  formatDateTime,
  formatNumber,
  formatRupiah,
} from "@/lib/format";
import type { FarmerOrder } from "@/lib/types/market";
import { nextActionLabel, nextOrderStatus } from "./statusFlow";

interface OrderCardProps {
  order: FarmerOrder;
  advancingKey: string | null;
  onOpen: (order: FarmerOrder) => void;
  onAdvance: (id: number, status: string) => void;
  onCancelRequest: (order: FarmerOrder) => void;
}

export default function OrderCard({
  order,
  advancingKey,
  onOpen,
  onAdvance,
  onCancelRequest,
}: OrderCardProps) {
  const next = nextOrderStatus(order.status);
  const actionLabel = nextActionLabel(order.status);
  const busy = advancingKey !== null;
  const img = formatImage(order.commodityImage);

  return (
    <div className="overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-3">
        <div>
          <p className="text-sm font-bold text-gray-800">{order.orderCode}</p>
          <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Body */}
      <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
        <div>
          <p className="mb-1 text-xs text-gray-500">Komoditas</p>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              {img ? (
                <Image
                  src={img}
                  alt={order.commodityName}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-lg font-black text-white">
                  {order.commodityName?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">
                {order.commodityName}
              </p>
              <p className="text-xs text-gray-500">
                {formatNumber(order.quantity)} × {formatRupiah(order.unitPrice)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-gray-500">Pembeli</p>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
            <Store size={13} className="shrink-0 text-primary" />
            <span className="truncate">{order.buyerName}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={order.paymentStatus ?? "pending"}
              label={PAYMENT_STATUS_LABEL[order.paymentStatus ?? "pending"]}
            />
            <span className="text-xs text-gray-500">
              {order.deliveryMethod === "pickup" ? "Ambil Sendiri" : "Ekspedisi"}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between sm:flex-col sm:items-end sm:justify-start">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-base font-bold text-primary">
            {formatRupiah(order.totalPrice)}
          </p>
        </div>
      </div>

      {order.notes && (
        <div className="px-5 pb-3">
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs italic text-gray-500">
            Catatan pembeli: {order.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 px-5 pb-4 sm:flex-row">
        <button
          type="button"
          onClick={() => onOpen(order)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 sm:flex-none"
        >
          Lihat Pesanan <ChevronRight size={15} />
        </button>
        {next && actionLabel && (
          <button
            type="button"
            onClick={() => onAdvance(order.id, next)}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-60 sm:flex-none"
          >
            {advancingKey === `${order.id}-${next}` ? "Memproses..." : actionLabel}
            <ArrowRight size={15} />
          </button>
        )}
        {order.status === "pending" && (
          <button
            type="button"
            onClick={() => onCancelRequest(order)}
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/5 disabled:opacity-60"
          >
            <XCircle size={15} /> Batalkan
          </button>
        )}
      </div>
    </div>
  );
}
