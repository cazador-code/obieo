'use client'

import Script from 'next/script'
import { useState } from 'react'
import { MultiplierMachine } from '@/components/roi-widgets/MultiplierMachine'
import { RelatedIndustries } from '@/components/RelatedIndustries'

// JSON-LD Schema for SEO
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'HVAC Marketing Services',
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
  description: 'Specialized marketing and SEO services for HVAC companies that help you rank higher on Google and generate more service calls year-round.',
  areaServed: 'United States',
  serviceType: 'Marketing Services',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does HVAC marketing cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'HVAC marketing services typically range from $2,000 to $6,000 per month depending on your market size and the services included. At Obieo, we offer transparent pricing with no long-term contracts required.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long until I see results from HVAC SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most HVAC companies see measurable improvements in 60-90 days, with significant ranking gains within 3-6 months. Seasonal keywords may fluctuate, but building year-round visibility is the key to sustainable growth.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get more HVAC leads during slow seasons?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Focus on maintenance agreement marketing, indoor air quality services, and off-season promotions. SEO builds visibility so when someone\'s system breaks in the shoulder season, you\'re the first call.',
      },
    },
    {
      '@type': 'Question',
      name: 'What HVAC keywords should I target?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Target emergency keywords (AC repair, furnace not working), seasonal keywords (AC tune-up, heating maintenance), and local keywords (HVAC + your city). We research the highest-value keywords for your specific market.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes Obieo different from other HVAC marketing agencies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Obieo was built by Hunter Lapeyre, who owns and operates a trades business. We understand seasonal demand cycles, emergency service calls, and what drives homeowners to choose one HVAC company over another.',
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

export default function HVACLandingPage() {
  const [ebitdaIncrease, setEbitdaIncrease] = useState(75000)
  const multiplier = 4 // Typical HVAC company EBITDA multiple

  return (
    <div className="min-h-screen bg-[#0c0a09]">
      {/* JSON-LD Schema - static content, safe for dangerouslySetInnerHTML */}
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">
              Attention HVAC company owners tired of generic agencies
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            HVAC Marketing That Works{' '}
            <span className="text-cyan-400">In Every Season</span>
          </h1>

          {/* Subhead */}
          <p className="mt-8 text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            I run a roofing company. I know what it&apos;s like to depend on seasonal demand and compete for every service call. My SEO system is built for trades like yours.
          </p>

          <p className="mt-6 text-lg text-white/50">
            <strong className="text-white/80">+5 ranking positions</strong> and <strong className="text-white/80">66% more impressions</strong> in 30 days. On my own company.
          </p>

          {/* Primary CTA */}
          <div className="mt-10">
            <a
              href="#book-call"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-all cursor-pointer text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02]"
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
              "Your phone rings off the hook in summer and winter, but spring and fall? Crickets.",
              "You're paying for SEO but still losing emergency calls to competitors ranking above you",
              "Your agency writes generic blog posts about 'the importance of AC maintenance' that nobody reads",
              "Monthly reports full of 'impressions' and 'clicks' but you can't tie any of it to actual jobs",
              "You've changed agencies twice and still aren't seeing real results",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <XIcon />
                <span className="text-white/80">{pain}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xl text-white/60">
            Meanwhile, that other HVAC company is showing up every time someone searches &quot;AC repair near me.&quot;
          </p>

          <p className="mt-4 text-lg text-white font-medium">
            It&apos;s not that SEO doesn&apos;t work for HVAC. It&apos;s that most agencies don&apos;t understand seasonal service businesses.
          </p>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Watch Your EBITDA Multiply
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Every dollar of EBITDA you add through SEO gets multiplied at exit. HVAC companies typically sell at 3-5x EBITDA.
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
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-sm text-white/40 mt-2">
              <span>$25K</span>
              <span className="text-lg font-bold text-cyan-400">${ebitdaIncrease.toLocaleString()}</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Widget Container */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 flex items-center justify-center">
            <MultiplierMachine ebitdaIncrease={ebitdaIncrease} multiplier={multiplier} />
          </div>

          <p className="mt-6 text-center text-white/40 text-sm">
            More search visibility → more service calls → more revenue → higher EBITDA → bigger exit.
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
              { label: 'I understand seasonal demand', desc: 'Summer AC, winter heating - I get the cycles' },
              { label: 'I know emergency search intent', desc: 'When someone\'s AC dies at 2am, they need you NOW' },
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
                desc: 'Same SEO playbook that works for my company. Adapted for HVAC-specific keywords and search intent.',
              },
              {
                title: 'You Work With Me Directly',
                desc: 'No account managers. No hand-offs. You text me, I respond.',
              },
              {
                title: 'HVAC-Specific Strategy',
                desc: 'I understand emergency calls, maintenance contracts, and what homeowners search for when their system breaks.',
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

      {/* What is HVAC Marketing Section - GEO Optimized */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            What is HVAC Marketing?
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              <strong className="text-white">HVAC marketing</strong> is the strategic process of promoting heating, ventilation, and air conditioning services to homeowners and businesses who need installation, repair, or maintenance. Unlike generic digital marketing, effective HVAC marketing accounts for extreme seasonality—summer AC rush, winter heating emergencies, and the challenging shoulder seasons in between.
            </p>
            <p>
              Search volume for &quot;hvac marketing agencies&quot; has grown <strong className="text-white">+504% year-over-year</strong>, reflecting how many HVAC contractors are frustrated with agencies that don&apos;t understand their business cycles. The most successful HVAC marketing strategies combine local SEO (ranking for &quot;AC repair near me&quot;), Google Business Profile optimization, and content that captures both emergency searches and planned maintenance inquiries.
            </p>
            <p>
              At Obieo, we specialize in HVAC SEO because we understand that your busiest months fund your slow months—and smart marketing can smooth out those valleys. Our approach builds year-round visibility so you&apos;re not scrambling when temperatures are mild.
            </p>
          </div>
        </div>
      </section>

      {/* Why Generic SEO Doesn't Work Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Why Generic SEO Doesn&apos;t Work for HVAC Companies
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              Most SEO agencies treat HVAC companies like any other local business. They write generic blog posts, build some backlinks, and send you a confusing monthly report. But HVAC has unique challenges that require specialized knowledge.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Extreme Seasonality</p>
                  <p className="text-white/60 text-sm mt-1">Your phone rings off the hook in July and January, but April and October? You need marketing that builds momentum for those slow months.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Emergency vs. Planned Services</p>
                  <p className="text-white/60 text-sm mt-1">&quot;AC not cooling&quot; has completely different intent than &quot;HVAC tune-up cost.&quot; You need content that captures both.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Maintenance Agreement Upsells</p>
                  <p className="text-white/60 text-sm mt-1">The real money is in recurring maintenance contracts. Your SEO should drive these high-LTV customers, not just one-time repairs.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Indoor Air Quality Expansion</p>
                  <p className="text-white/60 text-sm mt-1">IAQ, duct cleaning, and air purification are growing markets. Generic agencies miss these keyword opportunities entirely.</p>
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
            Frequently Asked Questions About HVAC Marketing
          </h2>

          <div className="space-y-4">
            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                How much does HVAC marketing cost?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                HVAC marketing services typically range from $2,000 to $6,000 per month depending on your market size and the services included. At Obieo, we offer transparent pricing with no long-term contracts required.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                How long until I see results from HVAC SEO?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Most HVAC companies see measurable improvements in 60-90 days, with significant ranking gains within 3-6 months. Seasonal keywords may fluctuate, but building year-round visibility is the key to sustainable growth.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                How do I get more HVAC leads during slow seasons?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Focus on maintenance agreement marketing, indoor air quality services, and off-season promotions. SEO builds visibility so when someone&apos;s system breaks in the shoulder season, you&apos;re the first call.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                What HVAC keywords should I target?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Target emergency keywords (AC repair, furnace not working), seasonal keywords (AC tune-up, heating maintenance), and local keywords (HVAC + your city). We research the highest-value keywords for your specific market.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                What makes Obieo different from other HVAC marketing agencies?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Obieo was built by Hunter Lapeyre, who owns and operates a trades business. We understand seasonal demand cycles, emergency service calls, and what drives homeowners to choose one HVAC company over another.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Related Industries */}
      <RelatedIndustries currentSlug="hvac" />

      {/* Calendar Section */}
      <section id="book-call" className="py-16 sm:py-24 bg-[#0c0a09] scroll-mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to Dominate HVAC Search in Your Area?
          </h2>

          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Book a 20-minute call. I&apos;ll take a look at your current rankings, your competition,
            and give you an honest assessment of what it would take to become the go-to HVAC company in your market.
          </p>

          {/* GHL Calendar Widget */}
          <div className="mt-10 rounded-2xl overflow-hidden">
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/0sf1QEe5x3p5eHFHPJLW?source=hvac-page"
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
              scrolling="no"
              id="ghl-hvac-calendar"
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
