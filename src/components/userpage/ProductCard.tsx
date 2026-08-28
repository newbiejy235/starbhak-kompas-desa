"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Package } from "lucide-react";
import { formatRupiah, formatWeight } from "@/lib/format";
import { formatImage } from "@/components/shared/States";
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
}

const categoryGradient: Record<string, string> = {
  "Padi & Serealia": "from-amber-400 to-yellow-600",
  Sayuran: "from-green-400 to-emerald-600",
  "Buah-buahan": "from-rose-400 to-pink-600",
  Palawija: "from-orange-400 to-amber-600",
  Hortikultura: "from-lime-400 to-green-600",
};

export default function ProductCard({ data }: ProductCardProps) {
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
      className="group flex h-full flex-col overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-soft transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={data.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
            <span className="text-6xl font-black text-white/90">{initial}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {data.categoryName}
          </p>
          {rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-amber-500">
              <Star size={12} fill="currentColor" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <h3 className="mt-1 min-h-[2.75em] text-[15px] font-semibold leading-snug text-gray-900 line-clamp-2">
          {data.name}
        </h3>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-primary">
            {hasRange
              ? `${formatRupiah(data.minPrice)} – ${formatRupiah(data.maxPrice)}`
              : formatRupiah(data.price)}
          </span>
          <span className="text-xs text-gray-400">/ {data.unit}</span>
        </div>

        <div className="mt-auto" />

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              outOfStock ? "text-danger" : lowStock ? "text-amber-600" : "text-gray-500"
            }`}
          >
            <Package size={13} className="shrink-0" />
            {outOfStock ? "Stok habis" : `Stok ${formatWeight(data.stock, data.unit)}`}
            {lowStock && !outOfStock && (
              <span className="text-amber-500">&middot; Menipis</span>
            )}
          </span>

          <span className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <MapPin size={12} className="shrink-0 text-gray-400" />
            <span className="truncate text-xs text-gray-500">{data.location}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}