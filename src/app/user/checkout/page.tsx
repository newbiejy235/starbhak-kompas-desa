"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import Image from "next/image";
import { ChevronLeft, MapPin, Truck, Store, CreditCard, Trash2 } from "lucide-react";
import { getCommoditiesByIds } from "@/actions/commodity";
import { createOrders } from "@/actions/order";
import { useAuth } from "@/lib/hooks";
import {
  getCheckoutSnapshot,
  clearCheckoutSnapshot,
  type CheckoutSnapshotItem,
} from "@/lib/cart";
import { formatRupiah } from "@/lib/format";
import { EmptyState, formatImage } from "@/components/shared/States";
import type { ActionState } from "@/lib/types/auth";
import { Skeleton } from "@/components/ui/Skeleton";

type Product = Awaited<ReturnType<typeof getCommoditiesByIds>>[number];

type CheckoutItem = CheckoutSnapshotItem & { product: Product };

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
  const router = useRouter();
  const { user } = useAuth();
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "expedition">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const snapshot = getCheckoutSnapshot();
    if (snapshot.length === 0) {
      router.replace("/user/cart");
      return;
    }

    const ids = snapshot.map((s) => s.commodityId);
    getCommoditiesByIds(ids)
      .then((products) => {
        const productMap = new Map(products.map((p) => [p.id, p]));
        const items: CheckoutItem[] = snapshot
          .map((s) => {
            const product = productMap.get(s.commodityId);
            if (!product) return null;
            return { ...s, product };
          })
          .filter(Boolean) as CheckoutItem[];
        setCheckoutItems(items);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const removeItem = (commodityId: number) => {
    const updated = checkoutItems.filter((i) => i.product.id !== commodityId);
    if (updated.length === 0) {
      clearCheckoutSnapshot();
      router.replace("/user/cart");
      return;
    }
    setCheckoutItems(updated);
  };

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState | null, _data: FormData) => {
      if (!user) return { success: false, message: "Silakan masuk terlebih dahulu" };
      const items = checkoutItems.map((ci) => ({
        commodityId: ci.product.id,
        quantity: ci.quantity,
        negotiatedPrice: ci.negotiatedPrice,
      }));

      const res = await createOrders(
        user.id,
        items,
        deliveryMethod,
        deliveryAddress,
        paymentMethod,
        notes,
      );

      if (res.success) {
        clearCheckoutSnapshot();
        if (res.redirect) router.push(res.redirect);
      }
      return res;
    },
    null,
  );

  if (loading) return <CheckoutSkeleton />;

  if (checkoutItems.length === 0) {
    return (
      <EmptyState
        title="Keranjang Kosong"
        message="Tambahkan komoditas terlebih dahulu dari katalog."
      />
    );
  }

  const optionCls = (active: boolean) =>
    `rounded-xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.98] ${
      active
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-gray-200 hover:border-gray-300"
    }`;

  const grandSubtotal = checkoutItems.reduce(
    (sum, ci) => sum + (ci.negotiatedPrice ?? Number(ci.product.price)) * ci.quantity,
    0,
  );
  const grandServiceFee = Math.round(grandSubtotal * 0.025 * 100) / 100;
  const deliveryFee = deliveryMethod === "expedition" ? 25000 : 0;
  const grandTotal = grandSubtotal + grandServiceFee + deliveryFee;

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <button
        onClick={() => {
          clearCheckoutSnapshot();
          router.back();
        }}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary active:scale-95 transition-all mb-6"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Checkout ({checkoutItems.length} produk)
      </h1>

      <form action={formAction} className="grid lg:grid-cols-5 gap-6">
        <input type="hidden" name="deliveryMethod" value={deliveryMethod} />
        <input type="hidden" name="deliveryAddress" value={deliveryAddress} />
        <input type="hidden" name="paymentMethod" value={paymentMethod} />
        <input type="hidden" name="notes" value={notes} />

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Store size={18} className="text-primary" /> Produk
            </h2>
            <div className="space-y-4">
              {checkoutItems.map((ci) => {
                const unitPrice = ci.negotiatedPrice ?? Number(ci.product.price);
                const itemSubtotal = unitPrice * ci.quantity;
                return (
                  <div
                    key={ci.product.id}
                    className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {formatImage(ci.product.image) ?? formatImage(ci.product.images?.[0] ?? null) ? (
                        <Image
                          src={formatImage(ci.product.image) ?? formatImage(ci.product.images?.[0] ?? null)!}
                          alt={ci.product.name}
                          width={80}
                          height={80}
                          sizes="80px"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-black">
                          {ci.product.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">
                            {ci.product.name}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={12} /> {ci.product.location}
                          </p>
                          <p className="text-xs text-gray-500">
                            Petani: {ci.product.farmerName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(ci.product.id)}
                          className="text-gray-400 hover:text-danger active:scale-90 transition-all flex-shrink-0"
                          aria-label={`Hapus ${ci.product.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-primary">
                          {formatRupiah(unitPrice)} / {ci.product.unit}
                        </span>
                        <span className="text-sm text-gray-600">
                          {ci.quantity} {ci.product.unit} ={" "}
                          <span className="font-semibold text-gray-800">
                            {formatRupiah(itemSubtotal)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
            <div className="space-y-2 text-sm mb-4">
              {checkoutItems.map((ci) => {
                const unitPrice = ci.negotiatedPrice ?? Number(ci.product.price);
                return (
                  <div key={ci.product.id} className="flex justify-between gap-2">
                    <span className="text-gray-500 truncate">
                      {ci.product.name} x{ci.quantity}
                    </span>
                    <span className="font-semibold whitespace-nowrap">
                      {formatRupiah(unitPrice * ci.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">{formatRupiah(grandSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Biaya Layanan (2.5%)</span>
                <span className="font-semibold">{formatRupiah(grandServiceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span className="font-semibold">{formatRupiah(deliveryFee)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-xl font-extrabold text-primary">
                  {formatRupiah(grandTotal)}
                </span>
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
