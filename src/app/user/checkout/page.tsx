"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useActionState } from "react";
import Image from "next/image";
import { ChevronLeft, MapPin, Truck, Store, CreditCard } from "lucide-react";
import { getCommodityById } from "@/actions/commodity";
import { createOrder } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah } from "@/lib/format";
import { EmptyState, formatImage } from "@/components/shared/States";
import { useFetch } from "@/lib/hooks";
import type { ActionState } from "@/lib/types/auth";
import { Skeleton } from "@/components/ui/Skeleton";

function CheckoutSkeleton() {
  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <Skeleton className="h-40 rounded-card" />
        <Skeleton className="h-48 rounded-card" />
        <Skeleton className="h-44 rounded-card" />
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-72 rounded-card" />
      </div>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const commodityId = Number(searchParams.get("commodityId"));
  const initialQty = Number(searchParams.get("quantity")) || 1;

  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "expedition">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [quantity, setQuantity] = useState(initialQty);
  const [notes, setNotes] = useState("");

  const { data: product, loading } = useFetch(
    () =>
      commodityId
        ? getCommodityById(commodityId)
        : Promise.resolve(null),
    [commodityId],
  );

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, data: FormData) => {
      const user = getClientUser();
      if (!user) return { success: false, message: "Silakan masuk terlebih dahulu" };
      const res = await createOrder(user.id, data);
      if (res.success && res.redirect) router.push(res.redirect);
      return res;
    },
    null,
  );

  if (loading) return <CheckoutSkeleton />;

  if (!product) {
    return <EmptyState title="Produk Tidak Ditemukan" message="Pilih komoditas terlebih dahulu dari katalog." />;
  }

  const unitPrice = Number(product.price);
  const subtotal = unitPrice * quantity;
  const serviceFee = Math.round(subtotal * 0.025 * 100) / 100;
  const deliveryFee = deliveryMethod === "expedition" ? 25000 : 0;
  const total = subtotal + serviceFee + deliveryFee;

  const optionCls = (active: boolean) =>
    `rounded-xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.98] ${
      active
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-gray-200 hover:border-gray-300"
    }`;

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary active:scale-95 transition-all mb-6"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <form action={formAction} className="grid lg:grid-cols-5 gap-6">
        <input type="hidden" name="commodityId" value={product.id} />
        <input type="hidden" name="quantity" value={quantity} />
        <input type="hidden" name="deliveryMethod" value={deliveryMethod} />
        <input type="hidden" name="deliveryAddress" value={deliveryAddress} />
        <input type="hidden" name="paymentMethod" value={paymentMethod} />
        <input type="hidden" name="notes" value={notes} />

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Store size={18} className="text-primary" /> Produk
            </h2>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {formatImage(product.image) ? (
                  <Image
                    src={formatImage(product.image)!}
                    alt={product.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-3xl font-black">
                    {product.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin size={12} /> {product.location}
                </p>
                <p className="text-xs text-gray-500 mb-3">Petani: {product.farmerName}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">
                    {formatRupiah(unitPrice)} / {product.unit}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 border border-gray-200 rounded-full text-gray-500 hover:text-primary hover:border-primary active:scale-90 transition-all"
                      aria-label="Kurangi jumlah"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(Number(product.stock), q + 1))}
                      className="w-8 h-8 border border-gray-200 rounded-full text-gray-500 hover:text-primary hover:border-primary active:scale-90 transition-all"
                      aria-label="Tambah jumlah"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={18} className="text-primary" /> Metode Penerimaan
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod("pickup")}
                className={optionCls(deliveryMethod === "pickup")}
              >
                <p className="font-bold text-sm text-gray-800 mb-1">Pick Up</p>
                <p className="text-xs text-gray-500">Ambil langsung ke lokasi petani</p>
                <p className="text-xs font-semibold text-primary mt-1">Gratis</p>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod("expedition")}
                className={optionCls(deliveryMethod === "expedition")}
              >
                <p className="font-bold text-sm text-gray-800 mb-1">Jasa Ekspedisi</p>
                <p className="text-xs text-gray-500">Dikirim ke alamat Anda</p>
                <p className="text-xs font-semibold text-primary mt-1">Rp 25.000</p>
              </button>
            </div>

            {deliveryMethod === "expedition" && (
              <div className="mt-4 animate-fade-up">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Alamat Pengiriman *
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Nama penerima, alamat lengkap, kode pos"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  rows={3}
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-primary" /> Metode Pembayaran
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { id: "bank_transfer", label: "Transfer Bank" },
                { id: "virtual_account", label: "Virtual Account" },
                { id: "ewallet", label: "E-Wallet" },
                { id: "qris", label: "QRIS" },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all duration-200 ${
                    paymentMethod === m.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-3">Catatan (opsional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan untuk petani"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
              rows={2}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Subtotal ({quantity} {product.unit})
                </span>
                <span className="font-semibold">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Biaya Layanan (2.5%)</span>
                <span className="font-semibold">{formatRupiah(serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span className="font-semibold">{formatRupiah(deliveryFee)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-xl font-extrabold text-primary">{formatRupiah(total)}</span>
              </div>
            </div>

            {state && !state.success && (
              <p className="text-sm text-danger mb-3 animate-shake">{state.message}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Memproses..." : "Buat Pesanan"}
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              Dengan membuat pesanan, pembayaran dilakukan melalui metode yang Anda pilih.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}
