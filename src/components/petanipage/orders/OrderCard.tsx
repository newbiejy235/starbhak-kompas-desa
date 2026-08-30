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
  const img = formatImage(order.commodityImage) ?? formatImage(order.commodityImages?.[0] ?? null);

  return (
    <div className="group grid gap-4 py-4 transition-colors hover:bg-gray-50/70 sm:grid-cols-[minmax(0,1fr)_150px_150px_150px] sm:items-center sm:gap-5">
      {/* Komoditas + order info */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {img ? (
            <Image
              src={img}
              alt={order.commodityName}
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-base font-black text-white">
              {order.commodityName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">
            {order.commodityName}
          </p>
          <p className="truncate text-xs text-gray-500">
            {order.orderCode} · {formatDateTime(order.createdAt)}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {formatNumber(order.quantity)} × {formatRupiah(order.unitPrice)}
          </p>
        </div>
      </div>

      {/* Pembeli */}
      <div className="min-w-0 sm:text-left">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
          <Store size={13} className="shrink-0 text-primary" />
          <span className="truncate">{order.buyerName}</span>
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {order.deliveryMethod === "pickup" ? "Ambil Sendiri" : "Ekspedisi"}
        </p>
        {order.notes && (
          <p className="mt-1 truncate text-xs italic text-gray-400">
            Catatan: {order.notes}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-start sm:gap-1.5">
        <StatusBadge status={order.status} />
        <StatusBadge
          status={order.paymentStatus ?? "pending"}
          label={PAYMENT_STATUS_LABEL[order.paymentStatus ?? "pending"]}
        />
      </div>

      {/* Total + aksi */}
      <div className="sm:text-right">
        <p className="text-base font-bold text-primary">
          {formatRupiah(order.totalPrice)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => onOpen(order)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            Detail <ChevronRight size={13} />
          </button>
          {next && actionLabel && (
            <button
              type="button"
              onClick={() => onAdvance(order.id, next)}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-60"
            >
              {advancingKey === `${order.id}-${next}` ? "Memproses..." : actionLabel}
              <ArrowRight size={13} />
            </button>
          )}
          {order.status === "pending" && (
            <button
              type="button"
              onClick={() => onCancelRequest(order)}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/5 disabled:opacity-60"
            >
              <XCircle size={13} /> Batalkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
