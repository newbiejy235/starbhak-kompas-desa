"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/userpage/ProductCard";
import { EmptyState } from "@/components/shared/States";
import { getPublicCommodities, getCategories } from "@/actions/commodity";
import { useFetch } from "@/lib/hooks";
import type {
  PublicCommodity,
  CategoryRow,
} from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-card border border-gray-200/80 overflow-hidden">
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

  const { data, loading } = useFetch(
    async () => {
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
    },
    [search, catParam],
  );

  const products = data?.products ?? [];
  const categories = data?.categories ?? [];

  return (
    <>
      {/* Hero banner dengan entrance animation (PRD 8.3) */}
      <section className="bg-gradient-to-r from-primary to-primary-dark rounded-card p-6 sm:p-10 mb-8 text-white relative overflow-hidden shadow-soft animate-fade-up">
        <div
          aria-hidden
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-secondary/20 blur-3xl animate-float"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 right-40 w-48 h-48 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
            Panen Segar Langsung dari Petani Lokal
          </h1>
          <p className="text-white/80 text-sm sm:text-base mb-6">
            Dapatkan kualitas terbaik dengan harga yang lebih transparan. Dukung petani Indonesia!
          </p>
          <Link
            href="#katalog"
            className="inline-block bg-white text-primary px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-50 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm"
          >
            Jelajahi Katalog
          </Link>
        </div>
        <div className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 opacity-20">
          <Image
            src="/images/user/HeaderImageUser.svg"
            alt=""
            width={160}
            height={160}
          />
        </div>
      </section>

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
              style={{ animationDelay: `${Math.min(i * 60, 480)}ms`, animationFillMode: "backwards" }}
            >
              <ProductCard data={item} />
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
