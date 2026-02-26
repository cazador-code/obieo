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
  lng: number
  lat: number
  highlight?: boolean
}

const defaultCities: CityPin[] = [
  { name: 'Austin', sessions: 100, engagement: '65%', lng: -97.7431, lat: 30.2672, highlight: true },
  { name: 'New Orleans', sessions: 30, engagement: '80%', lng: -90.0715, lat: 29.9511, highlight: true },
]

const MAP_BOUNDS = {
  west: -106,
  east: -84,
  north: 36,
  south: 26,
}

function coordsToPercent(lng: number, lat: number): { x: number; y: number } {
  const x = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100
  const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100
  return { x, y }
}

interface GeographicMapProps {
  cities?: CityPin[]
  mapboxToken?: string
}

export function GeographicMap({
  cities = defaultCities,
  mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
}: GeographicMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pinsRef = useRef<(HTMLDivElement | null)[]>([])
  const glowsRef = useRef<(HTMLDivElement | null)[]>([])
  const connectionsRef = useRef<SVGSVGElement>(null)

  const mapUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-95,30.5,4.8,0/800x500@2x?access_token=${mapboxToken}`
    : null

  // Get highlighted cities for connection line
  const highlightedCities = cities.filter(c => c.highlight)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Set initial states
    pinsRef.current.forEach((pin) => {
      if (pin) gsap.set(pin, { scale: 0, opacity: 0 })
    })
    glowsRef.current.forEach((glow) => {
      if (glow) gsap.set(glow, { scale: 0, opacity: 0 })
    })

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 80%',
      onEnter: () => {
        // Animate glows first
        glowsRef.current.forEach((glow, i) => {
          if (glow) {
            gsap.to(glow, {
              scale: 1,
              opacity: 1,
              duration: 0.8,
              delay: 0.2 + i * 0.1,
              ease: 'power2.out',
            })
          }
        })

        // Then pins
        pinsRef.current.forEach((pin, i) => {
          if (pin) {
            gsap.to(pin, {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              delay: 0.4 + i * 0.12,
              ease: 'back.out(1.7)',
            })
          }
        })

        // Animate connection line
        if (connectionsRef.current) {
          const path = connectionsRef.current.querySelector('path')
          if (path) {
            const length = path.getTotalLength()
            gsap.fromTo(path,
              { strokeDasharray: length, strokeDashoffset: length },
              { strokeDashoffset: 0, duration: 1.5, delay: 0.6, ease: 'power2.inOut' }
            )
          }
        }
      },
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <div ref={containerRef} className="relative rounded-xl bg-zinc-900/80 border border-zinc-700/50 p-6 h-full flex flex-col overflow-hidden">
      {/* Ambient glow in corner */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-[var(--accent)]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Map title with live indicator */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-white">Traffic by Market</h3>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wide">Live</span>
        </span>
      </div>

      {/* Map container */}
      <div className="relative flex-1 min-h-[280px] rounded-lg overflow-hidden">
        {/* Mapbox static image background */}
        {mapUrl ? (
          // Mapbox static images are external and intentionally rendered via img.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mapUrl}
            alt="Map of Texas and Louisiana"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900">
            <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
              Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
            </div>
          </div>
        )}

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

        {/* Bottom fade for labels */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-900/80 to-transparent" />

        {/* Connection line between highlighted cities */}
        {highlightedCities.length >= 2 && (
          <svg
            ref={connectionsRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(251, 146, 60)" stopOpacity="0.8" />
                <stop offset="50%" stopColor="rgb(251, 146, 60)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(251, 146, 60)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {(() => {
              const start = coordsToPercent(highlightedCities[0].lng, highlightedCities[0].lat)
              const end = coordsToPercent(highlightedCities[1].lng, highlightedCities[1].lat)
              // Create curved path
              const midX = (start.x + end.x) / 2
              const midY = Math.min(start.y, end.y) - 15 // Curve upward
              return (
                <path
                  d={`M ${start.x}% ${start.y}% Q ${midX}% ${midY}% ${end.x}% ${end.y}%`}
                  fill="none"
                  stroke="url(#connectionGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="drop-shadow-lg"
                />
              )
            })()}
          </svg>
        )}

        {/* Glow effects behind pins */}
        {cities.filter(c => c.highlight).map((city, index) => {
          const { x, y } = coordsToPercent(city.lng, city.lat)
          return (
            <div
              key={`glow-${city.name}`}
              ref={(el) => { glowsRef.current[index] = el }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="w-32 h-32 rounded-full bg-[var(--accent)]/20 blur-2xl" />
            </div>
          )
        })}

        {/* City pins */}
        {cities.map((city, index) => {
          const { x, y } = coordsToPercent(city.lng, city.lat)
          return (
            <div
              key={city.name}
              ref={(el) => { pinsRef.current[index] = el }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Outer ring for highlighted */}
              {city.highlight && (
                <div className="absolute inset-0 -m-3 rounded-full border border-[var(--accent)]/30 animate-[ping_3s_ease-in-out_infinite]" />
              )}

              {/* Pin dot */}
              <div
                className={`relative rounded-full ${
                  city.highlight
                    ? 'w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-[var(--accent)] to-orange-600 shadow-lg shadow-[var(--accent)]/50 border-2 border-white/30'
                    : 'w-3 h-3 sm:w-4 sm:h-4 bg-zinc-400/80 border border-white/20'
                }`}
              >
                {city.highlight && (
                  <span className="absolute inset-0 rounded-full bg-[var(--accent)] animate-ping opacity-30" />
                )}
              </div>


              {/* Always visible label for highlighted cities */}
              {city.highlight && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center">
                  <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-zinc-700/50">
                    <p className="text-sm font-bold text-white whitespace-nowrap">{city.name}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--accent)] to-orange-600 border border-white/20" />
          <span>Primary Markets</span>
        </div>
        <p className="text-[10px] text-zinc-600">Google Analytics</p>
      </div>
    </div>
  )
}
