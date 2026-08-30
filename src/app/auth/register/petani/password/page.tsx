"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import { registerAction } from "@/actions/auth";
import { initialState } from "@/lib/types/auth";
import { getRegisterDraft, clearRegisterDraft } from "@/lib/register";
import Image from "next/image";

const slideshowImages = ["/images/login/ImageLogin.png", "/images/auth/Desa.jpg", "/images/auth/Sawah.jpg"];

export default function RegisterPetaniPassword() {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customError, setCustomError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, text: "Masukkan kata sandi", color: "bg-neutral-200", textColor: "text-neutral-400" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { level: 1, text: "Lemah (Gunakan simbol & angka)", color: "bg-red-500", textColor: "text-red-500" };
    if (score <= 3) return { level: 2, text: "Sedang (Cukup baik)", color: "bg-amber-500", textColor: "text-amber-500" };
    return { level: 3, text: "Kuat! (Aman)", color: "bg-emerald-600", textColor: "text-emerald-600" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCustomError("");

    if (password !== confirmPassword) return setCustomError("Konfirmasi password tidak sama.");

    const draft = getRegisterDraft();
    const formData = new FormData(e.currentTarget);
    formData.set("role", "petani");
    Object.entries({
      fullName: draft.fullName, username: draft.username, noTelp: draft.noTelp,
      email: draft.email, preferredCommodity: draft.komoditas, address: draft.lokasi, demandScale: draft.estimasi
    }).forEach(([key, val]) => val && formData.set(key, val as string));

    setIsPending(true);
    const result = await registerAction(state, formData);
    setIsPending(false);
    setState(result);

    if (result.success) {
      clearRegisterDraft();
      router.push("/auth/login");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % slideshowImages.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(".page-content", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 })
        .fromTo(".illustration-item", { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 1 }, "-=0.45")
        .fromTo(".form-item", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.08 }, "-=0.55");

      gsap.to(".ambient-blob", { scale: 1.15, opacity: 0.65, duration: 4, repeat: -1, yoyo: true, stagger: 0.5, ease: "sine.inOut" });
      gsap.to(".lock-pulse", { scale: 1.06, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".shield-glow", { opacity: 0.85, scale: 1.1, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".orbit-dot-1", { rotate: 360, duration: 10, repeat: -1, ease: "none", transformOrigin: "190px 150px" });
      gsap.to(".orbit-dot-2", { rotate: -360, duration: 14, repeat: -1, ease: "none", transformOrigin: "190px 150px" });

      gsap.utils.toArray<SVGGElement>(".float-chip").forEach((g, i) => {
        gsap.to(g, { y: i % 2 === 0 ? -6 : 6, duration: 2.6 + i * 0.3, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.2 });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const renderFormFields = () => (
    <div className="flex flex-col gap-5">
      {(state.message || customError) && (
        <div role="alert" className="form-item text-center text-[13px] font-semibold rounded-xl px-4 py-3 border bg-red-50 text-red-600 border-red-200">
          {customError || state.message}
        </div>
      )}

      <div className="form-item">
        <label htmlFor="password" className="mb-2 block text-[13px] font-bold text-neutral-800">Password</label>
        <div className="relative group">
          <Lock size={17} strokeWidth={2.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="w-full rounded-[16px] border border-neutral-200 bg-white py-3.5 pl-11 pr-12 text-sm font-medium text-neutral-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)] outline-none transition-all duration-200 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {password && (
          <div className="mt-2 flex flex-col gap-1.5">
            <div className="flex gap-1 w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${strength.color} ${strength.level === 1 ? 'w-1/3' : strength.level === 2 ? 'w-2/3' : 'w-full'}`}></div>
            </div>
            <span className={`text-[10px] font-bold ${strength.textColor}`}>Kekuatan: {strength.text}</span>
          </div>
        )}
      </div>

      <div className="form-item">
        <label htmlFor="confirmPassword" className="mb-2 block text-[13px] font-bold text-neutral-800">Konfirmasi Password</label>
        <div className="relative group">
          <Lock size={17} strokeWidth={2.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi kata sandi"
            className="w-full rounded-[16px] border border-neutral-200 bg-white py-3.5 pl-11 pr-12 text-sm font-medium text-neutral-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)] outline-none transition-all duration-200 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
          >
            {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {confirmPassword && (
          <span className={`text-[10px] font-bold mt-2 block ${password === confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
            {password === confirmPassword ? '✓ Password cocok' : '✕ Password tidak sama'}
          </span>
        )}
      </div>

      <div className="form-item flex items-start gap-2.5 mt-1">
        <input type="checkbox" id="agreeTerms" required className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer" />
        <label htmlFor="agreeTerms" className="text-[12px] text-neutral-500 leading-relaxed cursor-pointer">
          Dengan mendaftar, Anda menyetujui <Link href="#" className="text-emerald-600 font-semibold underline underline-offset-2">Syarat & Ketentuan</Link> dan <Link href="#" className="text-emerald-600 font-semibold underline underline-offset-2">Kebijakan Privasi</Link>
        </label>
      </div>

      <div className="form-item flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="w-[38%] rounded-[16px] border border-neutral-200 bg-white py-3.5 text-[13px] font-bold text-neutral-700 shadow-sm hover:bg-neutral-50 active:scale-[0.98] transition-all">Kembali</button>
        <button type="submit" disabled={isPending} className="group flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#075e50] py-3.5 text-[13px] font-extrabold text-white shadow-lg shadow-emerald-900/10 hover:bg-[#064d42] active:scale-[0.98] disabled:opacity-70 transition-all">
          {isPending ? <><Loader2 size={16} className="animate-spin" /> Memproses...</> : 'Daftar Akun'}
        </button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-[100dvh] w-full overflow-x-hidden bg-[#f7f8f6] font-sans text-neutral-900">
      
      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex min-h-[100dvh] w-full">
        <section className="relative min-h-[100dvh] w-[50%] lg:w-[52%] xl:w-[55%] overflow-hidden bg-[#063b30]">
          {slideshowImages.map((src, index) => (
            <div key={src + index} className={`absolute inset-0 transition-all duration-[1800ms] ease-out ${currentSlide === index ? "scale-100 opacity-120" : "scale-[1.08] opacity-30"}`}>
              <Image src={src} alt="" fill priority={index === 0} className="object-cover" />
            </div>
          ))}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.15),transparent_35%),linear-gradient(145deg,rgba(2,44,34,0.96)_0%,rgba(3,61,49,0.82)_48%,rgba(2,44,34,0.96)_100%)]" />
          <div className="ambient-blob absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-[90px]" />
          <div className="ambient-blob absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-300/10 blur-[110px]" />
          <div className="ambient-blob absolute left-[45%] top-[25%] h-40 w-40 rounded-full bg-lime-300/5 blur-[70px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')]" />

          <div className="page-content relative z-20 flex items-center justify-between px-8 py-8 xl:px-12">
            <Link href="/" className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/[0.14]">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Beranda
            </Link>
            <div className="flex items-center gap-2.5 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl">
                <Image src="/logo-kompas-desa/kompas_logo_icon.png" alt="Kompas'Desa" width={25} height={25} />
              </div>
              <span className="text-lg font-bold tracking-tight">Kompas&apos;Desa</span>
            </div>
          </div>

          <div className="absolute inset-x-0 top-[100px] bottom-[280px] z-10 flex items-center justify-center xl:bottom-[300px]">
            <div className="illustration-item relative w-full max-w-[400px] flex items-center justify-center">
              <svg viewBox="0 0 380 320" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                <circle cx="190" cy="160" r="150" fill="#10b981" opacity="0.06" />
                <circle cx="190" cy="160" r="110" fill="#10b981" opacity="0.08" />
                <circle cx="190" cy="160" r="75" fill="#10b981" opacity="0.10" />
                <circle cx="190" cy="150" r="118" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="3 7" opacity="0.35" />
                <circle cx="190" cy="150" r="95" fill="none" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="2 6" opacity="0.3" />
                
                <circle className="orbit-dot-1" cx="190" cy="32" r="4.5" fill="#6ee7b7" />
                <circle className="orbit-dot-2" cx="308" cy="150" r="4" fill="#34d399" />

                <g opacity="0.9">
                  <g className="float-chip" transform="translate(48,90)">
                    <rect x="-30" y="-24" width="60" height="48" rx="14" fill="#ffffff" opacity="0.08" stroke="#a7f3d0" strokeWidth="1.2" />
                    <path d="M0 -10 a10 10 0 0 1 10 10 a10 10 0 0 1 -3 7" stroke="#6ee7b7" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M0 -10 a10 10 0 0 0 -10 10 a10 10 0 0 0 4 8" stroke="#6ee7b7" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M-6 8 Q0 14 6 8" stroke="#a7f3d0" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  </g>
                  <g className="float-chip" transform="translate(332,210)">
                    <rect x="-32" y="-22" width="64" height="44" rx="14" fill="#ffffff" opacity="0.08" stroke="#a7f3d0" strokeWidth="1.2" />
                    <circle cx="-10" cy="0" r="7" fill="none" stroke="#6ee7b7" strokeWidth="2.4" />
                    <rect x="-4" y="-2" width="20" height="4" rx="1.5" fill="#6ee7b7" />
                    <rect x="10" y="2" width="4" height="6" fill="#6ee7b7" />
                  </g>
                  <g className="float-chip" transform="translate(70,262)">
                    <rect x="-18" y="-24" width="36" height="48" rx="8" fill="#ffffff" opacity="0.08" stroke="#a7f3d0" strokeWidth="1.2" />
                    <rect x="-10" y="-16" width="20" height="26" rx="2" fill="none" stroke="#6ee7b7" strokeWidth="1.6" />
                    <circle cx="0" cy="14" r="1.6" fill="#6ee7b7" />
                  </g>
                </g>

                <path d="M75 95 Q130 100 160 130" stroke="#34d399" strokeWidth="1" strokeDasharray="2 5" opacity="0.3" fill="none" />
                <path d="M300 205 Q250 195 220 168" stroke="#34d399" strokeWidth="1" strokeDasharray="2 5" opacity="0.3" fill="none" />
                <path d="M85 250 Q130 220 155 195" stroke="#34d399" strokeWidth="1" strokeDasharray="2 5" opacity="0.3" fill="none" />

                <g className="shield-glow" opacity="0.7">
                  <path d="M190 65 L250 89 V152 Q250 208 190 238 Q130 208 130 152 V89 Z" fill="none" stroke="#34d399" strokeWidth="2.5" opacity="0.5" />
                </g>

                <g className="lock-pulse" style={{ transformOrigin: "190px 168px" }}>
                  <path d="M164 145 V123 Q164 95 190 95 Q216 95 216 123 V145" fill="none" stroke="#a7f3d0" strokeWidth="11" strokeLinecap="round" />
                  <rect x="144" y="142" width="92" height="76" rx="16" fill="#ecfdf5" />
                  <rect x="144" y="142" width="92" height="76" rx="16" fill="none" stroke="#6ee7b7" strokeWidth="2" opacity="0.6" />
                  <circle cx="190" cy="171" r="10" fill="#059669" />
                  <rect x="185" y="178" width="11" height="20" rx="4" fill="#059669" />
                </g>

                <g transform="translate(238,210)">
                  <circle cx="0" cy="0" r="19" fill="#025246" />
                  <path d="M-8 0 L-2.5 7 L9 -8" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                <path d="M120 280 q16 -20 34 -7 q-20 7 -34 7Z" fill="#34d399" opacity="0.8" />
                <path d="M260 284 q-16 -20 -34 -7 q20 7 34 7Z" fill="#10b981" opacity="0.8" />
                <path d="M188 300 q6 -14 18 -10 q-10 10 -18 10Z" fill="#6ee7b7" opacity="0.7" />
              </svg>
            </div>
          </div>

          <div className="page-content absolute bottom-0 left-0 right-0 z-20 px-8 pb-10 xl:px-12 xl:pb-12">
            <div className="mb-7 max-w-[530px]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                <Sparkles size={12} /> Langkah Terakhir
              </div>
              <h1 className="max-w-[500px] text-4xl font-extrabold leading-[1.05] tracking-tight text-white xl:text-[46px]">
                Keamanan <br /><span className="text-emerald-300">Akun Petani.</span>
              </h1>
              <p className="mt-4 max-w-[450px] text-sm leading-6 text-emerald-50/60">
                Buat kata sandi yang aman untuk melindungi akun dan transaksi hasil panenmu bersama KompasDesa.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-300 text-[#063b30]"><Check size={13} strokeWidth={3} /></div>
                <span className="text-[10px] font-bold text-white/80">Akun</span>
              </div>
              <div className="h-px w-10 bg-emerald-200/20" />
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-300 text-[#063b30]"><Check size={13} strokeWidth={3} /></div>
                <span className="text-[10px] font-bold text-white/80">Profil</span>
              </div>
              <div className="h-px w-10 bg-emerald-200/20" />
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#063b30] text-[10px] font-extrabold">3</div>
                <span className="text-[10px] font-bold text-white">Password</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 min-h-[100dvh] items-center justify-center overflow-y-auto px-10 xl:px-20">
          <div className="w-full max-w-[470px] py-10">
            <div className="form-item mb-8">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Tahap Akhir
              </div>
              <h2 className="text-[38px] font-extrabold leading-[1.05] tracking-tight text-neutral-950">Keamanan Akun</h2>
              <p className="mt-3 max-w-[390px] text-sm leading-6 text-neutral-500">
                Buat kata sandi untuk mengamankan akun dan akses masuk kamu.
              </p>
            </div>

            <form onSubmit={handleSubmit}>{renderFormFields()}</form>

            <p className="form-item mt-8 text-center text-[10px] font-medium text-neutral-400">
              © 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
            </p>
          </div>
        </section>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="flex min-h-[100dvh] flex-col lg:hidden bg-white">
        <header className="flex items-center justify-between px-5 py-5 z-20">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 shadow-sm">
            <ArrowLeft size={14} /> Beranda
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/logo-kompas-desa/kompas_logo_icon.png" alt="Kompas'Desa" width={24} height={24} />
            <span className="text-sm font-extrabold text-neutral-900">Kompas&apos;Desa</span>
          </div>
        </header>

        <section className="relative w-full h-[260px] overflow-hidden bg-[#063b30]">
          {slideshowImages.map((src, index) => (
            <div key={src + index} className={`absolute inset-0 transition-all duration-1000 ${currentSlide === index ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}>
              <Image src={src} alt="" fill className="object-cover opacity-25" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-[#022c22]/95 via-[#064e3b]/80 to-[#022c22]/95" />
          
          <div className="relative z-10 flex h-full flex-col justify-between p-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                <Sparkles size={11} /> Langkah Terakhir
              </div>
              <h1 className="text-2xl font-extrabold leading-tight text-white">
                Keamanan <br /><span className="text-emerald-300">Akun Petani.</span>
              </h1>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wider text-white/40">Keamanan</p>
                <p className="mt-1 text-xs font-bold text-white/80">Kata sandi</p>
              </div>
              <div className="flex gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <span className="h-1.5 w-5 rounded-full bg-emerald-300" />
              </div>
            </div>
          </div>
        </section>

        <main className="flex-1 px-5 pb-8 pt-8">
          <div className="mx-auto w-full max-w-[520px]">
            <div className="mb-7">
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950">Keamanan Akun</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">Buat kata sandi untuk mengamankan akun dan akses masuk kamu.</p>
            </div>

            <form onSubmit={handleSubmit}>{renderFormFields()}</form>

            <p className="mt-8 text-center text-[10px] font-medium text-neutral-400">
              © 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}