"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  FlaskConical,
  ImageIcon,
  MapPin,
  Maximize2,
  Package,
  Ruler,
  Sparkles,
  Sprout,
  Star,
  X,
} from "lucide-react";
import { getFarmerStorePage } from "@/actions/farmer";
import { getReviewsForFarmer } from "@/actions/review";
import { useFetch } from "@/lib/hooks";
import { formatDate, getInitials } from "@/lib/format";
import { formatImage } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import ProductCard from "@/components/shared/ProductCard";
import Avatar from "@/components/ui/Avatar";
import { COLOR_PRIMARY, COLOR_PRIMARY_AVATAR } from "@/constants/brand";
import type { FarmerStorePage, ReviewForFarmer } from "@/lib/types/market";

const cardCls = "rounded-2xl border border-gray-200/80 bg-white";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#025246]";

/* ============================================================
   Section header — judul + deskripsi (+ aksi kanan)
   ============================================================ */
function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ============================================================
   Bintang
   ============================================================ */
function Stars({
  value,
  size = 14,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 gap-0.5 ${className}`}
      role="img"
      aria-label={`Rating ${value} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          aria-hidden
          className={
            s <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-100 text-gray-200"
          }
        />
      ))}
    </span>
  );
}

/* ============================================================
   InfoTile — informasi sekunder petani
   ============================================================ */
function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="mb-0.5 text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}

/* ============================================================
   ReviewCard — selaras halaman ulasan petani
   ============================================================ */
function ReviewCard({ review }: { review: ReviewForFarmer }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 transition-colors duration-200 hover:border-gray-200">
      <div className="flex items-start gap-3.5">
        <div
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
          style={{ backgroundColor: COLOR_PRIMARY_AVATAR, color: COLOR_PRIMARY }}
        >
          {getInitials(review.buyerName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-gray-900">
                {review.buyerName}
              </h3>
              <time
                dateTime={new Date(review.createdAt).toISOString()}
                className="text-xs text-gray-400"
              >
                {formatDate(review.createdAt)}
              </time>
            </div>
            <Stars value={review.rating} size={14} className="mt-0.5" />
          </div>

          <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
            {review.comment ? (
              review.comment
            ) : (
              <span className="text-sm italic text-gray-400">
                Pembeli tidak menulis komentar.
              </span>
            )}
          </p>

          <span className="mt-3.5 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[#F0F7F5] px-2.5 py-1 text-xs font-medium text-[#025246]">
            <Package size={12} aria-hidden className="shrink-0" />
            <span className="min-w-0 break-words">{review.commodityName}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   FarmGallery — galeri foto usaha dengan lightbox
   ============================================================ */
function FarmGallery({
  images,
}: {
  images: { id: number; secureUrl: string | null; caption: string | null }[];
}) {
  const imgs = images
    .map((img) => ({ ...img, url: formatImage(img.secureUrl) }))
    .filter((img) => img.url);
  const total = imgs.length;

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const close = useCallback(() => setOpen(false), []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % total);
  }, [total]);

  // Escape menutup modal + kunci scroll halaman di belakangnya
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, prev, next]);

  if (total === 0) return null;

  const current = imgs[index];

  return (
    <section>
      <SectionHeader
        icon={<ImageIcon size={19} />}
        title="Foto Usaha"
        action={
          total > 1 ? (
            <span className="text-xs font-medium text-gray-400">
              {total} foto
            </span>
          ) : undefined
        }
      />

      {/* Grid galeri */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {imgs.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            aria-label={`Lihat foto usaha: ${img.caption || `Foto ${i + 1}`}`}
            className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-gray-100 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Image
              src={img.url!}
              alt={img.caption || "Foto usaha petani"}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
            <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
            <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white">
                <Maximize2 size={18} />
              </span>
            </span>
            {img.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-2">
                <span className="block truncate text-[11px] font-medium text-white">
                  {img.caption}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Viewer full-screen */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || "Pratinjau foto usaha"}
          onClick={close}
          className="fixed inset-0 z-[100] h-dvh max-h-[100dvh] w-screen max-w-none animate-fade-in overflow-hidden bg-black/95"
        >
          {/* Top bar */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3 text-white">
              <span className="text-sm font-semibold">Foto Usaha</span>
              {total > 1 && (
                <span className="text-xs text-white/60">
                  {index + 1} / {total}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Tutup"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X size={22} />
            </button>
          </div>

          {/* Gambar — mengisi layar, proporsi asli, tanpa kartu putih */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-10 flex items-center justify-center px-20 py-24 sm:px-28 sm:py-24"
          >
            <Image
              src={current.url!}
              alt={current.caption || "Foto usaha petani"}
              width={1600}
              height={1200}
              sizes="100vw"
              className="h-full w-full object-contain"
              unoptimized
            />
          </div>

          {/* Caption */}
          {current.caption && (
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 to-transparent px-6 pb-8 pt-14">
              <p className="mx-auto max-w-xl truncate text-center text-sm text-white">
                {current.caption}
              </p>
            </div>
          )}

          {/* Navigasi prev/next (hanya jika lebih dari satu foto) */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Foto sebelumnya"
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Foto berikutnya"
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>,
        document.body,
      )}
    </section>
  );
}

/* ============================================================
   Skeleton — meniru struktur halaman sesungguhnya
   ============================================================ */
function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-5 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-56" />

      {/* Hero */}
      <div className={`${cardCls} p-5 sm:p-7`}>
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <Skeleton className="h-10 w-44 shrink-0 rounded-xl" />
        </div>
      </div>

      {/* Tentang */}
      <div className={`mt-8 ${cardCls} p-5 sm:p-6`}>
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
      </div>

      {/* Komoditas */}
      <div className="mt-10">
        <Skeleton className="mb-5 h-10 w-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-card border border-gray-200/80 bg-white"
            >
              <Skeleton className="aspect-[4/3] rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Foto usaha */}
      <div className="mt-10">
        <Skeleton className="mb-5 h-10 w-44" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </div>

      {/* Ulasan */}
      <div className="mt-10">
        <Skeleton className="mb-5 h-10 w-64" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Halaman
   ============================================================ */
export default function BuyerFarmerStorePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, loading } = useFetch(
    async () => {
      const store = await getFarmerStorePage(Number(id));
      if (!store) return { store: null, reviews: [] as ReviewForFarmer[] };
      const reviews = await getReviewsForFarmer(Number(id));
      return {
        store: store as FarmerStorePage,
        reviews: reviews as ReviewForFarmer[],
      };
    },
    [id],
  );

  const store = data?.store ?? null;
  const reviews = data?.reviews ?? [];

  if (loading) return <ProfileSkeleton />;

  if (!store) {
    return (
      <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState
          title="Profil Tidak Ditemukan"
          message="Profil petani yang Anda cari tidak tersedia."
        />
      </div>
    );
  }

  const avgRating = store.avgRating ? Number(store.avgRating) : null;
  const reviewCount = store.reviewCount ?? 0;
  const commodities = store.commodities ?? [];
  const farmImages = (store.farmImages ?? []).map((img) => ({
    id: img.id,
    secureUrl: img.secureUrl,
    caption: img.caption,
  }));

  const commodityId = `komoditas-${store.id}`;
  const hasRating = avgRating !== null && avgRating > 0;

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <div className="mx-auto w-full max-w-7xl animate-fade-up px-4 py-5 sm:px-6 lg:px-8">
        {/* ---------- Breadcrumb + back ---------- */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className={`inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-primary ${focusRing} rounded`}
          >
            <ChevronLeft size={16} />
            Kembali
          </button>
          <nav
            aria-label="Breadcrumb"
            className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-gray-400"
          >
            <Link
              href="/user/home"
              className={`font-medium text-gray-500 transition hover:text-primary ${focusRing} rounded`}
            >
              Beranda
            </Link>
            <span aria-hidden className="text-gray-300">/</span>
            <span aria-hidden className="text-gray-500">Petani</span>
            <span aria-hidden className="text-gray-300">/</span>
            <span className="max-w-[220px] truncate font-semibold text-gray-800">
              {store.fullName}
            </span>
          </nav>
        </div>

        <div className="space-y-10">
          {/* ---------- HERO ---------- */}
          <section className={`${cardCls} p-5 sm:p-7`}>
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Avatar
                src={store.fotoProfile}
                name={store.fullName}
                size="xl"
                className="h-24 w-24 shrink-0 text-4xl shadow-soft"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    {store.fullName}
                  </h1>
                  {store.isVerified ? (
                    <StatusBadge status="verified" />
                  ) : (
                    <StatusBadge status="pending" />
                  )}
                </div>

                {store.village && (
                  <p className="mt-1 text-sm text-gray-500">
                    Petani · {store.village}
                  </p>
                )}

                <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-gray-500">
                  {hasRating && (
                    <>
                      <span className="inline-flex items-center gap-1">
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                        <span className="font-semibold text-gray-700">
                          {avgRating.toFixed(1)}
                        </span>
                        <span className="text-gray-400">
                          ({reviewCount} ulasan)
                        </span>
                      </span>
                      <span aria-hidden className="text-gray-300">·</span>
                    </>
                  )}
                  <span>{commodities.length} komoditas</span>
                  <span aria-hidden className="text-gray-300">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} className="shrink-0 text-primary" />
                    Bergabung {formatDate(store.createdAt)}
                  </span>
                </p>

                {store.bio && (
                  <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-gray-600">
                    {store.bio}
                  </p>
                )}
              </div>

              <a
                href={`#${commodityId}`}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-dark sm:w-auto"
              >
                Lihat Komoditas
                <ChevronRight size={15} />
              </a>
            </div>
          </section>

          {/* ---------- TENTANG PETANI ---------- */}
          <section className={cardCls}>
            <div className="p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Sprout size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-gray-900">
                  Tentang Petani
                </h2>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {store.farmingExperience && (
                  <InfoTile
                    icon={<Clock size={18} />}
                    label="Pengalaman"
                    value={store.farmingExperience}
                  />
                )}
                {store.farmArea && (
                  <InfoTile
                    icon={<Ruler size={18} />}
                    label="Luas Lahan"
                    value={store.farmArea}
                  />
                )}
                {store.farmingMethod && (
                  <InfoTile
                    icon={<FlaskConical size={18} />}
                    label="Metode Bertani"
                    value={store.farmingMethod}
                  />
                )}
                {store.village && (
                  <InfoTile
                    icon={<MapPin size={18} />}
                    label="Lokasi"
                    value={store.village}
                  />
                )}
              </div>

              {store.bio && (
                <p
                  className="border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-600"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {store.bio}
                </p>
              )}
            </div>
          </section>

          {/* ---------- KOMODITAS ---------- */}
          <section>
            <SectionHeader
              icon={<Package size={19} />}
              title="Komoditas"
              description={`Hasil panen yang tersedia dari ${store.fullName}.`}
            />

            {commodities.length > 0 ? (
              <div
                id={commodityId}
                className="scroll-mt-24 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                {commodities.map((item, i) => (
                  <ProductCard
                    key={item.id}
                    href={`/user/product/${item.id}`}
                    index={i}
                    data={{
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      minPrice: item.minPrice,
                      maxPrice: item.maxPrice,
                      stock: item.stock,
                      unit: item.unit,
                      location: item.location ?? "",
                      image: item.image,
                      status: item.status,
                      categoryName: item.categoryName ?? "",
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum Ada Komoditas"
                message="Petani ini belum memiliki komoditas yang tersedia saat ini."
              />
            )}
          </section>

          {/* ---------- FOTO USAHA ---------- */}
          <FarmGallery images={farmImages} />

          {/* ---------- ULASAN PEMBELI ---------- */}
          <section>
            <SectionHeader
              icon={<Sparkles size={19} />}
              title="Ulasan Pembeli"
              description={`Berdasarkan ${reviewCount} ulasan pembeli.`}
              action={
                hasRating ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800">
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                    {avgRating.toFixed(1)}
                    <span className="font-normal text-gray-400">
                      ({reviewCount})
                    </span>
                  </span>
                ) : undefined
              }
            />

            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum Ada Ulasan"
                message="Belum ada ulasan untuk petani ini. Jadilah pembeli pertama yang menilai."
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
