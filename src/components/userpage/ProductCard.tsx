"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Eye, Star } from "lucide-react";
import { formatRupiah, formatNumber } from "@/lib/format";
import { formatImage } from "@/components/shared/States";

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
  const img = formatImage(data.image);
  const gradient =
    categoryGradient[data.categoryName ?? ""] || "from-[#025246] to-[#047857]";
  const initial = data.name?.charAt(0)?.toUpperCase() || "P";

  const hasRange = data.minPrice && data.maxPrice && Number(data.minPrice) !== Number(data.maxPrice);

  return (
    <Link
      href={`/user/product/${data.id}`}
      className="bg-white rounded-card border border-gray-200/80 overflow-hidden shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 ease-smooth group flex flex-col h-full"
    >
      <div className="w-full aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={data.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-6xl font-black text-white/90">{initial}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 mb-2 flex justify-between items-center h-4">
          <span className="flex items-center gap-1 truncate">
            <MapPin size={12} className="text-[#025246]" />
            {data.location}
          </span>
          <span className="flex items-center gap-1 text-amber-500 shrink-0">
            <Star size={12} fill="currentColor" />
            {Number(data.rating) > 0 ? Number(data.rating).toFixed(1) : "-"}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 leading-snug mb-1 line-clamp-2 h-10">
          {data.name}
        </h3>

        <p className="text-xs text-gray-500 mb-4 h-4">
          <span className="font-medium text-gray-700">{data.categoryName}</span>
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-[#025246] h-6">
              {hasRange
                ? `${formatRupiah(data.minPrice)} - ${formatRupiah(data.maxPrice)}`
                : formatRupiah(data.price)}
            </div>
            <div className="text-[10px] text-gray-500">
              {hasRange ? "bisa nego · " : ""}per {data.unit} · stok {formatNumber(data.stock)} {data.unit}
            </div>
          </div>
          <span className="w-10 h-10 text-white bg-primary group-hover:bg-primary-dark rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md cursor-pointer">
            <Eye size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}
