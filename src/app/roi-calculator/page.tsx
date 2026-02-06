import type { Metadata } from 'next'
import Link from 'next/link'
import { ROICalculator } from '@/components/roi-calculator'

// JSON-LD Schema for ROI Calculator Page
const calculatorSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free SEO ROI Calculator',
  description:
    'Calculate the return on investment of SEO for your business. Input your monthly spend, traffic, and conversion rates to estimate revenue growth from organic search.',
  url: 'https://obieo.com/roi-calculator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  browserRequirements: 'Requires JavaScript',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
  featureList: [
    'Monthly SEO investment input',
    'Revenue projection based on industry data',
    'Lead generation estimates',
    'Custom ROI ratio calculation',
    'Home service industry benchmarks',
  ],
}

// FAQ Schema for rich results
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is SEO ROI and how is it calculated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SEO ROI (Return on Investment) measures the revenue generated from organic search relative to the cost of your SEO efforts. The formula is: SEO ROI = ((Revenue from Organic Search - Cost of SEO) / Cost of SEO) x 100. For example, if you spend $2,000/month on SEO and generate $12,000 in revenue from organic traffic, your ROI is 500%.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a good ROI for SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'According to industry research from FirstPageSage, the median SEO ROI across industries is 748%. Most businesses can expect an SEO ROI between 5:1 and 12:1 (500% to 1,200%), meaning every $1 invested returns $5 to $12. Home service businesses often see higher returns due to high customer lifetime values and strong local search intent.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to see ROI from SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most businesses begin to see measurable SEO ROI within 6 to 12 months. Initial results like improved rankings and traffic often appear within 3 to 4 months, while significant revenue growth typically follows in months 6 through 12. Unlike paid ads, SEO compounds over time, so ROI tends to increase the longer you invest.',
      },
    },
    {
      '@type': 'Question',
      name: 'What inputs do I need to calculate SEO ROI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To calculate SEO ROI accurately, you need: (1) your monthly SEO investment, (2) current organic traffic or leads, (3) your average conversion rate, (4) average customer value or deal size, and (5) customer lifetime value. Our free SEO ROI calculator uses these inputs along with industry benchmarks to project your potential returns.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is SEO more cost-effective than paid ads?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In most cases, SEO delivers a higher long-term ROI than paid advertising. While PPC delivers immediate traffic, the cost per lead typically increases over time. SEO has higher upfront costs but generates compounding returns: once you rank, organic traffic is essentially free. Studies show that the average cost per lead from SEO is 61% lower than from PPC for home service businesses.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Free SEO ROI Calculator | Estimate Your Search Investment Returns',
  description:
    'Use our free SEO ROI calculator to estimate your return on investment from organic search. Input your numbers and get projections for traffic, leads, and revenue growth.',
  alternates: {
    canonical: '/roi-calculator',
  },
  openGraph: {
    title: 'Free SEO ROI Calculator | Obieo',
    description:
      'Calculate the potential ROI of SEO for your business. See projected traffic, leads, and revenue in 60 seconds.',
    url: 'https://obieo.com/roi-calculator',
    type: 'website',
  },
}

export default function ROICalculatorPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
        {/* Minimal header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]"
            >
              Obieo
            </Link>
            <Link
              href="/"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Close
            </Link>
          </div>
        </header>

        {/* Calculator content */}
        <main className="pt-16 pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                Free SEO ROI Calculator
              </h1>
              <p className="text-lg text-[var(--text-secondary)]">
                Enter your numbers below to see how much revenue SEO could generate for your business in 60 seconds.
              </p>
            </div>

            <ROICalculator />
          </div>

          {/* Supporting SEO content */}
          <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
            {/* How to Calculate SEO ROI */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                How to Calculate SEO ROI
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                <strong className="text-[var(--text-primary)]">SEO ROI (Return on Investment)</strong> measures the
                profit generated from organic search relative to the total cost of your SEO efforts. It is the
                single most important metric for evaluating whether your search optimization strategy is working.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                The standard formula for calculating SEO ROI is:
              </p>
              <div className="bg-[var(--bg-secondary,rgba(0,0,0,0.03))] border border-[var(--border)] rounded-lg p-6 mb-6">
                <p className="text-center text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]">
                  SEO ROI = ((Revenue from Organic Search - Cost of SEO) / Cost of SEO) &times; 100
                </p>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                For example, if you invest $2,000 per month in SEO and your organic search channel generates $14,000
                in monthly revenue, your SEO ROI is 600%. That means every dollar invested in SEO returns $6 in
                revenue.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Unlike paid advertising where traffic stops the moment you stop spending, SEO delivers compounding
                returns. Content you create and rankings you earn continue to generate leads and revenue for months
                or years after the initial investment, making the true lifetime ROI of SEO significantly higher than
                what a single-month calculation shows.
              </p>
            </section>

            {/* What Inputs Matter */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                What Inputs Matter for SEO ROI
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                Accurately calculating SEO ROI requires understanding several key business metrics. Here are the
                inputs that have the greatest impact on your projections:
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Monthly SEO Investment
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    This includes all costs related to SEO: agency fees, content creation, tools, and internal
                    time. Small businesses typically invest $1,500 to $5,000 per month, while enterprise companies
                    may spend $10,000 or more. The calculator factors in your specific investment level to project
                    realistic returns.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Organic Traffic and Conversion Rate
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Your current organic traffic provides the baseline for growth projections. The average website
                    conversion rate is 2.35%, but top-performing sites convert at 5% or higher. Even small
                    improvements in conversion rate can dramatically affect ROI. For home service businesses,
                    conversion rates from organic search tend to be higher because searchers have strong purchase
                    intent.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Average Deal Value and Customer Lifetime Value
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    The revenue you generate per customer directly impacts ROI calculations. A plumber with a $350
                    average job value will see different returns than a roofer with a $12,000 average project. When
                    you factor in customer lifetime value&mdash;repeat business and referrals over years&mdash;the
                    true ROI of SEO increases substantially.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Industry and Competition Level
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    SEO ROI varies by industry. Industries with high customer lifetime values (like HVAC, roofing,
                    and legal services) tend to see the highest returns. Local businesses competing in a single
                    geographic area also see faster results than national brands competing for broad keywords.
                  </p>
                </div>
              </div>
            </section>

            {/* SEO ROI Benchmarks by Industry */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                SEO ROI Benchmarks by Industry
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                According to research published by FirstPageSage, the <strong className="text-[var(--text-primary)]">median
                SEO ROI across all industries is 748%</strong>. However, returns vary significantly depending on the
                sector, competition level, and customer value. Most businesses should expect an SEO ROI between 5:1
                and 12:1&mdash;meaning every $1 invested in SEO generates $5 to $12 in revenue.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 pr-4 text-sm font-semibold text-[var(--text-primary)]">Industry</th>
                      <th className="text-left py-3 pr-4 text-sm font-semibold text-[var(--text-primary)]">Average SEO ROI</th>
                      <th className="text-left py-3 text-sm font-semibold text-[var(--text-primary)]">Time to ROI</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--text-secondary)]">
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-3 pr-4">Real Estate</td>
                      <td className="py-3 pr-4">1,389%</td>
                      <td className="py-3">6 months</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-3 pr-4">Home Services (HVAC, Plumbing, Roofing)</td>
                      <td className="py-3 pr-4">800&ndash;1,200%</td>
                      <td className="py-3">4&ndash;8 months</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-3 pr-4">Medical Devices</td>
                      <td className="py-3 pr-4">1,183%</td>
                      <td className="py-3">9 months</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-3 pr-4">Financial Services</td>
                      <td className="py-3 pr-4">1,031%</td>
                      <td className="py-3">9 months</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-3 pr-4">SaaS / Software</td>
                      <td className="py-3 pr-4">702%</td>
                      <td className="py-3">9 months</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-3 pr-4">eCommerce</td>
                      <td className="py-3 pr-4">317%</td>
                      <td className="py-3">12 months</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Higher Education</td>
                      <td className="py-3 pr-4">994%</td>
                      <td className="py-3">12 months</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Source: FirstPageSage SEO ROI Statistics (2024). Home services estimates based on aggregated agency
                reporting data.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Home service businesses are particularly well-positioned for high SEO ROI because of two factors:
                strong local search intent (people search &ldquo;plumber near me&rdquo; when they need immediate
                help) and high average customer values. A single HVAC installation lead from organic search can be
                worth $5,000 to $15,000, which means even a handful of additional leads per month can generate
                significant returns on a modest SEO investment.
              </p>
            </section>

            {/* SEO vs PPC ROI */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                SEO vs. PPC: Comparing Long-Term ROI
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Paid search (PPC) delivers immediate traffic, but the cost per acquisition tends to increase over
                time as competition bids up ad prices. SEO requires a longer initial investment period, but the
                cost per lead decreases as rankings improve and organic traffic compounds.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Research from BrightEdge shows that <strong className="text-[var(--text-primary)]">organic search
                drives 53% of all website traffic</strong>, compared to 15% from paid search. For home service
                businesses specifically, the average cost per lead from SEO is 61% lower than from Google Ads after
                12 months of consistent investment.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                The most effective strategy combines both channels: use PPC for immediate lead generation while
                building organic authority for long-term, sustainable growth. Our SEO ROI calculator above helps
                you model exactly how this investment pays off over time.
              </p>
            </section>

            {/* FAQ Section */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    What is SEO ROI and how is it calculated?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    SEO ROI measures the revenue generated from organic search relative to the cost of your SEO
                    efforts. The formula is: SEO ROI = ((Revenue from Organic Search - Cost of SEO) / Cost of
                    SEO) &times; 100. For example, if you spend $2,000/month on SEO and generate $12,000 in
                    revenue from organic traffic, your ROI is 500%.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    What is a good ROI for SEO?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    According to industry research from FirstPageSage, the median SEO ROI across industries is
                    748%. Most businesses can expect an SEO ROI between 5:1 and 12:1 (500% to 1,200%), meaning
                    every $1 invested returns $5 to $12. Home service businesses often see higher returns due
                    to high customer lifetime values and strong local search intent.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    How long does it take to see ROI from SEO?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Most businesses begin to see measurable SEO ROI within 6 to 12 months. Initial results like
                    improved rankings and traffic often appear within 3 to 4 months, while significant revenue
                    growth typically follows in months 6 through 12. Unlike paid ads, SEO compounds over time,
                    so ROI tends to increase the longer you invest.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    What inputs do I need to calculate SEO ROI?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    To calculate SEO ROI accurately, you need: your monthly SEO investment, current organic
                    traffic or leads, your average conversion rate, average customer value or deal size, and
                    customer lifetime value. Our free SEO ROI calculator above uses these inputs along with
                    industry benchmarks to project your potential returns.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Is SEO more cost-effective than paid ads?
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    In most cases, SEO delivers a higher long-term ROI than paid advertising. While PPC delivers
                    immediate traffic, the cost per lead typically increases over time. SEO has higher upfront
                    costs but generates compounding returns: once you rank, organic traffic is essentially free.
                    Studies show that the average cost per lead from SEO is 61% lower than from PPC for home
                    service businesses.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center border-t border-[var(--border)] pt-16">
              <h2 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                Ready to Grow Your Organic Revenue?
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-xl mx-auto">
                The numbers in our calculator are based on real industry data. Let us show you what SEO can do
                for your specific business with a free strategy call.
              </p>
              <Link
                href="/call"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
              >
                Book a Free Strategy Call
              </Link>
            </section>
          </article>
        </main>
      </div>
    </>
  )
}
