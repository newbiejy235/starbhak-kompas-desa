"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Trash2, MessageCircle, Check } from "lucide-react";
import { getClientUser } from "@/lib/auth/client";
import { getUserWishlist, removeFromWishlist } from "@/actions/wishlist";
import { formatRupiah, formatNumber } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
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
}

export default function UserWishlistPage() {
  const router = useRouter();
  const [user] = useState(() => getClientUser());
  const userId = user?.id ?? 0;
  const [removing, setRemoving] = useState<number | null>(null);

  const { data: items, loading, reload } = useFetch(
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
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 mb-6" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-card" />
        ))}
      </div>
    );
  }

  const list = items ?? [];

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Wishlist Saya</h1>
      <p className="text-sm text-gray-500 mb-6">Komoditas yang Anda tandai untuk dibeli atau dinegosiasi.</p>

      {list.length === 0 ? (
        <EmptyState
          title="Wishlist Masih Kosong"
          message="Tandai komoditas dengan ikon bookmark untuk menyimpannya di sini."
        />
      ) : (
        <div className="space-y-4">
          {list.map((item, i) => {
            const hasRange =
              item.commodityMinPrice &&
              item.commodityMaxPrice &&
              Number(item.commodityMinPrice) !== Number(item.commodityMaxPrice);
            const outOfStock =
              Number(item.commodityStock) <= 0 ||
              item.commodityStatus === "sold_out";

            return (
              <div
                key={item.id}
                className="bg-white rounded-card border border-gray-200/80 shadow-soft hover:shadow-lift transition-all duration-300 overflow-hidden animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 60, 360)}ms`, animationFillMode: "backwards" }}
              >
                <div className="p-4 flex items-center gap-4">
                  <Link
                    href={`/user/product/${item.commodityId}`}
                    className="w-16 h-16 rounded-xl flex-shrink-0 bg-gradient-to-br from-[#025246] to-[#047857] text-white flex items-center justify-center text-2xl font-black group-hover:scale-105"
                  >
                    {item.commodityName?.charAt(0)?.toUpperCase()}
                  </Link>

                  <Link
                    href={`/user/product/${item.commodityId}`}
                    className="flex-1 min-w-0 group"
                  >
                    <p className="font-bold text-gray-900 truncate group-hover:text-[#025246] transition-colors">
                      {item.commodityName}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-[#025246]" />
                      {item.commodityLocation}
                    </p>
                    <p className="text-lg font-extrabold text-[#025246] mt-1">
                      {hasRange
                        ? `${formatRupiah(item.commodityMinPrice)} - ${formatRupiah(item.commodityMaxPrice)}`
                        : formatRupiah(item.commodityPrice)}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {hasRange ? "bisa nego · " : ""}per {item.commodityUnit} · stok {formatNumber(item.commodityStock)} {item.commodityUnit}
                    </p>
                  </Link>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleNego(item.commodityId)}
                      disabled={outOfStock}
                      className="px-3.5 py-2 bg-[#00AA5B] text-white text-xs font-bold rounded-lg hover:bg-[#009A4F] disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle size={14} /> {outOfStock ? "Habis" : "Lihat & Nego"}
                    </button>
                    <button
                      onClick={() => handleRemove(item.commodityId)}
                      disabled={removing === item.commodityId}
                      className="px-3.5 py-2 bg-white border border-red-200 text-red-500 text-xs font-medium rounded-lg hover:bg-red-50 disabled:opacity-40 flex items-center gap-1.5"
                    >
                      {removing === item.commodityId ? <Check size={14} /> : <Trash2 size={14} />}
                      Hapus
                    </button>
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
