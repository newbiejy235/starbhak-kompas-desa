"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const floatingOrbs = [
  { initialX: "10%", initialY: "20%", moveX: [0, 40, -20, 0], moveY: [0, -30, 20, 0], duration: 12 },
  { initialX: "80%", initialY: "30%", moveX: [0, -50, 30, 0], moveY: [0, 40, -10, 0], duration: 15 },
  { initialX: "50%", initialY: "70%", moveX: [0, 30, -40, 0], moveY: [0, -40, 30, 0], duration: 10 },
]

export function DotAnimation() {
  const [heroVisible, setHeroVisible] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)

  useEffect(() => {
    const target = document.getElementById("beranda")
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { rootMargin: "200px" }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleVisibility = () =>
      setTabVisible(document.visibilityState === "visible")
    document.addEventListener("visibilitychange", handleVisibility)
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  // Orbs hanya dirender saat hero terlihat DAN tab sedang aktif
  const isActive = heroVisible && tabVisible

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {isActive &&
        floatingOrbs.map((orb, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full blur-[3px]"
            style={{
              left: orb.initialX,
              top: orb.initialY,
              width: 16,
              height: 16,
              backgroundColor: "#01473B",
              boxShadow: "0 0 24px rgba(1, 71, 59, 0.4)",
              willChange: "transform, opacity",
            }}
            animate={{
              x: orb.moveX,
              y: orb.moveY,
              scale: [1, 1.4, 0.8, 1],
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