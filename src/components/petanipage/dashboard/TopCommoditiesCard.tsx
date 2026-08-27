"use client";

import { formatNumber } from "@/lib/format";

/** Komoditas dengan penjualan tertinggi tahun berjalan (data nyata). */
export default function TopCommoditiesCard({
  products,
}: {
  products: { rank: number; name: string; totalKg: number }[];
}) {
  if (products.length === 0) return null;

  return (
    <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 transition-all duration-300 ease-smooth hover:shadow-lift">
      <h2 className="text-base font-bold text-neutral-900 mb-1">
        Komoditas Terlaris
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Berdasarkan pesanan selesai tahun ini.
      </p>

      <div className="space-y-2">
        {products.map((p, i) => (
          <div
            key={p.rank}
            style={{ animationDelay: `${300 + i * 60}ms` }}
            className="flex items-center justify-between opacity-0 animate-fade-up"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {p.rank}
              </span>
              <span className="text-sm text-neutral-900">{p.name}</span>
            </div>
            <span className="text-xs font-medium text-gray-500">
              {formatNumber(p.totalKg)} kg
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
