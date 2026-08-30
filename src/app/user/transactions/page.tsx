"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  History,
  Package,
  Send,
  ShoppingCart,
  Star,
  Wallet,
  X,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { getUserOrders } from "@/actions/order";
import { getReviewsByBuyer, createReview } from "@/actions/review";
import { getClientUser } from "@/lib/auth/client";
import {
  formatDate,
  formatNumber,
  formatRupiah,
  PAYMENT_STATUS_LABEL,
} from "@/lib/format";
import { EmptyState, formatImage } from "@/components/shared/States";
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

const cardCls = "rounded-2xl border border-gray-200/80 bg-white";

/* ============================================================
   Skeleton — meniru struktur halaman sesungguhnya
   ============================================================ */
function TransactionsSkeleton() {
  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-1 mb-6 h-4 w-72" />

      {/* Statistik */}
      <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-gray-200/80 bg-white px-5 py-4 sm:grid-cols-4 sm:px-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="mt-1 h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Header daftar */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-1 h-3 w-56" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Kartu transaksi */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={`${cardCls} mb-4 overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-5 py-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-16 w-16 shrink-0 rounded-xl sm:h-[72px] sm:w-[72px]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-right">
              <Skeleton className="ml-auto h-3 w-12" />
              <Skeleton className="ml-auto mt-1 h-5 w-20" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Statistik ringkas (selaras dashboard petani)
   ============================================================ */
function StatTile({
  icon,
  label,
  value,
  valueClassName = "text-neutral-900",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <p className={`text-2xl font-bold tracking-tight ${valueClassName}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs font-medium text-gray-500">{label}</p>
    </div>
  );
}

/* ============================================================
   Kartu transaksi
   ============================================================ */
function OrderCard({
  order,
  index,
  existingReview,
  expanded,
  rating,
  hoverRating,
  comment,
  onExpanded,
  onRating,
  onHoverRating,
  onComment,
  onCancel,
  state,
  isPending,
  formAction,
}: {
  order: BuyerOrder;
  index: number;
  existingReview: BuyerReview | undefined;
  expanded: boolean;
  rating: number;
  hoverRating: number;
  comment: string;
  onExpanded: () => void;
  onRating: (n: number) => void;
  onHoverRating: (n: number) => void;
  onComment: (v: string) => void;
  onCancel: () => void;
  state: ActionState | null;
  isPending: boolean;
  formAction: (payload: FormData) => void;
}) {
  const isCompleted = order.status === "completed";
  const img =
    formatImage(order.commodityImage) ??
    formatImage(order.commodityImages?.[0] ?? null);

  const startReview = () => {
    onExpanded();
    onRating(5);
    onComment("");
  };

  return (
    <div
      className={`${cardCls} overflow-hidden transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-lift animate-fade-up`}
      style={{
        animationDelay: `${Math.min(index * 60, 360)}ms`,
        animationFillMode: "backwards",
      }}
    >
      {/* Header order */}
      <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-gray-100 bg-gray-50/70 px-5 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5 text-gray-500">
            <Clock size={15} className="text-primary" />
            {formatDate(order.createdAt)}
          </span>
          <span aria-hidden className="text-gray-300">·</span>
          <span className="truncate font-semibold text-gray-700">
            {order.orderCode}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Produk */}
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <Link
            href={`/user/checkout/${order.id}`}
            className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-primary/10 ring-1 ring-gray-100 transition-transform duration-300 hover:scale-[1.03] sm:h-[72px] sm:w-[72px]"
            aria-label={`Detail pesanan ${order.commodityName}`}
          >
            {img ? (
              <Image
                src={img}
                alt={order.commodityName}
                fill
                sizes="72px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-primary">
                <Package size={24} />
              </div>
            )}
          </Link>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-gray-900">
              {order.commodityName}
            </p>
            <p className="mt-0.5 text-sm text-gray-500">
              {formatNumber(order.quantity)} kg × {formatRupiah(order.unitPrice)}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-400">
              Petani: {order.farmerName}
            </p>
          </div>
        </div>

        <div className="shrink-0 sm:ml-auto sm:text-right">
          <p className="text-xs text-gray-400">Total</p>
          <p className="mt-0.5 text-lg font-extrabold tracking-tight text-primary">
            {formatRupiah(order.totalPrice)}
          </p>
        </div>
      </div>

      {/* Footer: pembayaran + aksi */}
      <div className="flex flex-col gap-2.5 rounded-b-2xl border-t border-gray-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-gray-500">
          Pembayaran
          <span aria-hidden className="text-gray-300">·</span>
          <StatusBadge
            status={order.paymentStatus ?? "pending"}
            label={PAYMENT_STATUS_LABEL[order.paymentStatus ?? "pending"]}
          />
        </p>
        <Link
          href={`/user/checkout/${order.id}`}
          className="inline-flex items-center justify-center gap-1 self-start rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary sm:self-auto"
        >
          Lihat Detail
          <ChevronRight size={13} />
        </Link>
      </div>

      {/* Ulasan */}
      {isCompleted && (
        <ReviewArea
          existingReview={existingReview}
          expanded={expanded}
          rating={rating}
          hoverRating={hoverRating}
          comment={comment}
          onStart={startReview}
          onRating={onRating}
          onHoverRating={onHoverRating}
          onComment={onComment}
          onCancel={onCancel}
          state={state}
          isPending={isPending}
          formAction={formAction}
          orderId={order.id}
        />
      )}
    </div>
  );
}

/* ============================================================
   Area ulasan (hanya order selesai)
   ============================================================ */
function ReviewArea({
  existingReview,
  expanded,
  rating,
  hoverRating,
  comment,
  onStart,
  onRating,
  onHoverRating,
  onComment,
  onCancel,
  state,
  isPending,
  formAction,
  orderId,
}: {
  existingReview: BuyerReview | undefined;
  expanded: boolean;
  rating: number;
  hoverRating: number;
  comment: string;
  onStart: () => void;
  onRating: (n: number) => void;
  onHoverRating: (n: number) => void;
  onComment: (v: string) => void;
  onCancel: () => void;
  state: ActionState | null;
  isPending: boolean;
  formAction: (payload: FormData) => void;
  orderId: number;
}) {
  if (existingReview) {
    return (
      <div className="border-t border-gray-100 bg-primary/[0.04] px-5 py-4">
        <div className="flex items-start gap-2.5">
          <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                aria-hidden
                className={
                  star <= existingReview.rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                }
              />
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700">
              Ulasan Anda · {existingReview.rating}/5
            </p>
            {existingReview.comment && (
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                “{existingReview.comment}”
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="border-t border-gray-100 bg-primary/[0.04] px-5 py-3">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98]"
        >
          <Star size={14} className="fill-amber-400 text-amber-400" />
          Beri ulasan
        </button>
      </div>
    );
  }

  const form = (
    <form
      action={formAction}
      className="flex max-h-full flex-col overflow-y-auto rounded-2xl border border-gray-200/80 bg-white shadow-lift"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <p className="text-base font-bold text-gray-900">Beri Ulasan</p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup form ulasan"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 px-6 py-5">
        <p className="text-sm text-gray-500">
          Bagaimana pengalaman Anda berbelanja?
        </p>

        <input type="hidden" name="orderId" value={orderId} />

        <div
          className="mt-4 flex gap-2"
          role="radiogroup"
          aria-label="Nilai ulasan"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`Beri ${star} bintang`}
              onClick={() => onRating(star)}
              onMouseEnter={() => onHoverRating(star)}
              onMouseLeave={() => onHoverRating(0)}
              className="transition-transform duration-150 hover:scale-125 active:scale-95"
            >
              <Star
                size={30}
                className={
                  (hoverRating || rating) >= star
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                }
              />
            </button>
          ))}
        </div>

        <textarea
          name="comment"
          value={comment}
          onChange={(e) => onComment(e.target.value)}
          placeholder="Tulis ulasan Anda di sini..."
          rows={4}
          autoFocus
          className="mt-4 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        />

        {state && !state.success && (
          <p className="mt-2 text-sm text-danger animate-fade-in">{state.message}</p>
        )}
        {state && state.success && (
          <p className="mt-2 text-sm text-success animate-fade-in">{state.message}</p>
        )}
      </div>

      <div className="flex gap-2.5 border-t border-gray-100 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 active:scale-[0.98]"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50"
        >
          <Send size={14} />
          {isPending ? "Mengirim..." : "Kirim Ulasan"}
        </button>
      </div>
    </form>
  );

  return (
    typeof document !== "undefined" &&
    createPortal(
      <div className="fixed inset-0 z-[100] grid w-screen max-w-none place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm animate-fade-in sm:p-6">
        <div
          className="w-full max-w-lg animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {form}
        </div>
      </div>,
      document.body,
    )
  );
}

/* ============================================================
   Halaman
   ============================================================ */
export default function UserTransactions() {
  const user = getClientUser();
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (expandedReview === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [expandedReview]);

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
  const totalSpent = paidOrders.reduce(
    (acc, o) => acc + Number(o.totalPrice),
    0,
  );
  const completedCount = orderList.filter((o) => o.status === "completed").length;
  const awaitingCount = orderList.filter(
    (o) => (o.paymentStatus ?? "pending") !== "paid",
  ).length;

  return (
    <div className="min-h-screen animate-fade-up">
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <PageHeader
          icon={History}
          title="Riwayat Transaksi"
          subtitle="Semua aktivitas pembelian dan transaksi Anda."
        />

        {/* Statistik ringkas */}
        <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-gray-200/80 bg-white px-5 py-4 sm:grid-cols-4 sm:px-6">
          <StatTile
            icon={<ShoppingCart size={17} />}
            label="Total Transaksi"
            value={<CountUp value={orderList.length} />}
          />
          <div className="lg:border-l lg:border-gray-100 lg:pl-6">
            <StatTile
              icon={<Wallet size={17} />}
              label="Total Pengeluaran"
              value={<CountUp value={totalSpent} prefix="Rp " />}
              valueClassName="text-primary"
            />
          </div>
          <div className="lg:border-l lg:border-gray-100 lg:pl-6">
            <StatTile
              icon={<CheckCircle2 size={17} />}
              label="Selesai"
              value={<CountUp value={completedCount} />}
            />
          </div>
          <div className="lg:border-l lg:border-gray-100 lg:pl-6">
            <StatTile
              icon={<Clock size={17} />}
              label="Menunggu Pembayaran"
              value={<CountUp value={awaitingCount} />}
            />
          </div>
        </div>

        {orderList.length === 0 ? (
          <EmptyState
            title="Belum Ada Transaksi"
            message="Pesanan yang Anda buat akan muncul di sini."
          >
            <Link
              href="/user/home"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-[0.98]"
            >
              Mulai Belanja
            </Link>
          </EmptyState>
        ) : (
          <section>
            {/* Header daftar */}
            <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                  Riwayat Pesanan
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Semua aktivitas pembelian Anda.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                {formatNumber(orderList.length)} transaksi
              </span>
            </div>

            <div className="space-y-4">
              {orderList.map((o, i) => {
                const isExpanded = expandedReview === o.id;
                return (
                  <OrderCard
                    key={o.id}
                    order={o}
                    index={i}
                    existingReview={reviewMap.get(o.id)}
                    expanded={isExpanded}
                    rating={rating}
                    hoverRating={hoverRating}
                    comment={comment}
                    onExpanded={() => setExpandedReview(o.id)}
                    onRating={setRating}
                    onHoverRating={setHoverRating}
                    onComment={setComment}
                    onCancel={() => setExpandedReview(null)}
                    state={state}
                    isPending={isPending}
                    formAction={formAction}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
