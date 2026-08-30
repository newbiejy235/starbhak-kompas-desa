"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  MapPin,
  Package,
  Loader2,
  ShoppingBasket,
  Truck,
  Shield
} from "lucide-react";
import { saveRegisterDraft, getRegisterDraft } from "@/lib/register";
import StepProgress from "@/components/auth/StepProgress";
import RegisterStepMeta from "@/components/auth/RegisterStepMeta";
import BrandStoryPanel from "@/components/auth/BrandStoryPanel";
import MobileBrandBanner from "@/components/auth/MobileBrandBanner";
import { animateStepExit, prefersReducedMotion } from "@/lib/authTransition";
import { daftarKota } from "@/constants/dataKota";
import Image from "next/image";

const slideshowImages = [
  "/images/auth/Desa.jpg",
  "/images/auth/Tracktor.jpg",
  "/images/auth/Sawah.jpg",
];

export default function ProfilPembeli() {
  const router = useRouter();

  const [komoditas, setKomoditas] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [estimasi, setEstimasi] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  const filteredKota = daftarKota.filter((kota) =>
    kota.toLowerCase().includes(lokasi.toLowerCase())
  );

  useEffect(() => {
    const draft = getRegisterDraft();
    if (!draft.fullName) {
      router.replace("/auth/register/user");
      return;
    }
    if (draft.komoditas) setKomoditas(draft.komoditas);
    if (draft.lokasi) setLokasi(draft.lokasi);
    if (draft.estimasi) setEstimasi(draft.estimasi);
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % slideshowImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let ctx: ReturnType<typeof gsap.context> | null = null;
    let cleanupMouseMove: ((e: MouseEvent) => void) | null = null;

    import("gsap").then(({ default: gsap }) => {
      ctx = gsap.context(() => {
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

      if (!reduced) {
        cleanupMouseMove = (e: MouseEvent) => {
          const x = (e.clientX / window.innerWidth - 0.5) * 40;
          const y = (e.clientY / window.innerHeight - 0.5) * 40;
          gsap.to(".ambient-orb", {
            x: (i: number) => x * (i + 1.5),
            y: (i: number) => y * (i + 1.5),
            duration: 1.5,
            ease: "power2.out"
          });
        };
        window.addEventListener("mousemove", cleanupMouseMove);
      }
    });

    return () => {
      ctx?.revert?.();
      if (cleanupMouseMove) window.removeEventListener("mousemove", cleanupMouseMove);
    };
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsNavigating(true);

    saveRegisterDraft({
      komoditas,
      lokasi,
      estimasi,
    });

    animateStepExit(rightColRef.current, "forward", () => {
      router.push("/auth/register/user/password");
    });
  };

  const handleBack = () => {
    setIsNavigating(true);

    saveRegisterDraft({
      komoditas,
      lokasi,
      estimasi,
    });

    animateStepExit(rightColRef.current, "back", () => {
      router.back();
    });
  };

  return (
    <div ref={containerRef} className="h-[100dvh] w-full relative bg-[#FAFAFA] font-sans overflow-hidden flex flex-col perspective-1000">

      {/* SVG ClipPath Definition (Hidden) */}
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

      <MobileBrandBanner title="Profil" highlight="Pembeli Anda" />

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center w-full max-w-[1600px] mx-auto overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden lg:flex lg:w-[45%] h-full flex-col justify-center px-6 lg:px-12 xl:px-16 relative z-40">
          <BrandStoryPanel
            kicker="Ekosistem Pertanian Digital"
            title="Profil"
            highlight="Pembeli Anda"
            description="Bantu kami menampilkan hasil panen dan perkiraan ongkir terdekat untuk Anda."
            stats={[
              { icon: ShoppingBasket, value: "40+", label: "Komoditas segar siap dipesan" },
              { icon: Truck, value: "Real-time", label: "Negosiasi langsung dengan petani" },
              { icon: Shield, value: "Aman", label: "Transaksi terjamin aman" },
            ]}
          />
        </div>

        {/* RIGHT PANEL - Form Profile */}
        <div className="w-full lg:w-[50%] h-full flex flex-col justify-center items-center lg:items-start px-6 lg:pl-24 xl:pl-32 relative z-40 ml-auto">
          <div ref={rightColRef} className="w-full max-w-[380px] xl:max-w-[420px]">

            <div className="right-anim-item mb-3">
              <StepProgress current={2} />
            </div>

            <RegisterStepMeta current={2} label="Profile Pembeli" />

            <div className="right-anim-item mb-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
                Profile Pembeli
              </h2>
              <p className="text-xs lg:text-sm text-neutral-500 font-medium">
                Bantu kami menampilkan hasil panen dan perkiraan ongkir terdekat.
              </p>
            </div>

            <form onSubmit={handleNext} className="flex flex-col gap-4">

              <div className="right-anim-item flex flex-col gap-1.5">
                <label htmlFor="komoditas" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Komoditas Utama yang Dicari
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Search size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="komoditas"
                    type="text"
                    value={komoditas}
                    onChange={(e) => setKomoditas(e.target.value)}
                    placeholder="Contoh: Padi, Jagung, Cabai..."
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Added dynamic z-index to lift this field container above subsequent elements when dropdown is active */}
              <div className={`right-anim-item flex flex-col gap-1.5 relative ${showDropdown ? 'z-50' : 'z-10'}`}>
                <label htmlFor="lokasi" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Lokasi (Domisili Pengiriman)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <MapPin size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="lokasi"
                    type="text"
                    value={lokasi}
                    onChange={(e) => {
                      setLokasi(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => {
                      setShowDropdown(true);
                    }}
                    placeholder="Ketik nama kota/kabupaten..."
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm"
                    required
                    autoComplete="off"
                  />
                </div>

                {showDropdown && (
                  <ul className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 max-h-52 overflow-y-auto bg-white border-2 border-neutral-200 rounded-2xl shadow-2xl divide-y divide-neutral-100 focus:outline-none">
                    {filteredKota.length > 0 ? (
                      filteredKota.map((kota) => (
                        <li
                          key={kota}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setLokasi(kota);
                            setShowDropdown(false);
                          }}
                          className="px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer transition-colors"
                        >
                          {kota}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-neutral-400 text-center select-none">
                        Kota tidak ditemukan
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="right-anim-item flex flex-col gap-1.5 relative z-0">
                <label htmlFor="estimasi" className="text-[13px] font-bold text-neutral-700 ml-1">
                  Estimasi Kebutuhan
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-emerald-600 transition-colors">
                    <Package size={18} strokeWidth={2.5} />
                  </div>
                  <select
                    id="estimasi"
                    value={estimasi}
                    onChange={(e) => setEstimasi(e.target.value)}
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-neutral-900 outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 placeholder:font-normal hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 shadow-sm cursor-pointer appearance-none"
                    required
                  >
                    <option value="" disabled>
                      Pilih estimasi kebutuhan
                    </option>
                    <option value="SKALA_KECIL">
                      Skala Kecil (Di bawah 50 Kg)
                    </option>
                    <option value="SKALA_MENENGAH">
                      Skala Menengah (50 - 500 Kg)
                    </option>
                    <option value="SKALA_BESAR">
                      Skala Besar (Di atas 500 Kg)
                    </option>
                  </select>
                </div>
              </div>

              <div className="right-anim-item flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isNavigating}
                  className="w-1/2 bg-white border-2 border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-semibold text-[13px] lg:text-sm rounded-2xl py-3.5 shadow-sm transition-all duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-70"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isNavigating}
                  className="group flex w-1/2 items-center justify-center gap-2 rounded-2xl bg-[#025246] px-4 py-3.5 text-[15px] font-extrabold text-white shadow-md transition-all duration-300 ease-out hover:bg-[#04382f] hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                >
                  {isNavigating ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <span>Berikutnya</span>
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