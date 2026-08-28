"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Package } from "lucide-react";
import type { SearchPublicFarmer } from "@/lib/types/market";
import { formatRupiah } from "@/lib/format";

type FarmerCardProps = {
  farmer: SearchPublicFarmer;
};

export default function FarmerCard({ farmer }: FarmerCardProps) {
  const avgRating = farmer.avgRating ? Number(farmer.avgRating) : null;
  const avgPrice = farmer.avgPrice ? Number(farmer.avgPrice) : null;

  return (
    <Link
      href={`/kompas-desa/petani/${farmer.id}`}
      className="group overflow-hidden rounded-2xl border border-[#E2E8E5] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#025246]/30 hover:shadow-[0_16px_40px_rgba(2,82,70,0.08)]"
    >
      <div className="relative h-28 bg-gradient-to-r from-[#025246] to-[#047857]">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-end gap-4 -mt-8">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-3 border-white bg-[#EEF3F0] shadow-md">
            {farmer.fotoProfile ? (
              <Image
                src={farmer.fotoProfile}
                alt={farmer.fullName}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#025246]">
                {farmer.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pb-1">
            <h3 className="line-clamp-1 text-[15px] font-bold text-[#1F302B] group-hover:text-[#025246] transition-colors">
              {farmer.fullName}
            </h3>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-[#71817D]">
              <MapPin size={12} className="shrink-0 text-[#025246]" />
              <span className="truncate">
                {farmer.village || "Lokasi tidak tersedia"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-[#71817D]">
          <div className="flex items-center gap-1">
            <Package size={13} className="text-[#025246]" />
            <span className="font-semibold text-[#344640]">
              {farmer.commodityCount}
            </span>{" "}
            Komoditas
          </div>
          {avgRating !== null && avgRating > 0 && (
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={13} fill="currentColor" />
              <span className="font-semibold">
                {avgRating.toFixed(1)}
              </span>
              {farmer.reviewCount > 0 && (
                <span className="text-[#8A9C98]">
                  ({farmer.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        {avgPrice !== null && avgPrice > 0 && (
          <div className="mt-2 text-xs text-[#81908C]">
            Rata-rata harga:{" "}
            <span className="font-semibold text-[#025246]">
              {formatRupiah(avgPrice)}
            </span>
          </div>
        )}

        <span className="mt-4 block w-full rounded-xl border border-[#DDE5E1] py-2 text-center text-xs font-semibold text-[#344640] transition group-hover:border-[#025246] group-hover:bg-[#025246] group-hover:text-white">
          Lihat Profil
        </span>
      </div>
    </Link>
  );
}
