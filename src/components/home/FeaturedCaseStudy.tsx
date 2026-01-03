'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection, Counter } from '@/components/animations'

interface Metric {
  label: string
  value: number
  prefix?: string
  suffix?: string
}

interface FeaturedCaseStudyProps {
  title: string
  client: string
  tagline: string
  metrics: Metric[]
  slug: string
  image?: string
}

export function FeaturedCaseStudy({
  title,
  tagline,
  metrics,
  slug,
  image,
}: FeaturedCaseStudyProps) {
  return (
    <Section variant="alternate">
      <Container>
        <FadeInSection>
          <div className="bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border)]">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Content */}
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider mb-3">
                  Featured Case Study
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                  {title}
                </h2>
                <p className="text-lg text-[var(--text-secondary)] mb-8">
                  {tagline}
                </p>

                {/* Metrics */}
                <div className="flex flex-wrap gap-8 mb-8">
                  {metrics.map((metric, i) => (
                    <div key={i}>
                      <p className="text-3xl md:text-4xl font-semibold text-[var(--accent)]">
                        <Counter
                          value={metric.value}
                          prefix={metric.prefix}
                          suffix={metric.suffix}
                        />
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>

                <Link href={`/work/${slug}`} className="inline-block">
                  <Button>View Case Study</Button>
                </Link>
              </div>

              {/* Image */}
              <div className="relative aspect-square lg:aspect-auto bg-[var(--bg-secondary)]">
                {image ? (
                  <Image
                    src={image}
                    alt={`${title} project screenshot`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-[var(--text-muted)]">Project Image</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeInSection>
      </Container>
    </Section>
  )
}
