"use client";

import Link from "next/link";
import {
  Package,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  MapPin,
} from "lucide-react";
import { getFarmerCommodities, setCommodityStatus, deleteCommodity } from "@/actions/commodity";
import { getFarmerOrders } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatNumber } from "@/lib/format";
import { LoadingState, EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { useFetch } from "@/lib/hooks";
import type { FarmerCommodity, FarmerOrder } from "@/lib/types/market";

export default function PetaniDashboard() {
  const user = getClientUser();

  const { data, loading, reload } = useFetch(
    async () => {
      if (!user) {
        return {
          commodities: [] as FarmerCommodity[],
          orders: [] as FarmerOrder[],
        };
      }
      const [commodities, orders] = await Promise.all([
        getFarmerCommodities(user.id),
        getFarmerOrders(user.id),
      ]);
      return {
        commodities: commodities as FarmerCommodity[],
        orders: orders as FarmerOrder[],
      };
    },
    [user?.id],
  );

  const commodities = data?.commodities ?? [];
  const orders = data?.orders ?? [];

  if (loading) return <LoadingState />;

  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const stats = [
    {
      label: "Total Komoditas",
      value: String(commodities.length),
      icon: Package,
      color: "bg-[#025246]",
    },
    {
      label: "Terverifikasi",
      value: String(
        commodities.filter((c) => c.status === "available" || c.status === "verified").length,
      ),
      icon: CheckCircle2,
      color: "bg-green-600",
    },
    {
      label: "Menunggu Verifikasi",
      value: String(commodities.filter((c) => c.status === "pending").length),
      icon: Clock,
      color: "bg-amber-500",
    },
    {
      label: "Pesanan Masuk",
      value: String(pendingOrders),
      icon: TrendingUp,
      color: "bg-indigo-600",
    },
  ];

  const toggleStatus = async (id: number, current: string) => {
    await setCommodityStatus(
      id,
      current === "available" ? "sold_out" : "available",
      "petani",
    );
    reload();
  };

  const remove = async (id: number) => {
    if (!confirm("Yakin ingin menghapus komoditas ini?")) return;
    const res = await deleteCommodity(id, user!.id);
    if (res.success) reload();
    else alert(res.message);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Dashboard Petani</h1>
          <p className="text-sm text-gray-500">Kelola hasil panen dan pesanan Anda.</p>
        </div>
        <Link
          href="/petani/commodities/add"
          className="inline-flex items-center gap-2 bg-[#025246] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#024036] transition-colors"
        >
          <Plus size={18} /> Tambah Komoditas
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${s.color} text-white flex items-center justify-center mb-3`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#111111]">Komoditas Saya</h2>
        </div>

        {commodities.length === 0 ? (
          <EmptyState
            title="Belum Ada Komoditas"
            message="Tambahkan hasil panen Anda untuk mulai menjual di Kompas Desa."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {commodities.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-gradient-to-br from-[#025246] to-[#047857] relative flex items-center justify-center">
                  <span className="text-5xl font-black text-white/90">{c.name?.charAt(0)?.toUpperCase()}</span>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={c.status} />
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 mb-1">{c.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin size={12} className="text-[#025246]" /> {c.location}
                  </p>
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="font-extrabold text-[#025246]">{formatRupiah(c.price)}</span>
                    <span className="text-xs text-gray-500">
                      Stok: {formatNumber(c.stock)} {c.unit}
                    </span>
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/petani/commodities/edit/${c.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#025246] bg-[#025246]/10 hover:bg-[#025246] hover:text-white transition-colors"
                      >
                        <Pencil size={14} /> Edit
                      </Link>
                      <button
                        onClick={() => remove(c.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                    {(c.status === "available" || c.status === "sold_out") && (
                      <button
                        onClick={() => toggleStatus(c.id, c.status)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          c.status === "available"
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            : "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white"
                        }`}
                      >
                        {c.status === "available" ? "Set Habis" : "Tersedia"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
