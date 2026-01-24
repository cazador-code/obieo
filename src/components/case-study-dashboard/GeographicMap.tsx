'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface CityPin {
  name: string
  sessions: number
  engagement?: string
  x: number // percentage from left
  y: number // percentage from top
  highlight?: boolean
}

const defaultCities: CityPin[] = [
  { name: 'Austin', sessions: 100, engagement: '65%', x: 35, y: 55, highlight: true },
  { name: 'Houston', sessions: 8, engagement: '100%', x: 52, y: 68 },
  { name: 'Dallas', sessions: 14, engagement: '64%', x: 42, y: 28 },
  { name: 'New Orleans', sessions: 30, engagement: '80%', x: 78, y: 60, highlight: true },
  { name: 'Metairie', sessions: 17, engagement: '82%', x: 76, y: 58 },
]

interface GeographicMapProps {
  cities?: CityPin[]
}

export function GeographicMap({ cities = defaultCities }: GeographicMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pinsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Set initial states
    pinsRef.current.forEach((pin) => {
      if (pin) gsap.set(pin, { scale: 0, opacity: 0 })
    })

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 80%',
      onEnter: () => {
        // Animate pins with stagger
        pinsRef.current.forEach((pin, i) => {
          if (pin) {
            gsap.to(pin, {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              delay: i * 0.15,
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
    <div ref={containerRef} className="relative rounded-xl bg-zinc-900/80 border border-zinc-700/50 p-6 overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent pointer-events-none" />

      {/* Map title */}
      <h3 className="text-lg font-semibold text-white mb-4 relative z-10">Traffic by Market</h3>

      {/* Map container */}
      <div className="relative aspect-[16/10] sm:aspect-[2/1]">
        {/* Simplified Texas + Louisiana shape */}
        <svg
          viewBox="0 0 400 200"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Texas outline (simplified) */}
          <path
            d="M50,20 L180,20 L180,40 L200,40 L200,60 L220,60 L220,100 L200,120 L180,180 L140,180 L100,160 L60,180 L40,160 L20,140 L20,100 L40,80 L50,60 Z"
            fill="none"
            stroke="rgba(251, 146, 60, 0.3)"
            strokeWidth="1.5"
            className="drop-shadow-sm"
          />
          {/* Louisiana outline (simplified) */}
          <path
            d="M280,80 L340,60 L380,60 L380,100 L360,120 L380,140 L360,160 L320,160 L300,140 L280,160 L260,140 L260,100 Z"
            fill="none"
            stroke="rgba(251, 146, 60, 0.3)"
            strokeWidth="1.5"
            className="drop-shadow-sm"
          />
          {/* State labels */}
          <text x="110" y="100" fill="rgba(255,255,255,0.2)" fontSize="16" fontWeight="bold" textAnchor="middle">
            TEXAS
          </text>
          <text x="320" y="110" fill="rgba(255,255,255,0.2)" fontSize="12" fontWeight="bold" textAnchor="middle">
            LA
          </text>
        </svg>

        {/* City pins */}
        {cities.map((city, index) => (
          <div
            key={city.name}
            ref={(el) => { pinsRef.current[index] = el }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${city.x}%`, top: `${city.y}%` }}
          >
            {/* Pin dot */}
            <div
              className={`relative w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                city.highlight
                  ? 'bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/50'
                  : 'bg-zinc-400'
              }`}
            >
              {/* Pulse ring for highlights */}
              {city.highlight && (
                <>
                  <span className="absolute inset-0 rounded-full bg-[var(--accent)] animate-ping opacity-40" />
                  <span
                    className="absolute -inset-2 rounded-full border border-[var(--accent)]/30"
                    style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                  />
                </>
              )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                <p className="text-sm font-semibold text-white">{city.name}</p>
                <p className="text-xs text-zinc-400">{city.sessions} sessions</p>
                {city.engagement && (
                  <p className="text-xs text-[var(--accent)]">{city.engagement} engagement</p>
                )}
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
            </div>

            {/* Always visible label for highlighted cities */}
            {city.highlight && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-center">
                <p className="text-xs font-medium text-white whitespace-nowrap">{city.name}</p>
                <p className="text-xs text-[var(--accent)]">{city.sessions} sessions</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--accent)]" />
          <span>Primary Markets</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-zinc-400" />
          <span>Expanding Markets</span>
        </div>
      </div>
    </div>
  )
}
