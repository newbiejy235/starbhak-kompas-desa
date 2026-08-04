"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function PageLoader({ children }) {
  const [isVisible, setIsVisible] = useState(true);
 
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = "auto";
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  const word1 = "Kompas`";
  const word2 = "Desa";

  return (
    <div className="relative w-full">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-[#jj025246] z-[9999] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(215,190,68,0.15) 0%, transparent 70%)",
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />

            <motion.div
              className="absolute w-[300px] h-[300px] rounded-full border border-[#D7BE44]/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              className="absolute w-[180px] h-[180px] rounded-full border border-[#D7BE44]/30"
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -40 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Image className="rounded-full"
                      src="/images/Logo.svg"
                      alt="Logo"
                      width={70}
                      height={70}
                      priority
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="text-4xl md:text-6xl font-bold flex"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
                    },
                  }}
                >
                  <motion.span
                    className="text-white"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4 },
                      },
                    }}
                  >
                    {word1}
                  </motion.span>
                  <motion.span
                    className="text-[#D7BE44]"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4 },
                      },
                    }}
                  >
                    {word2}
                  </motion.span>
                </motion.div>
              </div>

              <motion.div
                className="h-[2px] bg-[#D7BE44] rounded-full"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 160, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              />

              <motion.div
                className="flex gap-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.2, delayChildren: 0.9 },
                  },
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#D7BE44]"
                    variants={{
                      hidden: { opacity: 0.3, scale: 0.8 },
                      visible: {
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.3, 0.8],
                      },
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-0">{children}</div>
    </div>
  );
}