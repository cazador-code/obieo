import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'
import {
  PullQuote,
  KeyInsight,
  DataCard,
  Paragraph,
  SectionHeading,
  SubHeading,
  InlineLink,
  BlogTableOfContents,
} from '@/components/blog'

// JSON-LD Schema for SEO
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'GEO vs SEO: What\'s the Difference? [2026 Guide]',
  description: 'GEO vs SEO: understand the key differences between Generative Engine Optimization and Search Engine Optimization, when to use each, and how they work together in 2026.',
  image: 'https://www.obieo.com/og-geo-vs-seo.jpg',
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
    '@id': 'https://www.obieo.com/blog/geo-vs-seo',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the difference between GEO and SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SEO (Search Engine Optimization) focuses on ranking web pages in traditional search results like Google and Bing. GEO (Generative Engine Optimization) focuses on getting your content cited by AI-powered search engines like ChatGPT, Perplexity, and Google AI Overviews. SEO optimizes for keywords and backlinks; GEO optimizes for factual density, structured data, and citation-worthy content.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is GEO replacing SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, GEO is not replacing SEO. GEO is an expansion of SEO that addresses AI-powered search. Traditional SEO remains important for organic rankings, while GEO ensures your content is cited by AI systems. The most effective strategy in 2026 combines both SEO and GEO for maximum search visibility.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does GEO stand for in marketing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'GEO stands for Generative Engine Optimization. It is the practice of optimizing website content to be cited, referenced, and surfaced by AI-powered search engines including ChatGPT, Google AI Overviews, Perplexity, and Claude. GEO is a subset of digital marketing focused on AI search visibility.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need GEO if I already do SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. As of 2026, AI Overviews appear in over 52% of Google searches. If you only optimize for traditional SEO, you are missing a growing share of search traffic. GEO and SEO are complementary — many GEO best practices (structured data, clear content, authority signals) also improve your traditional SEO rankings.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get started with GEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Start by auditing your AI visibility: search for your brand and services in ChatGPT, Perplexity, and Google AI Overviews. Then implement structured data (schema markup), create content with clear definitions and factual density, add an llms.txt file, and build community authority through reviews and mentions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the ROI of GEO compared to SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'GEO and SEO have complementary ROI. SEO delivers measurable traffic and rankings with an average ROI of 5:1 to 12:1. GEO drives AI citations and referral traffic from ChatGPT, Perplexity, and AI Overviews. Together, businesses using both SEO and GEO report 20-40% higher total search visibility than those using SEO alone.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can small businesses benefit from GEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Small and local businesses can benefit significantly from GEO because AI search engines often recommend businesses based on reviews, community mentions, and content quality rather than domain authority alone. A well-optimized small business website can appear alongside much larger competitors in AI-generated recommendations.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: "GEO vs SEO: What's the Difference? [2026 Guide]",
  description: "GEO vs SEO: understand the key differences between Generative Engine Optimization and Search Engine Optimization. Learn when to use each and how they work together.",
  alternates: {
    canonical: '/blog/geo-vs-seo',
  },
  openGraph: {
    title: "GEO vs SEO: What's the Difference? [2026 Guide]",
    description: "GEO vs SEO: understand the key differences between Generative Engine Optimization and traditional SEO, and how they work together in 2026.",
  },
}

const tocSections = [
  { id: 'what-is-seo', title: 'What is SEO?' },
  { id: 'what-is-geo', title: 'What is GEO?' },
  { id: 'key-differences', title: 'Key Differences: GEO vs SEO' },
  { id: 'when-to-focus', title: 'When to Focus on SEO vs GEO' },
  { id: 'working-together', title: 'How SEO and GEO Work Together' },
  { id: 'implementation', title: 'Practical Implementation Guide' },
  { id: 'faq', title: 'Frequently Asked Questions' },
]

export default function GEOvsSEOPage() {
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
              <span className="text-sm text-[var(--text-muted)]">February 6, 2026</span>
              <span className="text-sm text-[var(--text-muted)]">&bull;</span>
              <span className="text-sm text-[var(--text-muted)]">12 min read</span>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8 leading-[1.1]">
              GEO vs SEO: Understanding the Difference in 2026
            </h1>
          </FadeInSection>

          <FadeInSection delay={0.3}>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              <strong className="text-[var(--text-primary)]">SEO gets you ranked. GEO gets you cited.</strong> Here&apos;s how both work, when to use each, and why your business needs a strategy for both in 2026.
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
                Search is splitting in two. Traditional search engines rank web pages in a list. AI-powered engines generate answers and cite sources inline. <strong className="text-[var(--text-primary)]">SEO optimizes for the first. GEO optimizes for the second.</strong> Both matter in 2026 — but they require different strategies.
              </Paragraph>

              <Paragraph>
                AI Overviews now appear in over 52% of tracked Google searches. ChatGPT commands over 4% of all search referral traffic. And Perplexity, Claude, and other AI assistants are growing fast. If your business only optimizes for traditional SEO, you are leaving a growing share of visibility on the table.
              </Paragraph>

              <KeyInsight title="The Bottom Line">
                GEO (Generative Engine Optimization) is the practice of optimizing your content to be cited by AI search engines. SEO (Search Engine Optimization) is the practice of ranking in traditional search results. Together, they form a complete search visibility strategy for 2026 and beyond.
              </KeyInsight>

              <BlogTableOfContents sections={tocSections} />

              {/* Section 1: What is SEO? */}
              <SectionHeading id="what-is-seo">
                What is SEO?
              </SectionHeading>

              <Paragraph>
                <strong className="text-[var(--text-primary)]">Search Engine Optimization (SEO)</strong> is the process of improving a website&apos;s visibility in traditional search engine results pages (SERPs). When someone types a query into Google, Bing, or Yahoo, SEO determines which pages appear at the top of the organic results list.
              </Paragraph>

              <Paragraph>
                SEO has been the foundation of digital marketing since the late 1990s. It encompasses three core areas:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">On-page SEO</strong> &mdash; Optimizing title tags, meta descriptions, header tags, content quality, keyword usage, and internal linking structure</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Off-page SEO</strong> &mdash; Building backlinks, brand mentions, social signals, and domain authority through external sources</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Technical SEO</strong> &mdash; Ensuring fast page speed, mobile responsiveness, crawlability, proper indexing, and structured data implementation</span>
                  </li>
                </ul>
              </div>

              <Paragraph>
                The goal of SEO is straightforward: rank as high as possible in search results so that users click through to your website. The higher you rank, the more organic traffic you receive. Studies show the #1 position in Google captures approximately 27.6% of all clicks, while position #10 receives just 2.4%.
              </Paragraph>

              <div className="grid md:grid-cols-3 gap-4 my-8">
                <DataCard
                  label="Position #1 CTR"
                  value="27.6%"
                  subtext="Average click-through rate"
                  variant="highlight"
                />
                <DataCard
                  label="Position #5 CTR"
                  value="6.3%"
                  subtext="Drops significantly by mid-page"
                />
                <DataCard
                  label="Position #10 CTR"
                  value="2.4%"
                  subtext="Bottom of page one"
                  variant="warning"
                />
              </div>

              {/* Section 2: What is GEO? */}
              <SectionHeading id="what-is-geo">
                What is GEO?
              </SectionHeading>

              <Paragraph>
                <strong className="text-[var(--text-primary)]">Generative Engine Optimization (GEO)</strong> is the practice of optimizing your website and content to be cited, referenced, and surfaced by AI-powered search engines. These include ChatGPT, Google AI Overviews, Perplexity, Claude, and other generative AI platforms that synthesize answers from multiple sources.
              </Paragraph>

              <Paragraph>
                Where SEO asks &quot;How do I rank #1?&quot;, GEO asks &quot;How do I become the source the AI cites when generating its answer?&quot;
              </Paragraph>

              <Paragraph>
                GEO emerged as a discipline in 2024-2025 as AI search engines grew from novelty to mainstream. The term was first used in academic research from Georgia Tech and Princeton, which found that GEO techniques could increase content visibility in AI responses by up to 115%.
              </Paragraph>

              <div className="grid md:grid-cols-2 gap-4 my-8">
                <DataCard
                  label="AI Overviews Coverage"
                  value="52%+"
                  subtext="Of Google searches in 2025"
                  variant="highlight"
                />
                <DataCard
                  label="GEO Visibility Boost"
                  value="Up to 115%"
                  subtext="With proper optimization (Georgia Tech)"
                  variant="highlight"
                />
              </div>

              <Paragraph>
                GEO focuses on signals that AI systems value when selecting which sources to cite:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Factual density</strong> &mdash; Specific stats, numbers, and verifiable claims that AI can extract and reference</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Clear definitions</strong> &mdash; Direct, quotable answers to common questions in the first 150 words</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Structured data</strong> &mdash; Schema markup, tables, and hierarchical headings that AI can parse</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Authority signals</strong> &mdash; E-E-A-T indicators, community mentions, third-party validation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Content freshness</strong> &mdash; Content under 3 months old is 3x more likely to be cited by AI systems</span>
                  </li>
                </ul>
              </div>

              <Paragraph>
                For a deep dive into GEO strategies, read our <InlineLink href="/blog/generative-engine-optimization-guide">complete guide to Generative Engine Optimization</InlineLink>.
              </Paragraph>

              {/* Section 3: Key Differences */}
              <SectionHeading id="key-differences">
                Key Differences: GEO vs SEO
              </SectionHeading>

              <Paragraph>
                While GEO and SEO share the same goal &mdash; increasing search visibility &mdash; they differ in how they achieve it. Here is a side-by-side comparison of the two approaches:
              </Paragraph>

              {/* Comparison Table */}
              <div className="my-10 overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[var(--bg-secondary)]">
                      <th className="px-6 py-4 text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">Factor</th>
                      <th className="px-6 py-4 text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">SEO</th>
                      <th className="px-6 py-4 text-sm font-bold text-[var(--accent)] uppercase tracking-wider border-b border-[var(--border)]">GEO</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--text-secondary)]">
                    <tr className="border-b border-[var(--border)]">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Primary Goal</td>
                      <td className="px-6 py-4">Rank #1 in search results</td>
                      <td className="px-6 py-4">Get cited in AI-generated answers</td>
                    </tr>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Target Platform</td>
                      <td className="px-6 py-4">Google, Bing SERPs</td>
                      <td className="px-6 py-4">ChatGPT, Perplexity, AI Overviews</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Content Style</td>
                      <td className="px-6 py-4">Keyword-optimized, long-form</td>
                      <td className="px-6 py-4">Factually dense, clearly structured, quotable</td>
                    </tr>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Success Metric</td>
                      <td className="px-6 py-4">Rankings, organic traffic, CTR</td>
                      <td className="px-6 py-4">AI citations, referral traffic from AI</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Authority Signal</td>
                      <td className="px-6 py-4">Backlinks, domain authority</td>
                      <td className="px-6 py-4">E-E-A-T, community mentions, structured data</td>
                    </tr>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Keywords</td>
                      <td className="px-6 py-4">Exact match and semantic keywords</td>
                      <td className="px-6 py-4">Natural language, topic coverage, entity relationships</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Link Building</td>
                      <td className="px-6 py-4">Critical for rankings</td>
                      <td className="px-6 py-4">Less important; community reputation matters more</td>
                    </tr>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Freshness</td>
                      <td className="px-6 py-4">Important but not decisive</td>
                      <td className="px-6 py-4">Critical &mdash; 3x more citations for content under 3 months old</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Maturity</td>
                      <td className="px-6 py-4">25+ years of best practices</td>
                      <td className="px-6 py-4">Emerging discipline (2024-present)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <PullQuote>
                SEO asks &quot;How do I rank #1?&quot; GEO asks &quot;How do I become the source AI cites in its answer?&quot; Both questions matter. The answer to each requires different tactics.
              </PullQuote>

              <SubHeading>The Fundamental Difference in How Content is Selected</SubHeading>

              <Paragraph>
                In traditional SEO, Google&apos;s algorithm evaluates pages primarily through backlinks, keyword relevance, and user behavior signals. The #1 result earns the most clicks, and everything flows from ranking position.
              </Paragraph>

              <Paragraph>
                In GEO, AI systems use a process called Retrieval-Augmented Generation (RAG). The AI retrieves multiple sources, evaluates them for factual accuracy and authority, then synthesizes an answer. The sources it cites appear as inline references &mdash; and these citations don&apos;t follow the same rules as search rankings.
              </Paragraph>

              <Paragraph>
                Research from 2025 found that 95% of AI citation behavior is unexplained by traditional SEO metrics. A page ranking #7 in Google might be cited more often by AI than the page ranking #1 if it provides clearer, more factually dense information.
              </Paragraph>

              {/* Section 4: When to Focus */}
              <SectionHeading id="when-to-focus">
                When to Focus on SEO vs GEO
              </SectionHeading>

              <Paragraph>
                The right strategy depends on your business type, audience, and where your customers search. Here is a practical framework:
              </Paragraph>

              <SubHeading>Focus More on SEO When:</SubHeading>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>Your customers search with high-intent commercial keywords (&quot;electrician near me&quot;, &quot;emergency plumber&quot;)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>Your revenue depends on local search and Google Maps visibility</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>You operate in a market with established search behavior (e.g., &quot;roof repair austin tx&quot;)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>You need immediate, measurable traffic results</span>
                  </li>
                </ul>
              </div>

              <SubHeading>Focus More on GEO When:</SubHeading>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>Your audience uses AI assistants to research services before hiring (&quot;what should I look for in a roofer?&quot;)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>You want to be recommended by AI when users ask for suggestions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>You compete against larger brands and need a level playing field</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>Your industry attracts informational queries that trigger AI Overviews</span>
                  </li>
                </ul>
              </div>

              <KeyInsight title="Best Practice">
                In 2026, the right answer for most businesses is &quot;both.&quot; SEO drives bottom-of-funnel traffic from high-intent searches. GEO captures top-of-funnel visibility when AI answers informational queries. Together, they cover the full customer journey.
              </KeyInsight>

              {/* Section 5: Working Together */}
              <SectionHeading id="working-together">
                How SEO and GEO Work Together
              </SectionHeading>

              <Paragraph>
                GEO and SEO are not competitors &mdash; they are complementary strategies that reinforce each other. Many GEO best practices directly improve SEO performance, and vice versa.
              </Paragraph>

              <SubHeading>Where SEO Supports GEO</SubHeading>

              <Paragraph>
                Google&apos;s AI Overviews primarily cite content that already ranks in the top 10. Research shows 76.1% of AI Overview citations also rank in Google&apos;s top 10 organic results. This means strong SEO is a prerequisite for GEO visibility in Google&apos;s ecosystem.
              </Paragraph>

              <div className="grid md:grid-cols-2 gap-4 my-8">
                <DataCard
                  label="AI Overview Citations"
                  value="76.1%"
                  subtext="Come from pages ranking in top 10"
                  variant="highlight"
                />
                <DataCard
                  label="Domain Authority Factor"
                  value="92.4%"
                  subtext="Citations from top-10 ranking domains"
                  variant="highlight"
                />
              </div>

              <SubHeading>Where GEO Supports SEO</SubHeading>

              <Paragraph>
                GEO practices improve traditional SEO performance in several ways:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Structured data</strong> &mdash; Schema markup helps Google understand your pages and can trigger rich results</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Content quality</strong> &mdash; Factually dense, well-organized content ranks better in traditional search too</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">E-E-A-T signals</strong> &mdash; Author credentials, original research, and expertise boost both SEO rankings and AI citations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Brand mentions</strong> &mdash; Community reputation drives both traditional authority and AI trust signals</span>
                  </li>
                </ul>
              </div>

              <PullQuote>
                GEO isn&apos;t replacing SEO &mdash; it&apos;s expanding it. The businesses that master both will dominate the next decade of search.
              </PullQuote>

              <SubHeading>The Unified Strategy</SubHeading>

              <Paragraph>
                Rather than treating GEO and SEO as separate efforts, build a unified search strategy:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">1.</span>
                    <span><strong className="text-[var(--text-primary)]">Start with keyword research</strong> (SEO) &mdash; Identify what your audience searches for</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">2.</span>
                    <span><strong className="text-[var(--text-primary)]">Check for AI Overviews</strong> (GEO) &mdash; Which queries trigger AI answers?</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">3.</span>
                    <span><strong className="text-[var(--text-primary)]">Create content that satisfies both</strong> &mdash; Keyword-optimized AND factually dense with clear definitions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">4.</span>
                    <span><strong className="text-[var(--text-primary)]">Add structured data</strong> &mdash; Schema markup serves both Google and AI systems</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">5.</span>
                    <span><strong className="text-[var(--text-primary)]">Build authority everywhere</strong> &mdash; Backlinks for SEO + community reputation for GEO</span>
                  </li>
                </ul>
              </div>

              {/* Section 6: Implementation */}
              <SectionHeading id="implementation">
                Practical Implementation Guide
              </SectionHeading>

              <Paragraph>
                Here is a step-by-step guide to implementing both SEO and GEO for your business, whether you are a home service company or any other local business:
              </Paragraph>

              <SubHeading>Step 1: Audit Your Current Visibility</SubHeading>

              <Paragraph>
                Before optimizing, understand where you stand in both traditional and AI search:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">SEO audit</strong> &mdash; Check Google Search Console for current rankings, impressions, and click-through rates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">GEO audit</strong> &mdash; Ask ChatGPT, Perplexity, and Google Gemini about your services and location. Are you mentioned?</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Competitor analysis</strong> &mdash; Check which competitors appear in both traditional results and AI answers</span>
                  </li>
                </ul>
              </div>

              <SubHeading>Step 2: Optimize Your Website Structure (SEO + GEO)</SubHeading>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>Add keyword-optimized title tags and meta descriptions (SEO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>Implement schema markup: Organization, LocalBusiness, FAQ, Service (SEO + GEO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>Create an llms.txt file describing your business for AI systems (GEO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>Ensure fast load times and mobile responsiveness (SEO + GEO)</span>
                  </li>
                </ul>
              </div>

              <SubHeading>Step 3: Create Content That Serves Both</SubHeading>

              <Paragraph>
                The best content in 2026 works for both SEO and GEO. Follow this formula:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Lead with the answer</strong> &mdash; Put your main point in the first 150 words (GEO) while including your target keyword (SEO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Use clear headings</strong> &mdash; H2/H3 hierarchy with question-based headings where relevant (SEO + GEO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Include specific data</strong> &mdash; Statistics, numbers, and verifiable facts that AI can extract and cite (GEO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Add comparison tables</strong> &mdash; Side-by-side comparisons are highly citable by AI and boost user engagement (SEO + GEO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Include FAQ sections</strong> &mdash; Direct answers to common questions trigger featured snippets (SEO) and are frequently cited (GEO)</span>
                  </li>
                </ul>
              </div>

              <SubHeading>Step 4: Build Authority Across Both Channels</SubHeading>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Earn backlinks</strong> from industry publications and directories (SEO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Build community presence</strong> on Reddit, forums, and Nextdoor (GEO &mdash; especially for Perplexity)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Collect reviews</strong> on Google, Yelp, and BBB (SEO + GEO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span><strong className="text-[var(--text-primary)]">Publish original research</strong> with unique data from your business (GEO + SEO)</span>
                  </li>
                </ul>
              </div>

              <KeyInsight title="Real-World Example">
                After optimizing the Lapeyre Roofing website with both SEO and GEO tactics, the site appeared in AI recommendations alongside companies with 40-50 years in business &mdash; just 6 weeks after implementation. That&apos;s the power of combining both strategies.
              </KeyInsight>

              {/* FAQ Section */}
              <SectionHeading id="faq">
                Frequently Asked Questions
              </SectionHeading>

              <div className="space-y-8 my-8">
                <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">What is the difference between GEO and SEO?</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">SEO (Search Engine Optimization) focuses on ranking web pages in traditional search results like Google and Bing. GEO (Generative Engine Optimization) focuses on getting your content cited by AI-powered search engines like ChatGPT, Perplexity, and Google AI Overviews. SEO optimizes for keywords and backlinks; GEO optimizes for factual density, structured data, and citation-worthy content.</p>
                </div>

                <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">Is GEO replacing SEO?</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">No, GEO is not replacing SEO. GEO is an expansion of SEO that addresses AI-powered search. Traditional SEO remains important for organic rankings, while GEO ensures your content is cited by AI systems. The most effective strategy in 2026 combines both SEO and GEO for maximum search visibility.</p>
                </div>

                <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">What does GEO stand for in marketing?</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">GEO stands for Generative Engine Optimization. It is the practice of optimizing website content to be cited, referenced, and surfaced by AI-powered search engines including ChatGPT, Google AI Overviews, Perplexity, and Claude. GEO is a subset of digital marketing focused on AI search visibility.</p>
                </div>

                <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">Do I need GEO if I already do SEO?</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">Yes. As of 2026, AI Overviews appear in over 52% of Google searches. If you only optimize for traditional SEO, you are missing a growing share of search traffic. GEO and SEO are complementary &mdash; many GEO best practices (structured data, clear content, authority signals) also improve your traditional SEO rankings.</p>
                </div>

                <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">How do I get started with GEO?</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">Start by auditing your AI visibility: search for your brand and services in ChatGPT, Perplexity, and Google AI Overviews. Then implement structured data (schema markup), create content with clear definitions and factual density, add an llms.txt file, and build community authority through reviews and mentions.</p>
                </div>

                <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">What is the ROI of GEO compared to SEO?</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">GEO and SEO have complementary ROI. SEO delivers measurable traffic and rankings with an average ROI of 5:1 to 12:1. GEO drives AI citations and referral traffic from ChatGPT, Perplexity, and AI Overviews. Together, businesses using both SEO and GEO report 20-40% higher total search visibility than those using SEO alone.</p>
                </div>

                <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">Can small businesses benefit from GEO?</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">Absolutely. Small and local businesses can benefit significantly from GEO because AI search engines often recommend businesses based on reviews, community mentions, and content quality rather than domain authority alone. A well-optimized small business website can appear alongside much larger competitors in AI-generated recommendations.</p>
                </div>
              </div>

              {/* Related Content */}
              <div className="my-16 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4 font-[family-name:var(--font-display)]">
                  Related Reading
                </h3>
                <ul className="space-y-3">
                  <li>
                    <InlineLink href="/blog/generative-engine-optimization-guide">
                      The Complete Guide to Generative Engine Optimization (GEO)
                    </InlineLink>
                    <span className="text-[var(--text-muted)]"> &mdash; Deep dive into GEO strategies and implementation</span>
                  </li>
                  <li>
                    <InlineLink href="/blog/aeo-vs-seo">
                      AEO vs SEO: Answer Engine Optimization Explained
                    </InlineLink>
                    <span className="text-[var(--text-muted)]"> &mdash; How Answer Engine Optimization compares to traditional SEO</span>
                  </li>
                  <li>
                    <InlineLink href="/ai-seo">
                      AI SEO Services
                    </InlineLink>
                    <span className="text-[var(--text-muted)]"> &mdash; Our AI-first approach to search optimization</span>
                  </li>
                </ul>
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
                      Hunter owns <InlineLink href="/">Obieo</InlineLink> (SEO and GEO for home service businesses) and <InlineLink href="/work/lapeyre-roofing">Lapeyre Roofing</InlineLink>. He tests every strategy on his own business first &mdash; including the GEO tactics discussed in this guide.
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
                SEO + GEO Strategy
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                Ready to Optimize for Both SEO and GEO?
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto leading-relaxed">
                I help home service businesses build unified search strategies that cover traditional rankings AND AI citations. Tested on my own roofing company first.
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
                20 minutes to see if a combined SEO + GEO strategy makes sense for your business.
              </p>
            </div>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}
