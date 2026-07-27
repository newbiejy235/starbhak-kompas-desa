"use client"

import { useState, useEffect } from "react"
import Image from 'next/image' 


const cropList = [
  { id: 1, src: "/images/landingpage/Rice.svg", alt: "Padi", width: 500, height: 600 },
  { id: 2, src: "/images/landingpage/Ubi.svg", alt: "Ubi", width: 550, height: 450 },
  { id: 3, src: "/images/landingpage/Corn.svg", alt: "Jagung", width: 600, height: 500 },
]

export default function AnimatedCrops() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % cropList.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[450px] md:h-[550px] lg:h-[650px] flex items-center justify-center overflow-visible">

      <div className="absolute inset-0 bg-[#D7BE44]/10 rounded-full blur-[120px] scale-75 z-0" />

      {cropList.map((crop, i) => {
        const isActive = i === index
        
        return (
          <div
            key={crop.id}
            className={`absolute flex items-center justify-center w-full h-full will-change-transform transition-all
              /* --- KONFIGURASI TIMING ANIMASI (Durasinya 1.8 detik biar smooth parah) --- */
              duration-[1800ms] ease-[cubic-bezier(0.22, 1, 0.36, 1)]
              
              /* --- LOGIKA STATUS ANIMASI --- */
              ${
                isActive
                  ? "opacity-100 scale-100 rotate-0 blur-0 translate-y-0 z-20" 
                  : "opacity-0 scale-125 rotate-[5deg] translate-y-[-15%] blur-2xl z-10" 
              }
            `}
          >
            <div className="relative drop-shadow-[0_25px_25px_rgba(0,0,0,0.3)]">
              <Image
                src={crop.src}
                alt={crop.alt}
                width={crop.width}
                height={crop.height}

                className="object-contain max-w-[80vw] max-h-[400px] md:max-h-[500px] lg:max-h-[600px] pointer-events-none"
                priority={isActive} 
              />
            </div>
          </div>
        )
      })}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#025246] to-transparent z-30 pointer-events-none" />
    </div>
  )
}