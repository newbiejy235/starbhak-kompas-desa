"use client";

import { formatNumber } from "@/lib/format";
import { Skeleton } from "@/components/ui/Skeleton";
import type { SalesChartPoint } from "@/actions/dashboard";

export type ChartRange = "30d" | "3m" | "1y";

const RANGE_OPTIONS: { value: ChartRange; label: string }[] = [
  { value: "30d", label: "30 Hari" },
  { value: "3m", label: "3 Bulan" },
  { value: "1y", label: "1 Tahun" },
];

/** Kartu grafik volume penjualan dengan pemilih rentang waktu. */
export default function SalesChartCard({
  data,
  loading,
  range,
  onRangeChange,
}: {
  data: SalesChartPoint[];
  loading: boolean;
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
}) {
  const maxKg = Math.max(...data.map((p) => p.kg), 1);

  return (
    <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 transition-all duration-300 ease-smooth hover:shadow-lift">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Grafik Penjualan</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Volume penjualan komoditas Anda.
          </p>
        </div>
        <div
          role="group"
          aria-label="Pilih rentang waktu"
          className="flex items-center gap-0 rounded-lg overflow-hidden border border-gray-200"
        >
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onRangeChange(opt.value)}
              aria-pressed={range === opt.value}
              className={`px-3 py-1.5 text-xs font-medium active:scale-95 transition-all duration-100 ${
                range === opt.value
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-end gap-3 h-[280px] pt-6">
          {[50, 75, 40, 85, 60, 90].map((h, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-lg"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      ) : (
        <div className="relative" key={range}>
          <div className="relative h-[240px]">
            {[0, 0.25, 0.5, 0.75, 1].reverse().map((frac, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-black/10"
                style={{ top: `${frac * 100}%` }}
              >
                <span className="absolute -left-1 -top-2.5 text-[10px] text-gray-400 -translate-x-full pr-2">
                  {formatNumber(Math.round(maxKg * frac))}
                </span>
              </div>
            ))}

            <div className="absolute inset-0 flex items-end justify-around px-4 ml-8">
              {data.map((point, i) => {
                const height = maxKg > 0 ? (point.kg / maxKg) * 100 : 0;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    {/* Bar draw-in via scaleY + stagger */}
                    <div
                      className="w-full max-w-[40px] bg-gradient-to-t from-primary to-emerald-600 rounded-t-md origin-bottom animate-grow-y"
                      style={{
                        height: `${Math.max(height, 2)}%`,
                        animationDelay: `${i * 50}ms`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-around px-4 ml-8 mt-3">
            {data.map((point, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-500 flex-1 text-center"
              >
                {point.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
