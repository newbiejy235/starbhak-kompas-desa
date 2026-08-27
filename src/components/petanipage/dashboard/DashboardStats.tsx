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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          style={{ animationDelay: `${i * 80}ms` }}
          className={`bg-white rounded-card border shadow-soft p-5 opacity-0 animate-fade-up transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift ${
            card.highlight ? "border-primary/30" : "border-gray-200/80"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              card.highlight
                ? "bg-warning/15 text-warning"
                : "bg-primary/10 text-primary"
            }`}
          >
            {card.icon}
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            <CountUp value={card.value} />
          </p>
          <p className="text-xs text-gray-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

/** Skeleton yang meniru bentuk DashboardStats. */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-card" />
      ))}
    </div>
  );
}
