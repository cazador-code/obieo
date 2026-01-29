import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

// JSON-LD Schema for SEO
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: "Contractor Lead Generation: Why You're Stuck at $3M",
  description: 'Discover why most contractors plateau between $1.5-3M revenue. Learn the lead source hierarchy and how SEO compounds while PPC stays flat.',
  image: 'https://www.obieo.com/og-lead-gen-guide.jpg',
  datePublished: '2025-01-05',
  dateModified: '2025-01-05',
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
    '@id': 'https://www.obieo.com/blog/contractor-lead-generation-guide',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Why do contractors plateau at $3M in revenue?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most contractors plateau because they rely on expensive, non-compounding lead sources like PPC and paid leads. Breaking through requires transitioning to owned lead sources like SEO and referrals that build equity over time.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the best lead source for contractors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Referrals are the highest-converting lead source, but SEO provides the best long-term ROI because it compounds over time. Unlike paid ads that stop when you stop paying, SEO builds lasting organic visibility.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does SEO compare to PPC for contractors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PPC provides immediate leads but costs stay flat or increase over time. SEO takes longer to build but costs decrease as organic rankings improve. After 12-18 months, SEO typically delivers leads at 3-5x better ROI than PPC.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: "Contractor Lead Generation: Why You're Stuck at $3M",
  description: "Discover why most contractors plateau between $1.5-3M revenue. Learn the lead source hierarchy and how SEO compounds while PPC stays flat. Real numbers inside.",
  alternates: {
    canonical: '/blog/contractor-lead-generation-guide',
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
  variant?: 'default' | 'bad' | 'good' | 'best'
}) {
  const variantStyles = {
    default: 'bg-[var(--bg-secondary)] border-[var(--border)]',
    bad: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30',
    good: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30',
    best: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30',
  }
  const valueStyles = {
    default: 'text-[var(--text-primary)]',
    bad: 'text-red-600 dark:text-red-400',
    good: 'text-amber-600 dark:text-amber-400',
    best: 'text-emerald-600 dark:text-emerald-400',
  }
  return (
    <div className={`p-5 md:p-6 rounded-xl border ${variantStyles[variant]} transition-transform hover:scale-[1.02]`}>
      <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] ${valueStyles[variant]}`}>{value}</p>
      {subtext && <p className="text-sm text-[var(--text-secondary)] mt-2">{subtext}</p>}
    </div>
  )
}

function ComparisonRow({
  source,
  costPerLead,
  closeRate,
  costPerAcquisition,
  verdict
}: {
  source: string
  costPerLead: string
  closeRate: string
  costPerAcquisition: string
  verdict: 'bad' | 'okay' | 'good' | 'best'
}) {
  const verdictConfig = {
    bad: { bg: 'bg-red-500', label: 'Avoid' },
    okay: { bg: 'bg-amber-500', label: 'Short-term' },
    good: { bg: 'bg-blue-500', label: 'Solid' },
    best: { bg: 'bg-emerald-500', label: 'Best' },
  }
  return (
    <div className="grid grid-cols-5 gap-4 py-4 border-b border-[var(--border)] last:border-0 items-center">
      <div className="col-span-2 md:col-span-1">
        <p className="font-semibold text-[var(--text-primary)]">{source}</p>
      </div>
      <div className="hidden md:block text-center">
        <p className="text-[var(--text-secondary)]">{costPerLead}</p>
      </div>
      <div className="hidden md:block text-center">
        <p className="text-[var(--text-secondary)]">{closeRate}</p>
      </div>
      <div className="col-span-2 md:col-span-1 text-center">
        <p className="font-semibold text-[var(--text-primary)]">{costPerAcquisition}</p>
      </div>
      <div className="text-right">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${verdictConfig[verdict].bg}`}>
          {verdictConfig[verdict].label}
        </span>
      </div>
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
        <p className="text-[var(--text-secondary)] leading-relaxed">{children}</p>
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

export default function ContractorLeadGenerationGuidePage() {
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
                Lead Generation
              </span>
              <span className="text-sm text-[var(--text-muted)]">January 14, 2026</span>
              <span className="text-sm text-[var(--text-muted)]">•</span>
              <span className="text-sm text-[var(--text-muted)]">12 min read</span>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8 leading-[1.1]">
              Contractor Lead Generation: Why Your Home Service Business Is Stuck at $3 Million
            </h1>
          </FadeInSection>

          <FadeInSection delay={0.3}>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Most home service businesses hit a wall between $1.5 and $3 million. The root cause? <strong className="text-[var(--text-primary)]">Where your leads come from.</strong>
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
                Most home service businesses hit a wall somewhere between $1.5 and $3 million. The phone isn&apos;t ringing enough. Growth has flatlined. You&apos;re working harder but not going anywhere.
              </Paragraph>

              <Paragraph>
                I run two businesses — <InlineLink href="/work/lapeyre-roofing">Lapeyre Roofing</InlineLink> in Texas and Obieo, where I handle SEO for home service companies. Between my own roofing company and the clients I work with, I&apos;ve spent years tracking exactly what drives profitable contractor lead generation in this industry.
              </Paragraph>

              <Paragraph>
                Here&apos;s what I&apos;ve learned: the problem isn&apos;t your sales team. It isn&apos;t your pricing. It isn&apos;t even the quality of your work.
              </Paragraph>

              <KeyInsight title="The Core Problem">
                Your lead generation strategy determines your ceiling. The source of your leads is the single biggest factor in whether you break through $3M or stay stuck.
              </KeyInsight>

              <SectionHeading>The Contractor Lead Generation Hierarchy</SectionHeading>

              <Paragraph>
                After years of running Lapeyre Roofing and analyzing data from Obieo clients, I&apos;ve mapped out exactly what different lead sources actually cost and how they perform. This isn&apos;t theory — it&apos;s real numbers from real home service businesses.
              </Paragraph>

              {/* Comparison Table */}
              <div className="my-10 md:my-14 p-6 md:p-8 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)]">
                <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-6 font-[family-name:var(--font-display)]">Lead Source Comparison</h4>
                <div className="grid grid-cols-5 gap-4 pb-3 border-b-2 border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <div className="col-span-2 md:col-span-1">Source</div>
                  <div className="hidden md:block text-center">Cost/Lead</div>
                  <div className="hidden md:block text-center">Close Rate</div>
                  <div className="col-span-2 md:col-span-1 text-center">Cost/Acquisition</div>
                  <div className="text-right">Verdict</div>
                </div>
                <ComparisonRow source="Aggregators" costPerLead="$20-40" closeRate="5-10%" costPerAcquisition="$200-800" verdict="bad" />
                <ComparisonRow source="Live Transfers" costPerLead="$100-200" closeRate="15-25%" costPerAcquisition="$400-750" verdict="okay" />
                <ComparisonRow source="PPC / Google Ads" costPerLead="$50-150" closeRate="20-35%" costPerAcquisition="$200-500" verdict="good" />
                <ComparisonRow source="SEO (Organic)" costPerLead="$25-50" closeRate="30-50%" costPerAcquisition="$50-150" verdict="best" />
              </div>

              <SubHeading>Aggregators: The Worst Way to Generate Leads</SubHeading>

              <Paragraph>
                You know the names — HomeAdvisor, Angi, Thumbtack. They sell leads to multiple contractors, so you&apos;re competing before the customer even picks up the phone.
              </Paragraph>

              <div className="grid md:grid-cols-3 gap-4 my-8">
                <DataCard label="Close Rate" value="5-10%" subtext="You're one of 3-5 contractors" variant="bad" />
                <DataCard label="True Cost/Acquisition" value="$200-800" subtext="After accounting for close rate" variant="bad" />
                <DataCard label="Customer Intent" value="Low" subtext="Price-shopping by design" variant="bad" />
              </div>

              <Paragraph>
                According to <InlineLink href="https://www.angi.com/" external>Angi&apos;s own investor reports</InlineLink>, the average homeowner receives quotes from 3-5 contractors per project. You&apos;re fighting for attention before you even get a chance to prove your value.
              </Paragraph>

              <SubHeading>Live Transfers: Better, But Still Expensive</SubHeading>

              <Paragraph>
                Live transfer companies qualify leads before connecting them to you. At least you&apos;re not competing with four other contractors on the same call. But you&apos;re paying a premium for that convenience.
              </Paragraph>

              <Paragraph>
                I used live transfers at Lapeyre Roofing during peak storm season when I needed volume fast. They worked for short-term lead generation — but they&apos;re a band-aid, not a strategy.
              </Paragraph>

              <SubHeading>PPC: Solid Returns, Linear Growth</SubHeading>

              <Paragraph>
                Google Ads and Local Services Ads are where things start to make sense. You&apos;re capturing intent — people actively searching for services in your area. No middlemen taking cuts.
              </Paragraph>

              <PullQuote>
                PPC is linear. You spend $5,000, you get X leads. The moment you stop spending, the leads stop coming. There&apos;s no compounding.
              </PullQuote>

              <SubHeading>SEO: The Compounding Asset</SubHeading>

              <Paragraph>
                This is why I started Obieo and why I&apos;ve invested heavily in SEO for my own roofing company. SEO is the <strong className="text-[var(--text-primary)]">only lead generation channel that actually compounds over time</strong>.
              </Paragraph>

              <div className="grid md:grid-cols-3 gap-4 my-8">
                <DataCard label="Cost/Lead (Once Ranking)" value="$25-50" variant="best" />
                <DataCard label="Close Rate" value="30-50%" subtext="Highest intent — they found YOU" variant="best" />
                <DataCard label="Cost/Acquisition" value="$50-150" variant="best" />
              </div>

              <SectionHeading>The Compounding Effect</SectionHeading>

              <Paragraph>
                Let me show you what I mean with real numbers from SEO-based contractor lead generation.
              </Paragraph>

              {/* Year-over-year comparison */}
              <div className="my-10 md:my-14 space-y-4">
                <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Year One</span>
                    <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">Building Foundation</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">$18-24K</p>
                      <p className="text-xs text-[var(--text-muted)]">Investment</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">50-100</p>
                      <p className="text-xs text-[var(--text-muted)]">Leads</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">$200-400</p>
                      <p className="text-xs text-[var(--text-muted)]">Cost/Lead</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Year Two</span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">Momentum Building</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">$18-24K</p>
                      <p className="text-xs text-[var(--text-muted)]">Investment</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">150-300</p>
                      <p className="text-xs text-[var(--text-muted)]">Leads</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">$60-160</p>
                      <p className="text-xs text-[var(--text-muted)]">Cost/Lead</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Year Three</span>
                    <span className="text-xs px-2 py-1 rounded bg-emerald-500 text-white font-bold">Compound Growth</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">$18-24K</p>
                      <p className="text-xs text-[var(--text-muted)]">Same Investment</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">300-500</p>
                      <p className="text-xs text-[var(--text-muted)]">3x the Leads</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$36-80</p>
                      <p className="text-xs text-[var(--text-muted)]">Cost/Lead</p>
                    </div>
                  </div>
                </div>
              </div>

              <KeyInsight title="The Bottom Line">
                With PPC, you&apos;re renting attention. With SEO, you&apos;re building equity. Same investment, triple the leads by year three — and they keep coming even if you pause for a month.
              </KeyInsight>

              <SectionHeading>Why Poor Lead Generation Keeps You Stuck</SectionHeading>

              <Paragraph>
                Here&apos;s the pattern I see constantly in businesses that plateau:
              </Paragraph>

              <div className="my-8 space-y-1">
                <NumberedStep number={1} title="Start with aggregators and referrals">
                  Works until about $500K. Then growth stalls because you&apos;re competing for shared leads.
                </NumberedStep>
                <NumberedStep number={2} title="Add PPC when growth slows">
                  Pushes revenue to $1-2M. Better leads, higher intent, but costs are linear.
                </NumberedStep>
                <NumberedStep number={3} title="Try to scale PPC, hit diminishing returns">
                  Stuck at $2-3M. Bidding wars with competitors. Margins getting squeezed.
                </NumberedStep>
                <NumberedStep number={4} title="Never build the organic foundation">
                  Miss the compounding effect entirely. Stay stuck while competitors who invested early pull ahead.
                </NumberedStep>
              </div>

              <PullQuote>
                The businesses that break through $3 million all have one thing in common: they invested in SEO early enough to let it compound.
              </PullQuote>

              <SectionHeading>The Math That Changes Everything</SectionHeading>

              <Paragraph>
                A typical roofing company at $2M revenue might be spending:
              </Paragraph>

              {/* Before/After Comparison */}
              <div className="grid md:grid-cols-2 gap-6 my-10">
                <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">Before: Typical Mix</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Aggregators: $1,500/mo</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">$1,500 CPA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Live transfers: $2,000/mo</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">$667 CPA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">PPC: $3,000/mo</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">$429 CPA</span>
                    </div>
                    <div className="pt-3 border-t border-[var(--border)] flex justify-between font-semibold">
                      <span className="text-[var(--text-primary)]">$6,500/month</span>
                      <span className="text-[var(--text-primary)]">11 jobs • $591 avg CPA</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-4">After: Optimized Mix</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">PPC: $3,000/mo</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">$429 CPA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">SEO: $1,500/mo</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">$100 CPA</span>
                    </div>
                    <div className="pt-3 border-t border-emerald-200 dark:border-emerald-700 flex justify-between font-semibold">
                      <span className="text-[var(--text-primary)]">$4,500/month</span>
                      <span className="text-emerald-600 dark:text-emerald-400">22 jobs • $205 avg CPA</span>
                    </div>
                  </div>
                </div>
              </div>

              <KeyInsight title="The Result">
                <strong>Same marketing budget. Twice the jobs. Less than half the cost per acquisition.</strong> That&apos;s how you break through the ceiling.
              </KeyInsight>

              <SectionHeading>Breaking Through the Ceiling</SectionHeading>

              <Paragraph>
                If you&apos;re stuck between $1.5 and $3 million, you don&apos;t have a &quot;business problem.&quot; You have a lead generation problem. Here&apos;s how to fix it:
              </Paragraph>

              <div className="my-8 space-y-1">
                <NumberedStep number={1} title="Track your real cost per acquisition by channel">
                  Most businesses have never done this. Use our <InlineLink href="/roi-calculator">ROI Calculator</InlineLink> to start.
                </NumberedStep>
                <NumberedStep number={2} title="Reduce or eliminate aggregator spend">
                  The math almost never works. Stop burning money on shared leads.
                </NumberedStep>
                <NumberedStep number={3} title="Keep PPC for immediate volume">
                  It works. It&apos;s just not going to compound. Use it strategically.
                </NumberedStep>
                <NumberedStep number={4} title="Build your SEO foundation now">
                  Every month you wait is a month of compounding you lose. Start today.
                </NumberedStep>
              </div>

              <Paragraph>
                The businesses that dominate their markets five years from now are the ones investing in organic lead generation today. Everyone else will still be fighting over the same expensive, shared leads.
              </Paragraph>

              {/* Author Box */}
              <div className="my-16 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-[var(--accent)]/20">
                    HL
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] text-lg">Hunter Lapeyre</p>
                    <p className="text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Hunter owns <InlineLink href="/">Obieo</InlineLink> (SEO for home service businesses) and <InlineLink href="/work/lapeyre-roofing">Lapeyre Roofing</InlineLink>. He writes about what actually works for contractor lead generation — tested on his own business first.
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
                Ready to Fix Your Lead Generation?
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto leading-relaxed">
                I work with a small number of home service businesses to build SEO systems that actually compound. No account managers. No templates. Just strategies I&apos;ve tested on my own roofing company first.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/call"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-all hover:scale-105 shadow-lg shadow-[var(--accent)]/25"
                >
                  Book a Free Call
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/roi-calculator"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-[var(--border)] text-[var(--text-primary)] font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  Try the ROI Calculator
                </Link>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-6">
                20 minutes, no pitch deck, just honest talk about whether I can help.
              </p>
            </div>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}
