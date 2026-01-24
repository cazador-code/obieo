'use client'

import Link from 'next/link'
import { FadeInSection } from '@/components/animations'
import CalendlyButton from '@/components/CalendlyButton'

interface DashboardCTAProps {
  headline?: string
  subheadline?: string
  primaryButtonText?: string
  secondaryButtonText?: string
  secondaryButtonHref?: string
}

export function DashboardCTA({
  headline = 'Ready to see these results for your business?',
  subheadline = "Let's talk about your market and see if we're a good fit.",
  primaryButtonText = 'Get Your Free Audit',
  secondaryButtonText = 'See How It Works',
  secondaryButtonHref = '/process',
}: DashboardCTAProps) {
  return (
    <FadeInSection>
      <div className="relative py-12 px-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700/50 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[var(--accent)]/10 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)]">
            {headline}
          </h3>
          <p className="text-zinc-400 mt-3 max-w-lg mx-auto">{subheadline}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <CalendlyButton
              source="case-study-dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-lg transition-all text-lg shadow-lg shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 hover:-translate-y-0.5"
            >
              {primaryButtonText}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </CalendlyButton>

            <Link
              href={secondaryButtonHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-zinc-300 hover:text-white font-medium transition-colors"
            >
              {secondaryButtonText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </FadeInSection>
  )
}
