"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  ArrowLeft,
  User,
  AtSign,
  Phone,
  Mail,
  Loader2
} from "lucide-react";
import { saveRegisterDraft } from "@/lib/register";
import StepProgress from "@/components/auth/StepProgress";
import Image from "next/image";

export default function RegisterUser() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
      .from(".illus-anim", {
        opacity: 0,
        scale: 0.8,
        x: -20,
        duration: 0.8,
        ease: "back.out(1.2)"
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

      gsap.to(".illus-anim", {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    saveRegisterDraft({ fullName, username, noTelp: phone, email });
    router.push("/auth/register/user/profile");
  };

  return (
    <div ref={containerRef} className="h-screen w-full relative bg-white font-sans overflow-hidden flex flex-col justify-between">
      
      <svg 
        className="bg-curve absolute top-0 left-0 w-full lg:w-[50%] h-full z-0 pointer-events-none hidden lg:block" 
        preserveAspectRatio="none" 
        viewBox="0 0 100 100"
      >
        <path d="M0,0 L60,0 C95,30 95,70 60,100 L0,100 Z" fill="#025246" />
      </svg>

      <header className="relative z-20 w-full flex items-center justify-between px-6 py-4 lg:px-12 xl:px-16 flex-shrink-0">
        <div className="header-item flex items-center gap-4 w-1/3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white lg:text-white text-sm font-semibold hover:opacity-80 transition-opacity max-lg:text-emerald-900"
          >
            <ArrowLeft size={18} />
            Beranda
          </Link>
        </div>

        <div className="header-item flex items-center justify-center gap-2.5 w-1/3">
          <Image src="/logo-kompas-desa/kompas_desa_icon_color.png" alt="logo" width={26} height={26} />
          <span className="text-xl font-extrabold tracking-tight text-neutral-900 lg:text-neutral-800">
            Kompas&apos;Desa
          </span>
        </div>

        <div className="header-item flex items-center justify-end gap-3 w-1/3">
          <span className="hidden md:block text-sm font-medium text-neutral-500">
            Sudah punya akun?
          </span>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center bg-white border border-neutral-200 text-neutral-800 text-xs lg:text-sm font-bold px-5 py-2 lg:px-6 lg:py-2.5 rounded-full shadow-sm hover:border-emerald-600 hover:text-emerald-700 transition-all duration-200"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center w-full max-w-[1600px] mx-auto overflow-hidden">
        
        <div className="hidden lg:flex lg:w-[50%] flex-col justify-center pl-12 xl:pl-20 pr-10 text-white relative h-full">
          <div className="relative z-20 w-full max-w-[480px]">
            <h1 className="left-anim-item text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.05] mb-4 xl:mb-6">
              Mulai <br />
              Bergabung <br />
              <span className="text-emerald-300">Bersama Kami</span>
            </h1>
            <p className="left-anim-item text-base xl:text-lg text-emerald-100/90 leading-relaxed font-medium max-w-md">
              Bergabunglah untuk terhubung langsung dengan petani lokal dan dapatkan komoditas berkualitas dengan harga terbaik.
            </p>
          </div>

          <div className="illus-anim absolute right-[-10%] xl:right-[-5%] top-1/2 -translate-y-1/2 z-10">
            <div className="relative w-56 h-56 xl:w-64 xl:h-64 bg-emerald-800/40 backdrop-blur-md border border-emerald-500/30 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-6 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent z-10 pointer-events-none" />
              <Image 
                src="/images/Joni.svg"
                alt="Ilustrasi Kompas Desa"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[50%] flex flex-col justify-center items-center lg:items-start px-6 lg:pl-16 lg:pr-10 xl:px-24 h-full relative z-20">
          <div className="w-full max-w-[420px]">
            
            <div className="right-anim-item mb-3">
              <StepProgress current={1} />
            </div>

            <div className="right-anim-item mb-5 xl:mb-6 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1.5">
                Bergabung sebagai Pelanggan
              </h2>
              <p className="text-xs lg:text-sm text-neutral-500 font-medium">
                Belanja komoditas segar langsung dari petani lokal bersama KompasDesa.
              </p>
            </div>

            <form onSubmit={handleNext} className="flex flex-col gap-3 xl:gap-4">
              
              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-[12px] font-bold text-neutral-700 ml-1">
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
                    className="w-full rounded-xl xl:rounded-2xl border-2 border-neutral-200 bg-white py-3 pl-11 pr-4 text-[13px] xl:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="username" className="text-[12px] font-bold text-neutral-700 ml-1">
                  Nama Pengguna
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <AtSign size={16} strokeWidth={2.5} />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Buat nama pengguna"
                    className="w-full rounded-xl xl:rounded-2xl border-2 border-neutral-200 bg-white py-3 pl-11 pr-4 text-[13px] xl:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-[12px] font-bold text-neutral-700 ml-1">
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
                    className="w-full rounded-xl xl:rounded-2xl border-2 border-neutral-200 bg-white py-3 pl-11 pr-4 text-[13px] xl:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[12px] font-bold text-neutral-700 ml-1">
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
                    className="w-full rounded-xl xl:rounded-2xl border-2 border-neutral-200 bg-white py-3 pl-11 pr-4 text-[13px] xl:text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl xl:rounded-2xl bg-[#025246] px-4 py-3 xl:py-3.5 text-sm xl:text-[15px] font-extrabold text-white shadow-md transition-all duration-200 ease-out hover:bg-[#04382f] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Berikutnya</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="footer-anim relative z-10 w-full text-center py-4 text-[11px] lg:text-[12px] font-medium text-neutral-400 flex-shrink-0">
        &copy; 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}