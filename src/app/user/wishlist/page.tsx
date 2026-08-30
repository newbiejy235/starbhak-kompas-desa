"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  MessageCircle,
  Check,
  Bookmark,
  Package,
  Trash2,
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

export default function UserWishlistPage() {
  const router = useRouter();
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

  const handleNego = (commodityId: number) => {
    router.push(`/user/product/${commodityId}`);
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-5 lg:px-6 space-y-4 py-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72 mb-6" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-card border border-gray-200/80 bg-white"
          >
            <div className="p-3 sm:p-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2 pt-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
                <Skeleton className="h-10 w-full sm:h-9 sm:w-32 rounded-lg" />
                <Skeleton className="h-10 w-full sm:h-9 sm:w-24 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
        <div className="space-y-3 sm:space-y-4">
          {list.map((item, i) => {
            const hasRange =
              item.commodityMinPrice &&
              item.commodityMaxPrice &&
              Number(item.commodityMinPrice) !== Number(item.commodityMaxPrice);
            const outOfStock =
              Number(item.commodityStock) <= 0 ||
              item.commodityStatus === "sold_out";

            const img =
              formatImage(item.commodityImage) ??
              formatImage(item.commodityImages?.[0] ?? null);

            return (
              <div
                key={item.id}
                className="transition-all duration-300 overflow-hidden animate-fade-up"
                style={{
                  animationDelay: `${Math.min(i * 60, 360)}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 sm:flex-1 min-w-0">
                      <Link
                        href={`/user/product/${item.commodityId}`}
                        className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100"
                      >
                        {img ? (
                          <Image
                            src={img}
                            alt={item.commodityName}
                            fill
                            sizes="(max-width: 640px) 96px, 112px"
                            className="object-cover transition-transform duration-500 ease-smooth hover:scale-105"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300">
                            <Package size={30} strokeWidth={1.5} />
                          </span>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <Link
                          href={`/user/product/${item.commodityId}`}
                          className="group"
                        >
                          <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {item.commodityName}
                          </h3>
                        </Link>

                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 min-w-0">
                          <MapPin size={12} className="shrink-0 text-primary" />
                          <span className="truncate">{item.commodityLocation}</span>
                        </p>

                        <p className="mt-1.5 min-w-0 break-words text-lg font-extrabold text-primary sm:text-xl">
                          {hasRange
                            ? `${formatRupiah(item.commodityMinPrice)} - ${formatRupiah(item.commodityMaxPrice)}`
                            : formatRupiah(item.commodityPrice)}
                        </p>

                        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-gray-500">
                          <span className="truncate">
                            per {item.commodityUnit} · stok{" "}
                            {formatNumber(item.commodityStock)} {item.commodityUnit}
                          </span>
                        </p>

                        {hasRange && (
                          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                            <MessageCircle size={11} />
                            Bisa Nego
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:gap-2.5">
                      <button
                        onClick={() => handleNego(item.commodityId)}
                        disabled={outOfStock}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.98] disabled:opacity-40 sm:w-auto"
                      >
                        <MessageCircle size={15} />
                        {outOfStock ? "Habis" : "Lihat & Nego"}
                      </button>
                      <button
                        onClick={() => handleRemove(item.commodityId)}
                        disabled={removing === item.commodityId}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 active:scale-[0.98] disabled:opacity-40 sm:w-auto"
                      >
                        {removing === item.commodityId ? (
                          <Check size={15} />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
