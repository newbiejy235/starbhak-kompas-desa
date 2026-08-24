'use client'

import { useState } from 'react'
import { Plus, MessagesSquare } from 'lucide-react'

const faqData = [
  {
    question: "Bagaimana jika hasil panen yang diterima tidak sesuai standar?",
    answer: "Kami menyediakan garansi kualitas. Jika produk rusak atau tidak sesuai kesepakatan, pembeli dapat mengajukan klaim dalam beberapa jam untuk retur atau pengembalian dana."
  },
  {
    question: "Bagaimana cara mendaftar sebagai petani atau pembeli?",
    answer: "Kamu cukup menekan tombol 'Daftar' di bagian atas halaman, memilih peran yang sesuai (Petani/Pembeli), lalu melengkapi data profil dan verifikasi singkat."
  },
  {
    question: "Apakah ada biaya untuk bergabung di Kompas Desa?",
    answer: "Pendaftaran 100% gratis. Kompas Desa tidak memungut biaya awal bagi petani maupun pembeli yang ingin memasarkan atau mencari komoditas."
  },
  {
    question: "Bagaimana jaminan keamanan transaksinya?",
    answer: "Seluruh sistem transaksi menggunakan escrow (rekening bersama) terverifikasi. Dana pembeli aman dan baru disalurkan ke penjual setelah komoditas diterima sesuai kesepakatan."
  },
  {
    question: "Komoditas apa saja yang bisa dijual di platform ini?",
    answer: "Semua hasil panen pertanian seperti beras, sayur segar, buah-buahan, rempah-rempah dan lainnya."
  }
]

function FaqIllustration() {
  return (
    <svg viewBox="0 0 480 480" className="w-full max-w-md mx-auto" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="faq-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E4F1EB" />
          <stop offset="100%" stopColor="#F6FAF8" />
        </linearGradient>
      </defs>

      {/* Background blob */}
      <circle cx="240" cy="240" r="210" fill="url(#faq-bg)" />

      {/* Decorative dots */}
      <circle cx="84" cy="96" r="6" fill="#D7BE44" />
      <circle cx="408" cy="118" r="5" fill="#025246" opacity="0.25" />
      <circle cx="86" cy="376" r="5" fill="#025246" opacity="0.2" />
      <circle cx="396" cy="370" r="9" fill="#D7BE44" opacity="0.7" />

      {/* Soft ring */}
      <circle cx="240" cy="240" r="150" stroke="#025246" strokeOpacity="0.06" strokeWidth="24" />

      {/* Leaf accents (top-right) */}
      <path d="M352 96c-22 2-36 14-40 34 20 2 34-8 40-34z" fill="#025246" />
      <path d="M358 108c-4-16 6-30 24-36 4 16-6 28-24 36z" fill="#D7BE44" />

      {/* Main chat bubble */}
      <rect x="120" y="110" width="240" height="180" rx="30" fill="white" />
      <rect x="120" y="110" width="240" height="180" rx="30" stroke="#025246" strokeOpacity="0.08" />

      {/* Bubble tail */}
      <path d="M168 286 L148 330 L212 288" fill="white" stroke="#025246" strokeOpacity="0.08" />

      {/* Question mark */}
      <path
        d="M236 196c2-10 10-16 20-16 11 0 20 7 20 16 0 8-7 13-14 17-5 3-9 7-9 12"
        stroke="#025246"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="253" cy="234" r="4.5" fill="#025246" />

      {/* Accent bubble (bottom) */}
      <rect x="176" y="326" width="128" height="64" rx="18" fill="#025246" />
      <path
        d="M225 348c1-8 7-13 14-13 8 0 14 5 14 12 0 6-5 10-11 13-3 2-5 4-5 8"
        stroke="#D7BE44"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="237" cy="374" r="3.5" fill="#D7BE44" />
      <circle cx="290" cy="340" r="4" fill="#D7BE44" opacity="0.6" />
    </svg>
  )
}

function CTABox({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-3xl bg-gradient-to-br from-[#EAF4F0] to-white p-7 sm:p-8 shadow-sm ${className}`}>
      <div className="flex flex-col items-start gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#025246]/10 text-[#025246]">
              <MessagesSquare className="h-5 w-5 fill-current opacity-20" />
            </span>
            <h3 className="text-lg font-bold text-[#1f1f1f]">
              Punya pertanyaan lain?
            </h3>
          </div>
          <p className="text-sm text-[#75938f] leading-relaxed">
            Diskusi langsung dengan tim kami. Kami siap bantu pandu alur distribusi dan optimalisasi hasil panenmu secara personal.
          </p>
        </div>
        <a
          href="/kompas-desa/contact"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#025246] px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#013e35] hover:shadow-md hover:-translate-y-1"
        >
          Hubungi Kami
        </a>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="w-full bg-white py-16 sm:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:gap-14 lg:gap-16 md:grid-cols-[0.9fr_1.1fr] items-start">

          <div className="relative hidden md:flex flex-col gap-8 lg:sticky lg:top-28">
            <FaqIllustration />
            <CTABox />
          </div>

          <div>
            <div className="mb-8 sm:mb-10">
              <h2 className="text-[30px] sm:text-[34px] md:text-[38px] font-bold leading-tight tracking-tight text-[#1f1f1f]">
                Pertanyaan Sering Ditanyakan
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#75938f] leading-relaxed max-w-xl">
                Temukan jawaban cepat seputar penggunaan dan layanan Kompas Desa.
              </p>
            </div>

            {/* Accordion */}
            <div className="space-y-3">
              {faqData.map((item, index) => {
                const isOpen = openIndex === index
                return (
                  <div
                    key={index}
                    className={`rounded-2xl transition-all duration-300 ${isOpen}`}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${index}`}
                      className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer select-none"
                    >
                      <span
                        className={`text-base sm:text-lg font-semibold tracking-tight transition-colors duration-300 ${isOpen ? 'text-[#025246]' : 'text-[#1f1f1f]'
                          }`}
                      >
                        {item.question}
                      </span>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen
                          ? 'bg-[#025246] border-[#025246] text-white rotate-45'
                          : 'border-slate-200 text-[#025246]'
                          }`}
                      >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                      </span>
                    </button>

                    <div
                      id={`faq-panel-${index}`}
                      role="region"
                      className={`grid transition-all duration-300 ease-in-out ${isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                        }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-[#75938f] leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <CTABox className="mt-8 md:hidden" />

          </div>
        </div>
      </div>
    </section>
  )
}