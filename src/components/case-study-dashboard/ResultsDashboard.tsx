'use client'

import { Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'
import { HeroCounter } from './HeroCounter'
import { MetricsGrid } from './MetricsGrid'
import { GrowthTimeline } from './GrowthTimeline'
import { GeographicMap } from './GeographicMap'
import { ScreenshotProof } from './ScreenshotProof'
import { DashboardCTA } from './DashboardCTA'

export function ResultsDashboard() {
  return (
    <section className="relative py-20 sm:py-28 bg-[#0a0a0a] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Gradient mesh */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <Container size="xl" className="relative z-10">
        {/* Section header */}
        <FadeInSection>
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[var(--accent)] uppercase tracking-[0.2em] text-sm font-medium mb-4">
              Live Results Dashboard
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-[family-name:var(--font-display)]">
              The Numbers Don&apos;t Lie
            </h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto text-lg">
              Real data from Google Analytics and Search Console — updated January 2026
            </p>
          </div>
        </FadeInSection>

        {/* Hero counter */}
        <FadeInSection delay={0.1}>
          <HeroCounter
            value={34700}
            label="search impressions in 28 days"
            tagline="From invisible to impossible to ignore"
          />
        </FadeInSection>

        {/* Metrics grid */}
        <div className="mt-8 sm:mt-12">
          <MetricsGrid />
        </div>

        {/* Growth timeline */}
        <FadeInSection delay={0.2}>
          <div className="mt-12 sm:mt-16">
            <h3 className="text-lg font-semibold text-white mb-6 text-center">The Journey</h3>
            <GrowthTimeline />
          </div>
        </FadeInSection>

        {/* Two-column layout: Map + Screenshot */}
        <div className="mt-12 sm:mt-16 grid lg:grid-cols-2 gap-6">
          <FadeInSection delay={0.1}>
            <GeographicMap />
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <ScreenshotProof
              imageSrc="/case-studies/lapeyre-roofing/gsc-screenshot.png"
              imageAlt="Google Search Console performance data"
            />
          </FadeInSection>
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16">
          <DashboardCTA />
        </div>
      </Container>
    </section>
  )
}
