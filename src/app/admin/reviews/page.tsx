"use client";

import { Star } from "lucide-react";
import { getAllReviews } from "@/actions/review";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import { useFetch } from "@/lib/hooks";
import type { AdminReview } from "@/lib/types/market";
import CountUp from "@/components/ui/CountUp";
import { Skeleton } from "@/components/ui/Skeleton";

function ReviewsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-28 rounded-card" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-card" />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const { data: reviews, loading } = useFetch(
    () => getAllReviews(),
    [],
  );

  if (loading) return <ReviewsSkeleton />;

  const list: AdminReview[] = reviews ?? [];
  const avg = list.length > 0 ? list.reduce((a, r) => a + r.rating, 0) / list.length : 0;

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Ulasan & Penilaian Produk</h1>
      <p className="text-sm text-gray-500 mb-6">Monitor ulasan pembeli terhadap petani dan produk.</p>

      <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 mb-6 flex items-center gap-4">
        <CountUp
          value={avg}
          decimals={1}
          separator={false}
          className="text-4xl font-extrabold text-amber-500"
        />
        <div>
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={20}
                className={`transition-colors duration-300 ${s <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">Rata-rata dari {list.length} ulasan</p>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState title="Belum Ada Ulasan" message="Ulasan pembeli akan muncul di sini." />
      ) : (
        <div className="space-y-4">
          {list.map((r, i) => (
            <div
              key={r.id}
              className="bg-white rounded-card border border-gray-200/80 shadow-soft p-5 hover:shadow-lift transition-all duration-300 ease-smooth animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 50, 400)}ms`, animationFillMode: "backwards" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{r.buyerName}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(r.createdAt)}</p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">{r.comment || "Tidak ada komentar."}</p>
              <p className="text-xs text-gray-400 mt-2">
                Produk: <span className="text-primary font-medium">{r.commodityName}</span> · Petani:{" "}
                <span className="text-primary font-medium">{r.farmerName}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
