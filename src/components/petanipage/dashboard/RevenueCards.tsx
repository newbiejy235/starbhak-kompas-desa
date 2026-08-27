"use client";

import { Star, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import Badge from "@/components/ui/Badge";
import CountUp from "@/components/ui/CountUp";
import type { ReactNode } from "react";

function MiniCard({
  icon,
  label,
  children,
  delay,
  badge,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  delay: number;
  badge?: ReactNode;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="bg-white rounded-card border border-gray-200/80 shadow-soft p-5 opacity-0 animate-fade-up transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
          {children}
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pendapatan hari ini, pendapatan bulanan + tren, dan penilaian pembeli. */
export default function RevenueCards({
  revenueToday,
  revenueThisMonth,
  percentChange,
  avgRating,
  reviewCount,
}: {
  revenueToday: number;
  revenueThisMonth: number;
  percentChange: number;
  avgRating: number;
  reviewCount: number;
}) {
  const upTrend = percentChange >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MiniCard delay={320} icon={<Wallet size={16} />} label="Pendapatan Hari Ini">
        <p className="text-2xl font-bold text-primary">
          <CountUp value={revenueToday} prefix="Rp " />
        </p>
      </MiniCard>

      <MiniCard
        delay={400}
        icon={<TrendingUp size={16} />}
        label="Pendapatan Bulanan"
        badge={
          percentChange !== 0 ? (
            <Badge tone={upTrend ? "success" : "danger"}>
              <span className="inline-flex items-center gap-1">
                {upTrend ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {upTrend ? "+" : ""}
                {percentChange}%
              </span>
            </Badge>
          ) : undefined
        }
      >
        <p className="text-2xl font-bold text-primary">
          <CountUp value={revenueThisMonth} prefix="Rp " />
        </p>
      </MiniCard>

      <MiniCard delay={480} icon={<Star size={16} />} label="Penilaian">
        <p className="text-2xl font-bold text-primary">
          {avgRating.toFixed(1)}
          <span className="text-sm font-normal text-gray-400 ml-1">
            ({reviewCount} ulasan)
          </span>
        </p>
      </MiniCard>
    </div>
  );
}
