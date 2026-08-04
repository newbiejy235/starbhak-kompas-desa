"use client"

import { useState } from "react"
import { LayoutDashboard, ShoppingBag, History, Star, Bell, Menu, X, Search, PackageOpen } from "lucide-react"

export default function DashboardPembeli() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState("overview")

  const menuItems = [
    { id: "overview", label: "Ringkasan", icon: LayoutDashboard },
    { id: "pesanan", label: "Pesanan Saya", icon: ShoppingBag },
    { id: "riwayat", label: "Riwayat Transaksi", icon: History },
    { id: "ulasan", label: "Ulasan", icon: Star },
  ]

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-[#025246]">Kompas Desa</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeMenu === item.id
                  ? "bg-[#025246] text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#025246]"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Cari pesanan atau komoditas..."
                className="bg-transparent border-none outline-none ml-2 text-sm w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 bg-[#025246] rounded-full flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-gray-500 text-sm mb-2">Pesanan Aktif</div>
              <div className="text-3xl font-bold text-[#111111]">0</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-gray-500 text-sm mb-2">Menunggu Pembayaran</div>
              <div className="text-3xl font-bold text-[#111111]">0</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-gray-500 text-sm mb-2">Total Transaksi Selesai</div>
              <div className="text-3xl font-bold text-[#111111]">0</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <PackageOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-[#111111] mb-2">Belum Ada Transaksi</h2>
            <p className="text-gray-500 text-sm max-w-md mb-8">
              Sepertinya Anda belum pernah melakukan pembelian. Mulai jelajahi marketplace dan temukan hasil panen segar langsung dari petani!
            </p>
            <button className="bg-[#025246] hover:bg-[#024036] text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#025246]/20 hover:shadow-[#025246]/40 hover:-translate-y-0.5">
              Mulai Belanja Sekarang
            </button>
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}