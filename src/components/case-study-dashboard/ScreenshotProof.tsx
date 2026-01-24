'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScreenshotProofProps {
  caption?: string
}

export function ScreenshotProof({
  caption = 'Real data from Google Search Console — January 2026',
}: ScreenshotProofProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<SVGPathElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const chart = chartRef.current
    const stats = statsRef.current
    if (!container || !chart) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Animate chart line drawing
    const length = chart.getTotalLength()
    gsap.set(chart, { strokeDasharray: length, strokeDashoffset: length })

    if (stats) {
      gsap.set(stats, { opacity: 0, y: 10 })
    }

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 75%',
      onEnter: () => {
        gsap.to(chart, {
          strokeDashoffset: 0,
          duration: 1.5,
          delay: 0.3,
          ease: 'power2.inOut',
        })
        if (stats) {
          gsap.to(stats, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.8,
            ease: 'power2.out',
          })
        }
      },
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <div ref={containerRef} className="relative rounded-xl bg-zinc-900/80 border border-zinc-700/50 p-5 sm:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-zinc-500 font-mono">Google Search Console</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top stats row */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Impressions</p>
            <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">34,700</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Avg Position</p>
            <p className="text-3xl sm:text-4xl font-bold text-[var(--accent)] tracking-tight">8.5</p>
          </div>
        </div>

        {/* Chart area */}
        <div className="relative flex-1 min-h-[120px] mb-6">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="gscChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(251, 146, 60)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="rgb(251, 146, 60)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d="M0,85 C40,82 80,75 120,65 C160,55 200,45 240,38 C280,31 320,28 360,25 C380,23 400,22 400,22 L400,100 L0,100 Z"
              fill="url(#gscChartGradient)"
            />
            {/* Animated line */}
            <path
              ref={chartRef}
              d="M0,85 C40,82 80,75 120,65 C160,55 200,45 240,38 C280,31 320,28 360,25 C380,23 400,22 400,22"
              fill="none"
              stroke="rgb(251, 146, 60)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Bottom stats row */}
        <div ref={statsRef} className="flex justify-between items-end pt-4 border-t border-zinc-800">
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Clicks</p>
            <p className="text-xl font-bold text-white">121</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">CTR</p>
            <p className="text-xl font-bold text-[var(--accent)]">0.35%</p>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-[11px] text-zinc-600 mt-4 text-center">{caption}</p>
    </div>
  )
}
