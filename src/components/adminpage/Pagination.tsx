"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "…")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (index > 0 && page - previous > 1) result.push("…");
    result.push(page);
  });
  return result;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export default function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label = "item",
}: PaginationProps) {
  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const from = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Menampilkan{" "}
        <span className="font-semibold text-gray-900">
          {from.toLocaleString("id-ID")}–{to.toLocaleString("id-ID")}
        </span>{" "}
        dari{" "}
        <span className="font-semibold text-gray-900">
          {totalItems.toLocaleString("id-ID")}
        </span>{" "}
        {label}
      </p>

      <nav aria-label="Paginasi" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Halaman sebelumnya"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers(safePage, totalPages).map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="inline-flex h-9 min-w-7 items-center justify-center px-1 text-sm text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === safePage ? "page" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                p === safePage
                  ? "bg-primary text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Halaman berikutnya"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}