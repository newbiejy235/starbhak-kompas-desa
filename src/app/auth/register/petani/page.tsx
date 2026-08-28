"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  ArrowLeft,
  User,
  UserCircle,
  Phone,
  Mail,
  Loader2
} from "lucide-react";
import { saveRegisterDraft } from "@/lib/register";
import Image from "next/image";

export default function RegisterPetani() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Animasi Cinematic Video
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
        ".form-item",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, stagger: 0.08, duration: 0.8 },
        "-=0.6"
      )
      .fromTo(
        ".footer-anim",
        { opacity: 0, y: 10 },
        { opacity: 1, duration: 0.8 },
        "-=0.5"
      );

      // --- EFEK MENGHILANGKAN TEKS KIRI SETELAH 3.5 DETIK ---
      gsap.to(".left-panel-wrapper", {
        opacity: 0,
        filter: "blur(10px)", // Ngilang sambil ngeblur biar sinematik
        x: -30,
        autoAlpha: 0, // Bikin display: none otomatis pas opacity 0 biar ga ngeblok klik
        duration: 1.5,
        delay: 3.5, 
        ease: "power2.inOut"
      });

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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    saveRegisterDraft({ fullName, username, noTelp: phone, email });
    router.push("/auth/register/petani/profile");
  };

  return (
    <div ref={containerRef} className="h-[100dvh] w-full relative font-sans overflow-hidden flex flex-col bg-neutral-900">

      {/* BACKGROUND VIDEO & OVERLAYS */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video 
          className="bg-video absolute inset-0 w-full h-full object-cover object-center"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/petaniauth/Tracktor.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay dibikin lebih gelap dikit biar form transparan tetep kebaca */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#011a14]/90 via-[#022c22]/50 to-black/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-emerald-950/20" />
      </div>

      {/* AMBIENT ORBS */}
      <div ref={floatingElementsRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="ambient-orb absolute top-[15%] left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="ambient-orb absolute top-[60%] left-[40%] w-[500px] h-[500px] rounded-full bg-teal-400/15 blur-[120px]" />
        <div className="ambient-orb absolute top-[30%] left-[80%] w-[300px] h-[300px] rounded-full bg-[#D9A441]/15 blur-[80px]" />
      </div>

      {/* HEADER NAV */}
      <header className="relative z-20 w-full shrink-0 flex items-center justify-between px-6 py-5 lg:px-12 xl:px-16">
        <div className="header-item flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft size={16} />
            Beranda
          </Link>
          <div className="hidden sm:flex items-center gap-2.5 ml-2 text-white">
            <Image src="/logo-kompas-desa/kompas_desa_icon_color.png" alt="logo" width={25} height={25} />
            <span className="text-xl font-bold tracking-tight drop-shadow-md">Kompas&apos;Desa</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-20 flex-1 flex flex-col lg:flex-row items-center justify-between w-full max-w-[1500px] mx-auto px-6 lg:px-12 xl:px-16 pb-10 overflow-y-auto lg:overflow-visible">

        {/* LEFT PANEL - Dibungkus pakai class 'left-panel-wrapper' biar bisa di-fade out */}
        <div className="left-panel-wrapper w-full lg:w-[45%] flex flex-col justify-center text-white mb-10 lg:mb-0 mt-8 lg:mt-0 pointer-events-none">
          <div className="w-full max-w-[500px]">
            <h1 className="left-anim-item text-4xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.15] mb-6 drop-shadow-xl">
              Bergabung Bersama <br />
              <span className="text-emerald-400 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                KompasDesa
              </span>
            </h1>
            <p className="left-anim-item text-[15px] lg:text-[17px] text-emerald-50/90 leading-relaxed font-medium drop-shadow-lg max-w-[400px]">
              Perluas pasar, jangkau pembeli langsung tanpa perantara, dan kembangkan hasil pertanianmu ke tingkat yang lebih tinggi.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - Ultra Dark Glassmorphism Form */}
        <div className="w-full lg:w-[50%] flex justify-center lg:justify-end items-center">
          
          <div className="glass-panel w-full max-w-[440px] bg-black/25 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 lg:p-10">

            <div className="form-item mb-8 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-2">
                Informasi Dasar
              </h2>
              <p className="text-sm text-neutral-300 font-medium">
                Lengkapi data diri Anda untuk memulai.
              </p>
            </div>

            <form onSubmit={handleNext} className="flex flex-col gap-4.5">

              <div className="form-item flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-[13px] font-bold text-neutral-200 ml-1">
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-emerald-400 transition-colors">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-4 text-sm font-semibold text-white outline-none transition-all duration-300 ease-out placeholder:text-white/40 hover:bg-white/15 focus:bg-white/20 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10 shadow-sm backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <div className="form-item flex flex-col gap-1.5">
                <label htmlFor="username" className="text-[13px] font-bold text-neutral-200 ml-1">
                  Nama Pengguna
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-emerald-400 transition-colors">
                    <UserCircle size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Pilih nama pengguna"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-4 text-sm font-semibold text-white outline-none transition-all duration-300 ease-out placeholder:text-white/40 hover:bg-white/15 focus:bg-white/20 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10 shadow-sm backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <div className="form-item flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-[13px] font-bold text-neutral-200 ml-1">
                  Nomor Telepon
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-emerald-400 transition-colors">
                    <Phone size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-4 text-sm font-semibold text-white outline-none transition-all duration-300 ease-out placeholder:text-white/40 hover:bg-white/15 focus:bg-white/20 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10 shadow-sm backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <div className="form-item flex flex-col gap-1.5">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-4 text-sm font-semibold text-white outline-none transition-all duration-300 ease-out placeholder:text-white/40 hover:bg-white/15 focus:bg-white/20 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10 shadow-sm backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <div className="form-item mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-[15px] font-extrabold text-white shadow-lg transition-all duration-300 ease-out hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 opacity-40 hover:opacity-100"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Selanjutnya</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      </main>

      <footer className="footer-anim relative z-20 shrink-0 w-full text-center py-5 text-[12px] font-medium text-white/50 drop-shadow-md">
        &copy; 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}