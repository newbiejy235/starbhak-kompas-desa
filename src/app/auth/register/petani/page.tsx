"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  User,
  UserCircle,
  Phone,
  Mail,
  Loader2,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
  Globe
} from "lucide-react";
import { saveRegisterDraft, getRegisterDraft } from "@/lib/register";
import Image from "next/image";

const slideshowImages = ["/images/login/ImageLogin.png", "/images/auth/Sawah.jpg"];

export default function RegisterPetani() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draft = getRegisterDraft();
    if (draft.fullName) setFullName(draft.fullName);
    if (draft.username) setUsername(draft.username);
    if (draft.noTelp) setPhone(draft.noTelp);
    if (draft.email) setEmail(draft.email);
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    saveRegisterDraft({ fullName, username, noTelp: phone, email });
    router.push("/auth/register/petani/profile");
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % slideshowImages.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let ctx: ReturnType<typeof gsap.context> | null = null;
    let cleanupMouseMove: ((e: MouseEvent) => void) | null = null;

    import("gsap").then(({ default: gsap }) => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.fromTo(".page-content", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 })
          .fromTo(".illustration-item", { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 1 }, "-=0.45")
          .fromTo(".floating-card", { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.12 }, "-=0.55")
          .fromTo(".form-item", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.08 }, "-=0.55");

        gsap.to(".ambient-blob", { scale: 1.15, opacity: 0.65, duration: 4, repeat: -1, yoyo: true, stagger: 0.5, ease: "sine.inOut" });
        gsap.to(".float-element", { y: -10, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.2 });
        gsap.to(".orbit-dot", { rotate: 360, duration: 12, repeat: -1, ease: "none", transformOrigin: "center center" });
        gsap.to(".pulse-ring", { scale: 1.2, opacity: 0, duration: 2, repeat: -1, ease: "power2.out" });
      }, containerRef);

      cleanupMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 18;
        const y = (e.clientY / window.innerHeight - 0.5) * 18;
        gsap.to(".parallax-element", { x, y, duration: 1.2, ease: "power2.out", overwrite: true });
      };
      window.addEventListener("mousemove", cleanupMouseMove);
    });

    return () => {
      ctx?.revert?.();
      if (cleanupMouseMove) window.removeEventListener("mousemove", cleanupMouseMove);
    };
  }, []);

  const renderFormFields = () => (
    <div className="flex flex-col gap-5">
      <div className="form-item flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-[13px] font-bold text-neutral-800 ml-1">Nama Lengkap</label>
        <div className="relative group">
          <User size={17} strokeWidth={2.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masukkan nama lengkap"
            className="w-full rounded-[16px] border border-neutral-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-neutral-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)] outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            required
          />
        </div>
      </div>

      <div className="form-item flex flex-col gap-1.5">
        <label htmlFor="username" className="text-[13px] font-bold text-neutral-800 ml-1">Nama Pengguna</label>
        <div className="relative group">
          <UserCircle size={17} strokeWidth={2.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan nama pengguna"
            className="w-full rounded-[16px] border border-neutral-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-neutral-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)] outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            required
          />
        </div>
      </div>

      <div className="form-item flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-[13px] font-bold text-neutral-800 ml-1">Nomor Telepon</label>
        <div className="relative group">
          <Phone size={17} strokeWidth={2.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
          <input
            id="phone"
            type="Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 08123456789"
            className="w-full rounded-[16px] border border-neutral-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-neutral-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)] outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            required
          />
        </div>
      </div>

      <div className="form-item flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[13px] font-bold text-neutral-800 ml-1">Email</label>
        <div className="relative group">
          <Mail size={17} strokeWidth={2.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full rounded-[16px] border border-neutral-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-neutral-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)] outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            required
          />
        </div>
      </div>

      <div className="form-item pt-2">
        <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#075e50] py-3.5 text-[13px] font-extrabold text-white shadow-lg shadow-emerald-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#064d42] hover:shadow-xl active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Memproses...</> : <>Berikutnya <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" /></>}
        </button>
      </div>

      <div className="form-item flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Atau</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <div className="form-item flex items-center justify-center gap-1.5">
        <span className="text-[13px] text-neutral-500 font-medium">Sudah mempunyai akun?</span>
        <Link href="/auth/login" className="text-[13px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors hover:underline underline-offset-2">Masuk sekarang</Link>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-[100dvh] w-full overflow-x-hidden bg-[#f7f8f6] font-sans text-neutral-900">
      
      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex min-h-[100dvh] w-full">
        <section className="relative min-h-[100dvh] w-[50%] lg:w-[52%] xl:w-[55%] overflow-hidden bg-[#063b30]">
          {slideshowImages.map((src, index) => (
            <div key={src + index} className={`absolute inset-0 transition-all duration-[1800ms] ease-out ${currentSlide === index ? "scale-100 opacity-100" : "scale-[1.08] opacity-0"}`}>
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
            <div className="parallax-element absolute h-[400px] w-[400px] rounded-full border border-white/[0.06]" />
            <div className="parallax-element absolute h-[310px] w-[310px] rounded-full border border-white/[0.05]" />
            <div className="absolute h-64 w-64 rounded-full bg-emerald-400/10 blur-[80px]" />

            <div className="illustration-item parallax-element relative flex h-[270px] w-[270px] items-center justify-center rounded-[44px] border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/20 backdrop-blur-md">
              <div className="absolute inset-3 rounded-[36px] border border-white/[0.06]" />
              
              <div className="relative flex flex-col items-center justify-center w-full h-full">
                <div className="relative w-28 h-28 mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-300/20 to-emerald-600/20 border border-white/20">
                   <User size={48} strokeWidth={1.5} className="text-emerald-200 drop-shadow-[0_0_15px_rgba(110,231,183,0.4)] relative z-10" />
                   <div className="pulse-ring absolute inset-0 rounded-full border border-emerald-300/40" />
                </div>
                <div className="w-20 h-2 rounded-full bg-emerald-200/20 mb-2" />
                <div className="w-12 h-1.5 rounded-full bg-emerald-200/10" />
              </div>

              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-100/50">Identitas</span>
              </div>
            </div>

            <div className="floating-card float-element absolute left-[8%] top-[10%] xl:left-[15%] w-[178px] rounded-2xl border border-white/10 bg-white/[0.10] p-4 shadow-xl backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15">
                  <BadgeCheck size={17} className="text-emerald-300" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-white/40">STATUS</p>
                  <p className="text-xs font-bold text-white">Petani</p>
                </div>
              </div>
            </div>

            <div className="floating-card float-element absolute right-[8%] top-[16%] xl:right-[15%] w-[190px] rounded-2xl border border-white/10 bg-white/[0.10] p-4 shadow-xl backdrop-blur-xl" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15">
                  <Globe size={17} className="text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-white/40">AKSES PASAR</p>
                  <p className="truncate text-xs font-bold text-white">Pembeli Langsung</p>
                </div>
              </div>
            </div>

            <div className="floating-card float-element absolute bottom-[6%] right-[10%] xl:right-[20%] rounded-2xl border border-white/10 bg-white/[0.10] px-4 py-3 shadow-xl backdrop-blur-xl" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15">
                  <CheckCircle2 size={15} className="text-emerald-300" />
                </div>
                <div>
                  <p className="text-[9px] font-medium text-white/40">PEMBAYARAN</p>
                  <p className="text-[11px] font-bold text-white">Aman & Transparan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="page-content absolute bottom-0 left-0 right-0 z-20 px-8 pb-10 xl:px-12 xl:pb-12">
            <div className="mb-7 max-w-[530px]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                <Sparkles size={12} /> Langkah Pertama
              </div>
              <h1 className="max-w-[500px] text-4xl font-extrabold leading-[1.05] tracking-tight text-white xl:text-[46px]">
                Mulai Perjalanan<br />Pertanian <span className="text-emerald-300">Hebatmu.</span>
              </h1>
              <p className="mt-4 max-w-[450px] text-sm leading-6 text-emerald-50/60">
                Lengkapi identitas dasar untuk memperluas pasar, menjangkau pembeli langsung, dan mengelola hasil panen dengan profesional.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#063b30] text-[10px] font-extrabold">1</div>
                <span className="text-[10px] font-bold text-white">Akun</span>
              </div>
              <div className="h-px w-10 bg-emerald-200/20" />
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold text-white/40">2</div>
                <span className="text-[10px] font-bold text-white/35">Profil</span>
              </div>
              <div className="h-px w-10 bg-emerald-200/20" />
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold text-white/40">3</div>
                <span className="text-[10px] font-bold text-white/35">Password</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 min-h-[100dvh] items-center justify-center overflow-y-auto px-10 xl:px-20">
          <div className="w-full max-w-[470px] py-10">
            <div className="form-item mb-8">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Pendaftaran Petani
              </div>
              <h2 className="text-[38px] font-extrabold leading-[1.05] tracking-tight text-neutral-950">Informasi Dasar</h2>
              <p className="mt-3 max-w-[390px] text-sm leading-6 text-neutral-500">
                Silakan lengkapi informasi diri Anda untuk memulai pendaftaran akun mitra petani.
              </p>
            </div>

            <form onSubmit={handleNext}>{renderFormFields()}</form>

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

        <section className="relative mx-4 h-[250px] overflow-hidden rounded-[28px] bg-[#063b30]">
          {slideshowImages.map((src, index) => (
            <div key={src + index} className={`absolute inset-0 transition-all duration-1000 ${currentSlide === index ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}>
              <Image src={src} alt="" fill className="object-cover opacity-25" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-[#022c22]/95 via-[#064e3b]/80 to-[#022c22]/95" />
          
          <div className="relative z-10 flex h-full flex-col justify-between p-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                <Sparkles size={11} /> Langkah Pertama
              </div>
              <h1 className="text-2xl font-extrabold leading-tight text-white">
                Mulai Perjalanan<br /><span className="text-emerald-300">Pertanianmu.</span>
              </h1>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wider text-white/40">Daftar Akun</p>
                <p className="mt-1 text-xs font-bold text-white/80">Informasi Dasar</p>
              </div>
              <div className="flex gap-1.5">
                <span className="h-1.5 w-5 rounded-full bg-emerald-300" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </section>

        <main className="flex-1 px-5 pb-8 pt-8">
          <div className="mx-auto w-full max-w-[520px]">
            <div className="mb-7">
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950">Informasi Dasar</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">Lengkapi informasi identitas diri Anda untuk membuat akun.</p>
            </div>

            <form onSubmit={handleNext}>{renderFormFields()}</form>

            <p className="mt-8 text-center text-[10px] font-medium text-neutral-400">
              © 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}