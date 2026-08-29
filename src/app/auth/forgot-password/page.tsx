"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  ArrowLeft,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { sendCode } from "@/actions/nodeMailer/nodemailer.action";
import { changesPassword } from "@/actions/auth";
import Image from "next/image";

const slideshowImages = [
  "/images/Joni.svg",
  "/assets/bg-login-2.jpg",
  "/assets/bg-login-3.jpg",
];

export default function NewPassword() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");
  const [verification, setVerification] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [pendingSend, setPendingSend] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, text: "Masukkan kata sandi", color: "bg-neutral-200", textColor: "text-neutral-400" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { level: 1, text: "Lemah (Gunakan kombinasi simbol & angka)", color: "bg-red-500", textColor: "text-red-500" };
    if (score === 2 || score === 3) return { level: 2, text: "Sedang (Cukup baik)", color: "bg-amber-500", textColor: "text-amber-500" };
    return { level: 3, text: "Kuat! (Aman dengan simbol & angka)", color: "bg-emerald-600", textColor: "text-emerald-600" };
  };

  const strength = getPasswordStrength(newPassword);

  const sendHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!userEmail) {
      setIsSuccess(false);
      return setMessage("Silakan isi email terlebih dahulu.");
    }
    try {
      setPendingSend(true);
      setMessage("");
      await sendCode(userEmail);
      setIsSuccess(true);
      setMessage("Kode verifikasi berhasil dikirim ke email Anda.");
    } catch {
      setIsSuccess(false);
      setMessage("Gagal mengirim kode verifikasi.");
    } finally {
      setPendingSend(false);
    }
  };

  const changesPasswordHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setIsSuccess(false);
      return setMessage("Silakan isi sandi baru.");
    }
    if (newPassword !== confirmPassword) {
      setIsSuccess(false);
      return setMessage("Konfirmasi kata sandi tidak sama.");
    }

    try {
      setPendingSubmit(true);
      await changesPassword(userEmail, newPassword, verification);
      setIsSuccess(true);
      setMessage("Kata sandi berhasil diperbarui!");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch {
      setIsSuccess(false);
      setMessage("Gagal memperbarui kata sandi. Periksa kode verifikasi.");
    } finally {
      setPendingSubmit(false);
    }
  };

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

      {/* SVG ClipPath Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="emeraldCurveClip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L0.72,0 C0.90,0.35 0.88,0.75 0.58,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* SHAPE BACKGROUND + SLIDESHOW WRAPPER */}
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
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-white text-neutral-800 text-sm font-semibold px-4 py-2.5 rounded-full shadow-sm hover:bg-neutral-50 hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft size={16} />
            Masuk
          </Link>
          <div className="hidden sm:flex items-center gap-2.5 ml-2 lg:text-white text-emerald-950">
            <Image src="/logo-kompas-desa/kompas_logo_icon.png" alt="logo" width={25} height={25} />
            <span className="text-xl font-bold tracking-tight">Kompas&apos;Desa</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center w-full max-w-[1600px] mx-auto overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden lg:flex lg:w-[45%] h-full flex-col justify-center px-6 lg:px-12 xl:px-16 text-white relative z-40">
          <div className="relative z-10 w-full max-w-[380px]">
            <h1 className="left-anim-item text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
              Atur Ulang <br />
              <span className="text-emerald-400">Kata Sandi</span>
            </h1>
            <p className="left-anim-item text-sm lg:text-base text-emerald-100/80 leading-relaxed font-medium">
              Gunakan kata sandi yang kuat dengan kombinasi huruf, angka, dan simbol agar akun Anda tetap aman.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - Form */}
        <div className="w-full lg:w-[50%] h-full flex flex-col justify-center items-center lg:items-start px-6 lg:pl-24 xl:pl-32 relative z-40 ml-auto">
          <div className="w-full max-w-[380px] xl:max-w-[420px]">

            <div className="right-anim-item mb-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
                Sandi Baru
              </h2>
              <p className="text-xs lg:text-sm text-neutral-500 font-medium">
                Masukkan email, kode verifikasi, dan kata sandi baru Anda.
              </p>
            </div>

            <form onSubmit={changesPasswordHandler} className="flex flex-col gap-4">
              {message && (
                <div
                  role="alert"
                  className={`right-anim-item text-center text-[13px] font-semibold rounded-xl px-4 py-3 border ${
                    isSuccess
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Email */}
              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="userEmail" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Email Terdaftar
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="userEmail"
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="nama@kompasdesa.id"
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                  />
                </div>
              </div>

              {/* Verification Code */}
              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="verification" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Kode Verifikasi
                </label>
                <div className="relative group flex items-center">
                  <div className="absolute left-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <KeyRound size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="verification"
                    type="text"
                    required
                    value={verification}
                    onChange={(e) => setVerification(e.target.value)}
                    placeholder="Masukkan kode verifikasi"
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-28 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={sendHandler}
                    disabled={pendingSend}
                    className="absolute right-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
                  >
                    {pendingSend ? <Loader2 size={14} className="animate-spin inline" /> : "Kirim Kode"}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="newPassword" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Sandi Baru
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Sandi baru"
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-1 ml-1 flex flex-col gap-1">
                    <div className="flex gap-1 w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.color} ${strength.level === 1 ? 'w-1/3' : strength.level === 2 ? 'w-2/3' : 'w-full'}`}></div>
                    </div>
                    <span className={`text-[10px] font-bold ${strength.textColor}`}>
                      Kekuatan: {strength.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Konfirmasi Sandi Baru
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi sandi baru"
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                  </button>
                </div>

                {confirmPassword && (
                  <span className={`text-[10px] font-bold mt-1 ml-1 ${newPassword === confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                    {newPassword === confirmPassword ? '✓ Password cocok' : '✕ Password tidak sama'}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="right-anim-item flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="w-1/2 bg-white border-2 border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-semibold text-[13px] lg:text-sm rounded-2xl py-3.5 shadow-sm transition-all duration-150 ease-out active:scale-[0.97]"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={pendingSubmit}
                  className="group flex w-1/2 items-center justify-center gap-2 rounded-2xl bg-[#025246] px-4 py-3.5 text-[15px] font-extrabold text-white shadow-md transition-all duration-300 ease-out hover:bg-[#04382f] hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                >
                  {pendingSubmit ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Selesai</span>
                  )}
                </button>
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