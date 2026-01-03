import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection } from '@/components/animations'
import { sanityFetch, urlFor } from '@/sanity/client'
import { projectsQuery, featuredProjectQuery } from '@/sanity/queries'

export const metadata: Metadata = {
  title: 'Our Work | Obieo',
  description: 'See how we help home service businesses grow with websites that convert.',
}

interface Project {
  _id: string
  title: string
  slug: { current: string }
  client: string
  tagline: string
  excerpt: string
  thumbnail: unknown
  heroImage: unknown
  metrics: { label: string; value: string; prefix?: string; suffix?: string }[]
  featured: boolean
}

export default async function WorkPage() {
  const [featuredProject, projects] = await Promise.all([
    sanityFetch<Project | null>({ query: featuredProjectQuery, tags: ['project'] }),
    sanityFetch<Project[]>({ query: projectsQuery, tags: ['project'] }),
  ])

  const otherProjects = projects.filter((p) => !p.featured)

  return (
    <>
      {/* Hero */}
      <Section size="lg" className="pt-32">
        <Container>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
            Our Work
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl">
            Results that speak for themselves.
          </p>
        </Container>
      </Section>

      {/* Featured Project */}
      {featuredProject && (
        <Section variant="alternate">
          <Container>
            <FadeInSection>
              <Link href={`/work/${featuredProject.slug.current}`}>
                <div className="bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border)] hover:shadow-xl transition-shadow" data-cursor="view">
                  <div className="grid lg:grid-cols-2 gap-0">
                    <div className="p-8 md:p-12 lg:p-16">
                      <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider mb-3">
                        Featured Case Study
                      </p>
                      <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                        {featuredProject.title}
                      </h2>
                      <p className="text-lg text-[var(--text-secondary)] mb-8">
                        {featuredProject.tagline}
                      </p>
                      <div className="flex flex-wrap gap-8 mb-8">
                        {featuredProject.metrics?.map((metric, i) => (
                          <div key={i}>
                            <p className="text-3xl font-semibold text-[var(--accent)]">
                              {metric.prefix}{metric.value}{metric.suffix}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
                          </div>
                        ))}
                      </div>
                      <Button>View Case Study</Button>
                    </div>
                    <div className="relative aspect-square lg:aspect-auto bg-[var(--bg-secondary)]">
                      {featuredProject.heroImage ? (
                        <Image
                          src={urlFor(featuredProject.heroImage).width(800).url()}
                          alt={featuredProject.title}
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
              </Link>
            </FadeInSection>
          </Container>
        </Section>
      )}

      {/* Fallback if no featured project */}
      {!featuredProject && (
        <Section variant="alternate">
          <Container>
            <div className="bg-[var(--bg-card)] rounded-2xl p-8 md:p-12 border border-[var(--border)] text-center">
              <p className="text-[var(--text-secondary)]">
                Featured case study coming soon...
              </p>
            </div>
          </Container>
        </Section>
      )}

      {/* Other Projects Grid */}
      {otherProjects.length > 0 && (
        <Section>
          <Container>
            <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8">
              More Projects
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherProjects.map((project) => (
                <FadeInSection key={project._id}>
                  <Link href={`/work/${project.slug.current}`}>
                    <div className="group" data-cursor="view">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg-secondary)] mb-4">
                        {project.thumbnail ? (
                          <Image
                            src={urlFor(project.thumbnail).width(600).url()}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-[var(--text-muted)]">Coming Soon</p>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{project.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{project.tagline}</p>
                    </div>
                  </Link>
                </FadeInSection>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Empty state for other projects */}
      {otherProjects.length === 0 && featuredProject && (
        <Section>
          <Container>
            <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8">
              More Projects
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center border border-[var(--border)]"
                >
                  <p className="text-[var(--text-muted)]">Coming Soon</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* CTA */}
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
            <Link href="/contact">
              <Button variant="outline" size="lg">Book a Call</Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
