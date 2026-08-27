"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeroCarousel from "@/components/userpage/HeroCarousel";
import ProductCard from "@/components/userpage/ProductCard";
import { EmptyState } from "@/components/shared/States";
import { getPublicCommodities, getCategories } from "@/actions/commodity";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import type { PublicCommodity, CategoryRow } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-card border border-gray-200/80 overflow-hidden"
        >
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-28 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const catParam = searchParams.get("category");
  const user = getClientUser();

  const { data, loading } = useFetch(async () => {
    const [products, categories] = await Promise.all([
      getPublicCommodities({
        search: search || undefined,
        categoryId: catParam ? Number(catParam) : undefined,
      }),
      getCategories(),
    ]);
    return {
      products: products as PublicCommodity[],
      categories: categories as CategoryRow[],
    };
  }, [search, catParam]);

  const products = data?.products ?? [];
  const categories = data?.categories ?? [];

  return (
    <>
      {/* Carousel / Slider — 3 tipe slide: event, komoditas populer, diskon (PRD 2) */}
      <div className="mt-20">
        <HeroCarousel />

        {/* Filter kategori */}
        <section id="katalog" className="mb-8 scroll-mt-24">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kategori</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => router.push("/user/home")}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 whitespace-nowrap ${
                !catParam
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/user/home?category=${c.id}`)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  catParam === String(c.id)
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                }`}
              >
                {c.icon && <span className="mr-1">{c.icon}</span>}
                {c.name}
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Katalog Komoditas</h2>
          <p className="text-sm text-gray-500 mt-1">
            {search
              ? `Hasil pencarian untuk "${search}"`
              : "Jelajahi hasil panen terbaik dari berbagai daerah"}
          </p>
        </div>
      </div>

      {loading ? (
        <CatalogSkeleton />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((item, i) => (
            <div
              key={item.id}
              className="animate-fade-up"
              style={{
                animationDelay: `${Math.min(i * 60, 480)}ms`,
                animationFillMode: "backwards",
              }}
            >
              <ProductCard data={item} userId={user?.id} />
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
    </>
  );
}

export default function UserHome() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
