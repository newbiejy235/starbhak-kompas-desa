'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const reviewsData = [
  {
    id: 'rev-1',
    name: 'Budi Santoso',
    role: 'Petani Sayur - Bogor',
    review:
      'Aplikasi ini sangat membantu menyalurkan panen cabai saya langsung ke tengkulak kota tanpa potongan sadis!',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'rev-2',
    name: 'Siti Aminah',
    role: 'Pemilik Restoran - Jakarta',
    review:
      'Bahan makanan selalu segar karena dikirim langsung dari lahan mitra. Pasokan restoran jadi aman terus.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'rev-3',
    name: 'Pak Haryanto',
    role: 'Petani Padi - Karawang',
    review:
      'Fitur pemantauan harganya transparan. Sekarang saya tahu harga pasar sebelum melepas hasil panen.',
    rating: 4,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'rev-4',
    name: 'Dewi Lestari',
    role: 'Catering Owner - Bandung',
    review:
      'Sangat puas! Pengiriman cold-chain logistics buat buah dan sayur tetap dingin dan terjaga rasanya.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'rev-5',
    name: 'Eko Prasetyo',
    role: 'Mitra Distribusi - Surabaya',
    review:
      'Sistem pembayaran Escrow bikin aman transaksi dalam jumlah besar. Gak takut uang tertahan.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
]

const TOTAL = reviewsData.length

const CARD_POSITIONS = [
  { key: 'left', classes: 'left-1/2 z-10 -translate-x-[140%] -translate-y-1/2 scale-75 border-[#E4F1EB] opacity-30 shadow-md blur-[1px]' },
  { key: 'center', classes: 'left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 scale-100 border-slate-100 shadow-2xl shadow-[#025246]/20 opacity-100 blur-0' },
  { key: 'right', classes: 'left-1/2 z-10 translate-x-[40%] -translate-y-1/2 scale-75 border-[#E4F1EB] opacity-30 shadow-md blur-[1px]' },
]

const OFFSETS = [-1, 0, 1] as const

function getReview(index: number, offset: number) {
  return reviewsData[((index + offset) % TOTAL + TOTAL) % TOTAL]
}

function CardBody({ review, isCenter }: { review: typeof reviewsData[0]; isCenter: boolean }) {
  return (
    <div className={`flex min-h-[300px] flex-col justify-between transition-opacity duration-300 ${!isCenter ? 'pointer-events-none' : ''}`}>
      <div>
        <p className="text-[17px] leading-relaxed text-[#4a5f5c]">
          &ldquo;{review.review}&rdquo;
        </p>
      </div>
      <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-5">
        <div className="relative">
          <img
            src={review.avatar}
            alt={review.name}
            loading="lazy"
            className="h-11 w-11 rounded-full border-2 border-[#E4F1EB] object-cover"
          />
          {isCenter && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400" />
          )}
        </div>
        <div className="text-left">
          <h4 className="text-sm font-bold text-[#1f1f1f]">{review.name}</h4>
          <p className="text-[11px] font-medium text-[#75938f]">{review.role}</p>
        </div>
      </div>
    </div>
  )
}

export default function Testimonial() {
  const [index, setIndex] = useState(0)
  const [locked, setLocked] = useState(false)
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  }, [])

  const navigate = useCallback(
    (delta: number) => {
      if (locked) return
      setLocked(true)
      setIndex((prev) => (prev + delta + TOTAL) % TOTAL)
    },
    [locked],
  )

  const goTo = useCallback(
    (target: number) => {
      if (locked || target === index) return
      setLocked(true)
      setIndex(target)
    },
    [locked, index],
  )

  useEffect(() => {
    if (!locked) return
    const t = setTimeout(() => setLocked(false), 600)
    return () => clearTimeout(t)
  }, [locked])

  useEffect(() => {
    // Hormati prefers-reduced-motion: matikan autoplay (PRD 9.1)
    if (reducedMotionRef.current) return
    const id = setInterval(() => {
      if (!locked) navigate(1)
    }, 5000)
    return () => clearInterval(id)
  }, [locked, navigate])

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#fafdfc] px-4 py-20 font-sans">
      {/* Header */}
      <div className="absolute top-12 z-30 w-full max-w-6xl px-4 text-center">
        <h2 className="mx-auto text-center text-[30px] font-bold leading-tight tracking-tight text-[#1f1f1f] sm:text-[34px] md:text-[38px]">
          Apa Kata <span className="text-[#025246]">Pengguna Kami</span>
        </h2>
        <p className="mt-2 text-xs text-[#75938f] sm:text-sm">
          Kenali pengalaman mereka bersama KompasDesa.
        </p>
      </div>

      {/* Cards Container */}
      <div className="relative mt-16 h-[400px] w-full max-w-5xl">
        {CARD_POSITIONS.map((pos, i) => {
          const offset = OFFSETS[i]
          const review = getReview(index, offset)
          const isCenter = pos.key === 'center'

          return (
            <div
              key={review.id}
              onClick={() => {
                if (offset !== 0) navigate(offset)
              }}
              aria-hidden={!isCenter}
              className={`absolute top-1/2 w-72 sm:w-80 rounded-3xl border bg-white p-6 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${pos.classes
                } ${!isCenter ? 'cursor-pointer hover:opacity-60' : ''}`}
            >
              <CardBody review={review} isCenter={isCenter} />
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-28 left-1/2 z-30 h-0.5 w-48 -translate-x-1/2 overflow-hidden rounded-full bg-[#025246]/10">
        <div
          key={index}
          className="testimonial-bar-fill h-full rounded-full bg-gradient-to-r from-[#025246] to-[#0fa387]"
        />
      </div>

      {/* Nav Buttons + Dots */}
      <div className="absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          disabled={locked}
          className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-[#025246] bg-white text-[#025246] shadow-md transition-all duration-300 hover:scale-110 hover:bg-[#025246] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2">
          {reviewsData.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Testimoni ${i + 1}`}
              className={`cursor-pointer rounded-full transition-all duration-300 ${i === index
                ? 'h-2.5 w-2.5 bg-[#025246] shadow-md shadow-[#025246]/30'
                : 'h-2 w-2 bg-[#025246]/20 hover:bg-[#025246]/40'
                }`}
            />
          ))}
        </div>

        <button
          onClick={() => navigate(1)}
          disabled={locked}
          className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-[#025246] bg-[#025246] text-white shadow-md transition-all duration-300 hover:scale-110 hover:bg-[#013e35] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Selanjutnya"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Counter */}
      <div className="absolute bottom-3 right-8 z-30 hidden text-xs font-medium text-[#75938f] sm:block">
        <span className="font-bold text-[#025246]">{String(index + 1).padStart(2, '0')}</span>
        <span className="mx-1">/</span>
        {String(TOTAL).padStart(2, '0')}
      </div>

      <style>{`
        .testimonial-bar-fill {
          width: 100%;
          transform-origin: left;
          animation: testimonialBarFill 5s linear forwards;
        }
        @keyframes testimonialBarFill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </section>
  )
}