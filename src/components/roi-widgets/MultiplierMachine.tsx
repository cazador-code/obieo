'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface Props {
  ebitdaIncrease: number
  multiplier?: number
}

function AnimatedDigit({ value, delay = 0 }: { value: number; delay?: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 15 })

  useEffect(() => {
    const timer = setTimeout(() => {
      spring.set(value)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, spring, delay])

  const display = useTransform(spring, (latest) => Math.floor(latest).toLocaleString())

  return (
    <motion.span className="tabular-nums">
      {display}
    </motion.span>
  )
}

function OdometerRow({
  label,
  value,
  multiplier,
  color,
  delay
}: {
  label: string
  value: number
  multiplier: string
  color: string
  delay: number
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: color }}
        >
          {multiplier}
        </div>
        <span className="text-[var(--text-secondary)] font-medium">{label}</span>
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold text-[var(--text-primary)]">
          $<AnimatedDigit value={value} delay={delay} />
        </div>
        <div className="text-xs text-[var(--text-muted)]">company value increase</div>
      </div>
    </div>
  )
}

export function MultiplierMachine({ ebitdaIncrease, multiplier = 4 }: Props) {
  const lowMultiplier = multiplier - 1
  const highMultiplier = multiplier + 1
  const valueLow = ebitdaIncrease * lowMultiplier
  const valueMid = ebitdaIncrease * multiplier
  const valueHigh = ebitdaIncrease * highMultiplier

  return (
    <div className="w-full max-w-lg">
      {/* Machine Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          THE MULTIPLIER MACHINE
        </div>
      </div>

      {/* Input Display */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 mb-4">
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-1">Your Annual EBITDA Increase</p>
          <div className="text-4xl font-bold text-white">
            $<AnimatedDigit value={ebitdaIncrease} />
          </div>
        </div>
      </div>

      {/* Multiplier Arrow */}
      <div className="flex justify-center my-4">
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[var(--accent)]"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>

      {/* Multiplier Rows */}
      <div className="space-y-3">
        <OdometerRow
          label="Conservative"
          value={valueLow}
          multiplier={`${lowMultiplier}×`}
          color="#64748b"
          delay={0}
        />
        <OdometerRow
          label="Your Multiple"
          value={valueMid}
          multiplier={`${multiplier}×`}
          color="var(--accent)"
          delay={100}
        />
        <OdometerRow
          label="Premium Exit"
          value={valueHigh}
          multiplier={`${highMultiplier}×`}
          color="#059669"
          delay={200}
        />
      </div>

      {/* Bottom Note */}
      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        Home service businesses typically sell for 3-5× annual EBITDA
      </p>
    </div>
  )
}
