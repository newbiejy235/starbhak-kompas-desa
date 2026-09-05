"use client";

import { useState } from "react";
import { getAllReviews } from "@/actions/review";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import { useFetch } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import { Search } from "lucide-react";
import { Star } from "lucide-react";

function ReviewsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-28 rounded-card" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-card" />
      ))}
    </div>
  );
}

type ReviewItem = {
  id: number;
  buyerName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  commodityName: string;
  farmerName: string;
};

export default function AdminReviews() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data: reviews, loading } = useFetch(
    () => getAllReviews(),
    [search],
  );

  if (loading) return <ReviewsSkeleton />;

  // Initialize list first
  const allReviews: ReviewItem[] = reviews ?? [];
  const total = allReviews.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentPageReviews = allReviews.slice(startIndex, endIndex);

  // Filter function - sederhana
  const getFilteredReviews = () => {
    if (!search.trim()) return currentPageReviews;
    const query = search.trim().toLowerCase();
    return currentPageReviews.filter((review) => {
      const searchableText = [
        review.buyerName,
        review.comment,
        review.commodityName,
        review.farmerName,
      ]
        .filter(Boolean)
        .join(" ");
      return searchableText.toLowerCase().includes(query);
    });
  };

  const filteredReviews = getFilteredReviews();

  // Page numbers computation
  const pageNumbers = (() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    pages.push(totalPages);
    pages.push(safePage);
    if (safePage > 1) pages.push(safePage - 1);
    if (safePage < totalPages) pages.push(safePage + 1);
    return [...new Set(pages)].sort((a, b) => a - b);
  })();

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Ulasan & Penilaian Produk
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Monitor ulasan pembeli terhadap petani dan produk.
      </p>

      {/* Search bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft sm:p-5">
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Cari ulasan berdasarkan nama pembeli, komentar, produk, atau petani..."
            aria-label="Cari ulasan"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {filteredReviews.length} ulasan
          </p>
          {search && (
            <p className="text-xs text-gray-500">Hasil pencarian</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-primary"
            onChange={(e) => setPage(1)}
          >
            <option value="10">Tampilkan 10</option>
            <option value="25">Tampilkan 25</option>
            <option value="50">Tampilkan 50</option>
          </select>
        </div>
      </div>

      {/* REVIEWS LIST */}
      {loading ? (
        <ReviewsSkeleton />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          title="Tidak Ada Ulasan"
          message={
            search
              ? "Tidak ada ulasan yang cocok dengan pencarian."
              : "Belum ada ulasan yang tercatat."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((r, i) => (
            <div
              key={r.id}
              className="bg-white rounded-card border border-gray-200/80 shadow-soft p-5 hover:shadow-lift transition-all duration-300 ease-smooth"
              style={{
                animationDelay: `${Math.min(i * 50, 400)}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{r.buyerName}</p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(r.createdAt)}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">{r.comment || "Tidak ada komentar."}</p>
              <p className="text-xs text-gray-400 mt-1">
                Produk: {r.commodityName} · Petani: {r.farmerName}
              </p>
            </div>
          ))}

          {/* PAGINATION */}
          {totalPages > 1 && !loading && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <p className="text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-semibold text-gray-900">
                  {filteredReviews.length === 0 ? "0" : (
                    (safePage - 1) * PAGE_SIZE + 1
                  )}:{filteredReviews.length > total - (safePage - 1) * PAGE_SIZE
                    ? total
                    : filteredReviews.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-gray-900">
                  {total.toLocaleString("id-ID")}
                </span>{" "}
                ulasan
              </p>

              <nav aria-label="Paginasi ulasan" className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(safePage - 1, 1))}
                  disabled={safePage <= 1}
                  aria-label="Halaman sebelumnya"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.971a.75.75 0 011.06 1.06l-3.247 3.247a.75.75 0 01-1.06.0L7.05 6.97a.75.75 0 01.06-1.06l3.247-3.247a.75.75 0 011.06 1.06zm5.05-6.861L18.657 10l-5.308 5.308a7.5 7.5 0 11-1.107-1.517L14.51 10l-3.187-3.187a7.5 7.5 0 01-1.517 1.107l5.308 5.307zm-9.657 9.657L10 14.5l5.307-5.308a7.5 7.5 0 111.107 1.517l-5.308 5.307a7.5 7.5 0 01-1.517-1.107l5.308 5.307zm9.657-9.657L1.343 10l5.307 5.307a7.5 7.5 0 111.107-1.517l-5.307 5.307a7.5 7.5 0 01-1.517 1.107L10 5.293a7.5 7.5 0 011.517 1.107z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div className="flex items-center gap-1">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setPage(page)}
                      aria-current={page === safePage ? "page" : undefined}
                      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg ${
                        page === safePage
                          ? "bg-primary text-white shadow-sm"
                          : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setPage(Math.min(safePage + 1, totalPages))}
                  disabled={safePage >= totalPages}
                  aria-label="Halaman berikutnya"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a.75.75 0 010-1.06l3.247-3.247a.75.75 0 011.06 1.06L3.95 13.75a.75.75 0 01.06 1.06l3.247 3.247a.75.75 0 01-1.06 1.06L7.293 15.758z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      )}

      {/* NO REVIEWS STATE */}
      {loading ? null : filteredReviews.length === 0 && !search ? (
        <EmptyState
          title="Belum Ada Ulasan"
          message="Ulasan pembeli akan muncul di sini setelah pelanggan memberikan rating dan komentar."
        />
      ) : null}
    </div>
  );
}