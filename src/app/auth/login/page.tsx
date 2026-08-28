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
  Mail,
  Lock,
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
  const [remember, setRemember] = useState(false);

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
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Animasi Cinematic Video (Zoom Out + Unblur)
      tl.fromTo(
        ".bg-video",
        { scale: 1.15, opacity: 0, filter: "blur(10px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 2.5, ease: "power2.out" }
      )
      // Animasi Header
      .fromTo(
        ".header-item",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
        "-=2"
      )
      // Animasi Masuk Teks Kiri
      .fromTo(
        ".left-anim-item",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 1.2, ease: "back.out(1.2)" },
        "-=1.5"
      )
      // Animasi Form (Glass)
      .fromTo(
        ".glass-panel",
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "expo.out" },
        "-=1.2"
      )
      // Animasi Input Form
      .fromTo(
        ".right-anim-item",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, stagger: 0.08, duration: 0.8 },
        "-=0.6"
      )
      // Animasi Footer
      .fromTo(
        ".footer-anim",
        { opacity: 0, y: 10 },
        { opacity: 1, duration: 0.8 },
        "-=0.5"
      );

      // --- EFEK MENGHILANGKAN TEKS KIRI & MEMUSATKAN FORM SETELAH 3.5 DETIK ---
      const centerTl = gsap.timeline({ delay: 3.5 });

      // 1. Pudar dan geser konten teks kiri terlebih dahulu
      centerTl.to(".left-panel-content", {
        opacity: 0,
        filter: "blur(10px)",
        x: -30,
        duration: 0.8,
        ease: "power2.inOut"
      })
      // 2. Shrink area kiri ke 0, luaskan area kanan ke 100%, dan lebarkan formnya
      .to(".left-panel-wrapper", {
        width: 0,
        height: 0,
        margin: 0,
        padding: 0,
        opacity: 0,
        duration: 1.2,
        ease: "power3.inOut",
        display: "none"
      }, "-=0.4") // Dimulai sedikit sebelum teks benar-benar hilang
      .to(".right-panel-wrapper", {
        width: "100%",
        duration: 1.2,
        ease: "power3.inOut"
      }, "<") // Bergerak bersamaan dengan hilangnya area kiri
      .to(".glass-panel", {
        maxWidth: "520px", // Form melebar secara proporsional
        duration: 1.2,
        ease: "power3.inOut"
      }, "<");

      // Animasi Orbs
      const orbs = document.querySelectorAll(".ambient-orb");
      orbs.forEach((orb, i) => {
        gsap.to(orb, {
          scale: "random(1.1, 1.5)",
          opacity: "random(0.2, 0.5)",
          duration: "random(4, 7)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5,
        });
      });
    }, containerRef);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 60;
      const y = (e.clientY / window.innerHeight - 0.5) * 60;
      gsap.to(".ambient-orb", {
        x: (i: number) => x * (i + 1.2),
        y: (i: number) => y * (i + 1.2),
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
    <div
      ref={containerRef}
      className="h-[100dvh] w-full relative bg-neutral-900 font-sans overflow-hidden flex flex-col"
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700;800&display=swap");
        .font-display {
          font-family: "Fraunces", serif;
        }
        .font-sans {
          font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      {/* FULLSCREEN BACKGROUND VIDEO & OVERLAYS */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video 
          className="bg-video absolute inset-0 w-full h-full object-cover object-center"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/videos/loginpage.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#011a14]/90 via-[#022c22]/50 to-black/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-emerald-950/20" />
      </div>

      {/* AMBIENT FLOATING ORBS */}
      <div ref={floatingElementsRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="ambient-orb absolute top-[15%] left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="ambient-orb absolute top-[60%] left-[40%] w-[500px] h-[500px] rounded-full bg-[#D9A441]/15 blur-[120px]" />
        <div className="ambient-orb absolute top-[30%] left-[80%] w-[300px] h-[300px] rounded-full bg-teal-400/15 blur-[80px]" />
      </div>

      {/* HEADER NAV */}
      <header className="relative z-20 w-full shrink-0 flex items-center justify-between px-6 py-5 lg:px-12 xl:px-16">
        <div className="header-item flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft size={16} />
            Beranda
          </Link>
        </div>
        <div className="header-item flex items-center gap-2 text-white">
          <div className="w-7 h-7 flex items-center justify-center">
            <Image src="/logo-kompas-desa/kompas_desa_icon_color.png" alt="Logo Kompas Desa" width={20} height={20} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight drop-shadow-md">
            Kompas&apos;Desa
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-20 flex-1 flex flex-col lg:flex-row items-center justify-between w-full max-w-[1500px] mx-auto px-6 lg:px-12 xl:px-16 pb-10 overflow-y-auto lg:overflow-visible">
        
        {/* LEFT PANEL - Teks Besar */}
        {/* Tambahkan overflow-hidden & shrink-0 supaya animasi menutup tidak merusak layout */}
        <div className="left-panel-wrapper w-full lg:w-[45%] flex flex-col justify-center text-white mb-10 lg:mb-0 mt-8 lg:mt-0 pointer-events-none overflow-hidden shrink-0">
          {/* inner container dengan min-width supaya teks tidak terpotong acak (word-wrap) saat width wrapper mengecil */}
          <div className="left-panel-content max-w-[420px] w-full min-w-[320px] lg:min-w-[420px]"> 
            <h1 className="left-anim-item font-display text-[2.35rem] xl:text-[2.85rem] 2xl:text-[3.1rem] leading-[1.08] text-white font-semibold mb-6 drop-shadow-xl">
              Masuk{" "}
              <span className="italic font-normal text-emerald-400">
                untuk
              {" "}
              Menggunakan Sistem
              </span>
            </h1>
            <p className="left-anim-item text-[14.5px] xl:text-[15px] text-emerald-50/90 leading-relaxed font-medium drop-shadow-md max-w-[360px]">
              Masuk ke akun Anda untuk mulai bertransaksi, memantau pesanan,
              dan memperluas relasi bersama petani di seluruh Indonesia.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - Ultra Dark Glassmorphism Form */}
        {/* Membuang lg:justify-end dan menambahkan class 'right-panel-wrapper' agar selalu terpusat dan mulus */}
        <div className="right-panel-wrapper w-full lg:w-[50%] flex justify-center items-center">
          <div className="glass-panel w-full max-w-[420px] bg-black/15 backdrop-blur-sm border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-[2rem] p-8 lg:p-10">
            
            <div className="right-anim-item mb-8 text-center lg:text-left">
              <h2 className="font-display text-[2rem] font-semibold text-white tracking-tight leading-tight">
                Selamat Datang
              </h2>
              <p className="text-sm text-neutral-300 font-medium mt-1">
                Silakan masuk ke akun Anda.
              </p>
            </div>

            <form action={formAction} className="flex flex-col gap-4.5">
              
              {/* Alert Message */}
              {state.message && (
                <div
                  role="alert"
                  className={`right-anim-item text-[13px] font-medium rounded-2xl px-4 py-3.5 border backdrop-blur-sm ${
                    state.success
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      : "bg-red-500/10 text-red-300 border-red-500/30"
                  }`}
                >
                  {state.message}
                </div>
              )}

              {/* Form Input: Email */}
              <div className="right-anim-item flex flex-col gap-1.5 mt-1">
                <label htmlFor="email" className="text-[13px] font-bold text-neutral-200 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-emerald-400 transition-colors">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@kompasdesa.id"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-4 text-sm font-semibold text-white outline-none transition-all duration-300 ease-out placeholder:text-white/40 hover:bg-white/15 focus:bg-white/20 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10 shadow-sm backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Form Input: Password */}
              <div className="right-anim-item flex flex-col gap-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="text-[13px] font-bold text-neutral-200">
                    Kata Sandi
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[12.5px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-emerald-400 transition-colors">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-11 text-sm font-semibold text-white outline-none transition-all duration-300 ease-out placeholder:text-white/40 hover:bg-white/15 focus:bg-white/20 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10 shadow-sm backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              {/* Checkbox */}
              <label className="right-anim-item flex items-center gap-2.5 cursor-pointer w-fit select-none ml-1 mt-1">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer"
                />
                <span className="text-[13px] font-medium text-neutral-300">Ingat saya di perangkat ini</span>
              </label>

              {/* Submit Button */}
              <div className="right-anim-item mt-3">
                <button
                  type="submit"
                  disabled={pending}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-[15px] font-extrabold text-white shadow-lg transition-all duration-300 ease-out opacity-40 hover:opacity-100 hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(52,211,153,0.6)] hover:-translate-y-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30"
                >
                  {pending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Masuk</span>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="right-anim-item flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[12px] text-white/40 font-medium">atau</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Register Link */}
              <div className="right-anim-item flex items-center justify-center gap-1.5">
                <span className="text-[13.5px] text-neutral-300 font-medium">Belum mempunyai akun?</span>
                <Link href="/auth/register" className="text-[13.5px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                  Daftar sekarang
                </Link>
              </div>

            </form>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer-anim relative z-20 shrink-0 w-full text-center py-5 text-[12px] font-medium text-white/50 drop-shadow-md">
        &copy; 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}