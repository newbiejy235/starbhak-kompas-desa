"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  MapPin,
  Package,
  Star,
  Store,
  ShieldCheck,
} from "lucide-react";
import { getCommodityById, getRelatedCommodities } from "@/actions/commodity";
import { useFetch } from "@/lib/hooks";
import { formatRupiah, formatNumber, formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/States";
import type { CommodityDetail, RelatedCommodity } from "@/lib/types/market";

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Skeleton className="h-96 rounded-2xl" />
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}

export default function KomoditasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, loading } = useFetch(
    async () => {
      const product = await getCommodityById(Number(id));
      if (!product) return null;
      const related = await getRelatedCommodities(product.categoryId, product.id);
      return {
        product: product as CommodityDetail,
        related: (related as RelatedCommodity[]).filter((r) => r.id !== product.id),
      };
    },
    [id],
  );

  if (loading) return <DetailSkeleton />;

  if (!data?.product) {
    return (
      <main className="min-h-screen bg-[#FAFAF9]">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6">
          <EmptyState
            title="Komoditas Tidak Ditemukan"
            message="Komoditas yang Anda cari tidak tersedia atau telah dihapus."
          />
        </div>
      </main>
    );
  }

  const { product, related } = data;
  const isAvailable =
    product.status === "available" || product.status === "verified";

  return (
    <main className="min-h-screen bg-[#FAFAF9] text-[#17231F]">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 lg:py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm text-[#8A9C98] transition hover:text-[#025246]"
        >
          <ChevronLeft size={16} />
          Kembali
        </button>

        {/* PRODUCT */}
        <div className="overflow-hidden rounded-2xl border border-[#E2E8E5] bg-white">
          <div className="grid md:grid-cols-2">
            {/* IMAGE */}
            <div className="relative aspect-square bg-[#EEF3F0] md:aspect-auto md:min-h-[400px]">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#8A9C98]">
                  Tidak ada gambar
                </div>
              )}
              {product.categoryName && (
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#025246] shadow-sm">
                  {product.categoryName}
                </span>
              )}
            </div>

            {/* INFO */}
            <div className="flex flex-col p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isAvailable
                      ? "bg-[#EAF3EF] text-[#025246]"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {isAvailable ? "Tersedia" : "Habis"}
                </span>
                {Number(product.rating) > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm text-amber-500">
                    <Star size={14} fill="currentColor" />
                    {Number(product.rating).toFixed(1)}
                    <span className="text-xs text-[#8A9C98]">
                      ({product.reviewCount})
                    </span>
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold text-[#1F302B]">
                {product.name}
              </h1>

              <div className="mt-3">
                {product.minPrice && product.maxPrice ? (
                  <div>
                    <span className="text-2xl font-extrabold text-[#025246]">
                      {formatRupiah(product.minPrice)} -{" "}
                      {formatRupiah(product.maxPrice)}
                    </span>
                    <p className="mt-1 text-xs text-[#8A9C98]">
                      Harga bisa nego / {product.unit}
                    </p>
                  </div>
                ) : (
                  <span className="text-2xl font-extrabold text-[#025246]">
                    {formatRupiah(product.price)}
                    <span className="ml-1 text-sm font-medium text-[#81908C]">
                      / {product.unit}
                    </span>
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F8F5] px-3 py-1.5 text-xs text-[#71817D]">
                  <MapPin size={13} className="text-[#025246]" />
                  {product.location}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F8F5] px-3 py-1.5 text-xs text-[#71817D]">
                  <ShieldCheck size={13} className="text-[#025246]" />
                  Grade {product.quality}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F8F5] px-3 py-1.5 text-xs text-[#71817D]">
                  <Package size={13} className="text-[#025246]" />
                  Stok {formatNumber(Number(product.stock))} {product.unit}
                </span>
                {product.harvestEstimate && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                    Estimasi panen: {formatDate(product.harvestEstimate)}
                  </span>
                )}
              </div>

              {product.description && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-bold text-[#1F302B]">
                    Deskripsi
                  </h3>
                  <p className="text-sm leading-relaxed text-[#71817D] whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* FARMER INFO */}
              <div className="mt-auto pt-6">
                <div className="flex items-center gap-3 rounded-xl bg-[#F3F8F5] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3EF]">
                    <Store size={22} className="text-[#025246]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[#1F302B]">
                      {product.farmerName}
                    </h4>
                    <p className="text-xs text-[#71817D]">
                      Petani di {product.location}
                    </p>
                  </div>
                  <Link
                    href={`/kompas-desa/petani/${product.farmerId}`}
                    className="rounded-lg bg-[#025246] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#013E35]"
                  >
                    Lihat Profil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-[#1F302B]">
              Komoditas Terkait
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/kompas-desa/cari-komoditas/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-[#E2E8E5] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#025246]/30 hover:shadow-[0_12px_32px_rgba(2,82,70,0.08)]"
                >
                  <div className="relative h-36 overflow-hidden bg-[#EEF3F0]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#8A9C98]">
                        Tidak ada gambar
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-sm font-bold text-[#1F302B]">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-base font-bold text-[#025246]">
                      {formatRupiah(Number(item.price))}
                      <span className="ml-1 text-xs font-medium text-[#81908C]">
                        / {item.unit}
                      </span>
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[#71817D]">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
