'use client'

import { LayoutDashboard, ShoppingBag, History, Star, X } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  activeMenu: string
  setActiveMenu: (val: string) => void
}

export default function Sidebar({ isOpen, setIsOpen, activeMenu, setActiveMenu }: SidebarProps) {
  const menuItems = [
    { id: 'belanja', label: 'Belanja', icon: LayoutDashboard },
    { id: 'pesanan', label: 'Pesanan Saya', icon: ShoppingBag },
    { id: 'riwayat', label: 'Riwayat Transaksi', icon: History },
    { id: 'ulasan', label: 'Ulasan', icon: Star },
  ]

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-[#025246]">Kompas Desa</span>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500">
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
                ? 'bg-[#025246] text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#025246]'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}