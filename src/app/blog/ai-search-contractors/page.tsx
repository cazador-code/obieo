import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

// JSON-LD Schema for SEO
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Why Your Competitors Will Be Invisible in 2 Years',
  description: 'AI is changing how homeowners find contractors. Most home service businesses have no idea. Here is your window to get ahead — with proof it works.',
  image: 'https://www.obieo.com/og-ai-search.jpg',
  datePublished: '2024-12-01',
  dateModified: '2024-12-01',
  author: {
    '@type': 'Person',
    name: 'Hunter Lapeyre',
    url: 'https://www.obieo.com/about',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Obieo',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.obieo.com/logo.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.obieo.com/blog/ai-search-contractors',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do AI search engines like ChatGPT affect home service businesses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI search engines are changing how homeowners find contractors. Instead of scrolling through Google results, users ask AI assistants for recommendations. Businesses optimized for AI visibility get recommended; those who are not become invisible.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is AEO (Answer Engine Optimization)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AEO is the practice of optimizing your website content to be recommended by AI assistants like ChatGPT, Perplexity, and Google AI Overviews. It focuses on structured data, clear answers, and factual density.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can contractors get visibility in AI search results?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Contractors can improve AI visibility by implementing schema markup, creating FAQ-rich content, ensuring consistent business information across platforms, and building third-party credibility through reviews and citations.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: "Why Your Competitors Will Be Invisible in 2 Years",
  description: "AI is changing how homeowners find contractors. Most home service businesses have no idea. Here's your window to get ahead — with proof it works.",
  alternates: {
    canonical: '/blog/ai-search-contractors',
  },
  openGraph: {
    title: 'Why Your Competitors Will Be Invisible in 2 Years',
    description: "The way homeowners find contractors is shifting from Google to AI. Here's how to position your business before competitors catch on.",
  },
}

// Editorial Components
function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="relative my-12 md:my-16 py-8 md:py-12">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--accent)] to-[var(--accent)]/20" />
      <div className="absolute -left-4 top-6 w-12 h-12 text-[var(--accent)]/10">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      <p className="pl-8 md:pl-12 text-2xl md:text-3xl lg:text-4xl font-[family-name:var(--font-display)] text-[var(--text-primary)] leading-snug font-medium">
        {children}
      </p>
    </blockquote>
  )
}

function KeyInsight({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="my-10 md:my-14 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10 border border-[var(--accent)]/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider">{title}</span>
        </div>
        <div className="text-lg md:text-xl text-[var(--text-primary)] leading-relaxed font-medium">
          {children}
        </div>
      </div>
    </div>
  )
}

function DataCard({
  label,
  value,
  subtext,
  variant = 'default'
}: {
  label: string
  value: string
  subtext?: string
  variant?: 'default' | 'highlight'
}) {
  const variantStyles = {
    default: 'bg-[var(--bg-secondary)] border-[var(--border)]',
    highlight: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30',
  }
  const valueStyles = {
    default: 'text-[var(--text-primary)]',
    highlight: 'text-emerald-600 dark:text-emerald-400',
  }
  return (
    <div className={`p-5 md:p-6 rounded-xl border ${variantStyles[variant]} transition-transform hover:scale-[1.02]`}>
      <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] ${valueStyles[variant]}`}>{value}</p>
      {subtext && <p className="text-sm text-[var(--text-secondary)] mt-2">{subtext}</p>}
    </div>
  )
}

function Paragraph({ children, lead = false }: { children: React.ReactNode; lead?: boolean }) {
  return (
    <p className={`${lead ? 'text-xl md:text-2xl leading-relaxed' : 'text-lg leading-relaxed'} text-[var(--text-secondary)] mb-6`}>
      {children}
    </p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mt-16 md:mt-20 mb-6 md:mb-8 relative">
      <span className="absolute -left-4 md:-left-6 top-0 bottom-0 w-1 bg-[var(--accent)]" />
      {children}
    </h2>
  )
}

function InlineLink({ href, external = false, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[var(--accent)] font-medium border-b-2 border-[var(--accent)]/30 hover:border-[var(--accent)] transition-colors"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </Link>
  )
}

export default function AISearchContractorsPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <Section size="lg" className="pt-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-20 right-0 w-[500px] h-[500px] text-[var(--accent)] opacity-[0.03]" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="currentColor" />
          </svg>
          <svg className="absolute -bottom-32 -left-32 w-96 h-96 text-[var(--accent)] opacity-[0.04]" viewBox="0 0 200 200">
            <rect x="20" y="20" width="160" height="160" rx="20" fill="currentColor" />
          </svg>
        </div>

        <Container size="md" className="relative">
          <FadeInSection>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8 group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--accent)] text-white uppercase tracking-wide">
                AI Search
              </span>
              <span className="text-sm text-[var(--text-muted)]">January 15, 2026</span>
              <span className="text-sm text-[var(--text-muted)]">•</span>
              <span className="text-sm text-[var(--text-muted)]">6 min read</span>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8 leading-[1.1]">
              Why Your Competitors Will Be Invisible in 2 Years
            </h1>
          </FadeInSection>

          <FadeInSection delay={0.3}>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              The way homeowners find contractors is changing. <strong className="text-[var(--text-primary)]">Most home service businesses have no idea.</strong> Here&apos;s your window to get ahead.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.4}>
            <div className="flex items-center gap-4 mt-10 pt-8 border-t border-[var(--border)]">
              <div className="w-14 h-14 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[var(--accent)]/20">
                HL
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Hunter Lapeyre</p>
                <p className="text-sm text-[var(--text-muted)]">Founder, Obieo & Lapeyre Roofing</p>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* Article Body */}
      <Section className="pt-8 md:pt-12">
        <Container size="md">
          <FadeInSection>
            <article>
              <Paragraph lead>
                When a homeowner needs a roofer, plumber, or HVAC company, they&apos;re increasingly asking AI instead of searching Google. ChatGPT. Perplexity. Google&apos;s AI Overviews. These tools don&apos;t show a list of ten results — they recommend specific companies.
              </Paragraph>

              <Paragraph>
                If you&apos;re not one of those recommended companies, you&apos;re invisible to a growing segment of homeowners. And that segment is growing fast.
              </Paragraph>

              <div className="grid md:grid-cols-2 gap-4 my-8">
                <DataCard
                  label="AI Search Growth"
                  value="52%"
                  subtext="Of Google searches now trigger AI Overviews"
                  variant="highlight"
                />
                <DataCard
                  label="By 2028"
                  value="-50%"
                  subtext="Predicted drop in traditional search traffic"
                />
              </div>

              <KeyInsight title="The Opportunity">
                Most contractors are still fighting over Google Ads. While they bid against each other for the same expensive clicks, smart businesses are positioning for the next wave of search — where AI recommends you by name.
              </KeyInsight>

              <SectionHeading>I Have Proof This Works</SectionHeading>

              <Paragraph>
                I don&apos;t just talk about this. I&apos;ve lived it.
              </Paragraph>

              <Paragraph>
                I run <InlineLink href="/work/lapeyre-roofing">Lapeyre Roofing</InlineLink> in Texas. Six weeks after optimizing our website for AI search, I asked Google Gemini a simple question:
              </Paragraph>

              <PullQuote>
                &quot;I need a roof replaced here in Austin, Texas. What are some companies I should call?&quot;
              </PullQuote>

              {/* Gemini Quote Card */}
              <div className="my-10 bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Google Gemini Response</span>
                </div>

                <div className="space-y-4 text-[var(--text-secondary)]">
                  <p className="font-medium text-[var(--text-primary)]">Community Favorites (Highly Mentioned on Reddit/Nextdoor)</p>
                  <p className="text-sm italic">Recent threads from Austin homeowners often highlight smaller or more specialized companies that excel at communication and insurance handling.</p>

                  <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-6 mt-4">
                    <p className="font-semibold text-[var(--text-primary)] text-lg mb-2">Lapeyre Roofing</p>
                    <p className="text-[var(--text-secondary)]">
                      Multiple recent discussions identify this company as a strong choice for insurance claim handling
                      (specifically with carriers like State Farm) and responsiveness. Users have noted them for being
                      a <strong className="text-[var(--text-primary)]">&quot;smaller company with good people&quot;</strong> and for
                      effective communication during the claims process.
                    </p>
                  </div>
                </div>
              </div>

              <Paragraph>
                Lapeyre Roofing showed up alongside <strong className="text-[var(--text-primary)]">companies that have been in business for 40-50 years</strong>. Kidd Roofing has been around since 1982. Ja-Mar has over 50 years of history. Wilson Roofing is another longtime Austin institution.
              </Paragraph>

              <Paragraph>
                We&apos;re competing with decades of brand recognition — and winning — because we optimized for how AI actually selects recommendations.
              </Paragraph>

              <SectionHeading>What This Means For Your Business</SectionHeading>

              <Paragraph>
                Right now, your competitors are spending thousands on Google Ads, fighting bidding wars that get more expensive every year. They&apos;re on aggregator sites like HomeAdvisor, competing with 3-5 other contractors for every lead.
              </Paragraph>

              <Paragraph>
                Meanwhile, AI search is quietly taking market share. And almost no one in your industry is paying attention.
              </Paragraph>

              <div className="my-10 p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4 font-[family-name:var(--font-display)]">
                  The First-Mover Window
                </h3>
                <ul className="space-y-4 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">•</span>
                    <span><strong className="text-[var(--text-primary)]">47% of businesses</strong> have no AI search strategy at all</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">•</span>
                    <span><strong className="text-[var(--text-primary)]">Only 0.3%</strong> of top websites have implemented the new llms.txt protocol</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">•</span>
                    <span>Your local competitors are almost certainly <strong className="text-[var(--text-primary)]">not thinking about this</strong></span>
                  </li>
                </ul>
              </div>

              <Paragraph>
                This is like 2008 when local SEO first became a thing. The contractors who figured it out early dominated their markets for a decade. The ones who waited are still playing catch-up.
              </Paragraph>

              <SectionHeading>Why AI Recommends Some Companies Over Others</SectionHeading>

              <Paragraph>
                AI doesn&apos;t just pull names from Google rankings. It looks at different signals:
              </Paragraph>

              <div className="my-10 p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <ul className="space-y-4 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">1.</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Community mentions</strong>
                      <p className="mt-1">What people say about you on Reddit, Nextdoor, and local forums matters more than you think. AI scans these for authentic recommendations.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">2.</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Reputation signals</strong>
                      <p className="mt-1">Reviews, BBB ratings, industry certifications. AI cross-references multiple sources to verify you&apos;re legit.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">3.</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Structured business information</strong>
                      <p className="mt-1">Clear, consistent details about your services, service area, and expertise. AI needs to understand what you do to recommend you.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">4.</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Fresh, authoritative content</strong>
                      <p className="mt-1">Content that demonstrates real expertise — case studies, specific examples, proof you know what you&apos;re talking about.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <Paragraph>
                The Gemini response that recommended Lapeyre Roofing specifically mentioned &quot;smaller company with good people&quot; and &quot;effective communication during the claims process.&quot; That language came directly from community discussions about our work.
              </Paragraph>

              <KeyInsight title="The Insight">
                AI search isn&apos;t about gaming an algorithm. It&apos;s about building a genuine reputation that AI can verify across multiple sources. Do good work, get people talking about it, and structure your business information so AI can find it.
              </KeyInsight>

              <SectionHeading>The Bottom Line</SectionHeading>

              <Paragraph>
                Optimizing for AI search is complex. It requires understanding how these systems work, what signals they look for, and how to position your business across multiple platforms.
              </Paragraph>

              <Paragraph>
                But here&apos;s what I know for certain: <strong className="text-[var(--text-primary)]">the businesses that figure this out now will have a massive head start</strong>. By the time your competitors realize AI search matters, you&apos;ll already be the company getting recommended.
              </Paragraph>

              <Paragraph>
                I&apos;ve done this for my own roofing company. I know what works because I&apos;ve tested it with real money on the line.
              </Paragraph>

              {/* Related Content */}
              <div className="my-16 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4 font-[family-name:var(--font-display)]">
                  Want the Full Technical Breakdown?
                </h3>
                <Paragraph>
                  This article covers the &quot;what&quot; and &quot;why.&quot; If you want to understand exactly how AI search works — the protocols, the citation patterns, the implementation details — read the complete guide:
                </Paragraph>
                <Link
                  href="/blog/generative-engine-optimization-guide"
                  className="inline-flex items-center gap-2 text-[var(--accent)] font-semibold hover:gap-3 transition-all"
                >
                  The Complete Guide to Generative Engine Optimization
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Author Box */}
              <div className="my-16 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-[var(--accent)]/20">
                    HL
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] text-lg">Hunter Lapeyre</p>
                    <p className="text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Hunter owns <InlineLink href="/">Obieo</InlineLink> (SEO and AI search optimization for home service businesses) and <InlineLink href="/work/lapeyre-roofing">Lapeyre Roofing</InlineLink>. Every strategy he recommends has been tested on his own business first.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </FadeInSection>
        </Container>
      </Section>

      {/* CTA */}
      <Section variant="alternate" className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-0 left-1/4 w-64 h-64 text-[var(--accent)] opacity-[0.05]" viewBox="0 0 200 200">
            <polygon points="100,10 190,190 10,190" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 right-1/4 w-48 h-48 text-[var(--accent)] opacity-[0.05]" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="currentColor" />
          </svg>
        </div>

        <Container size="md" className="relative">
          <FadeInSection>
            <div className="text-center">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-[var(--accent)] text-white mb-6">
                Free Strategy Call
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                Ready to Get Ahead of the AI Shift?
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto leading-relaxed">
                Let&apos;s talk about your business and whether AI search optimization makes sense for you. No pitch deck. No pressure. Just an honest conversation about the opportunity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/call"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-all hover:scale-105 shadow-lg shadow-[var(--accent)]/25"
                >
                  Book a Strategy Call
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-6">
                20 minutes. No strings attached.
              </p>
            </div>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}
