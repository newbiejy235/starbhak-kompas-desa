"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Check,
  X,
  CheckCircle2,
  Package,
  ShoppingCart,
  Wallet,
  AlertTriangle,
} from "lucide-react";

const summary = [
  { label: "Produk Aktif", value: "24", icon: Package, color: "bg-[#025246]" },
  { label: "Pesanan Baru", value: "7", icon: ShoppingCart, color: "bg-amber-500" },
  { label: "Pendapatan Bulan Ini", value: "Rp 8.450.000", icon: Wallet, color: "bg-green-600" },
];

const pendingOrders = [
  { id: "#ORD-1092", buyer: "Warung Bu Sari", item: "Beras Organik 25 kg", total: "Rp 1.850.000" },
  { id: "#ORD-1091", buyer: "Toko Segar Jaya", item: "Tomat Grade A 30 kg", total: "Rp 570.000" },
  { id: "#ORD-1090", buyer: "Koperasi Sukamaju", item: "Cabai Merah 20 kg", total: "Rp 1.200.000" },
];

const products = [
  { name: "Beras Organik Premium", stock: "120 kg", price: "Rp 74.000 / 5 kg", status: "Tersedia" },
  { name: "Tomat Merah Grade A", stock: "45 kg", price: "Rp 19.000 / kg", status: "Tersedia" },
  { name: "Cabai Merah Keriting", stock: "8 kg", price: "Rp 60.000 / kg", status: "Stok Rendah" },
  { name: "Kangkung Hidroponik", stock: "0 kg", price: "Rp 30.000 / ikat", status: "Habis" },
];

export default function PetaniDashboard() {
  const [alert, setAlert] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (message: string) => {
    setAlert(null);
    requestAnimationFrame(() => setAlert(message));
  };

  useEffect(() => {
    if (!alert) return;
    timer.current = setTimeout(() => setAlert(null), 3000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [alert]);

  return (
    <div className="p-6 space-y-6">
      <style>{`@keyframes bounceIn{0%{opacity:0;transform:scale(.85) translateY(-10px)}60%{opacity:1;transform:scale(1.03) translateY(2px)}100%{opacity:1;transform:scale(1) translateY(0)}}`}</style>

      {alert && (
        <div
          role="status"
          className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-medium animate-[bounceIn_0.3s_ease-out_forwards]"
        >
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          {alert}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Petani</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola produk dan pesanan Anda dengan cepat.</p>
        </div>
        {/* Snappy press feedback */}
        <button
          onClick={() => notify("Form tambah komoditas dibuka.")}
          className="flex items-center gap-2 bg-[#025246] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md hover:bg-[#036350] active:scale-95 transition-transform duration-100"
        >
          <Plus size={16} /> Tambah Komoditas
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summary.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.color} text-white flex items-center justify-center shrink-0`}>
              <s.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-gray-900 truncate">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">Pesanan Masuk</h2>
        <div className="divide-y divide-gray-100 -mx-2">
          {pendingOrders.map((o) => (
            <div
              key={o.id}
              // Fast row highlight
              className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-2 py-3.5 rounded-lg transition-colors duration-150 hover:bg-gray-50"
            >
              <span className="text-sm font-bold text-gray-800 w-24">{o.id}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">{o.buyer}</p>
                <p className="text-xs text-gray-500 truncate">{o.item}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">{o.total}</span>
              <div className="flex gap-2 ml-auto sm:ml-0">
                {/* Snappy press feedback */}
                <button
                  onClick={() => notify(`Pesanan ${o.id} diterima.`)}
                  aria-label={`Terima pesanan ${o.id}`}
                  className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-transform duration-100"
                >
                  <Check size={15} />
                </button>
                {/* Snappy press feedback */}
                <button
                  onClick={() => notify(`Pesanan ${o.id} ditolak.`)}
                  aria-label={`Tolak pesanan ${o.id}`}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 active:scale-95 transition-transform duration-100"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Stok Produk</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <AlertTriangle size={13} /> 1 produk perlu restock
          </span>
        </div>
        <div className="divide-y divide-gray-100 -mx-2">
          {products.map((p) => (
            <div
              key={p.name}
              // Fast row highlight
              className="flex items-center gap-3 px-2 py-3.5 cursor-pointer rounded-lg transition-colors duration-150 hover:bg-gray-50"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#025246] flex items-center justify-center shrink-0">
                <Package size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{p.price}</p>
              </div>
              <span className="hidden sm:block text-xs font-medium text-gray-500">Stok: {p.stock}</span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  p.status === "Tersedia"
                    ? "bg-green-100 text-green-700"
                    : p.status === "Stok Rendah"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-600"
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
