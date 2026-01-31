'use client'

import { motion } from 'framer-motion'

interface Props {
  ebitdaIncrease: number
  multiplier?: number
}

function Leaf({ x, y, delay, size = 1 }: { x: number; y: number; delay: number; size?: number }) {
  return (
    <motion.ellipse
      cx={x}
      cy={y}
      rx={8 * size}
      ry={12 * size}
      fill="url(#leafGradient)"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
    />
  )
}

function GrassBlade({ x, height, delay }: { x: number; height: number; delay: number }) {
  return (
    <motion.path
      d={`M ${x} 200 Q ${x + 3} ${200 - height / 2}, ${x + 2} ${200 - height}`}
      fill="none"
      stroke="url(#grassGradient)"
      strokeWidth="3"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay, duration: 0.5 }}
    />
  )
}

export function GrowthMeter({ ebitdaIncrease, multiplier = 4 }: Props) {
  const valueMultiplied = ebitdaIncrease * multiplier
  const percentage = Math.min(ebitdaIncrease / 500000, 1)

  // Tree height based on percentage
  const treeHeight = 40 + percentage * 100
  const leafCount = Math.floor(percentage * 20)
  const grassCount = Math.floor(percentage * 15) + 5

  // Generate leaf positions in a tree-like pattern
  const leaves = Array.from({ length: leafCount }).map((_, i) => {
    const layer = Math.floor(i / 4)
    const angle = (i % 4) * 90 + layer * 22.5
    const radius = 20 + layer * 15
    const x = 100 + Math.cos((angle * Math.PI) / 180) * radius
    const y = 60 - layer * 12 - percentage * 30
    return { x, y, delay: 0.5 + i * 0.05, size: 1 - layer * 0.1 }
  })

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          WATCH YOUR VALUE GROW
        </div>
      </div>

      {/* Tree Visual */}
      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-56">
          <svg viewBox="0 0 200 220" className="w-full h-full">
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="50%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id="grassGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>

            {/* Ground */}
            <ellipse cx="100" cy="205" rx="90" ry="15" fill="#a3a3a3" opacity="0.3" />

            {/* Grass */}
            {Array.from({ length: grassCount }).map((_, i) => {
              const x = 20 + (i * 160) / grassCount + ((i * 7 + 3) % 10)
              const height = 15 + ((i * 13 + 5) % 20)
              return <GrassBlade key={i} x={x} height={height} delay={i * 0.03} />
            })}

            {/* Tree trunk */}
            <motion.rect
              x="92"
              y={200 - treeHeight}
              width="16"
              height={treeHeight}
              fill="url(#trunkGradient)"
              rx="4"
              initial={{ height: 0, y: 200 }}
              animate={{ height: treeHeight, y: 200 - treeHeight }}
              transition={{ duration: 0.8 }}
            />

            {/* Tree branches */}
            {percentage > 0.3 && (
              <motion.path
                d={`M 100 ${150 - percentage * 40} Q 70 ${140 - percentage * 40}, 60 ${145 - percentage * 40}`}
                fill="none"
                stroke="url(#trunkGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              />
            )}
            {percentage > 0.5 && (
              <motion.path
                d={`M 100 ${130 - percentage * 40} Q 130 ${120 - percentage * 40}, 140 ${125 - percentage * 40}`}
                fill="none"
                stroke="url(#trunkGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              />
            )}

            {/* Leaves */}
            {leaves.map((leaf, i) => (
              <Leaf key={i} {...leaf} />
            ))}

            {/* Value fruit/flower */}
            {percentage > 0.2 && (
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
              >
                <circle cx="100" cy={80 - percentage * 30} r="18" fill="#fbbf24" />
                <text
                  x="100"
                  y={82 - percentage * 30}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-amber-800"
                >
                  {multiplier}×
                </text>
              </motion.g>
            )}
          </svg>

          {/* Growth meter bar */}
          <div className="absolute left-0 top-4 bottom-8 w-6 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600 to-green-400 rounded-full"
              initial={{ height: '0%' }}
              animate={{ height: `${percentage * 100}%` }}
              transition={{ duration: 0.8 }}
            />
            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((tick) => (
              <div
                key={tick}
                className="absolute left-0 right-0 h-px bg-slate-400"
                style={{ bottom: `${tick}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Value Display */}
      <div className="text-center space-y-4">
        <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Seeds Planted</p>
            <p className="text-2xl font-bold text-green-600">${ebitdaIncrease.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)]">EBITDA Added</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Harvest Value</p>
            <motion.p
              className="text-2xl font-bold text-amber-500"
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
          className="p-4 bg-green-500/10 rounded-xl"
        >
          <p className="text-[var(--text-secondary)]">
            Every dollar you grow multiplies your value—
            <span className="font-bold text-green-600"> {multiplier}× the harvest</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
