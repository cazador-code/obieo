'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface Props {
  ebitdaIncrease: number
  multiplier?: number
}

function Gauge({ value, max }: { value: number; max: number }) {
  const percentage = Math.min((value / max) * 100, 100)
  const rotation = useSpring(-90, { stiffness: 50, damping: 20 })

  useEffect(() => {
    // Map percentage to rotation (-90 to 90 degrees)
    const targetRotation = -90 + (percentage * 180) / 100
    rotation.set(targetRotation)
  }, [percentage, rotation])

  const needleRotation = useTransform(rotation, (r) => `rotate(${r}deg)`)

  // Color based on value
  const getColor = () => {
    if (percentage < 30) return '#64748b'
    if (percentage < 60) return 'var(--accent)'
    return '#059669'
  }

  return (
    <div className="relative w-64 h-32 overflow-hidden">
      {/* Gauge Background */}
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="var(--bg-secondary)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        {/* Colored arc based on percentage */}
        <motion.path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray="283"
          initial={{ strokeDashoffset: 283 }}
          animate={{ strokeDashoffset: 283 - (percentage * 283) / 100 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = (-90 + (tick * 180) / 100) * (Math.PI / 180)
          const x1 = 100 + 70 * Math.cos(angle)
          const y1 = 100 + 70 * Math.sin(angle)
          const x2 = 100 + 80 * Math.cos(angle)
          const y2 = 100 + 80 * Math.sin(angle)
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--text-muted)"
              strokeWidth="2"
            />
          )
        })}
      </svg>

      {/* Needle */}
      <motion.div
        className="absolute bottom-0 left-1/2 origin-bottom"
        style={{ rotate: needleRotation }}
      >
        <div className="w-1 h-20 bg-[var(--text-primary)] rounded-t-full -ml-0.5" />
        <div className="w-4 h-4 bg-[var(--text-primary)] rounded-full -ml-1.5 -mt-2" />
      </motion.div>

      {/* Center point */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-700 rounded-full border-4 border-slate-600" />
    </div>
  )
}

export function ValueLever({ ebitdaIncrease, multiplier = 4 }: Props) {
  const valueMultiplied = ebitdaIncrease * multiplier
  const maxValue = 500000 * multiplier

  return (
    <div className="w-full max-w-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          THE VALUE LEVER
        </div>
      </div>

      {/* Main Display */}
      <div className="flex flex-col items-center">
        {/* Gauge */}
        <Gauge value={valueMultiplied} max={maxValue} />

        {/* Value Display */}
        <motion.div
          className="text-center mt-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={valueMultiplied}
        >
          <div className="text-5xl font-bold text-[var(--text-primary)]">
            ${valueMultiplied.toLocaleString()}
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-1">
            company value increase ({multiplier}× multiple)
          </div>
        </motion.div>

        {/* Lever Visual */}
        <div className="mt-8 w-full max-w-sm">
          <div className="relative">
            {/* Track */}
            <div className="h-4 bg-gradient-to-r from-slate-700 via-[var(--accent)] to-green-500 rounded-full" />

            {/* Lever Handle */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2"
              style={{
                left: `${Math.min((ebitdaIncrease / 500000) * 100, 100)}%`,
              }}
              animate={{
                left: `${Math.min((ebitdaIncrease / 500000) * 100, 100)}%`,
              }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <div className="w-8 h-8 bg-white rounded-full shadow-lg border-4 border-slate-300 -ml-4 cursor-grab" />
            </motion.div>
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
            <span>$10K</span>
            <span className="text-[var(--accent)] font-medium">
              ${ebitdaIncrease.toLocaleString()} EBITDA
            </span>
            <span>$500K</span>
          </div>
        </div>

        {/* Impact Callout */}
        <motion.div
          className="mt-8 p-4 bg-gradient-to-r from-[var(--accent)]/10 to-green-500/10 rounded-xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-lg">
            <span className="text-[var(--text-muted)]">Push</span>{' '}
            <span className="font-bold text-[var(--accent)]">${ebitdaIncrease.toLocaleString()}</span>{' '}
            <span className="text-[var(--text-muted)]">in EBITDA →</span>{' '}
            <span className="font-bold text-green-600">${valueMultiplied.toLocaleString()}</span>{' '}
            <span className="text-[var(--text-muted)]">in value</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
