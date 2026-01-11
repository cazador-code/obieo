'use client'

import { useRef, useEffect, useState, useSyncExternalStore } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Check for reduced motion preference
function subscribeToReducedMotion(callback: () => void) {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getReducedMotionServerSnapshot() {
  return false
}

interface CounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  /** Format number with commas (e.g., 1,234,567) */
  formatWithCommas?: boolean
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

export function Counter({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  className = '',
  formatWithCommas = false,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
  const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? value : 0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || hasAnimated.current || prefersReducedMotion) return

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => {
        if (hasAnimated.current) return
        hasAnimated.current = true

        const obj = { val: 0 }
        gsap.to(obj, {
          val: value,
          duration,
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
  }, [value, duration, prefersReducedMotion])

  // For reduced motion, just show the final value
  const finalDisplayValue = prefersReducedMotion ? value : displayValue
  const formattedValue = formatWithCommas ? formatNumber(finalDisplayValue) : finalDisplayValue

  return (
    <span ref={ref} className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  )
}
