"use client";

import Image from "next/image";
import { ArrowUpRight, MoveUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Counter from "@/components/animation/Counter";

const statistics = [
  {
    value: <Counter end={28} duration={3000} />,
    suffix: "juta+",
    label: "Rumah tangga usaha pertanian",
    source: "BPS · 2024",
  },
  {
    value: "2–7",
    suffix: "",
    label: "Pelaku distribusi dalam rantai pasok",
    source: "BPS · 2025",
  },
  {
    value: <Counter end={6} duration={2000} />,
    suffix: "juta+",
    label: "Petani milenial usia 19–39 tahun",
    source: "BPS · 2023",
  },
];

export function About() {
  return (
    <section className="relative overflow-hidden bg-[#F7F9F8] text-[#18211F]">
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-120px] top-[140px] h-[420px] w-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(2,82,70,0.06), transparent 70%)" }}
      />
      <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        {/* ================= HEADER ================= */}
        <div className="mb-14 flex lg:mb-20 items-center justify-center">
          <div>
            <h2 className="max-w-3xl text-[30px] font-bold leading-tight tracking-tight text-[#1f1f1f] text-center sm:text-[34px] md:text-[38px]">
              Membangun akses <span className="text-[#025246]">dan Membuka peluang.</span>

            </h2>
          </div>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-[#DDE8E4]">
              <Image
                src="/images/landingpage/about/tanamanpetani.webp"
                alt="Petani merawat tanaman di lahan pertanian"
                width={1200}
                height={1400}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />

              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {/* Image Label */}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-left">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                    Sc: Kabupaten Wonogiri, Jawa Tengah
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                  <MoveUpRight className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT : CONTENT */}
          <div className="flex flex-col justify-center">
            <div className="mx-auto max-w-[650px] lg:mx-0">
              {/* Statistics */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0">
                {statistics.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 16,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      margin: "-60px",
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                      ease: "easeOut",
                    }}
                    className={`group flex flex-col items-center text-center md:items-start md:text-left py-3 sm:py-5 lg:py-1 ${index > 0
                      ? "border-t border-[#DDE5E1] pt-6 md:border-l md:border-t-0 md:pt-0 md:pl-8 lg:pl-8"
                      : ""
                      }`}
                  >
                    {/* Number */}
                    <div className="flex items-end justify-center gap-2 md:justify-start">
                      <span className="text-[48px] font-black leading-none tracking-[-0.05em] text-[#025246] sm:text-[50px]">
                        {stat.value}
                      </span>

                      {stat.suffix && (
                        <span className="pb-1 text-xl font-bold text-[#B29921]">
                          {stat.suffix}
                        </span>
                      )}
                    </div>

                    {/* Label */}
                    <p className="mt-4 max-w-[220px] text-[14px] font-semibold leading-relaxed text-[#33433E]">
                      {stat.label}
                    </p>

                    {/* Source */}
                    <div className="mt-5 flex items-center justify-center gap-2 md:justify-start">
                      <span className="h-1 w-1 rounded-full bg-[#025246]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {stat.source}
                      </span>
                    </div>

                    {/* Hover Line */}
                    <div className="mt-6 h-px w-0 bg-[#025246] transition-all duration-500 group-hover:w-10 mx-auto md:mx-0" />
                  </motion.div>
                ))}
              </div>

              {/* Divider */}
              <div className="my-8 h-px w-full bg-[#DDE5E1]" />

              {/* Story */}
              <div className="text-center lg:text-left">
                <p className="text-[16px] leading-[1.9] text-[#52605C]">
                  Potensi pertanian Indonesia tumbuh dari desa, dengan beragam
                  hasil pertanian yang menjadi bagian penting bagi masyarakat.
                  Namun, tidak semua hasil tersebut memiliki akses yang mudah
                  untuk menjangkau pasar yang lebih luas dan menemukan pembeli
                  yang tepat.
                </p>

                <p className="mt-6 text-[16px] leading-[1.9] text-[#52605C]">
                  Jarak antara petani dan pasar, proses distribusi yang panjang,
                  serta keterbatasan informasi masih menjadi tantangan dalam
                  mengembangkan potensi hasil pertanian lokal secara optimal.
                </p>

                <p className="mt-6 text-[16px] leading-[1.9] text-[#52605C]">
                  <strong className="font-bold text-[#025246]">
                    KompasDesa hadir untuk membuka akses pasar yang lebih luas
                  </strong>{" "}
                  dengan mempertemukan petani dan pembeli
                  melalui pemasaran yang lebih mudah, terarah, transparan, dan
                  efisien.
                </p>
              </div>

              {/* Brand Statement */}
              <div className="mt-8 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 border-t border-[#DDE5E1] pt-7">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#025246]">
                  <ArrowUpRight
                    className="h-4 w-4 text-white"
                    strokeWidth={2.5}
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#18211F]">
                    Tujuan Kami
                  </p>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-400">
                    Menghubungkan potensi desa dengan pasar untuk menciptakan
                    pertanian yang lebih maju dan berkelanjutan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM STATEMENT ================= */}
        <div className="mt-16 flex flex-col items-center text-center gap-4 border-t border-[#DDE5E1] pt-7 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="max-w-xl text-sm leading-relaxed text-slate-400">
            Bukan hanya mempertemukan produk dengan pembeli, tetapi membuka
            jalur agar potensi desa dapat berkembang lebih jauh.
          </p>

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#025246]">
            #DariDesaUntukNegeri
          </span>
        </div>
      </div>
    </section>
  );
}

// "use client";

// import { useRef } from "react";
// import Image from "next/image";
// import { ArrowUpRight, MoveUpRight } from "lucide-react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { useGSAP } from "@gsap/react";
// import Counter from "@/components/animation/Counter";

// // Register ScrollTrigger
// if (typeof window !== "undefined") {
//   gsap.registerPlugin(ScrollTrigger);
// }

// const statistics = [
//   {
//     value: <Counter end={28} duration={3000} />,
//     suffix: "juta+",
//     label: "Rumah tangga usahaㅤ pertanian",
//     source: "BPS · 2024",
//   },
//   {
//     value: "2–7",
//     suffix: "",
//     label: "Pelaku distribusi dalam rantai pasok",
//     source: "BPS · 2025",
//   },
//   {
//     value: <Counter end={6} duration={2000} />,
//     suffix: "juta+",
//     label: "Petani milenial usia 19–39 tahun",
//     source: "BPS · 2023",
//   },
// ];

// export function About() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const imageWrapperRef = useRef<HTMLDivElement>(null);
//   const imageRef = useRef<HTMLImageElement>(null);
//   const imageOverlayRef = useRef<HTMLDivElement>(null);

//   useGSAP(
//     () => {
//       // 1. Header Animation (Fade & Slide Up)
//       gsap.from(".header-content", {
//         y: 40,
//         opacity: 0,
//         duration: 1.2,
//         ease: "power3.out",
//         scrollTrigger: {
//           trigger: ".header-content",
//           start: "top 85%",
//         },
//       });

//       // 2. 3D Image Reveal Animation
//       const imgTl = gsap.timeline({
//         scrollTrigger: {
//           trigger: imageWrapperRef.current,
//           start: "top 80%",
//         },
//       });

//       imgTl
//         .fromTo(
//           imageWrapperRef.current,
//           { opacity: 0, y: 60, rotationX: 15, transformPerspective: 1000 },
//           { opacity: 1, y: 0, rotationX: 0, duration: 1.5, ease: "expo.out" }
//         )
//         .fromTo(
//           imageRef.current,
//           { scale: 1.2 },
//           { scale: 1, duration: 1.8, ease: "power3.out" },
//           "-=1.5"
//         );

//       // 3. Statistics Cards Stagger Animation (Setiap card naik satu-satu secara elegan)
//       gsap.from(".stat-item", {
//         y: 40,
//         opacity: 0,
//         stagger: 0.2,
//         duration: 1.2,
//         ease: "power3.out",
//         scrollTrigger: {
//           trigger: ".stats-container",
//           start: "top 85%",
//         },
//       });

//       // 4. Dividers Animation (Melebar dari kiri ke kanan)
//       gsap.utils.toArray(".divider-line").forEach((line: any) => {
//         gsap.from(line, {
//           scaleX: 0,
//           transformOrigin: "left center",
//           duration: 1.5,
//           ease: "expo.inOut",
//           scrollTrigger: {
//             trigger: line,
//             start: "top 90%",
//           },
//         });
//       });

//       // 5. Story Content Stagger (Paragraf demi paragraf naik berurutan)
//       gsap.from(".story-item", {
//         y: 30,
//         opacity: 0,
//         stagger: 0.2,
//         duration: 1.2,
//         ease: "power3.out",
//         scrollTrigger: {
//           trigger: ".story-container",
//           start: "top 85%",
//         },
//       });

//       // 6. Brand Statement & Bottom Section Animation
//       gsap.from(".reveal-bottom", {
//         y: 30,
//         opacity: 0,
//         stagger: 0.15,
//         duration: 1.2,
//         ease: "power3.out",
//         scrollTrigger: {
//           trigger: ".reveal-bottom-container",
//           start: "top 90%",
//         },
//       });
//     },
//     { scope: containerRef }
//   );

//   // --- LOGIKA 3D LAYERING (MOUSE MOVE) ---
//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!imageWrapperRef.current || !imageOverlayRef.current) return;

//     const { left, top, width, height } =
//       imageWrapperRef.current.getBoundingClientRect();

//     const x = (e.clientX - left) / width - 0.5;
//     const y = (e.clientY - top) / height - 0.5;

//     // Putar kontainer utama (Max 12 derajat)
//     gsap.to(imageWrapperRef.current, {
//       rotationY: x * 12,
//       rotationX: -y * 12,
//       ease: "power2.out",
//       duration: 0.6,
//       transformPerspective: 1000,
//     });

//     // Geser overlay/label lebih jauh (Efek Parallax / Pop-out)
//     gsap.to(imageOverlayRef.current, {
//       x: x * -20,
//       y: y * -20,
//       ease: "power2.out",
//       duration: 0.6,
//     });
//   };

//   const handleMouseLeave = () => {
//     gsap.to(imageWrapperRef.current, {
//       rotationY: 0,
//       rotationX: 0,
//       ease: "power3.out",
//       duration: 1.2,
//     });
//     gsap.to(imageOverlayRef.current, {
//       x: 0,
//       y: 0,
//       ease: "power3.out",
//       duration: 1.2,
//     });
//   };

//   return (
//     <section
//       ref={containerRef}
//       className="relative overflow-hidden bg-[#F7F9F8] text-[#18211F]"
//     >
//       {/* Decorative Background */}
//       <div
//         aria-hidden="true"
//         className="pointer-events-none absolute right-[-120px] top-[140px] h-[420px] w-[420px] rounded-full bg-[#025246]/[0.035] blur-3xl"
//       />

//       <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
//         {/* ================= HEADER ================= */}
//         <div className="header-content mb-14 flex items-center justify-center lg:mb-20">
//           <div>
//             <h2 className="max-w-3xl text-center text-3xl font-bold leading-tight tracking-tight text-[#1f1f1f] sm:text-3xl md:text-3xl">
//               Membangun akses, <span className="text-[#025246]">dan Membuka peluang.</span>
//             </h2>
//           </div>
//         </div>

//         {/* ================= MAIN CONTENT ================= */}
//         <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">

//           {/* LEFT : IMAGE DENGAN 3D LAYERING */}
//           <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none [perspective:1000px]">
//             <div
//               ref={imageWrapperRef}
//               onMouseMove={handleMouseMove}
//               onMouseLeave={handleMouseLeave}
//               className="relative overflow-hidden rounded-[2rem] bg-[#DDE8E4] shadow-2xl shadow-[#025246]/5 [transform-style:preserve-3d] cursor-crosshair"
//             >
//               <Image
//                 ref={imageRef}
//                 src="/images/about/tanamanpetani.png"
//                 alt="Petani dan hasil pertanian"
//                 width={1200}
//                 height={1400}
//                 className="aspect-[4/5] h-full w-full object-cover scale-105"
//               />

//               {/* Image Overlay Gradient */}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

//               {/* Image Label - Diberi efek pop-out translateZ */}
//               <div
//                 ref={imageOverlayRef}
//                 className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-left pointer-events-none [transform:translateZ(40px)]"
//               >
//                 <div>
//                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 drop-shadow-md">
//                     Dari Desa
//                   </p>
//                   <p className="mt-1 text-sm font-semibold text-white drop-shadow-md">
//                     Potensi lokal, peluang nasional.
//                   </p>
//                 </div>

//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md shadow-lg">
//                   <MoveUpRight className="h-4 w-4 text-white" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT : CONTENT */}
//           <div className="flex flex-col justify-center">
//             <div className="mx-auto max-w-[650px] lg:mx-0">

//               {/* Statistics (Animated Cards) */}
//               <div className="stats-container grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0">
//                 {statistics.map((stat, index) => (
//                   <div
//                     key={index}
//                     className={`stat-item group flex flex-col items-center text-center py-3 sm:py-5 lg:py-1 md:items-start md:text-left ${index > 0
//                         ? "border-t border-[#DDE5E1] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0 lg:pl-8"
//                         : ""
//                       }`}
//                   >
//                     {/* Number */}
//                     <div className="flex items-end justify-center gap-2 md:justify-start">
//                       <span className="text-[48px] font-black leading-none tracking-[-0.05em] text-[#025246] sm:text-[50px]">
//                         {stat.value}
//                       </span>
//                       {stat.suffix && (
//                         <span className="pb-1 text-xl font-bold text-[#B29921]">
//                           {stat.suffix}
//                         </span>
//                       )}
//                     </div>

//                     {/* Label */}
//                     <p className="mt-4 max-w-[220px] text-[14px] font-semibold leading-relaxed text-[#33433E]">
//                       {stat.label}
//                     </p>

//                     {/* Source */}
//                     <div className="mt-5 flex items-center justify-center gap-2 md:justify-start">
//                       <span className="h-1 w-1 rounded-full bg-[#025246]" />
//                       <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
//                         {stat.source}
//                       </span>
//                     </div>

//                     {/* Hover Line */}
//                     <div className="mx-auto mt-6 h-px w-0 bg-[#025246] transition-all duration-500 group-hover:w-10 md:mx-0" />
//                   </div>
//                 ))}
//               </div>

//               {/* Divider */}
//               <div className="divider-line my-8 h-px w-full bg-[#DDE5E1]" />

//               {/* Story (Animated Stagger Paragraphs) */}
//               <div className="story-container text-center lg:text-left">
//                 <p className="story-item text-[16px] leading-[1.9] text-[#52605C]">
//                   Potensi pertanian Indonesia tumbuh dari desa, dengan beragam
//                   hasil pertanian yang menjadi bagian penting bagi masyarakat.
//                   Namun, tidak semua hasil tersebut memiliki akses yang mudah
//                   untuk menjangkau pasar yang lebih luas dan menemukan pembeli
//                   yang tepat.
//                 </p>

//                 <p className="story-item mt-6 text-[16px] leading-[1.9] text-[#52605C]">
//                   Jarak antara petani dan pasar, proses distribusi yang panjang,
//                   serta keterbatasan informasi masih menjadi tantangan dalam
//                   mengembangkan potensi hasil pertanian lokal secara optimal.
//                 </p>

//                 <p className="story-item mt-6 text-[16px] leading-[1.9] text-[#52605C]">
//                   <strong className="font-bold text-[#025246]">
//                     KompasDesa hadir untuk membuka akses pasar yang lebih luas
//                   </strong>{" "}
//                   dengan mempertemukan petani, pembeli, dan jaringan distribusi
//                   melalui pemasaran yang lebih mudah, terarah, transparan, dan
//                   efisien.
//                 </p>
//               </div>

//               {/* Brand Statement (Animated Item) */}
//               <div className="story-item mt-8 flex flex-col items-center gap-4 border-t border-[#DDE5E1] pt-7 text-center sm:flex-row sm:items-start sm:text-left">
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#025246]">
//                   <ArrowUpRight
//                     className="h-4 w-4 text-white"
//                     strokeWidth={2.5}
//                   />
//                 </div>

//                 <div>
//                   <p className="text-sm font-bold text-[#18211F]">
//                     Tujuan Kami
//                   </p>
//                   <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-400">
//                     Menghubungkan potensi desa dengan pasar untuk menciptakan
//                     pertanian yang lebih maju dan berkelanjutan.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ================= BOTTOM STATEMENT ================= */}
//         <div className="reveal-bottom-container mt-16 border-t border-[#DDE5E1] pt-7">
//           <div className="reveal-bottom flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
//             <p className="max-w-xl text-sm leading-relaxed text-slate-400">
//               Bukan hanya mempertemukan produk dengan pembeli, tetapi membuka
//               jalur agar potensi desa dapat berkembang lebih jauh.
//             </p>

//             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#025246]">
//               #DariDesaUntukNegeri
//             </span>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }