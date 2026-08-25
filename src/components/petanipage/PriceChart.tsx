"use client";

import { COLOR_PRIMARY } from "@/constants/brand";
import type { PriceHistoryData } from "@/lib/types/market";

type PricePoint = PriceHistoryData["points"][number];

/** Grafik garis sederhana harga rata-rata per bulan (SVG murni, tanpa library). */
export default function PriceChart({ points }: { points: PricePoint[] }) {
  const width = 560;
  const height = 180;
  const padX = 12;
  const padY = 16;

  if (points.length < 2) return null;

  const prices = points.map((p) => p.avgPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || max || 1;

  const coords = points.map((p, i) => {
    const x =
      padX + (i / (points.length - 1)) * (width - padX * 2);
    const y =
      height - padY - ((p.avgPrice - min) / span) * (height - padY * 2);
    return { x, y };
  });

  const pathLine = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${pathLine} L${coords[coords.length - 1].x.toFixed(1)},${height - padY} L${coords[0].x.toFixed(1)},${height - padY} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-44 w-full"
      role="img"
      aria-label="Grafik perubahan harga per bulan"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="price-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLOR_PRIMARY} stopOpacity="0.18" />
          <stop offset="100%" stopColor={COLOR_PRIMARY} stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={padX}
          x2={width - padX}
          y1={padY + t * (height - padY * 2)}
          y2={padY + t * (height - padY * 2)}
          stroke="#f3f4f6"
          strokeWidth="1"
        />
      ))}

      <path d={areaPath} fill="url(#price-area)" />
      <path
        d={pathLine}
        fill="none"
        stroke={COLOR_PRIMARY}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {coords.map((c, i) => (
        <g key={points[i].month}>
          <circle
            cx={c.x}
            cy={c.y}
            r="4"
            fill="#ffffff"
            stroke={COLOR_PRIMARY}
            strokeWidth="2"
          />
          <text
            x={c.x}
            y={height - 2}
            textAnchor="middle"
            className="fill-gray-400"
            fontSize="10"
          >
            {points[i].label.split(" ")[0]}
          </text>
        </g>
      ))}
    </svg>
  );
}
