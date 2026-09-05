"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Package,
  RotateCcw,
} from "lucide-react";
import { getOrderById, syncPaymentStatus } from "@/actions/order";
import { formatRupiah, formatWeight, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { formatImage } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useAuth, useFetch } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";

let snapScriptPromise: Promise<void> | null = null;

function loadSnapScript(snapUrl: string): Promise<void> {
  if (typeof window === "undefined" || window.snap) return Promise.resolve();
  if (snapScriptPromise) return snapScriptPromise;
  snapScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ??
        process.env.MIDTRANS_CLIENTKEY ??
        process.env.NEXT_PUBLIC_CLIENT ??
        "",
    );
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      snapScriptPromise = null;
      reject(new Error("Gagal memuat Midtrans Snap"));
    };
    document.head.appendChild(script);
  });
  return snapScriptPromise;
}

type PayState = "idle" | "preparing" | "pending" | "error";

function PaymentSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <Skeleton className="mb-6 h-4 w-24" />
      <Skeleton className="mb-2 h-7 w-64" />
      <Skeleton className="mb-8 h-4 w-80" />

      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
            <Skeleton className="h-3.5 w-full max-w-xs" />
            <Skeleton className="h-3.5 w-full max-w-xs" />
            <Skeleton className="h-3.5 w-full max-w-xs" />
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function OrderPayment() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [payState, setPayState] = useState<PayState>("idle");
  const [payError, setPayError] = useState<string | null>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);

  const {
    data: order,
    loading,
    reload,
  } = useFetch(() => getOrderById(Number(id)), [id]);

  useEffect(() => {
    const tokenOrders = async () => {
      if (!order?.id) return;

      const storageKey = `midtrans_snap_token_${order.id}`;
      const savedToken = localStorage.getItem(storageKey);

      if (savedToken) {
        await setSnapToken(savedToken);
      }
    };
    tokenOrders();
  }, [order?.id]);

  const [syncing, setSyncing] = useState(false);
  const syncedRef = useRef(false);

  const sync = async () => {
    if (!order || syncing) return;
    setSyncing(true);
    try {
      await syncPaymentStatus(order.id);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
      reload();
    }
  };

  useEffect(() => {
    if (
      order &&
      order.paymentStatus !== "paid" &&
      order.paymentStatus !== "refunded" &&
      !syncedRef.current
    ) {
      syncedRef.current = true;
      sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, order?.paymentStatus]);

  if (loading) return <PaymentSkeleton />;

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-12 text-center">
          <p className="text-gray-500">Pesanan tidak ditemukan.</p>
          <Link
            href="/user/orders"
            className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Kembali ke Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const img =
    formatImage(order.commodityImage) ??
    formatImage(order.commodityImages?.[0] ?? null);

  const isPaid = order.paymentStatus === "paid";
  const isFailed = order.paymentStatus === "failed";
  const isRefunded = order.paymentStatus === "refunded";

  const payNow = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!order) return;

    if (payState === "preparing") return;

    setPayState("preparing");
    setPayError(null);

    try {
      const storageKey = `midtrans_snap_token_${order.id}`;

      /**
       * Urutan pencarian token:
       *
       * 1. React state
       * 2. localStorage
       * 3. Kalau tidak ada -> minta token baru ke backend
       */
      let token = snapToken;

      // Kalau state kosong, cek localStorage
      if (!token) {
        token = localStorage.getItem(storageKey);
      }

      /**
       * BELUM PUNYA TOKEN
       *
       * Baru request ke /api/tokenizer
       */
      if (!token) {
        const res = await fetch("/api/tokenizer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.token) {
          throw new Error(data.error ?? "Gagal menyiapkan pembayaran");
        }

        token = data.token;

        // Simpan ke React state
        setSnapToken(token);

        if (!token) {
          return console.log("ga ada token");
        }

        // Simpan ke localStorage
        localStorage.setItem(storageKey, token);

        // Load Snap JS
        await loadSnapScript(data.snapUrl);
      } else {
        /**
         * SUDAH PUNYA TOKEN
         *
         * Tidak perlu request /api/tokenizer lagi.
         * Langsung gunakan token yang tersimpan.
         */
        setSnapToken(token);

        await loadSnapScript(
          process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ??
            "https://app.sandbox.midtrans.com/snap/snap.js",
        );
      }

      // Pastikan TypeScript tahu token bukan null
      if (!token) {
        throw new Error("Snap token tidak tersedia");
      }

      setPayState("idle");

      window.snap?.pay(token, {
        /**
         * PEMBAYARAN BERHASIL
         */
        onSuccess: () => {
          // Token sudah tidak diperlukan
          localStorage.removeItem(storageKey);
          setSnapToken(null);

          setPayState("idle");

          sync();
        },

        /**
         * PEMBAYARAN PENDING
         *
         * Contoh:
         * - BCA VA
         * - Mandiri VA
         * - metode yang belum dibayar
         */
        onPending: () => {
          setPayState("pending");

          sync();
        },

        /**
         * ERROR DARI SNAP
         */
        onError: () => {
          setPayState("error");

          setPayError("Terjadi kesalahan saat memproses pembayaran.");

          sync();
        },

        /**
         * USER MENUTUP POPUP
         *
         * PENTING:
         * JANGAN hapus token di sini.
         *
         * Karena user mungkin cuma menutup popup
         * lalu ingin klik "Bayar Lagi".
         */
        onClose: () => {
          setPayState("idle");

          sync();
        },
      });
    } catch (error) {
      console.error("MIDTRANS PAYMENT ERROR:", error);

      setPayState("error");

      setPayError("Gagal menyiapkan pembayaran. Silakan coba lagi.");
    }
  };

  const checkStatus = () => {
    setPayState("idle");
    setPayError(null);
    sync();
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Pembayaran Pesanan
      </h1>
      <p className="mt-1 mb-8 text-sm text-gray-500">
        Selesaikan pembayaran untuk pesanan Anda.
      </p>

      {isPaid ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <CheckCircle2 className="text-green-600" size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            Pembayaran Berhasil
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Pembayaran untuk pesanan{" "}
            <span className="font-semibold text-gray-900">
              {order.orderCode}
            </span>{" "}
            telah berhasil diproses.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {order.paymentMethod
              ? `Dibayar via ${PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}`
              : ""}
          </p>
          <Link
            href={`/user/checkout/${order.id}`}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Lihat Detail Pesanan
          </Link>
        </div>
      ) : isRefunded ? (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <RotateCcw className="text-gray-500" size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            Pembayaran Dikembalikan
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Dana untuk pesanan{" "}
            <span className="font-semibold text-gray-900">
              {order.orderCode}
            </span>{" "}
            telah dikembalikan.
          </p>
          <Link
            href={`/user/checkout/${order.id}`}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Lihat Detail Pesanan
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400">
                Pesanan
              </p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">
                {order.orderCode}
              </p>
            </div>
            <StatusBadge status={order.paymentStatus ?? "pending"} />
          </div>

          <div className="px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
                {img ? (
                  <Image
                    src={img}
                    alt={order.commodityName ?? "Komoditas"}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
                    <Package size={24} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-gray-900">
                  {order.commodityName}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatWeight(order.quantity, order.commodityUnit)} ×{" "}
                  {formatRupiah(order.unitPrice)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Petani: {order.farmerName}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatRupiah(order.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Biaya Layanan</span>
                <span className="font-semibold text-gray-900">
                  {formatRupiah(order.serviceFee)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span className="font-semibold text-gray-900">
                  {formatRupiah(order.deliveryFee)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="font-bold text-gray-900">
                  Total Pembayaran
                </span>
                <span className="text-xl font-extrabold text-primary">
                  {formatRupiah(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/40 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-xs text-gray-500 sm:max-w-xs">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>
                Anda akan diarahkan ke sistem pembayaran Midtrans untuk
                menyelesaikan transaksi. Status diperbarui otomatis dari
                Midtrans.
              </span>
            </div>

            {payState === "pending" ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                <Clock size={16} /> Pembayaran sedang diproses
              </div>
            ) : (
              <button
                onClick={payNow}
                disabled={payState === "preparing"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed sm:shrink-0"
              >
                {payState === "preparing" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Menyiapkan
                    Pembayaran...
                  </>
                ) : isFailed ? (
                  "Bayar Lagi"
                ) : (
                  "Bayar Sekarang"
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {payState === "error" && payError && (
        <div className="mt-4 bg-white border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">Pembayaran Gagal</p>
            <p className="mt-0.5 text-sm text-red-600">{payError}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={payNow}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary"
              >
                Coba Lagi
              </button>
              <Link
                href="/user/orders"
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary"
              >
                Kembali ke Pesanan
              </Link>
            </div>
          </div>
        </div>
      )}

      {payState === "pending" && (
        <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-3">
          <Clock className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">
              Pembayaran Menunggu
            </p>
            <p className="mt-0.5 text-sm text-gray-500">
              Pembayaran belum dikonfirmasi. Anda dapat memeriksa status
              pembayaran setelah Midtrans mengirimkan konfirmasi.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={checkStatus}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
              >
                Cek Status Pembayaran
              </button>
              <Link
                href="/user/orders"
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary"
              >
                Kembali ke Pesanan
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
