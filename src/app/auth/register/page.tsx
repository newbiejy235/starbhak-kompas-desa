"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Sprout, ShoppingBasket, ArrowLeft, ChevronRight, Compass } from "lucide-react";
import gsap from "gsap";

const roles = [
  {
    href: "/auth/register/petani",
    icon: Sprout,
    stamp: "PETANI",
    title: "Jual hasil panen",
    description:
      "Pasang harga sendiri, kelola stok, dan kirim langsung ke pembeli di sekitarmu.",
  },
  {
    href: "/auth/register/user",
    icon: ShoppingBasket,
    stamp: "PEMBELI",
    title: "Belanja langsung dari petani",
    description:
      "Dapatkan hasil panen segar dengan harga jujur, tanpa perantara di tengah.",
  },
];

export default function Register() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<SVGSVGElement>(null);
  const contourRefs = useRef<(SVGPathElement | null)[]>([]);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // draw the terrace contour lines
      const paths = contourRefs.current.filter(Boolean) as SVGPathElement[];
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(leftRef.current, { opacity: 0, x: -24, duration: 0.7 })
        .from(".left-anim-item", { opacity: 0, y: 16, stagger: 0.09, duration: 0.55 }, "-=0.35")
        .to(
          paths,
          reduceMotion
            ? { strokeDashoffset: 0, duration: 0.01 }
            : { strokeDashoffset: 0, duration: 1.4, stagger: 0.18, ease: "power2.inOut" },
          "-=0.5"
        )
        .from(
          ".right-anim-item",
          { opacity: 0, y: 20, stagger: 0.1, duration: 0.55 },
          "-=1.1"
        );

      if (!reduceMotion && compassRef.current) {
        gsap.to(compassRef.current, {
          rotate: 360,
          duration: 50,
          repeat: -1,
          ease: "none",
          transformOrigin: "50% 50%",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleEnter = (i: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.to(badgeRefs.current[i], { y: -3, scale: 1.05, duration: 0.35, ease: "power2.out" });
    gsap.to(tagRefs.current[i], { rotate: 0, duration: 0.35, ease: "power2.out" });
  };

  const handleLeave = (i: number) => {
    gsap.to(badgeRefs.current[i], { y: 0, scale: 1, duration: 0.4, ease: "power2.out" });
    gsap.to(tagRefs.current[i], { rotate: -6, duration: 0.4, ease: "power2.out" });
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex bg-[#FBF6EA] overflow-hidden"
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&family=JetBrains+Mono:wght@500;600&display=swap");
        .font-display {
          font-family: "Plus Jakarta Sans", sans-serif;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .font-body {
          font-family: "Plus Jakarta Sans", sans-serif;
        }
        .font-tag {
          font-family: "JetBrains Mono", monospace;
        }
      `}</style>

      {/* LEFT — field panel */}
      <div
        ref={leftRef}
        className="font-body hidden lg:flex lg:w-[44%] xl:w-[40%] bg-[#123527] relative flex-col justify-between p-12 xl:p-16 select-none overflow-hidden"
      >
        {/* terrace contour signature */}
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-[60%] pointer-events-none"
          viewBox="0 0 600 340"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            ref={(el) => { contourRefs.current[0] = el; }}
            d="M0,300 C90,270 150,290 220,260 C300,224 360,250 430,210 C490,176 540,196 600,160"
            stroke="#E3A93B"
            strokeOpacity="0.55"
            strokeWidth="1.5"
          />
          <path
            ref={(el) => { contourRefs.current[1] = el; }}
            d="M0,320 C100,300 170,315 240,292 C320,264 380,288 450,254 C510,226 555,242 600,214"
            stroke="#E3A93B"
            strokeOpacity="0.32"
            strokeWidth="1.5"
          />
          <path
            ref={(el) => { contourRefs.current[2] = el; }}
            d="M0,338 C110,326 180,336 250,320 C330,300 390,318 460,292 C520,270 560,282 600,262"
            stroke="#E3A93B"
            strokeOpacity="0.2"
            strokeWidth="1.5"
          />
        </svg>

        <div className="left-anim-item relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white text-xs font-medium px-4 py-2.5 rounded-full border border-white/10 transition-colors duration-200"
          >
            <ArrowLeft size={14} />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="relative z-10 my-auto py-12">
          <div className="left-anim-item inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E3A93B]/10 border border-dashed border-[#E3A93B]/40 text-[#E3A93B] text-[11px] font-tag font-semibold tracking-[0.14em] uppercase mb-7">
            <Compass ref={compassRef} size={13} />
            Kompas Untuk Pangan Lokal
          </div>
          <h1 className="left-anim-item font-display text-white font-medium text-[2.6rem] xl:text-[3.1rem] tracking-tight leading-[1.12] mb-6">
            Dari sawah,
            <br />
            langsung ke
            <br />
            <span className="italic text-[#E3A93B]">meja warga.</span>
          </h1>
          <p className="left-anim-item text-[#CFE3D6]/80 text-sm xl:text-[15px] leading-relaxed max-w-sm">
            Tanpa tengkulak, tanpa antre panjang. Petani atur sendiri hasil
            panen dan harganya — pembeli dapat harga yang jujur.
          </p>
        </div>

        <div className="left-anim-item relative z-10 flex items-center gap-2 text-xs text-[#CFE3D6]/45 font-medium">
          <Compass size={12} className="shrink-0" />
          Kompas&apos;Desa — arah baru pertanian Indonesia. &copy; 2026.
        </div>
      </div>

      {/* RIGHT — ticket panel */}
      <div className="font-body flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 relative bg-[#FBF6EA]">
        <div className="lg:hidden absolute top-6 left-6 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white border border-[#16231C]/10 text-[#16231C] text-xs font-semibold px-3.5 py-2 rounded-full shadow-sm hover:bg-[#F1EADA] transition-colors"
          >
            <ArrowLeft size={14} />
            Beranda
          </Link>
        </div>

        <div className="w-full max-w-[460px] mx-auto">
          <div className="right-anim-item mb-8 text-center lg:text-left">
            <h2 className="font-display text-[1.9rem] sm:text-[2.2rem] font-medium text-[#16231C] tracking-tight mb-2.5">
              Daftar Akun Baru
            </h2>
            <p className="text-[13px] sm:text-sm text-[#16231C]/55 leading-relaxed">
              Pilih peran untuk mulai. Satu akun, satu arah panen.
            </p>
          </div>

          <div className="right-anim-item space-y-5">
            {roles.map((role, i) => (
              <Link
                key={role.href}
                href={role.href}
                ref={(el) => { cardRefs.current[i] = el; }}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={() => handleLeave(i)}
                className="group relative flex items-stretch gap-0 rounded-[20px] border border-[#16231C]/12 bg-white shadow-[0_1px_2px_rgba(22,35,28,0.04)] hover:border-[#123527]/30 hover:shadow-[0_10px_30px_-8px_rgba(18,53,39,0.18)] transition-all duration-300 overflow-visible"
              >
                {/* stamp tag */}
                <span
                  ref={(el) => { tagRefs.current[i] = el; }}
                  className="font-tag absolute -top-2.5 -right-2 rotate-[-6deg] bg-[#C97A2B] text-white text-[10px] tracking-[0.12em] font-semibold px-2.5 py-1 rounded-[4px] shadow-sm"
                >
                  {role.stamp}
                </span>

                {/* icon column */}
                <div className="flex items-center justify-center px-5 sm:px-6 py-6">
                  <div
                    ref={(el) => { badgeRefs.current[i] = el; }}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#123527] text-[#E3A93B]"
                  >
                    <role.icon size={22} />
                  </div>
                </div>

                {/* perforation divider */}
                <div className="relative w-px my-3 border-l border-dashed border-[#16231C]/15">
                  <span className="absolute -top-3 -left-[7px] h-3.5 w-3.5 rounded-full bg-[#FBF6EA] border border-[#16231C]/12" />
                  <span className="absolute -bottom-3 -left-[7px] h-3.5 w-3.5 rounded-full bg-[#FBF6EA] border border-[#16231C]/12" />
                </div>

                {/* text + chevron */}
                <div className="flex flex-1 items-center justify-between gap-3 py-5 pl-5 pr-5 min-w-0">
                  <div className="min-w-0">
                    <h3 className="text-[15px] sm:text-base font-bold text-[#16231C]">
                      {role.title}
                    </h3>
                    <p className="text-[12.5px] sm:text-[13px] text-[#16231C]/55 mt-1 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={17}
                    className="shrink-0 text-[#16231C]/30 group-hover:text-[#C97A2B] group-hover:translate-x-0.5 transition-all duration-300"
                  />
                </div>
              </Link>
            ))}
          </div>

          <div className="right-anim-item mt-8 pt-6 border-t border-dashed border-[#16231C]/12 text-center text-[13px] sm:text-sm text-[#16231C]/60">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="text-[#123527] font-bold hover:underline">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}