"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sprout, ShoppingBasket, ArrowLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";

const slideshowImages = [
  "/images/login/ImageLogin.png",
  "/images/login/ImagePetani.png",
  "/images/login/ImagePembeli.png",
];

const roles = [
  {
    id: "petani",
    href: "/auth/register/petani",
    icon: Sprout,
    title: "Petani",
    subtitle: "Jual Hasil Panen",
    description: "Kendalikan harga, kelola stok, dan pasarkan hasil panenmu langsung tanpa perantara.",
  },
  {
    id: "user",
    href: "/auth/register/user",
    icon: ShoppingBasket,
    title: "Pembeli",
    subtitle: "Belanja Pangan Lokal",
    description: "Dapatkan bahan segar berkualitas langsung dari tangan pertama dengan harga jujur.",
  },
];

export default function Register() {
  const containerRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % slideshowImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let ctx: ReturnType<typeof gsap.context> | null = null;
    let cleanupMouseMove: ((e: MouseEvent) => void) | null = null;

    import("gsap").then(({ default: gsap }) => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        tl.fromTo(".bg-curve-container",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 1.5, ease: "power4.inOut" }
        )
        .fromTo([".header-item", ".left-anim-item", ".right-anim-item"],
          { opacity: 0, y: 80 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 1.2, ease: "back.out(1.2)" },
          "-=0.9"
        )
        .fromTo(".footer-anim",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
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
    });

    return () => {
      ctx?.revert?.();
      if (cleanupMouseMove) window.removeEventListener("mousemove", cleanupMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-[100dvh] w-full relative bg-[#FAFAFA] font-sans overflow-hidden flex flex-col perspective-1000">

      {/* SVG ClipPath Definition (Lekukan Asimetris Dinamis) */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="registerClip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L0.75,0 C0.85,0.4 0.65,0.6 0.60,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* SHAPE BACKGROUND + SLIDESHOW WRAPPER (Warna Emerald Hijau Awal) */}
      <div
        className="bg-curve-container absolute top-0 left-0 w-full lg:w-[55%] h-full z-0 drop-shadow-2xl pointer-events-none hidden lg:block overflow-hidden bg-gradient-to-br from-[#022c22] to-[#064e3b]"
        style={{ clipPath: "url(#registerClip)" }}
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
        
        {/* Gradient Overlay Hijau Emerald Awal */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#022c22]/90 via-[#022c22]/70 to-[#064e3b]/80" />
      </div>

      {/* AMBIENT FLOATING ORBS (Blur Ijo) */}
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

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center w-full max-w-[1600px] mx-auto overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden lg:flex lg:w-[45%] h-full flex-col justify-center px-6 lg:px-12 xl:px-16 text-white relative z-40">
          <div className="relative z-10 w-full max-w-[380px]">

            <h1 className="left-anim-item text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
              Tentukan <br />
              <span className="text-emerald-400">Peranmu</span>
            </h1>
            <p className="left-anim-item text-sm lg:text-base text-emerald-100/80 leading-relaxed font-medium">
              Bergabunglah dengan sistem Kompas&apos;Desa. Pilih akses akun Anda untuk mulai bertransaksi secara langsung.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - Role Selection Cards */}
        <div className="w-full lg:w-[50%] h-full flex flex-col justify-center items-center lg:items-start px-6 lg:pl-24 xl:pl-32 relative z-40 ml-auto">
          <div className="w-full max-w-[380px] xl:max-w-[420px]">

            <div className="right-anim-item mb-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold tracking-widest uppercase mb-2">
                Pilihan pendaftaran
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight">
                Daftar sebagai...
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {roles.map((role, i) => {
                const isHovered = hoveredIndex === i;
                const isDimmed = hoveredIndex !== null && hoveredIndex !== i;

                return (
                  <Link
                    key={role.id}
                    href={role.href}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`right-anim-item group relative flex items-center justify-between p-5 rounded-2xl bg-white border-2 border-neutral-200 text-neutral-900 transition-all duration-300 ease-out cursor-pointer hover:border-emerald-600 hover:bg-emerald-50 hover:-translate-y-1 hover:shadow-xl ${
                      isDimmed ? "opacity-50 scale-[0.98]" : "opacity-100 scale-100"
                    }`}
                    aria-label={`Daftar sebagai ${role.title}`}
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-[#025246]/10 text-[#025246] group-hover:bg-[#025246] group-hover:text-white transition-colors shrink-0">
                        <role.icon strokeWidth={2} size={24} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                            {role.title}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold tracking-tight text-neutral-900 group-hover:text-emerald-900 transition-colors">
                          {role.subtitle}
                        </h3>
                        <p className="text-xs text-neutral-500 group-hover:text-emerald-700 line-clamp-1 mt-0.5 transition-colors font-medium">
                          {role.description}
                        </p>
                      </div>
                    </div>

                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-neutral-100 group-hover:bg-[#025246] text-neutral-400 group-hover:text-white transition-all shrink-0 ml-2">
                      <ArrowUpRight
                        size={20}
                        className="transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="right-anim-item mt-8 flex items-center justify-center gap-1.5">
              <span className="text-[13.5px] text-neutral-500">Sudah mempunyai akun?</span>
              <Link href="/auth/login" className="text-[13.5px] font-bold text-[#025246] hover:underline">
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer-anim relative z-10 shrink-0 w-full text-center py-4 text-[12px] font-medium text-neutral-400">
        &copy; 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}