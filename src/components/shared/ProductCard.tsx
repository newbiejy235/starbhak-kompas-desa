"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Package, MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { formatRupiah, formatWeight } from "@/lib/format";
import { formatImage } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { LOW_STOCK_THRESHOLD } from "@/constants/commodities";

/* ── Shared data shape ───────────────────────────────────── */
export interface ProductCardData {
  id: number;
  name: string;
  price: string;
  minPrice?: string | null;
  maxPrice?: string | null;
  stock: string;
  unit: string;
  location: string;
  image: string | null;
  images?: string[] | null;
  quality?: string | null;
  status?: string;
  isPublished?: boolean;
  categoryName?: string | null;
}

interface ProductCardProps {
  data: ProductCardData;
  /** Buyer cards link to product detail. Farmer cards don't. */
  href?: string;
  /** Show farmer actions (three-dot menu with Edit / Delete). */
  farmer?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePublication?: () => void;
  /** Animation delay index for staggered entrance. */
  index?: number;
}

/* ── Component ───────────────────────────────────────────── */
export default React.memo(function ProductCard({
  data,
  href,
  farmer = false,
  onEdit,
  onDelete,
  onTogglePublication,
  index = 0,
}: ProductCardProps) {
  const img = formatImage(data.image) ?? formatImage(data.images?.[0] ?? null);
  const stock = Number(data.stock);
  const outOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  const hasRange =
    data.minPrice && data.maxPrice && Number(data.minPrice) !== Number(data.maxPrice);

  /* ── Three-dot menu (farmer only) ── */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  /* ── Card inner ── */
  const cardContent = (
    <>
      {/* ── Image ── */}
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
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400">
            <Package size={32} strokeWidth={1.5} />
            <span className="text-[11px] font-medium">Tidak ada gambar</span>
          </div>
        )}

        {/* Status badge — top-right */}
        {data.status && (
          <div className="absolute right-2.5 top-2.5 z-10">
            <StatusBadge status={data.status} />
          </div>
        )}

        {/* Farmer action menu — top-left */}
        {farmer && (
          <div className="absolute left-2.5 top-2.5 z-10" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-gray-900 active:scale-90"
              aria-label="Aksi komoditas"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute left-0 top-full z-20 mt-1 w-44 origin-top-left overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-lift animate-scale-in">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit?.();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onTogglePublication?.();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {data.isPublished ? (
                      <>
                        <EyeOff size={14} />
                        Jadikan Privat
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        Publikasikan
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete?.();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/5"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category eyebrow */}
        {data.categoryName && (
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {data.categoryName}
          </p>
        )}

        {/* Product name */}
        <h3 className="mt-1 min-h-[2.75em] text-[15px] font-semibold leading-snug text-gray-900 line-clamp-2">
          {data.name}
        </h3>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-primary">
            {hasRange
              ? `${formatRupiah(data.minPrice)} – ${formatRupiah(data.maxPrice)}`
              : formatRupiah(data.price)}
          </span>
          <span className="text-xs text-gray-400">/ {data.unit}</span>
        </div>

        {/* Spacer to pin footer to bottom */}
        <div className="mt-auto" />

        {/* Footer */}
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Stock */}
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

            {/* Quality */}
            {data.quality && (
              <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {data.quality}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            {/* Publication indicator (farmer only) */}
            {farmer && (
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  data.isPublished ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                }`}
              >
                {data.isPublished ? (
                  <>
                    <Eye size={10} />
                    Publik
                  </>
                ) : (
                  <>
                    <EyeOff size={10} />
                    Privat
                  </>
                )}
              </span>
            )}

            {/* Location */}
            <span className="flex min-w-0 flex-1 items-center gap-1">
              <MapPin size={12} className="shrink-0 text-gray-400" />
              <span className="truncate text-xs text-gray-500">{data.location}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );

  /* ── Wrapper: link (buyer) or div (farmer) ── */
  const wrapperClass =
    "group flex h-full flex-col overflow-hidden rounded-card border border-gray-200/80 bg-white shadow-soft transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift animate-fade-up";

  if (href) {
    return (
      <Link
        href={href}
        className={`${wrapperClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
        style={{
          animationDelay: `${Math.min(index * 50, 300)}ms`,
          animationFillMode: "backwards",
        }}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      className={wrapperClass}
      style={{
        animationDelay: `${Math.min(index * 50, 300)}ms`,
        animationFillMode: "backwards",
      }}
    >
      {cardContent}
    </div>
  );
});