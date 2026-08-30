"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Package, Store } from "lucide-react";
import type { FarmerSearchResult } from "@/lib/types/market";

interface FarmerStoreCardProps {
  farmer: FarmerSearchResult;
}

export default function FarmerStoreCard({ farmer }: FarmerStoreCardProps) {
  const avgRating = farmer.avgRating ? Number(farmer.avgRating) : null;

  return (
    <Link
      href={`/user/farmer/${farmer.id}`}
      className="group block overflow-hidden rounded-card border border-gray-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lift"
    >
      {/* Banner Background */}
      <div className="relative h-24 bg-gradient-to-r from-primary to-primary-dark sm:h-28">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="px-5 pb-5">
        {/* Avatar Section */}
        <div className="-mt-8 mb-3 flex items-end justify-between">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-[3px] border-white bg-primary/5 shadow-md">
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
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
                {farmer.fullName?.charAt(0)?.toUpperCase() || "P"}
              </div>
            )}
          </div>
          <Store size={16} className="text-primary/40 mb-1" />
        </div>

        {/* Store Name & Location */}
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-[15px] font-bold text-gray-900 group-hover:text-primary transition-colors">
            {farmer.fullName}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} className="shrink-0 text-primary" />
            <span className="truncate">
              {farmer.village || "Lokasi tidak tersedia"}
            </span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Package size={13} className="text-primary" />
            <span className="font-semibold text-gray-800">
              {farmer.commodityCount}
            </span>{" "}
            Produk
          </div>
          
          {/* Kondisi Rating */}
          {avgRating !== null && avgRating > 0 ? (
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={13} fill="currentColor" />
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              {farmer.reviewCount > 0 && (
                <span className="text-gray-400">({farmer.reviewCount})</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400">
              <Star size={13} />
              <span>Belum ada rating</span>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/60">
            Toko Petani
          </span>
          <span className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-800 transition group-hover:border-primary group-hover:bg-primary group-hover:text-white">
            Lihat Toko
          </span>
        </div>
      </div>
    </Link>
  );
}