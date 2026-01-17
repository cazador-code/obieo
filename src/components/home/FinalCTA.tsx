'use client'

import Link from 'next/link'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection } from '@/components/animations'
import CalendlyButton from '@/components/CalendlyButton'

export function FinalCTA() {
  return (
    <Section size="lg">
      <Container className="text-center">
        <FadeInSection>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            Ready to rank higher?
          </h2>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Let&apos;s talk about where you stand on Google and what it would take
            to start showing up for the searches that matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CalendlyButton source="homepage-cta" className="px-8 py-4 bg-[var(--accent)] text-white text-lg font-semibold rounded-lg hover:bg-[var(--accent-hover)] hover:scale-[1.02] transition-all">
              Book a Free SEO Call
            </CalendlyButton>
            <Link href="/quiz">
              <Button variant="outline" size="lg">
                Or check your SEO score
              </Button>
            </Link>
          </div>
        </FadeInSection>
      </Container>
    </Section>
  )
}
