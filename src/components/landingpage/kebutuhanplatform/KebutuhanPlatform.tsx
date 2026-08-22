'use client'

import React from 'react'
import Image from 'next/image'
import { ShoppingBag, Truck, Handshake, ArrowUpRight } from 'lucide-react'

export function FiturUtamaSec() {
  const services = [
    {
      icon: ShoppingBag,
      title: 'Jual Beli Hasil Panen',
      description: 'Memudahkan petani menjual hasil panen dan pembeli mendapatkan komoditas berkualitas secara langsung.',
      image: '/images/landingpage/fitur_utama/img_fit_1.webp',
      badge: 'Pasar Langsung',
    },
    {
      icon: Truck,
      title: 'Pemesanan & Pengiriman',
      description: 'Sistem pemesanan praktis dengan pemantauan status pengiriman hasil panen secara transparan.',
      image: '/images/landingpage/fitur_utama/img_fit_2.webp',
      badge: 'Logistik Terintegrasi',
    },
    {
      icon: Handshake,
      title: 'Bangun Relasi Bisnis',
      description: 'Jalin kemitraan strategis jangka panjang antara petani dan pembeli untuk peluang usaha yang berkelanjutan.',
      image: '/images/landingpage/fitur_utama/img_fit_3.webp',
      badge: 'Kemitraan',
    },
  ]

  return (
    <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full pointer-events-none -z-10"
        style={{ background: "radial-gradient(closest-side, rgba(16,185,129,0.14), transparent)" }}
      />
      <div className="max-w-6xl mx-auto">

        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">

          <h2 className="max-w-3xl font-bold leading-tight tracking-tight text-[#1f1f1f] text-3xl sm:text-3xl md:text-3xl text-center">
            Semua Kebutuhan dalam Satu Platform
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#75938f] leading-relaxed">
            Solusi terpadu untuk membantu petani mendistribusikan hasil panen secara lebih mudah, cepat, dan tepat sasaran.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl bg-slate-50/60 hover:bg-white border border-slate-200/80 hover:border-[#025246]/30 p-4 sm:p-5 transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div>
                  {/* Image Container dengan Aspect Ratio Modern */}
                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-200 mb-5">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Badge di atas gambar */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[11px] font-semibold text-[#025246] shadow-xs">
                      {item.badge}
                    </div>
                  </div>

                  {/* Title & Icon Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#E4F1EB] text-[#025246] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1f1f1f] group-hover:text-[#025246] transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#025246] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#75938f] leading-relaxed mt-2">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}