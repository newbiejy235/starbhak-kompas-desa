"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  User,
  Lock
} from "lucide-react";
import { loginAction } from "@/actions/auth";
import { saveSession } from "@/lib/auth/client";
import { initialState } from "@/lib/types/auth";
import type { LoginResult } from "@/lib/auth/auth.service";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [state, formAction, pending] = useActionState<LoginResult, FormData>(
    loginAction,
    initialState as LoginResult,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.success && state.token && state.user && state.redirect) {
      saveSession(state.token, state.user);
      router.replace(state.redirect);
    }
  }, [state, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial Load Timeline
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(".bg-curve", { 
        scaleX: 0, 
        transformOrigin: "left center", 
        duration: 1.2 
      })
      .from(".header-item", { 
        opacity: 0, 
        y: -20, 
        stagger: 0.1, 
        duration: 0.6 
      }, "-=0.8")
      .from(".left-anim-item", {
        opacity: 0,
        x: -30,
        stagger: 0.1,
        duration: 0.8,
      }, "-=0.6")
      .from(".right-anim-item", {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.7,
      }, "-=0.7")
      .from(".footer-anim", {
        opacity: 0,
        y: 10,
        duration: 0.5
      }, "-=0.4");

      // 2. Ambient Floating Elements Animation (Hanya jalan di desktop)
      const circles = floatingElementsRef.current?.children;
      if (circles) {
        Array.from(circles).forEach((circle, i) => {
          gsap.to(circle, {
            y: "random(-30, 30)",
            x: "random(-20, 20)",
            rotation: "random(-15, 15)",
            duration: "random(3, 6)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.4,
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen w-full relative bg-[#FAFAFA] font-sans overflow-hidden flex flex-col">
      
      {/* SHAPE BACKGROUND: Kurva Asimetris (Hanya muncul di Desktop) */}
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
        <path d="M0,0 L72,0 C90,35 88,75 58,100 L0,100 Z" fill="url(#emeraldGrad)" />
      </svg>

      {/* AMBIENT FLOATING ORBS (Hanya muncul di Desktop) */}
      <div ref={floatingElementsRef} className="absolute top-0 left-0 w-full lg:w-[55%] h-full z-1 pointer-events-none hidden lg:block overflow-hidden">
        <div className="absolute top-[20%] left-[15%] w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="absolute top-[60%] left-[35%] w-48 h-48 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute top-[40%] left-[70%] w-20 h-20 rounded-full bg-emerald-300/10 blur-xl" />
      </div>

      {/* HEADER NAV */}
      <header className="relative z-20 w-full flex items-center justify-between px-6 py-6 lg:px-12 xl:px-16">
        <div className="header-item flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-neutral-800 text-sm font-semibold px-4 py-2.5 rounded-full shadow-sm hover:bg-neutral-50 hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft size={16} />
            Beranda
          </Link>
          <div className="hidden sm:flex items-center gap-2.5 ml-2 lg:text-white text-emerald-950">
            <Image src="/logo-kompas-desa/kompas_logo_icon.png" alt="logo" width={25} height={25} />
            <span className="text-xl font-bold tracking-tight">Kompas&apos;Desa</span>
          </div>
        </div>

        <div className="header-item flex items-center gap-4">
          <span className="hidden md:block text-sm font-medium text-neutral-500">
            Belum mendaftarkan akun?
          </span>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center bg-white border border-neutral-200 text-neutral-800 text-sm font-bold px-6 py-2.5 rounded-full shadow-sm hover:border-emerald-600 hover:text-emerald-700 transition-all duration-200"
          >
            Daftar Sekarang
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center w-full max-w-[1600px] mx-auto">
        
        {/* LEFT PANEL - (HIDDEN DI HP, HANYA MUNCUL DI DESKTOP) */}
        <div className="hidden lg:flex lg:w-[50%] h-full flex-col justify-center px-6 lg:px-12 xl:px-16 py-12 lg:py-0 text-white relative">
          <div className="relative z-10 w-full max-w-[480px]">
            <h1 className="left-anim-item text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Mulai <br />
              Perjalanan <br />
              <span className="text-emerald-400">Digitalmu</span>
            </h1>

            <p className="left-anim-item text-base lg:text-lg text-emerald-100/80 leading-relaxed font-medium">
              Masuk untuk mengelola sistem ekosistem pertanian, memantau hasil panen, dan terhubung dengan pasar secara berkelanjutan.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - Form Login (FULL WIDTH DI HP, 50% DI DESKTOP) */}
        <div className="w-full lg:w-[50%] h-full flex flex-col justify-center items-center lg:items-start px-6 lg:px-16 xl:px-24 py-10 relative">
          <div className="w-full max-w-[440px]">
            <div className="right-anim-item mb-8 text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
                Masuk ke Akun
              </h2>
              <p className="text-sm lg:text-base text-neutral-500 font-medium">
                Akses panel kontrol dan dashboard Anda secara langsung.
              </p>
            </div>

            <form action={formAction} className="flex flex-col gap-5">
              {state.message && (
                <div
                  role="alert"
                  className={`right-anim-item text-center text-[13px] font-semibold rounded-xl px-4 py-3 border ${
                    state.success
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {state.message}
                </div>
              )}

              {/* Input Email */}
              <div className="right-anim-item flex flex-col gap-2">
                <label htmlFor="email" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Email Resmi
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@kompasdesa.id"
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="right-anim-item flex flex-col gap-2">
                <label htmlFor="password" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Kata Sandi
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-4 pl-12 pr-12 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                  >
                    {showPassword ? <Eye size={18} strokeWidth={2.5} /> : <EyeOff size={18} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              {/* Action Bawah Form */}
              <div className="right-anim-item flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2.5 group">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-600 transition-colors cursor-pointer"
                  />
                  <span className="text-[13px] font-semibold text-neutral-500 group-hover:text-neutral-700 transition-colors">Ingat Saya</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[13px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              {/* Tombol Utama */}
              <div className="right-anim-item mt-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#025246] px-4 py-4 text-[15px] font-extrabold text-white shadow-md transition-all duration-200 ease-out hover:bg-[#04382f] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                >
                  {pending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer-anim relative z-10 w-full text-center py-6 text-[12px] font-medium text-neutral-400">
        &copy; 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}