"use client"

import { useEffect, useState } from "react"

const orbs = [
  { left: "10%", top: "20%", size: 16, anim: "float1" },
  { left: "80%", top: "30%", size: 16, anim: "float2" },
  { left: "50%", top: "70%", size: 16, anim: "float3" },
]

export function DotAnimation() {
  const [heroVisible, setHeroVisible] = useState(true)

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

  if (!heroVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${orb.anim}`}
          style={{
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            backgroundColor: "#01473B",
            filter: "blur(7px)",
            opacity: 0.25,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  )
}