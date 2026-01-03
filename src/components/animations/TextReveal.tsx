'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface TextRevealProps {
  children: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  delay?: number
  stagger?: number
  triggerOnScroll?: boolean
}

export function TextReveal({
  children,
  className = '',
  as: Component = 'span',
  delay = 0,
  stagger = 0.02,
  triggerOnScroll = false,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Split text into characters
    const text = children
    const chars = text.split('')

    // Clear container and add character spans
    container.innerHTML = ''
    chars.forEach((char) => {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? '\u00A0' : char
      span.style.display = 'inline-block'
      span.style.opacity = '0'
      span.style.transform = 'translateY(20px)'
      container.appendChild(span)
    })

    const charElements = container.querySelectorAll('span')

    const animationConfig = {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger,
      delay,
      ease: 'power3.out',
    }

    if (triggerOnScroll) {
      gsap.to(charElements, {
        ...animationConfig,
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    } else {
      gsap.to(charElements, animationConfig)
    }

    return () => {
      gsap.killTweensOf(charElements)
    }
  }, [children, delay, stagger, triggerOnScroll])

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Component ref={containerRef as any} className={className}>
      {children}
    </Component>
  )
}
