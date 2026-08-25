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
  Lock,
  Sparkles
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
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.fromTo(".bg-curve", 
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 1.5, ease: "power4.inOut" }
      )
      .fromTo([".header-item", ".left-anim-item", ".right-anim-item"], 
        { opacity: 0, y: 30, rotateX: -10 },
        { opacity: 1, y: 0, rotateX: 0, stagger: 0.05, duration: 1.2 }, 
        "-=0.9"
      )
      .fromTo(".border-illustration", 
        { opacity: 0, scale: 0.5, rotation: -15 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1, ease: "back.out(1.5)" },
        "-=1"
      )
      .fromTo(".footer-anim", 
        { opacity: 0, y: 10 },
        { opacity: 1, duration: 0.8 }, 
        "-=0.5"
      );

      gsap.to(".float-box-1", {
        y: -10,
        rotation: -2,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      
      gsap.to(".float-box-2", {
        y: 10,
        rotation: 2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5
      });

      gsap.to(".wave-human", {
        rotation: 15,
        transformOrigin: "bottom right",
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".wave-farmer", {
        rotation: -15,
        transformOrigin: "bottom left",
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.2
      });

      const orbs = document.querySelectorAll(".ambient-orb");
      orbs.forEach((orb, i) => {
        gsap.to(orb, {
          scale: "random(1.1, 1.4)",
          opacity: "random(0.4, 0.8)",
          duration: "random(3, 5)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.3,
        });
      });
    }, containerRef);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      
      gsap.to(".ambient-orb", {
        x: (i) => x * (i + 1.5),
        y: (i) => y * (i + 1.5),
        duration: 1.5,
        ease: "power2.out"
      });

      gsap.to(".border-illustration", {
        x: x * 0.3,
        y: y * 0.3,
        duration: 2,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-[100dvh] w-full relative bg-[#FAFAFA] font-sans overflow-hidden flex flex-col perspective-1000">
      
      {/* SHAPE BACKGROUND */}
      <svg 
        className="bg-curve absolute top-0 left-0 w-full lg:w-[55%] h-full z-0 drop-shadow-2xl pointer-events-none hidden lg:block" 
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

      {/* AMBIENT FLOATING ORBS */}
      <div ref={floatingElementsRef} className="absolute top-0 left-0 w-full lg:w-[55%] h-full z-1 pointer-events-none hidden lg:block overflow-hidden">
        <div className="ambient-orb absolute top-[20%] left-[15%] w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="ambient-orb absolute top-[60%] left-[35%] w-48 h-48 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="ambient-orb absolute top-[40%] left-[70%] w-20 h-20 rounded-full bg-emerald-300/10 blur-xl" />
      </div>

      {/* HEADER NAV */}
      <header className="relative z-20 w-full shrink-0 flex items-center justify-between px-6 py-5 lg:px-12 xl:px-16">
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
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center w-full max-w-[1600px] mx-auto overflow-hidden">
        
        {/* ILUSTRASI FLOATING (Digeser ke kiri masuk ke area ijo: left-[38%]) */}
        <div className="border-illustration absolute top-1/2 left-[38%] -translate-x-1/2 -translate-y-1/2 z-30 hidden lg:block pointer-events-none origin-center">
          <div className="relative w-[220px] h-[250px]">
            
            {/* Box 1 (Tangan Orang / Menyapa) */}
            <div className="float-box-1 absolute top-2 left-0 w-[110px] h-[130px] bg-amber-200 rounded-[16px] border-[4px] border-[#022c22] shadow-[8px_8px_0px_rgba(2,44,34,0.15)] flex items-end justify-center pb-3 overflow-hidden z-20">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(0deg,transparent_24%,#000_25%,#000_26%,transparent_27%,transparent_74%,#000_75%,#000_76%,transparent_77%,transparent)] bg-[length:15px_15px]" />
              <span className="wave-human relative z-10 text-[55px] drop-shadow-md pb-1">👋🏽</span>
            </div>

            {/* Aksen Bintang Tengah */}
            <div className="absolute top-[52%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#025246] rotate-45 border-[3px] border-white z-30 shadow-lg flex items-center justify-center">
              <Sparkles className="text-white -rotate-45" size={16} strokeWidth={2.5} />
            </div>

            {/* Box 2 (Unsur Petani) */}
            <div className="float-box-2 absolute bottom-2 right-0 w-[115px] h-[125px] bg-emerald-100 rounded-[16px] border-[4px] border-[#022c22] shadow-[8px_8px_0px_rgba(2,44,34,0.1)] flex items-end justify-center pb-3 overflow-hidden z-10">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_2px,transparent_2px)] bg-[length:12px_12px]" />
              <img 
                 src="https://i.pinimg.com/736x/6e/02/51/6e02519899393fa847d87d57c63e6cf0.jpg" 
                 alt="Petani" 
                 className="wave-farmer relative z-10 w-[75px] h-[75px] object-cover rounded-xl shadow-md border-2 border-[#022c22]" 
               />
            </div>

          </div>
        </div>

        {/* LEFT PANEL */}
        <div className="hidden lg:flex lg:w-[45%] h-full flex-col justify-center px-6 lg:px-12 xl:px-16 text-white relative z-40">
          <div className="relative z-10 w-full max-w-[380px]">
            {/* Teks kiri dikecilin biar lebih rapi & proporsional */}
            <h1 className="left-anim-item text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
              Login untuk <br />
              <span className="text-emerald-400">Mengakses Sistem</span>
            </h1>

            <p className="left-anim-item text-sm lg:text-base text-emerald-100/80 leading-relaxed font-medium">
              Masuk ke akun Anda untuk mulai bertransaksi, memantau pesanan, dan memperluas relasi bersama Kompas&rsquo;Desa.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - Form Login (Dikasih ruang luas & form ukuran normal) */}
        <div className="w-full lg:w-[50%] h-full flex flex-col justify-center items-center lg:items-start px-6 lg:pl-24 xl:pl-32 relative z-40 ml-auto">
          <div className="w-full max-w-[380px] xl:max-w-[420px]">
            <div className="right-anim-item mb-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
                Masuk ke Akun
              </h2>
              {/* <p className="text-sm lg:text-base text-neutral-500 font-medium">
                Akses panel kontrol dan dashboard Anda secara langsung.
              </p> */}
            </div>

            <form action={formAction} className="flex flex-col gap-4">
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
              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Email
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
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="right-anim-item flex flex-col gap-1.5">
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
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
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
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#025246] px-4 py-3.5 text-[15px] font-extrabold text-white shadow-md transition-all duration-300 ease-out hover:bg-[#04382f] hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
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
      <footer className="footer-anim relative z-10 shrink-0 w-full text-center py-4 text-[12px] font-medium text-neutral-400">
        &copy; 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}