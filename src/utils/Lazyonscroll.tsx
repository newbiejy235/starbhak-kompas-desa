'use client'

import React, { useState, useEffect, useRef } from 'react'

interface LazyOnScrollProps {
  children: React.ReactNode
  minHeight?: string 
}

export default function LazyOnScroll({ children, minHeight = '200px' }: LazyOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // Hentikan observer setelah komponen terlihat
        }
      },
      {
        rootMargin: '200px', // Komponen mulai dimuat 200px sebelum muncul di layar
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ minHeight: !isVisible ? minHeight : undefined }}>
      {isVisible ? children : null}
    </div>
  )
}