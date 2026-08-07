"use client";

import { getFarmerOrders, updateOrderStatus } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime, ORDER_STATUS_LABEL } from "@/lib/format";
import { LoadingState, EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { MapPin, Store } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { FarmerOrder } from "@/lib/types/market";

export default function PetaniOrders() {
  const user = getClientUser();

  const { data: orders, loading, reload } = useFetch(
    () =>
      user ? getFarmerOrders(user.id) : Promise.resolve([] as FarmerOrder[]),
    [user?.id],
  );

  if (loading) return <LoadingState />;

  const list = orders ?? [];

  const nextStatus = (status: string): string | null => {
    const flow: Record<string, string> = {
      pending: "confirmed",
      confirmed: "processing",
      processing: "shipped",
      shipped: "completed",
    };
    return flow[status] ?? null;
  };

  const advance = async (id: number, status: string) => {
    if (!user) return;
    await updateOrderStatus(id, status, user.id);
    reload();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#111111] mb-2">Pesanan Masuk</h1>
      <p className="text-sm text-gray-500 mb-6">Kelola dan proses pesanan dari pembeli.</p>

      {list.length === 0 ? (
        <EmptyState
          title="Belum Ada Pesanan"
          message="Pesanan dari pembeli akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {list.map((o) => {
            const next = nextStatus(o.status);
            return (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <p className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</p>
                    <p className="text-sm font-bold text-gray-800">{o.orderCode}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#025246] to-[#047857] text-white flex items-center justify-center text-xl font-black flex-shrink-0">
                      {o.commodityName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{o.commodityName}</p>
                      <p className="text-xs text-gray-500">
                        {Number(o.quantity)} × {formatRupiah(o.unitPrice)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Pembayaran: <StatusBadge status={o.paymentStatus ?? "pending"} />
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <Store size={14} className="text-[#025246]" /> {o.buyerName}
                      <span className="text-xs text-gray-400">({o.buyerNoTelp})</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#025246]" />
                      {o.deliveryMethod === "pickup" ? "Pick Up" : o.deliveryAddress}
                    </p>
                    <p className="font-bold text-[#025246] text-base">
                      Total: {formatRupiah(o.totalPrice)}
                    </p>
                  </div>
                </div>

                {o.notes && (
                  <div className="px-5 pb-3">
                    <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2">
                      Catatan pembeli: {o.notes}
                    </p>
                  </div>
                )}

                {next && (
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => advance(o.id, next)}
                      className="w-full sm:w-auto rounded-xl bg-[#025246] px-6 py-3 text-sm font-bold text-white hover:bg-[#024036] transition-colors"
                    >
                      Ubah ke &quot;{ORDER_STATUS_LABEL[next]}&quot;
                    </button>
                  </div>
                )}
                {o.status === "pending" && (
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => advance(o.id, "cancelled")}
                      className="w-full sm:w-auto rounded-xl border border-red-200 px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Batalkan Pesanan
                    </button>
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
