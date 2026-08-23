"use client";

import { motion, Variants } from "framer-motion";
import { UserPlus, Sprout, Handshake, Truck, ArrowRight } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Daftar & Lengkapi Profil",
    description:
      "Buat akun sebagai petani atau pembeli. Lengkapi data diri, lokasi, dan komoditas unggulan Anda.",
    icon: UserPlus,
  },
  {
    id: "02",
    title: "Unggah Hasil Panen",
    description:
      "Katalogkan hasil pertanian dengan detail, foto, jumlah ketersediaan, dan harga yang transparan.",
    icon: Sprout,
  },
  {
    id: "03",
    title: "Terhubung & Transaksi",
    description:
      "Sistem kami mencocokkan petani dengan pembeli yang tepat. Lakukan negosiasi dan transaksi yang aman.",
    icon: Handshake,
  },
  {
    id: "04",
    title: "Pengiriman Terpadu",
    description:
      "Pantau proses logistik secara real-time hingga hasil tani sampai ke tangan pembeli dengan kualitas terjaga.",
    icon: Truck,
  },


];

// [PENYESUAIAN ANIMASI CONTAINER]
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.4,
      delayChildren: 0.1, // Memberi jeda sedikit sebelum kartu pertama muncul
    },
  },
};

// [PENYESUAIAN ANIMASI CARD]
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 }, // Mulai dari posisi lebih bawah (50px)
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7, // Durasi animasi setiap kartu sedikit diperlama agar lebih elegan
      ease: [0.25, 0.1, 0.25, 1], // Custom easing curve untuk pergerakan lebih natural
    },
  },
};

export function AlurWebsite() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28 text-[#18211F] overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
        {/* ================= HEADER ================= */}
        {/* Tambahan animasi simpel untuk header agar tidak kaku */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16 flex flex-col items-center text-center lg:mb-20"
        >
          <h2 className="max-w-3xl text-[30px] font-bold leading-tight tracking-tight text-[#1f1f1f] text-center sm:text-[34px] md:text-[38px]">
            Cara Kerja <span className="text-[#025246]"> yang Sederhana</span><br className="hidden sm:block" />

          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#52605C]">
            Beberapa langkah sederhana untuk menghubungkan hasil bumi desa dengan pasar yang lebih luas.
          </p>
        </motion.div>

        {/* ================= STEPS GRID ================= */}
        {/* container motion.div akan mengatur kapan anak-anaknya (card) akan dirender secara bergilir */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }} // margin negatif agar animasi tidak mulai saat ujung div baru terlihat sedikit
          className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8"
        >
          {/* Garis Penghubung (Hanya muncul di Desktop) */}
          <div className="absolute top-[3rem] left-[10%] hidden h-[2px] w-[80%] border-t-2 border-dashed border-[#DDE5E1] lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                variants={cardVariants}
                className="group relative flex flex-col rounded-[2rem] border border-[#DDE5E1] bg-[#F7F9F8] p-8 transition-all duration-300 hover:border-[#025246] hover:bg-white hover:shadow-xl hover:shadow-[#025246]/5"
              >
                {/* Step Number Content */}
                <div className="mb-8 flex items-center justify-between relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#025246] shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#025246] group-hover:text-white">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <span className="text-4xl font-black tracking-tighter text-[#DDE8E4] transition-colors duration-300 group-hover:text-[#025246]/10">
                    {step.id}
                  </span>
                </div>

                {/* Text Content */}
                <div>
                  <h3 className="mb-3 text-lg font-bold text-[#1f1f1f]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-[1.8] text-[#52605C]">
                    {step.description}
                  </p>
                </div>

                {/* Panah Indikator (Hanya Mobile & Tablet) */}
                {index !== steps.length - 1 && (
                  <div className="absolute -bottom-5 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-[#DDE5E1] bg-white text-[#025246] lg:hidden">
                    <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}