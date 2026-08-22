"use client";

import { useState } from "react";
import { getAllCommoditiesAdmin, verifyCommodity } from "@/actions/admin";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatNumber, formatDate } from "@/lib/format";
import { EmptyState } from "@/components/shared/States";
import StatusBadge from "@/components/shared/StatusBadge";
import { BadgeCheck, XCircle, MapPin } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { AdminCommodity } from "@/lib/types/market";
import { Skeleton } from "@/components/ui/Skeleton";

function CommoditiesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-40 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-card" />
        ))}
      </div>
    </div>
  );
}

export default function AdminCommodities() {
  const admin = getClientUser();
  const [filter, setFilter] = useState("all");

  const { data: commodities, loading, reload } = useFetch(
    () => getAllCommoditiesAdmin(),
    [],
  );

  const verify = async (id: number, status: "verified" | "rejected") => {
    if (!admin) return;
    const res = await verifyCommodity(id, status, admin.id);
    if (!res.success) alert(res.message);
    reload();
  };

  if (loading) return <CommoditiesSkeleton />;

  const list: AdminCommodity[] = commodities ?? [];
  const filtered = list.filter((c) => filter === "all" || c.status === filter);

  const counts = {
    all: list.length,
    pending: list.filter((c) => c.status === "pending").length,
    verified: list.filter((c) => c.status === "verified" || c.status === "available").length,
    rejected: list.filter((c) => c.status === "rejected").length,
  };

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Manajemen Komoditas</h1>
      <p className="text-sm text-gray-500 mb-6">
        Verifikasi dan kelola komoditas hasil panen petani.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "all", label: `Semua (${counts.all})` },
          { id: "pending", label: `Menunggu Verifikasi (${counts.pending})` },
          { id: "verified", label: `Terverifikasi (${counts.verified})` },
          { id: "rejected", label: `Ditolak (${counts.rejected})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 ${
              filter === f.id
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Tidak Ada Komoditas" message="Tidak ada komoditas yang cocok dengan filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c, i) => (
            <div
              key={c.id}
              className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden flex flex-col hover:shadow-lift hover:-translate-y-1 transition-all duration-300 ease-smooth animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 60, 420)}ms`, animationFillMode: "backwards" }}
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-primary to-primary-dark relative flex items-center justify-center overflow-hidden">
                <span className="text-5xl font-black text-white/90">{c.name?.charAt(0)?.toUpperCase()}</span>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={c.status} />
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 mb-1">{c.name}</h3>
                <p className="text-xs text-gray-500 mb-2">
                  {c.categoryName} · {c.farmerName}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                  <MapPin size={12} /> {c.location} · {formatDate(c.createdAt)}
                </p>
                <div className="flex justify-between text-sm mb-4">
                  <span className="font-extrabold text-primary">{formatRupiah(c.price)}</span>
                  <span className="text-xs text-gray-500">
                    Stok: {formatNumber(c.stock)} {c.unit} · Kualitas {c.quality}
                  </span>
                </div>
                <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
                  {c.status === "pending" && (
                    <>
                      <button
                        onClick={() => verify(c.id, "verified")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-success hover:bg-success/90 active:scale-[0.98] transition-all"
                      >
                        <BadgeCheck size={16} /> Terima
                      </button>
                      <button
                        onClick={() => verify(c.id, "rejected")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-danger hover:bg-danger/90 active:scale-[0.98] transition-all"
                      >
                        <XCircle size={16} /> Tolak
                      </button>
                    </>
                  )}
                  {c.status === "rejected" && (
                    <button
                      onClick={() => verify(c.id, "verified")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-success hover:bg-success/90 active:scale-[0.98] transition-all"
                    >
                      <BadgeCheck size={16} /> Terima Kembali
                    </button>
                  )}
                  {c.status !== "pending" && c.status !== "rejected" && (
                    <p className="flex-1 text-center text-xs text-gray-400 py-2.5">
                      {c.status === "sold_out" ? "Stok habis" : "Aktif di marketplace"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
