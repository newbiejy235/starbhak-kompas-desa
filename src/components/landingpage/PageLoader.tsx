"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  children: React.ReactNode;
};

export default function PageLoader({ children }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = "auto";
    }, 1600);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="relative w-full">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#025246]"
            initial={{
              borderBottomLeftRadius: "0%",
              borderBottomRightRadius: "0%",
              y: "0%",
            }}
            exit={{
              borderBottomLeftRadius: "50%",
              borderBottomRightRadius: "50%",
              y: "-100%",
            }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              className="text-4xl md:text-6xl font-bold flex"
              initial={{ opacity: 0, filter: "blur(12px)", scale: 1.05 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
          <span className="text-white [text-shadow:0_0_10px_rgba(255,255,255,0.6),0_0_20px_rgba(255,255,255,0.3)]">
            Kompas
          </span>
          <span className="text-[#D7BE44] [text-shadow:0_0_10px_rgba(215,190,68,0.8),0_0_20px_rgba(215,190,68,0.4)]">
            Desa
          </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-0">{children}</div>
    </div>
  );
} 