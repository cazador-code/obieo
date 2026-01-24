'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Callout {
  text: string
  x: number // percentage from left
  y: number // percentage from top
  direction?: 'left' | 'right'
}

interface ScreenshotProofProps {
  imageSrc: string
  imageAlt: string
  callouts?: Callout[]
  caption?: string
}

const defaultCallouts: Callout[] = [
  {
    text: '17,673 impressions from ONE page',
    x: 45,
    y: 30,
    direction: 'right',
  },
  {
    text: 'Page 1 position for "roofing contractor austin"',
    x: 60,
    y: 55,
    direction: 'left',
  },
]

export function ScreenshotProof({
  imageSrc = '/case-studies/lapeyre-roofing/gsc-screenshot.png',
  imageAlt = 'Google Search Console performance data',
  callouts = defaultCallouts,
  caption = 'Real data from Google Search Console — January 2026',
}: ScreenshotProofProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const calloutsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Set initial states
    calloutsRef.current.forEach((callout) => {
      if (callout) gsap.set(callout, { opacity: 0, x: 20 })
    })

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 75%',
      onEnter: () => {
        // Animate callouts
        calloutsRef.current.forEach((callout, i) => {
          if (callout) {
            gsap.to(callout, {
              opacity: 1,
              x: 0,
              duration: 0.6,
              delay: 0.5 + i * 0.2,
              ease: 'power2.out',
            })
          }
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <div ref={containerRef} className="relative rounded-xl bg-zinc-900/80 border border-zinc-700/50 p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-zinc-500 font-mono">search.google.com/search-console</span>
      </div>

      {/* Screenshot container */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/50">
        {/* Placeholder gradient if no image */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900">
          {/* Simulated chart lines for placeholder */}
          <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(251, 146, 60)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(251, 146, 60)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area chart shape */}
            <path
              d="M0,80 Q50,75 100,60 T200,50 T300,30 T400,25 L400,100 L0,100 Z"
              fill="url(#chartGradient)"
              transform="scale(1, 1)"
            />
            <path
              d="M0,80 Q50,75 100,60 T200,50 T300,30 T400,25"
              fill="none"
              stroke="rgb(251, 146, 60)"
              strokeWidth="2"
            />
          </svg>

          {/* Simulated data points */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500">Total Impressions</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">34,700</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Avg. Position</p>
                <p className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">8.5</p>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-zinc-500">Total Clicks</p>
                <p className="text-xl font-semibold text-white">121</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">CTR</p>
                <p className="text-xl font-semibold text-[var(--accent)]">0.35%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Real image if provided */}
        {imageSrc && imageSrc !== '/case-studies/lapeyre-roofing/gsc-screenshot.png' && (
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
        )}

        {/* Callout annotations */}
        {callouts.map((callout, index) => (
          <div
            key={index}
            ref={(el) => { calloutsRef.current[index] = el }}
            className="absolute z-10"
            style={{ left: `${callout.x}%`, top: `${callout.y}%` }}
          >
            <div
              className={`flex items-center gap-2 ${
                callout.direction === 'left' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Connector line */}
              <div
                className={`w-8 h-0.5 bg-[var(--accent)] ${
                  callout.direction === 'left' ? 'origin-right' : 'origin-left'
                }`}
              />
              {/* Callout box */}
              <div className="bg-[var(--accent)] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                {callout.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Caption */}
      <p className="text-xs text-zinc-500 mt-4 text-center">{caption}</p>
    </div>
  )
}
