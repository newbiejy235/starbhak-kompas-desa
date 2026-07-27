"use client"

import { useState, useEffect } from "react"

const cropsImages = [
  { id: 1, src: "./images/landingpage/Rice.svg", alt: "Gambar Padi" },
  { id: 2, src: "/images/landingpage/ubi.svg", alt: "Gambar Ubi" },
  { id: 3, src: "/images/landingpage/corn.svg", alt: "Gambar Jagung" },
]

export default function AnimatedCrops() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % cropsImages.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center">
      {cropsImages.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out
            ${
              index === currentIndex
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-95 z-0"     
            }
          `}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="object-contain max-w-full max-h-full drop-shadow-2xl"
          />
        </div>
      ))}
    </div>
  )
}