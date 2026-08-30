"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  MessageCircle,
  Bookmark,
  Package,
  Trash2,
  X,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { getClientUser } from "@/lib/auth/client";
import { getUserWishlist, removeFromWishlist } from "@/actions/wishlist";
import { formatRupiah, formatNumber } from "@/lib/format";
import { EmptyState, ErrorState, formatImage } from "@/components/shared/States";
import { useFetch } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";

interface WishlistRow {
  id: number;
  commodityId: number;
  createdAt: Date;
  commodityName: string;
  commodityPrice: string;
  commodityMinPrice: string | null;
  commodityMaxPrice: string | null;
  commodityStock: string;
  commodityUnit: string;
  commodityLocation: string;
  commodityStatus: string;
  commodityImage: string | null;
  commodityImages: string[] | null;
}

function WishlistSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-5 lg:px-6 space-y-4 py-2">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-4 w-72 mb-6" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-gray-100 bg-white"
        >
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UserWishlistPage() {
  const [user] = useState(() => getClientUser());
  const userId = user?.id ?? 0;
  const [removing, setRemoving] = useState<number | null>(null);

  const { data: items, loading, error, reload } = useFetch(
    () =>
      userId ? getUserWishlist(userId) : Promise.resolve([] as WishlistRow[]),
    [userId],
  );

  const handleRemove = async (commodityId: number) => {
    if (!userId || removing) return;
    setRemoving(commodityId);
    await removeFromWishlist(userId, commodityId);
    setRemoving(null);
    reload();
  };

  if (loading) return <WishlistSkeleton />;

  const list = items ?? [];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-5 lg:px-6 animate-fade-up">
      <PageHeader
        icon={Bookmark}
        title="Wishlist Saya"
        subtitle="Komoditas yang Anda tandai untuk dibeli atau dinegosiasi."
      />

      {error ? (
        <ErrorState
          message="Wishlist gagal dimuat. Silakan coba lagi."
          onRetry={reload}
        />
      ) : list.length === 0 ? (
        <EmptyState
          title="Wishlist Masih Kosong"
          message="Tandai komoditas dengan ikon bookmark untuk menyimpannya di sini."
        />
      ) : (
        <div className="space-y-2">
          {list.map((item, i) => {
            const hasRange =
              item.commodityMinPrice &&
              item.commodityMaxPrice &&
              Number(item.commodityMinPrice) !== Number(item.commodityMaxPrice);

            const img =
              formatImage(item.commodityImage) ??
              formatImage(item.commodityImages?.[0] ?? null);

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-sm animate-fade-up"
                style={{
                  animationDelay: `${Math.min(i * 40, 240)}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <Link
                  href={`/user/product/${item.commodityId}`}
                  className="flex items-center gap-3 p-3 sm:p-4 group"
                >
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {img ? (
                      <Image
                        src={img}
                        alt={item.commodityName}
                        fill
                        sizes="(max-width: 640px) 96px, 96px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-gray-300">
                        <Package size={24} strokeWidth={1.5} />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                      {item.commodityName}
                    </h3>

                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={11} className="shrink-0 text-primary" />
                      <span className="truncate">{item.commodityLocation}</span>
                    </p>

                    <p className="mt-1 text-lg font-bold text-primary">
                      {hasRange
                        ? `${formatRupiah(item.commodityMinPrice)} - ${formatRupiah(item.commodityMaxPrice)}`
                        : formatRupiah(item.commodityPrice)}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                      per {item.commodityUnit} · stok {formatNumber(item.commodityStock)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {hasRange && (
                      <span className="hidden sm:inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                        <MessageCircle size={10} />
                        Bisa Nego
                      </span>
                    )}

                    <button
                      onClick={() => handleRemove(item.commodityId)}
                      disabled={removing === item.commodityId}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      aria-label="Hapus dari wishlist"
                    >
                      {removing === item.commodityId ? (
                        <X size={18} className="text-amber-500" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}