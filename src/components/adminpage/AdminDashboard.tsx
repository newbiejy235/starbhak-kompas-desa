"use client";

import {
  Wallet,
  UserRound,
  Store,
  ShoppingBag,
  Boxes,
  Users,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  { label: "Total Pendapatan Fee", value: "Rp 128,4 jt", delta: "+12,5%", icon: Wallet, color: "bg-[#025246]" },
  { label: "Total Petani", value: "342", delta: "+8", icon: UserRound, color: "bg-green-600" },
  { label: "Total Pembeli", value: "1.208", delta: "+34", icon: Store, color: "bg-blue-600" },
  { label: "Total Transaksi", value: "3.764", delta: "+121", icon: ShoppingBag, color: "bg-indigo-600" },
  { label: "Total Komoditas", value: "894", delta: "+17", icon: Boxes, color: "bg-amber-500" },
  { label: "Total Pengguna", value: "1.550", delta: "+42", icon: Users, color: "bg-purple-600" },
];

const transactions = [
  { id: "#TRX-3821", buyer: "Warung Bu Sari", item: "Beras Organik 25 kg", amount: "Rp 1.850.000", status: "Selesai" },
  { id: "#TRX-3820", buyer: "Koperasi Desa Sukamaju", item: "Cabai Merah 40 kg", amount: "Rp 2.400.000", status: "Diproses" },
  { id: "#TRX-3819", buyer: "Toko Segar Jaya", item: "Tomat Grade A 60 kg", amount: "Rp 1.140.000", status: "Dibayar" },
  { id: "#TRX-3818", buyer: "Hotel Melati Indah", item: "Kangkung Hidroponik 15 kg", amount: "Rp 450.000", status: "Selesai" },
  { id: "#TRX-3817", buyer: "Pasar Induk Kramat Jati", item: "Bawang Merah 100 kg", amount: "Rp 3.900.000", status: "Dibayar" },
];

const stagger = [
  "[animation-delay:0ms]",
  "[animation-delay:100ms]",
  "[animation-delay:200ms]",
  "[animation-delay:300ms]",
  "[animation-delay:400ms]",
  "[animation-delay:500ms]",
];

const statusStyle: Record<string, string> = {
  Selesai: "bg-green-100 text-green-700",
  Diproses: "bg-amber-100 text-amber-700",
  Dibayar: "bg-blue-100 text-blue-700",
};

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau kinerja platform Kompas Desa secara real-time.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            // Staggered entrance + elevation on hover
            className={`bg-white rounded-2xl border border-gray-200 shadow-md p-5 opacity-0 animate-[slideUp_0.5s_ease-out_forwards] ${stagger[i]} transition-shadow duration-300 hover:shadow-lg`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} text-white flex items-center justify-center`}>
                <s.icon size={20} />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
                <TrendingUp size={12} />
                {s.delta}
              </span>
            </div>
            <p className="text-xl font-extrabold text-gray-900 truncate">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-md p-5 transition-shadow duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Pendapatan Bulanan</h2>
            <span className="text-xs font-medium text-gray-400">12 bulan terakhir</span>
          </div>
          <div className="flex items-end gap-2 h-48" role="img" aria-label="Memuat grafik pendapatan">
            {[45, 70, 55, 85, 65, 90, 75, 60, 80, 95, 70, 88].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-2">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-[#025246] to-emerald-400" style={{ height: `${h}%` }} />
                <div className="h-2 w-full rounded bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 transition-shadow duration-300 hover:shadow-lg">
          <h2 className="font-bold text-gray-900 mb-5">Komoditas Terlaris</h2>
          <div className="space-y-4">
            {[92, 78, 64, 51, 38].map((w, i) => (
              <div key={i}>
                <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse mb-2" />
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500/80 animate-pulse" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 transition-shadow duration-300 hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Transaksi Terbaru</h2>
          <button className="flex items-center gap-1 text-sm font-semibold text-[#025246] hover:underline">
            Lihat Semua <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="hidden sm:grid grid-cols-[1fr_1.4fr_1fr_1fr_auto] gap-4 px-4 pb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <span>ID Order</span>
          <span>Pembeli</span>
          <span>Komoditas</span>
          <span>Total</span>
          <span>Status</span>
        </div>
        <div className="space-y-2">
          {transactions.map((t) => (
            <div
              key={t.id}
              // Row elevation on hover
              className="grid grid-cols-2 sm:grid-cols-[1fr_1.4fr_1fr_1fr_auto] gap-2 sm:gap-4 items-center bg-gray-50/50 rounded-xl px-4 py-3.5 cursor-pointer transition-shadow duration-300 hover:shadow-lg"
            >
              <span className="text-sm font-bold text-gray-800">{t.id}</span>
              <span className="text-sm text-gray-600 truncate">{t.buyer}</span>
              <span className="text-sm text-gray-600 truncate">{t.item}</span>
              <span className="text-sm font-semibold text-gray-900">{t.amount}</span>
              <span className={`justify-self-end px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[t.status]}`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
