'use client'

import Link from 'next/link'
import { Section, Container, Card, CardContent, Button } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

const services = [
  {
    title: 'SEO Launchpad',
    tag: 'One-Time',
    description: 'Get your SEO foundation right. Technical fixes, on-page optimization, and a website that Google actually wants to rank.',
    highlights: [
      'Full technical SEO audit & fixes',
      'On-page optimization',
      'Google Business Profile setup',
      'Website speed & mobile optimization',
    ],
    href: '/services#launchpad',
    featured: false,
  },
  {
    title: 'Local Dominance',
    tag: 'Monthly',
    description: 'Ongoing SEO that compounds. Monthly content, link building, and ranking improvements you can track.',
    highlights: [
      'Everything in Launchpad',
      'Monthly SEO content',
      'Local citation building',
      'Ranking & lead tracking',
    ],
    href: '/services#dominance',
    featured: true,
  },
]

export function ServicesOverview() {
  return (
    <Section variant="alternate">
      <Container>
        <FadeInSection className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            Two ways to work with us
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Whether you need a one-time fix or ongoing growth, we have a solution that fits.
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, i) => (
            <FadeInSection key={i} delay={i * 0.1}>
              <Card
                variant={service.featured ? 'elevated' : 'bordered'}
                className={`h-full ${service.featured ? 'ring-2 ring-[var(--accent)]' : ''}`}
              >
                <CardContent className="p-8">
                  {service.featured && (
                    <p className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider mb-4">
                      Most Popular
                    </p>
                  )}
                  <h3 className="text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-1">
                    {service.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] uppercase tracking-wide mb-4">
                    {service.tag}
                  </p>
                  <p className="text-[var(--text-secondary)] mb-6">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {service.highlights.map((highlight, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm">
                        <svg
                          className="w-5 h-5 text-[var(--accent)] flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-[var(--text-primary)]">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={service.href}>
                    <Button
                      variant={service.featured ? 'primary' : 'outline'}
                      className="w-full"
                    >
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </FadeInSection>
          ))}
        </div>
      </Container>
    </Section>
  )
}
