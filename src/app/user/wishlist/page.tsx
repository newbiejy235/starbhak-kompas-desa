"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  MessageCircle,
  Bookmark,
  Package,
  Trash2,
  X,
  ShoppingCart,
  Scale,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { getClientUser } from "@/lib/auth/client";
import { getUserWishlist, removeFromWishlist } from "@/actions/wishlist";
import { getOrCreateChatRoom } from "@/actions/chat";
import { createOrder } from "@/actions/order";
import { formatRupiah, formatNumber } from "@/lib/format";
import { EmptyState, ErrorState, formatImage } from "@/components/shared/States";
import { useFetch } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";

interface WishlistRow {
  id: number;
  commodityId: number;
  transactionType: "nego" | "fixed_price";
  weight: string | null;
  price: string | null;
  createdAt: Date;
  commodityName: string;
  commodityPrice: string;
  commodityMinPrice: string | null;
  commodityMaxPrice: string | null;
  commodityMinWeightForNego: string | null;
  commodityFixedPrice: string | null;
  commodityStock: string;
  commodityUnit: string;
  commodityLocation: string;
  commodityStatus: string;
  commodityImage: string | null;
  commodityImages: string[] | null;
  farmerId: number;
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
  const router = useRouter();
  const [removing, setRemoving] = useState<number | null>(null);
  const [openingNego, setOpeningNego] = useState<number | null>(null);
  const [buying, setBuying] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: items, loading, error, reload } = useFetch(
    () =>
      userId ? getUserWishlist(userId) : Promise.resolve([] as WishlistRow[]),
    [userId],
  );

  const handleRemove = async (commodityId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || removing) return;
    setRemoving(commodityId);
    await removeFromWishlist(userId, commodityId);
    setRemoving(null);
    reload();
  };

  const handleNegoFromWishlist = async (item: WishlistRow, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || openingNego) return;
    setActionError(null);
    setOpeningNego(item.commodityId);
    try {
      const result = await getOrCreateChatRoom(userId, item.farmerId, item.commodityId);
      if (result?.roomId) {
        router.push(`/user/chat/${result.roomId}`);
      } else {
        setActionError("Gagal membuka chat nego. Silakan coba lagi.");
      }
    } catch {
      setActionError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setOpeningNego(null);
    }
  };

  const handleCheckoutFromWishlist = async (item: WishlistRow, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || buying) return;
    setActionError(null);
    setBuying(item.commodityId);
    try {
      const weight = item.weight ? Number(item.weight) : 1;
      const form = new FormData();
      form.set("commodityId", String(item.commodityId));
      form.set("quantity", String(weight));
      const result = await createOrder(userId, form);
      if (result.success && result.orderId) {
        router.push(`/user/checkout/${result.orderId}`);
      } else {
        setActionError(result.message || "Gagal membuat pesanan. Silakan coba lagi.");
      }
    } catch {
      setActionError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setBuying(null);
    }
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
          {actionError && (
            <p className="text-sm text-red-500 text-center mb-3">{actionError}</p>
          )}
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
                    <span className="hidden sm:inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                      <MessageCircle size={10} />
                      Nego
                    </span>

                    {item.weight && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                        {item.weight} {item.commodityUnit}
                      </span>
                    )}

                    {item.transactionType === "fixed_price" ? (
                      <button
                        onClick={(e) => handleCheckoutFromWishlist(item, e)}
                        disabled={buying === item.commodityId}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {buying === item.commodityId ? (
                          <X size={12} className="animate-spin" />
                        ) : (
                          <ShoppingCart size={10} />
                        )}
                        Checkout
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleNegoFromWishlist(item, e)}
                        disabled={openingNego === item.commodityId}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        {openingNego === item.commodityId ? (
                          <X size={12} className="animate-spin" />
                        ) : (
                          <MessageCircle size={10} />
                        )}
                        Nego Harga
                      </button>
                    )}

                    <button
                      onClick={(e) => handleRemove(item.commodityId, e)}
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