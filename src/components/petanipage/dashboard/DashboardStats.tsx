"use client";

import { CheckCircle2, Package, Scale, ShoppingCart } from "lucide-react";
import CountUp from "@/components/ui/CountUp";
import { Skeleton } from "@/components/ui/Skeleton";

/** Ringkasan bisnis utama: komoditas, pesanan masuk, selesai, volume terjual. */
export default function DashboardStats({
  totalCommodities,
  pendingOrders,
  completedOrdersThisMonth,
  totalSoldThisMonth,
}: {
  totalCommodities: number;
  pendingOrders: number;
  completedOrdersThisMonth: number;
  totalSoldThisMonth: number;
}) {
  const cards = [
    {
      icon: <Package size={18} />,
      value: totalCommodities,
      label: "Total Komoditas",
    },
    {
      icon: <ShoppingCart size={18} />,
      value: pendingOrders,
      label: "Pesanan Masuk",
      highlight: true,
    },
    {
      icon: <CheckCircle2 size={18} />,
      value: completedOrdersThisMonth,
      label: "Pesanan Selesai",
    },
    {
      icon: <Scale size={18} />,
      value: totalSoldThisMonth,
      label: "Total Penjualan (kg)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x-0 gap-x-6 gap-y-5 rounded-2xl border border-gray-200/80 bg-white px-5 py-4 sm:px-6">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`min-w-0 ${i > 0 ? "lg:border-l lg:border-gray-100 lg:pl-6" : ""}`}
        >
          <div
            className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${
              card.highlight
                ? "bg-warning/15 text-warning"
                : "bg-primary/10 text-primary"
            }`}
          >
            {card.icon}
          </div>
          <p className="text-2xl font-bold tracking-tight text-neutral-900">
            <CountUp value={card.value} />
          </p>
          <p className="mt-0.5 text-xs font-medium text-gray-500">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

/** Skeleton yang meniru bentuk DashboardStats. */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 rounded-2xl border border-gray-200/80 bg-white px-5 py-4 sm:px-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-lg" />
      ))}
    </div>
  );
}
