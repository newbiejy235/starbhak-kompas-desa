"use client"

import { motion } from "framer-motion"

export function DotAnimation() {
  const floatingOrbs = [
    { initialX: "10%", initialY: "20%", moveX: [0, 40, -20, 0], moveY: [0, -30, 20, 0], duration: 12 },
    { initialX: "80%", initialY: "30%", moveX: [0, -50, 30, 0], moveY: [0, 40, -10, 0], duration: 15 },
    { initialX: "50%", initialY: "70%", moveX: [0, 30, -40, 0], moveY: [0, -40, 30, 0], duration: 10 },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {floatingOrbs.map((orb, index) => (
        <motion.div
          key={index}
          // Blur dinaikkan sedikit agar menyatu dengan latar dan menurunkan kontras
          className="absolute rounded-full blur-[3px]"
          style={{
            left: orb.initialX,
            top: orb.initialY,
            width: 16,
            height: 16,
            backgroundColor: "#01473B",
            // Bayangan diganti jadi hijau transparan agar serasi
            boxShadow: "0 0 24px rgba(1, 71, 59, 0.4)",
            // Hardware acceleration untuk mencegah lag
            willChange: "transform, opacity",
          }}
          animate={{
            x: orb.moveX,
            y: orb.moveY,
            scale: [1, 1.4, 0.8, 1],
            // Opacity diturunkan drastis (maksimal hanya 0.4) agar sangat samar
            opacity: [0.15, 0.4, 0.2, 0.15],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}