'use client'

import React from 'react'
import { ShieldCheck, Eye, BadgeCheck, KeyRound } from 'lucide-react'

export function KeamananSec() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Sumber Produk Terpercaya',
      description: 'Komoditas berasal dari jaringan petani dan mitra yang terverifikasi.',
      tag: 'Petani Terpilih',
    },
    {
      icon: Eye,
      title: 'Harga Lebih Transparan',
      description: 'Informasi harga dan ketersediaan produk dapat dilihat sebelum melakukan pemesanan.',
      tag: 'Real-time',
    },
    {
      icon: BadgeCheck,
      title: 'Kualitas Terjaga',
      description: 'Informasi kualitas dan spesifikasi produk tersedia secara jelas.',
      tag: 'Standar Mutu',
    },
    {
      icon: KeyRound,
      title: 'Keamanan Akun Terproteksi',
      description: 'Kata sandi pengguna dienkripsi menggunakan algoritma Bcrypt dengan Salt otomatis.',
      tag: 'Bcrypt Hashing',
    },
  ]

  return (
    <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Background Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full pointer-events-none -z-10"
        style={{ background: "radial-gradient(closest-side, rgba(16,185,129,0.16), transparent)" }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="max-w-3xl text-[30px] font-bold leading-tight tracking-tight text-[#1f1f1f] text-center sm:text-[34px] md:text-[38px]">
            Mudah dan Terpercaya
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
            Dapatkan hasil pertanian berkualitas dengan informasi yang jelas dan proses pengadaan yang lebih sederhana.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="group relative p-6 sm:p-8 rounded-2xl bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-[#025246]/20 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#E4F1EB] text-[#025246] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-medium tracking-wide text-slate-500 bg-white group-hover:bg-[#E4F1EB]/50 px-2.5 py-1 rounded-md border border-slate-200/60 group-hover:border-[#025246]/10 transition-colors">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1f1f1f] mb-2 group-hover:text-[#025246] transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-[#75938f] leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Footer Badges */}
        <div className="mt-12 sm:mt-16 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terverifikasi Kementan</span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Standar Mutu</span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Keamanan Pangan</span>
          </div>
        </div>
      </div>
    </section>
  )
}