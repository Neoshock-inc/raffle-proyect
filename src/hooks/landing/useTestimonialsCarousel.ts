'use client'
import { useEffect, useState } from 'react'

export const useTestimonialsCarousel = (length: number, intervalMs = 6000) => {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const i = setInterval(() => {
      setCurrent((prev) => (prev + 1) % length)
    }, intervalMs)
    return () => clearInterval(i)
  }, [length, intervalMs])
  return { current, setCurrent }
}
