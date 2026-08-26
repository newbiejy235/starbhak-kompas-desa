"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sprout, ShoppingBasket, ArrowLeft, ArrowUpRight, ArrowRight } from "lucide-react";
import gsap from "gsap";

const roles = [
  {
    id: "petani",
    href: "/auth/register/petani",
    icon: Sprout,
    title: "Petani",
    subtitle: "Jual Hasil Panen",
    description: "Kendalikan harga, kelola stok, dan pasarkan hasil panenmu langsung tanpa perantara.",
  },
  {
    id: "user",
    href: "/auth/register/user",
    icon: ShoppingBasket,
    title: "Pembeli",
    subtitle: "Belanja Pangan Lokal",
    description: "Dapatkan bahan segar berkualitas langsung dari tangan pertama dengan harga jujur.",
  },
];

export default function Register() {
  const containerRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<SVGSVGElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".fade-up",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out" }
      );

      gsap.fromTo(
        ".card-animate",
        { y: 35, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.15, ease: "power3.out", delay: 0.15 }
      );

      if (!reduceMotion && compassRef.current) {
        gsap.to(compassRef.current, {
          rotate: 360,
          duration: 70,
          repeat: -1,
          ease: "none",
          transformOrigin: "50% 50%",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-[#025246] text-white relative overflow-hidden flex flex-col selection:bg-white/20 selection:text-white font-sans"
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
        .font-display {
          font-family: "Plus Jakarta Sans", sans-serif;
        }
      `}</style>

      {/* SVG Noise Texture Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.22] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Background Compass Decoration */}
      <div className="absolute top-[-10%] left-[-30%] md:top-[-20%] md:left-[-10%] w-[700px] h-[700px] md:w-[900px] md:h-[900px] opacity-10 pointer-events-none z-0 text-white">
        <svg ref={compassRef} viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <circle cx="50" cy="50" r="48" strokeWidth="0.4" strokeDasharray="1 3" />
          <circle cx="50" cy="50" r="45" strokeWidth="0.1" />
          <circle cx="50" cy="50" r="33" strokeWidth="0.15" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="28" strokeWidth="0.1" />
          
          <path d="M22 22 L45 45 M78 22 L55 45 M78 78 L55 55 M22 78 L45 55" strokeWidth="0.15" />
          <polygon points="18,18 24,21 22,22 21,24" fill="currentColor" fillOpacity="0.4" stroke="none" />
          <polygon points="82,18 79,24 78,22 76,21" fill="currentColor" fillOpacity="0.4" stroke="none" />
          <polygon points="82,82 76,79 78,78 79,76" fill="currentColor" fillOpacity="0.4" stroke="none" />
          <polygon points="18,82 21,76 22,78 24,79" fill="currentColor" fillOpacity="0.4" stroke="none" />

          <g stroke="none">
            <polygon points="50,4 50,47 47,43" fill="currentColor" fillOpacity="0.85" />
            <polygon points="50,4 53,43 50,47" fill="currentColor" fillOpacity="0.25" />
            <polygon points="96,50 57,47 53,50" fill="currentColor" fillOpacity="0.85" />
            <polygon points="96,50 53,50 57,53" fill="currentColor" fillOpacity="0.25" />
            <polygon points="50,96 50,53 47,57" fill="currentColor" fillOpacity="0.85" />
            <polygon points="50,96 53,57 50,53" fill="currentColor" fillOpacity="0.25" />
            <polygon points="4,50 47,50 43,47" fill="currentColor" fillOpacity="0.85" />
            <polygon points="4,50 43,53 47,50" fill="currentColor" fillOpacity="0.25" />
          </g>
          
          <circle cx="50" cy="50" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="50" cy="50" r="7" strokeWidth="0.15" />
          <path d="M50 40 L50 43 M50 57 L50 60 M40 50 L43 50 M57 50 L60 50" strokeWidth="0.3" />
        </svg>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 px-6 py-8 md:px-12 md:py-12 items-center">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-6 flex flex-col justify-between h-full pt-4 pb-0">
          <div className="mb-12 lg:mb-16 fade-up opacity-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-white/70 hover:text-white transition-colors duration-300 font-medium text-sm w-max group"
            >
              <div className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#025246] transition-all duration-300">
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              </div>
              Kembali ke Beranda
            </Link>
          </div>

          <div className="max-w-xl my-auto">
            <h1 className="font-display text-[2.8rem] md:text-[3.5rem] xl:text-[4.2rem] font-bold leading-[1.05] tracking-tight mb-5 fade-up opacity-0 text-white">
              Tentukan <br />
              <span className="text-emerald-300/80 italic font-light">peranmu.</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed font-normal fade-up opacity-0 max-w-lg">
              Bergabunglah dengan sistem Kompas&apos;Desa. Pilih akses akun Anda untuk mulai bertransaksi secara langsung.
            </p>
          </div>

          <div className="hidden lg:block text-xs text-white/40 font-medium mt-12 fade-up opacity-0">
            &copy; 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
          </div>
        </div>

        {/* RIGHT PANEL - Compact Interactive Buttons */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto lg:ml-auto">
            
            {/* Header Teks Pilihan Peran */}
            <div className="mb-6 fade-up opacity-0">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/10 text-emerald-200 text-[11px] font-bold tracking-widest uppercase mb-2 backdrop-blur-sm">
                Pilihan pendaftaran
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Daftar sebagai...
              </h2>
            </div>

            {/* List Option Cards */}
            <div className="flex flex-col gap-4">
              {roles.map((role, i) => {
                const isHovered = hoveredIndex === i;
                const isDimmed = hoveredIndex !== null && hoveredIndex !== i;

                return (
                  <Link
                    key={role.id}
                    href={role.href}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`card-animate opacity-0 group relative flex items-center justify-between p-5 md:p-6 rounded-2xl bg-white text-[#111815] transition-all duration-300 ease-out cursor-pointer hover:bg-[#1B4332] hover:text-white hover:-translate-y-1 hover:shadow-[0_16px_32px_-10px_rgba(0,0,0,0.3)] ${
                      isDimmed ? "opacity-50 scale-[0.98] blur-[1px]" : "opacity-100 scale-100"
                    }`}
                    aria-label={`Daftar sebagai ${role.title}`}
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl flex items-center justify-center bg-[#025246]/10 text-[#025246] group-hover:bg-white/15 group-hover:text-white transition-colors shrink-0">
                        <role.icon strokeWidth={2} size={24} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-[#111815]/5 text-[#111815]/70 group-hover:bg-white/20 group-hover:text-white transition-colors">
                            {role.title}
                          </span>
                        </div>
                        <h3 className="font-display text-lg md:text-xl font-bold tracking-tight group-hover:text-white transition-colors">
                          {role.subtitle}
                        </h3>
                        <p className="text-xs md:text-sm text-[#111815]/60 group-hover:text-white/80 line-clamp-1 mt-0.5 transition-colors font-medium">
                          {role.description}
                        </p>
                      </div>
                    </div>

                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-black/5 group-hover:bg-white/20 text-[#111815]/40 group-hover:text-white transition-all shrink-0 ml-2">
                      <ArrowUpRight
                        size={20}
                        className="transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Footer Auth */}
            <div className="mt-8 lg:hidden fade-up opacity-0">
              <Link
                href="/auth/login"
                className="group flex items-center justify-between w-full bg-white/5 hover:bg-white/10 border border-white/10 active:border-white/20 backdrop-blur-md px-5 py-3.5 rounded-xl transition-all duration-300"
              >
                <span className="text-sm font-medium text-white/70">
                  Sudah punya akun? <strong className="text-white ml-1">Masuk</strong>
                </span>
                <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center group-active:bg-white group-active:text-[#025246] transition-colors">
                  <ArrowRight size={13} className="group-active:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>

          </div>
        </div>
      </div>
      
      {/* Desktop Floating Auth Button */}
      <div className="absolute top-8 right-8 lg:top-12 lg:right-12 hidden lg:block z-20 fade-up opacity-0">
        <Link
          href="/auth/login"
          className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-md pl-6 pr-2 py-2 rounded-full transition-all duration-300 shadow-lg shadow-black/5"
        >
          <span className="text-sm font-medium text-white/70">
            Sudah punya akun? <strong className="text-white ml-1">Masuk</strong>
          </span>
          <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#025246] transition-colors">
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}