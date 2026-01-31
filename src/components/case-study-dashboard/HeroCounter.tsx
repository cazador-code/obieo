'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface HeroCounterProps {
  value: number
  label: string
  tagline?: string
  duration?: number
}

// Mini sparkline data representing growth
const sparklineData = [12, 18, 15, 25, 32, 28, 45, 52, 48, 65, 78, 85, 92, 100]

export function HeroCounter({
  value,
  label,
  tagline = 'From invisible to impossible to ignore',
  duration = 2.5,
}: HeroCounterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const numberRef = useRef<HTMLSpanElement>(null)
  const sparklineRef = useRef<SVGSVGElement>(null)
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || hasAnimated.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      requestAnimationFrame(() => setDisplayValue(value))
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 80%',
      onEnter: () => {
        if (hasAnimated.current) return
        hasAnimated.current = true

        // Animate the number
        const obj = { val: 0 }
        gsap.to(obj, {
          val: value,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            setDisplayValue(Math.round(obj.val))
          },
        })

        // Animate the sparkline bars
        if (sparklineRef.current) {
          const bars = sparklineRef.current.querySelectorAll('rect')
          gsap.fromTo(
            bars,
            { scaleY: 0, transformOrigin: 'bottom' },
            {
              scaleY: 1,
              duration: 0.8,
              stagger: 0.05,
              ease: 'power2.out',
              delay: 0.3,
            }
          )
        }

        // Glow pulse animation
        gsap.to(numberRef.current, {
          textShadow: '0 0 60px rgba(251, 146, 60, 0.5), 0 0 120px rgba(251, 146, 60, 0.3)',
          duration: 1.5,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: 1,
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [value, duration])

  const formattedValue = displayValue.toLocaleString('en-US')

  return (
    <div
      ref={containerRef}
      className="relative py-16 px-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700/50 overflow-hidden"
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Glow effect behind number */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[100px]" />

      <div className="relative z-10 text-center">
        {/* Main number */}
        <span
          ref={numberRef}
          className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white font-[family-name:var(--font-display)] tracking-tight"
          style={{
            textShadow: '0 0 40px rgba(251, 146, 60, 0.3)',
          }}
        >
          {formattedValue}
        </span>

        {/* Label */}
        <p className="text-xl sm:text-2xl text-zinc-400 mt-4 tracking-wide">{label}</p>

        {/* Sparkline */}
        <div className="flex justify-center mt-8">
          <svg
            ref={sparklineRef}
            width="280"
            height="40"
            viewBox="0 0 280 40"
            className="overflow-visible"
          >
            {sparklineData.map((val, i) => {
              const barHeight = (val / 100) * 36
              const x = i * 20
              return (
                <rect
                  key={i}
                  x={x}
                  y={40 - barHeight}
                  width="14"
                  height={barHeight}
                  rx="2"
                  className="fill-[var(--accent)]/60"
                  style={{ transformOrigin: `${x + 7}px 40px` }}
                />
              )
            })}
          </svg>
        </div>

        {/* Tagline */}
        <p className="text-lg text-zinc-500 mt-6 italic">&ldquo;{tagline}&rdquo;</p>
      </div>
    </div>
  )
}
