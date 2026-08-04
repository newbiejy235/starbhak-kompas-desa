'use client'

import { MapPin, ShoppingCart } from 'lucide-react'

// Siapin props untuk nangkap data dari page.tsx
interface ProductCardProps {
  data?: any // Ganti 'any' dengan tipe data skema Drizzle lu nanti
}

export default function ProductCard({ data }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col">
      {/* Area Gambar */}
      <div className="w-full aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center text-gray-400">
        <span className="text-xs">Gambar Produk</span>
      </div>

      {/* Area Info Produk */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 mb-2 flex justify-between items-center h-4">
          <span className="flex items-center gap-1 truncate">
            <MapPin size={12} className="text-[#025246]" />
            Lokasi Petani
          </span>
          <span className="text-[#025246] bg-[#025246]/10 px-2 py-0.5 rounded text-[10px] font-semibold">
            Tersedia
          </span>
        </div>
        
        <h3 className="font-bold text-gray-900 leading-snug mb-1 line-clamp-2 h-10">
          Nama Produk
        </h3>
        
        <p className="text-xs text-gray-500 mb-4 h-4">
           <span className="font-medium text-gray-700">Nama Petani</span>
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-[#025246] h-6">
              Rp 0
            </div>
            <div className="text-[10px] text-gray-500">per Kilogram</div>
          </div>
          <button className="w-10 h-10 bg-[#025246] text-white rounded-full flex items-center justify-center hover:bg-[#024036] hover:scale-105 transition-all shadow-md">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}