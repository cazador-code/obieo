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

// JSON-LD Schemas
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Home Services SEO: The Complete Guide for 2026',
  description:
    'The definitive guide to SEO for home service companies. Learn local SEO, Google Business Profile optimization, content strategy, and AI search tactics for plumbers, roofers, electricians, HVAC, and more.',
  image: 'https://www.obieo.com/og-home-services-seo.jpg',
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
    '@id': 'https://www.obieo.com/home-services-seo',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Home Services SEO',
  description:
    'SEO and local search optimization for home service companies including plumbers, roofers, electricians, HVAC contractors, and more.',
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://www.obieo.com',
  },
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  serviceType: 'Search Engine Optimization',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is home services SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Home services SEO is the practice of optimizing a home service company\'s online presence to rank higher in local and organic search results. It includes Google Business Profile optimization, local citation building, on-page SEO for service and area pages, review management, and content marketing tailored to trades like plumbing, HVAC, roofing, and electrical.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does SEO cost for a home service business?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SEO for home service businesses typically costs between $1,000 and $5,000 per month depending on market competition, number of service areas, and scope of work. Most contractors see a positive ROI within 4-6 months, with the average home service SEO campaign generating $3-$8 in revenue for every $1 spent.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does SEO take to work for contractors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most home service businesses see measurable improvements in 3-6 months. Quick wins like Google Business Profile optimization and citation cleanup can show results in weeks. Competitive keyword rankings typically take 4-8 months. Businesses in less competitive markets or smaller cities often see faster results than those in major metros.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is local SEO for home services?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Local SEO for home services focuses on ranking in Google\'s Local Pack (map results) and local organic results. Key tactics include optimizing your Google Business Profile, building consistent NAP citations across directories, earning reviews, creating location-specific service pages, and building local backlinks. 46% of all Google searches have local intent, making local SEO critical for service businesses.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is SEO worth it for plumbers, electricians, and HVAC companies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The average cost per lead from SEO for home service businesses is $25-$75, compared to $150-$400 from Google Ads and $200-$500 from lead generation sites like Angi or HomeAdvisor. SEO also builds a compounding asset: once you rank, you continue getting leads without ongoing ad spend. 78% of local mobile searches result in an offline purchase within 24 hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the most important ranking factor for home service SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Google Business Profile optimization is the single most important ranking factor for the Local Pack, which is where most home service leads come from. This includes having a complete profile, earning consistent reviews (quantity and recency), selecting accurate categories, adding photos regularly, and posting updates. For organic rankings, on-page content quality and relevance are most important.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get more Google reviews for my home service business?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most effective review strategy is to ask every customer immediately after completing a job. Send a direct link to your Google review page via text message within 1 hour of job completion. Businesses that implement a systematic review request process see 3-5x more reviews. Never offer incentives for reviews as this violates Google\'s policies.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should home service businesses invest in SEO or Google Ads?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The best strategy is both, but if you can only pick one, start with SEO. Google Ads delivers immediate leads but stops the moment you stop paying. SEO takes longer to build but generates leads at a fraction of the cost long-term. Most successful home service companies allocate 60-70% of their marketing budget to SEO and 30-40% to Google Ads for immediate coverage while SEO builds.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is AI search changing home services marketing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI search engines like ChatGPT, Google AI Overviews, and Perplexity are increasingly answering home service queries directly. By 2028, Gartner predicts a 50% reduction in traditional organic traffic. Home service companies that optimize for AI citations now -- through structured data, factual content, and strong review profiles -- will capture leads that competitors lose as search behavior shifts.',
      },
    },
    {
      '@type': 'Question',
      name: 'What pages should a home service website have for SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every home service website needs: a homepage with clear service and location targeting, individual service pages for each service offered (e.g., "drain cleaning," "AC repair"), location/area pages for each city or neighborhood served, an about page with trust signals, a reviews/testimonials page, and a blog with helpful content. Each service + location combination should have its own page.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Home Services SEO | SEO for Home Service Companies | Obieo',
  description:
    'The complete guide to SEO for home service businesses. Learn local SEO, Google Business Profile optimization, review management, and content strategy for plumbers, roofers, electricians, HVAC, and 10+ trades.',
  alternates: {
    canonical: '/home-services-seo',
  },
  openGraph: {
    title: 'Home Services SEO: The Complete Guide for 2026',
    description:
      '97% of consumers search online before hiring a home service company. Learn the SEO strategies that drive leads for plumbers, roofers, electricians, and more.',
    url: 'https://www.obieo.com/home-services-seo',
  },
}

const tocSections = [
  { id: 'what-is-home-services-seo', title: 'What Is Home Services SEO?' },
  { id: 'why-seo-matters', title: 'Why Home Service Companies Need SEO' },
  { id: 'industries-we-serve', title: 'Industries We Serve' },
  { id: 'local-seo-fundamentals', title: 'Local SEO Fundamentals' },
  { id: 'content-strategy', title: 'Content Strategy for Trades' },
  { id: 'geo-aeo', title: 'GEO and AEO for Home Services' },
  { id: 'measuring-roi', title: 'Measuring SEO ROI' },
  { id: 'faq', title: 'Frequently Asked Questions' },
]

interface IndustryCardProps {
  href: string
  title: string
  description: string
}

function IndustryCard({ href, title, description }: IndustryCardProps) {
  return (
    <Link
      href={href}
      className="group block p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-[var(--accent)]/5 transition-all"
    >
      <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
      <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
        Learn more
        <svg
          className="w-4 h-4 transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </span>
    </Link>
  )
}

export default function HomeServicesSEOPage() {
  return (
    <>
      {/* JSON-LD Schema */}
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

      {/* Hero */}
      <Section size="lg" className="pt-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute top-20 right-0 w-[500px] h-[500px] text-[var(--accent)] opacity-[0.03]"
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="80" fill="currentColor" />
          </svg>
          <svg
            className="absolute -bottom-32 -left-32 w-96 h-96 text-[var(--accent)] opacity-[0.04]"
            viewBox="0 0 200 200"
          >
            <rect
              x="20"
              y="20"
              width="160"
              height="160"
              rx="20"
              fill="currentColor"
            />
          </svg>
        </div>

        <Container size="md" className="relative">
          <FadeInSection>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--accent)] text-white uppercase tracking-wide">
                Pillar Guide
              </span>
              <span className="text-sm text-[var(--text-muted)]">
                Updated February 2026
              </span>
              <span className="text-sm text-[var(--text-muted)]">
                &bull;
              </span>
              <span className="text-sm text-[var(--text-muted)]">
                18 min read
              </span>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8 leading-[1.1]">
              Home Services SEO: The Complete Guide for 2026
            </h1>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              <strong className="text-[var(--text-primary)]">
                97% of consumers search online before hiring a home service
                company.
              </strong>{' '}
              Learn exactly how to make sure they find yours.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.3}>
            <div className="flex items-center gap-4 mt-10 pt-8 border-t border-[var(--border)]">
              <div className="w-14 h-14 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[var(--accent)]/20">
                HL
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">
                  Hunter Lapeyre
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Founder, Obieo &amp; Lapeyre Roofing
                </p>
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
                If you run a plumbing, HVAC, roofing, electrical, or any other
                home service company, your next customer is searching for you
                right now. The question is whether they find you or your
                competitor. Home services SEO is the single most cost-effective
                way to generate leads for trade businesses, delivering an
                average return of $5 to $12 for every $1 invested.
              </Paragraph>

              <Paragraph>
                This guide covers everything you need to know about SEO for home
                service businesses in 2026: from Google Business Profile
                optimization and local rankings to the emerging world of AI
                search. Whether you&apos;re a one-truck operation or managing
                multiple locations, these strategies will help you get found by
                homeowners who need your services today.
              </Paragraph>

              <BlogTableOfContents sections={tocSections} />

              {/* --- Section 1: What Is Home Services SEO? --- */}
              <SectionHeading id="what-is-home-services-seo">
                What Is Home Services SEO?
              </SectionHeading>

              <Paragraph>
                <strong className="text-[var(--text-primary)]">
                  Home services SEO is the practice of optimizing a home service
                  company&apos;s website and online presence to rank higher in
                  search engine results, attract more local customers, and
                  generate qualified leads without paying for ads.
                </strong>{' '}
                It combines local SEO tactics like Google Business Profile
                optimization and citation building with on-page content
                strategies, technical improvements, and review management
                tailored specifically to trade businesses.
              </Paragraph>

              <Paragraph>
                Unlike general SEO, home services SEO focuses heavily on
                geographic targeting. A plumber in Dallas doesn&apos;t need to
                rank nationally for &quot;emergency plumbing&quot; &mdash; they
                need to rank for &quot;emergency plumber near me&quot; or
                &quot;plumber in Dallas TX&quot; when a homeowner has a burst
                pipe at 2am.
              </Paragraph>

              <div className="grid md:grid-cols-3 gap-4 my-8">
                <DataCard
                  label="Avg SEO Lead Cost"
                  value="$25-75"
                  subtext="vs. $150-400 from Google Ads"
                  variant="highlight"
                />
                <DataCard
                  label="Local Search Intent"
                  value="46%"
                  subtext="of all Google searches are local"
                />
                <DataCard
                  label="Mobile to Purchase"
                  value="78%"
                  subtext="of local mobile searches lead to a purchase within 24 hours"
                  variant="highlight"
                />
              </div>

              <Paragraph>
                The core difference between SEO and paid advertising is
                compounding value. When you stop paying for Google Ads or lead
                generation services like Angi, the leads stop immediately. SEO
                builds an asset: once you rank, you continue generating leads
                month after month without additional spend.
              </Paragraph>

              {/* --- Section 2: Why Home Service Companies Need SEO --- */}
              <SectionHeading id="why-seo-matters">
                Why Home Service Companies Need SEO
              </SectionHeading>

              <Paragraph>
                The home services industry is projected to reach $1.1 trillion
                by 2028. Competition for these customers is fierce, and the
                battlefield has shifted online. Here&apos;s why SEO is no longer
                optional for contractors.
              </Paragraph>

              <SubHeading>
                Search Is Where Homeowners Start
              </SubHeading>

              <Paragraph>
                &quot;Near me&quot; searches have grown over 500% in the last
                five years. When a homeowner&apos;s AC breaks in July or their
                roof starts leaking, their first action is to pull out their
                phone and search. If your business doesn&apos;t appear in the
                first few results, you don&apos;t exist to that customer.
              </Paragraph>

              <div className="grid md:grid-cols-2 gap-4 my-8">
                <DataCard
                  label={'"Near Me" Growth'}
                  value="500%+"
                  subtext="increase in last 5 years"
                  variant="highlight"
                />
                <DataCard
                  label="Click on Page 1"
                  value="92%"
                  subtext="of searchers never go past page 1"
                  variant="warning"
                />
              </div>

              <SubHeading>Lead Costs Are Climbing Everywhere Else</SubHeading>

              <Paragraph>
                Google Ads CPCs for home service keywords have risen 15-25%
                year-over-year since 2023. Lead generation platforms like
                HomeAdvisor and Angi charge $15-$150 per lead &mdash; and you
                share those leads with 3-4 other contractors. SEO leads are
                exclusive to your business and cost a fraction of the price
                long-term.
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                  Average Cost Per Lead by Channel
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        SEO (Organic)
                      </span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        $25-$75
                      </span>
                    </div>
                    <div className="w-full bg-[var(--border)] rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full w-[15%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        Google Ads (PPC)
                      </span>
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        $150-$400
                      </span>
                    </div>
                    <div className="w-full bg-[var(--border)] rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full w-[55%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        Lead Gen (Angi, HomeAdvisor)
                      </span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        $200-$500
                      </span>
                    </div>
                    <div className="w-full bg-[var(--border)] rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full w-[75%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        Social Media Ads
                      </span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        $100-$300
                      </span>
                    </div>
                    <div className="w-full bg-[var(--border)] rounded-full h-2">
                      <div className="bg-red-400 h-2 rounded-full w-[45%]" />
                    </div>
                  </div>
                </div>
              </div>

              <SubHeading>SEO Builds Business Value</SubHeading>

              <Paragraph>
                A home service business that generates consistent organic leads
                is worth significantly more than one dependent on paid
                advertising. Acquirers and investors look at marketing
                defensibility &mdash; organic rankings are a moat that
                competitors can&apos;t simply outbid. Use our{' '}
                <InlineLink href="/roi-calculator">SEO ROI Calculator</InlineLink>{' '}
                to see the impact for your specific business.
              </Paragraph>

              <PullQuote>
                The best time to start SEO for your home service business was a
                year ago. The second best time is today.
              </PullQuote>

              {/* --- Section 3: Industries We Serve --- */}
              <SectionHeading id="industries-we-serve">
                Industries We Serve
              </SectionHeading>

              <Paragraph>
                Every home service trade has unique SEO challenges &mdash;
                different keywords, seasonality patterns, competition levels,
                and customer search behaviors. We&apos;ve built specialized
                strategies for each. Explore the guides below for
                industry-specific tactics.
              </Paragraph>

              <div className="grid sm:grid-cols-2 gap-4 my-8">
                <IndustryCard
                  href="/industries/roofing"
                  title="Roofing SEO"
                  description="Storm-driven demand, seasonal surges, and high-ticket jobs make roofing one of the most competitive (and lucrative) SEO niches. Learn how to rank for emergency and planned roofing services."
                />
                <IndustryCard
                  href="/industries/hvac"
                  title="HVAC SEO"
                  description="Seasonal search spikes in summer and winter mean HVAC companies need year-round SEO strategies. Rank for AC repair, furnace installation, and maintenance services."
                />
                <IndustryCard
                  href="/industries/plumbing"
                  title="Plumber SEO"
                  description="Emergency plumbing searches peak after hours and on weekends. 24/7 visibility in local search is critical for capturing high-intent, urgent leads."
                />
                <IndustryCard
                  href="/industries/electrical"
                  title="Electrician SEO"
                  description="From residential rewiring to EV charger installation, electricians need to rank for both traditional and emerging service keywords."
                />
                <IndustryCard
                  href="/industries/pest-control"
                  title="Pest Control SEO"
                  description="Pest control searches are highly seasonal and location-specific. Rank for termite, rodent, and insect removal in your service areas."
                />
                <IndustryCard
                  href="/industries/landscaping"
                  title="Landscaping SEO"
                  description="Landscaping and lawn care companies compete locally on visual quality and reviews. SEO helps you win before the first estimate."
                />
                <IndustryCard
                  href="/industries/cleaning"
                  title="Cleaning SEO"
                  description="Residential and commercial cleaning businesses need hyper-local targeting. Rank for recurring service keywords that generate long-term customer value."
                />
                <IndustryCard
                  href="/industries/garage-doors"
                  title="Garage Door SEO"
                  description="Garage door repair is a high-urgency search with strong local intent. Fast-loading, mobile-first pages are critical for capturing these leads."
                />
                <IndustryCard
                  href="/industries/painting"
                  title="Painting SEO"
                  description="Interior and exterior painting companies benefit from visual content optimization and area-page strategies targeting neighborhoods and cities."
                />
                <IndustryCard
                  href="/industries/flooring"
                  title="Flooring SEO"
                  description="Flooring installation searches have commercial and residential intent. Target material-specific keywords (hardwood, tile, LVP) alongside service areas."
                />
              </div>

              <KeyInsight title="The Hub Strategy">
                Internal links between this pillar page and each industry page
                create a topical cluster that signals authority to search
                engines. Google&apos;s algorithms reward sites that demonstrate
                comprehensive expertise across related topics.
              </KeyInsight>

              {/* --- Section 4: Local SEO Fundamentals --- */}
              <SectionHeading id="local-seo-fundamentals">
                Local SEO Fundamentals for Home Services
              </SectionHeading>

              <Paragraph>
                Local SEO is the backbone of home services marketing. When
                someone searches for &quot;plumber near me&quot; or
                &quot;roofer in [city],&quot; Google serves results from the
                Local Pack (the map with 3 listings) and local organic results.
                Ranking in both is where the majority of home service leads come
                from.
              </Paragraph>

              <SubHeading>
                Google Business Profile Optimization
              </SubHeading>

              <Paragraph>
                Your Google Business Profile (GBP) is the single most important
                ranking factor for the Local Pack. A fully optimized GBP can
                generate 5-10x more calls than an incomplete one.
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                  GBP Optimization Checklist
                </p>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 font-bold">
                      1.
                    </span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Complete every field
                      </strong>{' '}
                      &mdash; Business name, address, phone, hours, service
                      areas, categories, attributes, and description. Leave
                      nothing blank.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 font-bold">
                      2.
                    </span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Choose accurate primary and secondary categories
                      </strong>{' '}
                      &mdash; Your primary category has the biggest impact on
                      Local Pack rankings. Use the most specific option
                      available.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 font-bold">
                      3.
                    </span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Add photos weekly
                      </strong>{' '}
                      &mdash; Businesses with 100+ photos get 520% more calls
                      and 2,717% more direction requests than the average
                      business.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 font-bold">
                      4.
                    </span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Post updates regularly
                      </strong>{' '}
                      &mdash; Google Business Posts signal activity and
                      relevance. Share completed jobs, seasonal tips, or special
                      offers.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 font-bold">
                      5.
                    </span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Enable messaging and Q&A
                      </strong>{' '}
                      &mdash; More engagement channels mean more signals to
                      Google that your business is active and responsive.
                    </span>
                  </li>
                </ul>
              </div>

              <SubHeading>Citation Building and NAP Consistency</SubHeading>

              <Paragraph>
                Citations are mentions of your business name, address, and phone
                number (NAP) across the web. Consistent NAP data across
                directories, review sites, and social platforms builds trust with
                search engines.
              </Paragraph>

              <Paragraph>
                The most important citation sources for home service businesses
                include Google Business Profile, Yelp, BBB, Angi, HomeAdvisor,
                Facebook, Apple Maps, Bing Places, and industry-specific
                directories. Inconsistencies &mdash; even small ones like
                &quot;Street&quot; vs. &quot;St.&quot; &mdash; can hurt your
                local rankings.
              </Paragraph>

              <SubHeading>Review Management</SubHeading>

              <Paragraph>
                Reviews are a top-three ranking factor for the Local Pack and a
                primary trust signal for homeowners. The quantity, quality,
                recency, and velocity of your Google reviews directly impact
                where you rank.
              </Paragraph>

              <div className="grid md:grid-cols-3 gap-4 my-8">
                <DataCard
                  label="Trust Factor"
                  value="88%"
                  subtext="of consumers trust online reviews as much as personal recommendations"
                />
                <DataCard
                  label="Review Impact"
                  value="3-5x"
                  subtext="more reviews with a systematic request process"
                  variant="highlight"
                />
                <DataCard
                  label="Response Rate"
                  value="53%"
                  subtext="of customers expect a business to respond to reviews within 7 days"
                />
              </div>

              <Paragraph>
                The most effective review strategy is simple: ask every customer
                for a Google review immediately after completing a job. Send a
                direct link via text message within one hour of job completion.
                Respond to every review &mdash; positive and negative &mdash;
                professionally and promptly.
              </Paragraph>

              {/* --- Section 5: Content Strategy for Trades --- */}
              <SectionHeading id="content-strategy">
                Content Strategy for Home Service Businesses
              </SectionHeading>

              <Paragraph>
                Content is what Google ranks. For home service businesses, the
                right content strategy means creating pages that match the exact
                way homeowners search for your services.
              </Paragraph>

              <SubHeading>Service Pages</SubHeading>

              <Paragraph>
                Each service you offer should have its own dedicated page.
                &quot;AC repair,&quot; &quot;AC installation,&quot; and
                &quot;AC maintenance&quot; are three different searches with
                three different intents. A single &quot;HVAC services&quot; page
                won&apos;t rank for any of them.
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                  What Every Service Page Needs
                </p>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Keyword-optimized H1
                      </strong>{' '}
                      &mdash; &quot;[Service] in [City]&quot; format (e.g.,
                      &quot;Emergency Plumbing in Austin, TX&quot;)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        500+ words of unique content
                      </strong>{' '}
                      &mdash; Describe the service, process, pricing ballpark,
                      and why customers choose you
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Trust signals
                      </strong>{' '}
                      &mdash; Licenses, insurance, certifications, years in
                      business, review ratings
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Clear CTA
                      </strong>{' '}
                      &mdash; Phone number, contact form, or scheduling widget
                      above the fold
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Schema markup
                      </strong>{' '}
                      &mdash; Service schema with service area, provider, and
                      pricing information
                    </span>
                  </li>
                </ul>
              </div>

              <SubHeading>Area Pages</SubHeading>

              <Paragraph>
                If you serve multiple cities, neighborhoods, or zip codes, each
                one should have a dedicated page. An area page targets
                &quot;[service] + [location]&quot; searches &mdash; which are
                among the highest-converting keywords in home services.
              </Paragraph>

              <Paragraph>
                Each area page should include unique content about that
                location: specific neighborhoods served, local regulations or
                building codes, proximity details, and any completed projects in
                the area. Avoid thin, duplicated content that just swaps city
                names.
              </Paragraph>

              <SubHeading>Blog Content</SubHeading>

              <Paragraph>
                Blog content for contractors serves two purposes: it captures
                informational search traffic (homeowners researching a problem
                before hiring), and it builds topical authority that strengthens
                your service page rankings.
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                  High-Performing Blog Topics for Home Services
                </p>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      &quot;How much does [service] cost in [city]?&quot;
                      &mdash; Cost guides with real pricing data
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      &quot;Signs you need [service]&quot; &mdash; Problem
                      awareness content that captures early-stage searches
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      &quot;[Service A] vs. [Service B]&quot; &mdash; Comparison
                      content (e.g., &quot;Tankless vs. Traditional Water
                      Heaters&quot;)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      Seasonal maintenance checklists &mdash; e.g., &quot;Spring
                      HVAC Maintenance Checklist&quot;
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      &quot;How to choose a [trade] in [city]&quot; &mdash;
                      Buyer&apos;s guide content that positions you as the
                      authority
                    </span>
                  </li>
                </ul>
              </div>

              <PullQuote>
                Every blog post should answer a question a homeowner is actually
                asking &mdash; and every answer should make calling you the
                obvious next step.
              </PullQuote>

              {/* --- Section 6: GEO & AEO --- */}
              <SectionHeading id="geo-aeo">
                GEO and AEO: How AI Search Is Changing Home Services
              </SectionHeading>

              <Paragraph>
                Traditional SEO gets you ranked in Google&apos;s blue links. But
                search is evolving. AI-powered search engines like ChatGPT,
                Google AI Overviews, and Perplexity are changing how homeowners
                find and choose service providers.
              </Paragraph>

              <div className="grid md:grid-cols-2 gap-4 my-8">
                <DataCard
                  label="AI Overviews in Search"
                  value="52%"
                  subtext="of tracked Google searches show AI Overviews (2025)"
                  variant="warning"
                />
                <DataCard
                  label="Traffic Shift"
                  value="50%"
                  subtext="predicted reduction in traditional organic traffic by 2028 (Gartner)"
                  variant="warning"
                />
              </div>

              <SubHeading>
                What Is GEO (Generative Engine Optimization)?
              </SubHeading>

              <Paragraph>
                <strong className="text-[var(--text-primary)]">
                  Generative Engine Optimization (GEO) is the practice of
                  optimizing your content to be cited by AI-powered search
                  engines.
                </strong>{' '}
                Where SEO focuses on ranking, GEO focuses on being the source
                that AI pulls from when generating answers to user queries. For
                a deeper dive, read our complete{' '}
                <InlineLink href="/blog/generative-engine-optimization-guide">
                  GEO guide
                </InlineLink>
                .
              </Paragraph>

              <SubHeading>
                What Is AEO (Answer Engine Optimization)?
              </SubHeading>

              <Paragraph>
                Answer Engine Optimization (AEO) focuses on structuring your
                content to provide direct answers that search engines and AI
                systems can easily extract. This includes optimizing for featured
                snippets, voice search, and the &quot;People Also Ask&quot;
                section in Google.
              </Paragraph>

              <SubHeading>
                Why This Matters for Home Service Companies
              </SubHeading>

              <Paragraph>
                Imagine a homeowner asking ChatGPT: &quot;Who is the best
                plumber in Austin?&quot; The AI doesn&apos;t show 10 blue links.
                It gives a direct answer, citing specific businesses. If your
                website has structured data, strong reviews, clear service
                descriptions, and factual density, you&apos;re far more likely
                to be the business that gets cited.
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                  How to Optimize for AI Search
                </p>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Use structured data extensively
                      </strong>{' '}
                      &mdash; LocalBusiness, Service, FAQ, and Review schema help
                      AI understand your business
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Write quotable definitions
                      </strong>{' '}
                      &mdash; Clear, factual 40-60 word statements that AI can
                      extract and cite directly
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Include specific numbers and stats
                      </strong>{' '}
                      &mdash; AI prefers factually dense content with verifiable
                      claims over vague marketing copy
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Build review volume and diversity
                      </strong>{' '}
                      &mdash; AI systems cross-reference Google, Yelp, BBB, and
                      other review platforms
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Maintain consistent business information
                      </strong>{' '}
                      &mdash; NAP consistency across the web helps AI verify and
                      trust your business data
                    </span>
                  </li>
                </ul>
              </div>

              <KeyInsight title="First Mover Advantage">
                Most home service companies haven&apos;t even heard of GEO or
                AEO yet. Optimizing for AI search now puts you years ahead of
                competitors who are still focused only on traditional SEO.
              </KeyInsight>

              {/* --- Section 7: Measuring SEO ROI --- */}
              <SectionHeading id="measuring-roi">
                Measuring SEO ROI for Home Services
              </SectionHeading>

              <Paragraph>
                SEO isn&apos;t a black box. You can (and should) measure exactly
                what your investment returns. Here are the key metrics every home
                service business should track.
              </Paragraph>

              <div className="my-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                  Key SEO Metrics for Contractors
                </p>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Organic leads per month
                      </strong>{' '}
                      &mdash; Phone calls, form submissions, and chats from
                      organic search
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Cost per lead
                      </strong>{' '}
                      &mdash; Monthly SEO spend divided by organic leads
                      generated
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Keyword rankings
                      </strong>{' '}
                      &mdash; Track positions for your top 20-30 money keywords
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Local Pack visibility
                      </strong>{' '}
                      &mdash; How often you appear in the 3-pack for target
                      searches
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1">&bull;</span>
                    <span>
                      <strong className="text-[var(--text-primary)]">
                        Revenue attributed to organic
                      </strong>{' '}
                      &mdash; Track closed jobs back to their organic lead source
                    </span>
                  </li>
                </ul>
              </div>

              <Paragraph>
                The average home service SEO campaign generates a 5:1 to 12:1
                return on investment. A $2,000/month investment that generates 30
                organic leads, closing 10 jobs at $3,000 average ticket, means
                $30,000 in revenue from a $2,000 spend &mdash; a 15:1 ROI.
              </Paragraph>

              <Paragraph>
                Want to model this for your business? Try our{' '}
                <InlineLink href="/roi-calculator">
                  free SEO ROI Calculator
                </InlineLink>{' '}
                to see your potential returns based on your industry, market, and
                average job size.
              </Paragraph>

              {/* --- Section 8: FAQ --- */}
              <SectionHeading id="faq">
                Frequently Asked Questions About Home Services SEO
              </SectionHeading>

              <div className="space-y-6 my-8">
                <div className="p-6 rounded-xl border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">
                    What is home services SEO?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Home services SEO is the practice of optimizing a home
                    service company&apos;s online presence to rank higher in
                    local and organic search results. It includes Google Business
                    Profile optimization, local citation building, on-page SEO
                    for service and area pages, review management, and content
                    marketing tailored to trades like plumbing, HVAC, roofing,
                    and electrical.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">
                    How much does SEO cost for a home service business?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    SEO for home service businesses typically costs between
                    $1,000 and $5,000 per month depending on market competition,
                    number of service areas, and scope of work. Most contractors
                    see a positive ROI within 4-6 months, with the average home
                    service SEO campaign generating $3-$8 in revenue for every $1
                    spent.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">
                    How long does SEO take to work for contractors?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Most home service businesses see measurable improvements in
                    3-6 months. Quick wins like Google Business Profile
                    optimization and citation cleanup can show results in weeks.
                    Competitive keyword rankings typically take 4-8 months.
                    Businesses in less competitive markets or smaller cities
                    often see faster results.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">
                    What is local SEO for home services?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Local SEO for home services focuses on ranking in
                    Google&apos;s Local Pack (map results) and local organic
                    results. Key tactics include optimizing your Google Business
                    Profile, building consistent NAP citations, earning reviews,
                    creating location-specific service pages, and building local
                    backlinks. 46% of all Google searches have local intent,
                    making local SEO critical for service businesses.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">
                    Is SEO worth it for plumbers, electricians, and HVAC
                    companies?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Yes. The average cost per lead from SEO for home service
                    businesses is $25-$75, compared to $150-$400 from Google Ads
                    and $200-$500 from lead generation sites like Angi or
                    HomeAdvisor. SEO also builds a compounding asset: once you
                    rank, you continue getting leads without ongoing ad spend.
                    78% of local mobile searches result in an offline purchase
                    within 24 hours.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">
                    What is the most important ranking factor for home service
                    SEO?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Google Business Profile optimization is the single most
                    important ranking factor for the Local Pack, which is where
                    most home service leads come from. For organic rankings,
                    on-page content quality and relevance are most important.
                    Having a complete GBP with consistent reviews, accurate
                    categories, photos, and posts is the highest-impact starting
                    point.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">
                    How do I get more Google reviews for my home service
                    business?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    The most effective review strategy is to ask every customer
                    immediately after completing a job. Send a direct link to
                    your Google review page via text message within 1 hour of job
                    completion. Businesses that implement a systematic review
                    request process see 3-5x more reviews. Never offer
                    incentives for reviews as this violates Google&apos;s
                    policies.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">
                    Should home service businesses invest in SEO or Google Ads?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    The best strategy is both, but if you can only pick one,
                    start with SEO. Google Ads delivers immediate leads but stops
                    the moment you stop paying. Most successful home service
                    companies allocate 60-70% of their marketing budget to SEO
                    and 30-40% to Google Ads for immediate coverage while SEO
                    builds.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">
                    How is AI search changing home services marketing?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    AI search engines like ChatGPT, Google AI Overviews, and
                    Perplexity are increasingly answering home service queries
                    directly. By 2028, Gartner predicts a 50% reduction in
                    traditional organic traffic. Home service companies that
                    optimize for AI citations now &mdash; through structured
                    data, factual content, and strong review profiles &mdash;
                    will capture leads that competitors lose.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[var(--border)]">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-[family-name:var(--font-display)]">
                    What pages should a home service website have for SEO?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Every home service website needs: a homepage with clear
                    service and location targeting, individual service pages for
                    each service offered, location/area pages for each city or
                    neighborhood served, an about page with trust signals, a
                    reviews/testimonials page, and a blog with helpful content.
                    Each service + location combination should have its own
                    dedicated page.
                  </p>
                </div>
              </div>

              {/* --- Related Content --- */}
              <div className="my-16 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4 font-[family-name:var(--font-display)]">
                  Related Reading
                </h3>
                <ul className="space-y-3">
                  <li>
                    <InlineLink href="/blog/generative-engine-optimization-guide">
                      The Complete Guide to Generative Engine Optimization (GEO)
                    </InlineLink>
                    <span className="text-[var(--text-muted)]">
                      {' '}
                      &mdash; How to get cited by AI search engines
                    </span>
                  </li>
                  <li>
                    <InlineLink href="/roi-calculator">
                      SEO ROI Calculator
                    </InlineLink>
                    <span className="text-[var(--text-muted)]">
                      {' '}
                      &mdash; Model the revenue impact of SEO for your business
                    </span>
                  </li>
                  <li>
                    <InlineLink href="/work/lapeyre-roofing">
                      Lapeyre Roofing Case Study
                    </InlineLink>
                    <span className="text-[var(--text-muted)]">
                      {' '}
                      &mdash; Real results from a real home service business
                    </span>
                  </li>
                </ul>
              </div>

              {/* --- Author Box --- */}
              <div className="my-16 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-[var(--accent)]/20">
                    HL
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] text-lg">
                      Hunter Lapeyre
                    </p>
                    <p className="text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Hunter owns{' '}
                      <InlineLink href="/">Obieo</InlineLink> (SEO and GEO for
                      home service businesses) and{' '}
                      <InlineLink href="/work/lapeyre-roofing">
                        Lapeyre Roofing
                      </InlineLink>
                      . He tests every strategy on his own roofing company first,
                      so the advice in this guide is backed by real results, not
                      theory.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </FadeInSection>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section variant="alternate" className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute top-0 left-1/4 w-64 h-64 text-[var(--accent)] opacity-[0.05]"
            viewBox="0 0 200 200"
          >
            <polygon points="100,10 190,190 10,190" fill="currentColor" />
          </svg>
          <svg
            className="absolute bottom-0 right-1/4 w-48 h-48 text-[var(--accent)] opacity-[0.05]"
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="90" fill="currentColor" />
          </svg>
        </div>

        <Container size="md" className="relative">
          <FadeInSection>
            <div className="text-center">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-[var(--accent)] text-white mb-6">
                Ready to Grow?
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                Get More Leads for Your Home Service Business
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto leading-relaxed">
                I help home service companies dominate local search and AI
                results. Every strategy is tested on my own roofing company
                first. Let&apos;s talk about what SEO can do for your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/call"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-all hover:scale-105 shadow-lg shadow-[var(--accent)]/25"
                >
                  Book a Strategy Call
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <Link
                  href="/roi-calculator"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-[var(--border)] text-[var(--text-primary)] font-semibold hover:border-[var(--accent)] transition-all"
                >
                  Calculate Your ROI
                </Link>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-6">
                Free 20-minute consultation. No pressure, just honest advice.
              </p>
            </div>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}
