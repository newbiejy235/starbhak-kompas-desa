"use client"

import { useEffect, useState, useRef } from "react"

interface CounterProps {
  end: number
  duration?: number
  suffix?: string
}

export default function Counter({ end, duration, suffix = "" }: CounterProps) {
  const [count, setCount] = useState<number>(0)
  const [hasAnimated, setHasAnimated] = useState<boolean>(false)
  const elementRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.1 }
    )

    const currentElement = elementRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return

    // Hormati prefers-reduced-motion: langsung tampilkan nilai akhir (PRD 9.1)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setCount(end))
      return () => cancelAnimationFrame(id)
    }

    let startTime: number | null = null

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      if (!duration) duration = 2000
      const progress = Math.min((currentTime - startTime) / duration, 1)

      const easeProgress = 1 - Math.pow(1 - progress, 3)

      setCount(Math.floor(easeProgress * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [hasAnimated, end, duration])

  return (
    <span ref={elementRef}>
      {/* Menggunakan "en-US" untuk pemisah koma (1,000) */}
      {count.toLocaleString("en-US")}
      {suffix}
    </span>
  )
}