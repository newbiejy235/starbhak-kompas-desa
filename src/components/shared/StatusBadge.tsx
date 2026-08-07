"use client";

import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  COMMODITY_STATUS_LABEL,
  ROLE_LABEL,
} from "@/lib/format";

const tone: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  shipped: "bg-cyan-50 text-cyan-700 border-cyan-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-gray-100 text-gray-600 border-gray-200",
  verified: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  available: "bg-green-50 text-green-700 border-green-200",
  sold_out: "bg-gray-100 text-gray-600 border-gray-200",
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  petani: "bg-green-50 text-green-700 border-green-200",
  pembeli: "bg-blue-50 text-blue-700 border-blue-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
  default: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const mapped =
    ORDER_STATUS_LABEL[status] ??
    PAYMENT_STATUS_LABEL[status] ??
    COMMODITY_STATUS_LABEL[status] ??
    ROLE_LABEL[status] ??
    (status === "verified"
      ? "Terverifikasi"
      : status === "suspended"
        ? "Ditangguhkan"
        : status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap ${
        tone[status] ?? tone.default
      }`}
    >
      {label ?? mapped}
    </span>
  );
}
