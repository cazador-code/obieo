'use client'

import { motion } from 'framer-motion'

interface Props {
  ebitdaIncrease: number
  multiplier?: number
}

function Check({
  amount,
  label,
  variant,
  highlight = false
}: {
  amount: number
  label: string
  variant: 'before' | 'after'
  highlight?: boolean
}) {
  const isBefore = variant === 'before'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: isBefore ? -10 : 10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.5, delay: isBefore ? 0 : 0.2 }}
      className={`relative w-72 ${highlight ? 'scale-105' : ''}`}
      style={{ perspective: '1000px' }}
    >
      {/* Check Paper */}
      <div
        className={`relative p-6 rounded-lg border-2 ${
          isBefore
            ? 'bg-slate-100 border-slate-300'
            : 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-400'
        }`}
        style={{
          boxShadow: isBefore
            ? '0 4px 6px rgba(0,0,0,0.1)'
            : '0 8px 25px rgba(5,150,105,0.3)'
        }}
      >
        {/* Check Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className={`text-xs font-mono ${isBefore ? 'text-slate-500' : 'text-green-700'}`}>
              BUSINESS EXIT
            </div>
            <div className={`text-sm font-semibold ${isBefore ? 'text-slate-700' : 'text-green-800'}`}>
              {label}
            </div>
          </div>
          <div className={`text-xs ${isBefore ? 'text-slate-400' : 'text-green-600'}`}>
            #{Math.floor(Math.random() * 9000) + 1000}
          </div>
        </div>

        {/* Amount */}
        <div className="text-center py-4">
          <div className={`text-xs uppercase tracking-wide mb-1 ${isBefore ? 'text-slate-500' : 'text-green-600'}`}>
            Pay to the order of: YOU
          </div>
          <motion.div
            className={`text-3xl font-bold font-mono ${isBefore ? 'text-slate-700' : 'text-green-700'}`}
            key={amount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            ${amount.toLocaleString()}
          </motion.div>
        </div>

        {/* Signature Line */}
        <div className="mt-4 pt-4 border-t border-dashed border-slate-300">
          <div className="flex justify-between items-end">
            <div className="text-xs text-slate-400">Date: Upon Sale</div>
            <div className="w-20 h-6 border-b border-slate-300" />
          </div>
        </div>

        {/* Decorative elements */}
        <div className={`absolute top-2 right-2 w-8 h-8 rounded-full ${isBefore ? 'bg-slate-200' : 'bg-green-200'} opacity-50`} />
      </div>

      {/* Label Badge */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
          isBefore
            ? 'bg-slate-600 text-white'
            : 'bg-green-600 text-white'
        }`}
      >
        {isBefore ? 'WITHOUT SEO' : 'WITH SEO'}
      </div>
    </motion.div>
  )
}

export function BeforeAfterExit({ ebitdaIncrease, multiplier = 4 }: Props) {
  // Assuming a base business value of $500K for demo
  const baseValue = 500000
  const valueIncrease = ebitdaIncrease * multiplier
  const newValue = baseValue + valueIncrease

  const difference = newValue - baseValue

  return (
    <div className="w-full max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          YOUR EXIT CHECK
        </div>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Assuming current business value of ${baseValue.toLocaleString()}
        </p>
      </div>

      {/* Checks Comparison */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
        <Check
          amount={baseValue}
          label="Current Value"
          variant="before"
        />

        {/* Arrow */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-[var(--accent)] rotate-90 sm:rotate-0"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.div>
        </motion.div>

        <Check
          amount={newValue}
          label="After SEO Investment"
          variant="after"
          highlight
        />
      </div>

      {/* Difference Callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center"
      >
        <div className="inline-block p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white">
          <div className="text-sm opacity-80 mb-1">Extra money in YOUR pocket</div>
          <div className="text-4xl font-bold">
            +${difference.toLocaleString()}
          </div>
          <div className="text-sm opacity-80 mt-2">
            from ${ebitdaIncrease.toLocaleString()}/yr EBITDA increase
          </div>
        </div>
      </motion.div>

      {/* Context */}
      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        Based on {multiplier}× EBITDA multiple
      </p>
    </div>
  )
}
