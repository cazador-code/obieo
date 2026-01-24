'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface TimelineStep {
  week: string
  title: string
  description: string
  highlight?: boolean
}

const defaultSteps: TimelineStep[] = [
  {
    week: 'Week 1',
    title: 'Audit & Strategy',
    description: 'Full site analysis & competitive research',
  },
  {
    week: 'Week 2',
    title: 'Content Launch',
    description: 'Service pages & blog posts live',
  },
  {
    week: 'Week 3',
    title: 'Rankings Climb',
    description: 'Page 1 positions for key terms',
  },
  {
    week: 'Week 4',
    title: '4x Traffic',
    description: '50+ daily sessions achieved',
    highlight: true,
  },
  {
    week: 'Now',
    title: 'Ongoing Growth',
    description: 'Continuous optimization',
  },
]

interface GrowthTimelineProps {
  steps?: TimelineStep[]
}

export function GrowthTimeline({ steps = defaultSteps }: GrowthTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const container = containerRef.current
    const line = lineRef.current
    if (!container || !line) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Set initial states
    gsap.set(line, { scaleX: 0, transformOrigin: 'left center' })
    dotsRef.current.forEach((dot) => {
      if (dot) gsap.set(dot, { scale: 0, opacity: 0 })
    })

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 80%',
      onEnter: () => {
        // Animate the line
        gsap.to(line, {
          scaleX: 1,
          duration: 1.5,
          ease: 'power2.inOut',
        })

        // Animate dots sequentially
        dotsRef.current.forEach((dot, i) => {
          if (dot) {
            gsap.to(dot, {
              scale: 1,
              opacity: 1,
              duration: 0.4,
              delay: 0.3 + i * 0.25,
              ease: 'back.out(1.7)',
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
    <div ref={containerRef} className="relative py-12 px-4 sm:px-8">
      {/* Timeline line - positioned at dot level */}
      <div className="absolute top-12 left-8 right-8 sm:left-12 sm:right-12 h-0.5 bg-zinc-700/50">
        <div ref={lineRef} className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/60" />
      </div>

      {/* Timeline steps */}
      <div className="relative grid grid-cols-5 gap-2 sm:gap-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            {/* Dot */}
            <div
              ref={(el) => { dotsRef.current[index] = el }}
              className={`relative z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 ${
                step.highlight
                  ? 'bg-[var(--accent)] border-[var(--accent)] shadow-lg shadow-[var(--accent)]/50'
                  : 'bg-zinc-900 border-zinc-500'
              }`}
            >
              {step.highlight && (
                <span className="absolute inset-0 rounded-full bg-[var(--accent)] animate-ping opacity-30" />
              )}
            </div>

            {/* Content */}
            <div className="mt-6 space-y-1">
              <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-medium">{step.week}</p>
              <p
                className={`text-xs sm:text-sm font-semibold leading-tight ${
                  step.highlight ? 'text-[var(--accent)]' : 'text-white'
                }`}
              >
                {step.title}
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-500 leading-tight max-w-[100px] sm:max-w-[120px] mx-auto">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
