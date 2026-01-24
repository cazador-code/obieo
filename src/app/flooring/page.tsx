'use client'

import Script from 'next/script'
import { useState } from 'react'
import { CompoundCurve } from '@/components/roi-widgets/CompoundCurve'
import { RelatedIndustries } from '@/components/RelatedIndustries'

// JSON-LD Schema - static hardcoded content for SEO, safe for dangerouslySetInnerHTML
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Flooring Contractor SEO Services',
  description: 'Specialized SEO services for flooring contractors that drive leads for hardwood, tile, LVP, and carpet installation projects through local search optimization.',
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
  areaServed: 'United States',
  serviceType: 'Search Engine Optimization',
}

// FAQ Schema - static hardcoded content for SEO, safe for dangerouslySetInnerHTML
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is flooring contractor SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Flooring contractor SEO is search engine optimization specifically designed for flooring installation companies. It focuses on ranking for hardwood, tile, LVP, carpet, and refinishing searches that homeowners use when planning flooring projects.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does flooring company SEO take to show results?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most flooring companies see measurable improvements in 60-90 days. Material-specific keywords like "hardwood floor installation" often rank faster than generic terms. Full market dominance typically takes 6-12 months depending on competition.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why do flooring contractors need specialized SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Flooring businesses compete against big box stores and have material-specific search intent (hardwood vs LVP vs tile). Generic SEO agencies miss these nuances and target keywords that attract DIYers instead of homeowners hiring professionals.',
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

export default function FlooringLandingPage() {
  const [ebitdaIncrease, setEbitdaIncrease] = useState(75000)
  const multiplier = 4 // Flooring companies with good margins sell at solid multiples

  return (
    <div className="min-h-screen bg-[#0c0a09]">
      {/* JSON-LD Schema - static hardcoded content defined above */}
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600/10 border border-amber-600/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
            <span className="text-amber-500 text-sm font-medium">
              Attention flooring company owners tired of generic agencies
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            SEO That Builds a{' '}
            <span className="text-amber-500">Solid Foundation</span>
          </h1>

          {/* Subhead */}
          <p className="mt-8 text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            I run a trades business. I know flooring jobs range from simple repairs to whole-house renovations. My SEO system captures the high-value projects.
          </p>

          <p className="mt-6 text-lg text-white/50">
            <strong className="text-white/80">+5 ranking positions</strong> and <strong className="text-white/80">66% more impressions</strong> in 30 days. On my own company.
          </p>

          {/* Primary CTA */}
          <div className="mt-10">
            <a
              href="#book-call"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all cursor-pointer text-lg shadow-lg shadow-amber-600/25 hover:shadow-amber-600/40 hover:scale-[1.02]"
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
              "Big box stores are ranking for flooring searches in your area with their inferior installation",
              "You're getting small repair calls when you want whole-house hardwood installs",
              "Your agency doesn't understand the difference between LVP, hardwood, and tile keywords",
              "Homeowners think flooring is a DIY project because your expertise isn't showing up in search",
              "Commercial contracts go to competitors who dominate Google Maps and local search",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <XIcon />
                <span className="text-white/80">{pain}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xl text-white/60">
            Meanwhile, that other flooring company is booking every &quot;hardwood floor installation near me&quot; search in your area.
          </p>

          <p className="mt-4 text-lg text-white font-medium">
            It&apos;s not that SEO doesn&apos;t work for flooring companies. It&apos;s that most agencies don&apos;t understand project-based home improvement.
          </p>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Watch Your Value Compound
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Every dollar of EBITDA you add through SEO gets multiplied at exit. Flooring companies with strong margins typically sell at 3-5x EBITDA.
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
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-sm text-white/40 mt-2">
              <span>$25K</span>
              <span className="text-lg font-bold text-amber-500">${ebitdaIncrease.toLocaleString()}</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Widget Container */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 flex items-center justify-center">
            <CompoundCurve ebitdaIncrease={ebitdaIncrease} multiplier={multiplier} />
          </div>

          <p className="mt-6 text-center text-white/40 text-sm">
            More visibility → more quality projects → more revenue → higher EBITDA → bigger exit.
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
              { label: 'I understand material-specific searches', desc: 'Hardwood, LVP, tile, carpet - each needs its own strategy' },
              { label: 'I know project size matters', desc: 'Targeting whole-house installs vs. single-room repairs' },
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
                desc: 'Same SEO playbook that works for my company. Adapted for flooring-specific keywords.',
              },
              {
                title: 'You Work With Me Directly',
                desc: 'No account managers. No hand-offs. You text me, I respond.',
              },
              {
                title: 'Flooring-Specific Strategy',
                desc: 'I understand hardwood, LVP, tile, refinishing - and what homeowners search for when renovating.',
              },
              {
                title: 'Results You Can Actually Measure',
                desc: 'Rankings that turn into project inquiries. Not vanity metrics.',
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

      {/* SEO Content Section - What is Flooring Contractor SEO */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            What is Flooring Contractor SEO?
          </h2>
          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              <strong className="text-white">Flooring contractor SEO</strong> is search engine optimization specifically designed for flooring installation companies. It focuses on ranking for the searches homeowners make when planning flooring projects—whether that&apos;s hardwood, tile, LVP, carpet, or refinishing.
            </p>
            <p>
              Unlike generic SEO, flooring marketing requires understanding <strong className="text-white">material-specific search intent</strong>. Someone searching &quot;LVP installation&quot; is a different buyer than &quot;hardwood floor refinishing.&quot; Each has different budgets, timelines, and decision criteria.
            </p>
            <p>
              Effective flooring SEO targets keywords like &quot;hardwood floor installation near me,&quot; &quot;tile flooring contractors,&quot; &quot;luxury vinyl plank installers,&quot; and &quot;wood floor refinishing&quot;—the searches from homeowners ready to hire, not browse Pinterest.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Content Section - Why Generic SEO Doesn't Work */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Why Generic SEO Doesn&apos;t Work for Flooring Companies
          </h2>
          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              Most SEO agencies treat flooring companies like any other contractor. They write generic content and wonder why you&apos;re losing to Home Depot. Here&apos;s what they miss:
            </p>
            <ul className="space-y-3 list-disc list-inside">
              <li><strong className="text-white">Big box competition:</strong> You&apos;re competing against national retailers with massive SEO budgets—you need a local strategy</li>
              <li><strong className="text-white">Material-specific intent:</strong> Hardwood, tile, LVP, and carpet buyers have completely different search patterns</li>
              <li><strong className="text-white">Project size matters:</strong> Whole-house renovations are 10x more valuable than single-room repairs</li>
              <li><strong className="text-white">DIY vs. professional:</strong> Most flooring searches are DIYers—you need keywords that filter for hiring intent</li>
            </ul>
            <p>
              A flooring SEO specialist understands these patterns and builds a strategy that captures high-value installation projects while outranking the big box stores locally.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'What is flooring contractor SEO?',
                a: 'Flooring contractor SEO is search engine optimization specifically designed for flooring installation companies. It focuses on ranking for hardwood, tile, LVP, carpet, and refinishing searches that homeowners use when planning flooring projects.',
              },
              {
                q: 'How long does flooring company SEO take to show results?',
                a: 'Most flooring companies see measurable improvements in 60-90 days. Material-specific keywords like "hardwood floor installation" often rank faster than generic terms. Full market dominance typically takes 6-12 months depending on competition.',
              },
              {
                q: 'Why do flooring contractors need specialized SEO?',
                a: 'Flooring businesses compete against big box stores and have material-specific search intent (hardwood vs LVP vs tile). Generic SEO agencies miss these nuances and target keywords that attract DIYers instead of homeowners hiring professionals.',
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white/5 border border-white/10 rounded-lg">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-white pr-4">{faq.q}</h3>
                  <span className="text-amber-500 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="px-6 pb-6 text-white/70">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related Industries */}
      <RelatedIndustries currentSlug="flooring" />

      {/* Calendar Section */}
      <section id="book-call" className="py-16 sm:py-24 bg-[#0c0a09] scroll-mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to Floor Your Competition?
          </h2>

          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Book a 20-minute call. I&apos;ll take a look at your current rankings, your competition,
            and give you an honest assessment of what it would take to dominate flooring search in your area.
          </p>

          {/* GHL Calendar Widget */}
          <div className="mt-10 rounded-2xl overflow-hidden">
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/0sf1QEe5x3p5eHFHPJLW?source=flooring-page"
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
              scrolling="no"
              id="ghl-flooring-calendar"
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
