"use client";

import { useState, useEffect } from "react";
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
// import { getDataOrders } from "@/actions/orders/orders.action";
// import { getOrderUsersById } from "@/actions/orders/orders.action";
import { getUnpaid } from "@/actions/orders/orders.action";
import { getClientUser } from "@/lib/auth/client";
import { updatePaid } from "@/actions/orders/orders.action";

type DeliveryMethod = "pickup" | "expedition";

const PLATFORM_FEE = 2000;

type OrdersData = Awaited<ReturnType<typeof getUnpaid>>["data"];

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

export default function OrderPage() {
  useAuth();

  const router = useRouter();

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("pickup");

  const [deliveryAddress, setDeliveryAddress] = useState("");

  // const [entries, setEntries] = useState(() => getCart());

  const [isChecking, setIsChecking] = useState(false);

  // const [undoItem, setUndoItem] = useState<{
  //   entry: (typeof entries)[number];
  //   product: CommodityDetail;
  // } | null>(null);

  // =========================
  // DATA ORDERS DARI DATABASE
  // =========================

  const [orders, setOrders] = useState<OrdersData>([]);

  const user = getClientUser();

  console.log(user?.id);

  useEffect(() => {
    async function loadOrders() {
      try {
        if (!user?.id) return;

        const result = await getUnpaid(Number(user.id));

        console.log("DATA GET ALL ORDERS:", result);

        if (result.success) {
          setOrders(result.data);

          console.log("DATA ORDER:", result.data);
        }
      } catch (error) {
        console.error("Gagal mengambil orders:", error);
      }
    }

    loadOrders();
  }, [user?.id]);

  // =========================
  // AMBIL DATA COMMODITY
  // =========================

  // const idsKey = entries.map((e) => e.commodityId).join(",");

  // const { data: products, loading } = useFetch(async () => {
  //   if (entries.length === 0) {
  //     return [] as CommodityDetail[];
  //   }

  //   return (await getCommoditiesByIds(
  //     entries.map((e) => e.commodityId),
  //   )) as CommodityDetail[];
  // }, [idsKey]);

  // =========================
  // TOTAL
  // =========================

  const subtotal =
    orders?.reduce((sum, item) => {
      const unitPrice = Number(item.negotiatedPrice ?? item.product.price);

      return sum + unitPrice * item.quantity;
    }, 0) ?? 0;

  const totalItems =
    orders?.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0) ?? 0;

  const total = subtotal + PLATFORM_FEE;

  // =========================
  // CHECKOUT
  // =========================

  const checkout = async () => {
    if (orders?.length === 0 || isChecking) return;

    if (deliveryMethod === "expedition" && !deliveryAddress.trim()) {
      console.log("Alamat pengiriman wajib diisi");
      return;
    }

    setIsChecking(true);

    try {
      async function payment() {
        const result = await getUnpaid(Number(user?.id));

        console.log("RESULT:", result);

        if (!result.success) {
          console.log(result.message);
          return;
        }

        const orders = result.data;

        console.log("ORDERS:", orders);

        /*
         * orders adalah ARRAY.
         *
         * Contoh:
         *
         * [
         *   {
         *     commodityId: 1,
         *     quantity: 2,
         *     negotiatedPrice: "25000",
         *     product: {
         *       name: "Tomat",
         *       price: "30000"
         *     }
         *   },
         *   {
         *     commodityId: 2,
         *     quantity: 3,
         *     negotiatedPrice: "15000",
         *     product: {
         *       name: "Cabai",
         *       price: "20000"
         *     }
         *   }
         * ]
         *
         * Jadi jangan pakai:
         *
         * order.commodityId
         *
         * karena order adalah ARRAY.
         */

        const paymentItems = orders?.map((item) => {
          const unitPrice = Number(item.negotiatedPrice ?? item.product.price);

          return {
            commodityId: item.commodityId,
            name: item.product.name,
            price: unitPrice,
            quantity: item.quantity,
            subtotal: unitPrice * item.quantity,
          };
        });

        // const payemntData = orders?.map((items) => {
        //   return items.id;
        // });

        const itemID = orders?.map((items) => {
          return items.id;
        });

        const itemIdJoin = Number(itemID?.join(""));

        const comodityID = orders?.map((items) => {
          return items.commodityId;
        });

        const commodityIdJoin = Number(comodityID?.join(""));

        let Jumlah = PLATFORM_FEE;

        const itemPrice = orders?.map((items) => {
          Jumlah += Number(items.negotiatedPrice);
        });

        const qty = 1;
        // const itemQTY = orders?.map((items) => {
        //   qty += Number(items.quantity)
        // });

        console.log("id", itemID);
        console.log("idJoin", itemIdJoin);

        console.log("comodity", comodityID);
        console.log("comodityJoin", commodityIdJoin);

        console.log("price", total);

        console.log("qty", qty);

        console.log("jumlah", Jumlah);

        console.log("PAYMENT ITEMS:", paymentItems);
        const paymentSubtotal =
          paymentItems?.reduce((sum, item) => sum + item.subtotal, 0) ?? 0;

        const paymentTotal = paymentSubtotal + PLATFORM_FEE;

        console.log("PAYMENT SUBTOTAL:", paymentSubtotal);
        console.log("PAYMENT TOTAL:", paymentTotal);

        const response = await fetch("http://localhost:3000/api/tokenizer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: itemIdJoin,
            commodityId: commodityIdJoin,
            price: total,
            quantity: qty,
          }),
        });

        console.log("RESPONSE STATUS:", response.status);
        console.log("RESPONSE OK:", response.ok);

        const text = await response.json();

        console.log("RAW RESPONSE:", text);

        if (!response.ok) {
          console.log("API ERROR:", response);

          return;
        }

        console.log("TOKEN", text.token);

        // const datas = JSON.parse(text);

        // console.log("DATAS:", datas);

        if (text.redirect_url) {
          const update = await updatePaid(Number(user?.id));
          if (update.success) {
            console.log(update.message);

            window.location.href = text.redirect_url;
          }
        }
      }

      payment();
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  // if (loading) {
  //   return <CartSkeleton />;
  // }

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
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Anda</h1>

          <p className="text-sm text-gray-500">
            {totalItems > 0
              ? `${totalItems} kg komoditas di Pesanan`
              : "Belum ada komoditas di keranjang"}
          </p>
        </div>
      </div>

      {orders?.length === 0 ? (
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
                {orders?.map((item) => {
                  const unitPrice = Number(
                    item.negotiatedPrice ?? item.product.price,
                  );

                  const lineTotal = unitPrice * item.quantity;

                  const isNegotiated = item.negotiatedPrice != null;

                  const image = item.product.images?.[0];

                  return (
                    <li
                      key={item.commodityId}
                      className="flex items-center gap-4 px-6 py-5 hover:bg-primary/[0.02] transition-colors"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {image ? (
                          <Image
                            src={image}
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
                          {/* Petani: {item.product.farmerName} */}
                          Petani
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin size={12} className="text-success" />

                          {/* {item.product.location} */}
                        </p>

                        <div className="flex items-center justify-between mt-3 gap-3">
                          <div>
                            <span
                              className={`text-sm font-extrabold ${
                                isNegotiated ? "text-success" : "text-primary"
                              }`}
                            >
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

                          <span className="text-sm font-bold text-gray-800 w-24 text-right">
                            {formatRupiah(lineTotal)}
                          </span>
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
                  onChange={(e) =>
                    setDeliveryMethod(e.target.value as DeliveryMethod)
                  }
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
                  {deliveryMethod === "pickup" ? (
                    <Store size={18} />
                  ) : (
                    <Truck size={18} />
                  )}
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
              <h2 className="font-bold text-gray-900 mb-4">
                Ringkasan Belanja
              </h2>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal ({totalItems} kg)
                  </span>

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
    </div>
  );
}
