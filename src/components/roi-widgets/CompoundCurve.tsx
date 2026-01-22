'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface Props {
  ebitdaIncrease: number
  multiplier?: number
}

interface DataPoint {
  ebitda: number
  value3x: number
  value4x: number
  value5x: number
}

export function CompoundCurve({ ebitdaIncrease, multiplier = 4 }: Props) {
  const lowMultiplier = multiplier - 1
  const highMultiplier = multiplier + 1

  // Generate data points for the chart
  const dataPoints: DataPoint[] = useMemo(() => {
    const points: DataPoint[] = []
    for (let i = 0; i <= 500000; i += 25000) {
      points.push({
        ebitda: i,
        value3x: i * lowMultiplier,
        value4x: i * multiplier,
        value5x: i * highMultiplier,
      })
    }
    return points
  }, [lowMultiplier, multiplier, highMultiplier])

  const maxEbitda = 500000
  const maxValue = 500000 * highMultiplier

  // Chart dimensions
  const width = 600
  const height = 350
  const padding = { top: 20, right: 30, bottom: 50, left: 70 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Scale functions
  const xScale = (val: number) => padding.left + (val / maxEbitda) * chartWidth
  const yScale = (val: number) => height - padding.bottom - (val / maxValue) * chartHeight

  // Generate path for a line
  const generatePath = (multiplier: number) => {
    return dataPoints
      .map((p, i) => {
        const x = xScale(p.ebitda)
        const y = yScale(p.ebitda * multiplier)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  // Current position
  const currentX = xScale(ebitdaIncrease)
  const currentYLow = yScale(ebitdaIncrease * lowMultiplier)
  const currentYMid = yScale(ebitdaIncrease * multiplier)
  const currentYHigh = yScale(ebitdaIncrease * highMultiplier)

  // Y-axis labels - generate dynamically based on max value
  const yLabels = useMemo(() => {
    const labels: number[] = []
    const step = maxValue / 5
    for (let i = 0; i <= 5; i++) {
      labels.push(Math.round(step * i))
    }
    return labels
  }, [maxValue])

  return (
    <div className="w-full max-w-3xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          THE COMPOUND CURVE
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[var(--bg-primary)] rounded-xl p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px]">
          {/* Grid lines */}
          {yLabels.map((label) => (
            <g key={label}>
              <line
                x1={padding.left}
                y1={yScale(label)}
                x2={width - padding.right}
                y2={yScale(label)}
                stroke="var(--border)"
                strokeDasharray="4"
              />
              <text
                x={padding.left - 10}
                y={yScale(label)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-[10px] fill-[var(--text-muted)]"
              >
                ${(label / 1000000).toFixed(1)}M
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {[0, 100000, 200000, 300000, 400000, 500000].map((label) => (
            <text
              key={label}
              x={xScale(label)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-[10px] fill-[var(--text-muted)]"
            >
              ${label / 1000}K
            </text>
          ))}

          {/* Axis labels */}
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-[11px] fill-[var(--text-secondary)]"
          >
            Annual EBITDA Increase
          </text>
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            className="text-[11px] fill-[var(--text-secondary)]"
            transform={`rotate(-90, 15, ${height / 2})`}
          >
            Company Value Increase
          </text>

          {/* Lines */}
          <motion.path
            d={generatePath(lowMultiplier)}
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0 }}
          />
          <motion.path
            d={generatePath(multiplier)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
          <motion.path
            d={generatePath(highMultiplier)}
            fill="none"
            stroke="#059669"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          />

          {/* Current position vertical line */}
          <motion.line
            x1={currentX}
            y1={padding.top}
            x2={currentX}
            y2={height - padding.bottom}
            stroke="var(--accent)"
            strokeWidth="1"
            strokeDasharray="4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
          />

          {/* Current position dots */}
          <motion.circle
            cx={currentX}
            cy={currentYLow}
            r="6"
            fill="#64748b"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          />
          <motion.circle
            cx={currentX}
            cy={currentYMid}
            r="8"
            fill="var(--accent)"
            stroke="white"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
          />
          <motion.circle
            cx={currentX}
            cy={currentYHigh}
            r="6"
            fill="#059669"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 }}
          />

          {/* Value labels at current position */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <text
              x={currentX + 10}
              y={currentYHigh}
              className="text-[10px] fill-green-600 font-semibold"
            >
              ${(ebitdaIncrease * highMultiplier).toLocaleString()}
            </text>
            <text
              x={currentX + 10}
              y={currentYMid}
              className="text-[11px] fill-[var(--accent)] font-bold"
            >
              ${(ebitdaIncrease * multiplier).toLocaleString()}
            </text>
            <text
              x={currentX + 10}
              y={currentYLow}
              className="text-[10px] fill-slate-500 font-semibold"
            >
              ${(ebitdaIncrease * lowMultiplier).toLocaleString()}
            </text>
          </motion.g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-slate-500 rounded" />
          <span className="text-xs text-[var(--text-muted)]">{lowMultiplier}× Multiple</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-[var(--accent)] rounded" />
          <span className="text-xs text-[var(--text-secondary)] font-medium">{multiplier}× Multiple</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-600 rounded" />
          <span className="text-xs text-[var(--text-muted)]">{highMultiplier}× Multiple</span>
        </div>
      </div>

      {/* Current Value Highlight */}
      <motion.div
        className="mt-6 text-center p-4 bg-[var(--accent)]/10 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm text-[var(--text-secondary)]">
          At <span className="font-bold text-[var(--text-primary)]">${ebitdaIncrease.toLocaleString()}</span> EBITDA increase,
          your company value grows by{' '}
          <span className="font-bold text-[var(--accent)]">${(ebitdaIncrease * multiplier).toLocaleString()}</span>
        </p>
      </motion.div>
    </div>
  )
}
