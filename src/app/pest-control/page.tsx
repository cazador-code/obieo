'use client'

import Script from 'next/script'
import { useState } from 'react'
import { BugZapper } from '@/components/roi-widgets/BugZapper'
import { RelatedIndustries } from '@/components/RelatedIndustries'

// JSON-LD Schema for SEO
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Pest Control SEO Services',
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
  description: 'Specialized SEO services for pest control companies that help you rank higher on Google and generate more extermination and prevention service calls.',
  areaServed: 'United States',
  serviceType: 'Marketing Services',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does pest control SEO cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pest control SEO services typically range from $1,500 to $4,500 per month depending on your market size and competition. At Obieo, we offer transparent pricing with no long-term contracts required.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long until I see results from pest control SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most pest control companies see measurable improvements in 60-90 days, with significant ranking gains within 3-6 months. Seasonal pest keywords (termites, mosquitoes) may require planning ahead of peak seasons.',
      },
    },
    {
      '@type': 'Question',
      name: 'What pest control keywords should I target?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Target emergency keywords (exterminator near me, bed bug treatment), pest-specific terms (termite inspection, rodent control), and local keywords (pest control + your city). We research the highest-value keywords for your market.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can SEO help with recurring pest control subscriptions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SEO can target prevention-focused searches like "monthly pest control service" and "quarterly pest prevention plans." These searches indicate customers looking for ongoing relationships, not just one-time treatments.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes Obieo different from other pest control marketing agencies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Obieo was built by someone who owns and operates a trades business. We understand seasonal pest cycles, the value of recurring revenue models, and what drives homeowners to choose one exterminator over another.',
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

export default function PestControlLandingPage() {
  const [ebitdaIncrease, setEbitdaIncrease] = useState(75000)
  const multiplier = 5 // Pest control companies often command higher multiples due to recurring revenue

  return (
    <div className="min-h-screen bg-[#0c0a09]">
      {/* JSON-LD Schema - hardcoded static content above, safe for dangerouslySetInnerHTML */}
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="faq-schema"
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-500/10 border border-lime-500/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
            <span className="text-lime-400 text-sm font-medium">
              Attention pest control company owners tired of generic agencies
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            SEO That{' '}
            <span className="text-lime-400">Exterminates</span>{' '}
            Your Competition
          </h1>

          {/* Subhead */}
          <p className="mt-8 text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            I run a trades business. I know what it&apos;s like to compete for recurring customers. My SEO system is built to help you dominate local pest control search.
          </p>

          <p className="mt-6 text-lg text-white/50">
            <strong className="text-white/80">+5 ranking positions</strong> and <strong className="text-white/80">66% more impressions</strong> in 30 days. On my own company.
          </p>

          {/* Primary CTA */}
          <div className="mt-10">
            <a
              href="#book-call"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-lime-500 hover:bg-lime-600 text-black font-semibold rounded-lg transition-all cursor-pointer text-lg shadow-lg shadow-lime-500/25 hover:shadow-lime-500/40 hover:scale-[1.02]"
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
              "You've built recurring revenue but struggle to add new customers consistently",
              "National franchises are outranking you despite your better local reputation",
              "Your agency writes blog posts about 'common household pests' that no one reads",
              "Termite season comes and goes, but your rankings never seem to match the demand",
              "You've invested in SEO but can't point to a single new customer it generated",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <XIcon />
                <span className="text-white/80">{pain}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xl text-white/60">
            Meanwhile, Terminix and Orkin are capturing every &quot;pest control near me&quot; search in your area.
          </p>

          <p className="mt-4 text-lg text-white font-medium">
            It&apos;s not that SEO doesn&apos;t work for pest control. It&apos;s that most agencies don&apos;t understand recurring service businesses.
          </p>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Zap Problems Into Profit
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Every dollar of EBITDA you add through SEO gets multiplied at exit. Pest control companies with strong recurring revenue often sell at 4-6x EBITDA.
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
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-lime-500"
            />
            <div className="flex justify-between text-sm text-white/40 mt-2">
              <span>$25K</span>
              <span className="text-lg font-bold text-lime-400">${ebitdaIncrease.toLocaleString()}</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Widget Container */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 flex items-center justify-center">
            <BugZapper ebitdaIncrease={ebitdaIncrease} multiplier={multiplier} />
          </div>

          <p className="mt-6 text-center text-white/40 text-sm">
            More visibility → more recurring customers → more revenue → higher EBITDA → bigger exit.
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
              { label: 'I understand recurring revenue', desc: 'The pest control business model is gold - I help you grow it' },
              { label: 'I know seasonal pest patterns', desc: 'Termite season, mosquito season - timing matters for SEO' },
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
                desc: 'Same SEO playbook that works for my company. Adapted for pest control keywords.',
              },
              {
                title: 'You Work With Me Directly',
                desc: 'No account managers. No hand-offs. You text me, I respond.',
              },
              {
                title: 'Pest Control-Specific Strategy',
                desc: 'I understand termites, rodents, mosquitoes - and what homeowners search when they have an infestation.',
              },
              {
                title: 'Results You Can Actually Measure',
                desc: 'Rankings that turn into recurring customers. Not vanity metrics.',
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

      {/* What is Pest Control SEO Section - GEO Optimized */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            What is Pest Control SEO?
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              <strong className="text-white">Pest control SEO</strong> is the process of optimizing your extermination business to appear at the top of Google when homeowners discover infestations. This includes urgent searches like &quot;exterminator near me,&quot; pest-specific terms like &quot;termite inspection&quot; and &quot;bed bug treatment,&quot; and prevention-focused searches like &quot;monthly pest control service.&quot;
            </p>
            <p>
              The pest control industry has a unique advantage—once you acquire a customer, they often become recurring subscribers. Effective SEO not only captures emergency calls but also targets prevention-minded homeowners searching for quarterly treatments and maintenance plans, building your recurring revenue base.
            </p>
            <p>
              At Obieo, we specialize in pest control SEO because we understand seasonal pest cycles, the difference between one-time treatments and subscription customers, and what drives homeowners to choose one exterminator over another.
            </p>
          </div>
        </div>
      </section>

      {/* Why Generic SEO Doesn't Work Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Why Generic SEO Doesn&apos;t Work for Pest Control
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              Most SEO agencies don&apos;t understand pest control. They write generic content that doesn&apos;t convert, miss seasonal opportunities, and ignore the recurring revenue model that makes pest control businesses so valuable.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Seasonal Pest Cycles</p>
                  <p className="text-white/60 text-sm mt-1">Termite season, mosquito season, rodent invasions in fall—we plan content months ahead to capture seasonal spikes.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Recurring Revenue Focus</p>
                  <p className="text-white/60 text-sm mt-1">One-time kills vs. quarterly subscriptions have different LTV. We target keywords that bring in long-term customers.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Pest-Specific Targeting</p>
                  <p className="text-white/60 text-sm mt-1">Bed bugs, termites, rodents, mosquitoes—each pest type has unique search intent and conversion patterns.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Emergency vs. Prevention</p>
                  <p className="text-white/60 text-sm mt-1">&quot;Cockroach infestation&quot; is urgent. &quot;Pest prevention service&quot; is planned. Both require different approaches.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-8">
            Frequently Asked Questions About Pest Control SEO
          </h2>

          <div className="space-y-4">
            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                How much does pest control SEO cost?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Pest control SEO services typically range from $1,500 to $4,500 per month depending on your market size and competition. At Obieo, we offer transparent pricing with no long-term contracts required.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                How long until I see results from pest control SEO?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Most pest control companies see measurable improvements in 60-90 days, with significant ranking gains within 3-6 months. Seasonal pest keywords may require planning ahead of peak seasons.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                What pest control keywords should I target?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Target emergency keywords (exterminator near me, bed bug treatment), pest-specific terms (termite inspection, rodent control), and local keywords (pest control + your city). We research the highest-value keywords for your market.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                How can SEO help with recurring subscriptions?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                SEO can target prevention-focused searches like &quot;monthly pest control service&quot; and &quot;quarterly pest prevention plans.&quot; These searches indicate customers looking for ongoing relationships, not just one-time treatments.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                What makes Obieo different from other pest control marketing agencies?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Obieo was built by someone who owns and operates a trades business. We understand seasonal pest cycles, the value of recurring revenue models, and what drives homeowners to choose one exterminator over another.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Related Industries */}
      <RelatedIndustries currentSlug="pest-control" />

      {/* Calendar Section */}
      <section id="book-call" className="py-16 sm:py-24 bg-[#0c0a09] scroll-mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to Crush the Competition?
          </h2>

          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Book a 20-minute call. I&apos;ll take a look at your current rankings, your competition,
            and give you an honest assessment of what it would take to dominate pest control search in your area.
          </p>

          {/* GHL Calendar Widget */}
          <div className="mt-10 rounded-2xl overflow-hidden">
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/0sf1QEe5x3p5eHFHPJLW?source=pest-control-page"
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
              scrolling="no"
              id="ghl-pest-control-calendar"
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
