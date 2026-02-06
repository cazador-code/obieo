import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

// JSON-LD Schemas
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'AI SEO Agency | AI-Powered Search Optimization',
  description: 'Obieo is an AI SEO agency that helps home service businesses get found in AI search results, Google AI Overviews, ChatGPT, and Perplexity through GEO and AEO optimization.',
  image: 'https://www.obieo.com/og-ai-seo.jpg',
  datePublished: '2026-02-06',
  dateModified: '2026-02-06',
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
    '@id': 'https://www.obieo.com/ai-seo',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI SEO Services',
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://www.obieo.com',
  },
  description: 'AI-powered search optimization services including Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), AI content optimization, and technical SEO for home service businesses.',
  serviceType: 'AI Search Engine Optimization',
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'AI SEO Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI Content Optimization',
          description: 'Restructure website content for AI citation and visibility in AI-generated search results.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Generative Engine Optimization (GEO)',
          description: 'Optimize your business to be cited by ChatGPT, Perplexity, Google AI Overviews, and other AI search engines.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Answer Engine Optimization (AEO)',
          description: 'Structure content to appear in featured snippets, voice search results, and AI-generated answers.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Technical SEO for AI',
          description: 'Schema markup, llms.txt implementation, structured data, and site architecture optimization for AI crawlers.',
        },
      },
    ],
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is an AI SEO agency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An AI SEO agency specializes in optimizing websites for AI-powered search platforms like Google AI Overviews, ChatGPT, and Perplexity. Unlike traditional SEO agencies that focus solely on keyword rankings, an AI SEO agency uses Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) to ensure your business gets cited in AI-generated answers.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is AI SEO different from traditional SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Traditional SEO optimizes for blue-link rankings using keywords, backlinks, and on-page factors. AI SEO goes further by optimizing for citation in AI-generated responses. This includes structuring content for factual density, implementing schema markup for AI comprehension, building entity authority across platforms, and creating quotable definitions that AI systems prefer to reference.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does AI SEO cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI SEO services from Obieo start at custom pricing based on your business size, competition level, and goals. Most home service businesses invest between $1,500 and $5,000 per month for comprehensive AI SEO that includes GEO, AEO, technical SEO, and ongoing content optimization. Book a free strategy call to get a custom quote.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to see results from AI SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most businesses see initial AI visibility improvements within 4-8 weeks. Obieo achieved AI search citations for Lapeyre Roofing within 6 weeks of implementing GEO strategies. Full results, including consistent AI citations and measurable traffic from AI platforms, typically develop over 3-6 months depending on your industry competition and starting position.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I still need traditional SEO if I invest in AI SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. AI SEO and traditional SEO are complementary, not competing strategies. Research shows that 76% of Google AI Overview citations come from pages already ranking in the top 10. Strong traditional SEO provides the foundation that AI systems trust. An AI SEO agency like Obieo builds on your existing SEO foundation to capture traffic from both traditional and AI-powered search.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which AI search platforms does Obieo optimize for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Obieo optimizes for all major AI search platforms including Google AI Overviews (which appear in over 50% of Google searches), ChatGPT (which drives 87% of all AI referral traffic), Perplexity AI, Google Gemini, Microsoft Copilot, and Claude. Each platform has different citation patterns, and Obieo tailors strategies for maximum visibility across all of them.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why should home service businesses care about AI SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Home service businesses are uniquely positioned to benefit from AI SEO because local recommendations are among the most common AI search queries. When someone asks ChatGPT or Google AI for "best plumber near me" or "reliable roofer in Austin," AI systems pull from structured business data, reviews, and authoritative content. Businesses optimized for AI search appear in these recommendations while competitors remain invisible.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'AI SEO Agency | AI-Powered Search Optimization | Obieo',
  description: 'Obieo is an AI SEO agency helping home service businesses get found in ChatGPT, Google AI Overviews, and Perplexity. AI-first SEO strategies that drive real leads.',
  alternates: {
    canonical: '/ai-seo',
  },
  openGraph: {
    title: 'AI SEO Agency | AI-Powered Search Optimization | Obieo',
    description: 'AI Overviews appear in 50%+ of Google searches. Is your business visible? Obieo is the AI SEO company built to get home service businesses cited by AI.',
    url: 'https://www.obieo.com/ai-seo',
    type: 'website',
  },
}

export default function AISEOPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <Section size="lg" className="pt-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-20 right-0 w-[500px] h-[500px] text-[var(--accent)] opacity-[0.03]" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="currentColor" />
          </svg>
          <svg className="absolute -bottom-32 -left-32 w-96 h-96 text-[var(--accent)] opacity-[0.04]" viewBox="0 0 200 200">
            <rect x="20" y="20" width="160" height="160" rx="20" fill="currentColor" />
          </svg>
        </div>

        <Container size="lg" className="relative">
          <FadeInSection>
            <div className="max-w-4xl">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-[var(--accent)] text-white uppercase tracking-wide mb-6">
                AI-First SEO Agency
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6 leading-[1.1]">
                AI SEO Agency for Modern Search
              </h1>
              <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-3xl mb-8">
                Google AI Overviews now appear in over 50% of searches. ChatGPT drives 87% of AI referral traffic. <strong className="text-[var(--text-primary)]">If your business isn&apos;t optimized for AI search, you&apos;re already losing leads to competitors who are.</strong>
              </p>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mb-10">
                Obieo is an AI SEO company that helps home service businesses get cited by AI search engines — not just ranked in traditional results. We combine Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), and proven technical SEO into a strategy built for how people actually search today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/call"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-all hover:scale-105 shadow-lg shadow-[var(--accent)]/25"
                >
                  Get Your Free AI Visibility Audit
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/quiz"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-[var(--border)] text-[var(--text-primary)] font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                >
                  Take the AI Visibility Quiz
                </Link>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* What is AI SEO */}
      <Section variant="alternate">
        <Container size="lg">
          <FadeInSection>
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                What Is AI SEO?
              </h2>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                <strong className="text-[var(--text-primary)]">AI SEO is the practice of optimizing your website and online presence to be discovered, cited, and recommended by AI-powered search engines.</strong> This includes Google AI Overviews, ChatGPT, Perplexity, Google Gemini, Microsoft Copilot, and other AI platforms that generate answers instead of just listing links.
              </p>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                Traditional SEO focuses on ranking in the &quot;10 blue links.&quot; AI SEO goes further. It ensures your business becomes the source that AI systems pull from when generating answers to user queries. When a homeowner asks ChatGPT &quot;Who is the best plumber in Dallas?&quot; or Google AI Overview summarizes &quot;top-rated roofers near me,&quot; AI SEO determines whether your business appears in that answer — or gets skipped entirely.
              </p>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
                An AI SEO agency like Obieo uses three interconnected disciplines to achieve this visibility: Generative Engine Optimization (GEO) for AI citation, Answer Engine Optimization (AEO) for featured snippets and voice search, and technical SEO for the structured data that AI systems rely on to understand and trust your business.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-5 md:p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] transition-transform hover:scale-[1.02]">
                  <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">Traditional SEO</p>
                  <p className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--text-primary)]">Rank #1</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">Appear at the top of search result links</p>
                </div>
                <div className="p-5 md:p-6 rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 transition-transform hover:scale-[1.02]">
                  <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">AI SEO (GEO)</p>
                  <p className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-emerald-600 dark:text-emerald-400">Get Cited</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">Be the source AI pulls from for answers</p>
                </div>
                <div className="p-5 md:p-6 rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 transition-transform hover:scale-[1.02]">
                  <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">AI SEO (AEO)</p>
                  <p className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-emerald-600 dark:text-emerald-400">Be the Answer</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">Own featured snippets and voice results</p>
                </div>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* The AI Search Revolution */}
      <Section>
        <Container size="lg">
          <FadeInSection>
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                The AI Search Revolution: Why You Need an AI SEO Agency Now
              </h2>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                Search is undergoing the biggest transformation since Google replaced the Yellow Pages. AI-generated answers are replacing traditional search results, and the shift is accelerating faster than most businesses realize.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
                <div className="p-5 md:p-6 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 transition-transform hover:scale-[1.02]">
                  <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">AI Overviews</p>
                  <p className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-amber-600 dark:text-amber-400">50%+</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">Of Google searches show AI Overviews</p>
                </div>
                <div className="p-5 md:p-6 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 transition-transform hover:scale-[1.02]">
                  <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">ChatGPT Traffic</p>
                  <p className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-amber-600 dark:text-amber-400">87%</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">Of AI referral traffic from OpenAI</p>
                </div>
                <div className="p-5 md:p-6 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 transition-transform hover:scale-[1.02]">
                  <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">Traffic Decline</p>
                  <p className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-amber-600 dark:text-amber-400">-50%</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">Predicted organic traffic drop by 2028 (Gartner)</p>
                </div>
                <div className="p-5 md:p-6 rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 transition-transform hover:scale-[1.02]">
                  <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">GEO-Ready Brands</p>
                  <p className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-emerald-600 dark:text-emerald-400">53%</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">Still lack a deliberate AI search strategy</p>
                </div>
              </div>

              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                These numbers tell a clear story: AI search is not a future trend. It is the present reality. ChatGPT, Perplexity, and Google Gemini collectively handle millions of queries every day that previously went through traditional Google search. Users are asking these AI platforms for local business recommendations, service comparisons, and purchasing decisions.
              </p>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                For home service businesses, this shift is especially critical. &quot;Best electrician near me,&quot; &quot;reliable HVAC company in Houston,&quot; and &quot;top-rated plumber for emergency repairs&quot; are exactly the types of queries that AI platforms now answer directly. If your business is not optimized for these AI responses, you are invisible to a growing segment of potential customers.
              </p>

              <div className="my-10 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10 border border-[var(--accent)]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider">The Opportunity</span>
                  </div>
                  <div className="text-lg md:text-xl text-[var(--text-primary)] leading-relaxed font-medium">
                    Traditional SEO is not enough anymore. Businesses that invest in AI SEO now will capture the traffic, leads, and customers that their competitors lose as AI search continues to grow. The early-mover advantage window is open — but closing fast.
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* Obieo's AI-First Approach */}
      <Section variant="alternate">
        <Container size="lg">
          <FadeInSection>
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                Obieo&apos;s AI-First Approach to SEO
              </h2>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                Most SEO agencies bolt AI tactics onto outdated playbooks. Obieo was built from the ground up as an AI SEO company. Every strategy we deploy is designed for how search works today — and where it is heading tomorrow.
              </p>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                Our founder, Hunter Lapeyre, also owns <Link href="/work/lapeyre-roofing" className="text-[var(--accent)] font-medium border-b-2 border-[var(--accent)]/30 hover:border-[var(--accent)] transition-colors">Lapeyre Roofing</Link> in Austin, Texas. Every AI SEO strategy we recommend has been tested on a real home service business first. Within 6 weeks of implementing GEO optimization, Lapeyre Roofing appeared alongside 50-year-old incumbent companies in Google Gemini&apos;s roofing recommendations for Austin.
              </p>

              <h3 className="text-xl md:text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mt-12 mb-4">
                Generative Engine Optimization (GEO)
              </h3>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                GEO is the practice of optimizing your content to be cited by AI-powered search engines. When ChatGPT, Perplexity, or Google AI Overviews generate an answer, they pull information from sources they deem authoritative, factually dense, and well-structured. GEO ensures your business is one of those sources.
              </p>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                Our GEO process includes creating quotable definitions AI systems prefer to reference, building factual density with specific statistics and verifiable claims, implementing <code className="px-2 py-1 bg-[var(--bg-primary)] rounded text-sm font-mono">llms.txt</code> to help AI crawlers understand your site, and optimizing your entity profile across platforms like Google Business Profile, directories, and review sites.
              </p>

              <h3 className="text-xl md:text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mt-12 mb-4">
                Answer Engine Optimization (AEO)
              </h3>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                AEO targets a specific outcome: making your content the direct answer to search queries. This covers Google featured snippets, &quot;People Also Ask&quot; boxes, voice search results from Google Assistant and Siri, and the concise answers AI platforms extract when users ask specific questions.
              </p>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                For home service businesses, AEO is especially valuable for high-intent queries. When someone searches &quot;how much does a roof replacement cost in Texas?&quot; or &quot;what to do if your pipes freeze,&quot; AEO positions your business as the authoritative answer — building trust before the customer even visits your website.
              </p>

              <h3 className="text-xl md:text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mt-12 mb-4">
                AI-Optimized Technical SEO
              </h3>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                The technical foundation of AI SEO is structured data. AI search engines rely on schema markup, clean site architecture, and machine-readable content to understand what your business does, where you operate, and why you are trustworthy.
              </p>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                Our technical SEO process includes implementing comprehensive schema markup (LocalBusiness, Service, FAQ, Review, and Organization schemas), creating llms.txt files for AI crawler comprehension, optimizing page speed and Core Web Vitals for the crawl-heavy AI indexing process, and building clean internal linking structures that help AI systems map your service areas and expertise.
              </p>

              <h3 className="text-xl md:text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mt-12 mb-4">
                AI Citation Optimization
              </h3>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                Different AI platforms cite different sources. ChatGPT favors Wikipedia and established news sources, with 47.9% of its citations coming from Wikipedia. Perplexity relies heavily on Reddit and community discussions, with 46.7% of citations from Reddit threads. Google AI Overviews predominantly cite pages already ranking in its top 10 results.
              </p>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                Obieo builds a multi-platform citation strategy that accounts for these differences. We optimize your website content for Google AI Overviews, build your community presence for Perplexity, and strengthen your entity authority for ChatGPT — ensuring no AI platform is left uncovered.
              </p>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* Services Section */}
      <Section>
        <Container size="lg">
          <FadeInSection>
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                AI SEO Services
              </h2>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-10">
                Every AI SEO engagement is customized to your business, market, and goals. Here is what our core services include.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 md:p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--accent)]/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-3">AI Content Optimization</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                  We restructure your existing website content to maximize AI citation potential. This means leading with clear definitions, adding factual density with specific statistics, creating quotable paragraphs, and formatting content for easy AI extraction.
                </p>
                <ul className="space-y-2 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>Content audit and AI readiness scoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>Quotable definition creation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>FAQ content development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>Ongoing content optimization</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 md:p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--accent)]/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-3">Generative Engine Optimization</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                  Full GEO implementation to get your business cited by ChatGPT, Perplexity, Google AI Overviews, and other AI search platforms. We build the authority signals that AI systems trust and reference.
                </p>
                <ul className="space-y-2 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>llms.txt implementation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>Entity authority building</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>Multi-platform citation strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>AI visibility monitoring</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 md:p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--accent)]/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-3">Answer Engine Optimization</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                  Position your business as the direct answer to high-intent search queries. We optimize for featured snippets, People Also Ask boxes, voice search, and the concise answers AI systems extract.
                </p>
                <ul className="space-y-2 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>Featured snippet targeting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>People Also Ask optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>Voice search readiness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>FAQ schema implementation</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 md:p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--accent)]/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-3">Technical SEO for AI</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                  Build the technical foundation AI search engines need to understand, trust, and cite your business. From schema markup to site architecture, we handle the infrastructure that makes AI optimization possible.
                </p>
                <ul className="space-y-2 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>Comprehensive schema markup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>Core Web Vitals optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>Site architecture for AI crawlers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-1 text-sm">&#10003;</span>
                    <span>Structured data validation</span>
                  </li>
                </ul>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* Why Choose an AI SEO Agency */}
      <Section variant="alternate">
        <Container size="lg">
          <FadeInSection>
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                Why Choose an AI SEO Agency Over a Traditional SEO Company?
              </h2>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                Traditional SEO agencies are built around a playbook that is becoming less effective every month: keyword research, backlink building, and on-page optimization. These tactics still matter, but they are no longer sufficient on their own. Here is why an AI SEO agency delivers better results in today&apos;s search landscape.
              </p>

              <div className="my-8 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[var(--border)]">
                      <th className="py-4 pr-6 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Factor</th>
                      <th className="py-4 pr-6 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Traditional SEO Agency</th>
                      <th className="py-4 text-sm font-bold uppercase tracking-wider text-[var(--accent)]">AI SEO Agency (Obieo)</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--text-secondary)]">
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-4 pr-6 font-medium text-[var(--text-primary)]">Search Coverage</td>
                      <td className="py-4 pr-6">Google organic only</td>
                      <td className="py-4">Google + AI Overviews + ChatGPT + Perplexity + Gemini</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-4 pr-6 font-medium text-[var(--text-primary)]">Content Strategy</td>
                      <td className="py-4 pr-6">Keyword-focused articles</td>
                      <td className="py-4">Citation-optimized, factually dense, AI-quotable content</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-4 pr-6 font-medium text-[var(--text-primary)]">Technical Focus</td>
                      <td className="py-4 pr-6">Page speed, meta tags</td>
                      <td className="py-4">Schema markup, llms.txt, AI crawler optimization</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-4 pr-6 font-medium text-[var(--text-primary)]">Authority Building</td>
                      <td className="py-4 pr-6">Backlink outreach</td>
                      <td className="py-4">Entity authority across search, AI platforms, and communities</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-4 pr-6 font-medium text-[var(--text-primary)]">Measurement</td>
                      <td className="py-4 pr-6">Rankings and traffic</td>
                      <td className="py-4">AI citations, brand mentions in AI responses, and traffic</td>
                    </tr>
                    <tr>
                      <td className="py-4 pr-6 font-medium text-[var(--text-primary)]">Future-Proofing</td>
                      <td className="py-4 pr-6">Reacts to algorithm updates</td>
                      <td className="py-4">Proactively positions for AI search growth</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                An AI SEO company like Obieo does not abandon traditional SEO — we build on it. Research shows that 76.1% of Google AI Overview citations also rank in the top 10 organic results. Strong traditional SEO provides the foundation that AI systems trust. The difference is that we take it further, optimizing across every platform where your customers are searching.
              </p>

              <div className="my-10 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10 border border-[var(--accent)]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider">Why Obieo</span>
                  </div>
                  <div className="text-lg md:text-xl text-[var(--text-primary)] leading-relaxed font-medium">
                    Obieo is the AI SEO agency that tests everything on our own business first. Our founder runs a roofing company and uses it as a live testing ground for every strategy we deploy. When we recommend something, we have already proven it works.
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section>
        <Container size="lg">
          <FadeInSection>
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-10">
                Frequently Asked Questions About AI SEO
              </h2>

              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-3">
                    What is an AI SEO agency?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    An AI SEO agency specializes in optimizing websites for AI-powered search platforms like Google AI Overviews, ChatGPT, and Perplexity. Unlike traditional SEO agencies that focus solely on keyword rankings, an AI SEO agency uses Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) to ensure your business gets cited in AI-generated answers. This is critical because over 50% of Google searches now include AI Overviews, and platforms like ChatGPT are becoming primary search tools for millions of users.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-3">
                    How is AI SEO different from traditional SEO?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Traditional SEO optimizes for blue-link rankings using keywords, backlinks, and on-page factors. AI SEO goes further by optimizing for citation in AI-generated responses. This includes structuring content for factual density, implementing schema markup for AI comprehension, building entity authority across platforms, and creating quotable definitions that AI systems prefer to reference. The goal shifts from &quot;rank #1&quot; to &quot;be the source AI cites.&quot;
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-3">
                    How much does AI SEO cost?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    AI SEO services from Obieo are custom-priced based on your business size, competition level, and goals. Most home service businesses invest between $1,500 and $5,000 per month for comprehensive AI SEO that includes GEO, AEO, technical SEO, and ongoing content optimization. The investment pays for itself quickly — a single lead from a high-value service like roofing or HVAC can cover months of SEO costs. <Link href="/call" className="text-[var(--accent)] font-medium border-b-2 border-[var(--accent)]/30 hover:border-[var(--accent)] transition-colors">Book a free strategy call</Link> to get a custom quote.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-3">
                    How long does it take to see results from AI SEO?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Most businesses see initial AI visibility improvements within 4 to 8 weeks. Obieo achieved AI search citations for Lapeyre Roofing within 6 weeks of implementing GEO strategies. Full results, including consistent AI citations and measurable traffic from AI platforms, typically develop over 3 to 6 months depending on your industry competition and starting position. Unlike traditional SEO which can take 6 to 12 months, AI SEO often shows faster initial results because the AI search space is less competitive.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-3">
                    Do I still need traditional SEO if I invest in AI SEO?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Yes. AI SEO and traditional SEO are complementary, not competing strategies. Research shows that 76% of Google AI Overview citations come from pages already ranking in the top 10. Strong traditional SEO provides the foundation that AI systems trust. An AI SEO agency like Obieo builds on your existing SEO foundation to capture traffic from both traditional and AI-powered search. You get the best of both worlds.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-3">
                    Which AI search platforms does Obieo optimize for?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Obieo optimizes for all major AI search platforms including Google AI Overviews (which appear in over 50% of Google searches), ChatGPT (which drives 87% of all AI referral traffic), Perplexity AI, Google Gemini, Microsoft Copilot, and Claude. Each platform has different citation patterns — for example, ChatGPT favors Wikipedia and authoritative sites while Perplexity relies heavily on Reddit discussions — and Obieo tailors strategies for maximum visibility across all of them.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-3">
                    Why should home service businesses care about AI SEO?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Home service businesses are uniquely positioned to benefit from AI SEO because local recommendations are among the most common AI search queries. When someone asks ChatGPT or Google AI for &quot;best plumber near me&quot; or &quot;reliable roofer in Austin,&quot; AI systems pull from structured business data, reviews, and authoritative content. Businesses optimized for AI search appear in these high-intent recommendations while competitors remain invisible. With average job values of $5,000 to $15,000+ for services like roofing, HVAC, and plumbing, even a few additional AI-driven leads per month can generate significant revenue.
                  </p>
                </div>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* CTA Section */}
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
                Get Started with AI SEO
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                Ready to Get Found in AI Search?
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto leading-relaxed">
                Your competitors are already showing up in ChatGPT and Google AI Overviews. Every month you wait, they build more authority in AI search. Book a free strategy call to see exactly where your business stands — and what it takes to get ahead.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/call"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-all hover:scale-105 shadow-lg shadow-[var(--accent)]/25"
                >
                  Book a Free Strategy Call
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/roi-calculator"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-[var(--border)] text-[var(--text-primary)] font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                >
                  Calculate Your SEO ROI
                </Link>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-6">
                20-minute call. No pressure. See if AI SEO makes sense for your business.
              </p>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* Related Content */}
      <Section>
        <Container size="lg">
          <FadeInSection>
            <div className="max-w-4xl">
              <h2 className="text-xl md:text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                Learn More About AI Search Optimization
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/blog/generative-engine-optimization-guide"
                  className="p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors group"
                >
                  <p className="text-sm text-[var(--accent)] font-medium uppercase tracking-wide mb-2">Guide</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">The Complete Guide to Generative Engine Optimization (GEO)</p>
                  <p className="text-sm text-[var(--text-secondary)]">Learn the full GEO framework, llms.txt protocol, and implementation strategies.</p>
                </Link>
                <Link
                  href="/quiz"
                  className="p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors group"
                >
                  <p className="text-sm text-[var(--accent)] font-medium uppercase tracking-wide mb-2">Free Tool</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">AI Visibility Quiz</p>
                  <p className="text-sm text-[var(--text-secondary)]">Score your business across 6 AI readiness categories in under 3 minutes.</p>
                </Link>
                <Link
                  href="/work/lapeyre-roofing"
                  className="p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors group"
                >
                  <p className="text-sm text-[var(--accent)] font-medium uppercase tracking-wide mb-2">Case Study</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">Lapeyre Roofing: AI Citations in 6 Weeks</p>
                  <p className="text-sm text-[var(--text-secondary)]">How a new roofing company appeared alongside 50-year incumbents in AI search.</p>
                </Link>
                <Link
                  href="/roi-calculator"
                  className="p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors group"
                >
                  <p className="text-sm text-[var(--accent)] font-medium uppercase tracking-wide mb-2">Calculator</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">SEO ROI Calculator</p>
                  <p className="text-sm text-[var(--text-secondary)]">See the potential return on investment from SEO and AI search optimization.</p>
                </Link>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}
