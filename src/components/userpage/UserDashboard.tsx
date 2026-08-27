"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Package,
  MessageCircle,
  ArrowRight,
  History,
} from "lucide-react";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
};

const services = [
  { title: "Belanja Hasil Tani", desc: "Produk segar langsung dari petani desa", icon: ShoppingBag, href: "/user/home", color: "bg-[#025246]", accent: "text-[#025246]" },
  { title: "Pesanan Saya", desc: "Lacak status pesanan yang sedang berjalan", icon: Package, href: "/user/orders", color: "bg-blue-600", accent: "text-blue-600" },
  { title: "Riwayat Transaksi", desc: "Lihat riwayat pembelian dan berikan ulasan", icon: History, href: "/user/transactions", color: "bg-amber-500", accent: "text-amber-500" },
];

const recentOrders = [
  { id: "#TRX-3821", item: "Beras Organik 25 kg", status: "Selesai" },
  { id: "#TRX-3814", item: "Tomat Grade A 10 kg", status: "Dikirim" },
];

const orderStatusStyle: Record<string, string> = {
  Selesai: "bg-green-100 text-green-700",
  Dikirim: "bg-blue-100 text-blue-700",
};

export default function UserDashboard() {
  return (
    <div className="p-6 space-y-8">
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      <section className="flex flex-col sm:flex-row sm:items-center gap-5 bg-gradient-to-r from-[#025246] to-emerald-700 rounded-3xl p-7 text-white">
        <div className="flex-1">
          {/* Slow welcoming fade-in */}
          <h1 className="text-2xl sm:text-3xl font-bold opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
            {greeting()}, Budi! 👋
          </h1>
          {/* Slow welcoming fade-in */}
          <p className="mt-2 text-emerald-100 opacity-0 animate-[fadeIn_1s_ease-out_forwards] [animation-delay:300ms]">
            Semoga harimu menyenangkan. Hasil tani segar menunggu untuk dijelajahi.
          </p>
        </div>
        <Link
          href="/user/home"
          className="self-start sm:self-center inline-flex items-center gap-2 bg-white text-[#025246] text-sm font-semibold px-5 py-3 rounded-xl hover:bg-emerald-50 transition-colors"
        >
          Mulai Belanja <ArrowRight size={16} />
        </Link>
      </section>

      <section>
        <h2 className="font-bold text-gray-900 mb-4">Layanan untuk Anda</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {services.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              // Smooth lift on hover
              className="group bg-white rounded-2xl border border-gray-200 shadow-md p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className={`w-12 h-12 rounded-xl ${s.color} text-white flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <s.icon size={22} />
              </div>
              <h3 className="font-bold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              <span className={`inline-flex items-center gap-1 mt-4 text-sm font-semibold ${s.accent}`}>
                Buka <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Pesanan Terakhir</h2>
            <Link href="/user/transactions" className="text-sm font-semibold text-[#025246] hover:underline">
              Riwayat
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-4 rounded-xl border border-gray-100 px-4 py-3.5">
                <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                  <Package size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{o.item}</p>
                  <p className="text-xs text-gray-400">{o.id}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${orderStatusStyle[o.status]}`}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/user/chat"
          className="group bg-[#025246] rounded-2xl p-6 text-white flex flex-col justify-between shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
            <MessageCircle size={22} />
          </div>
          <div>
            <h3 className="font-bold">Butuh Bantuan?</h3>
            <p className="text-sm text-emerald-100 mt-1 leading-relaxed">
              Chat dengan tim dukungan atau negosiasi harga langsung dengan petani.
            </p>
            <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-emerald-200">
              Hubungi Kami <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}
