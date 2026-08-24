"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const komoditasRow1 = [
  { id: "01", name: "Padi", accent: true },
  { id: "02", name: "Jagung", accent: false },
  { id: "03", name: "Cabai", accent: true },
  { id: "04", name: "Tomat", accent: false },
  { id: "05", name: "Kopi", accent: true },
  { id: "06", name: "Teh", accent: false },
];

const komoditasRow2 = [
  { id: "07", name: "Bawang", accent: false },
  { id: "08", name: "Kentang", accent: true },
  { id: "09", name: "Pisang", accent: false },
  { id: "10", name: "Sayuran", accent: true },
  { id: "11", name: "Kedelai", accent: false },
  { id: "12", name: "Kacang", accent: true },
];

export function KomoditasMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  const marquee1 = useRef<gsap.core.Tween | null>(null);
  const marquee2 = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      // Hormati prefers-reduced-motion: tampilkan konten statis tanpa animasi
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // 1. Entrance Animation
      gsap.from(containerRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%", // Mulai animasi saat 85% layar menyentuh komponen
        },
      });

      // 2. Animasi Baris 1: Bergerak Kiri (Pause saat tidak terlihat)
      marquee1.current = gsap.to(row1Ref.current, {
        xPercent: -33.3333,
        ease: "none",
        duration: 40,
        repeat: -1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom", // Saat bagian atas komponen masuk dari bawah layar
          end: "bottom top",  // Saat bagian bawah komponen keluar dari atas layar
          toggleActions: "play pause resume pause", // Otomatis Jalan/Pause berdasarkan viewport
        },
      });

      // 3. Animasi Baris 2: Bergerak Kanan (Pause saat tidak terlihat)
      gsap.set(row2Ref.current, { xPercent: -33.3333 });
      marquee2.current = gsap.to(row2Ref.current, {
        xPercent: 0,
        ease: "none",
        duration: 45,
        repeat: -1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play pause resume pause", // Otomatis Jalan/Pause berdasarkan viewport
        },
      });
    },
    { scope: containerRef }
  );

  const handleHover = (isEnter: boolean) => {
    const timeScaleValue = isEnter ? 0.15 : 1;
    const duration = isEnter ? 0.8 : 1.2;

    if (marquee1.current) {
      gsap.to(marquee1.current, { timeScale: timeScaleValue, duration, ease: "power2.out" });
    }
    if (marquee2.current) {
      gsap.to(marquee2.current, { timeScale: timeScaleValue, duration, ease: "power2.out" });
    }
  };

  const renderRow = (
    items: typeof komoditasRow1,
    ref: React.RefObject<HTMLDivElement | null>
  ) => (
    <div
      ref={ref}
      className="flex w-max group/row py-4 will-change-transform" // will-change-transform memindahkan render ke GPU
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      {[...items, ...items, ...items].map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          /* DIOPTIMASI: Menghapus blur-[3px] dan menggantinya dengan opacity murni agar rendering CPU jauh lebih ringan */
          className="group mx-7 flex cursor-default flex-col sm:mx-12 lg:mx-16 transition-opacity duration-500 ease-out hover:!opacity-100 group-hover/row:opacity-25"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-4 bg-[#025246]/20 transition-all duration-500 ease-out group-hover:w-10 group-hover:bg-[#025246]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300 transition-colors duration-500 group-hover:text-[#025246]/60">
              {item.id}
            </span>
          </div>

          <span
            className={`whitespace-nowrap text-[3.2rem] font-black leading-none tracking-[-0.06em] transition-transform duration-500 ease-out sm:text-[5rem] lg:text-[6.8rem] ${item.accent
              ? "text-[#025246]/90 group-hover:text-[#025246]"
              : "text-[#CBD5D2] group-hover:text-[#1f1f1f]"
              } group-hover:-translate-y-2 origin-bottom-left`}
          >
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#FAFAFA] py-20 font-sans sm:py-24 lg:py-28"
    >
      {/* Header */}
      <div className="mx-auto mb-14 max-w-7xl px-6 sm:mb-16 lg:mb-20 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="max-w-3xl text-[30px] font-bold leading-tight tracking-tight text-[#1f1f1f] text-center sm:text-[34px] md:text-[38px]">
            Beragam komoditas,
            <br />
            <span className="text-[#025246]">satu akses menuju pasar.</span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Menampilkan beragam hasil pertanian yang berasal dari potensi lokal
            dan siap menjangkau pasar yang lebih luas.
          </p>
        </div>
      </div>

      {/* Marquee Section */}
      <div className="relative w-full">
        {/* Fade Mask Kiri */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-28 bg-gradient-to-r from-[#FAFAFA] via-[#FAFAFA]/80 to-transparent sm:w-40 lg:w-64" />

        {/* Fade Mask Kanan */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-28 bg-gradient-to-l from-[#FAFAFA] via-[#FAFAFA]/80 to-transparent sm:w-40 lg:w-64" />

        {/* Row 1 - Bergerak Kiri */}
        <div className="mb-4">
          {renderRow(komoditasRow1, row1Ref)}
        </div>

        {/* Row 2 - Bergerak Kanan */}
        <div>
          {renderRow(komoditasRow2, row2Ref)}
        </div>
      </div>

      {/* Footer / CTA */}
      <Link
        href="/auth/login"
        className="group mt-16 flex items-center justify-center gap-4 sm:mt-20"
      >
        <p className="underline decoration-[#025246]/40 decoration-dotted underline-offset-8 transition-colors duration-300 group-hover:text-[#025246] group-hover:decoration-[#025246] font-medium text-slate-600">
          Cari Komoditas
        </p>

        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E7F0ED] transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-[#025246]">
          <ArrowRight
            className="h-3.5 w-3.5 text-[#025246] transition-transform duration-500 ease-out group-hover:translate-x-0.5 group-hover:text-white"
            strokeWidth={2.5}
          />
        </span>
      </Link>
    </section>
  );
}