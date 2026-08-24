"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      setIsVisible(currentScroll > 280);
      if (totalHeight > 0) {
        const percentage = Math.min(Math.max((currentScroll / totalHeight) * 100, 0), 100);
        setProgress(percentage);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Lingkaran keliling r=16 -> 2 * PI * 16 ≈ 100.5
  const strokeDashoffset = 100.5 - (100.5 * progress) / 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 16 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-24 right-5 sm:right-6 z-50 group"
        >

          <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900/90 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-xl transition-all duration-300 group-hover:opacity-100 group-hover:-top-11 border border-white/10">
            Kembali ke Atas
          </span>

          <button
            onClick={scrollToTop}
            aria-label="Kembali ke Atas"
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/95 backdrop-blur-md text-[#025246] shadow-lg hover:shadow-2xl hover:shadow-[#025246]/15 hover:bg-white active:scale-90 transition-all duration-300 border border-black/5 cursor-pointer"
          >
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 h-full w-full -rotate-90 p-[3px]" viewBox="0 0 40 40">
              {/* Ring Track (Latar Belakang Segar & Clean) */}
              <circle
                cx="20"
                cy="20"
                r="16"
                className="stroke-[#025246]/10"
                strokeWidth="2.5"
                fill="none"
              />
              {/* Ring Progress Line (Warna Utama Solid & Smooth Transition) */}
              <circle
                cx="20"
                cy="20"
                r="16"
                className="stroke-[#025246]/20 transition-all duration-300 ease-out"
                strokeWidth="2.5"
                strokeDasharray="100.5"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Icon Panah dengan Spring Motion saat Hover */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="z-10"
            >
              <ArrowUp className="h-5 w-5 stroke-[2.2]" />
            </motion.div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}