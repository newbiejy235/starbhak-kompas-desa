"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Package,
} from "lucide-react";
import type { LowStockSummary, OrderStatusCounts } from "@/actions/dashboard";
import { formatNumber } from "@/lib/format";

type AttentionItem = {
  key: string;
  icon: React.ReactNode;
  tone: "warning" | "info" | "danger";
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const TONE_ICON: Record<AttentionItem["tone"], string> = {
  warning: "bg-warning/10 text-warning",
  info: "bg-primary/10 text-primary",
  danger: "bg-danger/10 text-danger",
};

/**
 * Panel "apa yang harus dikerjakan hari ini" — dibangun hanya dari data nyata:
 * jumlah pesanan per status dan daftar stok menipis.
 */
export default function AttentionPanel({
  statusCounts,
  lowStock,
}: {
  statusCounts: OrderStatusCounts;
  lowStock: LowStockSummary;
}) {
  const preparing = statusCounts.confirmed + statusCounts.processing;

  const items: AttentionItem[] = [];

  if (statusCounts.pending > 0) {
    items.push({
      key: "pending",
      tone: "warning",
      icon: <AlertTriangle size={16} />,
      text: `${statusCounts.pending} pesanan baru menunggu konfirmasi Anda.`,
      ctaLabel: "Proses Pesanan",
      ctaHref: "/petani/orders?status=pending",
    });
  }

  if (preparing > 0) {
    items.push({
      key: "preparing",
      tone: "info",
      icon: <Package size={16} />,
      text: `${preparing} pesanan sedang disiapkan untuk pengiriman.`,
      ctaLabel: "Lihat Pesanan",
      ctaHref: "/petani/orders",
    });
  }

  if (lowStock.total > 0) {
    const names = lowStock.items
      .map((i) => `${i.name} (${formatNumber(i.stock)} ${i.unit})`)
      .join(", ");
    const extra = lowStock.total - lowStock.items.length;
    items.push({
      key: "stock",
      tone: lowStock.items.some((i) => i.stock <= 0) ? "danger" : "warning",
      icon: <Package size={16} />,
      text:
        `${lowStock.total} komoditas stoknya menipis atau habis: ${names}` +
        (extra > 0 ? `, dan ${extra} lainnya.` : "."),
      ctaLabel: "Kelola Stok",
      ctaHref: "/petani/stok",
    });
  }

  return (
    <section
      aria-label="Hal yang perlu diperhatikan"
      className="rounded-card border border-gray-200/80 bg-white p-5 shadow-soft"
    >
      {items.length === 0 ? (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
            <CheckCircle2 size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">
              Tidak ada yang perlu ditangani
            </p>
            <p className="text-xs text-gray-500">
              Semua pesanan terproses dan stok aman. Waktunya merencanakan panen berikutnya.
            </p>
          </div>
        </div>
      ) : (
        <>
          <h2 className="mb-3 text-sm font-bold text-neutral-900">
            Perhatian Hari Ini
          </h2>
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li
                key={item.key}
                className="flex flex-col gap-2 rounded-xl bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${TONE_ICON[item.tone]}`}
                  >
                    {item.icon}
                  </span>
                  <p className="min-w-0 break-words text-sm font-medium text-gray-700">
                    {item.text}
                  </p>
                </div>
                {item.ctaHref && item.ctaLabel && (
                  <Link
                    href={item.ctaHref}
                    className="inline-flex shrink-0 items-center gap-1 self-start rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-primary transition-colors duration-150 hover:border-primary/30 hover:bg-primary/5 sm:self-auto"
                  >
                    {item.ctaLabel}
                    <ArrowRight size={13} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
