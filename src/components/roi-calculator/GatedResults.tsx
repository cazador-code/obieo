'use client'

import { motion } from 'framer-motion'
import { Counter } from '@/components/animations'
import CalendlyButton from '@/components/CalendlyButton'
import { formatCurrency } from './calculations'
import type { CalculatorResults, CalculatorInputs } from './types'

interface Props {
  results: CalculatorResults
  inputs: CalculatorInputs
}

interface MetricCardProps {
  label: string
  value: number
  prefix?: string
  duration?: number
  highlight?: boolean
  formatWithCommas?: boolean
}

interface EBITDACardProps {
  multiple: string
  value: number
  description: string
  highlighted?: boolean
}

function MetricCard({
  label,
  value,
  prefix = '',
  duration = 1,
  highlight = false,
  formatWithCommas = false,
}: MetricCardProps) {
  const bgClass = highlight
    ? 'bg-green-500/5 border-green-500/20'
    : 'bg-[var(--bg-card)] border-[var(--border)]'
  const textClass = highlight
    ? 'text-green-600 dark:text-green-400'
    : 'text-[var(--text-primary)]'

  return (
    <div className={`rounded-xl p-5 border ${bgClass}`}>
      <p className="text-sm text-[var(--text-secondary)] mb-1">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold ${textClass}`}>
        {prefix}<Counter value={value} duration={duration} formatWithCommas={formatWithCommas} />
      </p>
    </div>
  )
}

function EBITDACard({
  multiple,
  value,
  description,
  highlighted = false,
}: EBITDACardProps) {
  const containerClass = highlighted
    ? 'bg-[var(--accent)]/10 border-2 border-[var(--accent)]'
    : 'bg-[var(--bg-secondary)]'
  const textClass = highlighted
    ? 'text-[var(--accent)]'
    : 'text-[var(--text-primary)]'
  const labelClass = highlighted
    ? 'text-[var(--accent)] font-medium'
    : 'text-[var(--text-muted)]'

  return (
    <div className={`text-center p-4 rounded-xl ${containerClass}`}>
      <p className={`text-xs mb-1 ${labelClass}`}>{multiple} Multiple</p>
      <p className={`text-lg md:text-xl font-bold ${textClass}`}>
        +{formatCurrency(value)}
      </p>
      <p className={`text-xs mt-1 ${labelClass}`}>{description}</p>
    </div>
  )
}

export function GatedResults({ results, inputs }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5 rounded-2xl p-8 border border-[var(--accent)]/20">
        <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider mb-2">
          Your Potential Annual Revenue Increase
        </p>
        <div className="text-5xl md:text-6xl font-bold text-[var(--accent)]">
          $<Counter value={results.additionalAnnualRevenue} duration={1.5} formatWithCommas />
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Based on a 30% increase in leads from SEO
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Extra Leads/Month"
          value={results.extraLeadsPerMonth}
          prefix="+"
        />
        <MetricCard
          label="Additional Jobs/Month"
          value={Math.round(results.additionalClosedJobs * 10) / 10}
          prefix="+"
        />
        <MetricCard
          label="Monthly Profit Increase"
          value={results.additionalMonthlyGrossProfit}
          prefix="+$"
          duration={1.2}
          highlight
          formatWithCommas
        />
        <MetricCard
          label="Annual Profit Increase"
          value={results.additionalAnnualGrossProfit}
          prefix="+$"
          duration={1.2}
          highlight
          formatWithCommas
        />
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] font-[family-name:var(--font-display)] mb-2">
          Company Value Increase
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Home service businesses typically sell at 3-5x annual profit (EBITDA).
          Here&apos;s how SEO could impact your company&apos;s valuation:
        </p>

        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <EBITDACard
            multiple="3x"
            value={results.valueIncrease3x}
            description="Conservative"
          />
          <EBITDACard
            multiple="4x"
            value={results.valueIncrease4x}
            description="Typical"
            highlighted
          />
          <EBITDACard
            multiple="5x"
            value={results.valueIncrease5x}
            description="Strong"
          />
        </div>

        <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
          * Based on your {inputs.grossProfitMargin}% gross profit margin
        </p>
      </div>

      <details className="bg-[var(--bg-secondary)] rounded-xl p-4">
        <summary className="text-sm font-medium text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">
          How we calculated this
        </summary>
        <div className="mt-3 text-sm text-[var(--text-secondary)] space-y-2">
          <p>
            <strong>Your inputs:</strong> ${inputs.averageTicketSize.toLocaleString()} avg ticket, {inputs.currentLeadsPerMonth} leads/month, {inputs.closeRate}% close rate, {inputs.grossProfitMargin}% margin
          </p>
          <p>
            <strong>SEO assumption:</strong> 30% increase in monthly leads (industry average for local SEO)
          </p>
          <p>
            <strong>Valuation:</strong> EBITDA multiples of 3x, 4x, and 5x applied to additional annual gross profit
          </p>
        </div>
      </details>

      <div className="text-center bg-[var(--bg-card)] rounded-2xl p-8 border border-[var(--border)]">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] font-[family-name:var(--font-display)] mb-2">
          Ready to Hit These Numbers?
        </h3>
        <p className="text-[var(--text-secondary)] mb-6">
          Let&apos;s discuss a custom SEO strategy for your business.
        </p>
        <CalendlyButton source="roi-calculator" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all hover:scale-[1.02]">
          Book a Free Strategy Call
        </CalendlyButton>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          20 minutes. No pitch deck. Just strategy.
        </p>
      </div>
    </motion.div>
  )
}
