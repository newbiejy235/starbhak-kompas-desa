"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/userpage/ProductCard";
import { LoadingState, EmptyState } from "@/components/shared/States";
import { getPublicCommodities, getCategories } from "@/actions/commodity";
import { useFetch } from "@/lib/hooks";
import Link from "next/link";
import type {
  PublicCommodity,
  CategoryRow,
} from "@/lib/types/market";

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
      <div className="bg-gradient-to-r from-[#025246] to-[#047857] rounded-3xl p-6 sm:p-10 mb-8 text-white relative overflow-hidden flex justify-between items-center shadow-md">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
            Panen Segar Langsung dari Petani Lokal
          </h1>
          <p className="text-white/80 text-sm sm:text-base mb-6">
            Dapatkan kualitas terbaik dengan harga yang lebih transparan. Dukung petani Indonesia!
          </p>
          <button
            onClick={() => router.push("/user/home")}
            className="bg-white text-[#025246] px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#EBF3ED] transition-colors shadow-sm"
          >
            Jelajahi Katalog
          </button>
        </div>
        <div className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 opacity-20">
          <Image
            src="/images/user/HeaderImageUser.svg"
            alt="foto sayuran"
            width={160}
            height={160}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#111111] mb-4">Kategori</h2>
        <Link href="/user/tes-upload">tes</Link>
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => router.push("/user/home")}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
              !catParam
                ? "bg-[#025246] text-white border-[#025246]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#025246] hover:text-[#025246]"
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/user/home?category=${c.id}`)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                catParam === String(c.id)
                  ? "bg-[#025246] text-white border-[#025246]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#025246] hover:text-[#025246]"
              }`}
            >
              {c.icon && <span className="mr-1">{c.icon}</span>}
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#111111]">Katalog Komoditas</h2>
          <p className="text-sm text-gray-500 mt-1">
            {search ? `Hasil pencarian untuk "${search}"` : "Jelajahi hasil panen terbaik dari berbagai daerah"}
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((item) => (
            <ProductCard key={item.id} data={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum Ada Produk"
          message="Saat ini belum ada komoditas hasil panen yang tersedia."
        />
      )}
    </>
  );
}

export default function UserHome() {
  return (
    <Suspense fallback={<LoadingState />}>
      <HomeContent />
    </Suspense>
  );
}
