import Link from "next/link";
import {
  Users,
  UserRound,
  Store,
  Boxes,
  ShoppingBag,
  Wallet,
  BadgeCheck,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  getDashboardStats,
  getTopCommodities,
  getSalesPerCategory,
  getMonthlyRevenue,
  getMonthlyOrders,
} from "@/actions/admin";
import { formatRupiah, formatNumber } from "@/lib/format";

// Menjadi Server Component (async) 
// Tidak ada lagi "use client" atau useFetch!
export default async function AdminDashboard() {
  // Semua request data dijalankan paralel secara real-time di server
  const [stats, topCommodities, salesByCategory, monthlyRevenue, monthlyOrders] =
    await Promise.all([
      getDashboardStats(),
      getTopCommodities(5),
      getSalesPerCategory(),
      getMonthlyRevenue(),
      getMonthlyOrders(),
    ]);

  const cards = [
    { label: "Total Pendapatan Fee", value: formatRupiah(stats.totalFeeRevenue), icon: Wallet, color: "bg-[#025246]" },
    { label: "Total Petani", value: String(stats.totalFarmers), icon: UserRound, color: "bg-green-600" },
    { label: "Total Pembeli", value: String(stats.totalBuyers), icon: Store, color: "bg-blue-600" },
    { label: "Total Transaksi", value: String(stats.totalPaidPayments), icon: ShoppingBag, color: "bg-indigo-600" },
    { label: "Total Komoditas", value: String(stats.totalCommodities), icon: Boxes, color: "bg-amber-500" },
    { label: "Total Pengguna", value: String(stats.totalUsers), icon: Users, color: "bg-purple-600" },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => Number(m.total)), 1);
  const maxOrders = Math.max(...monthlyOrders.map((m) => Number(m.total)), 1);
  const maxCategory = Math.max(...salesByCategory.map((c) => Number(c.totalRevenue)), 1);

  const monthLabel = (m: string) => {
    if (!m) return "";
    const [y, mo] = m.split("-");
    return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("id-ID", { month: "short" });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111111] mb-2">Dashboard Admin</h1>
      <p className="text-sm text-gray-500 mb-6">Pantau kinerja platform Kompas Desa.</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center mb-3`}>
              <c.icon size={20} />
            </div>
            <p className="text-xl font-extrabold text-gray-900 truncate">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/users" className="bg-amber-50 border border-amber-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <Clock size={18} /> Menunggu Verifikasi
          </div>
          <p className="text-2xl font-extrabold text-amber-700">{stats.pendingUsers}</p>
          <p className="text-xs text-amber-600 mt-1">Akun pengguna belum diverifikasi</p>
        </Link>
        <Link href="/admin/commodities" className="bg-blue-50 border border-blue-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <BadgeCheck size={18} /> Komoditas Baru
          </div>
          <p className="text-2xl font-extrabold text-blue-700">{stats.pendingCommodities}</p>
          <p className="text-xs text-blue-600 mt-1">Komoditas menunggu verifikasi</p>
        </Link>
        <Link href="/admin/orders" className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-indigo-700 mb-2">
            <ShoppingBag size={18} /> Pesanan Baru
          </div>
          <p className="text-2xl font-extrabold text-indigo-700">{stats.pendingOrders}</p>
          <p className="text-xs text-indigo-600 mt-1">Pesanan menunggu konfirmasi</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-[#111111] mb-2 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#025246]" /> Pendapatan Fee per Bulan
          </h2>
          <p className="text-xs text-gray-400 mb-4">Total: {formatRupiah(stats.totalFeeRevenue)}</p>
          {monthlyRevenue.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">Belum ada data</p>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {monthlyRevenue.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500">
                    {formatNumber(Number(m.total))}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-[#025246] to-[#047857] rounded-t-lg"
                    style={{ height: `${Math.max((Number(m.total) / maxRevenue) * 130, 4)}px` }}
                  />
                  <span className="text-[10px] text-gray-400">{monthLabel(m.month)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-[#111111] mb-4">Statistik Penjualan per Kategori</h2>
          {salesByCategory.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">Belum ada data</p>
          ) : (
            <div className="space-y-4">
              {salesByCategory.map((c) => (
                <div key={c.categoryName}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{c.categoryName}</span>
                    <span className="font-semibold text-[#025246]">
                      {formatRupiah(c.totalRevenue)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#025246] to-[#047857] rounded-full"
                      style={{ width: `${(Number(c.totalRevenue) / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-[#111111] mb-4">Jumlah Pesanan per Bulan</h2>
          {monthlyOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">Belum ada data</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {monthlyOrders.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500">{Number(m.total)}</span>
                  <div
                    className="w-full bg-indigo-500 rounded-t-lg"
                    style={{ height: `${Math.max((Number(m.total) / maxOrders) * 100, 4)}px` }}
                  />
                  <span className="text-[10px] text-gray-400">{monthLabel(m.month)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-[#111111] mb-4">Komoditas Terlaris</h2>
          {topCommodities.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {topCommodities.map((c, i) => (
                <div key={c.id} className="flex items-center gap-4">
                  <span className="w-7 h-7 rounded-full bg-[#025246]/10 text-[#025246] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatNumber(c.sold)} kg terjual ·{" "}
                      {Number(c.rating) > 0 ? Number(c.rating).toFixed(1) : "-"} ⭐ ({c.reviewCount})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}