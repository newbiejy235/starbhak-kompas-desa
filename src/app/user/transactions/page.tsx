"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, History } from "lucide-react";
import { getUserOrders } from "@/actions/order";
import {
  formatRupiah,
  formatDateTime,
  PAYMENT_METHOD_LABEL,
} from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { useAuth, useFetch } from "@/lib/hooks";
import type { BuyerOrder } from "@/lib/types/market";
import CountUp from "@/components/ui/CountUp";
import { Skeleton } from "@/components/ui/Skeleton";
import { getPaidUsers } from "@/actions/orders/orders.action";
import { getPaidOrders } from "@/service/orders.service";

type OrdersData = Awaited<ReturnType<typeof getPaidOrders>>["data"];

function TransactionsSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      <Skeleton className="mb-6 h-[104px] rounded-card" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-card border border-gray-200/80 bg-white p-5"
          >
            <div className="flex min-w-0 items-center gap-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <Skeleton className="h-5 w-24 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserTransactions() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrdersData>([]);

  useEffect(() => {
    async function loadOrders() {
      try {
        if (!user?.id) return;

        const result = await getPaidOrders(Number(user.id));

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

  const spendTotal = useMemo(() => {
    const subtotal = (orders ?? []).reduce((sum, item) => {
      const unitPrice = Number(item.negotiatedPrice ?? item.product.price);
      return sum + unitPrice * item.quantity;
    }, 0);
    return subtotal;
  }, [orders]);

  // if (loading) return <TransactionsSkeleton />;

  // const paidOrders = (orders ?? []).filter((o) => o.paymentStatus === "paid");
  // const totalSpent = paidOrders.reduce(
  //   (acc, o) => acc + Number(o.totalPrice),
  //   0,
  // );

  const paidSuccess =
    orders?.filter((item) => item.status === "payed").length ?? 0;

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <PageHeader
        icon={History}
        title="Riwayat Transaksi"
        subtitle="Riwayat pembelian yang telah dibayar."
      />

      {/* Ringkasan — pola MiniCard dashboard petani */}
      <div className="mb-6 rounded-card border border-gray-200/80 bg-white p-5 shadow-soft">
        <p className="mb-1 text-xs font-medium text-gray-500">
          Total Pengeluaran
        </p>
        <CountUp
          value={spendTotal}
          prefix="Rp "
          className="text-2xl font-bold text-primary"
        />
        {/* <p>
          {spendTotal}
        </p> */}
        <p className="mt-1 text-xs text-gray-400">
          {paidSuccess} transaksi selesai
        </p>
      </div>

      {paidSuccess === 0 ? (
        <EmptyState
          title="Belum Ada Transaksi"
          message="Transaksi yang sudah dibayar akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {orders?.map((o, i) => (
            <Link
              key={o.id}
              href={`/user/checkout/${o.id}`}
              className="group flex items-center justify-between gap-4 rounded-card border border-gray-200/80 bg-white p-5 shadow-soft transition-shadow duration-300 hover:shadow-lift animate-fade-up"
              style={{
                animationDelay: `${Math.min(i * 60, 360)}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div className="flex min-w-0 items-center gap-4">
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success"
                >
                  <CheckCircle2 size={20} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900 group-hover:text-primary transition-colors duration-150">
                    {o.product.name}
                  </p>
                  {/* <p className="mt-0.5 truncate text-xs text-gray-500">
                    {`ORDERCODE-${o.commodityId}`} · {formatDateTime(o.)}
                  </p> */}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
                    {/* <span>
                      {PAYMENT_METHOD_LABEL[o.paymentMethod ?? ""] ??
                        "Transfer"}
                    </span> */}
                    <StatusBadge status={o.status ?? "paid"} />
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-bold text-primary">
                  {formatRupiah(Number(o.negotiatedPrice) * o.quantity)}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  Termasuk biaya layanan
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
