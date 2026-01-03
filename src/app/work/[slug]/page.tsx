import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section, Container, Button } from '@/components/ui'

// Temporary static data until Sanity is connected
const projects: Record<string, {
  title: string
  client: string
  tagline: string
  metrics: { label: string; value: string; prefix?: string; suffix?: string }[]
  challenge: string
  approach: string
  results: string
}> = {
  'lapeyre-roofing': {
    title: 'Lapeyre Roofing',
    client: 'Lapeyre Roofing',
    tagline: 'From invisible online to the top roofer in Baton Rouge.',
    metrics: [
      { label: 'Organic Leads', value: '147', prefix: '+', suffix: '%' },
      { label: 'Google Ranking', value: '1', prefix: '#' },
      { label: 'Load Time', value: '1.1', suffix: 's' },
    ],
    challenge: `Lapeyre Roofing had been serving the Baton Rouge area for years, but their online presence didn't reflect the quality of their work. Their outdated website was slow, not mobile-friendly, and invisible on Google. They were losing potential customers to competitors with better digital presence.`,
    approach: `We started with a complete audit of their competitive landscape and identified key opportunities. Then we designed and built a new website focused on conversion: clear calls-to-action, trust signals, and local SEO optimization. Every page was crafted to turn visitors into leads.`,
    results: `Within 6 months, Lapeyre Roofing went from page 3 to #1 on Google for their key local search terms. Organic leads increased by 147%, and the new site loads in under 1.2 seconds. Most importantly, they're now booking more quality jobs than ever.`,
  },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = projects[slug]

  if (!project) {
    return { title: 'Project Not Found | Obieo' }
  }

  return {
    title: `${project.title} | Our Work | Obieo`,
    description: project.tagline,
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const project = projects[slug]

  if (!project) {
    notFound()
  }

  return (
    <>
      {/* Hero */}
      <Section size="lg" className="pt-32">
        <Container>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Work
          </Link>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            {project.title}
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 max-w-3xl">
            {project.tagline}
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl">
            {project.metrics.map((metric, i) => (
              <div key={i} className="text-center md:text-left">
                <p className="text-3xl md:text-4xl font-semibold text-[var(--accent)]">
                  {metric.prefix}{metric.value}{metric.suffix}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Hero Image Placeholder */}
      <Section size="sm" className="py-0">
        <Container size="xl">
          <div className="aspect-video bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border)]">
            <p className="text-[var(--text-muted)]">Hero Image</p>
          </div>
        </Container>
      </Section>

      {/* The Challenge */}
      <Section>
        <Container size="md">
          <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
            The Challenge
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            {project.challenge}
          </p>
        </Container>
      </Section>

      {/* Before Image Placeholder */}
      <Section size="sm" variant="alternate" className="py-12">
        <Container>
          <div className="aspect-video bg-[var(--bg-card)] rounded-xl flex items-center justify-center border border-[var(--border)]">
            <p className="text-[var(--text-muted)]">Before Screenshot</p>
          </div>
        </Container>
      </Section>

      {/* The Approach */}
      <Section>
        <Container size="md">
          <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
            The Approach
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            {project.approach}
          </p>
        </Container>
      </Section>

      {/* The Results */}
      <Section variant="alternate">
        <Container size="md">
          <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
            The Results
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            {project.results}
          </p>
        </Container>
      </Section>

      {/* After Image Placeholder */}
      <Section size="sm" className="py-12">
        <Container size="xl">
          <div className="aspect-video bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border)]">
            <p className="text-[var(--text-muted)]">After Screenshot / Final Design</p>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section variant="alternate">
        <Container className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            Ready to get results like this?
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Let's talk about transforming your online presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz">
              <Button size="lg">Get Your Free Website Score</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Book a Call</Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
