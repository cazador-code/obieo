'use client'

import Link from 'next/link'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

export function QuizCTA() {
  return (
    <Section>
      <Container size="md">
        <FadeInSection>
          <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] rounded-3xl p-8 md:p-12 lg:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-white mb-4">
              Not sure what you need?
            </h2>
            <p className="text-lg text-white/90 max-w-xl mx-auto mb-8">
              Take our free 2-minute assessment to get a personalized website score
              and see exactly what&apos;s holding your business back online.
            </p>
            <Link href="/quiz">
              <Button
                size="lg"
                className="!bg-white !text-[var(--accent)] hover:!bg-white/90 hover:!text-[var(--accent-hover)]"
              >
                Get Your Free Website Score
              </Button>
            </Link>
          </div>
        </FadeInSection>
      </Container>
    </Section>
  )
}
