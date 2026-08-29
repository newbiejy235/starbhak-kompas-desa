"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { SearchPublicFarmer } from "@/lib/types/market";
import {
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  Star,
  Users,
  Package,
} from "lucide-react";
import ProductCard from "@/components/userpage/ProductCard";
import FarmerCard from "@/components/kompasdesa/FarmerCard";
import { EmptyState } from "@/components/shared/States";
import {
  getPublicCommodities,
  getCategoriesWithCount,
} from "@/actions/commodity";
import {
  searchPublicFarmers,
  countSearchPublicFarmers,
} from "@/actions/farmer";
import { useFetch } from "@/lib/hooks";
import { formatRupiah } from "@/lib/format";

import type { PublicCommodity } from "@/lib/types/market";

import { Skeleton } from "@/components/ui/Skeleton";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

type CategoryWithCount = {
  id: number;
  name: string;
  icon: string | null;
  count: number;
};

type Tab = "komoditas" | "petani";

type FarmerFilterState = {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  location?: string;
};

const FARMER_SORT_OPTIONS = [
  { value: "relevance", label: "Relevansi" },
  { value: "newest", label: "Terbaru" },
  { value: "rating", label: "Rating Tertinggi" },
  { value: "price_asc", label: "Harga Terendah" },
  { value: "price_desc", label: "Harga Tertinggi" },
];

const PRICE_PRESETS = [
  { label: "Semua Harga", min: undefined, max: undefined },
  { label: "< Rp10.000", min: undefined, max: 10000 },
  { label: "Rp10k - 25k", min: 10000, max: 25000 },
  { label: "Rp25k - 50k", min: 25000, max: 50000 },
  { label: "> Rp50.000", min: 50000, max: undefined },
];

const RATING_OPTIONS = [
  { label: "Semua", value: undefined },
  { label: "4+", value: 4 },
  { label: "3+", value: 3 },
  { label: "2+", value: 2 },
];

function CatalogSkeleton() {
  return (
    <div className="animate-fade-up">
      <Skeleton className="mb-7 h-44 rounded-card sm:h-40" />
      <div className="mb-6">
        <Skeleton className="mb-3 h-4 w-20" />
        <div className="flex gap-2">
          {[72, 96, 88, 104, 84].map((w, i) => (
            <Skeleton key={i} className="h-9 rounded-lg" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="mb-5 space-y-2">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-3.5 w-72" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-card border border-gray-200/80 bg-white"
          >
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-2.5 p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-20" />
              <div className="border-t border-gray-100 pt-2.5">
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FarmerFilterPanel({
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
  filters: FarmerFilterState;
  onFilterChange: (f: Partial<FarmerFilterState>) => void;
  onReset: () => void;
}) {
  const content = (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          Lokasi
        </h3>
        <input
          type="text"
          placeholder="Contoh: Bogor"
          value={filters.location ?? ""}
          onChange={(e) =>
            onFilterChange({ location: e.target.value || undefined })
          }
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/10"
        />
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          Kategori
        </h3>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onFilterChange({ categoryId: undefined })}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${!filters.categoryId
              ? "bg-primary font-semibold text-white"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onFilterChange({ categoryId: c.id })}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${filters.categoryId === c.id
                ? "bg-primary font-semibold text-white"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <span>
                {c.icon && <span className="mr-1">{c.icon}</span>}
                {c.name}
              </span>
              <span className="text-xs opacity-60">({c.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          Harga Produk
        </h3>
        <div className="space-y-1.5">
          {PRICE_PRESETS.map((preset) => {
            const isActive =
              filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onFilterChange({ minPrice: preset.min, maxPrice: preset.max })
                }
                className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${isActive
                  ? "bg-primary font-semibold text-white"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onFilterChange({
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
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
            className="w-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          Rating
        </h3>
        <div className="flex gap-1.5">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onFilterChange({ minRating: opt.value })}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition ${filters.minRating === opt.value
                ? "bg-primary text-white"
                : "border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                }`}
            >
              {opt.value !== undefined && (
                <Star
                  size={11}
                  className={
                    filters.minRating === opt.value ? "text-white" : "text-amber-400"
                  }
                  fill="currentColor"
                />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 transition hover:border-primary hover:text-primary"
      >
        Reset Filter
      </button>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-24 rounded-card border border-gray-200/80 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-sm font-bold text-gray-900">Filter Petani</h2>
          {content}
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Filter Petani</h2>
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

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const catParam = searchParams.get("category");
  const tabParam = (searchParams.get("tab") as Tab) || "komoditas";

  const [activeTab, setActiveTab] = useState<Tab>(tabParam);

  const [farmerFilters, setFarmerFilters] = useState<FarmerFilterState>({
    categoryId: searchParams.get("cat") ? Number(searchParams.get("cat")) : undefined,
    minPrice: searchParams.get("minP") ? Number(searchParams.get("minP")) : undefined,
    maxPrice: searchParams.get("maxP") ? Number(searchParams.get("maxP")) : undefined,
    minRating: searchParams.get("rating")
      ? Number(searchParams.get("rating"))
      : undefined,
    location: searchParams.get("loc") ?? undefined,
  });
  const [farmerSort, setFarmerSort] = useState(searchParams.get("sort") ?? "relevance");
  const [farmerPage, setFarmerPage] = useState(1);
  const [farmerFilterOpen, setFarmerFilterOpen] = useState(false);
  const [farmerSortOpen, setFarmerSortOpen] = useState(false);

  const FARMER_LIMIT = 12;

  // Sinkronkan activeTab kalau query param ?tab berubah dari luar (mis. tombol back/forward)
  const prevTabRef = useRef(tabParam);
  useEffect(() => {
    if (prevTabRef.current !== tabParam) {
      prevTabRef.current = tabParam;
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Semua hooks di atas ini ada di top-level komponen (bukan di dalam callback lain).
  const switchTab = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (tab !== "komoditas") params.set("tab", tab);
      router.replace(`/user/home?${params.toString()}`, { scroll: false });
    },
    [router, search],
  );

  const { data: products, loading: productsLoading } = useFetch(
    () =>
      getPublicCommodities({
        search: search || undefined,
        categoryId: catParam ? Number(catParam) : undefined,
      }) as Promise<PublicCommodity[]>,
    [search, catParam],
  );

  const { data: categories } = useFetch(
    () => getCategoriesWithCount() as Promise<CategoryWithCount[]>,
    [],
  );

  const fetchFarmers = useCallback(() => {
    return searchPublicFarmers({
      search: search || undefined,
      categoryId: farmerFilters.categoryId,
      location: farmerFilters.location,
      minPrice: farmerFilters.minPrice,
      maxPrice: farmerFilters.maxPrice,
      minRating: farmerFilters.minRating,
      sort: farmerSort,
      limit: FARMER_LIMIT,
      offset: (farmerPage - 1) * FARMER_LIMIT,
    }).then((r) => r as SearchPublicFarmer[]);
  }, [
    search,
    farmerFilters.categoryId,
    farmerFilters.location,
    farmerFilters.minPrice,
    farmerFilters.maxPrice,
    farmerFilters.minRating,
    farmerSort,
    farmerPage,
  ]);

  const fetchFarmerCount = useCallback(() => {
    return countSearchPublicFarmers({
      search: search || undefined,
      categoryId: farmerFilters.categoryId,
      location: farmerFilters.location,
      minPrice: farmerFilters.minPrice,
      maxPrice: farmerFilters.maxPrice,
      minRating: farmerFilters.minRating,
    });
  }, [
    search,
    farmerFilters.categoryId,
    farmerFilters.location,
    farmerFilters.minPrice,
    farmerFilters.maxPrice,
    farmerFilters.minRating,
  ]);

  const { data: farmers, loading: farmersLoading } = useFetch(fetchFarmers, [
    fetchFarmers,
  ]);
  const { data: farmerCount } = useFetch(fetchFarmerCount, [fetchFarmerCount]);

  const productList = products ?? [];
  const categoryList = categories ?? [];
  const farmerList = farmers ?? [];
  const fCount = farmerCount ?? 0;
  const hasMoreFarmers = farmerPage * FARMER_LIMIT < fCount;

  const categoryOrder = [
    "Sayuran",
    "Buah-buahan",
    "Umbi-umbian",
    "Padi & Serealia",
    "Kacang-kacangan",
    "Rempah-rempah",
    "Tanaman Perkebunan",
    "Tanaman Herbal",
    "Tanaman Hias",
    "Lainnya",
  ];

  const sortedCategories = [...categoryList].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.name);
    const indexB = categoryOrder.indexOf(b.name);

    // Kategori yang tidak ada di daftar diletakkan paling belakang.
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  const chipClass = (active: boolean) =>
    `inline-flex shrink-0 items-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${focusRing} ${active
      ? "bg-primary text-white"
      : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
    }`;

  const tabClass = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${focusRing} ${active
      ? "bg-primary text-white shadow-md"
      : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-gray-200"
    }`;

  const activeFarmerFilterCount = [
    farmerFilters.categoryId,
    farmerFilters.minPrice !== undefined || farmerFilters.maxPrice !== undefined,
    farmerFilters.minRating,
    farmerFilters.location,
  ].filter(Boolean).length;

  const activeFarmerFilters: { key: string; label: string; onRemove: () => void }[] = [];

  if (farmerFilters.categoryId) {
    const cat = categoryList.find((c) => c.id === farmerFilters.categoryId);
    activeFarmerFilters.push({
      key: "cat",
      label: cat?.name ?? "Kategori",
      onRemove: () => setFarmerFilters((f) => ({ ...f, categoryId: undefined })),
    });
  }
  if (farmerFilters.minPrice !== undefined || farmerFilters.maxPrice !== undefined) {
    const minL = farmerFilters.minPrice ? formatRupiah(farmerFilters.minPrice) : "Rp0";
    const maxL = farmerFilters.maxPrice ? formatRupiah(farmerFilters.maxPrice) : "∞";
    activeFarmerFilters.push({
      key: "price",
      label: `${minL} - ${maxL}`,
      onRemove: () =>
        setFarmerFilters((f) => ({ ...f, minPrice: undefined, maxPrice: undefined })),
    });
  }
  if (farmerFilters.minRating) {
    activeFarmerFilters.push({
      key: "rating",
      label: `${farmerFilters.minRating}+ Bintang`,
      onRemove: () => setFarmerFilters((f) => ({ ...f, minRating: undefined })),
    });
  }
  if (farmerFilters.location) {
    activeFarmerFilters.push({
      key: "loc",
      label: farmerFilters.location,
      onRemove: () => setFarmerFilters((f) => ({ ...f, location: undefined })),
    });
  }

  const resetFarmerFilters = () => {
    setFarmerFilters({});
    setFarmerSort("relevance");
    setFarmerPage(1);
  };

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      {/* <section className="relative mb-7 overflow-hidden rounded-card bg-gradient-to-r from-primary to-primary-dark p-6 text-white shadow-soft sm:p-8">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl lg:text-3xl">
            Panen Segar Langsung dari Petani Lokal
          </h1>
          <p className="mt-2 mb-5 max-w-md text-sm text-white/80">
            Kualitas terbaik dengan harga transparan. Dukung petani Indonesia!
          </p>
          <Link
            href="#katalog"
            className={`inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition-colors duration-150 hover:bg-emerald-50 active:scale-[0.98] ${focusRing}`}
          >
            Jelajahi Katalog
          </Link>
        </div>
        <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 opacity-15 md:block">
          <Image src="/images/user/HeaderImageUser.svg" alt="" width={160} height={160} />
        </div>
      </section> */}

      {/* Tab switcher */}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => switchTab("komoditas")}
          className={tabClass(activeTab === "komoditas")}
        >
          <Package size={16} />
          Komoditas
        </button>
        <button
          type="button"
          onClick={() => switchTab("petani")}
          className={tabClass(activeTab === "petani")}
        >
          <Users size={16} />
          Petani
        </button>
      </div>

      {activeTab === "komoditas" && (
        <>
          <section id="katalog" className="mb-7 scroll-mt-24">
            <h2 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">
              Kategori
            </h2>
            <p className="mb-3 text-sm text-gray-500">
              Saring komoditas sesuai kebutuhan Anda.
            </p>
            <div
              role="group"
              aria-label="Filter kategori"
              className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-thin sm:mx-0 sm:px-0"
            >
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/user/home")}
                  aria-pressed={!catParam}
                  className={chipClass(!catParam)}
                >
                  Semua
                </button>
                {sortedCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => router.push(`/user/home?category=${c.id}`)}
                    aria-pressed={catParam === String(c.id)}
                    className={chipClass(catParam === String(c.id))}
                  >
                    {c.icon && <span className="mr-1">{c.icon}</span>}
                    {c.name}
                    {c.count > 0 && (
                      <span className="ml-1.5 text-xs opacity-60">({c.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section aria-label="Katalog komoditas">
            <div className="mb-5">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">
                Katalog Komoditas
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {search
                  ? `Hasil pencarian untuk "${search}"`
                  : "Jelajahi hasil panen terbaik dari berbagai daerah."}
              </p>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-card border border-gray-200/80 bg-white"
                  >
                    <Skeleton className="aspect-[4/3] rounded-none" />
                    <div className="space-y-3 p-5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-6 w-28 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productList.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {productList.map((item, i) => (
                  <div
                    key={item.id}
                    className="animate-fade-up"
                    style={{
                      animationDelay: `${Math.min(i * 60, 480)}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <ProductCard
                      data={{
                        ...item,
                        images: item.image ? [item.image] : [],
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum Ada Produk"
                message={
                  search || catParam
                    ? "Tidak ada produk yang cocok dengan filter Anda."
                    : "Saat ini belum ada komoditas hasil panen yang tersedia."
                }
              />
            )}
          </section>
        </>
      )}

      {activeTab === "petani" && (
        <section aria-label="Pencarian petani">
          <div className="flex gap-6">
            <FarmerFilterPanel
              open={farmerFilterOpen}
              onClose={() => setFarmerFilterOpen(false)}
              categories={categoryList}
              filters={farmerFilters}
              onFilterChange={(f) => setFarmerFilters((prev) => ({ ...prev, ...f }))}
              onReset={resetFarmerFilters}
            />

            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFarmerFilterOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-600 transition hover:border-primary hover:text-primary lg:hidden"
                  >
                    <SlidersHorizontal size={15} />
                    Filter
                    {activeFarmerFilterCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {activeFarmerFilterCount}
                      </span>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setFarmerSortOpen(!farmerSortOpen)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-600 transition hover:border-primary hover:text-primary"
                    >
                      <ArrowUpDown size={15} />
                      {FARMER_SORT_OPTIONS.find((s) => s.value === farmerSort)?.label}
                      <ChevronDown size={14} />
                    </button>

                    {farmerSortOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setFarmerSortOpen(false)}
                        />
                        <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-gray-200/80 bg-white py-1 shadow-lift animate-fade-in">
                          {FARMER_SORT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setFarmerSort(opt.value);
                                setFarmerSortOpen(false);
                              }}
                              className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition ${farmerSort === opt.value
                                ? "bg-primary/5 font-semibold text-primary"
                                : "text-gray-600 hover:bg-gray-50"
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

                {!farmersLoading && (
                  <span className="text-xs text-gray-400">
                    {fCount} petani
                    {search ? ` untuk "${search}"` : ""}
                  </span>
                )}
              </div>

              {activeFarmerFilters.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {activeFarmerFilters.map((f) => (
                    <span
                      key={f.key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"
                    >
                      {f.label}
                      <button
                        type="button"
                        onClick={f.onRemove}
                        className="rounded-full p-0.5 hover:bg-primary/10"
                        aria-label={`Hapus filter ${f.label}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={resetFarmerFilters}
                    className="text-xs font-semibold text-gray-400 underline underline-offset-2 hover:text-primary"
                  >
                    Reset Semua
                  </button>
                </div>
              )}

              {farmersLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-card border border-gray-200/80 bg-white"
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
                        <Skeleton className="h-8 w-full rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : farmerList.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {farmerList.map((farmer) => (
                      <FarmerCard key={farmer.id} farmer={farmer} />
                    ))}
                  </div>

                  {hasMoreFarmers && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setFarmerPage((p) => p + 1)}
                        className="rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-600 transition hover:border-primary hover:text-primary"
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
                  {activeFarmerFilters.length > 0 && (
                    <button
                      type="button"
                      onClick={resetFarmerFilters}
                      className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
                    >
                      Reset Filter
                    </button>
                  )}
                </EmptyState>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}