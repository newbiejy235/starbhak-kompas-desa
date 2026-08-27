"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  ShoppingCart,
  ArrowRight,
  Package,
} from "lucide-react";
import { getPublicCommodities } from "@/actions/commodity";
import { useFetch } from "@/lib/hooks";
import { formatRupiah, formatNumber } from "@/lib/format";
import { Skeleton } from "@/components/ui/Skeleton";

const categories = [
  "Semua",
  "Sayuran",
  "Buah",
  "Pangan",
  "Perkebunan",
];

function CommoditiesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[#E2E8E5] bg-white"
        >
          <Skeleton className="h-48 rounded-none" />

          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CariKomoditasPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");

  const fetchCommodities = async () => {
    return getPublicCommodities();
  };

  const {
    data,
    loading,
  } = useFetch(fetchCommodities, []);

  const commodities = data ?? [];

  const filteredCommodities = useMemo(() => {
    const q = query.trim().toLowerCase();

    return commodities.filter((item) => {
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.farmerName ?? "").toLowerCase().includes(q) ||
        (item.categoryName ?? "").toLowerCase().includes(q);

      const matchCategory =
        category === "Semua" ||
        item.categoryName === category;

      return matchQuery && matchCategory;
    });
  }, [commodities, query, category]);

  return (
    <main className="min-h-screen bg-[#FAFAF9] text-[#17231F]">

      {/* HERO */}
      <section className="border-b border-[#E7EBE9] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">

          <div className="max-w-2xl">
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#025246]">
              Pasar Kompas Desa
            </span>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px]">
              Temukan Komoditas
              <br />
              <span className="text-[#025246]">
                dari Petani Lokal
              </span>
            </h1>

            <p className="mt-4 max-w-xl font-body text-[15px] leading-7 text-[#6B807C]">
              Jelajahi komoditas pertanian yang tersedia dari
              petani dan pelaku usaha di berbagai daerah.
            </p>
          </div>

          {/* SEARCH */}
          <div className="mt-9 max-w-3xl">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9C98]"
              />

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari komoditas, kategori, atau petani..."
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
            </div>
          </div>
        </div>
      </section>

      {/* MARKET */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:py-16">

        {/* CATEGORY */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`
                  shrink-0 rounded-full px-4 py-2
                  font-body text-xs font-semibold
                  transition
                  ${category === item
                    ? "bg-[#025246] text-white"
                    : "border border-[#E0E7E4] bg-white text-[#667772] hover:border-[#025246]/30 hover:text-[#025246]"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>

          {!loading && (
            <span className="hidden shrink-0 font-body text-xs text-[#8A9C98] sm:block">
              {filteredCommodities.length} komoditas
            </span>
          )}
        </div>

        {/* LOADING */}
        {loading ? (
          <CommoditiesSkeleton />
        ) : filteredCommodities.length > 0 ? (

          /* COMMODITY CARDS */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCommodities.map((item) => (
              <article
                key={item.id}
                className="
                  group overflow-hidden rounded-2xl
                  border border-[#E2E8E5]
                  bg-white
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-[#025246]/30
                  hover:shadow-[0_16px_40px_rgba(2,82,70,0.08)]
                "
              >

                {/* IMAGE */}
                <div className="relative h-48 overflow-hidden bg-[#EEF3F0]">

                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 25vw, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[#8A9C98]">
                      Tidak ada gambar
                    </div>
                  )}

                  {item.categoryName && (
                    <span className="
                      absolute left-3 top-3
                      rounded-full
                      bg-white/95
                      px-2.5 py-1
                      font-body text-[10px]
                      font-semibold
                      text-[#025246]
                      shadow-sm
                    ">
                      {item.categoryName}
                    </span>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">
                    <h2 className="truncate font-body text-[15px] font-bold text-[#1F302B]">
                      {item.name}
                    </h2>

                    <span className="
                      shrink-0 rounded-full
                      bg-[#EAF3EF]
                      px-2 py-1
                      font-body text-[9px]
                      font-semibold text-[#025246]
                    ">
                      Tersedia
                    </span>
                  </div>

                  <p className="mt-2 font-body text-lg font-bold text-[#025246]">
                    {formatRupiah(Number(item.price))}

                    <span className="ml-1 text-xs font-medium text-[#81908C]">
                      / {item.unit}
                    </span>
                  </p>

                  <div className="
                    mt-4 space-y-2
                    border-t border-[#EEF1F0]
                    pt-4
                  ">

                    <div className="flex items-center gap-2 text-xs text-[#71817D]">
                      <MapPin size={13} className="shrink-0" />

                      <span className="truncate">
                        {item.location || "Lokasi tidak tersedia"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#71817D]">
                      <Package size={13} className="shrink-0" />

                      <span>
                        Stok {formatNumber(Number(item.stock))} {item.unit}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 truncate font-body text-xs text-[#8A9C98]">
                    Dijual oleh {item.farmerName || "Petani"}
                  </p>

                  {/* ACTION */}
                  <div className="mt-5 flex gap-2">

                    <Link
                      href={`/kompas-desa/cari-komoditas/${item.id}`}
                      className="
                        flex-1 rounded-lg
                        border border-[#DDE5E1]
                        py-2.5
                        text-center
                        font-body text-xs
                        font-semibold text-[#344640]
                        transition
                        hover:border-[#025246]
                        hover:text-[#025246]
                      "
                    >
                      Lihat Detail
                    </Link>

                    <Link
                      href="/auth/login"
                      className="
                        inline-flex
                        items-center justify-center
                        rounded-lg
                        bg-[#025246]
                        px-3.5
                        text-white
                        transition
                        hover:bg-[#013E35]
                      "
                      title="Masuk untuk membeli"
                    >
                      <ShoppingCart size={15} />
                    </Link>

                  </div>
                </div>
              </article>
            ))}
          </div>

        ) : (

          /* EMPTY */
          <div className="
            rounded-2xl
            border border-dashed border-[#D8E1DD]
            bg-white
            px-6 py-16
            text-center
          ">
            <Search
              size={30}
              className="mx-auto text-[#A5B3AF]"
            />

            <h3 className="mt-4 font-body text-base font-bold text-[#263832]">
              Komoditas tidak ditemukan
            </h3>

            <p className="mt-1 font-body text-sm text-[#82918D]">
              Coba gunakan kata kunci atau kategori lainnya.
            </p>
          </div>
        )}

        <div className="
          mt-12 flex flex-col
          items-center justify-between
          gap-5 rounded-2xl
          border border-[#DCE8E3]
          bg-[#F3F8F5]
          px-6 py-6
          sm:flex-row sm:px-8
        ">

          <div>
            <h3 className="font-body text-sm font-bold text-[#1F302B]">
              Ingin membeli komoditas?
            </h3>

            <p className="mt-1 font-body text-xs leading-5 text-[#71817D]">
              Daftar atau masuk untuk melakukan pemesanan
              langsung kepada petani.
            </p>
          </div>

          <Link
            href="/auth/register"
            className="
              inline-flex shrink-0
              items-center gap-2
              rounded-lg
              bg-[#025246]
              px-5 py-2.5
              font-body text-xs
              font-semibold text-white
              transition
              hover:bg-[#013E35]
            "
          >
            Daftar Sekarang
            <ArrowRight size={14} />
          </Link>
        </div>

      </section>
    </main>
  );
}