"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Star, Truck, ChevronLeft, Minus, Plus, ShieldCheck, MessageCircle,
  BadgeCheck, ChevronRight, Loader2,
} from "lucide-react";
import { getCommodityById, getRelatedCommodities } from "@/actions/commodity";
import { getReviewsForCommodity } from "@/actions/review";
import { getOrCreateChatRoom } from "@/actions/chat";
import { createOrder } from "@/actions/order";
import ProductCard from "@/components/shared/ProductCard";
import ProductGallery from "@/components/userpage/ProductGallery";
import StatusBadge from "@/components/shared/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { formatRupiah, formatDate, formatWeight } from "@/lib/format";
import { addToCart } from "@/lib/cart";
import { useAuth, useFetch } from "@/lib/hooks";
import WishlistButton from "@/components/shared/WishlistButton";
import type {
  CommodityDetail,
  ReviewForCommodity,
  RelatedCommodity,
} from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function DetailSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 py-6 space-y-8 animate-fade-up">
      <Skeleton className="h-10 w-24 rounded-lg" />
      <Skeleton className="h-96 rounded-card" />
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <Skeleton className="h-56 rounded-card" />
        <Skeleton className="h-56 rounded-card" />
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatOpening, setChatOpening] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const { user } = useAuth();

  const { data, loading, error, reload } = useFetch(
    async () => {
      const product = await getCommodityById(Number(id));
      if (!product) {
        return {
          product: null as CommodityDetail | null,
          reviews: [] as ReviewForCommodity[],
          related: [] as RelatedCommodity[],
        };
      }
      const [reviews, related] = await Promise.all([
        getReviewsForCommodity(product.id),
        getRelatedCommodities(product.categoryId, product.id),
      ]);
      return {
        product: product as CommodityDetail,
        reviews: reviews as ReviewForCommodity[],
        related: related as RelatedCommodity[],
      };
    },
    [id],
  );

  const product = data?.product ?? null;
  const related = data?.related ?? [];
  const reviews = data?.reviews ?? [];

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <ErrorState
        message="Komoditas gagal dimuat. Silakan coba lagi."
        onRetry={reload}
      />
    );
  }

  if (!product) {
    return (
      <EmptyState
        title="Produk Tidak Ditemukan"
        message="Komoditas yang Anda cari tidak tersedia atau telah dihapus."
      />
    );
  }

  const stock = Number(product.stock);
  const isAvailable =
    product.status === "available" || product.status === "verified";

  const minPrice = product.minPrice ? Number(product.minPrice) : null;
  const maxPrice = product.maxPrice ? Number(product.maxPrice) : null;
  const hasPriceRange = minPrice !== null && maxPrice !== null && minPrice !== maxPrice;

  const handleAddToCart = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    addToCart(product.id, quantity);
    router.push("/user/cart");
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (buying) return;
    setBuying(true);
    setBuyError(null);
    try {
      const form = new FormData();
      form.set("commodityId", String(product.id));
      form.set("quantity", String(quantity));
      const result = await createOrder(user.id, form);
      if (result.success && result.orderId) {
        router.push(`/user/checkout/${result.orderId}`);
      } else {
        setBuyError(result.message || "Gagal membuat pesanan. Silakan coba lagi.");
      }
    } catch {
      setBuyError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setBuying(false);
    }
  };

  const openChat = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (user.id === product.farmerId) return;
    setChatError(null);
    setChatOpening(true);
    try {
      const result = await getOrCreateChatRoom(user.id, product.farmerId, product.id);
      if (result?.roomId) {
        router.push(`/user/chat/${result.roomId}`);
      } else {
        setChatError("Gagal membuka chat dengan petani. Silakan coba lagi.");
      }
    } catch {
      setChatError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setChatOpening(false);
    }
  };

  const handleNego = async () => {
    await openChat();
  };

  const isOwnProduct = !!user && user.id === product.farmerId;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 py-6 animate-fade-up">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary active:scale-95 transition-all mb-6"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <div className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden">
        <div className="grid md:grid-cols-2">
          <ProductGallery
            primaryImage={product.image}
            images={product.images}
            videoUrl={product.videoUrl}
            productName={product.name}
          />

          <div className="p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={product.status} />
              {Number(product.rating) > 0 && (
                <span className="inline-flex items-center gap-1 text-sm text-amber-500">
                  <Star size={16} fill="currentColor" />
                  {Number(product.rating).toFixed(1)}
                  <span className="text-gray-400 text-xs">
                    ({product.reviewCount} ulasan)
                  </span>
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-xs text-gray-500 mb-4">{product.categoryName}</p>

            <div className="mb-4">
              {hasPriceRange ? (
                <div>
                  <div className="text-3xl font-extrabold text-primary">
                    {formatRupiah(minPrice)} - {formatRupiah(maxPrice)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Harga bisa nego / {product.unit}
                  </p>
                </div>
              ) : (
                <div className="text-3xl font-extrabold text-primary">
                  {formatRupiah(product.price)}
                  <span className="text-sm font-medium text-gray-500"> / {product.unit}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-gray-600">
                <MapPin size={14} className="text-primary" />
                {product.location}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-gray-600">
                <ShieldCheck size={14} className="text-primary" />
                Kualitas {product.quality}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-gray-600">
                <Truck size={14} className="text-primary" />
                Stok {formatWeight(product.stock, product.unit)}
              </span>
              {product.harvestEstimate && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-warning/10 border border-warning/25 rounded-full px-3 py-1.5 text-warning">
                  Estimasi panen: {formatDate(product.harvestEstimate)}
                </span>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Deskripsi Produk</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mb-4 flex items-center gap-2">
              <WishlistButton commodityId={product.id} userId={user?.id ?? null} />
              <span className="text-xs text-gray-400">
                {user ? "Simpan ke wishlist" : "Masuk untuk wishlist"}
              </span>
            </div>

            {isAvailable && stock > 0 ? (
              hasPriceRange ? (
                <div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-5 flex flex-col items-center text-center">
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Produk ini <span className="font-semibold text-gray-900">memerlukan negosiasi</span> sebelum pembelian. Hubungi petani untuk menawar harga dan jumlah pesanan.
                  </p>
                  <button
                    onClick={handleNego}
                    disabled={chatOpening || isOwnProduct}
                    className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-soft hover:shadow-lift disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {chatOpening ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
                    {chatOpening ? "Membuka Chat..." : "Nego Harga"}
                  </button>
                  {chatError && (
                    <p className="text-xs text-red-500 mt-3 text-center">{chatError}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="text-sm font-medium text-gray-700">Jumlah</span>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="p-2.5 text-gray-500 hover:text-primary hover:bg-gray-50 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-11 text-center font-bold tabular-nums">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                        disabled={quantity >= stock}
                        className="p-2.5 text-gray-500 hover:text-primary hover:bg-gray-50 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
                        aria-label="Tambah jumlah"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">
                      Stok tersedia: {formatWeight(product.stock, product.unit)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="w-full rounded-xl border-2 border-primary px-6 py-3 text-sm font-bold text-primary hover:bg-primary/5 active:scale-[0.98] transition-all duration-200"
                    >
                      Masukkan ke Keranjang
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={buying}
                      className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-soft hover:shadow-lift disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {buying ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 size={18} className="animate-spin" /> Membuat Pesanan...
                        </span>
                      ) : (
                        "Beli Sekarang"
                      )}
                    </button>
                  </div>
                  {buyError && (
                    <p className="mt-3 text-xs text-red-500 text-center">{buyError}</p>
                  )}
                  {!isOwnProduct && (
                    <button
                      onClick={openChat}
                      disabled={chatOpening}
                      className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary hover:bg-primary/5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {chatOpening ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
                      {chatOpening ? "Membuka Chat..." : "Chat Petani"}
                    </button>
                  )}
                  {chatError && (
                    <p className="text-xs text-red-500 mt-2 text-center">{chatError}</p>
                  )}
                </>
              )
            ) : (
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-center text-sm text-gray-500">
                Komoditas ini sedang tidak tersedia
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              src={product.farmerFoto}
              name={product.farmerName}
              size="lg"
              className="shadow-soft"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate font-bold text-gray-900">
                  {product.farmerName}
                </h3>
              </div>
              <p className="text-xs text-gray-500">Petani di {product.location}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link
              href={`/user/farmer/${product.farmerId}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary hover:bg-primary/5"
            >
              Lihat Profil Petani
              <ChevronRight size={15} />
            </Link>
            {!isOwnProduct && (
              <button
                onClick={openChat}
                disabled={chatOpening}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-primary bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {chatOpening ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
                {chatOpening ? "Membuka Chat..." : "Chat Petani"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
          <h3 className="font-bold text-gray-900 mb-4">Ulasan Pembeli</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada ulasan untuk komoditas ini.</p>
          ) : (
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 animate-fade-up">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800">{r.buyerName}</span>
                    <span className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-gray-300"} />
                      ))}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Produk Lainnya</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {related.map((item, i) => (
              <ProductCard
                key={item.id}
                data={item}
                href={`/user/product/${item.id}`}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
