'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Sprout, Store, ArrowRight, ChevronDown } from 'lucide-react'

const petaniBenefits = [
  "Mengelola Profil dan Informasi Usaha",
  "Mengelola Lahan, Tanaman, dan Jadwal Panen",
  "Mengelola Komoditas, Harga, dan Stok",
  "Menampilkan Hasil Panen ke Pasar Lebih Luas",
  "Menerima dan Memproses Pesanan dengan Mudah",
  "Memantau Penjualan, Pelanggan, dan Performa Usaha",
  "Membangun Reputasi dan Memperluas Peluang Penjualan",
  "Memanfaatkan Chatbot untuk Mendapatkan Bantuan dan Informasi"
];

const pelangganBenefits = [
  "Mencari dan Memfilter Komoditas",
  "Melihat Detail Produk dan Informasi Petani",
  "Menemukan Petani Terpercaya",
  "Melakukan Pemesanan Produk dengan Mudah",
  "Melacak Status dan Riwayat Pesanan",
  "Menyimpan Produk Pilihan",
  "Mendapatkan Notifikasi Pesanan",
  "Memanfaatkan Chatbot untuk Mendapatkan Bantuan dan Informasi",
]

interface BenefitListProps {
  benefits: string[]
  initialCount?: number
  iconBg: string
}

function BenefitList({ benefits, initialCount = 4, iconBg }: BenefitListProps) {
  const [expanded, setExpanded] = useState(false)

  const primary = benefits.slice(0, initialCount)
  const rest = benefits.slice(initialCount)

  const renderBenefit = (benefit: string) => (
    <li
      key={benefit}
      className="group/benefit flex items-start gap-3.5 rounded-lg px-2 py-1.5 -mx-2 transition-all duration-200 hover:bg-[#F6FAF8]"
    >
      {/* Check */}
      <span
        className={`
          relative mt-0.5 flex h-[22px] w-[22px] shrink-0
          items-center justify-center rounded-full
          ${iconBg}
          text-[#025246]
          ring-1 ring-[#025246]/10
          shadow-[0_1px_3px_rgba(2,82,70,0.06)]
          transition-all duration-300
          group-hover/benefit:bg-[#025246]
          group-hover/benefit:text-white
          group-hover/benefit:ring-[#025246]/20
          group-hover/benefit:shadow-[0_3px_8px_rgba(2,82,70,0.15)]
          group-hover/benefit:scale-105
        `}
      >
        <Check
          className="
            h-3 w-3
            transition-transform duration-300
            group-hover/benefit:scale-110
          "
          strokeWidth={3}
        />
      </span>

      {/* Text */}
      <span
        className="
          pt-[1px]
          font-body
          text-[14.5px]
          leading-[1.5]
          text-[#3C4D49]
          transition-colors duration-200
          group-hover/benefit:text-[#14231F]
        "
      >
        {benefit}
      </span>
    </li>
  )

  return (
    <div className="mb-8">
      <ul className="space-y-2">
        {primary.map(renderBenefit)}
      </ul>

      {rest.length > 0 && (
        <>
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-out"
            style={{
              gridTemplateRows: expanded ? '1fr' : '0fr',
            }}
          >
            <div className="overflow-hidden">
              <ul className="space-y-2 pt-2">
                {rest.map(renderBenefit)}
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="
              group/more
              mt-4
              inline-flex
              items-center
              gap-1.5
              rounded-md
              px-2
              py-1
              -mx-2
              font-body
              text-[13px]
              font-semibold
              text-[#025246]
              transition-all
              duration-200
              hover:bg-[#F0F7F4]
              hover:text-[#013E35]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#025246]
              focus-visible:ring-offset-2
            "
          >
            <span>
              {expanded
                ? 'Sembunyikan'
                : `+ ${rest.length} manfaat lainnya`}
            </span>

            <ChevronDown
              className={`
                h-3.5 w-3.5
                transition-transform duration-300
                ${expanded ? 'rotate-180' : ''}
                group-hover/more:translate-y-0.5
              `}
            />
          </button>
        </>
      )}
    </div>
  )
}

export default function CardMembership() {
  return (
    <section className="relative w-full overflow-hidden bg-[#FAFAF9] px-4 py-20 sm:px-6 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(2,82,70,0.035) 0px, rgba(2,82,70,0.035) 1px, transparent 1px, transparent 64px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(2,82,70,0.06) 0%, rgba(2,82,70,0) 70%)' }}
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center lg:mb-20">
          <h2 className="max-w-3xl text-[30px] font-bold leading-tight tracking-tight text-[#1f1f1f] text-center sm:text-[34px] md:text-[38px]">
            Bergabung Sesuai Kebutuhan Anda
          </h2>

          <p className="mt-4 font-body text-base leading-7 text-[#6B807C]">
            Dapatkan akses ke berbagai fitur untuk menjalankan kebutuhan Anda dengan lebih mudah.
          </p>
        </div>


        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-0">

          <div className="group relative flex flex-col rounded-[28px] border border-[#E1E5E3] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#025246] sm:p-10 lg:pr-12">
            <span className="absolute left-8 top-0 h-[3px] w-10 rounded-full bg-[#025246] sm:left-10" />

            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E4F1EB] text-[#025246] transition-transform duration-300 group-hover:scale-105">
                <Sprout className="h-7 w-7" strokeWidth={2} />
              </div>
              <div>
                <div className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-[#025246]/70">
                  Untuk Penjual
                </div>
                <h3 className="font-display text-2xl font-bold text-[#14231F]">Petani</h3>
              </div>
            </div>

            <p className="mb-8 font-body text-[15px] leading-relaxed text-[#5B706C]">
              Tawarkan hasil panen dan temukan lebih banyak peluang pasar.
            </p>

            <div className="mb-8 h-px w-full bg-[#EDEFEE]" />

            <BenefitList benefits={petaniBenefits} iconBg="bg-[#E4F1EB]" />

            <Link
              href="/auth/register/petani"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#025246] px-6 py-4 font-body text-[15px] font-semibold text-white transition-all duration-300 hover:bg-[#013e35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#025246] focus-visible:ring-offset-2"
            >
              Daftar sebagai Petani
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="relative hidden w-16 flex-col items-center justify-center lg:flex">
            <div className="relative flex h-full flex-col items-center justify-center gap-10 py-10">
              <span className="absolute inset-y-6 left-1/2 -z-10 w-px -translate-x-1/2 bg-[#E1E5E3]" />
              <span className="h-2 w-2 rounded-full bg-[#025246]" />
              <span className="h-2 w-2 rounded-full bg-[#025246]/40" />
              <span className="h-2 w-2 rounded-full bg-[#025246]" />
            </div>
            <span
              className="mt-1 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A9C98]"
              style={{ writingMode: 'vertical-rl' }}
            >
              Atau
            </span>
          </div>

          {/* PELANGGAN — secondary panel */}
          <div className="group relative flex flex-col rounded-[28px] border border-[#E9EBEA] bg-[#FBFCFB] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#025246]/50 sm:p-10 lg:pl-12">
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E4F1EB]/70 text-[#025246] transition-transform duration-300 group-hover:scale-105">
                <Store className="h-7 w-7" strokeWidth={2} />
              </div>
              <div>
                <div className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-[#025246]/60">
                  Untuk Pembeli
                </div>
                <h3 className="font-display text-2xl font-bold text-[#14231F]">Pelanggan</h3>
              </div>
            </div>

            <p className="mb-8 font-body text-[15px] leading-relaxed text-[#5B706C]">
              Temukan komoditas yang Anda butuhkan dan pesan langsung melalui platform.
            </p>

            <div className="mb-8 h-px w-full bg-[#EDEFEE]" />

            <BenefitList benefits={pelangganBenefits} iconBg="bg-[#E4F1EB]/70" />

            <Link
              href="/auth/register/user"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#025246] bg-transparent px-6 py-4 font-body text-[15px] font-semibold text-[#025246] transition-all duration-300 hover:bg-[#025246] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#025246] focus-visible:ring-offset-2"
            >
              Daftar sebagai Pelanggan
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}