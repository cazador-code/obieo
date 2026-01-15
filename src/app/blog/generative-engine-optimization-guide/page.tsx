import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

export const metadata: Metadata = {
  title: "The Complete Guide to Generative Engine Optimization (GEO) | Obieo",
  description: "GEO is how you get cited by AI search engines like ChatGPT and Perplexity. Learn the llms.txt protocol, citation patterns, and implementation strategies that work.",
  openGraph: {
    title: 'The Complete Guide to Generative Engine Optimization (GEO)',
    description: 'AI Overviews appeared in 52% of searches in early 2025. Learn how to optimize for AI-powered search before your competitors do.',
  },
}

// Editorial Components (matching existing blog style)
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
  variant?: 'default' | 'highlight' | 'warning'
}) {
  const variantStyles = {
    default: 'bg-[var(--bg-secondary)] border-[var(--border)]',
    highlight: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30',
  }
  const valueStyles = {
    default: 'text-[var(--text-primary)]',
    highlight: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
  }
  return (
    <div className={`p-5 md:p-6 rounded-xl border ${variantStyles[variant]} transition-transform hover:scale-[1.02]`}>
      <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] ${valueStyles[variant]}`}>{value}</p>
      {subtext && <p className="text-sm text-[var(--text-secondary)] mt-2">{subtext}</p>}
    </div>
  )
}

function NumberedStep({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5 md:gap-6 py-6 first:pt-0 last:pb-0">
      <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white font-bold text-xl md:text-2xl font-[family-name:var(--font-display)] shadow-lg shadow-[var(--accent)]/20">
        {number}
      </div>
      <div className="flex-1 pt-1">
        <h4 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-2 font-[family-name:var(--font-display)]">{title}</h4>
        <div className="text-[var(--text-secondary)] leading-relaxed">{children}</div>
      </div>
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl md:text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mt-12 mb-4">
      {children}
    </h3>
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

function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <div className="my-8 rounded-xl overflow-hidden border border-[var(--border)]">
      {title && (
        <div className="px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
          <span className="text-sm font-mono text-[var(--text-muted)]">{title}</span>
        </div>
      )}
      <pre className="p-4 bg-[#0c0a09] overflow-x-auto">
        <code className="text-sm text-emerald-400 font-mono">{children}</code>
      </pre>
    </div>
  )
}

function TableOfContents() {
  const sections = [
    { id: 'what-is-geo', title: 'What is GEO?' },
    { id: 'how-ai-search-works', title: 'How AI Search Works' },
    { id: 'citation-landscape', title: 'The Citation Landscape' },
    { id: 'llms-txt', title: 'The llms.txt Protocol' },
    { id: 'eeat-for-ai', title: 'E-E-A-T for AI' },
    { id: 'agentic-commerce', title: 'Agentic Commerce' },
    { id: 'measurement', title: 'Measurement & Tools' },
    { id: 'implementation', title: 'Implementation Roadmap' },
  ]

  return (
    <nav className="my-10 p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
      <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">In This Guide</p>
      <ol className="space-y-2">
        {sections.map((section, i) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="flex items-center gap-3 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              <span className="text-xs font-bold text-[var(--accent)]">{String(i + 1).padStart(2, '0')}</span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function GEOGuidePage() {
  return (
    <>
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
              <span className="text-sm text-[var(--text-muted)]">15 min read</span>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8 leading-[1.1]">
              The Complete Guide to Generative Engine Optimization (GEO)
            </h1>
          </FadeInSection>

          <FadeInSection delay={0.3}>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              <strong className="text-[var(--text-primary)]">GEO is how you get cited by AI.</strong> Traditional SEO gets you ranked. GEO gets you into the answer.
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
                AI Overviews appeared in 52% of tracked Google searches in early 2025 — up from just 6.49% in January. ChatGPT now commands over 4% of all search traffic, with 87% of AI referral traffic originating from OpenAI&apos;s chatbot.
              </Paragraph>

              <Paragraph>
                The way people find information is changing. Traditional SEO optimizes for rankings. Generative Engine Optimization (GEO) optimizes for <strong className="text-[var(--text-primary)]">citations</strong> — being the source that AI pulls from when generating answers.
              </Paragraph>

              <KeyInsight title="The Shift">
                By 2028, Gartner predicts a 50% reduction in traditional organic traffic due to AI-generated search. The businesses that adapt now will capture the traffic that others lose.
              </KeyInsight>

              <TableOfContents />

              {/* Section 1: What is GEO? */}
              <SectionHeading>
                <span id="what-is-geo">What is Generative Engine Optimization?</span>
              </SectionHeading>

              <Paragraph>
                Generative Engine Optimization (GEO) is the practice of optimizing content to be cited, referenced, and surfaced by AI-powered search engines — ChatGPT, Perplexity, Google AI Overviews, Claude, and others.
              </Paragraph>

              <Paragraph>
                Where traditional SEO asks <em>&quot;How do I rank #1?&quot;</em>, GEO asks <em>&quot;How do I become the source the AI cites?&quot;</em>
              </Paragraph>

              <div className="grid md:grid-cols-2 gap-4 my-8">
                <DataCard
                  label="Traditional SEO Goal"
                  value="Rank #1"
                  subtext="Appear at top of search results"
                />
                <DataCard
                  label="GEO Goal"
                  value="Get Cited"
                  subtext="Be the source in AI answers"
                  variant="highlight"
                />
              </div>

              <Paragraph>
                This isn&apos;t theoretical. I&apos;ve seen it work firsthand. Six weeks after optimizing the <InlineLink href="/work/lapeyre-roofing">Lapeyre Roofing</InlineLink> website, I asked Google Gemini for Austin roofing recommendations. Lapeyre Roofing appeared alongside companies that have been in business for 40-50 years — Kidd Roofing (since 1982), Ja-Mar (50+ years), Wilson Roofing.
              </Paragraph>

              <PullQuote>
                A newer company showing up alongside 50-year incumbents in AI recommendations. That&apos;s what GEO makes possible.
              </PullQuote>

              {/* Section 2: How AI Search Works */}
              <SectionHeading>
                <span id="how-ai-search-works">How AI Search Actually Works</span>
              </SectionHeading>

              <Paragraph>
                To optimize for AI search, you need to understand how these systems select sources. Most AI search engines use a process called Retrieval-Augmented Generation (RAG).
              </Paragraph>

              <SubHeading>The RAG Pipeline</SubHeading>

              <div className="my-8 space-y-1">
                <NumberedStep number={1} title="Query Understanding">
                  The AI interprets what you&apos;re asking — intent, entities, context. This is more sophisticated than keyword matching.
                </NumberedStep>
                <NumberedStep number={2} title="Retrieval">
                  The system searches its index (web crawl, knowledge base, or real-time search) for relevant sources. This is where your content either gets pulled or ignored.
                </NumberedStep>
                <NumberedStep number={3} title="Ranking & Selection">
                  Retrieved sources are ranked by relevance, authority, and recency. The top sources become candidates for citation.
                </NumberedStep>
                <NumberedStep number={4} title="Generation">
                  The AI synthesizes information from selected sources into a response, citing the sources it drew from.
                </NumberedStep>
              </div>

              <KeyInsight title="Critical Insight">
                Content under 3 months old is 3× more likely to be cited by AI systems. Freshness matters even more for GEO than traditional SEO.
              </KeyInsight>

              <SubHeading>Why Citation Selection Differs from Ranking</SubHeading>

              <Paragraph>
                Traditional SEO rewards content that matches keywords and has strong backlinks. AI citation selection adds new factors:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Factual density</strong> — AI prefers content with specific claims, numbers, and verifiable facts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Structured information</strong> — Lists, tables, and clear hierarchies are easier to extract</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Direct answers</strong> — Content that leads with the answer (not buries it) gets cited more</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Source reputation</strong> — Community mentions (Reddit, forums) influence AI trust signals</span>
                  </li>
                </ul>
              </div>

              <Paragraph>
                Research shows that 95% of AI citation behavior is unexplained by traditional SEO metrics. The game has different rules.
              </Paragraph>

              {/* Section 3: Citation Landscape */}
              <SectionHeading>
                <span id="citation-landscape">The Citation Landscape</span>
              </SectionHeading>

              <Paragraph>
                Different AI platforms have dramatically different citation patterns. Understanding where each AI pulls from is crucial for targeting your optimization.
              </Paragraph>

              <div className="grid md:grid-cols-2 gap-4 my-8">
                <DataCard
                  label="ChatGPT Top Citations"
                  value="47.9%"
                  subtext="Wikipedia dominates"
                  variant="highlight"
                />
                <DataCard
                  label="Perplexity Top Citations"
                  value="46.7%"
                  subtext="Reddit dominates"
                  variant="warning"
                />
              </div>

              <SubHeading>ChatGPT Citation Patterns</SubHeading>

              <Paragraph>
                ChatGPT heavily favors Wikipedia, established news sources, and academic content. For local services, it leans on:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Wikipedia and established directories</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>News mentions and press coverage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Well-structured business websites with clear E-E-A-T signals</span>
                  </li>
                </ul>
              </div>

              <SubHeading>Perplexity Citation Patterns</SubHeading>

              <Paragraph>
                Perplexity has a fundamentally different approach — it heavily indexes Reddit and community discussions. For local recommendations, it often pulls from:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Reddit threads (r/[city], r/HomeImprovement, etc.)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Nextdoor discussions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Forum recommendations and reviews</span>
                  </li>
                </ul>
              </div>

              <KeyInsight title="Strategic Implication">
                If your customers are using Perplexity, your Reddit and community reputation matters as much as your website. This is a completely different optimization target than traditional SEO.
              </KeyInsight>

              <SubHeading>Google AI Overviews</SubHeading>

              <Paragraph>
                Google&apos;s AI Overviews primarily pull from content already ranking in the top 10. Research shows 76.1% of AI Overview citations also rank in Google&apos;s top 10, and 92.36% come from domains in the top 10.
              </Paragraph>

              <Paragraph>
                This means traditional SEO and GEO are synergistic for Google — rank well, and you&apos;re more likely to be cited. But it also means the other 24% of citations come from sources that <em>don&apos;t</em> rank in the top 10, suggesting AI Overviews factor in different signals.
              </Paragraph>

              {/* Section 4: llms.txt */}
              <SectionHeading>
                <span id="llms-txt">The llms.txt Protocol</span>
              </SectionHeading>

              <Paragraph>
                <code className="px-2 py-1 bg-[var(--bg-secondary)] rounded text-sm font-mono">llms.txt</code> is an emerging standard that tells AI systems how to understand and interact with your website. Think of it as <code className="px-2 py-1 bg-[var(--bg-secondary)] rounded text-sm font-mono">robots.txt</code> for AI.
              </Paragraph>

              <div className="grid md:grid-cols-2 gap-4 my-8">
                <DataCard
                  label="Current Adoption"
                  value="0.3%"
                  subtext="Of top 1,000 websites (June 2025)"
                />
                <DataCard
                  label="Implementations"
                  value="784+"
                  subtext="Websites using llms.txt/llms-full.txt"
                  variant="highlight"
                />
              </div>

              <SubHeading>What llms.txt Does</SubHeading>

              <Paragraph>
                The file provides AI systems with:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Site purpose</strong> — What your site is about, who it serves</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Key content</strong> — Which pages are most important for different queries</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Entity information</strong> — Who you are, credentials, expertise areas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Preferred citation format</strong> — How you want to be referenced</span>
                  </li>
                </ul>
              </div>

              <SubHeading>Basic Implementation</SubHeading>

              <Paragraph>
                Create a file at <code className="px-2 py-1 bg-[var(--bg-secondary)] rounded text-sm font-mono">yoursite.com/llms.txt</code>:
              </Paragraph>

              <CodeBlock title="llms.txt">{`# Obieo
> SEO and GEO optimization for home service businesses

## About
Obieo helps contractors, roofers, and home service companies
dominate local search through SEO and AI search optimization.
Founded by Hunter Lapeyre, who also owns Lapeyre Roofing.

## Key Pages
- /: Homepage - overview of services
- /work/lapeyre-roofing: Case study with real results
- /blog: SEO and marketing insights for contractors
- /call: Book a strategy consultation

## Expertise
- Local SEO for home services
- Generative Engine Optimization (GEO)
- Contractor marketing strategy

## Contact
hunter@obieo.com`}</CodeBlock>

              <KeyInsight title="First-Mover Advantage">
                With only 0.3% of top sites implementing llms.txt, early adoption positions you as an AI-native brand. As AI search grows, this standard will likely become as important as robots.txt.
              </KeyInsight>

              {/* Section 5: E-E-A-T for AI */}
              <SectionHeading>
                <span id="eeat-for-ai">E-E-A-T for AI</span>
              </SectionHeading>

              <Paragraph>
                Google&apos;s E-E-A-T framework (Experience, Expertise, Authoritativeness, Trustworthiness) matters even more for AI citations than traditional rankings. AI systems are trained to favor authoritative sources.
              </Paragraph>

              <SubHeading>Experience Signals</SubHeading>

              <Paragraph>
                AI systems look for evidence of first-hand experience:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Case studies with specific results and timelines</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>First-person accounts (&quot;When I implemented this...&quot;)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Original data from your own business</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Photos, screenshots, documentation of real work</span>
                  </li>
                </ul>
              </div>

              <SubHeading>Expertise & Authority Signals</SubHeading>

              <Paragraph>
                Structured data helps AI systems verify credentials:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Author schema</strong> — Link content to real people with verifiable expertise</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Organization schema</strong> — Certifications, awards, affiliations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Review schema</strong> — Aggregated ratings and testimonials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">LocalBusiness schema</strong> — Complete business information</span>
                  </li>
                </ul>
              </div>

              <Paragraph>
                Content with proper schema shows 30-40% higher visibility in AI-generated answers.
              </Paragraph>

              <SubHeading>Trust Signals</SubHeading>

              <Paragraph>
                AI systems cross-reference your claims against other sources:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Mentions in authoritative publications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Consistent information across web presence (NAP consistency)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Community discussions and organic mentions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Verified business listings (Google Business Profile, BBB, industry directories)</span>
                  </li>
                </ul>
              </div>

              {/* Section 6: Agentic Commerce */}
              <SectionHeading>
                <span id="agentic-commerce">Agentic Commerce</span>
              </SectionHeading>

              <Paragraph>
                The next frontier of AI search is agentic commerce — AI systems that don&apos;t just recommend, but actually complete transactions on behalf of users.
              </Paragraph>

              <div className="grid md:grid-cols-2 gap-4 my-8">
                <DataCard
                  label="Projected Market"
                  value="$3-5T"
                  subtext="Agentic commerce by 2030"
                  variant="highlight"
                />
                <DataCard
                  label="AI Conversion Rate"
                  value="2×"
                  subtext="Higher than traditional search"
                  variant="highlight"
                />
              </div>

              <SubHeading>Google&apos;s Universal Commerce Protocol (UCP)</SubHeading>

              <Paragraph>
                Google is building infrastructure for AI agents to browse, compare, and purchase products. UCP standardizes how product information is structured so AI can:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Understand product specifications and pricing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Compare options across vendors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span>Complete purchases through standardized checkout</span>
                  </li>
                </ul>
              </div>

              <SubHeading>OpenAI&apos;s Checkout Integration</SubHeading>

              <Paragraph>
                ChatGPT is integrating direct checkout capabilities. When users ask for product recommendations, ChatGPT can guide them through purchase without leaving the chat interface.
              </Paragraph>

              <KeyInsight title="For Service Businesses">
                While direct checkout applies more to e-commerce, service businesses should prepare for AI-assisted booking. Structured service information, clear pricing, and easy scheduling integrations will become competitive advantages.
              </KeyInsight>

              {/* Section 7: Measurement */}
              <SectionHeading>
                <span id="measurement">Measurement & Tools</span>
              </SectionHeading>

              <Paragraph>
                Traditional analytics don&apos;t capture AI traffic well. Here&apos;s how to track your GEO performance:
              </Paragraph>

              <SubHeading>AI Traffic Tracking</SubHeading>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Referrer analysis</strong> — Track traffic from chat.openai.com, perplexity.ai, and Google AI referrers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Zero-click monitoring</strong> — Track impressions without clicks in Search Console</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Brand mention tracking</strong> — Monitor when your brand appears in AI responses</span>
                  </li>
                </ul>
              </div>

              <SubHeading>Emerging Tools</SubHeading>

              <Paragraph>
                The GEO measurement space is evolving rapidly:
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Ahrefs Brand Radar</strong> — 100M+ prompt database for tracking AI mentions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">SEMrush</strong> — Similar AI mention tracking with 100M+ prompts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">Profound</strong> — Raised $35M Series B (Sequoia) for AI visibility analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">•</span>
                    <span><strong className="text-[var(--text-primary)]">AthenaHQ</strong> — Reports 10× AI traffic increases for customers</span>
                  </li>
                </ul>
              </div>

              {/* Section 8: Implementation */}
              <SectionHeading>
                <span id="implementation">Implementation Roadmap</span>
              </SectionHeading>

              <Paragraph>
                Start with the highest-impact, lowest-effort changes and build from there:
              </Paragraph>

              <SubHeading>Phase 1: Foundation (Week 1-2)</SubHeading>

              <div className="my-8 space-y-1">
                <NumberedStep number={1} title="Audit your current AI visibility">
                  <p>Search for your brand and services in ChatGPT, Perplexity, and Google AI Overviews. Document what appears — and what doesn&apos;t.</p>
                </NumberedStep>
                <NumberedStep number={2} title="Implement llms.txt">
                  <p>Create a basic llms.txt file describing your business, key pages, and expertise areas.</p>
                </NumberedStep>
                <NumberedStep number={3} title="Add structured data">
                  <p>Implement Organization, LocalBusiness, and Author schema. Use Google&apos;s Structured Data Testing Tool to validate.</p>
                </NumberedStep>
              </div>

              <SubHeading>Phase 2: Content Optimization (Week 3-4)</SubHeading>

              <div className="my-8 space-y-1">
                <NumberedStep number={4} title="Lead with answers">
                  <p>Review your top pages. Move the direct answer to the first 150 words. No preamble, no &quot;In this article we&apos;ll discuss...&quot;</p>
                </NumberedStep>
                <NumberedStep number={5} title="Add factual density">
                  <p>Include specific numbers, statistics, and verifiable claims. Cite sources. AI systems prefer content they can verify.</p>
                </NumberedStep>
                <NumberedStep number={6} title="Structure for extraction">
                  <p>Use clear H2/H3 hierarchy, bulleted lists, comparison tables. Make it easy for AI to pull structured information.</p>
                </NumberedStep>
              </div>

              <SubHeading>Phase 3: Authority Building (Ongoing)</SubHeading>

              <div className="my-8 space-y-1">
                <NumberedStep number={7} title="Build community presence">
                  <p>Engage authentically on Reddit, industry forums, and Nextdoor. These mentions influence AI recommendations, especially Perplexity.</p>
                </NumberedStep>
                <NumberedStep number={8} title="Publish original research">
                  <p>Create content with unique data from your business. Case studies, benchmarks, and first-party insights are highly citable.</p>
                </NumberedStep>
                <NumberedStep number={9} title="Monitor and iterate">
                  <p>Track AI mentions monthly. Adjust your strategy based on what&apos;s working and which platforms are driving results.</p>
                </NumberedStep>
              </div>

              <KeyInsight title="The Key Insight">
                47% of brands still lack a deliberate GEO strategy. Every month you wait, early adopters pull further ahead. The window for first-mover advantage is now.
              </KeyInsight>

              <PullQuote>
                GEO isn&apos;t replacing SEO — it&apos;s expanding it. The businesses that master both will dominate the next decade of search.
              </PullQuote>

              {/* Related Content */}
              <div className="my-16 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4 font-[family-name:var(--font-display)]">
                  Related Reading
                </h3>
                <ul className="space-y-3">
                  <li>
                    <InlineLink href="/blog/ai-search-contractors">
                      Why Your Competitors Will Be Invisible in 2 Years
                    </InlineLink>
                    <span className="text-[var(--text-muted)]"> — The non-technical version for business owners</span>
                  </li>
                  <li>
                    <InlineLink href="/work/lapeyre-roofing">
                      Lapeyre Roofing Case Study
                    </InlineLink>
                    <span className="text-[var(--text-muted)]"> — Real GEO results in 6 weeks</span>
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
                      Hunter owns <InlineLink href="/">Obieo</InlineLink> (SEO and GEO for home service businesses) and <InlineLink href="/work/lapeyre-roofing">Lapeyre Roofing</InlineLink>. He tests every strategy on his own business first — including the GEO tactics in this guide.
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
                Get Ahead of the Shift
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                Ready to Optimize for AI Search?
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto leading-relaxed">
                I help home service businesses implement GEO strategies that actually work — tested on my own roofing company first. No theory, just results.
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
                20 minutes to see if GEO makes sense for your business.
              </p>
            </div>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}
