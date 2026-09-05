"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getAllCommoditiesAdmin } from "@/actions/admin";
import { formatRupiah, formatNumber, formatDate } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { MapPin, Eye, BadgeCheck } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";

function CommoditiesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-40 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-card" />
        ))}
      </div>
    </div>
  );
}

export default function AdminCommodities() {
  const [filter, setFilter] = useState("all");

  const { data: commodities, loading } = useFetch(
    () => getAllCommoditiesAdmin(),
    [],
  );

  const list = useMemo(() => commodities ?? [], [commodities]);

  const filtered = useMemo(
    () => list.filter((c) => filter === "all" || c.status === filter),
    [list, filter],
  );

  const counts = useMemo(
    () => ({
      all: list.length,
      pending: list.filter((c) => c.status === "pending").length,
      verified: list.filter(
        (c) => c.status === "verified" || c.status === "available",
      ).length,
      rejected: list.filter((c) => c.status === "rejected").length,
    }),
    [list],
  );

  if (loading) return <CommoditiesSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Manajemen Komoditas
        </h1>
        <p className="text-sm text-gray-500">
          Verifikasi dan kelola komoditas hasil panen petani.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: `Semua (${counts.all})` },
          { id: "pending", label: `Menunggu Verifikasi (${counts.pending})` },
          { id: "verified", label: `Terverifikasi (${counts.verified})` },
          { id: "rejected", label: `Ditolak (${counts.rejected})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 ${
              filter === f.id
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Komoditas"
          message="Tidak ada komoditas yang cocok dengan filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-lg border border-gray-200/80 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 ease-smooth cursor-pointer"
            >
              <div className="aspect-[3/2] bg-gray-50 overflow-hidden">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span className="text-4xl font-medium">
                      {c.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={c.status} />
                </div>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <Link
                  href={`/admin/commodities/${c.id}`}
                  className="font-bold text-gray-900 mb-2 hover:text-primary transition-colors"
                >
                  {c.name}
                </Link>
                <p className="text-xs text-gray-500 mb-1">
                  {c.categoryName} · {c.farmerName}
                </p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <MapPin size={12} /> {c.location} · {formatDate(c.createdAt)}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between">
                  <div>
                    <span className="font-extrabold text-primary">
                      {formatRupiah(c.price)}
                    </span>
                    <span className="text-xs text-gray-500">
                      / {c.unit}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Stok: {formatNumber(c.stock)} {c.unit || "kg"} · Kualitas {c.quality || "Sedang"}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  {c.status === "pending" ? (
                    <Link
                      href={`/admin/verification/commodities/${c.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all"
                    >
                      <BadgeCheck size={16} /> Review
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/commodities/${c.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all"
                    >
                      <Eye size={16} /> Detail
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}