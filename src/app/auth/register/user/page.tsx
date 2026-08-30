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
  Loader2,
  Users,
  Wheat,
  MapPin
} from "lucide-react";
import { saveRegisterDraft } from "@/lib/register";
import StepProgress from "@/components/auth/StepProgress";
import RegisterStepMeta from "@/components/auth/RegisterStepMeta";
import BrandStoryPanel from "@/components/auth/BrandStoryPanel";
import MobileBrandBanner from "@/components/auth/MobileBrandBanner";
import { animateStepExit, prefersReducedMotion } from "@/lib/authTransition";
import Image from "next/image";

const slideshowImages = [
  "/images/Joni.svg",
  "/",
  "/assets/bg-login-3.jpg",
];

export default function RegisterUser() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % slideshowImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(
          [
            ".bg-curve-container",
            ".header-item",
            ".left-anim-item",
            ".right-anim-item",
            ".footer-anim",
          ],
          { opacity: 1, x: 0, y: 0, scaleX: 1, rotateX: 0 }
        );
        return;
      }

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

      const storyCards = document.querySelectorAll(".story-float-card");
      storyCards.forEach((card, i) => {
        gsap.to(card, {
          y: "random(-6, 6)",
          duration: "random(3, 4.5)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.4,
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

    if (!reduced) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      ctx.revert();
      if (!reduced) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    saveRegisterDraft({ fullName, username, noTelp: phone, email });

    animateStepExit(rightColRef.current, "forward", () => {
      router.push("/auth/register/user/profile");
    });
  };

  return (
    <div ref={containerRef} className="min-h-[100dvh] w-full relative bg-[#FAFAFA] font-sans overflow-x-hidden flex flex-col perspective-1000">

      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="emeraldCurveClip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L0.72,0 C0.90,0.35 0.88,0.75 0.58,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div
        className="bg-curve-container absolute inset-y-0 left-0 w-full lg:w-[55%] z-0 drop-shadow-2xl pointer-events-none hidden lg:block overflow-hidden bg-gradient-to-br from-[#022c22] to-[#064e3b]"
        style={{ clipPath: "url(#emeraldCurveClip)" }}
      >
        {slideshowImages.map((src, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={src + index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive
                  ? "opacity-30 scale-100 blur-0"
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

      <div ref={floatingElementsRef} className="absolute inset-y-0 left-0 w-full lg:w-[55%] z-1 pointer-events-none hidden lg:block overflow-hidden">
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

      <MobileBrandBanner title="Mulai" highlight="Bergabung Bersama Kami" />

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch lg:items-center w-full max-w-[1600px] mx-auto py-2 lg:py-0">

        <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-6 py-6 lg:py-0 lg:px-12 xl:px-16 relative z-40">
          <BrandStoryPanel
            kicker="Ekosistem Pertanian Digital"
            title="Mulai"
            highlight="Bergabung Bersama Kami"
            description="Bergabunglah untuk terhubung langsung dengan petani lokal dan dapatkan komoditas berkualitas dengan harga terbaik."
            stats={[
              { icon: Users, value: "5.000+", label: "Petani aktif di seluruh Indonesia" },
              { icon: Wheat, value: "40+", label: "Jenis komoditas segar setiap hari" },
              { icon: MapPin, value: "120+", label: "Kota & kabupaten terjangkau" },
            ]}
          />
        </div>

        <div className="w-full lg:w-[50%] flex flex-col justify-center items-center lg:items-start px-6 pb-10 lg:py-0 lg:pl-24 xl:pl-32 relative z-40 lg:ml-auto">
          <div ref={rightColRef} className="w-full max-w-[380px] xl:max-w-[420px]">

            <div className="right-anim-item mb-3 flex justify-center lg:justify-start">
              <StepProgress current={1} />
            </div>

            <RegisterStepMeta current={1} label="Informasi Akun" />

            <div className="right-anim-item mb-5 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
                Bergabung sebagai Pelanggan
              </h2>
              <p className="text-xs lg:text-sm text-neutral-500 font-medium">
                Belanja komoditas segar langsung dari petani lokal bersama KompasDesa.
              </p>
            </div>

            <form onSubmit={handleNext} className="flex flex-col gap-3.5">

              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="username" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Nama Pengguna
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <AtSign size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Buat nama pengguna"
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Nomor Telepon
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Phone size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="right-anim-item mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#025246] px-4 py-3.5 text-[15px] font-extrabold text-white shadow-md transition-all duration-300 ease-out hover:bg-[#04382f] hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Berikutnya</span>
                  )}
                </button>
              </div>

              <p className="right-anim-item text-center text-[13px] text-neutral-500 font-medium mt-1">
                Sudah punya akun?{" "}
                <Link href="/auth/login" className="text-emerald-700 font-bold hover:text-emerald-800 transition-colors">
                  Masuk
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <footer className="footer-anim relative z-10 shrink-0 w-full text-center py-6 lg:py-4 text-[12px] font-medium text-neutral-400">
        &copy; 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}
