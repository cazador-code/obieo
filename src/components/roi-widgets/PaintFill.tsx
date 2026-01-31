'use client'

import { motion } from 'framer-motion'

interface Props {
  ebitdaIncrease: number
  multiplier?: number
}

function PaintDrip({ x, delay, color }: { x: string; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute top-0 w-2"
      style={{ left: x }}
      initial={{ height: 0 }}
      animate={{ height: '100%' }}
      transition={{ delay, duration: 0.8, ease: 'easeOut' }}
    >
      <div
        className="w-full h-full rounded-b-full"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  )
}

export function PaintFill({ ebitdaIncrease, multiplier = 4 }: Props) {
  const valueMultiplied = ebitdaIncrease * multiplier
  const percentage = Math.min(ebitdaIncrease / 500000, 1)

  // Paint colors - from base to "premium" based on multiplier
  const baseColor = '#3b82f6' // Blue
  const premiumColors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6']
  const accentColor = premiumColors[Math.min(Math.floor(multiplier / 3), premiumColors.length - 1)]

  const dripCount = Math.floor(percentage * 12) + 3

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          PAINT YOUR SUCCESS
        </div>
      </div>

      {/* Wall Visual */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* Paint bucket */}
          <motion.div
            className="absolute -left-24 top-8 w-20 h-16"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Bucket body */}
            <div
              className="w-full h-full rounded-b-lg border-4 border-t-0"
              style={{ borderColor: '#64748b', backgroundColor: baseColor }}
            >
              {/* Paint level */}
              <motion.div
                className="absolute bottom-0 left-0.5 right-0.5 rounded-b"
                style={{ backgroundColor: baseColor }}
                initial={{ height: '90%' }}
                animate={{ height: `${90 - percentage * 40}%` }}
              />
            </div>
            {/* Bucket rim */}
            <div className="absolute -top-2 left-0 right-0 h-3 bg-slate-500 rounded-t-lg" />
            {/* Handle */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-4 border-4 border-slate-500 rounded-t-full border-b-0" />
            {/* Paint dripping from bucket */}
            <motion.div
              className="absolute -right-2 top-0 w-3 h-8 rounded-b-full"
              style={{ backgroundColor: baseColor }}
              animate={{ height: [20, 32, 20] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Wall */}
          <div className="w-56 h-44 bg-slate-200 rounded-lg border-4 border-slate-300 relative overflow-hidden">
            {/* Unpainted wall texture */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 6 }).map((_, row) => (
                <div key={row} className="flex">
                  {Array.from({ length: 8 }).map((_, col) => (
                    <div
                      key={col}
                      className="w-8 h-6 border border-slate-400"
                      style={{ marginLeft: row % 2 === 0 ? 0 : '-1rem' }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Paint fill from bottom */}
            <motion.div
              className="absolute bottom-0 left-0 right-0"
              style={{ backgroundColor: baseColor }}
              initial={{ height: '0%' }}
              animate={{ height: `${percentage * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {/* Paint drips at top edge */}
              <div className="absolute -top-8 left-0 right-0 h-8 overflow-hidden">
                {Array.from({ length: dripCount }).map((_, i) => (
                  <PaintDrip
                    key={i}
                    x={(i * 100) / dripCount + '%'}
                    delay={i * 0.1}
                    color={baseColor}
                  />
                ))}
              </div>
            </motion.div>

            {/* Brush strokes overlay */}
            {percentage > 0.3 && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-2 rounded-full"
                    style={{
                      backgroundColor: accentColor,
                      width: `${30 + ((i * 17 + 7) % 40)}%`,
                      left: `${(i * 23 + 11) % 50}%`,
                      top: `${20 + i * 15}%`,
                      opacity: 0.5,
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8 + i * 0.2 }}
                  />
                ))}
              </motion.div>
            )}

            {/* Completion percentage */}
            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-slate-700">
              {Math.round(percentage * 100)}%
            </div>
          </div>

          {/* Multiplier roller */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2">
              {/* Roller handle */}
              <div className="w-1 h-16 bg-slate-500 rounded" />
              {/* Roller head */}
              <motion.div
                className="w-12 h-20 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ backgroundColor: accentColor }}
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {multiplier}×
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Display */}
      <div className="text-center space-y-4">
        <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Paint Applied</p>
            <p className="text-2xl font-bold text-blue-600">${ebitdaIncrease.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">EBITDA Added</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Value Transformed</p>
            <motion.p
              className="text-2xl font-bold"
              style={{ color: accentColor }}
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
          className="p-4 bg-blue-500/10 rounded-xl"
        >
          <p className="text-[var(--text-secondary)]">
            Every coat of EBITDA transforms your value—
            <span className="font-bold" style={{ color: accentColor }}> {multiplier}× the finish</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
