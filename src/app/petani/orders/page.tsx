"use client";

import { getFarmerOrders } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { MapPin, Store } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { FarmerOrder } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function OrdersSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64 mb-6" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-card" />
      ))}
    </div>
  );
}

export default function PetaniOrders() {
  const user = getClientUser();

  const { data: orders, loading } = useFetch(
    () =>
      user ? getFarmerOrders(user.id) : Promise.resolve([] as FarmerOrder[]),
    [user?.id],
  );

  if (loading) return <OrdersSkeleton />;

  const list = orders ?? [];

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Masuk</h1>
      <p className="text-sm text-gray-500 mb-6">Kelola dan proses pesanan dari pembeli.</p>

      {list.length === 0 ? (
        <EmptyState
          title="Belum Ada Pesanan"
          message="Pesanan dari pembeli akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {list.map((o, i) => {
            return (
              <div
                key={o.id}
                className="bg-white rounded-card border border-gray-200/80 shadow-soft hover:shadow-lift transition-all duration-300 ease-smooth overflow-hidden animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 60, 360)}ms`, animationFillMode: "backwards" }}
              >
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <p className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</p>
                    <p className="text-sm font-bold text-gray-800">{o.orderCode}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-xl font-black flex-shrink-0">
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
                      <Store size={14} className="text-primary" /> {o.buyerName}
                      <span className="text-xs text-gray-400">({o.buyerNoTelp})</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary" />
                      {o.deliveryMethod === "pickup" ? "Pick Up" : o.deliveryAddress}
                    </p>
                    <p className="font-bold text-primary text-base">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
