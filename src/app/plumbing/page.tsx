'use client'

import Script from 'next/script'
import { useState } from 'react'
import { PipeFlow } from '@/components/roi-widgets/PipeFlow'
import { RelatedIndustries } from '@/components/RelatedIndustries'

// JSON-LD Schema for SEO
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Plumber SEO Services',
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
  description: 'Specialized SEO services for plumbing companies that help you rank higher on Google for emergency plumbing searches and local keywords.',
  areaServed: 'United States',
  serviceType: 'SEO Services',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does plumber SEO cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Plumber SEO services typically range from $1,500 to $4,500 per month depending on your market size and competition. At Obieo, we offer transparent pricing with no long-term contracts required.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long until I see results from plumber SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most plumbing companies see measurable improvements in local rankings within 60-90 days, with significant gains in 3-6 months. Emergency service keywords often see faster results due to high search intent.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why is local SEO important for plumbers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Local SEO is critical for plumbers because 97% of consumers search online for local services. When pipes burst at 2am, homeowners search "plumber near me" - if you\'re not ranking, you\'re losing that emergency call to your competitor.',
      },
    },
    {
      '@type': 'Question',
      name: 'What plumbing keywords should I target?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Focus on emergency keywords (emergency plumber, 24/7 plumber), service keywords (drain cleaning, water heater repair), and local keywords (plumber + your city). We research the highest-value keywords for your specific market.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is Obieo different from other plumbing marketing agencies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Obieo was built by Hunter Lapeyre, who owns and operates a trades business. We understand 24/7 service demand, emergency search intent, and what makes homeowners trust a plumber enough to let them in their home.',
      },
    },
  ],
}

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ArrowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)

export default function PlumbingLandingPage() {
  const [ebitdaIncrease, setEbitdaIncrease] = useState(75000)
  const multiplier = 4 // Typical plumbing company EBITDA multiple

  return (
    <div className="min-h-screen bg-[#0c0a09]">
      {/* JSON-LD Schema Markup for SEO - static content defined above, safe to use dangerouslySetInnerHTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="relative pt-8 pb-20 sm:pt-12 sm:pb-32 overflow-hidden">
        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Pill Callout */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-blue-400 text-sm font-medium">
              Attention plumbing company owners tired of generic agencies
            </span>
          </div>

          {/* Main Headline - Optimized for "seo for plumbers" and "local seo for plumbers" */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            <span className="text-blue-400">SEO for Plumbers</span>{' '}
            That Actually Gets Emergency Calls
          </h1>

          {/* Subhead */}
          <p className="mt-8 text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            I run a trades business. I know what it&apos;s like when the phone needs to ring and it doesn&apos;t. My SEO system is built for service companies like yours.
          </p>

          <p className="mt-6 text-lg text-white/50">
            <strong className="text-white/80">+5 ranking positions</strong> and <strong className="text-white/80">66% more impressions</strong> in 30 days. On my own company.
          </p>

          {/* Primary CTA */}
          <div className="mt-10">
            <a
              href="#book-call"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all cursor-pointer text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              Book Your Free Strategy Call
              <ArrowIcon />
            </a>
            <p className="mt-3 text-sm text-white/40">
              20 minutes. No pitch deck. Just real talk about your market.
            </p>
          </div>
        </div>
      </section>

      {/* Pain Agitation Section */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Sound familiar?
          </h2>

          <div className="mt-8 space-y-4">
            {[
              "Someone's toilet is flooding at 2am but they call your competitor because he shows up first on Google",
              "You're paying for SEO but still getting outranked by the big franchise operations",
              "Your agency writes blog posts about 'when to call a plumber' that generate zero calls",
              "Monthly reports full of 'impressions' but your phone isn't ringing any more than before",
              "Homeowners don't trust plumbers they find online - and your current strategy isn't helping",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <XIcon />
                <span className="text-white/80">{pain}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xl text-white/60">
            Meanwhile, some other plumber is getting every emergency call in your zip code.
          </p>

          <p className="mt-4 text-lg text-white font-medium">
            It&apos;s not that SEO doesn&apos;t work for plumbing. It&apos;s that most agencies don&apos;t understand 24/7 service businesses.
          </p>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Turn EBITDA Into Exit Value
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Every dollar of EBITDA you add through SEO gets multiplied at exit. Plumbing companies typically sell at 3-5x EBITDA.
            </p>
          </div>

          {/* EBITDA Slider */}
          <div className="max-w-md mx-auto mb-8">
            <label className="block text-sm font-medium text-white/60 mb-2 text-center">
              Estimated Annual EBITDA Increase from SEO
            </label>
            <input
              type="range"
              min="25000"
              max="500000"
              step="5000"
              value={ebitdaIncrease}
              onChange={(e) => setEbitdaIncrease(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-sm text-white/40 mt-2">
              <span>$25K</span>
              <span className="text-lg font-bold text-blue-400">${ebitdaIncrease.toLocaleString()}</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Widget Container */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 flex items-center justify-center">
            <PipeFlow ebitdaIncrease={ebitdaIncrease} multiplier={multiplier} />
          </div>

          <p className="mt-6 text-center text-white/40 text-sm">
            More visibility → more emergency calls → more revenue → higher EBITDA → bigger exit.
          </p>
        </div>
      </section>

      {/* The Difference Section */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Why I&apos;m Different
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              I&apos;m Hunter. I own <strong className="text-white">Lapeyre Roofing</strong>, a real trades company
              serving Texas and Louisiana. Real crews. Real trucks. Real customers.
            </p>
            <p>
              I spent <strong className="text-white">tens of thousands of dollars</strong> on SEO agencies.
              They made me feel like a number. So I built my own system.
            </p>
            <p>
              And in <strong className="text-white">30 days</strong>, I jumped 5 spots in average Google rankings
              with a 66% increase in search impressions.
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              { label: 'I understand emergency search intent', desc: 'When pipes burst, people need you NOW' },
              { label: 'I know trust matters in-home', desc: 'Plumbers enter people\'s homes - credibility is everything' },
              { label: 'I test everything on my own company first', desc: 'You get what actually works' },
              { label: 'Small client list by design', desc: 'So I can actually give a damn' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight text-center mb-12">
            What You Get When We Work Together
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: 'The Exact System I Use',
                desc: 'Same SEO playbook that works for my company. Adapted for plumbing-specific keywords.',
              },
              {
                title: 'You Work With Me Directly',
                desc: 'No account managers. No hand-offs. You text me, I respond.',
              },
              {
                title: 'Plumbing-Specific Strategy',
                desc: 'I understand drain cleaning, water heaters, repiping - and what homeowners search for.',
              },
              {
                title: 'Results You Can Actually Measure',
                desc: 'Rankings that turn into calls. Not vanity metrics in a confusing PDF.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Plumber SEO - GEO Optimized Section */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            What is SEO for Plumbers?
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              <strong className="text-white">SEO for plumbers</strong> is the practice of optimizing a plumbing company&apos;s
              online presence to rank higher in Google search results when homeowners search for plumbing services.
              This includes appearing for emergency searches like &quot;plumber near me&quot; and &quot;24 hour plumber,&quot;
              as well as service-specific searches like &quot;drain cleaning + [city]&quot; or &quot;water heater repair.&quot;
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Key Components of Local SEO for Plumbers:</h3>
              <ul className="space-y-3">
                {[
                  'Google Business Profile optimization for local pack rankings',
                  'Emergency keyword targeting (24/7 plumber, same-day service)',
                  'Review generation and reputation management',
                  'Service area page optimization for each city you serve',
                  'Technical website optimization (mobile-first, fast loading)',
                  'AI search visibility (GEO) for ChatGPT, Perplexity, and voice search',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p>
              <strong className="text-white">Local SEO for plumbers</strong> has grown <strong className="text-white">+414% year-over-year</strong> as
              more homeowners turn to Google to find emergency plumbing services. If you&apos;re not ranking when someone&apos;s
              pipes burst at 2am, that call is going to your competitor.
            </p>
          </div>
        </div>
      </section>

      {/* Why Specialized SEO Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Why Generic SEO Doesn&apos;t Work for Plumbing Companies
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              Most SEO agencies treat plumbers like any other local business. But plumbing has unique challenges
              that require specialized knowledge:
            </p>

            <div className="grid gap-4">
              {[
                {
                  title: '24/7 Emergency Search Intent',
                  desc: 'Pipes don\'t burst 9-5. You need to rank for emergency searches at 2am when the competition isn\'t paying attention.',
                },
                {
                  title: 'In-Home Trust Factor',
                  desc: 'Homeowners are letting a stranger into their house. Reviews, photos, and credentials matter more than any other industry.',
                },
                {
                  title: 'Service-Specific Keywords',
                  desc: 'Drain cleaning, sewer line repair, water heater installation - each service needs its own keyword strategy.',
                },
                {
                  title: 'Multi-Location Complexity',
                  desc: 'Most plumbers serve 10+ cities. Each service area needs optimized content without creating duplicate pages.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Schema Markup Already Added */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight text-center mb-12">
            Frequently Asked Questions About Plumber SEO
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'How much does plumber SEO cost?',
                a: 'Plumber SEO services typically range from $1,500 to $4,500 per month depending on your market size and competition. At Obieo, we offer transparent pricing with no long-term contracts required.',
              },
              {
                q: 'How long until I see results from plumber SEO?',
                a: 'Most plumbing companies see measurable improvements in local rankings within 60-90 days, with significant gains in 3-6 months. Emergency service keywords often see faster results due to high search intent.',
              },
              {
                q: 'Why is local SEO important for plumbers?',
                a: 'Local SEO is critical for plumbers because 97% of consumers search online for local services. When pipes burst at 2am, homeowners search "plumber near me" - if you\'re not ranking, you\'re losing that emergency call to your competitor.',
              },
              {
                q: 'What plumbing keywords should I target?',
                a: 'Focus on emergency keywords (emergency plumber, 24/7 plumber), service keywords (drain cleaning, water heater repair), and local keywords (plumber + your city). We research the highest-value keywords for your specific market.',
              },
              {
                q: 'How is Obieo different from other plumbing marketing agencies?',
                a: 'Obieo was built by Hunter Lapeyre, who owns and operates a trades business. We understand 24/7 service demand, emergency search intent, and what makes homeowners trust a plumber enough to let them in their home.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <h3 className="text-white font-medium pr-4">{faq.q}</h3>
                  <svg
                    className="w-5 h-5 text-white/60 flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-white/70">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related Industries */}
      <RelatedIndustries currentSlug="plumbing" />

      {/* Calendar Section */}
      <section id="book-call" className="py-16 sm:py-24 bg-[#0c0a09] scroll-mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to Get More Plumbing Calls?
          </h2>

          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Book a 20-minute call. I&apos;ll take a look at your current rankings, your competition,
            and give you an honest assessment of what it would take to dominate plumbing search in your area.
          </p>

          {/* GHL Calendar Widget */}
          <div className="mt-10 rounded-2xl overflow-hidden">
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/0sf1QEe5x3p5eHFHPJLW?source=plumbing-page"
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
              scrolling="no"
              id="ghl-plumbing-calendar"
            />
            <Script
              src="https://link.msgsndr.com/js/form_embed.js"
              strategy="lazyOnload"
            />
          </div>

          {/* Trust elements */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <span className="flex items-center gap-2">
              <CheckIcon />
              Free 20-minute call
            </span>
            <span className="flex items-center gap-2">
              <CheckIcon />
              No contracts required
            </span>
            <span className="flex items-center gap-2">
              <CheckIcon />
              Honest assessment
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
