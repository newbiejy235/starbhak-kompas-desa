"use client";

import { getFarmerOrders } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { LoadingState, EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";
import type { FarmerOrder } from "@/lib/types/market";

export default function PetaniSales() {
  const user = getClientUser();

  const { data: orders, loading } = useFetch(
    () =>
      user ? getFarmerOrders(user.id) : Promise.resolve([] as FarmerOrder[]),
    [user?.id],
  );

  if (loading) return <LoadingState />;

  const paidOrders = (orders ?? []).filter((o) => o.paymentStatus === "paid");
  const totalRevenue = paidOrders.reduce((acc, o) => acc + Number(o.totalPrice), 0);
  const totalFee = paidOrders.reduce((acc, o) => acc + Number(o.serviceFee), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#111111] mb-2">Riwayat Penjualan</h1>
      <p className="text-sm text-gray-500 mb-6">Transaksi penjualan yang sudah dibayar.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Pendapatan</p>
          <p className="text-2xl font-extrabold text-[#025246]">{formatRupiah(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-500">Biaya Layanan Platform</p>
          <p className="text-2xl font-extrabold text-gray-800">{formatRupiah(totalFee)}</p>
          <p className="text-[11px] text-gray-400">Pendapatan bersih: {formatRupiah(totalRevenue - totalFee)}</p>
        </div>
      </div>

      {paidOrders.length === 0 ? (
        <EmptyState
          title="Belum Ada Penjualan"
          message="Transaksi penjualan yang dibayar akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {paidOrders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-800">{o.orderCode}</p>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{o.commodityName}</p>
                  <p className="text-xs text-gray-500">
                    {o.buyerName} · {formatDateTime(o.createdAt)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {Number(o.quantity)} × {formatRupiah(o.unitPrice)} ·{" "}
                    {PAYMENT_METHOD_LABEL[o.paymentMethod ?? ""] ?? "Transfer"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[#025246]">{formatRupiah(o.totalPrice)}</p>
                  <p className="text-[11px] text-gray-400">Fee: {formatRupiah(o.serviceFee)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
