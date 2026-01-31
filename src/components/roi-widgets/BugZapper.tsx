'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Props {
  ebitdaIncrease: number
  multiplier?: number
}

function Bug({ index, isZapped }: { index: number; isZapped: boolean }) {
  const positions = [
    { x: 20, y: 30 },
    { x: 70, y: 20 },
    { x: 120, y: 45 },
    { x: 45, y: 70 },
    { x: 95, y: 80 },
    { x: 140, y: 25 },
    { x: 30, y: 95 },
    { x: 80, y: 55 },
    { x: 110, y: 90 },
    { x: 55, y: 15 },
  ]

  const pos = positions[index % positions.length]

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: isZapped ? 0 : 1,
        scale: isZapped ? 1.5 : 1,
      }}
      transition={{
        delay: index * 0.1,
        duration: isZapped ? 0.2 : 0.3,
      }}
      style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
    >
      {/* Bug body */}
      <ellipse
        cx={pos.x}
        cy={pos.y}
        rx="8"
        ry="6"
        fill={isZapped ? '#fbbf24' : '#374151'}
      />
      {/* Bug head */}
      <circle
        cx={pos.x - 10}
        cy={pos.y}
        r="4"
        fill={isZapped ? '#fbbf24' : '#1f2937'}
      />
      {/* Legs */}
      {[-1, 0, 1].map((offset) => (
        <g key={offset}>
          <line
            x1={pos.x + offset * 4}
            y1={pos.y - 6}
            x2={pos.x + offset * 4 - 3}
            y2={pos.y - 12}
            stroke={isZapped ? '#fbbf24' : '#374151'}
            strokeWidth="1.5"
          />
          <line
            x1={pos.x + offset * 4}
            y1={pos.y + 6}
            x2={pos.x + offset * 4 - 3}
            y2={pos.y + 12}
            stroke={isZapped ? '#fbbf24' : '#374151'}
            strokeWidth="1.5"
          />
        </g>
      ))}
      {/* Zap effect */}
      {isZapped && (
        <motion.text
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          className="text-lg font-bold fill-yellow-400"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.3 }}
        >
          ⚡
        </motion.text>
      )}
    </motion.g>
  )
}

function ElectricArc() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 2 }}
    >
      <svg viewBox="0 0 160 120" className="w-full h-full">
        <motion.path
          d="M 20 60 Q 40 30, 60 60 T 100 60 T 140 60"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
        />
      </svg>
    </motion.div>
  )
}

export function BugZapper({ ebitdaIncrease, multiplier = 4 }: Props) {
  const valueMultiplied = ebitdaIncrease * multiplier
  const percentage = Math.min(ebitdaIncrease / 500000, 1)
  const bugCount = Math.floor(percentage * 10)

  const [zappedBugs, setZappedBugs] = useState<number[]>([])

  // Auto-zap bugs based on value
  useEffect(() => {
    let count = 0
    requestAnimationFrame(() => setZappedBugs([]))

    const interval = setInterval(() => {
      if (count >= bugCount) {
        clearInterval(interval)
        return
      }
      setZappedBugs(current => [...current, count])
      count++
    }, 300)

    return () => clearInterval(interval)
  }, [bugCount, ebitdaIncrease])

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-600 rounded-full text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          ZAP YOUR VALUE UP
        </div>
      </div>

      {/* Zapper Visual */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* Zapper frame */}
          <div className="w-48 h-36 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg border-4 border-slate-600 relative overflow-hidden">
            {/* Electric grid background */}
            <div className="absolute inset-2 bg-gradient-to-b from-blue-900/50 to-purple-900/50 rounded">
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-blue-500/20" />
                ))}
              </div>

              {/* Bugs */}
              <svg viewBox="0 0 160 120" className="absolute inset-0 w-full h-full">
                {Array.from({ length: bugCount }).map((_, i) => (
                  <Bug
                    key={i}
                    index={i}
                    isZapped={zappedBugs.includes(i)}
                  />
                ))}
              </svg>

              {/* Electric arcs */}
              <ElectricArc />
            </div>

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-blue-400/20 rounded"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Multiplier display */}
          <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div className="w-8 h-1 bg-yellow-400" />
            <motion.div
              className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-yellow-500/50"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {multiplier}×
            </motion.div>
          </div>

          {/* Zap counter */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm">
            <span className="text-yellow-500">⚡</span>
            <span className="text-[var(--text-muted)]">{zappedBugs.length} zapped</span>
          </div>
        </div>
      </div>

      {/* Value Display */}
      <div className="text-center space-y-4 mt-12">
        <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Bugs Eliminated</p>
            <p className="text-2xl font-bold text-blue-600">${ebitdaIncrease.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">EBITDA Added</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Value Generated</p>
            <motion.p
              className="text-2xl font-bold text-yellow-500"
              key={valueMultiplied}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              ${valueMultiplied.toLocaleString()}
            </motion.p>
            <p className="text-xs text-[var(--text-muted)]">Company Value</p>
          </div>
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-yellow-500/10 rounded-xl"
        >
          <p className="text-[var(--text-secondary)]">
            Every pest problem you solve zaps up your value—
            <span className="font-bold text-yellow-600"> {multiplier}× the impact</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
