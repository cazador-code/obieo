'use client'

import { motion } from 'framer-motion'

interface Props {
  ebitdaIncrease: number
  multiplier?: number
}

function Shingle({ index, color }: { index: number; total: number; color: string }) {
  const row = Math.floor(index / 8)
  const col = index % 8
  const isOffset = row % 2 === 1

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, rotateX: -45 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        delay: index * 0.02,
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
      className="absolute"
      style={{
        width: '40px',
        height: '20px',
        left: `${col * 38 + (isOffset ? 19 : 0)}px`,
        bottom: `${row * 16}px`,
        backgroundColor: color,
        borderRadius: '0 0 4px 4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      {/* Shingle texture lines */}
      <div className="absolute inset-x-1 top-2 h-px bg-black/10" />
      <div className="absolute inset-x-2 top-4 h-px bg-black/10" />
    </motion.div>
  )
}

export function ShingleStack({ ebitdaIncrease, multiplier = 4 }: Props) {
  const valueMultiplied = ebitdaIncrease * multiplier
  // Calculate shingles based on value (max ~80 shingles for full roof)
  const percentage = Math.min(ebitdaIncrease / 500000, 1)
  const shingleCount = Math.floor(percentage * 80)

  // Shingle colors - terracotta/brown roof aesthetic
  const colors = ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#8B4513']

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-700 rounded-full text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          BUILDING YOUR VALUE
        </div>
      </div>

      {/* Roof Visual */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* House frame */}
          <div className="relative w-80 h-44">
            {/* Shingles container - roof shape */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] h-[140px] overflow-hidden"
              style={{
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
              }}
            >
              {/* Roof background */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-amber-50" />

              {/* Shingles */}
              <div className="relative w-full h-full">
                {Array.from({ length: shingleCount }).map((_, i) => (
                  <Shingle
                    key={i}
                    index={i}
                    total={shingleCount}
                    color={colors[i % colors.length]}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Display */}
      <div className="text-center space-y-4">
        <motion.div
          key={valueMultiplied}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <p className="text-sm text-[var(--text-muted)] mb-1">Company Value Increase</p>
          <p className="text-5xl font-bold text-[var(--text-primary)]">
            ${valueMultiplied.toLocaleString()}
          </p>
        </motion.div>

        {/* Progress bar styled as roof completion */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Roof Progress</span>
            <span>{Math.round(percentage * 100)}% Complete</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[var(--text-secondary)] mt-4"
        >
          Every shingle of EBITDA builds your exit value—
          <span className="font-bold text-amber-600"> {multiplier}× higher</span>
        </motion.p>
      </div>
    </div>
  )
}
