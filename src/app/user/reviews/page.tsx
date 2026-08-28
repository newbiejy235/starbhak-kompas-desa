"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Star, Send, ArrowLeft } from "lucide-react";
import { getUserOrders } from "@/actions/order";
import { createReview } from "@/actions/review";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import { useAuth, useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import type { BuyerOrder } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function ReviewsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-72 mb-6" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-card" />
      ))}
    </div>
  );
}

function ReviewsContent() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order");
  const { user } = useAuth();

  const [selectedOrder, setSelectedOrder] = useState<number | null>(
    orderParam ? Number(orderParam) : null,
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const { data: orders, loading, reload } = useFetch(
    () =>
      user ? getUserOrders(user.id) : Promise.resolve([] as BuyerOrder[]),
    [user?.id],
  );

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      if (!user) return { success: false, message: "Silakan masuk" };
      const res = await createReview(user.id, data);
      if (res.success) {
        setComment("");
        setSelectedOrder(null);
        reload();
      }
      return res;
    },
    null,
  );

  const completedOrders = (orders ?? []).filter((o) => o.status === "completed");

  if (loading) return <ReviewsSkeleton />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Ulasan</h1>
      <p className="text-sm text-gray-500 mb-6">Berikan penilaian untuk pesanan yang sudah selesai.</p>

      {selectedOrder ? (
        <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-8 max-w-xl mx-auto animate-scale-in">
          <button
            onClick={() => setSelectedOrder(null)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Beri Ulasan</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Bagaimana kualitas produk dan layanan petani?
          </p>

          <form action={formAction} className="flex flex-col items-center gap-4">
            <input type="hidden" name="orderId" value={selectedOrder} />

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Beri ${star} bintang`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform duration-150 hover:scale-125 active:scale-95"
                >
                  <Star
                    size={36}
                    className={
                      (hoverRating || rating) >= star
                        ? "text-amber-400 fill-amber-400 drop-shadow-[0_2px_6px_rgba(251,191,36,0.5)]"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis ulasan Anda di sini..."
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
              rows={4}
            />

            {state && !state.success && (
              <p className="text-sm text-danger w-full text-center animate-fade-in">{state.message}</p>
            )}

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Send size={16} /> {isPending ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {completedOrders.length === 0 ? (
            <EmptyState
              title="Belum Ada Pesanan Selesai"
              message="Anda dapat memberi ulasan setelah pesanan selesai."
            />
          ) : (
            <div className="space-y-4">
              {completedOrders.map((o, i) => (
                <div
                  key={o.id}
                  className="bg-white rounded-card border border-gray-200/80 shadow-soft p-5 flex items-center justify-between gap-4 hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300 ease-smooth animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 60, 360)}ms`, animationFillMode: "backwards" }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                      {o.commodityName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{o.commodityName}</p>
                      <p className="text-xs text-gray-500">
                        {o.orderCode} · {formatDateTime(o.createdAt)} · {formatRupiah(o.totalPrice)}
                      </p>
                      <p className="text-xs text-gray-400">Petani: {o.farmerName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrder(o.id);
                      setRating(5);
                      setComment("");
                    }}
                    className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-primary/10 text-primary px-5 py-3 text-sm font-bold hover:bg-primary hover:text-white active:scale-95 transition-all duration-200"
                  >
                    <Star size={16} /> Beri Ulasan
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function UserReviews() {
  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <ReviewsContent />
    </Suspense>
  );
}
