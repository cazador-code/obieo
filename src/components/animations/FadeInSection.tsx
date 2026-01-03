'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface FadeInSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  duration?: number
  staggerChildren?: number
}

export function FadeInSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 40,
  duration = 0.8,
  staggerChildren = 0,
}: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const getOffset = () => {
      switch (direction) {
        case 'up':
          return { x: 0, y: distance }
        case 'down':
          return { x: 0, y: -distance }
        case 'left':
          return { x: distance, y: 0 }
        case 'right':
          return { x: -distance, y: 0 }
        case 'none':
          return { x: 0, y: 0 }
      }
    }

    const { x, y } = getOffset()
    const targets = staggerChildren > 0 ? element.children : element

    gsap.set(targets, { opacity: 0, x, y })

    const animation = gsap.to(targets, {
      opacity: 1,
      x: 0,
      y: 0,
      duration,
      delay,
      stagger: staggerChildren,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    return () => {
      animation.kill()
    }
  }, [delay, direction, distance, duration, staggerChildren])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
