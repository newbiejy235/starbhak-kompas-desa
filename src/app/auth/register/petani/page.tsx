"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  Compass,
  ArrowLeft,
  ArrowRight,
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

      if (compassRef.current) {
        gsap.to(compassRef.current, {
          rotation: 360,
          duration: 60,
          repeat: -1,
          ease: "linear",
          transformOrigin: "center center",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full relative bg-[#FAFAFA] font-sans overflow-hidden flex flex-col justify-between"
    >
      <svg
        className="bg-curve absolute top-0 left-0 w-full lg:w-[58%] h-full z-0 drop-shadow-2xl pointer-events-none hidden lg:block"
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

      <header className="relative z-20 w-full flex items-center justify-between px-6 py-4 lg:px-12 xl:px-16 shrink-0">
        <div className="header-item flex items-center gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-neutral-800 text-xs lg:text-sm font-semibold px-3.5 py-2 rounded-full shadow-sm hover:bg-neutral-50 hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft size={15} />
            Kembali
          </Link>
          <div className="hidden sm:flex items-center gap-2.5 ml-2 lg:text-white text-emerald-950">
            <div className="relative flex items-center justify-center bg-gradient-to-br p-1.5 rounded-lg shadow-sm w-8 h-8">
              <Image 
                src="/logo-kompas-desa/kompas_logo_icon.png" 
                alt="Logo Kompas Desa" 
                fill
                sizes="32px"
                className="object-contain p-1"
                priority
              />
            </div>
            <span className="text-lg lg:text-xl font-bold tracking-tight">
              Kompas&apos;Desa
            </span>
          </div>
        </div>

        <div className="header-item flex items-center gap-4">
          <span className="hidden md:block text-sm font-medium text-neutral-500">
            Sudah punya akun?
          </span>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center bg-white border border-neutral-200 text-neutral-800 text-xs lg:text-sm font-bold px-5 py-2 rounded-full shadow-sm hover:border-emerald-600 hover:text-emerald-700 transition-all duration-200"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between w-full max-w-[1500px] mx-auto px-6 lg:px-12 xl:px-16 overflow-hidden my-auto">
        <div className="w-full lg:w-[45%] flex flex-col justify-center py-4 lg:py-0 text-emerald-950 lg:text-white relative">
          <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-soft-light z-0 hidden lg:block">
            <Compass
              ref={compassRef}
              size={550}
              strokeWidth={0.5}
              className="text-white/20 drop-shadow-2xl"
            />
          </div>

          <div className="relative z-10 w-full max-w-[460px]">
            <div className="left-anim-item inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E3A93B]/10 lg:bg-[#E3A93B]/15 border border-[#E3A93B]/30 text-[#E3A93B] lg:text-[#FCD34D] text-[11px] font-bold tracking-[0.15em] uppercase mb-4 lg:mb-6 backdrop-blur-sm shadow-sm">
              <Compass size={13} />
              Pendaftaran Petani
            </div>

            <h1 className="left-anim-item text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.1] mb-3 lg:mb-4 drop-shadow-sm">
              Bergabung Bersama <br />
              <span className="text-emerald-600 lg:text-emerald-400">
                KompasDesa
              </span>
            </h1>

            <p className="left-anim-item text-xs sm:text-sm lg:text-base text-emerald-800/80 lg:text-emerald-100/90 leading-relaxed font-medium">
              Perluas pasar, jangkau pembeli langsung tanpa perantara, dan kembangkan hasil pertanianmu bersama kami.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-[45%] flex flex-col justify-center items-center lg:items-start py-4 lg:py-0 relative">
          <div className="w-full max-w-[420px]">
            <div className="right-anim-item flex items-center gap-3 mb-4 lg:mb-5">
              <div className="flex gap-1.5">
                <div className="h-1.5 w-7 rounded-full bg-emerald-600 transition-all duration-300"></div>
                <div className="h-1.5 w-7 rounded-full bg-neutral-200 transition-all duration-300"></div>
                <div className="h-1.5 w-7 rounded-full bg-neutral-200 transition-all duration-300"></div>
              </div>
              <span className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider">
                Langkah 1 dari 3
              </span>
            </div>

            <div className="right-anim-item mb-4 lg:mb-5 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1">
                Informasi Dasar
              </h2>
              <p className="text-xs lg:text-sm text-neutral-500 font-medium">
                Lengkapi data diri Anda untuk memulai pembuatan akun.
              </p>
            </div>

            <form onSubmit={handleNext} className="flex flex-col gap-3">
              <div className="right-anim-item flex flex-col gap-1">
                <label
                  htmlFor="fullName"
                  className="text-[12px] font-bold text-neutral-700 ml-1"
                >
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <User size={16} strokeWidth={2.5} />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-xl border-2 border-neutral-200 bg-white py-2.5 lg:py-3 pl-10 pr-4 text-xs lg:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item flex flex-col gap-1">
                <label
                  htmlFor="username"
                  className="text-[12px] font-bold text-neutral-700 ml-1"
                >
                  Nama Pengguna
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <UserCircle size={16} strokeWidth={2.5} />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Pilih nama pengguna (username)"
                    className="w-full rounded-xl border-2 border-neutral-200 bg-white py-2.5 lg:py-3 pl-10 pr-4 text-xs lg:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item flex flex-col gap-1">
                <label
                  htmlFor="phone"
                  className="text-[12px] font-bold text-neutral-700 ml-1"
                >
                  Nomor Telepon
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Phone size={16} strokeWidth={2.5} />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full rounded-xl border-2 border-neutral-200 bg-white py-2.5 lg:py-3 pl-10 pr-4 text-xs lg:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item flex flex-col gap-1">
                <label
                  htmlFor="email"
                  className="text-[12px] font-bold text-neutral-700 ml-1"
                >
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Mail size={16} strokeWidth={2.5} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border-2 border-neutral-200 bg-white py-2.5 lg:py-3 pl-10 pr-4 text-xs lg:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item pt-2">
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 lg:py-3.5 text-xs lg:text-sm font-extrabold text-white shadow-md shadow-emerald-500/25 transition-all duration-200 ease-out hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span>Lanjutkan ke Tahap 2</span>
                  <ArrowRight
                    size={16}
                    strokeWidth={2.5}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="footer-anim relative z-10 w-full text-center py-4 text-[11px] font-medium text-neutral-400 shrink-0">
        &copy; 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}