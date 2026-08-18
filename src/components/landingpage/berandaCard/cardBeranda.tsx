"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Counter from "@/components/animation/Counter";

export default function BentoGridStats() {
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.12,
        delayChildren: 0.2,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 28, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-12 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 text-left font-sans"
    >
      {/* 1. Banner Kementan (2 Cols) */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="md:col-span-2 relative h-[210px] overflow-hidden rounded-[2.5rem] bg-[#E4F1EB] group border border-emerald-950/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(2,82,70,0.12)] transition-shadow duration-500 cursor-pointer"
      >
        <Image
          src="/images/landingpage/beranda/kementan.png"
          alt="Terverifikasi Kementan"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          width={1000}
          height={1000}
        />
        {/* Subtle Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-75 group-hover:opacity-85 transition-opacity duration-500" />

        {/* Top Floating Tag */}
        <div className="absolute top-5 right-5">
          <span className="backdrop-blur-md bg-white/20 border border-white/30 text-white px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase shadow-sm">
            Kemitraan Resmi
          </span>
        </div>

        {/* Bottom Status Pill */}
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
          <span className="inline-flex items-center gap-2.5 backdrop-blur-xl bg-black/30 border border-white/20 text-white px-4 py-2 rounded-full text-xs font-medium shadow-2xl group-hover:bg-black/40 group-hover:border-white/40 transition-all duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Terverifikasi Kementan RI
          </span>

          <span className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
            <a href="https://www.pertanian.go.id/">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          </span>
        </div>
      </motion.div>

      {/* 2. Stat: Petani Terdaftar */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-[210px] rounded-[2.5rem] bg-white border border-emerald-950/5 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-emerald-600/20 transition-all duration-500 group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F7F4] text-[#025246] group-hover:bg-[#025246] group-hover:text-white group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase">
            Aktif
          </span>
        </div>

        <div>
          <p className="text-4xl sm:text-5xl font-black text-[#111827] tracking-tight group-hover:translate-x-1 transition-transform duration-300 flex">
            <Counter end={200} duration={6300} suffix="" />
            <p className="text-emerald-800">+</p>
          </p>
          <p className="text-sm font-medium text-gray-500 mt-1">Petani Lokal Terdaftar</p>
        </div>
      </motion.div>

      {/* 3. Stat: Ton Hasil Panen */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-[210px] rounded-[2.5rem] bg-gradient-to-br from-[#025246] via-[#02443a] to-[#012d26] p-6 flex flex-col justify-between shadow-[0_12px_35px_rgba(2,82,70,0.25)] hover:shadow-[0_22px_45px_rgba(2,82,70,0.4)] transition-all duration-500 group relative overflow-hidden cursor-pointer"
      >
        {/* Animated Background Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl group-hover:scale-150 group-hover:bg-emerald-400/30 transition-all duration-700" />

        <div className="flex items-center justify-between relative z-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/15 group-hover:bg-white group-hover:text-[#025246] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </span>
          <span className="text-xs text-emerald-200/80 font-medium tracking-wide">
            40+ Komoditas
          </span>
        </div>

        <div className="relative z-10">
          <p className="text-4xl sm:text-5xl font-black text-white tracking-tight group-hover:translate-x-1 transition-transform duration-300 flex">
            <Counter end={1200} duration={7000} suffix="" />
            <p className="text-emerald-300">+</p>
          </p>
          <p className="text-sm font-medium text-emerald-100/70 mt-1">Ton Hasil Panen Terjual</p>
        </div>
      </motion.div>

      {/* 4. Foto Petani */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-[210px] overflow-hidden rounded-[2.5rem] bg-[#E4F1EB] group border border-emerald-950/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-shadow duration-500 relative cursor-pointer"
      >
        <Image
          src="/images/landingpage/beranda/petani.png"
          alt="Aktivitas Petani"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          width={1000}
          height={1000}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-4 left-5 right-5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <p className="text-xs font-semibold text-white tracking-wide">Daya Jangkau Komunitas</p>
        </div>
      </motion.div>

      {/* 5. Kolom Kartu Ringkasan Aktivitas */}
      {/* 5. Kolom Kartu Ringkasan Aktivitas */}
      <motion.div variants={cardVariants} className="h-[210px] flex flex-col gap-3.5">

        {/* Sub-card 1: Pesanan Pelanggan */}
        <Link href="/auth/login" className="flex-1 flex">
          <motion.div
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
            className="w-full rounded-[1.75rem] bg-white border border-emerald-950/5 p-4 flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_25px_rgba(2,82,70,0.08)] hover:border-emerald-600/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F0F7F4] text-[#025246] group-hover:bg-[#025246] group-hover:text-white transition-colors duration-300 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </span>

              <div>
                <p className="text-[15px] font-bold text-[#111827] group-hover:text-[#025246] transition-colors duration-200">
                  Pesanan Pelanggan
                </p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  <span className="text-emerald-600 font-semibold">21 pesanan</span> · bulan ini
                </p>
              </div>
            </div>

            <span className="text-gray-300 group-hover:text-[#025246] group-hover:translate-x-1 transition-all duration-300 pr-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </span>
          </motion.div>
        </Link>

        {/* Sub-card 2: Permintaan Komoditas */}
        <Link href="/auth/login" className="flex-1 flex">
          <motion.div
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
            className="w-full rounded-[1.75rem] bg-gradient-to-r from-[#F8FAFB] to-white border border-emerald-950/5 p-4 flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_25px_rgba(2,82,70,0.08)] hover:border-emerald-600/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-emerald-950/5 text-[#025246] shadow-sm group-hover:bg-[#025246] group-hover:text-white transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </span>
              <div>
                <p className="text-[15px] font-bold text-[#111827] group-hover:text-[#025246] transition-colors duration-200">
                  Permintaan Komoditas
                </p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  <span className="text-emerald-600 font-semibold">23 ton</span> · bulan ini
                </p>
              </div>
            </div>

            <span className="text-gray-300 group-hover:text-[#025246] group-hover:translate-x-1 transition-all duration-300 pr-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </span>
          </motion.div>
        </Link>

      </motion.div>
    </motion.div>
  );
}