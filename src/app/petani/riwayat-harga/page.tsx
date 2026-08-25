"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import {
  getPriceCommodities,
  getPriceHistory,
} from "@/actions/price";
import type {
  PriceCommodityOption,
  PriceHistoryData,
} from "@/lib/types/market";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import PageHeader from "@/components/shared/PageHeader";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatRupiah } from "@/lib/format";

/* ---------------------- CHART ---------------------- */
function PriceChart({
  points,
}: {
  points: PriceHistoryData["points"];
}) {
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
          <stop offset="0%" stopColor="#025246" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#025246" stopOpacity="0" />
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
        stroke="#025246"
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
            stroke="#025246"
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

/* ---------------------- SKELETON ---------------------- */
function PriceSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-14 rounded-card" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-[72px] rounded-xl" />
        <Skeleton className="h-[72px] rounded-xl" />
        <Skeleton className="h-[72px] rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-card" />
    </div>
  );
}

/* ---------------------- PAGE ---------------------- */
export default function RiwayatHargaPage() {
  const user = getClientUser();

  const {
    data: options,
    loading: loadingOptions,
    error,
    reload,
  } = useFetch(() =>
    user
      ? getPriceCommodities(user.id)
      : Promise.resolve([] as PriceCommodityOption[]),
    [user?.id],
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const activeId = selectedId ?? options?.[0]?.id ?? null;

  const { data: history, loading: loadingHistory } = useFetch(
    () =>
      user && activeId
        ? getPriceHistory(user.id, activeId)
        : Promise.resolve(null),
    [user?.id, activeId],
  );

  const trendUp = useMemo(() => (history?.changePercent ?? 0) >= 0, [history]);

  if (loadingOptions) return <PriceSkeleton />;

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6 lg:p-0">
      <PageHeader
        icon={TrendingUp}
        title="Riwayat Harga"
        subtitle="Pantau perubahan harga komoditas dari waktu ke waktu."
      />

      {error ? (
        <ErrorState onRetry={() => reload()} />
      ) : (options ?? []).length === 0 ? (
        <EmptyState
          title="Belum Ada Riwayat Harga"
          message="Harga terbentuk dari transaksi pesanan selesai. Mulai dari menambahkan komoditas hingga menerima pesanan pertama Anda."
        />
      ) : (
        <>
          {/* Pemilih komoditas */}
          <section className="mb-5 rounded-card border border-gray-200/80 bg-white p-3 shadow-soft">
            <label htmlFor="price-commodity" className="sr-only">
              Pilih komoditas
            </label>
            <select
              id="price-commodity"
              value={activeId ?? ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:border-primary focus:outline-none sm:max-w-xs"
            >
              {(options ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </section>

          {loadingHistory ? (
            <div className="space-y-3">
              <Skeleton className="h-72 rounded-card" />
            </div>
          ) : !history || history.points.length === 0 ? (
            <EmptyState
              title="Belum Ada Transaksi Selesai"
              message="Harga akan tampil setelah ada pesanan selesai untuk komoditas ini."
            />
          ) : (
            <>
              {/* Statistik harga */}
              <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <article className="rounded-card border border-gray-200/80 bg-white px-4 py-3.5 shadow-soft">
                  <p className="text-xs text-gray-500">Harga Saat Ini</p>
                  <p className="mt-1 text-xl font-black text-gray-900">
                    {formatRupiah(history.currentPrice)}
                    <span className="text-xs font-medium text-gray-400">
                      /{history.unit}
                    </span>
                  </p>
                </article>
                <article className="rounded-card border border-gray-200/80 bg-white px-4 py-3.5 shadow-soft">
                  <p className="text-xs text-gray-500">Perubahan</p>
                  <p
                    className={`mt-1 flex items-center gap-1 text-xl font-black ${
                      trendUp ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {trendUp ? (
                      <ArrowUpRight size={18} />
                    ) : (
                      <ArrowDownRight size={18} />
                    )}
                    {Math.abs(history.changePercent)}%
                  </p>
                  <p className="text-[11px] text-gray-400">vs bulan sebelumnya</p>
                </article>
                <article className="rounded-card border border-gray-200/80 bg-white px-4 py-3.5 shadow-soft">
                  <p className="text-xs text-gray-500">Bulan Tercatat</p>
                  <p className="mt-1 text-xl font-black text-gray-900">
                    {history.points.length}
                  </p>
                  <p className="text-[11px] text-gray-400">6 bulan terakhir</p>
                </article>
              </section>

              {/* Grafik */}
              <section className="rounded-card border border-gray-200/80 bg-white p-4 shadow-soft sm:p-6">
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="text-sm font-bold text-gray-900">
                    Harga Rata-rata — {history.commodityName}
                  </h2>
                  {history.previousPrice !== null && (
                    <p className="text-xs text-gray-400">
                      Bulan lalu{" "}
                      <span className="font-semibold text-gray-600">
                        {formatRupiah(history.previousPrice)}
                      </span>
                    </p>
                  )}
                </div>
                {history.points.length >= 2 ? (
                  <PriceChart points={history.points} />
                ) : (
                  <p className="py-10 text-center text-sm text-gray-400">
                    Butuh minimal dua bulan transaksi untuk menampilkan grafik.
                  </p>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
