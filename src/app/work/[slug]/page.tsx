import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Section, Container } from '@/components/ui'
import { FadeInSection, Counter } from '@/components/animations'
import { WorkCTA } from '@/components/WorkCTA'
import { sanityFetch, urlFor } from '@/sanity/client'
import { projectBySlugQuery, projectsQuery } from '@/sanity/queries'

interface Project {
  _id: string
  title: string
  slug: { current: string }
  client: string
  tagline: string
  heroImage: unknown
  metrics: { label: string; value: string; prefix?: string; suffix?: string }[]
  challenge: PortableTextBlock[]
  challengeImage: unknown
  approach: PortableTextBlock[]
  approachImages: unknown[]
  results: PortableTextBlock[]
  resultsImage: unknown
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const projects = await sanityFetch<{ slug: { current: string } }[]>({
    query: projectsQuery,
  })
  return projects.map((project) => ({ slug: project.slug.current }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await sanityFetch<Project | null>({
    query: projectBySlugQuery,
    params: { slug },
    defaultValue: null,
  })

  if (!project) return { title: 'Project Not Found | Obieo' }

  return {
    title: `${project.title} | Our Work | Obieo`,
    description: project.tagline,
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const project = await sanityFetch<Project | null>({
    query: projectBySlugQuery,
    params: { slug },
    tags: ['project'],
    defaultValue: null,
  })

  if (!project) notFound()

  // Dynamic JSON-LD Schema for Case Study
  const caseStudySchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: project.title,
    description: project.tagline,
    url: `https://obieo.com/work/${slug}`,
    author: {
      '@type': 'Organization',
      name: 'Obieo',
      url: 'https://obieo.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Obieo',
      url: 'https://obieo.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://obieo.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://obieo.com/work/${slug}`,
    },
  }

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudySchema) }}
      />

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
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl">
            {project.metrics?.map((metric, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="text-center md:text-left">
                  <p className="text-3xl md:text-4xl font-semibold text-[var(--accent)]">
                    <Counter value={parseFloat(metric.value)} prefix={metric.prefix} suffix={metric.suffix} />
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </Container>
      </Section>

      {/* Hero Image */}
      {project.heroImage && (
        <Section size="sm" className="py-0">
          <Container size="xl">
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <Image
                src={urlFor(project.heroImage).width(1400).url()}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Container>
        </Section>
      )}

      {/* Hero Image Placeholder if no image */}
      {!project.heroImage && (
        <Section size="sm" className="py-0">
          <Container size="xl">
            <div className="aspect-video bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border)]">
              <p className="text-[var(--text-muted)]">Hero Image</p>
            </div>
          </Container>
        </Section>
      )}

      {/* Challenge */}
      {project.challenge && project.challenge.length > 0 && (
        <Section>
          <Container size="md">
            <FadeInSection>
              <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                The Challenge
              </h2>
              <div className="prose prose-lg max-w-none text-[var(--text-secondary)] prose-p:text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)]">
                <PortableText value={project.challenge} />
              </div>
            </FadeInSection>
          </Container>
        </Section>
      )}

      {/* Challenge Image */}
      {project.challengeImage && (
        <Section size="sm" variant="alternate" className="py-12">
          <Container>
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={urlFor(project.challengeImage).width(1200).url()}
                alt="Before"
                fill
                className="object-cover"
              />
            </div>
          </Container>
        </Section>
      )}

      {/* Approach */}
      {project.approach && project.approach.length > 0 && (
        <Section variant="alternate">
          <Container size="md">
            <FadeInSection>
              <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                The Approach
              </h2>
              <div className="prose prose-lg max-w-none text-[var(--text-secondary)] prose-p:text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)]">
                <PortableText value={project.approach} />
              </div>
            </FadeInSection>
          </Container>
        </Section>
      )}

      {/* Approach Images */}
      {project.approachImages && project.approachImages.length > 0 && (
        <Section size="sm" className="py-12">
          <Container size="xl">
            <div className="grid md:grid-cols-2 gap-6">
              {project.approachImages.map((image, i) => (
                <FadeInSection key={i} delay={i * 0.1}>
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <Image
                      src={urlFor(image).width(800).url()}
                      alt={`Approach ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </FadeInSection>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Results */}
      {project.results && project.results.length > 0 && (
        <Section>
          <Container size="md">
            <FadeInSection>
              <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                The Results
              </h2>
              <div className="prose prose-lg max-w-none text-[var(--text-secondary)] prose-p:text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)]">
                <PortableText value={project.results} />
              </div>
            </FadeInSection>
          </Container>
        </Section>
      )}

      {/* Results Image */}
      {project.resultsImage && (
        <Section size="sm" className="py-12">
          <Container size="xl">
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <Image
                src={urlFor(project.resultsImage).width(1400).url()}
                alt="Final Design"
                fill
                className="object-cover"
              />
            </div>
          </Container>
        </Section>
      )}

      {/* CTA */}
      <WorkCTA />
    </>
  )
}
