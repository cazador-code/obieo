import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

// JSON-LD Schema for Blog Index
const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'The Obieo Blog',
  description: 'Insights on SEO, lead generation, and growth strategies for home service businesses. Real tactics tested on our own roofing company.',
  url: 'https://www.obieo.com/blog',
  publisher: {
    '@type': 'Organization',
    name: 'Obieo',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.obieo.com/logo.png',
    },
  },
  blogPost: [
    {
      '@type': 'BlogPosting',
      headline: 'The Complete Guide to Generative Engine Optimization (GEO)',
      url: 'https://www.obieo.com/blog/generative-engine-optimization-guide',
      datePublished: '2025-01-15',
    },
    {
      '@type': 'BlogPosting',
      headline: 'Why Your Competitors Will Be Invisible in 2 Years',
      url: 'https://www.obieo.com/blog/ai-search-contractors',
      datePublished: '2024-12-01',
    },
    {
      '@type': 'BlogPosting',
      headline: 'Contractor Lead Generation: Why Your Home Service Business Is Stuck at $3 Million',
      url: 'https://www.obieo.com/blog/contractor-lead-generation-guide',
      datePublished: '2025-01-05',
    },
    {
      '@type': 'BlogPosting',
      headline: "ChatGPT Is Adding Ads. Here's What It Means for You",
      url: 'https://www.obieo.com/blog/chatgpt-ads',
      datePublished: '2025-01-10',
    },
  ],
}

// Static blog posts (for now, until Sanity is set up)
const posts = [
  {
    slug: 'generative-engine-optimization-guide',
    title: 'The Complete Guide to Generative Engine Optimization (GEO)',
    excerpt: "GEO is how you get cited by AI search engines like ChatGPT and Perplexity. Learn the llms.txt protocol, citation patterns, and implementation strategies that actually work.",
    publishedAt: '2026-01-15',
    category: 'AI Search',
    readTime: '15 min',
  },
  {
    slug: 'ai-search-contractors',
    title: 'Why Your Competitors Will Be Invisible in 2 Years',
    excerpt: "The way homeowners find contractors is shifting from Google to AI. Most home service businesses have no idea. Here's your window to get ahead — with proof it works.",
    publishedAt: '2026-01-15',
    category: 'AI Search',
    readTime: '6 min',
  },
  {
    slug: 'contractor-lead-generation-guide',
    title: 'Contractor Lead Generation: Why Your Home Service Business Is Stuck at $3 Million',
    excerpt: "Most home service businesses hit a wall between $1.5 and $3 million. The root cause? Where your leads come from. Learn the lead source hierarchy and how SEO compounds while PPC stays flat.",
    publishedAt: '2026-01-14',
    category: 'Lead Generation',
    readTime: '12 min',
  },
]

export const metadata: Metadata = {
  title: 'Blog — SEO & Lead Generation Insights',
  description: 'Insights on SEO, lead generation, and growth strategies for home service businesses. Real tactics tested on our own roofing company.',
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      {/* Hero */}
      <Section size="lg" className="pt-32 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-10 right-10 w-72 h-72 text-[var(--accent)] opacity-[0.03]" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-48 h-48 text-[var(--accent)] opacity-[0.05]" viewBox="0 0 200 200">
            <rect x="20" y="20" width="160" height="160" rx="20" fill="currentColor" />
          </svg>
        </div>

        <Container className="relative">
          <FadeInSection>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent)]/10 text-[var(--accent)] mb-6">
              From the Field
            </span>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
              The Obieo Blog
            </h1>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Insights on SEO, lead generation, and growth strategies for home service businesses.
              Real tactics tested on our own roofing company — not theory, results.
            </p>
          </FadeInSection>
        </Container>
      </Section>

      {/* Featured Post */}
      {posts.length > 0 && (
        <Section className="pt-0">
          <Container>
            <FadeInSection delay={0.3}>
              <Link
                href={`/blog/${posts[0].slug}`}
                className="group block"
              >
                <article className="relative rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all hover:shadow-xl hover:shadow-[var(--accent)]/5">
                  <div className="grid lg:grid-cols-2 gap-0">
                    {/* Image placeholder with gradient */}
                    <div className="relative aspect-[4/3] lg:aspect-auto bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">Lead Generation Guide</p>
                      </div>
                      {/* Decorative corner */}
                      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[var(--accent)]/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)]">
                          {posts[0].category}
                        </span>
                        <span className="text-sm text-[var(--text-muted)]">{posts[0].readTime} read</span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-4 leading-tight">
                        {posts[0].title}
                      </h2>

                      <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                        {posts[0].excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-semibold text-sm">
                            HL
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">Hunter Lapeyre</p>
                            <time className="text-xs text-[var(--text-muted)]">
                              {new Date(posts[0].publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </time>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] group-hover:gap-3 transition-all">
                          Read article
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </FadeInSection>
          </Container>
        </Section>
      )}

      {/* Newsletter CTA */}
      <Section variant="alternate">
        <Container size="md">
          <FadeInSection>
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                More articles coming soon
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
                We&apos;re writing guides on SEO, local marketing, and growth strategies for contractors. Want early access?
              </p>
              <Link
                href="/call"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-all hover:scale-105 shadow-lg shadow-[var(--accent)]/20"
              >
                Book a Strategy Call
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}
