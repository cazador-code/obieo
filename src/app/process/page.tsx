import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection } from '@/components/animations'
import CalendlyButton from '@/components/CalendlyButton'

export const metadata: Metadata = {
  title: 'Our Process | Obieo',
  description:
    'From discovery to launch in 30 days. Learn how Obieo builds SEO-optimized websites that generate leads for home service businesses.',
}

const processSteps = [
  {
    number: '01',
    title: 'Discovery',
    subtitle: 'Understanding Your Business',
    duration: 'Week 1',
    description:
      'We start with a strategy call to understand your business, your market, and your goals. No cookie-cutter solutions—every website we build is tailored to your specific service area and customer base.',
    deliverables: [
      'Competitor analysis for your service area',
      'Keyword research for your services',
      'Content strategy and sitemap',
      'Clear project timeline',
    ],
  },
  {
    number: '02',
    title: 'Build',
    subtitle: 'Design & Development',
    duration: 'Weeks 2-3',
    description:
      'We design and build your website with SEO baked in from the start. Fast-loading, mobile-first, and conversion-optimized. You\'ll see progress throughout—not just at the end.',
    deliverables: [
      'Custom design tailored to your brand',
      'Mobile-responsive development',
      'SEO-optimized page structure',
      'Contact forms and CTAs that convert',
    ],
  },
  {
    number: '03',
    title: 'Launch',
    subtitle: 'Go Live & Optimize',
    duration: 'Week 4',
    description:
      'Your new website goes live with all the technical SEO foundations in place. We handle the migration, set up analytics, and ensure Google can properly crawl and index your pages.',
    deliverables: [
      'Google Business Profile optimization',
      'Google Analytics & Search Console setup',
      'Technical SEO implementation',
      'Local schema markup',
    ],
  },
  {
    number: '04',
    title: 'Grow',
    subtitle: 'Results & Iteration',
    duration: 'Ongoing',
    description:
      'SEO is a marathon, not a sprint. We monitor your rankings, track your leads, and continuously optimize. Monthly reports show exactly what\'s working and what\'s next.',
    deliverables: [
      'Monthly performance reports',
      'Ranking and traffic monitoring',
      'Content updates and optimization',
      'Direct access to your team',
    ],
  },
]

export default function ProcessPage() {
  return (
    <>
      {/* Hero */}
      <Section size="lg" className="pt-32 pb-16">
        <Container>
          <FadeInSection>
            <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider mb-4">
              How We Work
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6 max-w-4xl">
              From discovery to launch
              <br />
              <span className="text-[var(--accent)]">in 30 days.</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl">
              No bloated timelines. No endless revisions. Just a clear, proven process
              that gets your business ranking and generating leads.
            </p>
          </FadeInSection>
        </Container>
      </Section>

      {/* Process Timeline */}
      <Section className="pb-0">
        <Container>
          <div className="relative">
            {/* Timeline connector line - visible on desktop */}
            <div className="hidden lg:block absolute left-[72px] top-0 bottom-0 w-px bg-gradient-to-b from-[var(--accent)] via-[var(--border)] to-transparent" />

            {processSteps.map((step, index) => (
              <FadeInSection key={step.number} delay={index * 0.1}>
                <div className="relative grid lg:grid-cols-[144px_1fr] gap-8 mb-20 last:mb-0">
                  {/* Step Number */}
                  <div className="relative">
                    <div className="lg:sticky lg:top-32">
                      <span className="text-7xl md:text-8xl font-bold font-[family-name:var(--font-display)] text-[var(--accent)] opacity-20 select-none">
                        {step.number}
                      </span>
                      {/* Timeline dot */}
                      <div className="hidden lg:block absolute left-[68px] top-10 w-2 h-2 rounded-full bg-[var(--accent)]" />
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8 md:p-10 hover:shadow-lg transition-shadow">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="px-3 py-1 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] rounded-full">
                        {step.duration}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-2">
                      {step.title}
                    </h2>
                    <p className="text-lg text-[var(--accent)] mb-4">
                      {step.subtitle}
                    </p>
                    <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Deliverables */}
                    <div className="border-t border-[var(--border)] pt-6">
                      <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
                        What You Get
                      </p>
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {step.deliverables.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <svg
                              className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5"
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
                            <span className="text-[var(--text-secondary)] text-sm">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </Container>
      </Section>

      {/* What Makes Us Different */}
      <Section variant="alternate">
        <Container>
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                Why This Works
              </h2>
              <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                Most agencies overcomplicate things. We don&apos;t.
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'No Retainers',
                description:
                  'Pay for what you need, when you need it. No bloated monthly fees for maintenance you don\'t use.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ),
              },
              {
                title: 'You Own Everything',
                description:
                  'Your website, your domain, your content, your analytics. Leave anytime with everything you paid for.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                ),
              },
              {
                title: 'Direct Communication',
                description:
                  'Text, call, or email. No account managers, no ticket systems. Talk directly to the person building your site.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                ),
              },
            ].map((item, index) => (
              <FadeInSection key={index} delay={index * 0.1}>
                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 h-full">
                  <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-[var(--accent)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    {item.description}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section>
        <Container className="text-center">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              Book a free strategy call. We&apos;ll review your current site, analyze your competition,
              and show you exactly how to start ranking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CalendlyButton className="inline-flex items-center justify-center px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-all">
                Book Your Strategy Call
              </CalendlyButton>
              <Link href="/work">
                <Button variant="outline" size="lg">
                  See Our Results
                </Button>
              </Link>
            </div>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}
