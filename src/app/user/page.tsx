'use client'

import { useState } from 'react'
import Sidebar from '@/components/userpage/Sidebar'
import Header from '@/components/userpage/Header'
import ProductCard from '@/components/userpage/ProductCard'
import { LayoutDashboard, ShoppingCart } from 'lucide-react'
import Image from 'next/image'

export default function DashboardPembeli() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState('belanja')

  const products: any[] = [] 

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {activeMenu === 'belanja' && (
            <>

              <div className="bg-gradient-to-r from-[#025246] to-[#047857] rounded-3xl p-6 sm:p-10 mb-8 text-white relative overflow-hidden flex justify-between items-center shadow-md">
                <div className="relative z-10 max-w-xl">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                    Panen Segar Langsung dari Petani Lokal
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base mb-6">
                    Dapatkan kualitas terbaik dengan harga yang lebih transparan. Dukung petani Indonesia!
                  </p>
                </div>
                <div className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 opacity-20">
                  <Image src="" alt=""></Image>
                </div>
              </div>


              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#111111]">Katalog Komoditas</h2>
                <p className="text-sm text-gray-500 mt-1">Jelajahi hasil panen terbaik dari berbagai daerah</p>
              </div>


              {products.length > 0 ? (

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((item, index) => (
                    <ProductCard key={index} data={item} />
                  ))}
                </div>
              ) : (

                <div className="bg-white rounded-2xl border border-gray-200 border-dashed shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center w-full">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-[#111111] mb-2">Belum Ada Produk</h2>
                  <p className="text-gray-500 text-sm max-w-md">
                    Saat ini belum ada komoditas hasil panen yang tersedia atau ditambahkan oleh petani.
                  </p>
                </div>
              )}
            </>
          )}

          {activeMenu !== 'belanja' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center">
              <h2 className="text-xl font-bold text-[#111111] capitalize mb-2">
                Halaman {activeMenu.replace('-', ' ')}
              </h2>
              <p className="text-gray-500 text-sm max-w-md">
                Konten untuk bagian ini sedang dalam tahap pengembangan dan akan ditarik dari database.
              </p>
            </div>
          )}
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}