'use client'

import { motion } from 'framer-motion'

interface Props {
  ebitdaIncrease: number
  multiplier?: number
}

function MoneyStack({
  height,
  label,
  value,
  color,
  maxHeight = 300
}: {
  height: number
  label: string
  value: number
  color: string
  maxHeight?: number
}) {
  const stackCount = Math.ceil(height / 20)

  return (
    <div className="flex flex-col items-center">
      {/* Value Label */}
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-2xl font-bold text-[var(--text-primary)]">
          ${value.toLocaleString()}
        </div>
        <div className="text-xs text-[var(--text-muted)]">{label}</div>
      </motion.div>

      {/* Stack Container */}
      <div
        className="relative flex flex-col-reverse items-center justify-end"
        style={{ height: maxHeight }}
      >
        {/* Bills */}
        {Array.from({ length: stackCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: i * 0.02,
              type: 'spring',
              stiffness: 300,
              damping: 20
            }}
            className="w-20 h-4 rounded-sm shadow-sm relative"
            style={{
              backgroundColor: color,
              marginTop: '-2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {/* Bill detail lines */}
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex gap-1">
              <div className="h-0.5 w-2 bg-white/30 rounded" />
              <div className="h-0.5 flex-1 bg-white/20 rounded" />
              <div className="h-0.5 w-2 bg-white/30 rounded" />
            </div>
          </motion.div>
        ))}

        {/* Base/Platform */}
        <div className="w-24 h-3 bg-slate-700 rounded-sm mt-1" />
      </div>
    </div>
  )
}

export function StackTheCash({ ebitdaIncrease, multiplier = 4 }: Props) {
  const valueMultiplied = ebitdaIncrease * multiplier

  // Scale heights relative to max value
  const maxPossible = 500000 * multiplier
  const inputHeight = (ebitdaIncrease / maxPossible) * 280
  const outputHeight = (valueMultiplied / maxPossible) * 280

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          STACK THE CASH
        </div>
      </div>

      {/* Stacks Comparison */}
      <div className="flex items-end justify-center gap-16">
        {/* Input Stack */}
        <MoneyStack
          height={Math.max(inputHeight, 40)}
          label="Your EBITDA Increase"
          value={ebitdaIncrease}
          color="#64748b"
        />

        {/* Arrow */}
        <div className="flex flex-col items-center pb-20">
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-[var(--accent)]"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.div>
          <div className="text-lg font-bold text-[var(--accent)] mt-2">{multiplier}×</div>
          <div className="text-xs text-[var(--text-muted)]">multiplier</div>
        </div>

        {/* Output Stack */}
        <MoneyStack
          height={Math.max(outputHeight, 40)}
          label="Company Value Increase"
          value={valueMultiplied}
          color="#059669"
        />
      </div>

      {/* Impact Statement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 p-4 bg-[var(--bg-secondary)] rounded-xl"
      >
        <p className="text-[var(--text-secondary)]">
          Every <span className="font-bold text-[var(--text-primary)]">$1</span> in EBITDA you add becomes{' '}
          <span className="font-bold text-green-600">${multiplier}</span> in company value
        </p>
      </motion.div>
    </div>
  )
}
