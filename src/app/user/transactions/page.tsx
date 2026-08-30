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
  Star,
  Wallet,
  X,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import TransactionTabs from "@/components/userpage/TransactionTabs";
import { getUserOrders } from "@/actions/order";
import { getReviewsByBuyer, createReview } from "@/actions/review";
import { getClientUser } from "@/lib/auth/client";
import {
  formatDate,
  formatNumber,
  formatRupiah,
  PAYMENT_METHOD_LABEL,
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

/* ============================================================
   Skeleton
   ============================================================ */
function TransactionsSkeleton() {
  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Skeleton className="mb-1 h-8 w-56" />
        <Skeleton className="mb-4 h-4 w-72" />

        <div className="mb-6 flex items-center gap-6 border-b border-gray-200">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-12" />
        </div>

        <div className="mb-6 flex flex-wrap gap-x-6 gap-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="mt-1 h-3 w-20" />
            </div>
          ))}
        </div>

        <div className="divide-y divide-gray-200">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-6">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="mt-5 flex items-start gap-4">
                <Skeleton className="h-20 w-20 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="hidden shrink-0 space-y-2 text-right sm:block">
                  <Skeleton className="ml-auto h-3 w-20" />
                  <Skeleton className="ml-auto h-4 w-24" />
                  <Skeleton className="ml-auto mt-3 h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Statistik ringkas
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
      <div className="mb-1.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
   Transaksi sukses (baris flat, bukan card)
   ============================================================ */
function TransactionRow({
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
  const payLabel =
    PAYMENT_STATUS_LABEL[order.paymentStatus ?? "pending"] ?? "Lunas";
  const payMethod = order.paymentMethod
    ? PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod
    : null;

  const startReview = () => {
    onExpanded();
    onRating(5);
    onComment("");
  };

  return (
    <section
      className="py-6 animate-fade-up"
      style={{
        animationDelay: `${Math.min(index * 50, 250)}ms`,
        animationFillMode: "backwards",
      }}
      aria-label={`Transaksi ${order.orderCode}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {order.orderCode}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge
          status={order.paymentStatus ?? "paid"}
          label={payLabel}
        />
      </div>

      {/* Produk */}
      <div className="mt-5 flex items-start gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
          {img ? (
            <Image
              src={img}
              alt={order.commodityName}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
              <Package size={22} strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-gray-900">
            {order.commodityName}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {formatNumber(order.quantity)} kg × {formatRupiah(order.unitPrice)}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Petani: {order.farmerName}
          </p>
          {payMethod && (
            <p className="mt-0.5 text-xs text-gray-400">
              Pembayaran: {payMethod}
            </p>
          )}
        </div>

        {/* Total + aksi — desktop */}
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-[11px] uppercase tracking-wider text-gray-400">
            Total
          </p>
          <p className="mt-1 text-lg font-extrabold text-primary">
            {formatRupiah(order.totalPrice)}
          </p>
          <Link
            href={`/user/checkout/${order.id}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 hover:text-primary-dark transition-colors"
          >
            Lihat Detail <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Total + aksi — mobile */}
      <div className="mt-4 flex items-end justify-between gap-3 sm:hidden">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-gray-400">
            Total
          </p>
          <p className="mt-1 text-lg font-extrabold text-primary">
            {formatRupiah(order.totalPrice)}
          </p>
        </div>
        <Link
          href={`/user/checkout/${order.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 hover:text-primary-dark transition-colors"
        >
          Lihat Detail <ChevronRight size={16} />
        </Link>
      </div>

      {/* Ulasan — hanya order selesai */}
      {isCompleted && (
        <div className={existingReview ? "mt-4" : "mt-2"}>
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
        </div>
      )}
    </section>
  );
}

/* ============================================================
   Area ulasan (modal)
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
      <div className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
        <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={star <= existingReview.rating}
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
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98]"
      >
        <StarIcon filled />
        Beri ulasan
      </button>
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
        <input type="hidden" name="rating" value={rating} />

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
              <StarIcon
                size={30}
                filled={(hoverRating || rating) >= star}
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
          <p className="mt-2 text-sm text-danger animate-fade-in">
            {state.message}
          </p>
        )}
        {state && state.success && (
          <p className="mt-2 text-sm text-success animate-fade-in">
            {state.message}
          </p>
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

function StarIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <Star
      size={size}
      aria-hidden
      className={
        filled ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
      }
    />
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
  const completedCount = paidOrders.filter(
    (o) => o.status === "completed",
  ).length;

  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8 animate-fade-up">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          icon={History}
          title="Riwayat Transaksi"
          subtitle="Semua pembayaran yang berhasil."
        />

        <TransactionTabs active="transactions" />

        {/* Statistik ringkas */}
        <div className="mb-6 flex flex-wrap gap-x-10 gap-y-5">
          <StatTile
            icon={<Wallet size={17} />}
            label="Total Pengeluaran"
            value={<CountUp value={totalSpent} prefix="Rp " />}
            valueClassName="text-primary"
          />
          <StatTile
            icon={<CheckCircle2 size={17} />}
            label="Selesai"
            value={<CountUp value={completedCount} />}
          />
          <StatTile
            icon={<Clock size={17} />}
            label="Total Transaksi"
            value={<CountUp value={paidOrders.length} />}
          />
        </div>

        {paidOrders.length === 0 ? (
          <EmptyState
            title="Belum Ada Riwayat Transaksi"
            message="Transaksi pembayaran yang berhasil akan muncul di sini."
          >
            <Link
              href="/user/home"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-[0.98]"
            >
              Cari Komoditas
            </Link>
          </EmptyState>
        ) : (
          <section>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                  Transaksi Berhasil
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Pembayaran Anda yang telah lunas.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                {formatNumber(paidOrders.length)} transaksi
              </span>
            </div>

            <div className="border-b border-gray-200">
              {paidOrders.map((o, i) => {
                const isExpanded = expandedReview === o.id;
                return (
                  <TransactionRow
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
