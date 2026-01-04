'use client'

import Link from 'next/link'
import { Section, Container, Button } from '@/components/ui'
import CalendlyButton from '@/components/CalendlyButton'

export function WorkCTA() {
  return (
    <Section variant="alternate">
      <Container className="text-center">
        <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
          Ready for results like these?
        </h2>
        <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
          Let&apos;s talk about how we can transform your online presence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/quiz">
            <Button size="lg">Get Your Free Website Score</Button>
          </Link>
          <CalendlyButton className="px-6 py-3 border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--bg-secondary)] transition-all">
            Book a Call
          </CalendlyButton>
        </div>
      </Container>
    </Section>
  )
}
