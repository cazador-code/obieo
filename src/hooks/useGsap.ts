'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function useScrollTrigger() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    // Refresh ScrollTrigger when layout changes
    ScrollTrigger.refresh()

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return ref
}

export function useFadeInOnScroll(options?: {
  y?: number
  duration?: number
  delay?: number
  stagger?: number
}) {
  const ref = useRef<HTMLElement>(null)
  const { y = 30, duration = 0.8, delay = 0, stagger = 0.1 } = options || {}

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const children = element.children.length > 0 ? element.children : [element]

    gsap.set(children, { y, opacity: 0 })

    const animation = gsap.to(children, {
      y: 0,
      opacity: 1,
      duration,
      delay,
      stagger,
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
  }, [y, duration, delay, stagger])

  return ref
}

export function useCountUp(endValue: number, options?: {
  duration?: number
  prefix?: string
  suffix?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const { duration = 2, prefix = '', suffix = '' } = options || {}

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      element.textContent = `${prefix}${endValue}${suffix}`
      return
    }

    const obj = { value: 0 }

    const animation = gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        element.textContent = `${prefix}${Math.round(obj.value)}${suffix}`
      },
    })

    return () => {
      animation.kill()
    }
  }, [endValue, duration, prefix, suffix])

  return ref
}
