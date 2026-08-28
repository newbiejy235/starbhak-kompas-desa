"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Package,
  Store,
  ArrowLeft,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import ProductCard from "@/components/userpage/ProductCard";
import FarmerStoreCard from "@/components/userpage/FarmerStoreCard";
import { EmptyState } from "@/components/shared/States";
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
  { label: "Semua", value: undefined },
  { label: "4.5+", value: 4.5 },
  { label: "4.0+", value: 4 },
  { label: "3.0+", value: 3 },
];

function SearchSkeleton() {
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white"
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
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setSortOpen(!sortOpen)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-600 transition hover:border-primary hover:text-primary"
        >
          <SlidersHorizontal size={15} />
          {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
          <ChevronDown size={14} />
        </button>
        {sortOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setSortOpen(false)}
            />
            <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-gray-200/80 bg-white py-1 shadow-lift animate-fade-in">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSortChange(opt.value);
                    setSortOpen(false);
                  }}
                  className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition ${
                    sortBy === opt.value
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

      <div className="flex gap-1">
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => onRatingChange(opt.value)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
              minRating === opt.value
                ? "bg-primary text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Lokasi..."
        defaultValue={location}
        onChange={(e) => handleLocChange(e.target.value)}
        className="w-36 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/10 sm:w-44"
      />
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

  const { data: products, loading: productsLoading } = useFetch(fetchProducts, [
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
    <div className="animate-fade-up">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Hasil Pencarian</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isLoading ? (
            "Mencari..."
          ) : totalResults > 0 ? (
            <>
              Ditemukan{" "}
              <span className="font-semibold text-primary">{totalResults}</span>{" "}
              hasil untuk &quot;{q}&quot;
            </>
          ) : (
            <>Tidak ada hasil untuk &quot;{q}&quot;</>
          )}
        </p>
      </div>

      {farmerList.length > 0 && (
        <div className="mb-6">
          <FarmerFilterBar
            sortBy={sortBy}
            onSortChange={setSortBy}
            minRating={minRating}
            onRatingChange={setMinRating}
            location={location}
            onLocationChange={setLocation}
          />
        </div>
      )}

      {isLoading ? (
        <SearchSkeleton />
      ) : totalResults === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Package size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Tidak Ditemukan</h3>
          <p className="mt-2 text-sm text-gray-500">
            Tidak ada komoditas atau petani yang cocok dengan &quot;{q}&quot;.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            <p className="mb-1 font-semibold uppercase tracking-wider">Coba gunakan:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["nama petani", "nama komoditas", "nama produk", "lokasi"].map(
                (hint) => (
                  <span
                    key={hint}
                    className="rounded-full bg-gray-100 px-3 py-1"
                  >
                    {hint}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* PRODUCTS SECTION */}
          {productList.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <Package size={16} className="text-primary" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Produk</h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                    {pCount}
                  </span>
                </div>
                {hasMoreProducts && !showAllProducts && (
                  <button
                    type="button"
                    onClick={() => setShowAllProducts(true)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Lihat Semua
                  </button>
                )}
              </div>
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
                    <ProductCard data={item} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FARMERS SECTION */}
          {farmerList.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <Store size={16} className="text-primary" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">
                    Petani yang Menjual &quot;{q}&quot;
                  </h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                    {fCount}
                  </span>
                </div>
                {hasMoreFarmers && !showAllFarmers && (
                  <button
                    type="button"
                    onClick={() => setShowAllFarmers(true)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Lihat Semua
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {farmerList.map((farmer, i) => (
                  <div
                    key={farmer.id}
                    className="animate-fade-up"
                    style={{
                      animationDelay: `${Math.min(i * 80, 480)}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <FarmerStoreCard farmer={farmer} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PARTIAL EMPTY STATES */}
          {productList.length === 0 && farmerList.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 text-center">
              <p className="text-sm text-gray-500">
                Tidak ditemukan komoditas untuk &quot;{q}&quot;, tetapi kami
                menemukan{" "}
                <span className="font-semibold text-primary">
                  {fCount} petani
                </span>{" "}
                yang relevan.
              </p>
            </div>
          )}
          {farmerList.length === 0 && productList.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 text-center">
              <p className="text-sm text-gray-500">
                Tidak ditemukan petani untuk &quot;{q}&quot;, tetapi kami
                menemukan{" "}
                <span className="font-semibold text-primary">
                  {pCount} produk
                </span>{" "}
                yang relevan.
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
