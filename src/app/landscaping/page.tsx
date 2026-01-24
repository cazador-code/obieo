'use client'

import Script from 'next/script'
import { useState } from 'react'
import { GrowthMeter } from '@/components/roi-widgets/GrowthMeter'
import { RelatedIndustries } from '@/components/RelatedIndustries'

// JSON-LD Schema for SEO
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Landscaping SEO Services',
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
  description: 'Specialized SEO services for landscaping companies that help you rank higher on Google and generate more lawn care, hardscaping, and outdoor living project leads.',
  areaServed: 'United States',
  serviceType: 'Marketing Services',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does landscaping SEO cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Landscaping SEO services typically range from $1,500 to $4,500 per month depending on your market size and competition. At Obieo, we offer transparent pricing with no long-term contracts required.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long until I see results from landscaping SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most landscaping companies see measurable improvements in 60-90 days, with significant ranking gains within 3-6 months. Seasonal keywords like "spring lawn care" require planning ahead of peak seasons.',
      },
    },
    {
      '@type': 'Question',
      name: 'What landscaping keywords should I target?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Target service keywords (lawn care service, landscape design, hardscaping), seasonal terms (spring cleanup, fall leaf removal), and local keywords (landscaper + your city). We research the highest-value keywords for your market.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can SEO help me get higher-value hardscaping projects?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. SEO can target project-based searches like "patio installation," "outdoor kitchen builder," and "retaining wall contractor." These searches indicate customers ready to invest in larger outdoor living projects.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes Obieo different from other landscaping marketing agencies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Obieo was built by someone who owns and operates a trades business. We understand seasonality, the difference between lawn maintenance and design-build projects, and what drives homeowners to choose one landscaper over another.',
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

export default function LandscapingLandingPage() {
  const [ebitdaIncrease, setEbitdaIncrease] = useState(75000)
  const multiplier = 4 // Typical landscaping company EBITDA multiple

  return (
    <div className="min-h-screen bg-[#0c0a09]">
      {/* JSON-LD Schema - static schema content defined in this file */}
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">
              Attention landscaping company owners tired of generic agencies
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            SEO That Helps Your{' '}
            <span className="text-emerald-400">Business Grow</span>
          </h1>

          {/* Subhead */}
          <p className="mt-8 text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            I run a trades business. I know the difference between lawn maintenance revenue and big design-build projects. My SEO system captures both.
          </p>

          <p className="mt-6 text-lg text-white/50">
            <strong className="text-white/80">+5 ranking positions</strong> and <strong className="text-white/80">66% more impressions</strong> in 30 days. On my own company.
          </p>

          {/* Primary CTA */}
          <div className="mt-10">
            <a
              href="#book-call"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all cursor-pointer text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]"
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
              "Winter comes and your phone stops ringing - you're back to zero each spring",
              "You're getting outranked by 'guy with a mower' operations on Google",
              "Your agency doesn't understand the difference between lawn care and hardscaping",
              "Generic content about 'landscape design tips' that attracts zero qualified leads",
              "You want bigger design-build projects but keep getting calls for $50 mowing jobs",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <XIcon />
                <span className="text-white/80">{pain}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xl text-white/60">
            Meanwhile, your competitor just landed another $50K outdoor living project from a Google search.
          </p>

          <p className="mt-4 text-lg text-white font-medium">
            It&apos;s not that SEO doesn&apos;t work for landscaping. It&apos;s that most agencies don&apos;t understand seasonal service businesses.
          </p>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Watch Your Value Grow
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Every dollar of EBITDA you add through SEO gets multiplied at exit. Landscaping companies typically sell at 3-5x EBITDA.
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
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-sm text-white/40 mt-2">
              <span>$25K</span>
              <span className="text-lg font-bold text-emerald-400">${ebitdaIncrease.toLocaleString()}</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Widget Container */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 flex items-center justify-center">
            <GrowthMeter ebitdaIncrease={ebitdaIncrease} multiplier={multiplier} />
          </div>

          <p className="mt-6 text-center text-white/40 text-sm">
            More visibility → more clients → more revenue → higher EBITDA → bigger exit.
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
              { label: 'I understand seasonal demand', desc: 'From spring prep to fall cleanup - I get the cycles' },
              { label: 'I know maintenance vs. design-build', desc: 'Different services need different SEO strategies' },
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
                desc: 'Same SEO playbook that works for my company. Adapted for landscaping-specific keywords.',
              },
              {
                title: 'You Work With Me Directly',
                desc: 'No account managers. No hand-offs. You text me, I respond.',
              },
              {
                title: 'Landscaping-Specific Strategy',
                desc: 'I understand hardscaping, irrigation, lawn care - and what homeowners search for.',
              },
              {
                title: 'Results You Can Actually Measure',
                desc: 'Rankings that turn into qualified leads. Not vanity metrics.',
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

      {/* What is Landscaping SEO Section - GEO Optimized */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            What is Landscaping SEO?
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              <strong className="text-white">Landscaping SEO</strong> is the process of optimizing your lawn care or landscape design business to appear at the top of Google when homeowners search for outdoor services. This includes maintenance searches like &quot;lawn care service near me,&quot; design queries like &quot;landscape design company,&quot; and project-specific terms like &quot;patio installation&quot; and &quot;outdoor kitchen builder.&quot;
            </p>
            <p>
              The landscaping industry ranges from $50/week lawn cuts to $100,000+ outdoor living transformations. Effective SEO positions you to capture the type of work you want—whether that&apos;s building a reliable recurring revenue base with maintenance contracts or landing high-margin hardscaping and design-build projects.
            </p>
            <p>
              At Obieo, we specialize in landscaping SEO because we understand seasonality, the difference between mow-blow-go and design-build, and what drives homeowners to choose one landscaper over another.
            </p>
          </div>
        </div>
      </section>

      {/* Why Generic SEO Doesn't Work Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Why Generic SEO Doesn&apos;t Work for Landscapers
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              Most marketing agencies don&apos;t understand landscaping. They write generic blog posts, ignore seasonality, and don&apos;t distinguish between a $200/month lawn care customer and a $50,000 hardscaping project.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Extreme Seasonality</p>
                  <p className="text-white/60 text-sm mt-1">Spring rush, summer maintenance, fall cleanups—we plan content to capture demand before each season peaks.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Maintenance vs. Project Work</p>
                  <p className="text-white/60 text-sm mt-1">Recurring lawn care has different value than one-time hardscaping. We target keywords based on what you want to grow.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Commercial vs. Residential</p>
                  <p className="text-white/60 text-sm mt-1">Commercial maintenance contracts vs. residential design—each requires different keyword strategies and content.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Portfolio-Driven Sales</p>
                  <p className="text-white/60 text-sm mt-1">Landscape design is visual. We help you rank for image searches and showcase your work where buyers are looking.</p>
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
            Frequently Asked Questions About Landscaping SEO
          </h2>

          <div className="space-y-4">
            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                How much does landscaping SEO cost?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Landscaping SEO services typically range from $1,500 to $4,500 per month depending on your market size and competition. At Obieo, we offer transparent pricing with no long-term contracts required.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                How long until I see results from landscaping SEO?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Most landscaping companies see measurable improvements in 60-90 days, with significant ranking gains within 3-6 months. Seasonal keywords like &quot;spring lawn care&quot; require planning ahead of peak seasons.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                What landscaping keywords should I target?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Target service keywords (lawn care service, landscape design, hardscaping), seasonal terms (spring cleanup, fall leaf removal), and local keywords (landscaper + your city). We research the highest-value keywords for your market.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                Can SEO help me get higher-value hardscaping projects?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Yes. SEO can target project-based searches like &quot;patio installation,&quot; &quot;outdoor kitchen builder,&quot; and &quot;retaining wall contractor.&quot; These searches indicate customers ready to invest in larger outdoor living projects.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                What makes Obieo different from other landscaping marketing agencies?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Obieo was built by someone who owns and operates a trades business. We understand seasonality, the difference between lawn maintenance and design-build projects, and what drives homeowners to choose one landscaper over another.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Related Industries */}
      <RelatedIndustries currentSlug="landscaping" />

      {/* Calendar Section */}
      <section id="book-call" className="py-16 sm:py-24 bg-[#0c0a09] scroll-mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to Grow Your Landscaping Business?
          </h2>

          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Book a 20-minute call. I&apos;ll take a look at your current rankings, your competition,
            and give you an honest assessment of what it would take to dominate landscaping search in your area.
          </p>

          {/* GHL Calendar Widget */}
          <div className="mt-10 rounded-2xl overflow-hidden">
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/0sf1QEe5x3p5eHFHPJLW?source=landscaping-page"
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
              scrolling="no"
              id="ghl-landscaping-calendar"
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
