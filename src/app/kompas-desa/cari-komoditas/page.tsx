"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  Package,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowUpDown,
  Star,
} from "lucide-react";
import {
  getPublicCommodities,
  countPublicCommodities,
  getCategoriesWithCount,
} from "@/actions/commodity";
import { getPublicFarmers } from "@/actions/farmer";
import { useFetch } from "@/lib/hooks";
import { formatRupiah, formatNumber } from "@/lib/format";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/shared/States";
import type { PublicCommodity, PublicFarmer } from "@/lib/types/market";

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

const QUALITY_OPTIONS = ["A", "B", "C"];

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
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

function CommoditySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[#E2E8E5] bg-white"
        >
          <Skeleton className="h-44 rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FarmerSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="shrink-0 w-56 overflow-hidden rounded-2xl border border-[#E2E8E5] bg-white p-4"
        >
          <Skeleton className="mx-auto h-16 w-16 rounded-full" />
          <Skeleton className="mt-3 h-4 w-3/4 mx-auto" />
          <Skeleton className="mt-2 h-3 w-1/2 mx-auto" />
          <Skeleton className="mt-3 h-8 w-full" />
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
      {/* Kategori */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-[#1F302B]">Kategori</h3>
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
        <h3 className="mb-3 text-sm font-bold text-[#1F302B]">Harga</h3>
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

      {/* Kualitas */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-[#1F302B]">Kualitas</h3>
        <div className="flex gap-2">
          {QUALITY_OPTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() =>
                onFilterChange({
                  quality: filters.quality === q ? undefined : q,
                })
              }
              className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition ${
                filters.quality === q
                  ? "bg-[#025246] text-white"
                  : "border border-[#DDE5E1] text-[#344640] hover:border-[#025246]/30"
              }`}
            >
              Grade {q}
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

type FilterState = {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  quality?: string;
  location?: string;
};

function CariKomoditasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") ?? "";
  const initialSort = searchParams.get("sort") ?? "newest";
  const initialCat = searchParams.get("cat")
    ? Number(searchParams.get("cat"))
    : undefined;
  const initialMinP = searchParams.get("minP")
    ? Number(searchParams.get("minP"))
    : undefined;
  const initialMaxP = searchParams.get("maxP")
    ? Number(searchParams.get("maxP"))
    : undefined;
  const initialQl = searchParams.get("ql") ?? undefined;
  const initialLoc = searchParams.get("loc") ?? undefined;

  const [query, setQuery] = useState(initialQ);
  const [sort, setSort] = useState(initialSort);
  const [filters, setFilters] = useState<FilterState>({
    categoryId: initialCat,
    minPrice: initialMinP,
    maxPrice: initialMaxP,
    quality: initialQl,
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
      if (s && s !== "newest") params.set("sort", s);
      if (f.categoryId) params.set("cat", String(f.categoryId));
      if (f.minPrice !== undefined) params.set("minP", String(f.minPrice));
      if (f.maxPrice !== undefined) params.set("maxP", String(f.maxPrice));
      if (f.quality) params.set("ql", f.quality);
      if (f.location) params.set("loc", f.location);
      const qs = params.toString();
      router.replace(`/kompas-desa/cari-komoditas${qs ? `?${qs}` : ""}`, {
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

  const fetchCommodities = useCallback(() => {
    setError(null);
    return getPublicCommodities({
      search: debouncedQuery || undefined,
      categoryId: filters.categoryId,
      location: filters.location,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      quality: filters.quality,
      sort,
      limit: LIMIT,
      offset: (page - 1) * LIMIT,
    }).then((r) => r as PublicCommodity[]);
  }, [debouncedQuery, filters, sort, page]);

  const fetchCount = useCallback(() => {
    return countPublicCommodities({
      search: debouncedQuery || undefined,
      categoryId: filters.categoryId,
      location: filters.location,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      quality: filters.quality,
    });
  }, [debouncedQuery, filters]);

  const { data: commodities, loading } = useFetch(fetchCommodities, [
    debouncedQuery,
    filters.categoryId,
    filters.minPrice,
    filters.maxPrice,
    filters.quality,
    filters.location,
    sort,
    page,
  ]);

  const { data: totalCount } = useFetch(fetchCount, [
    debouncedQuery,
    filters.categoryId,
    filters.minPrice,
    filters.maxPrice,
    filters.quality,
    filters.location,
  ]);

  const fetchFarmers = useCallback(() => {
    return getPublicFarmers({
      search: debouncedQuery || undefined,
      location: filters.location,
      limit: 6,
    }).then((r) => r as PublicFarmer[]);
  }, [debouncedQuery, filters.location]);

  const { data: farmers, loading: farmersLoading } = useFetch(fetchFarmers, [
    debouncedQuery,
    filters.location,
  ]);

  const { data: categories } = useFetch(
    () => getCategoriesWithCount() as Promise<CategoryWithCount[]>,
    [],
  );

  const commodityList = commodities ?? [];
  const farmerList = farmers ?? [];
  const categoryList = categories ?? [];
  const count = totalCount ?? 0;
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
  if (filters.quality) {
    activeFilters.push({
      key: "quality",
      label: `Grade ${filters.quality}`,
      onRemove: () => setFilters((f) => ({ ...f, quality: undefined })),
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
    setSort("newest");
    setQuery("");
  };

  const commodityImage = (c: PublicCommodity) => {
    if (c.image) return c.image;
    if (c.images?.length) return c.images[0];
    return null;
  };

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
              Cari Komoditas
            </h1>
            <p className="mt-1 font-body text-sm text-[#6B807C]">
              Temukan hasil pertanian dari petani lokal
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
                placeholder="Cari hasil pertanian, komoditas, atau nama petani..."
                aria-label="Cari komoditas"
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
                      <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-[#E2E8E5] bg-white py-1 shadow-lg animate-fade-in">
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

            {/* COMMODITY RESULTS */}
            {loading ? (
              <CommoditySkeleton />
            ) : commodityList.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {commodityList.map((item) => {
                    const img = commodityImage(item);
                    return (
                      <article
                        key={item.id}
                        className="group overflow-hidden rounded-2xl border border-[#E2E8E5] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#025246]/30 hover:shadow-[0_16px_40px_rgba(2,82,70,0.08)]"
                      >
                        <div className="relative h-44 overflow-hidden bg-[#EEF3F0]">
                          {img ? (
                            <Image
                              src={img}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-[#8A9C98]">
                              Tidak ada gambar
                            </div>
                          )}
                          {item.categoryName && (
                            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 font-body text-[10px] font-semibold text-[#025246] shadow-sm">
                              {item.categoryName}
                            </span>
                          )}
                          {item.status === "sold_out" && (
                            <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-2.5 py-1 font-body text-[10px] font-semibold text-white">
                              Habis
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-1 font-body text-[15px] font-bold text-[#1F302B]">
                              {item.name}
                            </h3>
                            <span className="shrink-0 rounded-full bg-[#EAF3EF] px-2 py-0.5 font-body text-[9px] font-semibold text-[#025246]">
                              {item.quality ? `Grade ${item.quality}` : ""}
                            </span>
                          </div>

                          <p className="mt-1.5 font-body text-lg font-bold text-[#025246]">
                            {formatRupiah(Number(item.price))}
                            <span className="ml-1 text-xs font-medium text-[#81908C]">
                              / {item.unit}
                            </span>
                          </p>

                          <div className="mt-3 space-y-1.5 border-t border-[#EEF1F0] pt-3">
                            <div className="flex items-center gap-1.5 text-xs text-[#71817D]">
                              <MapPin size={12} className="shrink-0" />
                              <span className="truncate">
                                {item.location || "Lokasi tidak tersedia"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#71817D]">
                              <Package size={12} className="shrink-0" />
                              <span>
                                Stok {formatNumber(Number(item.stock))}{" "}
                                {item.unit}
                              </span>
                            </div>
                            {Number(item.rating) > 0 && (
                              <div className="flex items-center gap-1.5 text-xs text-amber-500">
                                <Star size={12} fill="currentColor" />
                                <span>
                                  {Number(item.rating).toFixed(1)}
                                  <span className="text-[#8A9C98] ml-1">
                                    ({item.reviewCount})
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>

                          <p className="mt-2 truncate font-body text-xs text-[#8A9C98]">
                            {item.farmerName || "Petani"}
                          </p>

                          <Link
                            href={`/kompas-desa/cari-komoditas/${item.id}`}
                            className="mt-3 block w-full rounded-lg bg-[#025246] py-2 text-center font-body text-xs font-semibold text-white transition hover:bg-[#013E35]"
                          >
                            Lihat Detail
                          </Link>
                        </div>
                      </article>
                    );
                  })}
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
                title="Tidak menemukan hasil"
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

            {/* FARMER DISCOVERY */}
            {!loading && farmerList.length > 0 && (
              <div className="mt-12">
                <h2 className="mb-4 text-lg font-bold text-[#1F302B]">
                  Petani yang relevan
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {farmersLoading ? (
                    <FarmerSkeleton />
                  ) : (
                    farmerList.map((farmer) => (
                      <Link
                        key={farmer.id}
                        href={`/kompas-desa/petani/${farmer.id}`}
                        className="group flex w-56 shrink-0 flex-col items-center rounded-2xl border border-[#E2E8E5] bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#025246]/30 hover:shadow-[0_12px_32px_rgba(2,82,70,0.08)]"
                      >
                        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[#EEF3F0]">
                          {farmer.fotoProfile ? (
                            <Image
                              src={farmer.fotoProfile}
                              alt={farmer.fullName}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#025246]">
                              {farmer.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <h3 className="mt-3 line-clamp-1 text-sm font-bold text-[#1F302B]">
                          {farmer.fullName}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#71817D]">
                          Petani{farmer.village ? ` · ${farmer.village}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-[#8A9C98]">
                          {farmer.commodityCount} Komoditas
                        </p>

                        <span className="mt-3 w-full rounded-lg border border-[#DDE5E1] py-2 text-center text-xs font-semibold text-[#344640] transition group-hover:border-[#025246] group-hover:text-[#025246]">
                          Lihat Profil
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
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

export default function CariKomoditasPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <CariKomoditasContent />
    </Suspense>
  );
}
