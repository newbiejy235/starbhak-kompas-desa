"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  MapPin,
  Leaf,
  Tractor,
  Map,
  Package,
  Star,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { getPublicFarmerById } from "@/actions/farmer";
import { getFarmerCommodities } from "@/actions/commodity";
import { useFetch } from "@/lib/hooks";
import { formatRupiah, formatNumber, formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/shared/States";
import type { PublicFarmerProfile } from "@/lib/types/market";
import type { FarmerCommodity } from "@/lib/types/market";

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function PublicFarmerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: farmer, loading: farmerLoading } = useFetch(
    () => getPublicFarmerById(Number(id)).then((r) => r as unknown as PublicFarmerProfile | null),
    [id],
  );

  const { data: commodities, loading: commoditiesLoading } = useFetch(
    () =>
      farmer
        ? getFarmerCommodities(farmer.id).then((r) => r as FarmerCommodity[])
        : Promise.resolve([]),
    [farmer?.id],
  );

  if (farmerLoading) return <ProfileSkeleton />;

  if (!farmer) {
    return (
      <main className="min-h-screen bg-[#FAFAF9]">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6">
          <ErrorState
            title="Petani Tidak Ditemukan"
            message="Profil petani yang Anda cari tidak tersedia."
          />
        </div>
      </main>
    );
  }

  const commodityList = commodities ?? [];
  const avgRating = farmer.avgRating ? Number(farmer.avgRating) : null;
  const reviewCount = farmer.reviewCount ?? 0;

  return (
    <main className="min-h-screen bg-[#FAFAF9] text-[#17231F]">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 lg:py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm text-[#8A9C98] transition hover:text-[#025246]"
        >
          <ChevronLeft size={16} />
          Kembali
        </button>

        {/* HEADER */}
        <div className="overflow-hidden rounded-2xl border border-[#E2E8E5] bg-white">
          <div className="relative h-32 bg-gradient-to-r from-[#025246] to-[#047857]">
            <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
          </div>

          <div className="px-6 pb-6 sm:px-8">
            <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
              <div className="-mt-12 relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-[#EEF3F0] shadow-lg">
                {farmer.fotoProfile ? (
                  <Image
                    src={farmer.fotoProfile}
                    alt={farmer.fullName}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#025246]">
                    {farmer.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="mt-3 flex-1 text-center sm:mt-0 sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold text-[#1F302B]">
                    {farmer.fullName}
                  </h1>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm text-[#71817D] sm:justify-start">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} className="text-[#025246]" />
                    {farmer.village || "Lokasi tidak tersedia"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Package size={14} className="text-[#025246]" />
                    {commodityList.length} Komoditas
                  </span>
                  {avgRating !== null && avgRating > 0 && (
                    <span className="inline-flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="font-semibold">{avgRating.toFixed(1)}</span>
                      {reviewCount > 0 && (
                        <span className="text-[#8A9C98]">({reviewCount} ulasan)</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#025246] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#013E35] active:scale-[0.97] sm:mt-0"
              >
                <MessageCircle size={16} />
                Hubungi Petani
              </button>
            </div>

            {farmer.bio && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#71817D]">
                {farmer.bio}
              </p>
            )}
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#E2E8E5] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3EF]">
                <Calendar size={18} className="text-[#025246]" />
              </div>
              <div>
                <p className="text-xs text-[#8A9C98]">Bergabung</p>
                <p className="text-sm font-semibold text-[#1F302B]">
                  {formatDate(farmer.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {farmer.farmingExperience && (
            <div className="rounded-2xl border border-[#E2E8E5] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3EF]">
                  <Leaf size={18} className="text-[#025246]" />
                </div>
                <div>
                  <p className="text-xs text-[#8A9C98]">Pengalaman</p>
                  <p className="text-sm font-semibold text-[#1F302B]">
                    {farmer.farmingExperience}
                  </p>
                </div>
              </div>
            </div>
          )}

          {farmer.farmArea && (
            <div className="rounded-2xl border border-[#E2E8E5] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3EF]">
                  <Map size={18} className="text-[#025246]" />
                </div>
                <div>
                  <p className="text-xs text-[#8A9C98]">Luas Lahan</p>
                  <p className="text-sm font-semibold text-[#1F302B]">
                    {farmer.farmArea}
                  </p>
                </div>
              </div>
            </div>
          )}

          {farmer.farmingMethod && (
            <div className="rounded-2xl border border-[#E2E8E5] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3EF]">
                  <Tractor size={18} className="text-[#025246]" />
                </div>
                <div>
                  <p className="text-xs text-[#8A9C98]">Metode Bertani</p>
                  <p className="text-sm font-semibold text-[#1F302B]">
                    {farmer.farmingMethod}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FARM IMAGES */}
        {farmer.farmImages && farmer.farmImages.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-base font-bold text-[#1F302B]">
              Foto Usaha
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {farmer.farmImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#EEF3F0]"
                >
                  <Image
                    src={img.secureUrl}
                    alt={img.caption || "Foto usaha"}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMODITIES */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-[#1F302B]">
            Komoditas dari {farmer.fullName}
          </h2>

          {commoditiesLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-[#E2E8E5] bg-white"
                >
                  <Skeleton className="h-40 rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : commodityList.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {commodityList.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-[#E2E8E5] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#025246]/30 hover:shadow-[0_16px_40px_rgba(2,82,70,0.08)]"
                >
                  <div className="relative h-40 overflow-hidden bg-[#EEF3F0]">
                    {(item.image || item.images?.length) ? (
                      <Image
                        src={item.image || item.images![0]}
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
                    {item.status === "sold_out" && (
                      <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-semibold text-white">
                        Habis
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-1 text-[15px] font-bold text-[#1F302B]">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-lg font-bold text-[#025246]">
                      {formatRupiah(Number(item.price))}
                      <span className="ml-1 text-xs font-medium text-[#81908C]">
                        / {item.unit}
                      </span>
                    </p>

                    <div className="mt-2 space-y-1 text-xs text-[#71817D]">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">
                          {item.location || "Lokasi tidak tersedia"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Package size={12} className="shrink-0" />
                        <span>
                          Stok {formatNumber(Number(item.stock))} {item.unit}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/kompas-desa/cari-komoditas/${item.id}`}
                      className="mt-3 block w-full rounded-lg bg-[#025246] py-2 text-center text-xs font-semibold text-white transition hover:bg-[#013E35]"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum Ada Komoditas"
              message="Petani ini belum memiliki komoditas yang tersedia."
            />
          )}
        </div>
      </div>
    </main>
  );
}
