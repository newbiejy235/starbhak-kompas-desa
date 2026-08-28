"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Package, Store } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { FarmerSearchResult } from "@/lib/types/market";

interface FarmerStoreCardProps {
  farmer: FarmerSearchResult;
}

export default function FarmerStoreCard({ farmer }: FarmerStoreCardProps) {
  const avgRating = farmer.avgRating ? Number(farmer.avgRating) : null;
  const avgPrice = farmer.avgPrice ? Number(farmer.avgPrice) : null;

  return (
    <Link
      href={`/user/farmer/${farmer.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#025246]/20 hover:shadow-[0_16px_48px_rgba(2,82,70,0.1)]"
    >
      <div className="relative h-24 bg-gradient-to-r from-[#025246] to-[#047857] sm:h-28">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-end gap-4 -mt-8">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-[3px] border-white bg-[#EEF3F0] shadow-md">
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
                {farmer.fullName?.charAt(0)?.toUpperCase() || "P"}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-2">
              <h3 className="line-clamp-1 text-[15px] font-bold text-[#1F302B] group-hover:text-[#025246] transition-colors">
                {farmer.fullName}
              </h3>
              <Store size={14} className="shrink-0 text-[#025246] opacity-60" />
            </div>
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
            Produk
          </div>
          {avgRating !== null && avgRating > 0 && (
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={13} fill="currentColor" />
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              {farmer.reviewCount > 0 && (
                <span className="text-[#8A9C98]">({farmer.reviewCount})</span>
              )}
            </div>
          )}
          {avgPrice !== null && avgPrice > 0 && (
            <span className="text-[#81908C]">
              Rata-rata{" "}
              <span className="font-semibold text-[#025246]">
                {formatRupiah(avgPrice)}
              </span>
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#025246]/60">
            Toko Petani
          </span>
          <span className="rounded-xl border border-[#DDE5E1] px-4 py-2 text-xs font-semibold text-[#344640] transition group-hover:border-[#025246] group-hover:bg-[#025246] group-hover:text-white">
            Lihat Toko
          </span>
        </div>
      </div>
    </Link>
  );
}
