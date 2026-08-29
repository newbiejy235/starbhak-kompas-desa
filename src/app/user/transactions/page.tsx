"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  Star,
  Send,
  ChevronUp,
} from "lucide-react";
import { getUserOrders } from "@/actions/order";
import { getReviewsByBuyer, createReview } from "@/actions/review";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";
import type { BuyerOrder } from "@/lib/types/market";
import type { ActionState } from "@/lib/types/auth";
import CountUp from "@/components/ui/CountUp";
import { Skeleton } from "@/components/ui/Skeleton";

interface BuyerReview {
  id: number;
  orderId: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  commodityName: string;
}

function TransactionsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-28 rounded-card" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-card" />
      ))}
    </div>
  );
}

const statusIcon: Record<string, typeof Package> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  completed: CheckCircle2,
  cancelled: XCircle,
};

export default function UserTransactions() {
  const user = getClientUser();
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: orders, loading: ordersLoading, reload } = useFetch(
    () =>
      user
        ? getUserOrders(user.id)
        : Promise.resolve([] as BuyerOrder[]),
    [user?.id],
  );

  const { data: reviews, loading: reviewsLoading } = useFetch(
    () =>
      user
        ? getReviewsByBuyer(user.id)
        : Promise.resolve([] as BuyerReview[]),
    [user?.id],
  );

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      if (!user) return { success: false, message: "Silakan masuk" };
      const res = await createReview(user.id, data);
      if (res.success) {
        setComment("");
        setRating(5);
        setExpandedReview(null);
        reload();
      }
      return res;
    },
    null,
  );

  if (ordersLoading || reviewsLoading) return <TransactionsSkeleton />;

  const orderList = (orders ?? []) as BuyerOrder[];
  const reviewList = (reviews ?? []) as BuyerReview[];
  const reviewMap = new Map(reviewList.map((r) => [r.orderId, r]));

  const paidOrders = orderList.filter((o) => o.paymentStatus === "paid");
  const totalSpent = paidOrders.reduce((acc, o) => acc + Number(o.totalPrice), 0);

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-amber-100 text-amber-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Riwayat Transaksi</h1>
      <p className="text-sm text-gray-500 mb-6">
        Semua pesanan Anda. Berikan ulasan untuk pesanan yang sudah selesai.
      </p>

      <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 mb-6">
        <p className="text-sm text-gray-500">Total Pengeluaran</p>
        <CountUp
          value={totalSpent}
          prefix="Rp "
          className="text-2xl font-extrabold text-primary"
        />
        <p className="text-xs text-gray-400 mt-1">{paidOrders.length} transaksi selesai</p>
      </div>

      {orderList.length === 0 ? (
        <EmptyState
          title="Belum Ada Transaksi"
          message="Transaksi Anda akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {orderList.map((o, i) => {
            const Icon = statusIcon[o.status] || Package;
            const existingReview = reviewMap.get(o.id);
            const isCompleted = o.status === "completed";
            const isExpanded = expandedReview === o.id;

            return (
              <div
                key={o.id}
                className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300 ease-smooth animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 60, 360)}ms`, animationFillMode: "backwards" }}
              >
                {/* Order header */}
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusStyle(o.status)}`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</p>
                      <p className="text-sm font-bold text-gray-800">{o.orderCode}</p>
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                {/* Order body */}
                <Link
                  href={`/user/checkout/${o.id}`}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-primary/[0.03] transition-colors group"
                >
                  <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-2xl font-black group-hover:scale-105 transition-transform duration-300">
                    {o.commodityName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{o.commodityName}</p>
                    <p className="text-xs text-gray-500">
                      {Number(o.quantity)} ├ù {formatRupiah(o.unitPrice)} ┬╖ {o.farmerName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      Pembayaran: <StatusBadge status={o.paymentStatus ?? "pending"} />
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-extrabold text-primary">{formatRupiah(o.totalPrice)}</p>
                  </div>
                </Link>

                {/* Review section ΓÇö hanya untuk order selesai */}
                {isCompleted && (
                  <div className="px-5 pb-4 border-t border-gray-100">
                    {existingReview ? (
                      <div className="mt-3 bg-amber-50 rounded-xl p-4">
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={
                                star <= existingReview.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-2">
                            {existingReview.rating}/5
                          </span>
                        </div>
                        {existingReview.comment && (
                          <p className="text-sm text-gray-600 mt-1">
                            {existingReview.comment}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {!isExpanded ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setExpandedReview(o.id);
                              setRating(5);
                              setComment("");
                            }}
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary/10 text-primary px-4 py-2.5 text-sm font-bold hover:bg-primary hover:text-white active:scale-95 transition-all duration-200"
                          >
                            <Star size={16} /> Beri Ulasan
                          </button>
                        ) : (
                          <form action={formAction} className="mt-3 bg-gray-50 rounded-xl p-4 animate-scale-in">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-bold text-gray-800">Beri Ulasan</p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setExpandedReview(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <ChevronUp size={18} />
                              </button>
                            </div>
                            <input type="hidden" name="orderId" value={o.id} />

                            <div className="flex gap-1.5 mb-3">
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
                                    size={28}
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
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                              rows={3}
                            />

                            {state && !state.success && (
                              <p className="text-sm text-danger mt-2 animate-fade-in">{state.message}</p>
                            )}
                            {state && state.success && (
                              <p className="text-sm text-success mt-2 animate-fade-in">{state.message}</p>
                            )}

                            <div className="flex gap-3 mt-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setExpandedReview(null);
                                }}
                                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 active:scale-[0.98] transition-all"
                              >
                                Batal
                              </button>
                              <button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                              >
                                <Send size={14} /> {isPending ? "Mengirim..." : "Kirim"}
                              </button>
                            </div>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
