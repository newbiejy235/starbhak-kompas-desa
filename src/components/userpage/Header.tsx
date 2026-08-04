'use client'

import { Menu, Search, ShoppingCart, Bell } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10">
      <div className="flex items-center gap-4 w-full">
        <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-700">
          <Menu size={24} />
        </button>
        <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-md">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari komoditas..."
            className="bg-transparent border-none outline-none ml-2 text-sm w-full"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <ShoppingCart size={20} />
        </button>
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <Bell size={20} />
        </button>
        <div className="w-8 h-8 bg-[#025246] rounded-full flex items-center justify-center text-white font-bold text-sm">
          U
        </div>
      </div>
    </header>
  )
}