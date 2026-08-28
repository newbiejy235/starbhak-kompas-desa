"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  MapPin,
  Star,
  Package,
  BadgeCheck,
  Leaf,
  Tractor,
  Map,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { getFarmerStorePage } from "@/actions/farmer";
import { useFetch } from "@/lib/hooks";
import { formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/shared/States";
import ProductCard from "@/components/userpage/ProductCard";
import type { FarmerStorePage } from "@/lib/types/market";

type Tab = "produk" | "tentang";

function StoreSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-24" />
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white">
        <Skeleton className="h-32 rounded-none" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
            <Skeleton className="-mt-12 h-24 w-24 rounded-full" />
            <div className="mt-3 flex-1 space-y-2 sm:mt-0">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-card border border-gray-200/80 bg-white"
          >
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BuyerFarmerStorePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("produk");

  const { data: store, loading } = useFetch(
    () =>
      getFarmerStorePage(Number(id)).then(
        (r) => r as unknown as FarmerStorePage | null,
      ),
    [id],
  );

  if (loading) {
    return (
      <div className="animate-fade-up">
        <StoreSkeleton />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="animate-fade-up py-16">
        <ErrorState
          title="Toko Tidak Ditemukan"
          message="Profil petani yang Anda cari tidak tersedia."
        />
      </div>
    );
  }

  const avgRating = store.avgRating ? Number(store.avgRating) : null;
  const reviewCount = store.reviewCount ?? 0;
  const commodities = store.commodities ?? [];

  return (
    <div className="animate-fade-up">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition hover:text-primary"
      >
        <ChevronLeft size={16} />
        Kembali
      </button>

      {/* STORE HEADER */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-soft">
        <div className="relative h-32 bg-gradient-to-r from-[#025246] to-[#047857] sm:h-40">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="px-5 pb-5 sm:px-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
            <div className="-mt-12 relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#EEF3F0] shadow-lg sm:h-28 sm:w-28">
              {store.fotoProfile ? (
                <Image
                  src={store.fotoProfile}
                  alt={store.fullName}
                  fill
                  sizes="112px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#025246]">
                  {store.fullName?.charAt(0)?.toUpperCase() || "P"}
                </div>
              )}
            </div>

            <div className="mt-3 flex-1 text-center sm:mt-0 sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {store.fullName}
                </h1>
                {store.isVerified && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[#EAF3EF] px-2 py-0.5 text-[10px] font-bold text-[#025246]">
                    <BadgeCheck size={12} />
                    Terverifikasi
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 sm:justify-start">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} className="text-[#025246]" />
                  {store.village || "Lokasi tidak tersedia"}
                </span>
                {avgRating !== null && avgRating > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="font-semibold">{avgRating.toFixed(1)}</span>
                    {reviewCount > 0 && (
                      <span className="text-gray-400">
                        ({reviewCount} ulasan)
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2 sm:mt-0">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-[#025246] hover:text-[#025246]"
              >
                <MessageCircle size={16} />
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Package size={16} className="text-[#025246]" />
            <span className="text-lg font-bold text-gray-900">
              {commodities.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Produk</p>
        </div>
        {avgRating !== null && avgRating > 0 && (
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Star size={16} className="text-amber-500" fill="currentColor" />
              <span className="text-lg font-bold text-gray-900">
                {avgRating.toFixed(1)}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Rating</p>
          </div>
        )}
        {reviewCount > 0 && (
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {reviewCount}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Ulasan</p>
          </div>
        )}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Calendar size={16} className="text-[#025246]" />
            <span className="text-sm font-bold text-gray-900">
              {formatDate(store.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Bergabung</p>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-6 flex gap-1 border-b border-gray-200">
        {(["produk", "tentang"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-3 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "text-[#025246]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "produk" ? "Produk" : "Tentang"}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#025246]" />
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6">
        {activeTab === "produk" && (
          <>
            {commodities.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {commodities.map((item, i) => (
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
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        minPrice: item.minPrice,
                        maxPrice: item.maxPrice,
                        stock: item.stock,
                        unit: item.unit,
                        location: item.location ?? "",
                        image: item.image,
                        rating: item.rating ?? "0",
                        categoryName: item.categoryName ?? "",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum Ada Produk"
                message="Petani ini belum memiliki produk yang tersedia."
              />
            )}
          </>
        )}

        {activeTab === "tentang" && (
          <div className="space-y-5">
            {store.bio && (
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5">
                <h3 className="mb-2 text-sm font-bold text-gray-900">
                  Tentang Toko
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {store.bio}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {store.farmingExperience && (
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3EF]">
                    <Leaf size={18} className="text-[#025246]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pengalaman</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {store.farmingExperience}
                    </p>
                  </div>
                </div>
              )}
              {store.farmArea && (
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3EF]">
                    <Map size={18} className="text-[#025246]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Luas Lahan</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {store.farmArea}
                    </p>
                  </div>
                </div>
              )}
              {store.farmingMethod && (
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3EF]">
                    <Tractor size={18} className="text-[#025246]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Metode Bertani</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {store.farmingMethod}
                    </p>
                  </div>
                </div>
              )}
              {store.address && (
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3EF]">
                    <MapPin size={18} className="text-[#025246]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Alamat</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {store.address}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {store.farmImages && store.farmImages.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-bold text-gray-900">
                  Foto Usaha
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {store.farmImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100"
                    >
                      <Image
                        src={img.secureUrl}
                        alt={img.caption || "Foto usaha"}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
