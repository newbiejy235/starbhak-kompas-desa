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
  Sprout,
  Truck,
  ShieldCheck,
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

  useEffect(() => {
    if (state.success && state.token && state.user && state.redirect) {
      saveSession(state.token, state.user);
      router.replace(state.redirect);
    }
  }, [state, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".terrace-band",
        { yPercent: 12, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.08 },
      )
        .fromTo(
          ".header-item",
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.7",
        )
        .fromTo(
          ".left-anim-item",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.9 },
          "-=0.6",
        )
        .fromTo(
          ".feature-badge",
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, stagger: 0.1, duration: 0.7 },
          "-=0.5",
        )
        .fromTo(
          ".right-anim-item",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.8 },
          "-=0.8",
        );

      gsap.to(".drift-slow", {
        y: 14,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".drift-fast", {
        y: -10,
        x: 6,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.4,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full relative bg-[#F4F7F5] font-sans overflow-hidden flex flex-col"
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

      {/* LEFT — BRAND PANEL (full-bleed, sits behind header + footer too) */}
      <div className="hidden lg:block absolute inset-y-0 left-0 lg:w-[46%] xl:w-[52%] h-full overflow-hidden bg-gradient-to-b from-[#022c22] to-[#04382f] z-0">
        {/* Terasering contour bands (signature element) */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 900"
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
        >
          <path
            className="terrace-band"
            d="M-50,900 L-50,620 C160,560 260,650 420,600 C580,550 660,600 850,540 L850,900 Z"
            fill="#0b3d31"
          />
          <path
            className="terrace-band"
            d="M-50,900 L-50,700 C140,660 300,720 460,680 C620,640 700,690 850,650 L850,900 Z"
            fill="#0f4a3b"
          />
          <path
            className="terrace-band"
            d="M-50,900 L-50,780 C180,750 320,800 480,770 C640,740 720,780 850,760 L850,900 Z"
            fill="#14584a"
          />
        </svg>

        {/* Ambient light drift */}
        <div className="drift-slow absolute top-[14%] left-[18%] w-40 h-40 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="drift-fast absolute top-[38%] left-[62%] w-24 h-24 rounded-full bg-[#D9A441]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center h-full px-10 xl:px-16 2xl:px-20 py-16">
          <div className="max-w-[420px]">

            <h1 className="left-anim-item font-display text-[2.35rem] xl:text-[2.85rem] 2xl:text-[3.1rem] leading-[1.08] text-emerald-300 font-semibold mb-6">
              Masuk{" "}
              <span className="italic font-normal text-white ">
                untuk
                {" "}
                Menggunakan  Sistem
              </span>
            </h1>

            <p className="left-anim-item text-[14.5px] xl:text-[15px] text-emerald-100/75 leading-relaxed mb-10 max-w-[360px]">
              Masuk ke akun Anda untuk mulai bertransaksi, memantau pesanan,
              dan memperluas relasi bersama petani di seluruh Indonesia.
            </p>

          </div>
        </div>
      </div>

      {/* HEADER NAV — floats above the green panel, transparent */}
      <header className="absolute top-0 left-0 z-30 w-full flex items-center justify-between px-6 py-5 lg:px-10">
        <div className="header-item flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-neutral-800 text-sm font-semibold px-4 py-2.5 rounded-full border border-neutral-200 shadow-sm hover:border-neutral-300 hover:bg-neutral-50 transition-colors duration-200"
          >
            <ArrowLeft size={16} />
            Beranda
          </Link>
        </div>
        <div className="header-item flex items-center gap-2 text-neutral-800">
          <div className="w-7 h-7 flex items-center justify-center">
            <Image src="/logo-kompas-desa/kompas_desa_icon_color.png" alt="Logo Kompas Desa" width={20} height={20}></Image>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Kompas&apos;Desa
          </span>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto overflow-hidden">
        {/* LEFT spacer — keeps the form column offset on desktop; visual comes from the absolute panel behind */}
        <div className="hidden lg:block lg:w-[46%] xl:w-[52%] h-full shrink-0" aria-hidden="true" />

        {/* RIGHT — FORM PANEL */}
        <div className="w-full lg:w-[54%] xl:w-[48%] h-full flex flex-col justify-center items-center px-6 lg:px-10 xl:px-12 pt-24 pb-8 lg:py-0 overflow-y-auto">
          <div className="w-full max-w-[380px]">
            <div className="right-anim-item mb-8">
              <h2 className="font-display text-[2rem] font-semibold text-neutral-900 tracking-tight leading-tight">
                Selamat Datang Kembali
              </h2>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              {state.message && (
                <div
                  role="alert"
                  className={`right-anim-item text-[13px] font-medium rounded-xl px-4 py-3 border ${state.success
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-600 border-red-200"
                    }`}
                >
                  {state.message}
                </div>
              )}

              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[13px] font-semibold text-neutral-700">
                  Email
                </label>
                <div className="relative group">
                  <Mail
                    size={17}
                    strokeWidth={2}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#025246] transition-colors"
                  />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@kompasdesa.id"
                    className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm text-neutral-900 outline-none transition-colors duration-150 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-[#025246] focus:ring-4 focus:ring-[#025246]/10"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[13px] font-semibold text-neutral-700">
                    Kata Sandi
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[12.5px] font-semibold text-[#025246] hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock
                    size={17}
                    strokeWidth={2}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#025246] transition-colors"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-11 text-sm text-neutral-900 outline-none transition-colors duration-150 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-[#025246] focus:ring-4 focus:ring-[#025246]/10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <label className="right-anim-item flex items-center gap-2.5 cursor-pointer w-fit select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-[#025246] focus:ring-[#025246]/30 cursor-pointer"
                />
                <span className="text-[13px] font-medium text-neutral-500">Ingat saya di perangkat ini</span>
              </label>

              <button
                type="submit"
                disabled={pending}
                className="right-anim-item mt-1 group flex w-full items-center justify-center gap-2 rounded-xl bg-[#025246] px-4 py-3.5 text-[14.5px] font-bold text-white transition-all duration-200 hover:bg-[#013d34] hover:shadow-lg hover:shadow-[#025246]/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
              >
                {pending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Masuk</span>
                )}
              </button>

              <div className="right-anim-item flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-neutral-200" />
                <span className="text-[12px] text-neutral-400">atau</span>
                <div className="h-px flex-1 bg-neutral-200" />
              </div>

              <div className="right-anim-item flex items-center justify-center gap-1.5">
                <span className="text-[13.5px] text-neutral-500">Belum mempunyai akun?</span>
                <Link href="/auth/register" className="text-[13.5px] font-bold text-[#025246] hover:underline">
                  Daftar sekarang
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="relative z-10 shrink-0 w-full text-center py-4 text-[12px] text-neutral-400 lg:pl-[46%] xl:pl-[52%]">
        &copy; 2026 Kompas&apos;Desa. Hak cipta dilindungi.
      </footer>
    </div>
  );
}