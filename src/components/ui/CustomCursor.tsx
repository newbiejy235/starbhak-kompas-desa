"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const emptySubscribe = () => () => {};

export function CustomCursor() {
  // Hydration-safe mount check tanpa setState di effect
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Mengatur koordinat posisi mouse
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Konfigurasi spring agar lingkaran luar mengejar kursor dengan mulus
  const springConfig = { damping: 30, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorX, cursorY]);

  // Mencegah hydration error di Next.js
  if (!isMounted) return null;

  return (
    // Hanya aktif di layar desktop (lg ke atas) agar aman di mobile/touch screen
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden lg:block">
      {/* Hanya menyisakan lingkaran luar dengan border hijau transparan */}
      <motion.div
        className="absolute h-7 w-7 rounded-full border border-[#025246]/40 bg-[#025246]/5"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </div>
  );
}