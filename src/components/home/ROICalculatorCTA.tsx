'use client'

import Link from 'next/link'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

export function ROICalculatorCTA() {
  return (
    <Section>
      <Container size="md">
        <FadeInSection>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 md:p-12 lg:p-16 text-center">
            <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider mb-3">
              Free Tool
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
              What&apos;s SEO actually worth to your business?
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
              Enter your numbers and see exactly how much revenue you&apos;re
              leaving on the table — plus what it could mean for your company&apos;s valuation.
            </p>
            <Link href="/roi-calculator">
              <Button size="lg">
                Calculate Your ROI
              </Button>
            </Link>
          </div>
        </FadeInSection>
      </Container>
    </Section>
  )
}
