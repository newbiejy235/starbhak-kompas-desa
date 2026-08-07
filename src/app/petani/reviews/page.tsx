"use client";

import { Star } from "lucide-react";
import { getReviewsForFarmer } from "@/actions/review";
import { getClientUser } from "@/lib/auth/client";
import { formatDateTime } from "@/lib/format";
import { LoadingState, EmptyState } from "@/components/shared/States";
import { useFetch } from "@/lib/hooks";
import type { ReviewForFarmer } from "@/lib/types/market";

export default function PetaniReviews() {
  const user = getClientUser();

  const { data: reviews, loading } = useFetch(
    () =>
      user ? getReviewsForFarmer(user.id) : Promise.resolve([] as ReviewForFarmer[]),
    [user?.id],
  );

  if (loading) return <LoadingState />;

  const list = reviews ?? [];
  const avg = list.length > 0 ? list.reduce((a, r) => a + r.rating, 0) / list.length : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#111111] mb-2">Ulasan Petani</h1>
      <p className="text-sm text-gray-500 mb-6">Penilaian pembeli terhadap produk Anda.</p>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 flex items-center gap-4">
        <div className="text-4xl font-extrabold text-amber-500">{avg.toFixed(1)}</div>
        <div>
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={20}
                className={s <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-gray-300"}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">Dari {list.length} ulasan</p>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="Belum Ada Ulasan"
          message="Ulasan dari pembeli akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {list.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
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
              <p className="text-xs text-[#025246] mt-2 font-medium">Untuk: {r.commodityName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
