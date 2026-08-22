"use client";

import { motion, type Variants } from "framer-motion";

interface AnimatedHeadingProps {
  text?: string;
  className?: string;
}

export default function AnimatedHeading({
  text = "Membuka Akses Hasil Panen ke Pasar yang Lebih Luas",
  className = "",
}: AnimatedHeadingProps) {
  const words = text.split(" ");

  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, 
        delayChildren: 0.6,   
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30, // Turun sedikit lebih jauh
      scale: 0.9, // Ukuran mengecil 10% di awal
      filter: "blur(12px)", // Blur sedikit lebih tebal
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1, // Kembali ke ukuran normal
      filter: "blur(0px)",
      transition: {
        duration: 0.9, // Durasi sedikit dipanjangkan
        ease: [0.16, 1, 0.3, 1], // Custom curve: melesat cepat di awal, melambat sangat halus di akhir (elegan)
      },
    },
  };

  return (
    <motion.h1
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`tracking-tight mb-3 font-bold leading-tight max-w-3xl w-full mx-auto flex flex-wrap justify-center text-center gap-x-[0.28em] gap-y-1 ${className}`}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={wordVariants}
          // origin-bottom memastikan saat efek scale terjadi, kata membesar dari tumpuan bawah (bukan dari tengah) sehingga tidak terlihat mengambang
          className="inline-block origin-bottom"
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}