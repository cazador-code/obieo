'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Metric {
  icon: React.ReactNode
  value: number
  suffix?: string
  prefix?: string
  label: string
  context: string
}

const TrendUpIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TargetIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const defaultMetrics: Metric[] = [
  {
    icon: <TrendUpIcon />,
    value: 4,
    suffix: 'x',
    label: 'Traffic Growth',
    context: '10 → 50 sessions/day',
  },
  {
    icon: <TargetIcon />,
    value: 66,
    suffix: '%',
    label: 'Engagement Rate',
    context: 'vs 39% industry avg',
  },
  {
    icon: <MapPinIcon />,
    value: 1,
    prefix: 'Page ',
    label: 'Austin Rankings',
    context: 'Position 1.7 avg',
  },
  {
    icon: <UsersIcon />,
    value: 889,
    label: 'Website Visitors',
    context: 'in 28 days',
  },
]

interface MetricsGridProps {
  metrics?: Metric[]
}

function MetricCard({ metric, index }: { metric: Metric; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const card = cardRef.current
    if (!card || hasAnimated.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplayValue(metric.value)
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      onEnter: () => {
        if (hasAnimated.current) return
        hasAnimated.current = true

        // Animate card entrance
        gsap.fromTo(
          card,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'power3.out',
          }
        )

        // Animate counter
        const obj = { val: 0 }
        gsap.to(obj, {
          val: metric.value,
          duration: 1.5,
          delay: index * 0.1 + 0.3,
          ease: 'power2.out',
          onUpdate: () => {
            setDisplayValue(Math.round(obj.val))
          },
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [metric.value, index])

  return (
    <div
      ref={cardRef}
      className="group relative p-6 rounded-xl bg-zinc-900/80 border border-zinc-700/50 backdrop-blur-sm transition-all duration-300 hover:border-[var(--accent)]/50 hover:bg-zinc-800/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--accent)]/10"
      style={{ opacity: 0 }}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-4 group-hover:bg-[var(--accent)]/20 transition-colors">
        {metric.icon}
      </div>

      {/* Value */}
      <p className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-display)]">
        {metric.prefix}
        {displayValue.toLocaleString('en-US')}
        {metric.suffix}
      </p>

      {/* Label */}
      <p className="text-lg text-zinc-300 mt-2">{metric.label}</p>

      {/* Context */}
      <p className="text-sm text-zinc-500 mt-1">{metric.context}</p>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}

export function MetricsGrid({ metrics = defaultMetrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} index={index} />
      ))}
    </div>
  )
}
