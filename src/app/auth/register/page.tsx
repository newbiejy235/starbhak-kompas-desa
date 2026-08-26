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
    description: "Kendalikan harga, kelola stok, dan pasarkan hasil panenmu langsung ke meja warga tanpa perantara.",
    theme: {
      base: "bg-white border-transparent text-[#111815]",
      hover: "hover:bg-[#1B4332] hover:border-[#1B4332] hover:text-white hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(27,67,50,0.6)]",
      iconWrapBase: "bg-[#1B4332]/10 text-[#1B4332]",
      iconWrapHover: "group-hover:bg-white/10 group-hover:text-white",
      arrowBase: "text-[#111815]/30",
      arrowHover: "group-hover:text-white group-hover:rotate-45 group-hover:scale-110",
      tagBase: "bg-[#111815]/5 text-[#111815]/70",
      tagHover: "group-hover:bg-white/20 group-hover:text-white",
    },
  },
  {
    id: "user",
    href: "/auth/register/user",
    icon: ShoppingBasket,
    title: "Pembeli",
    subtitle: "Belanja Pangan Lokal",
    description: "Dapatkan bahan segar berkualitas langsung dari tangan pertama. Harga lebih jujur, petani lebih sejahtera.",
    theme: {
      base: "bg-white border-transparent text-[#111815]",
      hover: "hover:bg-[#1B4332] hover:border-[#1B4332] hover:text-white hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(27,67,50,0.6)]",
      iconWrapBase: "bg-[#1B4332]/10 text-[#1B4332]",
      iconWrapHover: "group-hover:bg-white/10 group-hover:text-white",
      arrowBase: "text-[#111815]/30",
      arrowHover: "group-hover:text-white group-hover:rotate-45 group-hover:scale-110",
      tagBase: "bg-[#111815]/5 text-[#111815]/70",
      tagHover: "group-hover:bg-white/20 group-hover:text-white",
    },
  },
];

export default function Register() {
  const containerRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<SVGSVGElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // 1. Entrance Animation untuk teks & elemen di sebelah kiri
      gsap.fromTo(
        ".fade-up",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
      );

      // 2. Entrance Animation untuk card pilihan peran
      gsap.fromTo(
        ".card-animate",
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.2, ease: "power3.out", delay: 0.2 }
      );

      // 3. Ambient Animation (Muter) untuk ornamen dekoratif kompas
      if (!reduceMotion && compassRef.current) {
        gsap.to(compassRef.current, {
          rotate: 360,
          duration: 70, // Dibuat sedikit lebih lambat agar putarannya elegan
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
      className="min-h-screen w-full bg-[#025246] text-white relative overflow-hidden flex flex-col selection:bg-white/20 selection:text-white"
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
        .font-display {
          font-family: "Plus Jakarta Sans", sans-serif;
        }
        .font-body {
          font-family: "Plus Jakarta Sans", sans-serif;
        }
      `}</style>

      {/* SVG Noise Texture Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.25] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Dekorasi Compass/Ornament 3D di Background */}
      <div className="absolute top-[-10%] left-[-30%] md:top-[-20%] md:left-[-10%] w-[700px] h-[700px] md:w-[900px] md:h-[900px] opacity-10 pointer-events-none z-0 text-white">
        <svg ref={compassRef} viewBox="0 0 100 100" fill="none" stroke="currentColor">
          {/* Outer Rings - Detail garis lingkar */}
          <circle cx="50" cy="50" r="48" strokeWidth="0.4" strokeDasharray="1 3" />
          <circle cx="50" cy="50" r="45" strokeWidth="0.1" />
          <circle cx="50" cy="50" r="33" strokeWidth="0.15" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="28" strokeWidth="0.1" />
          
          {/* Radial Sub-points (Timur Laut, Barat Laut, dsb) */}
          <path d="M22 22 L45 45 M78 22 L55 45 M78 78 L55 55 M22 78 L45 55" strokeWidth="0.15" />
          <polygon points="18,18 24,21 22,22 21,24" fill="currentColor" fillOpacity="0.4" stroke="none" />
          <polygon points="82,18 79,24 78,22 76,21" fill="currentColor" fillOpacity="0.4" stroke="none" />
          <polygon points="82,82 76,79 78,78 79,76" fill="currentColor" fillOpacity="0.4" stroke="none" />
          <polygon points="18,82 21,76 22,78 24,79" fill="currentColor" fillOpacity="0.4" stroke="none" />

          {/* Main Compass Rose (Efek Segitiga 3D / Shading) */}
          <g stroke="none">
            {/* North */}
            <polygon points="50,4 50,47 47,43" fill="currentColor" fillOpacity="0.85" />
            <polygon points="50,4 53,43 50,47" fill="currentColor" fillOpacity="0.25" />
            
            {/* East */}
            <polygon points="96,50 57,47 53,50" fill="currentColor" fillOpacity="0.85" />
            <polygon points="96,50 53,50 57,53" fill="currentColor" fillOpacity="0.25" />
            
            {/* South */}
            <polygon points="50,96 50,53 47,57" fill="currentColor" fillOpacity="0.85" />
            <polygon points="50,96 53,57 50,53" fill="currentColor" fillOpacity="0.25" />
            
            {/* West */}
            <polygon points="4,50 47,50 43,47" fill="currentColor" fillOpacity="0.85" />
            <polygon points="4,50 43,53 47,50" fill="currentColor" fillOpacity="0.25" />
          </g>
          
          {/* Center Target/Lubang Tengah */}
          <circle cx="50" cy="50" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="50" cy="50" r="7" strokeWidth="0.15" />
          <path d="M50 40 L50 43 M50 57 L50 60 M40 50 L43 50 M57 50 L60 50" strokeWidth="0.3" />
        </svg>
      </div>

      {/* Main Grid Layout */}
      <div className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 px-6 py-8 md:px-12 md:py-12">
        
        {/* LEFT COLUMN: Editorial Typography */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full pt-4 pb-0 lg:pb-8">
          <div className="mb-16 lg:mb-0 fade-up opacity-0">
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

          <div className="max-w-md xl:max-w-lg mb-8 lg:mb-24">
            <h1 className="font-display text-[2.8rem] md:text-[3.5rem] xl:text-[4.2rem] font-bold leading-[1.05] tracking-tight mb-6 fade-up opacity-0 text-white">
              Tentukan <br />
              <span className="text-white/50 italic font-light">peranmu.</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed font-body fade-up opacity-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Role Selection */}
        <div className="lg:col-span-7 flex flex-col justify-center relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full relative z-10">
            {roles.map((role, i) => {
              const isHovered = hoveredIndex === i;
              const isDimmed = hoveredIndex !== null && hoveredIndex !== i;

              return (
                <Link
                  key={role.id}
                  href={role.href}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`card-animate opacity-0 group relative flex flex-col justify-between p-8 md:p-10 rounded-[28px] border transition-all duration-500 ease-out cursor-pointer overflow-hidden aspect-[4/5] sm:aspect-[3/4] max-h-[500px] ${
                    role.theme.base
                  } ${role.theme.hover} ${
                    isDimmed ? "opacity-40 scale-[0.97] blur-[2px]" : "opacity-100 scale-100 blur-0"
                  }`}
                  aria-label={`Daftar sebagai ${role.title}`}
                >
                  {/* Top Section */}
                  <div className="flex justify-between items-start z-10">
                    <div
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${role.theme.iconWrapBase} ${role.theme.iconWrapHover}`}
                    >
                      <role.icon strokeWidth={2} size={26} />
                    </div>
                    <ArrowUpRight
                      size={28}
                      className={`transition-all duration-500 ease-out ${role.theme.arrowBase} ${role.theme.arrowHover}`}
                    />
                  </div>

                  {/* Bottom Section */}
                  <div className="z-10 mt-auto pt-12">
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold tracking-widest uppercase mb-4 transition-colors duration-500 ${role.theme.tagBase} ${role.theme.tagHover}`}
                    >
                      {role.title}
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-3">
                      {role.subtitle}
                    </h2>
                    <p
                      className={`text-sm md:text-[15px] leading-relaxed transition-colors duration-500 ${
                        isHovered ? "text-white/90" : "text-[#111815]/60"
                      }`}
                    >
                      {role.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile Footer Login Button */}
          <div className="mt-8 lg:hidden fade-up opacity-0">
            <Link
              href="/auth/login"
              className="group flex items-center justify-between w-full bg-white/5 hover:bg-white/10 border border-white/10 active:border-white/20 backdrop-blur-md px-6 py-4 rounded-2xl transition-all duration-300"
            >
              <span className="text-sm font-medium text-white/70">
                Sudah punya akun? <strong className="text-white ml-1">Masuk</strong>
              </span>
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-active:bg-white group-active:text-[#025246] transition-colors">
                <ArrowRight size={14} className="group-active:translate-x-0.5 transition-transform" />
              </div>
            </Link>
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