"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import type { SalesChartPoint } from "@/actions/dashboard";

export type ChartRange = "30d" | "3m" | "1y";

const RANGE_OPTIONS: { value: ChartRange; label: string }[] = [
  { value: "30d", label: "30 Hari" },
  { value: "3m", label: "3 Bulan" },
  { value: "1y", label: "1 Tahun" },
];

const W = 560;
const H = 260;
const PAD_LEFT = 40;
const PAD_RIGHT = 16;
const PAD_TOP = 24;
const PAD_BOTTOM = 30;

/** Kartu grafik garis volume penjualan dengan pemilih rentang waktu. */
export default function SalesChartCard({
  data,
  periodLabel,
  loading,
  range,
  onRangeChange,
}: {
  data: SalesChartPoint[];
  periodLabel: string;
  loading: boolean;
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
}) {
  const plotW = W - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;

  const points = data;
  const maxKg = Math.max(...points.map((p) => p.kg), 0);
  const yMax = maxKg === 0 ? 1 : maxKg;

  const n = points.length;
  const xAt = (i: number) =>
    n <= 1 ? PAD_LEFT + plotW / 2 : PAD_LEFT + (i / (n - 1)) * plotW;
  const yAt = (kg: number) =>
    PAD_TOP + plotH - (kg / yMax) * plotH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(p.kg)}`)
    .join(" ");

  const gridFracs = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Grafik Penjualan</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Volume penjualan komoditas Anda
            {periodLabel ? ` · ${periodLabel}` : ""}
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
        <div className="flex items-end gap-3 h-[260px] pt-6">
          {[50, 75, 40, 85, 60, 90].map((h, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-lg"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      ) : points.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-gray-400">
          Belum ada data penjualan pada rentang ini.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto mx-auto max-w-[680px]"
          role="img"
          aria-label="Grafik penjualan"
        >
          {/* Garis bantu sumbu-Y */}
          {gridFracs.map((f) => {
            const y = PAD_TOP + plotH * (1 - f);
            return (
              <g key={f}>
                <line
                  x1={PAD_LEFT}
                  x2={W - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth={1}
                />
                <text
                  x={PAD_LEFT - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={10}
                  fill="#9ca3af"
                >
                  {formatAxis(Math.round(yMax * f))}
                </text>
              </g>
            );
          })}

          {/* Garis data */}
          <path
            d={linePath}
            fill="none"
            stroke="#025246"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Titik data */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={xAt(i)}
                cy={yAt(p.kg)}
                r={4}
                fill="#025246"
                stroke="#fff"
                strokeWidth={2}
              />
              <text
                x={xAt(i)}
                y={yAt(p.kg) - 10}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fill="#025246"
              >
                {p.kg}
              </text>
            </g>
          ))}

          {/* Label sumbu-X */}
          {points.map((p, i) => (
            <text
              key={`x-${i}`}
              x={xAt(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#9ca3af"
            >
              {p.label}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}

function formatAxis(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return String(value);
}
