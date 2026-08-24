"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  children: React.ReactNode;
};

const LOADER_DURATION_SEC = 2;
const LOADER_DURATION_MS = LOADER_DURATION_SEC * 1000;

export default function PageLoader({ children }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setIsVisible(false));
      return () => cancelAnimationFrame(id);
    }

    document.body.style.overflow = "hidden";


    const timer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = "auto";
    }, LOADER_DURATION_MS);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f4f6f6]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            {/* Brand */}
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -5 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="flex text-4xl md:text-6xl font-bold tracking-tight text-black">
                <span>KompasDesa</span>
              </div>

              {/* Progress Bar Container */}
              <div className="relative mt-5 h-[3px] w-28 overflow-hidden rounded-full bg-[#025246]/10">
                {/* 3. Progress Bar Fill */}
                <motion.div
                  className="absolute left-0 top-0 h-full bg-[#025246]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: LOADER_DURATION_SEC, // Durasi disamakan di sini
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Website Content */}
      <motion.div
        className="relative z-0"
        initial={{ opacity: 0, scale: 1.015, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}