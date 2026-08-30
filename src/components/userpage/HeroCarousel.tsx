"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sprout, Tag, TrendingUp } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  description: string;
  cta: string;
  ctaHref: string;
  icon: typeof Sprout;
  gradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Panen Raya 2026",
    description: "Diskon hingga 30% untuk komoditas pilihan musim panen ini. Dapatkan beras organik, sayuran segar, dan buah-buahan lokal terbaik langsung dari petani.",
    cta: "Lihat Promo",
    ctaHref: "#katalog",
    icon: Tag,
    gradient: "from-primary via-primary-dark to-secondary",
  },
  {
    id: 2,
    title: "Komoditas Populer",
    description: "Jelajahi produk paling dicari minggu ini: beras merah, cabai keriting, tomat grade A, dan jahe segar dari kebun petani terverifikasi.",
    cta: "Jelajahi Sekarang",
    ctaHref: "#katalog",
    icon: TrendingUp,
    gradient: "from-primary via-primary-dark to-secondary",
  },
  {
    id: 3,
    title: "Dukung Petani Lokal",
    description: "Setiap pembelian Anda membantu petani desa mendapatkan harga yang adil. Belanja langsung, harga transparan, kualitas terjamin.",
    cta: "Mulai Belanja",
    ctaHref: "#katalog",
    icon: Sprout,
    gradient: "from-primary via-primary-dark to-secondary",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <section
      className="relative mb-8 rounded-card overflow-hidden shadow-soft animate-fade-up"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`bg-gradient-to-r ${slide.gradient} text-white transition-all duration-700`}>
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 min-h-[220px] sm:min-h-[260px] flex items-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-6 right-10 w-40 h-40 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-4 left-1/3 w-56 h-56 rounded-full bg-white/30 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-xl animate-fade-in" key={slide.id}>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Icon size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
              {slide.title}
            </h2>
            <p className="text-white/80 text-sm sm:text-base mb-6 max-w-lg leading-relaxed">
              {slide.description}
            </p>
            <a
              href={slide.ctaHref}
              className="inline-block bg-white text-primary px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-50 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm"
            >
              {slide.cta}
            </a>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        aria-label="Slide sebelumnya"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all duration-200 active:scale-90"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Slide berikutnya"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all duration-200 active:scale-90"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
