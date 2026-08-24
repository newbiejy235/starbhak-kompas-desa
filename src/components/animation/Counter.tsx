"use client"

import { useEffect, useState, useRef } from "react"

interface CounterProps {
  end: number
  duration: number
  delay?: number
  suffix?: string
}

export default function Counter({
  end,
  duration,
  delay = 0,
  suffix = "",
}: CounterProps) {
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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setCount(end))
      return () => cancelAnimationFrame(id)
    }

    let animationFrame: number
    let startTime: number | null = null

    const delayTimeout = window.setTimeout(() => {
      const animate = (currentTime: number) => {
        if (startTime === null) {
          startTime = currentTime
        }

        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Exponential Easing: Awal meluncur sangat kencang, akhir mengerem perlahan (slow-mo)
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

        // Math.round bikin perpindahan angka dari frame ke frame terasa rapat dan tak patah
        setCount(Math.round(easeProgress * end))

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          setCount(end)
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }, delay)

    return () => {
      window.clearTimeout(delayTimeout)

      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [hasAnimated, end, duration, delay])

  return (
    <span ref={elementRef}>
      {count.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}