"use client";

import { useMemo, useState } from "react";
import { ChevronDown, MessageSquareText, Package, Search, Star } from "lucide-react";
import { getReviewsForFarmer } from "@/actions/review";
import { getClientUser } from "@/lib/auth/client";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import { useFetch } from "@/lib/hooks";
import type { ReviewForFarmer } from "@/lib/types/market";
import CountUp from "@/components/ui/CountUp";
import { Skeleton } from "@/components/ui/Skeleton";

/* ============================================================
   Design tokens (Kompas Desa)
   ============================================================ */
const GREEN = "#025246";
const GREEN_SOFT = "#F0F7F5";
const GREEN_AVATAR = "#EAF4F1";

type RatingDistItem = { star: number; count: number };

/* ============================================================
   Helpers
   ============================================================ */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function Stars({
  value,
  size = 14,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 gap-0.5 ${className}`}
      role="img"
      aria-label={`Rating ${value} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          aria-hidden
          className={
            s <= value ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"
          }
        />
      ))}
    </span>
  );
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#025246]";

/* ============================================================
   Skeleton — meniru struktur halaman di bawahnya
   ============================================================ */
function ReviewsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-0">
      {/* Header */}
      <div className="mb-7 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-3.5 w-64" />
        </div>
      </div>

      {/* Reputation overview */}
      <div className="mb-7 rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col items-center gap-2.5 sm:w-44">
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <div className="hidden w-px self-stretch bg-gray-100 sm:block" />
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="h-3.5 w-8" />
                <Skeleton className="h-1.5 flex-1 rounded-full" />
                <Skeleton className="h-3.5 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl sm:w-52" />
      </div>

      {/* Review cards */}
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="mb-3 h-36 rounded-2xl" />
      ))}
    </div>
  );
}

/* ============================================================
   Reputation overview — skor rata-rata + distribusi rating
   ============================================================ */
function RatingOverview({
  total,
  avg,
  dist,
  activeRating,
  onSelectRating,
}: {
  total: number;
  avg: number;
  dist: RatingDistItem[];
  activeRating: number | null;
  onSelectRating: (rating: number | null) => void;
}) {
  return (
    <section
      aria-label="Ringkasan reputasi"
      className="rounded-2xl border border-gray-100 bg-white"
    >
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:gap-0 sm:p-0">
        {/* Skor rata-rata */}
        <div className="flex shrink-0 flex-col items-center justify-center text-center sm:w-56 sm:self-stretch sm:py-8">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Rata-rata Rating
          </p>
          <CountUp
            value={avg}
            decimals={Number.isInteger(avg) ? 0 : 1}
            separator={false}
            className="mt-2 block text-4xl font-black tracking-tight text-gray-900 tabular-nums sm:text-5xl"
          />
          <Stars value={Math.round(avg)} size={17} className="mt-2.5" />
          <p className="mt-2.5 text-xs text-gray-500">
            Dari {total} ulasan pembeli
          </p>
        </div>

        {/* Pembatas */}
        <div
          aria-hidden
          className="hidden w-px self-stretch bg-gray-100 sm:block"
        />

        {/* Distribusi rating */}
        <div className="flex-1 space-y-1 sm:py-5 sm:pl-8 sm:pr-6">
          {dist.map(({ star, count }) => {
            const isActive = activeRating === star;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <button
                key={star}
                type="button"
                onClick={() => onSelectRating(isActive ? null : star)}
                aria-pressed={isActive}
                aria-label={`Tampilkan ulasan ${star} bintang (${count})`}
                className={`flex min-h-9 w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors duration-200 ${focusRing} ${
                  isActive ? "" : "hover:bg-gray-50"
                }`}
                style={isActive ? { backgroundColor: GREEN_SOFT } : undefined}
              >
                <span
                  className={`inline-flex w-9 shrink-0 items-center gap-1 text-xs font-semibold tabular-nums ${
                    isActive ? "text-[#025246]" : "text-gray-600"
                  }`}
                >
                  {star}
                  <Star
                    size={11}
                    aria-hidden
                    className={
                      isActive ? "fill-[#025246] text-[#025246]" : "text-gray-400"
                    }
                  />
                </span>

                <span
                  aria-hidden
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100"
                >
                  <span
                    className={`block h-full rounded-full transition-all duration-500 ease-out ${
                      isActive ? "bg-[#025246]" : "bg-amber-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </span>

                <span
                  className={`w-9 shrink-0 text-right text-xs tabular-nums ${
                    isActive ? "font-semibold text-[#025246]" : "text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Toolbar — pencarian + pengurutan
   ============================================================ */
const controlClass =
  "h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 transition-colors duration-200 focus:border-[#025246] focus:outline-none focus:ring-2 focus:ring-[#025246]/10";

function ReviewToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
}) {
  return (
    <section
      aria-label="Pencarian dan pengurutan ulasan"
      className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search
          size={16}
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Cari pembeli, produk, atau isi ulasan..."
          aria-label="Cari ulasan"
          className={`${controlClass} w-full pl-10 pr-3.5 placeholder:text-gray-400`}
        />
      </div>

      <div className="relative w-full sm:w-52">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Urutkan ulasan"
          className={`${controlClass} w-full cursor-pointer appearance-none pr-9`}
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="highest">Rating Tertinggi</option>
          <option value="lowest">Rating Terendah</option>
        </select>
        <ChevronDown
          size={16}
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </section>
  );
}

/* ============================================================
   Review card
   ============================================================ */
function ReviewCard({ review }: { review: ReviewForFarmer }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 transition-colors duration-200 hover:border-gray-200 sm:p-6">
      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <div
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
          style={{ backgroundColor: GREEN_AVATAR, color: GREEN }}
        >
          {getInitials(review.buyerName)}
        </div>

        <div className="min-w-0 flex-1">
          {/* Metadata: pembeli + tanggal | rating */}
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-gray-900">
                {review.buyerName}
              </h3>
              <time
                dateTime={new Date(review.createdAt).toISOString()}
                className="text-xs text-gray-400"
              >
                {formatDate(review.createdAt)}
              </time>
            </div>
            <Stars value={review.rating} size={14} className="mt-0.5" />
          </div>

          {/* Isi ulasan */}
          <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
            {review.comment ? (
              review.comment
            ) : (
              <span className="text-sm italic text-gray-400">
                Pembeli tidak menulis komentar.
              </span>
            )}
          </p>

          {/* Komoditas sebagai metadata */}
          <div className="mt-3.5">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[#F0F7F5] px-2.5 py-1 text-xs font-medium text-[#025246]">
              <Package size={12} aria-hidden className="shrink-0" />
              <span className="min-w-0 break-words">{review.commodityName}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   Page
   ============================================================ */
export default function PetaniReviews() {
  const user = getClientUser();

  const { data: reviews, loading } = useFetch(
    () =>
      user
        ? getReviewsForFarmer(user.id)
        : Promise.resolve([] as ReviewForFarmer[]),
    [user?.id],
  );

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const list = useMemo(() => reviews ?? [], [reviews]);

  const summary = useMemo(() => {
    const total = list.length;
    const avg = total > 0 ? list.reduce((a, r) => a + r.rating, 0) / total : 0;
    const dist: RatingDistItem[] = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: list.filter((r) => r.rating === star).length,
    }));
    return { total, avg, dist };
  }, [list]);

  const filtered = useMemo(() => {
    let result = [...list];
    if (ratingFilter !== null)
      result = result.filter((r) => r.rating === ratingFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (r) =>
          r.buyerName.toLowerCase().includes(q) ||
          r.commodityName.toLowerCase().includes(q) ||
          (r.comment ?? "").toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => {
      if (sort === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "highest") return b.rating - a.rating;
      if (sort === "lowest") return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [list, query, sort, ratingFilter]);

  if (loading) return <ReviewsSkeleton />;

  const hasActiveFilter = ratingFilter !== null || query.trim().length > 0;

  const resetFilters = () => {
    setQuery("");
    setRatingFilter(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-0">
        {/* ---------- Header ---------- */}
        <header className="mb-7 sm:mb-8">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: GREEN_SOFT, color: GREEN }}
            >
              <MessageSquareText size={20} strokeWidth={2} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Ulasan Pembeli
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-gray-500">
            Penilaian dan masukan pembeli terhadap produk Anda.
          </p>
        </header>

        {/* ---------- Reputasi ---------- */}
        <div className="mb-7 sm:mb-8">
          <RatingOverview
            total={summary.total}
            avg={summary.avg}
            dist={summary.dist}
            activeRating={ratingFilter}
            onSelectRating={setRatingFilter}
          />
        </div>

        {/* ---------- Toolbar ---------- */}
        <ReviewToolbar
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
        />

        {/* ---------- Status filter aktif ---------- */}
        {hasActiveFilter && (
          <div className="mb-4 mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-sm text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-gray-800">
                {filtered.length}
              </span>{" "}
              dari {summary.total} ulasan
            </p>
            {ratingFilter !== null && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#F0F7F5] px-2.5 py-1 text-xs font-semibold text-[#025246]">
                {ratingFilter}
                <Star size={11} aria-hidden className="fill-[#025246] text-[#025246]" />
                bintang
              </span>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className={`ml-auto text-xs font-semibold text-[#025246] hover:underline ${focusRing} rounded`}
            >
              Reset filter
            </button>
          </div>
        )}

        {/* ---------- Daftar ulasan ---------- */}
        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            summary.total === 0 ? (
              <EmptyState
                title="Belum Ada Ulasan"
                message="Ulasan dari pembeli akan muncul di sini setelah pesanan selesai."
              />
            ) : (
              <EmptyState
                title="Tidak Ditemukan"
                message="Coba ubah kata kunci atau filter pencarian Anda."
              >
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`mt-4 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#025246] transition-colors duration-200 hover:bg-[#F0F7F5] ${focusRing}`}
                >
                  Reset filter
                </button>
              </EmptyState>
            )
          ) : (
            filtered.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>
      </div>
    </div>
  );
}
