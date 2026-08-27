"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Wheat,
  ShoppingBag,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import Counter from "@/components/animation/Counter";
import AnimatedHeading from "@/components/animation/headinglandingpage";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

export default function BentoGridStats() {
  return (
    <div className="w-full mt-10">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        {/* ================= HERO ================= */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-[#025246]/10 bg-[#E4F1EB] px-4 py-1.5 font-body text-[12px] font-semibold text-[#025246]">
            #DariDesaUntukNegeri
          </div>
          <AnimatedHeading
            text="Membuka Akses Hasil Panen ke Pasar yang Lebih Luas"
            className="font-display max-w-[760px] text-[40px] leading-[1.08]"
          />

          <p className="mt-4 max-w-[620px] font-body text-[14px] leading-relaxed text-[#75938F] sm:text-[15px]">
            Temukan hasil panen segar langsung dari petani, atau perluas
            jangkauan penjualan ke lebih banyak pembeli melalui satu platform.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex h-[44px] items-center justify-center rounded-xl bg-[#025246] px-5 font-body text-[14px] font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#013E35] hover:shadow-md"
            >
              Daftar
            </Link>

            <Link
              href="#komoditaslist"
              className="inline-flex h-[44px] items-center justify-center rounded-xl border border-[#E3EAE7] bg-white px-5 font-body text-[14px] font-semibold text-[#025246] shadow-sm transition-all duration-300 hover:border-[#025246]/25 hover:bg-[#F5FAF8]"
            >
              Lihat Pasar
            </Link>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="
            mt-10
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
            lg:grid-rows-[180px_180px]
          "
        >
          {/* ================= KEMENTAN ================= */}
          <motion.div
            variants={cardVariants}
            className="
              group
              relative
              h-[240px]
              overflow-hidden
              rounded-[24px]
              border
              border-[#E7ECEA]
              shadow-[0_6px_25px_rgba(0,0,0,0.035)]
              transition-all
              duration-500
              hover:-translate-y-1
              hover:shadow-[0_14px_35px_rgba(2,82,70,0.09)]
              sm:col-span-2
              lg:col-span-2
              lg:row-span-2
              lg:h-full
            "
          >
            <Image
              src="/images/landingpage/beranda/kementan.webp"
              alt="Hasil panen pertanian — kemitraan resmi terverifikasi Kementerian Pertanian RI"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              preload
            />

            {/* subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

            {/* Badge */}
            <div className="absolute right-5 top-5">
              <span className="rounded-full bg-white/90 px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-wider text-[#025246] shadow-sm">
                Kemitraan Resmi
              </span>
            </div>

            {/* Bottom */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <span className="font-body text-[12px] font-medium text-white">
                Terverifikasi Kementan RI
              </span>

              <span
                aria-hidden="true"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/40
                  text-white
                  opacity-0
                  transition-all
                  duration-300
                  group-hover:opacity-100
                "
              >
                <ArrowUpRight
                  className="h-4 w-4"
                  strokeWidth={2.2}
                />
              </span>
            </div>
          </motion.div>

          {/* ================= PETANI ================= */}
          <motion.div
            variants={cardVariants}
            className="
              flex
              h-[180px]
              flex-col
              justify-between
              rounded-[24px]
              border
              border-[#E7ECEA]
              bg-white
              p-5
              shadow-[0_6px_25px_rgba(0,0,0,0.035)]
              transition-all
              duration-500
              hover:-translate-y-1
              hover:shadow-[0_14px_35px_rgba(2,82,70,0.08)]
            "
          >
            <div className="flex items-center justify-between">
              <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-[#75938F]">
                Aktif
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F7F4] text-[#025246]">
                <Users className="h-4 w-4" strokeWidth={2} />
              </span>
            </div>

            <div>
              <div className="font-display flex items-baseline text-[38px] font-extrabold leading-none tracking-tight text-[#1F1F1F]">
                <Counter
                  end={200}
                  duration={3000}
                  delay={2000}
                  suffix=""
                />
                <span className="text-[#025246]">+</span>
              </div>

              <p className="mt-2 font-body text-[12px] text-[#75938F]">
                Petani Lokal Terdaftar
              </p>
            </div>
          </motion.div>

          {/* ================= PANEN ================= */}
          <motion.div
            variants={cardVariants}
            className="
              relative
              flex
              h-[180px]
              flex-col
              justify-between
              overflow-hidden
              rounded-[24px]
              bg-[#025246]
              p-5
              shadow-[0_8px_28px_rgba(2,82,70,0.14)]
              transition-all
              duration-500
              hover:-translate-y-1
              hover:shadow-[0_16px_38px_rgba(2,82,70,0.2)]
            "
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.09), transparent 70%)",
              }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <span className="font-body text-[10px] font-medium uppercase tracking-wider text-[#E4F1EB]/70">
                40+ Komoditas
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                <Wheat className="h-4 w-4" strokeWidth={2} />
              </span>
            </div>

            <div className="relative z-10">
              <div className="font-display flex items-baseline text-[38px] font-extrabold leading-none tracking-tight text-white">
                <Counter
                  end={1200}
                  duration={3500}
                  delay={2000}
                  suffix=""
                />
                <span className="text-[#7FBFA9]">+</span>
              </div>

              <p className="mt-2 font-body text-[12px] text-[#E4F1EB]/70">
                Ton Hasil Panen Terjual
              </p>
            </div>
          </motion.div>

          {/* ================= FARMER IMAGE ================= */}
          <motion.div
            variants={cardVariants}
            className="
              group
              relative
              h-[180px]
              overflow-hidden
              rounded-[24px]
              border
              border-[#E7ECEA]
              shadow-[0_6px_25px_rgba(0,0,0,0.035)]
              lg:h-full
            "
          >
            <Image
              src="/images/landingpage/beranda/petani.webp"
              alt="Petani lokal sedang bekerja di lahan pertanian"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="absolute bottom-4 left-4 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="font-body text-[11px] font-medium text-white">
                Daya Jangkau Komunitas
              </p>
            </div>
          </motion.div>

          {/* ================= ACTIVITY ================= */}
          <motion.div
            variants={cardVariants}
            className="flex h-[180px] flex-col gap-3"
          >
            <Link
              href="/auth/login"
              className="
                group
                flex
                flex-1
                items-center
                justify-between
                rounded-[20px]
                border
                border-[#E7ECEA]
                bg-white
                px-4
                shadow-[0_4px_18px_rgba(0,0,0,0.025)]
                transition-all
                duration-300
                hover:border-[#025246]/20
                hover:bg-[#FAFDFC]
              "
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F7F4] text-[#025246]">
                  <ShoppingBag className="h-4 w-4" />
                </span>

                <div>
                  <p className="font-display text-[12px] font-semibold text-[#1F1F1F]">
                    Pesanan Pelanggan
                  </p>

                  <p className="mt-0.5 font-body text-[11px] text-[#75938F]">
                    <span className="font-semibold text-[#025246]">
                      21 pesanan
                    </span>{" "}
                    · bulan ini
                  </p>
                </div>
              </div>

              <ChevronRight
                className="h-4 w-4 text-[#C7D3CF] transition-transform group-hover:translate-x-1 group-hover:text-[#025246]"
                strokeWidth={2}
              />
            </Link>

            <Link
              href="/auth/login"
              className="
                group
                flex
                flex-1
                items-center
                justify-between
                rounded-[20px]
                border
                border-[#E7ECEA]
                bg-white
                px-4
                shadow-[0_4px_18px_rgba(0,0,0,0.025)]
                transition-all
                duration-300
                hover:border-[#025246]/20
                hover:bg-[#FAFDFC]
              "
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F7F4] text-[#025246]">
                  <TrendingUp className="h-4 w-4" />
                </span>

                <div>
                  <p className="font-display text-[12px] font-semibold text-[#1F1F1F]">
                    Permintaan Komoditas
                  </p>

                  <p className="mt-0.5 font-body text-[11px] text-[#75938F]">
                    <span className="font-semibold text-[#025246]">
                      23 ton
                    </span>{" "}
                    · bulan ini
                  </p>
                </div>
              </div>

              <ChevronRight
                className="h-4 w-4 text-[#C7D3CF] transition-transform group-hover:translate-x-1 group-hover:text-[#025246]"
                strokeWidth={2}
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}