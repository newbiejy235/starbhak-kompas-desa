"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Star, Truck, Store, ChevronLeft, Minus, Plus, ShieldCheck, MessageCircle,
} from "lucide-react";
import { getCommodityById, getRelatedCommodities } from "@/actions/commodity";
import { getReviewsForCommodity } from "@/actions/review";
import { getOrCreateChatRoom } from "@/actions/chat";
import ProductCard from "@/components/userpage/ProductCard";
import ProductGallery from "@/components/userpage/ProductGallery";
import StatusBadge from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/States";
import { formatRupiah, formatDate, formatNumber } from "@/lib/format";
import { getClientUser } from "@/lib/auth/client";
import { addToCart } from "@/lib/cart";
import { useFetch } from "@/lib/hooks";
import type {
  CommodityDetail,
  ReviewForCommodity,
  RelatedCommodity,
} from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Skeleton className="h-96 rounded-card" />
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-card" />
        <Skeleton className="h-48 rounded-card" />
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const { data, loading } = useFetch(
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
    const user = getClientUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    addToCart(product.id, quantity);
    router.push("/user/cart");
  };

  const handleNego = async () => {
    const user = getClientUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const result = await getOrCreateChatRoom(user.id, product.farmerId, product.id);
    if (result) {
      router.push(`/user/chat/${result.roomId}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-up">
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

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
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
                Stok {formatNumber(product.stock)} {product.unit}
              </span>
              {product.harvestEstimate && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 text-amber-700">
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

            {isAvailable && stock > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-medium text-gray-700">Jumlah</span>
                  <div className="flex items-center border border-gray-200 rounded-full">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-gray-500 hover:text-primary active:scale-90 transition-all"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-10 text-center font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                      className="p-2 text-gray-500 hover:text-primary active:scale-90 transition-all"
                      aria-label="Tambah jumlah"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">{product.unit}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="rounded-2xl border-2 border-primary py-4 text-sm font-bold text-primary hover:bg-primary/5 active:scale-[0.98] transition-all duration-200"
                  >
                    Masukkan ke Keranjang
                  </button>
                  {hasPriceRange ? (
                    <button
                      onClick={handleNego}
                      className="rounded-2xl bg-primary py-4 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lift"
                    >
                      <MessageCircle size={18} />
                      Nego Harga
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="rounded-2xl bg-primary py-4 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lift"
                    >
                      Beli Sekarang
                    </button>
                  )}
                </div>
              </>
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
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Store size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{product.farmerName}</h3>
              <p className="text-xs text-gray-500">Petani di {product.location}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <span className="font-medium text-gray-800">Email:</span> {product.farmerEmail}
            </p>
            <p>
              <span className="font-medium text-gray-800">Telepon:</span> {product.farmerNoTelp}
            </p>
            {product.farmerAddress && (
              <p>
                <span className="font-medium text-gray-800">Alamat:</span> {product.farmerAddress}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
          <h3 className="font-bold text-gray-900 mb-4">Ulasan Pembeli</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada ulasan untuk komoditas ini.</p>
          ) : (
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item, i) => (
              <div
                key={item.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 60, 360)}ms`, animationFillMode: "backwards" }}
              >
                <ProductCard data={item} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
