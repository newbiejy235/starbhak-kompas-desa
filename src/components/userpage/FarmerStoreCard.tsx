"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ChevronRight } from "lucide-react";

interface FarmerStoreCardProps {
  farmer: {
    id: number;
    fullName: string;
    fotoProfile: string | null;
    village: string | null;
    commodityCount: number;
    avgPrice: string | number | null;
    avgRating: string | number | null;
    reviewCount: number;
  };
}

export default React.memo(function FarmerStoreCard({ farmer }: FarmerStoreCardProps) {
  const avgRating = farmer.avgRating ? Number(farmer.avgRating) : null;
  const hasRating = avgRating !== null && avgRating > 0;

  return (
    <Link
      href={`/user/farmer/${farmer.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-lift animate-fade-up"
    >
      {/* Avatar */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-primary/5">
        {farmer.fotoProfile ? (
          <Image
            src={farmer.fotoProfile}
            alt={farmer.fullName}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
            {farmer.fullName?.charAt(0)?.toUpperCase() || "P"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-bold text-gray-900 group-hover:text-primary transition-colors">
          {farmer.fullName}
        </h3>

        <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
          {farmer.village && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin size={12} className="shrink-0 text-primary" />
              <span className="truncate">{farmer.village}</span>
            </span>
          )}
          <span className="shrink-0">{farmer.commodityCount} produk</span>
        </div>
      </div>

      {/* Rating + action */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        {hasRating ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
            <Star size={12} fill="currentColor" />
            {avgRating.toFixed(1)}
            <span className="font-normal text-amber-500/70">
              ({farmer.reviewCount})
            </span>
          </span>
        ) : (
          <span className="text-[11px] text-gray-400">Belum ada rating</span>
        )}

        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary">
          Lihat Toko
          <ChevronRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
});