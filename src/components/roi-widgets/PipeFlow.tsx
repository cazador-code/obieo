'use client'

import { motion } from 'framer-motion'

interface Props {
  ebitdaIncrease: number
  multiplier?: number
}

function MoneyDrop({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      className="absolute w-3 h-4 bg-green-500 rounded-full"
      style={{ left: x }}
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: [0, 120],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 1.2,
        delay,
        repeat: Infinity,
        ease: 'easeIn',
      }}
    >
      <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold">$</span>
    </motion.div>
  )
}

function PressureGauge({ percentage }: { percentage: number }) {
  const rotation = -90 + (percentage * 180)

  return (
    <div className="relative w-32 h-16 overflow-hidden">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Gauge background */}
        <path
          d="M 5 50 A 45 45 0 0 1 95 50"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Gauge fill */}
        <motion.path
          d="M 5 50 A 45 45 0 0 1 95 50"
          fill="none"
          stroke="url(#pipeGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="141"
          initial={{ strokeDashoffset: 141 }}
          animate={{ strokeDashoffset: 141 - (percentage * 141 / 100) }}
          transition={{ duration: 0.8 }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = (-90 + (tick * 180 / 100)) * (Math.PI / 180)
          const x1 = 50 + 35 * Math.cos(angle)
          const y1 = 50 + 35 * Math.sin(angle)
          const x2 = 50 + 42 * Math.cos(angle)
          const y2 = 50 + 42 * Math.sin(angle)
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#94a3b8"
              strokeWidth="2"
            />
          )
        })}
      </svg>
      {/* Needle */}
      <motion.div
        className="absolute bottom-0 left-1/2 origin-bottom"
        initial={{ rotate: -90 }}
        animate={{ rotate: rotation }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <div className="w-0.5 h-10 bg-slate-700 -ml-px rounded-t-full" />
      </motion.div>
      {/* Center cap */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-600 rounded-full" />
    </div>
  )
}

export function PipeFlow({ ebitdaIncrease, multiplier = 4 }: Props) {
  const valueMultiplied = ebitdaIncrease * multiplier
  const percentage = Math.min((ebitdaIncrease / 500000) * 100, 100)

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          CASH FLOW PRESSURE
        </div>
      </div>

      {/* Pipe System Visual */}
      <div className="flex justify-center mb-4">
        <div className="relative h-56 w-80">
          {/* Input pipe (horizontal) */}
          <div className="absolute left-0 top-8 w-24 h-8 bg-gradient-to-r from-slate-400 to-slate-500 rounded-l-full">
            <div className="absolute inset-y-1 left-1 right-0 bg-slate-600 rounded-l-full" />
            <div className="absolute top-1/2 -translate-y-1/2 left-2 text-xs text-white font-bold">
              IN
            </div>
          </div>

          {/* Center valve/multiplier */}
          <div className="absolute left-20 top-4 w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center z-10 border-4 border-slate-500">
            <motion.div
              className="text-2xl font-bold text-cyan-400"
              key={multiplier}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
            >
              {multiplier}×
            </motion.div>
          </div>

          {/* Output pipe (vertical) */}
          <div className="absolute left-24 top-16 w-8 h-28 bg-gradient-to-b from-slate-500 to-slate-400">
            <div className="absolute inset-x-1 top-0 bottom-1 bg-slate-600" />
            {/* Money drops flowing */}
            <div className="absolute inset-x-0 top-4 overflow-hidden h-24">
              {percentage > 10 && <MoneyDrop delay={0} x={6} />}
              {percentage > 30 && <MoneyDrop delay={0.3} x={14} />}
              {percentage > 50 && <MoneyDrop delay={0.6} x={10} />}
              {percentage > 70 && <MoneyDrop delay={0.9} x={18} />}
            </div>
          </div>

          {/* Output label */}
          <div className="absolute left-14 top-48 text-center">
            <div className="text-xs text-[var(--text-muted)]">OUT</div>
          </div>

          {/* Pressure gauge */}
          <div className="absolute right-0 top-0">
            <PressureGauge percentage={percentage} />
            <div className="text-center mt-1 text-xs text-[var(--text-muted)]">
              Flow Rate
            </div>
          </div>
        </div>
      </div>

      {/* Value Display */}
      <div className="text-center space-y-4 mt-8">
        <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Flowing In</p>
            <p className="text-2xl font-bold text-blue-600">${ebitdaIncrease.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">EBITDA</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Pumping Out</p>
            <motion.p
              className="text-2xl font-bold text-green-600"
              key={valueMultiplied}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              ${valueMultiplied.toLocaleString()}
            </motion.p>
            <p className="text-xs text-[var(--text-muted)]">Value</p>
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
            Your EBITDA flows through at{' '}
            <span className="font-bold text-blue-600">{multiplier}× pressure</span>—
            turning ${ebitdaIncrease.toLocaleString()} into{' '}
            <span className="font-bold text-green-600">${valueMultiplied.toLocaleString()}</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
