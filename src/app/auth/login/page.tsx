"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import gsap from "gsap";
import Image from "next/image";
import { loginAction } from "@/actions/auth";
import { saveSession } from "@/lib/auth/client";
import { initialState } from "@/lib/types/auth";
import type { LoginResult } from "@/lib/auth/auth.service";

const slideshowImages = [
  "/images/login/ImageLogin.png",
  "/images/login/ImagePetani.png",
  "/images/login/ImagePembeli.png",
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

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
    const timer = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % slideshowImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.fromTo(".bg-curve-container",
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 1.5, ease: "power4.inOut" }
      )
      .fromTo([".header-item", ".left-anim-item", ".right-anim-item"],
        { opacity: 0, y: 30, rotateX: -10 },
        { opacity: 1, y: 0, rotateX: 0, stagger: 0.05, duration: 1.2 },
        "-=0.9"
      )
      .fromTo(".footer-anim",
        { opacity: 0, y: 10 },
        { opacity: 1, duration: 0.8 },
        "-=0.5"
      );

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
        x: (i: number) => x * (i + 1.5),
        y: (i: number) => y * (i + 1.5),
        duration: 1.5,
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
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="emeraldCurveClip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L0.72,0 C0.90,0.35 0.88,0.75 0.58,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div
        className="bg-curve-container absolute top-0 left-0 w-full lg:w-[55%] h-full z-0 drop-shadow-2xl pointer-events-none hidden lg:block overflow-hidden bg-gradient-to-br from-[#022c22] to-[#064e3b]"
        style={{ clipPath: "url(#emeraldCurveClip)" }}
      >
        {slideshowImages.map((src, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={src + index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive
                  ? "opacity-100 scale-100 blur-0"
                  : "opacity-0 scale-105 blur-md"
              }`}
            >
              <Image
                src={src}
                alt="Background Slide"
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-r from-[#022c22]/90 via-[#022c22]/70 to-[#064e3b]/80" />
      </div>

      <div ref={floatingElementsRef} className="absolute top-0 left-0 w-full lg:w-[55%] h-full z-[1] pointer-events-none hidden lg:block overflow-hidden">
        <div className="ambient-orb absolute top-[20%] left-[15%] w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="ambient-orb absolute top-[60%] left-[35%] w-48 h-48 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="ambient-orb absolute top-[40%] left-[70%] w-20 h-20 rounded-full bg-emerald-300/10 blur-xl" />
      </div>

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
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center w-full max-w-[1600px] mx-auto overflow-hidden">
        <div className="hidden lg:flex lg:w-[45%] h-full flex-col justify-center px-6 lg:px-12 xl:px-16 text-white relative z-40">
          <div className="relative z-10 w-full max-w-[380px]">
            <h1 className="left-anim-item text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
              Selamat <br />
              <span className="text-emerald-400">Datang</span>
            </h1>
            <p className="left-anim-item text-sm lg:text-base text-emerald-100/80 leading-relaxed font-medium">
              Masuk ke akun Anda untuk mulai bertransaksi, memantau pesanan, dan memperluas relasi bersama petani di seluruh Indonesia.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-[50%] h-full flex flex-col justify-center items-center lg:items-start px-6 lg:pl-24 xl:pl-32 relative z-40 ml-auto">
          <div className="w-full max-w-[380px] xl:max-w-[420px]">
            <div className="right-anim-item mb-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold tracking-widest uppercase mb-2">
                Akses Masuk
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight">
                Masuk ke akun
              </h2>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              {state.message && (
                <div
                  role="alert"
                  className={`right-anim-item text-[13px] font-medium rounded-xl px-4 py-3 border ${
                    state.success
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

      <footer className="footer-anim relative z-10 shrink-0 w-full text-center py-4 text-[12px] font-medium text-neutral-400">
        &copy; 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}