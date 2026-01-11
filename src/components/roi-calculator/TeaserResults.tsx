'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Counter } from '@/components/animations'
import { Button } from '@/components/ui'
import { blurCurrency } from './calculations'
import { LeadCaptureForm } from './LeadCaptureForm'
import type { CalculatorResults } from './types'

interface Props {
  results: CalculatorResults
  onUnlock: (data: { name: string; email: string; company?: string }) => void
}

export function TeaserResults({ results, onUnlock }: Props) {
  const [showForm, setShowForm] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider mb-2">
            Your SEO Potential
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
            Here&apos;s What You Could Gain
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              Extra Leads Per Month
            </p>
            <div className="text-4xl md:text-5xl font-bold text-[var(--accent)]">
              +<Counter value={results.extraLeadsPerMonth} duration={1.2} />
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 text-center relative overflow-hidden">
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              Additional Monthly Revenue
            </p>
            <div className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
              <span className="blur-sm select-none">
                {blurCurrency(results.additionalMonthlyRevenue)}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-transparent" />
          </div>
        </div>

        <div className="mt-6 p-4 bg-[var(--bg-primary)] rounded-xl border border-dashed border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[var(--accent)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                Your full report includes:
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Annual revenue projections, profit breakdown, and company valuation impact at 3x, 4x, 5x EBITDA multiples
              </p>
            </div>
          </div>
        </div>
      </div>

      {showForm ? (
        <LeadCaptureForm onSubmit={onUnlock} />
      ) : (
        <Button
          size="lg"
          className="w-full"
          onClick={() => setShowForm(true)}
        >
          Unlock Your Full ROI Report
        </Button>
      )}
    </motion.div>
  )
}
