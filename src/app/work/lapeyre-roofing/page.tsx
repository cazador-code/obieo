import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection, Counter } from '@/components/animations'
import CalendlyButton from '@/components/CalendlyButton'

// JSON-LD Schema for Case Study Article
const caseStudySchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How I Fired My SEO Agency and Jumped 5 Spots in 30 Days',
  description: 'After spending tens of thousands on an agency that made me feel like a number, I took control of my roofing company\'s SEO. The results: +5 ranking positions and 66% more search impressions in month one.',
  url: 'https://obieo.com/work/lapeyre-roofing',
  datePublished: '2025-01-01',
  dateModified: '2025-01-01',
  author: {
    '@type': 'Person',
    name: 'Hunter Lapeyre',
    url: 'https://obieo.com/about',
    jobTitle: 'Founder & SEO Consultant',
    worksFor: {
      '@type': 'Organization',
      name: 'Obieo',
    },
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
  image: 'https://obieo.com/case-studies/lapeyre-roofing/mockup.svg',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://obieo.com/work/lapeyre-roofing',
  },
  about: {
    '@type': 'Organization',
    name: 'Lapeyre Roofing',
    description: 'Roofing company serving Texas and Louisiana',
  },
}

export const metadata: Metadata = {
  title: 'How I Fired My SEO Agency and Jumped 5 Spots in 30 Days | Obieo',
  description: 'After spending tens of thousands on an agency that made me feel like a number, I took control of my roofing company\'s SEO. The results: +5 ranking positions and 66% more search impressions in month one.',
  openGraph: {
    title: 'How I Fired My SEO Agency and Jumped 5 Spots in 30 Days',
    description: 'A roofing company owner\'s story of breaking free from expensive agencies and getting real results.',
  },
}

export default function LapeyreRoofingCaseStudy() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudySchema) }}
      />

      {/* Hero - Editorial Magazine Style */}
      <section className="relative min-h-[90vh] flex items-center bg-[#0c0a09] overflow-hidden">
        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--accent)] via-[var(--accent)]/50 to-transparent" />

        <Container size="xl" className="relative z-10 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeInSection>
                <Link
                  href="/work"
                  className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-8 group"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Work
                </Link>
              </FadeInSection>

              <FadeInSection delay={0.1}>
                <p className="text-[var(--accent)] uppercase tracking-[0.2em] text-sm font-medium mb-6">
                  Case Study: My Own Company
                </p>
              </FadeInSection>

              <FadeInSection delay={0.2}>
                <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                  I Spent <span className="text-[var(--accent)]">Tens of Thousands</span> on an Agency.
                </h1>
              </FadeInSection>

              <FadeInSection delay={0.3}>
                <p className="text-2xl sm:text-3xl lg:text-4xl text-white/60 mt-4 font-light">
                  They made me feel like a number.
                </p>
              </FadeInSection>

              <FadeInSection delay={0.4}>
                <p className="text-xl text-white/80 mt-8 max-w-xl leading-relaxed">
                  So I took control. Rebuilt everything myself. And in 30 days, I jumped
                  <strong className="text-white"> 5 spots</strong> in average Google rankings with a
                  <strong className="text-white"> 66% increase</strong> in search impressions.
                </p>
              </FadeInSection>

              <FadeInSection delay={0.5}>
                <p className="text-lg text-white/50 mt-6 italic">
                  This is why I started Obieo.
                </p>
              </FadeInSection>
            </div>

            <FadeInSection delay={0.3}>
              <div className="relative">
                {/* Mockup container with editorial styling */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl shadow-black/50">
                  <Image
                    src="/case-studies/lapeyre-roofing/mockup.svg"
                    alt="Lapeyre Roofing website redesign on laptop"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                {/* Floating logo badge */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white rounded-xl shadow-xl p-4 flex items-center justify-center">
                  <Image
                    src="/case-studies/lapeyre-roofing/logo.svg"
                    alt="Lapeyre Roofing logo"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
              </div>
            </FadeInSection>
          </div>
        </Container>
      </section>

      {/* The Numbers - Bold Statement */}
      <Section variant="alternate" size="sm">
        <Container>
          <div className="grid grid-cols-3 gap-8 py-4">
            <FadeInSection>
              <div className="text-center">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--accent)] font-[family-name:var(--font-display)]">
                  <Counter value={5} prefix="+" />
                </p>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 uppercase tracking-wide">
                  Ranking Positions
                </p>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.1}>
              <div className="text-center">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--accent)] font-[family-name:var(--font-display)]">
                  <Counter value={66} suffix="%" />
                </p>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 uppercase tracking-wide">
                  More Impressions
                </p>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.2}>
              <div className="text-center">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--accent)] font-[family-name:var(--font-display)]">
                  <Counter value={30} />
                </p>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 uppercase tracking-wide">
                  Days to Results
                </p>
              </div>
            </FadeInSection>
          </div>
        </Container>
      </Section>

      {/* The Story - Long-form Editorial */}
      <Section size="lg">
        <Container size="md">
          {/* Chapter 1: The Problem */}
          <FadeInSection>
            <div className="mb-20">
              <p className="text-[var(--accent)] uppercase tracking-[0.15em] text-sm font-medium mb-4">
                Chapter 1
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-8">
                The $2,500/Month Disappointment
              </h2>
              <div className="prose prose-lg max-w-none text-[var(--text-secondary)] space-y-6">
                <p className="text-xl leading-relaxed">
                  I run <strong className="text-[var(--text-primary)]">Lapeyre Roofing</strong> — a real
                  roofing company serving Texas and Louisiana. Real crews. Real trucks. Real customers
                  who need their roofs fixed after storms.
                </p>
                <p className="leading-relaxed">
                  Like most home service business owners, I knew I needed to show up on Google. So I
                  did what everyone tells you to do: I hired an agency. A reputable one. The kind
                  with case studies and testimonials and a slick sales process.
                </p>
                <p className="leading-relaxed">
                  The invoice was <strong className="text-[var(--text-primary)]">$2,500 per month</strong>.
                  And for months, I paid it. Trusting the process. Waiting for results.
                </p>
              </div>
            </div>
          </FadeInSection>

          {/* Pull Quote */}
          <FadeInSection delay={0.1}>
            <blockquote className="relative my-16 py-8 px-8 sm:px-12 border-l-4 border-[var(--accent)] bg-[var(--bg-secondary)] rounded-r-xl">
              <p className="text-2xl sm:text-3xl font-[family-name:var(--font-display)] text-[var(--text-primary)] leading-snug italic">
                "Every month I got a report I didn't understand, sent by a person I'd never met,
                about work I couldn't verify."
              </p>
              <footer className="mt-6 text-[var(--text-secondary)]">
                — Hunter Lapeyre, Owner
              </footer>
            </blockquote>
          </FadeInSection>

          {/* Chapter 2: The Realization */}
          <FadeInSection>
            <div className="mb-20">
              <p className="text-[var(--accent)] uppercase tracking-[0.15em] text-sm font-medium mb-4">
                Chapter 2
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-8">
                The Moment I Knew
              </h2>
              <div className="prose prose-lg max-w-none text-[var(--text-secondary)] space-y-6">
                <p className="leading-relaxed">
                  It hit me during one of those monthly "strategy" calls. The account manager — my
                  fourth in two years — was walking me through another PDF full of graphs. He
                  couldn't tell me which services were actually generating leads. He didn't know
                  my service area. He mispronounced my company name.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-[var(--text-primary)]">I wasn't a client. I was a line item.</strong>
                </p>
                <p className="leading-relaxed">
                  The agency had 200+ clients. My account was managed by someone who managed 40 other
                  accounts. They were applying the same template to my roofing company that they
                  applied to dentists, lawyers, and plumbers. No understanding of storm season. No
                  understanding of what makes homeowners trust a roofer.
                </p>
                <p className="leading-relaxed">
                  I had spent <strong className="text-[var(--text-primary)]">tens of thousands of dollars</strong>{" "}
                  and felt no closer to dominating my market.
                </p>
              </div>
            </div>
          </FadeInSection>

          {/* Chapter 3: Taking Control */}
          <FadeInSection>
            <div className="mb-20">
              <p className="text-[var(--accent)] uppercase tracking-[0.15em] text-sm font-medium mb-4">
                Chapter 3
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-8">
                I Did It Myself
              </h2>
              <div className="prose prose-lg max-w-none text-[var(--text-secondary)] space-y-6">
                <p className="leading-relaxed">
                  I canceled the contract. Then I did something that would have seemed crazy a year
                  earlier: <strong className="text-[var(--text-primary)]">I rebuilt everything myself.</strong>
                </p>
                <p className="leading-relaxed">
                  I learned technical SEO. I studied what actually makes Google trust a local
                  business. I rewrote every page of my website with real knowledge — the kind you
                  only get from actually running a roofing company. I optimized for local keywords
                  that mattered. I built content that answered the questions my actual customers
                  were asking.
                </p>
                <p className="leading-relaxed">
                  Most importantly, I understood something the agency never did:
                  <strong className="text-[var(--text-primary)]"> homeowners don't want a vendor. They want someone
                  they can trust with their biggest investment.</strong>
                </p>
                <p className="leading-relaxed">
                  Every word on my new site was written to build that trust. No stock photos. No
                  generic "we're the best" claims. Just honest, specific information about how we
                  work and why.
                </p>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* Results Section - Visual Impact */}
      <section className="relative py-24 bg-[#0c0a09] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <Container size="md" className="relative z-10">
          <FadeInSection>
            <p className="text-[var(--accent)] uppercase tracking-[0.15em] text-sm font-medium mb-4">
              Chapter 4
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-white mb-8">
              The First Month
            </h2>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <div className="prose prose-lg prose-invert max-w-none space-y-6">
              <p className="text-white/80 leading-relaxed">
                Thirty days after launching the new site, I opened Google Search Console.
              </p>
            </div>
          </FadeInSection>

          {/* Big number callout */}
          <FadeInSection delay={0.2}>
            <div className="my-12 grid sm:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-5xl sm:text-6xl font-bold text-[var(--accent)] font-[family-name:var(--font-display)]">
                  +5
                </p>
                <p className="text-white/60 mt-2 text-lg">Average Ranking Positions</p>
                <p className="text-white/40 mt-1 text-sm">Keywords moved from page 2 to page 1</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-5xl sm:text-6xl font-bold text-[var(--accent)] font-[family-name:var(--font-display)]">
                  +66%
                </p>
                <p className="text-white/60 mt-2 text-lg">Search Impressions</p>
                <p className="text-white/40 mt-1 text-sm">Month-over-month increase</p>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.3}>
            <div className="prose prose-lg prose-invert max-w-none space-y-6">
              <p className="text-white/80 leading-relaxed">
                In one month, I accomplished more than the agency had in the previous year. Not
                because I'm smarter than them — but because I actually
                <strong className="text-white"> gave a damn</strong> about the results.
              </p>
              <p className="text-white/80 leading-relaxed">
                No one will ever care about your business as much as you do. And no agency with
                200 clients will ever give you the attention your business deserves.
              </p>
            </div>
          </FadeInSection>
        </Container>
      </section>

      {/* AI Search Proof - Gemini Recommendation */}
      <Section size="lg" variant="alternate">
        <Container size="md">
          <FadeInSection>
            <p className="text-[var(--accent)] uppercase tracking-[0.15em] text-sm font-medium mb-4">
              Chapter 5
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-8">
              AI Search Is Already Here
            </h2>
            <div className="prose prose-lg max-w-none text-[var(--text-secondary)] space-y-6">
              <p className="text-xl leading-relaxed">
                Six weeks after launching the new site, I asked Gemini:
                <em className="text-[var(--text-primary)]"> "I need a roof replaced here in Austin, Texas. What are some companies I should call?"</em>
              </p>
            </div>
          </FadeInSection>

          {/* Gemini Quote Card */}
          <FadeInSection delay={0.1}>
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
                    a <strong className="text-[var(--text-primary)]">"smaller company with good people"</strong> and for
                    effective communication during the claims process.
                  </p>
                </div>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="prose prose-lg max-w-none text-[var(--text-secondary)] space-y-6">
              <p className="leading-relaxed">
                Lapeyre Roofing is being recommended <strong className="text-[var(--text-primary)]">alongside companies
                that have been in business for 40-50 years</strong> — Kidd Roofing (since 1982), Ja-Mar (50+ years),
                Wilson Roofing. Companies with decades of brand recognition.
              </p>
              <p className="leading-relaxed">
                This isn't just Google anymore. AI is changing how people find services. And the strategies that
                work for AI search are different from traditional SEO.
              </p>
              <p className="text-xl leading-relaxed text-[var(--text-primary)]">
                <strong>Most agencies haven't even started thinking about this. I've been optimizing for it from day one.</strong>
              </p>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* The Transformation */}
      <Section size="lg">
        <Container size="md">
          <FadeInSection>
            <div className="mb-16">
              <p className="text-[var(--accent)] uppercase tracking-[0.15em] text-sm font-medium mb-4">
                What I Learned
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-8">
                The Agency Model Is Broken for Home Services
              </h2>
              <div className="prose prose-lg max-w-none text-[var(--text-secondary)] space-y-6">
                <p className="leading-relaxed">
                  Most SEO agencies are built to scale. More clients, more revenue, more account
                  managers managing more accounts. It works for their business model. It doesn't
                  work for yours.
                </p>
                <p className="leading-relaxed">
                  Here's what they don't understand about home service businesses:
                </p>
              </div>
            </div>
          </FadeInSection>

          {/* Key insights as visual cards */}
          <div className="grid gap-6 mb-16">
            {[
              {
                number: '01',
                title: 'Seasonality changes everything',
                desc: 'A roofer in Texas has different busy seasons than one in Minnesota. Generic "content calendars" miss this entirely.',
              },
              {
                number: '02',
                title: 'Trust is the conversion factor',
                desc: 'Homeowners are inviting strangers onto their property to work on their biggest investment. That requires a different kind of marketing.',
              },
              {
                number: '03',
                title: 'Local reputation is compounding',
                desc: 'The contractor who dominates Google Maps reviews in one city can expand. The one who pays for generic backlinks can\'t.',
              },
              {
                number: '04',
                title: 'AI search is changing the game',
                desc: 'ChatGPT, Perplexity, and AI Overviews are changing how people find services. Most agencies haven\'t even started adapting.',
              },
            ].map((insight, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="flex gap-6 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                  <span className="text-3xl font-bold text-[var(--accent)] font-[family-name:var(--font-display)]">
                    {insight.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      {insight.title}
                    </h3>
                    <p className="text-[var(--text-secondary)]">{insight.desc}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </Container>
      </Section>

      {/* Why I Started Obieo */}
      <Section variant="alternate" size="lg">
        <Container size="md">
          <FadeInSection>
            <p className="text-[var(--accent)] uppercase tracking-[0.15em] text-sm font-medium mb-4">
              The Mission
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-8">
              Why I Started Obieo
            </h2>
            <div className="prose prose-lg max-w-none text-[var(--text-secondary)] space-y-6">
              <p className="text-xl leading-relaxed">
                I know how hard it is to earn a dollar in this industry. I know what it feels like
                to write a $2,500 check every month and wonder if anyone at that agency actually
                cares whether your phone rings.
              </p>
              <p className="leading-relaxed">
                <strong className="text-[var(--text-primary)]">Obieo exists to save other home service
                business owners from that experience.</strong>
              </p>
              <p className="leading-relaxed">
                I keep my client list small — intentionally. I'm not trying to build a 200-client
                agency. I want a handful of home service companies I can actually help. Companies
                where I learn your specific market, understand your seasonality, and care about
                your results like they're my own.
              </p>
              <p className="leading-relaxed">
                Because in a way, they are. I'm still running Lapeyre Roofing. I'm testing every
                strategy on my own business before I recommend it to you. When something stops
                working, I know before you do — because I see it in my own numbers first.
              </p>
            </div>
          </FadeInSection>

          {/* Value Props */}
          <FadeInSection delay={0.2}>
            <div className="mt-12 grid sm:grid-cols-2 gap-6">
              <div className="bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border)]">
                <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Work With Me Directly</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  No account managers. No hand-offs. You text me, email me, call me. I'm the one
                  doing the work.
                </p>
              </div>
              <div className="bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border)]">
                <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Battle-Tested Strategies</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Everything I recommend, I've tested on my own business first. Real data. Real
                  results. No theory.
                </p>
              </div>
              <div className="bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border)]">
                <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Small Client List</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  I don't want 50 clients. I want a handful I can actually help dominate their
                  local markets.
                </p>
              </div>
              <div className="bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border)]">
                <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Ahead on AI Search</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  ChatGPT, Perplexity, AI Overviews — I've been optimizing for these since the
                  beginning. Most agencies are still catching up.
                </p>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* CTA - Personal and Direct */}
      <section className="relative py-24 bg-[#0c0a09] overflow-hidden">
        <Container size="md" className="relative z-10 text-center">
          <FadeInSection>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Tired of Feeling Like a Number?
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Let's talk. No sales pitch. No pressure. Just a conversation about your business
              and whether I can actually help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CalendlyButton source="case-study-lapeyre" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-lg transition-all text-lg">
                Book a Free Call
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </CalendlyButton>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                  Send Me an Email
                </Button>
              </Link>
            </div>
            <p className="text-white/40 mt-8 text-sm">
              Or email me directly: <a href="mailto:hunter@obieo.com" className="text-[var(--accent)] hover:underline">hunter@obieo.com</a>
            </p>
          </FadeInSection>
        </Container>
      </section>
    </>
  )
}
