"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  Truck,
  Store,
  ChevronDown,
  ShoppingBag,
  MapPin,
  Check,
  Sprout,
  ChevronLeft,
  Undo2,
} from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { getCommoditiesByIds } from "@/actions/commodity";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  saveCheckoutSnapshot,
} from "@/lib/cart";
import { useAuth, useFetch } from "@/lib/hooks";
import { EmptyState, formatImage } from "@/components/shared/States";
import type { CommodityDetail } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

type DeliveryMethod = "pickup" | "expedition";

const PLATFORM_FEE = 2000;

function CartSkeleton() {
  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-10 gap-6">
      <div className="lg:col-span-7 space-y-6">
        <Skeleton className="h-64 rounded-card" />
        <Skeleton className="h-48 rounded-card" />
      </div>
      <div className="lg:col-span-3">
        <Skeleton className="h-72 rounded-card" />
      </div>
    </div>
  );
}

export default function CartPage() {
  useAuth();
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [entries, setEntries] = useState(() => getCart());
  const [isChecking, setIsChecking] = useState(false);
  const [undoItem, setUndoItem] = useState<{
    entry: (typeof entries)[number];
    product: CommodityDetail;
  } | null>(null);

  const idsKey = entries.map((e) => e.commodityId).join(",");

  const { data: products, loading } = useFetch(
    async () => {
      if (entries.length === 0) return [] as CommodityDetail[];
      return (await getCommoditiesByIds(
        entries.map((e) => e.commodityId),
      )) as CommodityDetail[];
    },
    [idsKey],
  );

  type CartItem = { product: CommodityDetail; quantity: number; negotiatedPrice?: number };

  const items: CartItem[] = entries
    .map((entry) => {
      const product = products?.find((p) => p.id === entry.commodityId);
      if (!product) return null;
      const item: CartItem = { product, quantity: entry.quantity };
      if (entry.negotiatedPrice !== undefined) {
        item.negotiatedPrice = entry.negotiatedPrice;
      }
      return item;
    })
    .filter((i): i is CartItem => i !== null);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.negotiatedPrice ?? Number(i.product.price)) * i.quantity,
    0,
  );
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = subtotal + PLATFORM_FEE;

  const changeQuantity = (commodityId: number, delta: number) => {
    const product = items.find((i) => i.product.id === commodityId)?.product;
    const current = entries.find((e) => e.commodityId === commodityId)?.quantity ?? 1;
    if (!product) return;
    const next = Math.min(Math.max(current + delta, 1), Number(product.stock));
    updateCartQuantity(commodityId, next);
    setEntries(getCart());
  };

  const removeItem = (commodityId: number) => {
    const item = items.find((i) => i.product.id === commodityId);
    if (!item) return;
    removeFromCart(commodityId);
    setEntries(getCart());
    setUndoItem({ entry: { commodityId, quantity: item.quantity, negotiatedPrice: item.negotiatedPrice }, product: item.product });
    setTimeout(() => setUndoItem(null), 5000);
  };

  const undoRemove = () => {
    if (!undoItem) return;
    const { entry } = undoItem;
    const cart = getCart();
    cart.push(entry);
    localStorage.setItem("kd_cart", JSON.stringify(cart));
    setEntries(getCart());
    setUndoItem(null);
  };

  const checkout = async () => {
    if (items.length === 0 || isChecking) return;
    setIsChecking(true);
    try {
      saveCheckoutSnapshot(
        items.map((item) => ({
          commodityId: item.product.id,
          quantity: item.quantity,
          negotiatedPrice: item.negotiatedPrice,
        })),
      );
      router.push("/user/checkout");
    } finally {
      setIsChecking(false);
    }
  };

  if (loading) return <CartSkeleton />;

  return (
    <div className="max-w-6xl mx-auto animate-fade-up">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary active:scale-95 transition-all mb-6"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-success text-white rounded-xl flex items-center justify-center shadow-sm">
          <ShoppingBag size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
          <p className="text-sm text-gray-500">
            {totalItems > 0
              ? `${totalItems} kg komoditas di keranjang`
              : "Belum ada komoditas di keranjang"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Keranjang Kosong"
          message="Yuk mulai belanja komoditas segar langsung dari petani."
        >
          <Link
            href="/user/home"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark active:scale-95 transition-all duration-200"
          >
            <Sprout size={18} /> Lihat Komoditas
          </Link>
        </EmptyState>
      ) : (
        <div className="grid lg:grid-cols-10 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">
                  Daftar Komoditas
                  <span className="ml-2 text-sm font-medium text-gray-400">
                    ({totalItems} kg)
                  </span>
                </h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {items.map((item) => {
                  const img = formatImage(item.product.image) ?? formatImage(item.product.images?.[0] ?? null);
                  const unitPrice = item.negotiatedPrice ?? Number(item.product.price);
                  const lineTotal = unitPrice * item.quantity;
                  const isNegotiated = item.negotiatedPrice !== undefined;
                  return (
                    <li key={item.product.id} className="flex items-center gap-4 px-6 py-5 hover:bg-primary/[0.02] transition-colors">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {img ? (
                          <Image
                            src={img}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            sizes="80px"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-black">
                            {item.product.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Petani: {item.product.farmerName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin size={12} className="text-success" />
                          {item.product.location}
                        </p>
                        <div className="flex items-center justify-between mt-3 gap-3">
                          <div>
                            <span className={`text-sm font-extrabold ${isNegotiated ? "text-success" : "text-primary"}`}>
                              {formatRupiah(unitPrice)}
                              <span className="text-[11px] font-medium text-gray-400">
                                {" "}
                                / {item.product.unit}
                              </span>
                            </span>
                            {isNegotiated && (
                              <span className="ml-2 text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full font-medium">
                                Harga Nego
                              </span>
                            )}
                          </div>
                          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                            <button
                              type="button"
                              onClick={() => changeQuantity(item.product.id, -1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary active:scale-90 disabled:opacity-40 transition-all"
                              aria-label="Kurangi jumlah"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeQuantity(item.product.id, 1)}
                              disabled={item.quantity >= Number(item.product.stock)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary active:scale-90 disabled:opacity-40 transition-all"
                              aria-label="Tambah jumlah"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-gray-800 w-24 text-right">
                            {formatRupiah(lineTotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 active:scale-90 transition-all"
                            aria-label={`Hapus ${item.product.name}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck size={18} className="text-primary" />
                Pilih Metode Pengiriman
              </h2>
              <div className="relative">
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                >
                  <option value="pickup">Ambil Sendiri / Pick Up</option>
                  <option value="expedition">Jasa Ekspedisi</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-xl bg-gray-50 p-4 animate-fade-in">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  {deliveryMethod === "pickup" ? <Store size={18} /> : <Truck size={18} />}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">
                    {deliveryMethod === "pickup"
                      ? "Ambil Sendiri / Pick Up"
                      : "Jasa Ekspedisi"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {deliveryMethod === "pickup"
                      ? "Ambil langsung di lokasi petani. Gratis biaya pengiriman."
                      : "Pesanan diantar ke alamat tujuan Anda."}
                  </p>
                </div>
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
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-card border border-gray-200/80 shadow-soft p-6 lg:sticky lg:top-24">
              <h2 className="font-bold text-gray-900 mb-4">Ringkasan Belanja</h2>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({totalItems} kg)</span>
                  <span className="font-semibold text-gray-800">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Biaya Layanan Aplikasi</span>
                  <span className="font-semibold text-gray-800">
                    {formatRupiah(PLATFORM_FEE)}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total Harga</span>
                  <span className="text-xl font-extrabold text-primary">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={checkout}
                disabled={isChecking}
                className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChecking ? "Memproses..." : "Bayar Sekarang"}
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <Check size={12} className="text-success" />
                Pembayaran aman & transaksi terlindungi
              </p>
            </div>
          </div>
        </div>
      )}

      {undoItem && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3 shadow-lift">
            <span className="text-sm text-white">
              {undoItem.product.name} dihapus
            </span>
            <button
              type="button"
              onClick={undoRemove}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20 active:scale-95 transition-all"
            >
              <Undo2 size={14} /> Urungkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
