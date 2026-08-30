"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Package } from "lucide-react";
import { formatRupiah, formatWeight } from "@/lib/format";
import { formatImage } from "@/components/shared/States";
import WishlistButton from "@/components/shared/WishlistButton";
import { LOW_STOCK_THRESHOLD } from "@/constants/commodities";

export interface ProductCardData {
  id: number;
  name: string;
  price: string;
  minPrice: string | null;
  maxPrice: string | null;
  stock: string;
  unit: string;
  location: string;
  image: string | null;
  images?: string[] | null;
  rating: string;
  categoryName: string;
}

interface ProductCardProps {
  data?: ProductCardData | null;
  userId?: number | null;
}

const categoryGradient: Record<string, string> = {
  "Padi & Serealia": "from-amber-400 to-yellow-600",
  Sayuran: "from-green-400 to-emerald-600",
  "Buah-buahan": "from-rose-400 to-pink-600",
  Palawija: "from-orange-400 to-amber-600",
  Hortikultura: "from-lime-400 to-green-600",
};

export default function ProductCard({ data, userId }: ProductCardProps) {
  if (!data) return null;
  const img = formatImage(data.image) ?? formatImage(data.images?.[0] ?? null);
  const gradient =
    categoryGradient[data.categoryName ?? ""] || "from-primary to-primary-dark";
  const initial = data.name?.charAt(0)?.toUpperCase() || "P";

  const stock = Number(data.stock);
  const outOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  const hasRange =
    data.minPrice && data.maxPrice && Number(data.minPrice) !== Number(data.maxPrice);
  const rating = Number(data.rating);

  return (
    <Link
      href={`/user/product/${data.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg sm:rounded-card border border-gray-200/80 bg-white shadow-soft transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* Image */}
      <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={data.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
            <span className="text-3xl sm:text-6xl font-black text-white/90">{initial}</span>
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 scale-[0.8] sm:scale-100 origin-top-right">
          <WishlistButton commodityId={data.id} userId={userId ?? null} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2 sm:p-4">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          <p className="min-w-0 truncate text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {data.categoryName}
          </p>
          {rating > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium text-amber-500">
              <Star size={10} className="sm:hidden" fill="currentColor" />
              <Star size={12} className="hidden sm:block" fill="currentColor" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <h3 className="mt-0.5 sm:mt-1 min-h-[2.4em] sm:min-h-[2.75em] text-[12px] sm:text-[15px] font-semibold leading-snug text-gray-900 line-clamp-2">
          {data.name}
        </h3>

        <div className="mt-1 sm:mt-2 flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
          <span className="text-sm sm:text-lg font-bold text-primary">
            {hasRange
              ? `${formatRupiah(data.minPrice)} – ${formatRupiah(data.maxPrice)}`
              : formatRupiah(data.price)}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-400">/ {data.unit}</span>
        </div>

        <div className="mt-auto" />

        {/* Stock & location: stacked on mobile, inline on desktop */}
        <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-t border-gray-100 pt-2 sm:pt-2.5">
          <span
            className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium ${
              outOfStock ? "text-danger" : lowStock ? "text-amber-600" : "text-gray-500"
            }`}
          >
            <Package size={11} className="shrink-0 sm:hidden" />
            <Package size={13} className="shrink-0 hidden sm:block" />
            <span className="truncate">
              {outOfStock ? "Stok habis" : `Stok ${formatWeight(data.stock, data.unit)}`}
            </span>
            {lowStock && !outOfStock && (
              <span className="text-amber-500 shrink-0">&middot; Menipis</span>
            )}
          </span>

          <span className="flex min-w-0 items-center gap-1">
            <MapPin size={10} className="shrink-0 text-gray-400 sm:hidden" />
            <MapPin size={12} className="shrink-0 text-gray-400 hidden sm:block" />
            <span className="truncate text-[10px] sm:text-xs text-gray-500">{data.location}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}