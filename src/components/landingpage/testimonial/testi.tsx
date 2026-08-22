'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'

const reviewsData = [
  {
    name: 'Budi Santoso',
    role: 'Petani Sayur - Bogor',
    review:
      'Aplikasi ini sangat membantu menyalurkan panen cabai saya langsung ke tengkulak kota tanpa potongan sadis!',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Budi Santoso',
    role: 'Petani Sayur - Bogor',
    review:
      'Aplikasi ini sangat membantu menyalurkan panen cabai saya langsung ke tengkulak kota tanpa potongan sadis!',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Siti Aminah',
    role: 'Pemilik Restoran - Jakarta',
    review:
      'Bahan makanan selalu segar karena dikirim langsung dari lahan mitra. Pasokan restoran jadi aman terus.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pak Haryanto',
    role: 'Petani Padi - Karawang',
    review:
      'Fitur pemantauan harganya transparan. Sekarang saya tahu harga pasar sebelum melepas hasil panen.',
    rating: 4,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dewi Lestari',
    role: 'Catering Owner - Bandung',
    review:
      'Sangat puas! Pengiriman cold-chain logistics buat buah dan sayur tetap dingin dan terjaga rasanya.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  },
  {
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
  { key: 'left', classes: 'left-1/2 z-10 -translate-x-[145%] -translate-y-1/2 scale-[0.85] border-[#E4F1EB] opacity-40 shadow-lg' },
  { key: 'center', classes: 'left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 scale-100 border-slate-100 shadow-2xl shadow-[#025246]/15' },
  { key: 'right', classes: 'left-1/2 z-10 translate-x-[45%] -translate-y-1/2 scale-[0.85] border-[#E4F1EB] opacity-40 shadow-lg' },
]

const OFFSETS = [-1, 0, 1] as const

function getReview(index: number, offset: number) {
  return reviewsData[((index + offset) % TOTAL + TOTAL) % TOTAL]
}

function Stars({ count }: { count: number }) {
  return (
    <div className="mb-5 flex gap-3 items-center">
      <div className="flex gap-1 items-center">
        {Array.from({ length: count }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <div>
        <p className="text-[11px] leading-relaxed text-[#75938f]">
          <span className="font-bold text-[#025246] text-[13px]">{count}.0</span> / 5.0
        </p>
      </div>
    </div>
  )
}

function CardBody({ review, isCenter }: { review: ReturnType<typeof getReview>; isCenter: boolean }) {
  return (
    <div className={`flex min-h-[300px] flex-col justify-between ${!isCenter ? 'pointer-events-none' : ''}`}>
      <div>
        <Stars count={review.rating} />
        <p className="text-[17px] italic leading-relaxed text-[#4a5f5c]">
          &ldquo;{review.review}&rdquo;
        </p>
      </div>
      <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-5">
        <div className="relative">
          <img
            src={review.avatar}
            alt={review.name}
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
    const t = setTimeout(() => setLocked(false), 500)
    return () => clearTimeout(t)
  }, [locked])

  useEffect(() => {
    const id = setInterval(() => {
      if (!locked) navigate(1)
    }, 5000)
    return () => clearInterval(id)
  }, [locked, navigate])

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#fafdfc] px-4 py-20 font-sans">
      <TSParticles />
      <GlowOrbs />

      {/* grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(2,82,70,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(2,82,70,.3) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* header */}
      <div className="absolute top-12 z-30 max-w-xl px-4 text-center">
        <h2 className="max-w-3xl font-bold leading-tight tracking-tight text-[#1f1f1f] text-3xl sm:text-3xl md:text-3xl text-center">
          Apa Kata{' '}
          <span className="">
            Pengguna Kami
          </span>
        </h2>
        <p className="mt-2 text-xs text-[#75938f] sm:text-sm">
          Lihat pengalaman mitra kami melalui tombol navigasi.
        </p>
      </div>

      {/* cards */}
      <div className="relative mt-16 h-[400px] w-full max-w-5xl">
        {CARD_POSITIONS.map((pos, i) => {
          const offset = OFFSETS[i]
          const review = getReview(index, offset)
          const isCenter = pos.key === 'center'

          return (
            <div
              key={pos.key}
              className={`absolute top-1/2 w-72 sm:w-80 rounded-3xl border bg-white p-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${pos.classes}`}
            >
              {isCenter && (
                <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-50" style={{
                  background: 'linear-gradient(135deg,#025246,#0fa387,#E4F1EB,#0fa387,#025246)',
                  backgroundSize: '400% 400%',
                  animation: 'testimonialGBorder 4s ease infinite',
                  mask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                  padding: '1px',
                  borderRadius: '1.5rem',
                }} />
              )}
              <CardBody review={review} isCenter={isCenter} />
            </div>
          )
        })}
      </div>

      <div className="absolute bottom-30 left-1/2 z-30 h-0.5 w-48 -translate-x-1/2 overflow-hidden rounded-full bg-[#025246]/10">
        <div
          key={index}
          className="h-full rounded-full bg-gradient-to-r from-[#025246] to-[#0fa387] testimonial-bar-fill"
        />
      </div>


      {/* nav buttons + dots */}
      <div className="absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          disabled={locked}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#025246] bg-white text-[#025246] shadow-md transition-all duration-300 hover:scale-110 hover:bg-[#025246] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
              className={`rounded-full transition-all duration-300 cursor-pointer ${i === index
                ? 'h-2.5 w-2.5 bg-[#025246] shadow-md shadow-[#025246]/30'
                : 'h-2 w-2 bg-[#025246]/20 hover:bg-[#025246]/40'
                }`}
            />
          ))}
        </div>

        <button
          onClick={() => navigate(1)}
          disabled={locked}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#025246] bg-[#025246] text-white shadow-md transition-all duration-300 hover:scale-110 hover:bg-[#013e35] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          aria-label="Selanjutnya"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>


      {/* counter */}
      <div className="absolute bottom-3 right-8 z-30 hidden text-xs font-medium text-[#75938f] sm:block">
        <span className="font-bold text-[#025246]">{String(index + 1).padStart(2, '0')}</span>
        <span className="mx-1">/</span>
        {String(TOTAL).padStart(2, '0')}
      </div>

      <style>{`
        @keyframes testimonialFloat {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          25% { transform: translateY(-18px) translateX(8px) scale(1.08); }
          50% { transform: translateY(-6px) translateX(-6px) scale(0.96); }
          75% { transform: translateY(-22px) translateX(4px) scale(1.04); }
        }
        @keyframes testimonialOrb {
          0%, 100% { transform: scale(1); opacity: 0.12; }
          50% { transform: scale(1.25); opacity: 0.22; }
        }
        @keyframes testimonialGBorder {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
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

const PARTICLES = [
  { w: 4, l: 8, t: 12, o: 0.08, d: 7, dl: 0 },
  { w: 6, l: 22, t: 35, o: 0.12, d: 9, dl: 1 },
  { w: 3, l: 45, t: 8, o: 0.06, d: 11, dl: 2 },
  { w: 5, l: 67, t: 52, o: 0.1, d: 8, dl: 0.5 },
  { w: 4, l: 80, t: 20, o: 0.09, d: 10, dl: 3 },
  { w: 3, l: 15, t: 70, o: 0.07, d: 12, dl: 1.5 },
  { w: 5, l: 55, t: 85, o: 0.11, d: 7.5, dl: 4 },
  { w: 4, l: 90, t: 45, o: 0.08, d: 9.5, dl: 2.5 },
  { w: 3, l: 35, t: 60, o: 0.06, d: 11.5, dl: 0.8 },
  { w: 6, l: 72, t: 78, o: 0.13, d: 6.5, dl: 3.5 },
  { w: 4, l: 10, t: 90, o: 0.07, d: 10.5, dl: 1.2 },
  { w: 5, l: 50, t: 25, o: 0.1, d: 8.5, dl: 4.5 },
]

function TSParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#025246]"
          style={{
            width: p.w,
            height: p.w,
            left: `${p.l}%`,
            top: `${p.t}%`,
            opacity: p.o,
            animation: `testimonialFloat ${p.d}s ease-in-out ${p.dl}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function GlowOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full blur-3xl"
      />
      <div
        className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle,#025246 0%,transparent 70%)',
          opacity: 0.1,
          animation: 'testimonialOrb 9s ease-in-out 2s infinite',
        }}
      />
    </div>
  )
}
