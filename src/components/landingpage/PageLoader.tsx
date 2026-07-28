"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function PageLoader({ children }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = "auto";
    }, 2200);

    document.body.style.overflow = "hidden";
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-[#025246] z-[9999]"
            initial={{ opacity: 1 }}
            exit={{ y: "-100%", borderBottomLeftRadius: "60%", borderBottomRightRadius: "60%" }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <div className="flex flex-col items-center gap-5">

              <motion.div
                initial={{ scale: 0.6, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Image
                  src={"/images/logo.png"}
                  alt="Logo"
                  width={80}
                  height={80}
                />
              </motion.div>

              <motion.div
                className="text-4xl md:text-6xl font-bold flex"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                {"Kompas`Desa".split("").map((char, i) => {
                  const isDesa = i >= 7;
                  return (
                    <motion.span
                      key={i}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.35 }}
                      style={{
                        color: isDesa ? "#D7BE44" : "#ffffff",
                      }}
                      className={
                        !isDesa
                          ? "drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                          : "drop-shadow-[0_0_6px_rgba(215,190,68,0.8)]"
                      }
                    >
                      {char}
                    </motion.span>
                  );
                })}
              </motion.div>

              <motion.div
                className="h-[2px] bg-[#D7BE44] rounded-full"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 100, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              />

              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.15, 0],
                }}
                transition={{ duration: 1.2 }}
                style={{
                  background:
                    "radial-gradient(circle at center, #D7BE44 0%, transparent 70%)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-0">{children}</div>
    </div>
  );
}