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

/* Fokus keyboard konsisten dengan halaman petani */
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#025246]";

function CatalogSkeleton() {
  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <Skeleton className="mb-7 h-44 rounded-card sm:h-40" />
      {/* Filter kategori */}
      <div className="mb-6">
        <Skeleton className="mb-3 h-4 w-20" />
        <div className="flex gap-2">
          {[72, 96, 88, 104, 84].map((w, i) => (
            <Skeleton key={i} className="h-9 rounded-lg" style={{ width: w }} />
          ))}
        </div>
      </div>
      {/* Judul katalog */}
      <div className="mb-5 space-y-2">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-3.5 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-card border border-gray-200/80 bg-white">
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-6 w-28" />
            </div>
          </div>
        ))}
      </div>
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

  const chipClass = (active: boolean) =>
    `inline-flex shrink-0 items-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${focusRing} ${active
      ? "bg-primary text-white"
      : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
    }`;

  return (
    <div className="animate-fade-up">
      {/* Hero banner — tenang, tanpa dekorasi berlebih */}
      <section className="relative mb-7 overflow-hidden rounded-card bg-gradient-to-r from-primary to-primary-dark p-6 text-white shadow-soft sm:p-8">
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
          <Image
            src="/images/user/HeaderImageUser.svg"
            alt=""
            width={160}
            height={160}
          />
        </div>
      </section>

      {/* Filter kategori */}
      <section id="katalog" className="mb-7 scroll-mt-24">
        <h2 className="mb-1 text-lg font-bold tracking-tight text-neutral-900">Kategori</h2>
        <p className="mb-3 text-xs text-gray-500">Saring komoditas sesuai kebutuhan Anda.</p>
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
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => router.push(`/user/home?category=${c.id}`)}
                aria-pressed={catParam === String(c.id)}
                className={chipClass(catParam === String(c.id))}
              >
                {c.icon && <span className="mr-1">{c.icon}</span>}
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Katalog */}
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

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-card border border-gray-200/80 bg-white">
                <Skeleton className="aspect-[4/3] rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-28 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </section>
    </div>
  );
}

export default function UserHome() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
