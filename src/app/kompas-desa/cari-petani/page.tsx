"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowUpDown,
  Star,
} from "lucide-react";
import {
  searchPublicFarmers,
} from "@/actions/farmer";
import {
  getCategoriesWithCount,
} from "@/actions/commodity";
import { useFetch } from "@/lib/hooks";
import { formatRupiah } from "@/lib/format";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/shared/States";
import FarmerCard from "@/components/kompasdesa/FarmerCard";
import type { SearchPublicFarmer } from "@/lib/types/market";

type CategoryWithCount = {
  id: number;
  name: string;
  icon: string | null;
  count: number;
};

const LIMIT = 12;

const PRICE_PRESETS = [
  { label: "Semua Harga", min: undefined, max: undefined },
  { label: "< Rp10.000", min: undefined, max: 10000 },
  { label: "Rp10.000 - Rp25.000", min: 10000, max: 25000 },
  { label: "Rp25.000 - Rp50.000", min: 25000, max: 50000 },
  { label: "> Rp50.000", min: 50000, max: undefined },
];

const RATING_OPTIONS = [
  { label: "Semua Rating", value: undefined },
  { label: "4+ Bintang", value: 4 },
  { label: "3+ Bintang", value: 3 },
  { label: "2+ Bintang", value: 2 },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevansi" },
  { value: "newest", label: "Terbaru Bergabung" },
  { value: "rating", label: "Rating Tertinggi" },
  { value: "price_asc", label: "Harga Terendah" },
  { value: "price_desc", label: "Harga Tertinggi" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

type FilterState = {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  location?: string;
};

function FarmerSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[#E2E8E5] bg-white"
        >
          <Skeleton className="h-28 rounded-none" />
          <div className="space-y-3 p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-8 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterPanel({
  open,
  onClose,
  categories,
  filters,
  onFilterChange,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  categories: CategoryWithCount[];
  filters: FilterState;
  onFilterChange: (f: Partial<FilterState>) => void;
  onReset: () => void;
}) {
  const content = (
    <div className="space-y-6">
      {/* Lokasi */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-[#1F302B]">Lokasi</h3>
        <input
          type="text"
          placeholder="Contoh: Bogor, Jawa Barat"
          value={filters.location ?? ""}
          onChange={(e) =>
            onFilterChange({ location: e.target.value || undefined })
          }
          className="w-full rounded-lg border border-[#DDE5E1] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#025246]"
        />
      </div>

      {/* Kategori Komoditas */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-[#1F302B]">
          Kategori Komoditas
        </h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onFilterChange({ categoryId: undefined })}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
              !filters.categoryId
                ? "bg-[#025246] text-white"
                : "text-[#344640] hover:bg-[#F3F8F5]"
            }`}
          >
            <span>Semua</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onFilterChange({ categoryId: c.id })}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                filters.categoryId === c.id
                  ? "bg-[#025246] text-white"
                  : "text-[#344640] hover:bg-[#F3F8F5]"
              }`}
            >
              <span>
                {c.icon && <span className="mr-1">{c.icon}</span>}
                {c.name}
              </span>
              <span className="text-xs opacity-70">({c.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Harga */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-[#1F302B]">
          Rentang Harga
        </h3>
        <div className="space-y-2">
          {PRICE_PRESETS.map((preset) => {
            const isActive =
              filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onFilterChange({
                    minPrice: preset.min,
                    maxPrice: preset.max,
                  })
                }
                className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${
                  isActive
                    ? "bg-[#025246] text-white"
                    : "text-[#344640] hover:bg-[#F3F8F5]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onFilterChange({
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-1/2 rounded-lg border border-[#DDE5E1] bg-white px-3 py-2 text-sm outline-none focus:border-[#025246]"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onFilterChange({
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-1/2 rounded-lg border border-[#DDE5E1] bg-white px-3 py-2 text-sm outline-none focus:border-[#025246]"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-[#1F302B]">
          Rating Petani
        </h3>
        <div className="space-y-2">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onFilterChange({ minRating: opt.value })}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                filters.minRating === opt.value
                  ? "bg-[#025246] text-white"
                  : "text-[#344640] hover:bg-[#F3F8F5]"
              }`}
            >
              {opt.value !== undefined && (
                <Star
                  size={14}
                  className={
                    filters.minRating === opt.value
                      ? "text-white"
                      : "text-amber-400"
                  }
                  fill="currentColor"
                />
              )}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-lg border border-[#DDE5E1] py-2.5 text-sm font-semibold text-[#344640] transition hover:border-[#025246] hover:text-[#025246]"
      >
        Reset Filter
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 rounded-2xl border border-[#E2E8E5] bg-white p-5">
          <h2 className="mb-4 text-base font-bold text-[#1F302B]">Filter</h2>
          {content}
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1F302B]">Filter</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

function CariPetaniContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") ?? "";
  const initialSort = searchParams.get("sort") ?? "relevance";
  const initialCat = searchParams.get("cat")
    ? Number(searchParams.get("cat"))
    : undefined;
  const initialMinP = searchParams.get("minP")
    ? Number(searchParams.get("minP"))
    : undefined;
  const initialMaxP = searchParams.get("maxP")
    ? Number(searchParams.get("maxP"))
    : undefined;
  const initialRating = searchParams.get("rating")
    ? Number(searchParams.get("rating"))
    : undefined;
  const initialLoc = searchParams.get("loc") ?? undefined;

  const [query, setQuery] = useState(initialQ);
  const [sort, setSort] = useState(initialSort);
  const [filters, setFilters] = useState<FilterState>({
    categoryId: initialCat,
    minPrice: initialMinP,
    maxPrice: initialMaxP,
    minRating: initialRating,
    location: initialLoc,
  });
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 400);

  const updateURL = useCallback(
    (q: string, s: string, f: FilterState) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (s && s !== "relevance") params.set("sort", s);
      if (f.categoryId) params.set("cat", String(f.categoryId));
      if (f.minPrice !== undefined) params.set("minP", String(f.minPrice));
      if (f.maxPrice !== undefined) params.set("maxP", String(f.maxPrice));
      if (f.minRating) params.set("rating", String(f.minRating));
      if (f.location) params.set("loc", f.location);
      const qs = params.toString();
      router.replace(`/kompas-desa/cari-petani${qs ? `?${qs}` : ""}`, {
        scroll: false,
      });
    },
    [router],
  );

  const prevFilterRef = useRef({ query: debouncedQuery, sort, filters });

  useEffect(() => {
    const prev = prevFilterRef.current;
    const filtersChanged =
      prev.query !== debouncedQuery ||
      prev.sort !== sort ||
      JSON.stringify(prev.filters) !== JSON.stringify(filters);

    if (filtersChanged) {
      prevFilterRef.current = { query: debouncedQuery, sort, filters: { ...filters } };
      setPage(1);
    }

    updateURL(debouncedQuery, sort, filters);
  }, [debouncedQuery, sort, filters, updateURL]);

  const fetchFarmers = useCallback(() => {
    setError(null);
    return searchPublicFarmers({
      search: debouncedQuery || undefined,
      categoryId: filters.categoryId,
      location: filters.location,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
      sort,
      limit: LIMIT,
      offset: (page - 1) * LIMIT,
    }).then((r) => r as (SearchPublicFarmer & { _totalCount: number })[]);
  }, [debouncedQuery, filters, sort, page]);

  const { data: farmers, loading } = useFetch(fetchFarmers, [
    debouncedQuery,
    filters.categoryId,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
    filters.location,
    sort,
    page,
  ]);

  const { data: categories } = useFetch(
    () => getCategoriesWithCount() as Promise<CategoryWithCount[]>,
    [],
  );

  const farmerList = farmers ?? [];
  const categoryList = categories ?? [];
  const count = farmers?.[0]?._totalCount ?? 0;
  const hasMore = page * LIMIT < count;

  const activeFilters: { key: string; label: string; onRemove: () => void }[] =
    [];

  if (filters.categoryId) {
    const cat = categoryList.find((c) => c.id === filters.categoryId);
    activeFilters.push({
      key: "cat",
      label: cat?.name ?? "Kategori",
      onRemove: () => setFilters((f) => ({ ...f, categoryId: undefined })),
    });
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const minLabel = filters.minPrice
      ? formatRupiah(filters.minPrice)
      : "Rp0";
    const maxLabel = filters.maxPrice
      ? formatRupiah(filters.maxPrice)
      : "∞";
    activeFilters.push({
      key: "price",
      label: `${minLabel} - ${maxLabel}`,
      onRemove: () =>
        setFilters((f) => ({ ...f, minPrice: undefined, maxPrice: undefined })),
    });
  }
  if (filters.minRating) {
    activeFilters.push({
      key: "rating",
      label: `${filters.minRating}+ Bintang`,
      onRemove: () => setFilters((f) => ({ ...f, minRating: undefined })),
    });
  }
  if (filters.location) {
    activeFilters.push({
      key: "loc",
      label: filters.location,
      onRemove: () => setFilters((f) => ({ ...f, location: undefined })),
    });
  }

  const resetFilters = () => {
    setFilters({});
    setSort("relevance");
    setQuery("");
  };

  const activeFilterCount = activeFilters.length;

  if (error) {
    return (
      <main className="min-h-screen bg-[#FAFAF9]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <ErrorState
            message="Terjadi kesalahan saat mengambil hasil pencarian."
            onRetry={() => {
              setError(null);
              setPage(1);
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] text-[#17231F]">
      {/* SEARCH BAR */}
      <section className="border-b border-[#E7EBE9] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-10">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Cari Petani
            </h1>
            <p className="mt-1 font-body text-sm text-[#6B807C]">
              Temukan petani terpercaya untuk kebutuhan Anda
            </p>
          </div>

          <div className="mt-6 max-w-3xl">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9C98]"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama petani, lokasi, atau komoditas..."
                aria-label="Cari petani"
                className="
                  h-12 w-full rounded-xl
                  border border-[#DDE5E1]
                  bg-white
                  pl-11 pr-4
                  font-body text-sm
                  outline-none
                  transition
                  focus:border-[#025246]
                  focus:ring-4
                  focus:ring-[#025246]/5
                "
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                  aria-label="Hapus pencarian"
                >
                  <X size={16} className="text-[#8A9C98]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-12">
        <div className="flex gap-8">
          {/* FILTER SIDEBAR */}
          <FilterPanel
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            categories={categoryList}
            filters={filters}
            onFilterChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
            onReset={resetFilters}
          />

          {/* RESULTS */}
          <div className="min-w-0 flex-1">
            {/* TOOLBAR */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#DDE5E1] bg-white px-3.5 py-2 text-sm font-semibold text-[#344640] transition hover:border-[#025246] hover:text-[#025246] lg:hidden"
                >
                  <SlidersHorizontal size={15} />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#025246] text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSortOpen(!sortOpen)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#DDE5E1] bg-white px-3.5 py-2 text-sm font-semibold text-[#344640] transition hover:border-[#025246] hover:text-[#025246]"
                  >
                    <ArrowUpDown size={15} />
                    {SORT_OPTIONS.find((s) => s.value === sort)?.label}
                    <ChevronDown size={14} />
                  </button>

                  {sortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSortOpen(false)}
                      />
                      <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-[#E2E8E5] bg-white py-1 shadow-lg animate-fade-in">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSort(opt.value);
                              setSortOpen(false);
                            }}
                            className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition ${
                              sort === opt.value
                                ? "bg-[#025246]/5 font-semibold text-[#025246]"
                                : "text-[#344640] hover:bg-[#F3F8F5]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!loading && (
                <span className="font-body text-xs text-[#8A9C98]">
                  {count} hasil{query ? ` untuk "${query}"` : ""}
                </span>
              )}
            </div>

            {/* ACTIVE FILTERS */}
            {activeFilters.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {activeFilters.map((f) => (
                  <span
                    key={f.key}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF3EF] px-3 py-1.5 text-xs font-semibold text-[#025246]"
                  >
                    {f.label}
                    <button
                      type="button"
                      onClick={f.onRemove}
                      className="rounded-full p-0.5 hover:bg-[#025246]/10"
                      aria-label={`Hapus filter ${f.label}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[#8A9C98] underline underline-offset-2 hover:text-[#025246]"
                >
                  Reset Semua
                </button>
              </div>
            )}

            {/* FARMER RESULTS */}
            {loading ? (
              <FarmerSkeleton />
            ) : farmerList.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {farmerList.map((farmer) => (
                    <FarmerCard key={farmer.id} farmer={farmer} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-xl border border-[#DDE5E1] bg-white px-8 py-3 text-sm font-semibold text-[#344640] transition hover:border-[#025246] hover:text-[#025246]"
                    >
                      Muat Lebih Banyak
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="Petani tidak ditemukan"
                message="Coba gunakan kata kunci lain atau kurangi filter yang digunakan."
              >
                {activeFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 rounded-xl bg-[#025246] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#013E35]"
                  >
                    Reset Filter
                  </button>
                )}
              </EmptyState>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SearchFallback() {
  return (
    <main className="min-h-screen bg-[#FAFAF9]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
        <div className="h-8 w-48 rounded-lg bg-gray-100 animate-pulse" />
        <div className="mt-4 h-12 w-full max-w-3xl rounded-xl bg-gray-100 animate-pulse" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function CariPetaniPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <CariPetaniContent />
    </Suspense>
  );
}
