"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  Compass,
  ArrowLeft,
  User,
  UserCircle,
  Phone,
  Mail,
} from "lucide-react";
import { saveRegisterDraft } from "@/lib/register";
import Image from "next/image";

export default function RegisterPetani() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<SVGSVGElement>(null);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    saveRegisterDraft({ fullName, username, noTelp: phone, email });
    router.push("/auth/register/petani/profile");
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(".bg-curve", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.2,
      })
        .from(
          ".header-item",
          {
            opacity: 0,
            y: -20,
            stagger: 0.1,
            duration: 0.6,
          },
          "-=0.8"
        )
        .from(
          ".left-anim-item",
          {
            opacity: 0,
            x: -30,
            stagger: 0.1,
            duration: 0.8,
          },
          "-=0.6"
        )
        .from(
          ".right-anim-item",
          {
            opacity: 0,
            y: 20,
            stagger: 0.06,
            duration: 0.7,
          },
          "-=0.7"
        )
        .from(
          ".footer-anim",
          {
            opacity: 0,
            y: 10,
            duration: 0.5,
          },
          "-=0.4"
        );

      // Animasi Kompas 3D berputar
      if (!reduceMotion && compassRef.current) {
        gsap.to(compassRef.current, {
          rotation: 360,
          duration: 70,
          repeat: -1,
          ease: "none",
          transformOrigin: "center center",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full relative bg-[#FAFAFA] font-sans overflow-hidden flex flex-col justify-between selection:bg-emerald-600/20 selection:text-emerald-900"
    >
      {/* Background Left Curve */}
      <svg
        className="bg-curve absolute top-0 left-0 w-full lg:w-[55%] xl:w-[58%] h-full z-0 drop-shadow-2xl pointer-events-none hidden lg:block"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#022c22" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
        </defs>
        <path
          d="M0,0 L72,0 C90,35 88,75 58,100 L0,100 Z"
          fill="url(#emeraldGrad)"
        />
      </svg>

      {/* HEADER */}
      <header className="relative z-20 w-full flex items-center justify-between px-6 py-3 lg:px-10 xl:px-16 shrink-0 min-h-[60px]">
        <div className="header-item flex items-center gap-3 xl:gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-neutral-800 text-[11px] lg:text-xs xl:text-sm font-semibold px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-full shadow-sm hover:bg-neutral-50 hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft size={14} />
            Kembali
          </Link>
          <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 ml-1 lg:ml-2 lg:text-white text-emerald-950">
            <div className="relative flex items-center justify-center bg-white/10 lg:bg-white/20 p-1 lg:p-1.5 rounded-lg shadow-sm backdrop-blur-sm w-7 h-7 xl:w-8 xl:h-8 border border-white/10">
              <Image 
                src="/logo-kompas-desa/kompas_logo_icon.png" 
                alt="Logo Kompas Desa" 
                fill
                sizes="32px"
                className="object-contain p-0.5 xl:p-1 brightness-0 invert lg:brightness-100 lg:invert-0"
                priority
              />
            </div>
            <span className="text-base lg:text-lg xl:text-xl font-bold tracking-tight">
              Kompas&apos;Desa
            </span>
          </div>
        </div>

        <div className="header-item flex items-center gap-3 xl:gap-4">
          <span className="hidden md:block text-xs xl:text-sm font-medium text-neutral-500 lg:text-emerald-50 lg:mix-blend-overlay">
            Sudah punya akun?
          </span>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center bg-white border border-neutral-200 text-neutral-800 text-[11px] lg:text-xs xl:text-sm font-bold px-4 py-1.5 xl:px-5 xl:py-2 rounded-full shadow-sm hover:border-emerald-600 hover:text-emerald-700 transition-all duration-200"
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between w-full max-w-[1400px] mx-auto px-6 lg:px-10 xl:px-16 overflow-hidden my-auto h-full min-h-[500px]">
        
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center py-2 lg:py-0 text-emerald-950 lg:text-white relative h-full">
          
          {/* 3D Compass Decoration */}
          <div className="absolute top-1/2 left-[30%] lg:left-[40%] xl:left-[36%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 hidden lg:block w-[400px] h-[400px] xl:w-[600px] xl:h-[600px] opacity-15 text-white">
             <svg ref={compassRef} viewBox="0 0 100 100" fill="none" stroke="currentColor">
              {/* Outer Rings */}
              <circle cx="50" cy="50" r="48" strokeWidth="0.4" strokeDasharray="1 3" />
              <circle cx="50" cy="50" r="45" strokeWidth="0.1" />
              <circle cx="50" cy="50" r="33" strokeWidth="0.15" strokeDasharray="2 2" />
              <circle cx="50" cy="50" r="28" strokeWidth="0.1" />
              
              {/* Radial Sub-points */}
              <path d="M22 22 L45 45 M78 22 L55 45 M78 78 L55 55 M22 78 L45 55" strokeWidth="0.15" />
              <polygon points="18,18 24,21 22,22 21,24" fill="currentColor" fillOpacity="0.4" stroke="none" />
              <polygon points="82,18 79,24 78,22 76,21" fill="currentColor" fillOpacity="0.4" stroke="none" />
              <polygon points="82,82 76,79 78,78 79,76" fill="currentColor" fillOpacity="0.4" stroke="none" />
              <polygon points="18,82 21,76 22,78 24,79" fill="currentColor" fillOpacity="0.4" stroke="none" />

              {/* Main Compass Rose (Shading/3D) */}
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
              
              {/* Center Target */}
              <circle cx="50" cy="50" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="50" cy="50" r="7" strokeWidth="0.15" />
              <path d="M50 40 L50 43 M50 57 L50 60 M40 50 L43 50 M57 50 L60 50" strokeWidth="0.3" />
            </svg>
          </div>

          <div className="relative z-10 w-full max-w-[420px] xl:max-w-[460px]">
            <div className="left-anim-item inline-flex items-center gap-1.5 px-3 py-1 xl:px-3.5 xl:py-1.5 rounded-full bg-[#E3A93B]/10 lg:bg-[#E3A93B]/15 border border-[#E3A93B]/30 text-[#E3A93B] lg:text-[#FCD34D] text-[10px] xl:text-[11px] font-bold tracking-[0.15em] uppercase mb-3 xl:mb-5 backdrop-blur-sm shadow-sm w-max">
              <Compass size={12} className="xl:w-[13px] xl:h-[13px]" />
              Pendaftaran Petani
            </div>

            <h1 className="left-anim-item text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1] mb-2 xl:mb-4 drop-shadow-sm">
              Bergabung Bersama <br />
              <span className="text-emerald-600 lg:text-emerald-400">
                KompasDesa
              </span>
            </h1>

            <p className="left-anim-item text-xs sm:text-sm xl:text-base text-emerald-800/80 lg:text-emerald-100/90 leading-relaxed font-medium">
              Perluas pasar, jangkau pembeli langsung tanpa perantara, dan kembangkan hasil pertanianmu bersama kami.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN (FORM) */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center items-center lg:items-start py-2 lg:py-0 relative h-full">
          <div className="w-full max-w-[400px] xl:max-w-[420px] bg-white lg:bg-transparent rounded-3xl lg:rounded-none p-6 lg:p-0 shadow-xl shadow-black/5 lg:shadow-none border border-neutral-100 lg:border-none">
            
            <div className="right-anim-item flex items-center gap-2 xl:gap-3 mb-3 xl:mb-4">
              <div className="flex gap-1.5 xl:gap-2">
                <div className="h-1 w-6 xl:h-1.5 xl:w-7 rounded-full bg-emerald-600 transition-all duration-300"></div>
                <div className="h-1 w-6 xl:h-1.5 xl:w-7 rounded-full bg-neutral-200 transition-all duration-300"></div>
                <div className="h-1 w-6 xl:h-1.5 xl:w-7 rounded-full bg-neutral-200 transition-all duration-300"></div>
              </div>
              <span className="text-[10px] xl:text-[12px] font-bold text-neutral-400 uppercase tracking-wider">
                Langkah 1 dari 3
              </span>
            </div>

            <div className="right-anim-item mb-4 xl:mb-5">
              <h2 className="text-xl xl:text-2xl font-extrabold text-neutral-900 tracking-tight mb-0.5 xl:mb-1">
                Informasi Dasar
              </h2>
              <p className="text-[11px] xl:text-xs text-neutral-500 font-medium">
                Lengkapi data diri Anda untuk memulai.
              </p>
            </div>

            <form onSubmit={handleNext} className="flex flex-col gap-2.5 xl:gap-3.5">
              {/* Nama Lengkap */}
              <div className="right-anim-item flex flex-col gap-1">
                <label
                  htmlFor="fullName"
                  className="text-[11px] xl:text-[12px] font-bold text-neutral-700 ml-1"
                >
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <User size={15} strokeWidth={2.5} />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-xl border-2 border-neutral-200 bg-neutral-50/50 lg:bg-white py-2 xl:py-2.5 pl-9 pr-3 text-xs xl:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                    required
                  />
                </div>
              </div>

              {/* Nama Pengguna */}
              <div className="right-anim-item flex flex-col gap-1">
                <label
                  htmlFor="username"
                  className="text-[11px] xl:text-[12px] font-bold text-neutral-700 ml-1"
                >
                  Nama Pengguna
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <UserCircle size={15} strokeWidth={2.5} />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Pilih nama pengguna"
                    className="w-full rounded-xl border-2 border-neutral-200 bg-neutral-50/50 lg:bg-white py-2 xl:py-2.5 pl-9 pr-3 text-xs xl:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                    required
                  />
                </div>
              </div>

              {/* Nomor Telepon */}
              <div className="right-anim-item flex flex-col gap-1">
                <label
                  htmlFor="phone"
                  className="text-[11px] xl:text-[12px] font-bold text-neutral-700 ml-1"
                >
                  Nomor Telepon
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Phone size={15} strokeWidth={2.5} />
                  </div>
                  <input
                    id="phone"
                    type="number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full rounded-xl border-2 border-neutral-200 bg-neutral-50/50 lg:bg-white py-2 xl:py-2.5 pl-9 pr-3 text-xs xl:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="right-anim-item flex flex-col gap-1">
                <label
                  htmlFor="email"
                  className="text-[11px] xl:text-[12px] font-bold text-neutral-700 ml-1"
                >
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Mail size={15} strokeWidth={2.5} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border-2 border-neutral-200 bg-neutral-50/50 lg:bg-white py-2 xl:py-2.5 pl-9 pr-3 text-xs xl:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                    required
                  />
                </div>
              </div>

              {/* Tombol Lanjut */}
              <div className="right-anim-item pt-1 xl:pt-2 mt-1 xl:mt-0">
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 xl:py-3 text-xs xl:text-sm font-extrabold text-white shadow-md shadow-emerald-500/25 transition-all duration-200 ease-out hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span>Lanjutkan ke Tahap 2</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer-anim relative z-20 w-full text-center py-3 xl:py-4 text-[10px] xl:text-[11px] font-medium text-neutral-400 shrink-0 min-h-[40px]">
        &copy; 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}