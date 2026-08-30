"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Package,
  Store,
  ArrowLeft,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  Star,
  Search
} from "lucide-react";
import ProductCard from "@/components/userpage/ProductCard";
import FarmerStoreCard from "@/components/userpage/FarmerStoreCard";
import PageHeader from "@/components/shared/PageHeader";
import { EmptyState, ErrorState } from "@/components/shared/States";
import {
  getPublicCommodities,
  countPublicCommodities,
} from "@/actions/commodity";
import { searchFarmersForBuyer } from "@/actions/farmer";
import { useFetch } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PublicCommodity, FarmerSearchResult } from "@/lib/types/market";

const PRODUCT_LIMIT = 12;
const FARMER_LIMIT = 12;

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevan" },
  { value: "rating", label: "Rating Tertinggi" },
  { value: "products", label: "Produk Terbanyak" },
  { value: "newest", label: "Terbaru" },
];

const RATING_OPTIONS = [
  { label: "Semua Rating", value: undefined },
  { label: "4.5+", value: 4.5 },
  { label: "4.0+", value: 4 },
  { label: "3.0+", value: 3 },
];

function SearchSkeleton() {
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg sm:rounded-card border border-gray-200/80 bg-white"
            >
              <Skeleton className="aspect-square sm:aspect-[4/3] rounded-none" />
              <div className="space-y-2 sm:space-y-3 p-2 sm:p-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-28 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FarmerFilterBar({
  sortBy,
  onSortChange,
  minRating,
  onRatingChange,
  location,
  onLocationChange,
}: {
  sortBy: string;
  onSortChange: (v: string) => void;
  minRating: number | undefined;
  onRatingChange: (v: number | undefined) => void;
  location: string;
  onLocationChange: (v: string) => void;
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLocChange = (v: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onLocationChange(v), 400);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Sort Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen(!sortOpen)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:border-primary/50 hover:bg-white hover:text-primary"
          >
            <SlidersHorizontal size={14} className="text-primary" />
            <span>{SORT_OPTIONS.find((s) => s.value === sortBy)?.label}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {sortOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setSortOpen(false)}
              />
              <div className="absolute left-0 top-full z-50 mt-1.5 w-52 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl animate-fade-in">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSortChange(opt.value);
                      setSortOpen(false);
                    }}
                    className={`flex w-full items-center px-4 py-2.5 text-left text-xs font-semibold transition ${
                      sortBy === opt.value
                        ? "bg-primary/10 text-primary"
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

        {/* Rating Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onRatingChange(opt.value)}
              className={`inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-bold transition shrink-0 ${
                minRating === opt.value
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "border border-gray-200 bg-gray-50/50 text-gray-600 hover:border-primary/50 hover:text-primary"
              }`}
            >
              {opt.value !== undefined && <Star size={12} className="fill-current" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location Search Input */}
      <div className="relative w-full md:w-56">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <MapPin size={14} />
        </div>
        <input
          type="text"
          placeholder="Filter lokasi petani..."
          defaultValue={location}
          onChange={(e) => handleLocChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-xs font-medium text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      </div>
    </div>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllFarmers, setShowAllFarmers] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState("");

  const fetchProducts = useCallback(
    () =>
      getPublicCommodities({
        search: q || undefined,
        limit: showAllProducts ? 48 : PRODUCT_LIMIT,
      }) as Promise<PublicCommodity[]>,
    [q, showAllProducts],
  );

  const fetchProductCount = useCallback(
    () => countPublicCommodities({ search: q || undefined }),
    [q],
  );

  const fetchFarmers = useCallback(
    () =>
      searchFarmersForBuyer({
        search: q || undefined,
        location: location || undefined,
        minRating,
        sort: sortBy,
        limit: showAllFarmers ? 48 : FARMER_LIMIT,
      }).then((r) => ({
        farmers: r.farmers as FarmerSearchResult[],
        total: r.total,
      })),
    [q, showAllFarmers, sortBy, minRating, location],
  );

  const { data: products, loading: productsLoading, error, reload } = useFetch(fetchProducts, [
    q,
    showAllProducts,
  ]);
  const { data: productCount } = useFetch(fetchProductCount, [q]);
  const { data: farmerData, loading: farmersLoading } = useFetch(fetchFarmers, [
    q,
    showAllFarmers,
    sortBy,
    minRating,
    location,
  ]);

  const productList = products ?? [];
  const farmerList = farmerData?.farmers ?? [];
  const pCount = productCount ?? 0;
  const fCount = farmerData?.total ?? 0;
  const totalResults = pCount + fCount;
  const isLoading = productsLoading || farmersLoading;

  const hasMoreProducts = productList.length < pCount;
  const hasMoreFarmers = farmerList.length < fCount;

  if (!q) {
    return (
      <div className="animate-fade-up py-20">
        <EmptyState
          title="Ketik kata kunci"
          message="Masukkan kata kunci di kolom pencarian untuk menemukan komoditas atau petani."
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 transition hover:text-primary uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            Kembali
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Hasil Pencarian</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            {isLoading ? (
              "Mencari data yang sesuai..."
            ) : totalResults > 0 ? (
              <>
                Ditemukan <span className="font-bold text-primary">{totalResults}</span> total hasil untuk &quot;{q}&quot;
              </>
            ) : (
              <>Tidak ada hasil yang ditemukan untuk &quot;{q}&quot;</>
            )}
          </p>
        </div>
      </div>

      {isLoading ? (
        <SearchSkeleton />
      ) : error ? (
        <ErrorState
          message="Hasil pencarian gagal dimuat. Silakan coba lagi."
          onRetry={reload}
        />
      ) : totalResults === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Package size={28} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Tidak Ditemukan</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Tidak ada komoditas atau petani yang cocok dengan &quot;{q}&quot;. Coba gunakan kata kunci lain.
          </p>
          <div className="mt-6 inline-flex flex-wrap justify-center gap-2">
            {["nama petani", "nama komoditas", "nama produk", "lokasi"].map((hint) => (
              <span key={hint} className="rounded-full bg-gray-50 border border-gray-200/60 px-3 py-1 text-xs font-semibold text-gray-600">
                {hint}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* PRODUCTS SECTION */}
          {productList.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Package size={18} />
                  </div>
                  <h2 className="text-lg font-extrabold text-gray-900">Produk Komoditas</h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {pCount}
                  </span>
                </div>
                {hasMoreProducts && !showAllProducts && (
                  <button
                    type="button"
                    onClick={() => setShowAllProducts(true)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Lihat Semua ({pCount})
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {productList.map((item, i) => (
                  <div
                    key={item.id}
                    className="animate-fade-up"
                    style={{
                      animationDelay: `${Math.min(i * 50, 400)}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <ProductCard data={item} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FARMERS SECTION */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Store size={18} />
                </div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  Mitra Petani Terkait
                </h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {fCount}
                </span>
              </div>
              {hasMoreFarmers && !showAllFarmers && (
                <button
                  type="button"
                  onClick={() => setShowAllFarmers(true)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Lihat Semua ({fCount})
                </button>
              )}
            </div>

            {/* Filter Bar specifically dedicated for Farmers section */}
            <div className="py-1">
              <FarmerFilterBar
                sortBy={sortBy}
                onSortChange={setSortBy}
                minRating={minRating}
                onRatingChange={setMinRating}
                location={location}
                onLocationChange={setLocation}
              />
            </div>

            {farmerList.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                {farmerList.map((farmer, i) => (
                  <div
                    key={farmer.id}
                    className="animate-fade-up"
                    style={{
                      animationDelay: `${Math.min(i * 60, 400)}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <FarmerStoreCard farmer={farmer} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                <p className="text-sm font-medium text-gray-500">
                  Tidak ada petani yang cocok dengan filter penelusuran atau lokasi saat ini.
                </p>
              </div>
            )}
          </section>

          {/* PARTIAL EMPTY NOTICES */}
          {productList.length === 0 && farmerList.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 text-center">
              <p className="text-sm text-gray-600 font-medium">
                Tidak ditemukan komoditas langsung untuk &quot;{q}&quot;, tetapi kami menemukan{" "}
                <span className="font-bold text-primary">{fCount} petani</span> yang relevan.
              </p>
            </div>
          )}
          {farmerList.length === 0 && productList.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 text-center">
              <p className="text-sm text-gray-600 font-medium">
                Tidak ditemukan profil petani aktif untuk &quot;{q}&quot;, tetapi kami menemukan{" "}
                <span className="font-bold text-primary">{pCount} produk</span> komoditas siap pesan.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UserSearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <UserSearchInner />
    </Suspense>
  );
}

function UserSearchInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  return <SearchContent key={q} />;
}