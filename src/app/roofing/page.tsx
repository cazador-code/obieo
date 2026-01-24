'use client'

import Script from 'next/script'
import { useState } from 'react'
import { ShingleStack } from '@/components/roi-widgets/ShingleStack'
import { RelatedIndustries } from '@/components/RelatedIndustries'

// JSON-LD Schema for SEO
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Roofing SEO Services',
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
  description: 'Specialized SEO services for roofing companies that help you rank higher on Google and get found by homeowners searching for roofing contractors.',
  areaServed: 'United States',
  serviceType: 'SEO Services',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does roofing SEO cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Roofing SEO services typically range from $1,500 to $5,000 per month depending on your market competitiveness and goals. At Obieo, we offer transparent pricing with no long-term contracts required.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long until I see results from roofing SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most roofing companies see measurable improvements in 60-90 days, with significant ranking gains within 3-6 months. We achieved +5 ranking positions and 66% more impressions in just 30 days for our own roofing company.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is SEO better than Google Ads for roofing companies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Both have their place. Google Ads delivers immediate leads but stops when you stop paying. SEO builds long-term organic visibility that compounds over time. Most successful roofing companies use both, with SEO providing the foundation for sustainable growth.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you guarantee first page rankings?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Any agency that guarantees specific rankings is a red flag—Google\'s algorithm changes constantly. What we do guarantee is applying the same proven system that got our own roofing company to rank, with transparent reporting so you can track progress.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes Obieo different from other roofing marketing agencies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Obieo was built by Hunter Lapeyre, who owns and operates Lapeyre Roofing in Texas and Louisiana. We don\'t just study roofing SEO—we use it every day for our own company. You get the exact system that works for us, adapted to your market.',
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

export default function RoofingLandingPage() {
  const [ebitdaIncrease, setEbitdaIncrease] = useState(75000)
  const multiplier = 4 // Typical roofing company EBITDA multiple

  return (
    <div className="min-h-screen bg-[#0c0a09]">
      {/* JSON-LD Schema Markup for SEO - static content, safe to use dangerouslySetInnerHTML */}
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-medium">
              Attention roofing company owners tired of generic agencies
            </span>
          </div>

          {/* Main Headline - Optimized for "roofing SEO" keyword */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            <span className="text-[var(--accent)]">Roofing SEO</span>{' '}
            That Actually Works—Built By a Roofer
          </h1>

          {/* Subhead - Founder Credibility */}
          <p className="mt-8 text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Forget generic &quot;marketing.&quot; We are roofing founders who built a proprietary system to dominate local search. We don&apos;t guess. We just copy-paste what worked for us into your business.
          </p>

          <p className="mt-6 text-lg text-white/50">
            <strong className="text-white/80">+5 ranking positions</strong> and <strong className="text-white/80">66% more impressions</strong> in 30 days. On our own roofing company.
          </p>

          {/* Primary CTA */}
          <div className="mt-10">
            <a
              href="#book-call"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-lg transition-all cursor-pointer text-lg shadow-lg shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 hover:scale-[1.02]"
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
            Let me guess...
          </h2>

          <div className="mt-8 space-y-4">
            {[
              "You're paying $2,000-$5,000/month to an agency that treats you like Account #47",
              "Monthly reports full of jargon you don't understand (and can't tie to actual phone calls)",
              "Your \"account manager\" changes every 6 months and can't pronounce your company name",
              "50 blog posts about \"the history of roofing\" that have generated exactly zero leads",
              "Six months in, still waiting for the results they promised",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <XIcon />
                <span className="text-white/80">{pain}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xl text-white/60">
            Meanwhile, your competitor down the street is getting the calls you should be getting.
          </p>

          <p className="mt-4 text-lg text-white font-medium">
            It&apos;s not that SEO doesn&apos;t work. It&apos;s that most agencies optimize for their efficiency, not your results.
          </p>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              What&apos;s This Worth When You Sell?
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Every dollar of EBITDA you add through SEO gets multiplied at exit. Roofing companies typically sell at 3-5x EBITDA.
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
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-sm text-white/40 mt-2">
              <span>$25K</span>
              <span className="text-lg font-bold text-amber-500">${ebitdaIncrease.toLocaleString()}</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Widget Container */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 flex items-center justify-center">
            <ShingleStack ebitdaIncrease={ebitdaIncrease} multiplier={multiplier} />
          </div>

          <p className="mt-6 text-center text-white/40 text-sm">
            This isn&apos;t hypothetical. It&apos;s math. Better SEO → more leads → more revenue → higher EBITDA → bigger exit.
          </p>
        </div>
      </section>

      {/* The Difference Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Why I&apos;m Different
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              I&apos;m Hunter. I own <strong className="text-white">Lapeyre Roofing</strong>, a real roofing company
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
              { label: 'I understand storm season', desc: 'Because I live it every year' },
              { label: 'I know what makes homeowners trust a roofer', desc: 'Because I earn that trust daily' },
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

      {/* Google SERP Mockup - Visual Proof */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Browser Window */}
          <div className="relative rounded-2xl border-2 border-red-500 overflow-hidden shadow-2xl shadow-red-500/10">
            {/* Browser Chrome */}
            <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3">
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              {/* Search bar */}
              <div className="flex-1 bg-[#2a2a2a] rounded-lg px-4 py-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-white/60 text-sm">best roofing company in [CITY]</span>
              </div>
            </div>

            {/* Search Results */}
            <div className="bg-white p-4 sm:p-6">
              {/* Faded Ad Result */}
              <div className="opacity-50 mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Ad · Generic Roofer A</p>
                <p className="text-blue-600 text-lg">We do Roofs | Call Us</p>
                <p className="text-gray-500 text-sm">The average roofing agency result...</p>
              </div>

              {/* Highlighted Result - YOUR Company */}
              <div className="relative bg-red-50 border-2 border-red-500 rounded-xl p-4 sm:p-5">
                {/* YOUR COMPANY badge */}
                <div className="absolute -right-1 -top-3 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                  THIS COULD BE YOU
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-700 text-lg sm:text-xl font-medium">
                      <span className="bg-yellow-200 px-1">[Your Company]</span> Roofing | #1 Rated in <span className="bg-yellow-200 px-1">[Your City]</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">5.0</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-green-600 font-medium">(200+ Reviews)</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">Roofing Contractors · Serves <span className="bg-yellow-200 px-1">[Your Area]</span></p>
                    <p className="text-gray-700 text-sm mt-2 italic">
                      &quot;Best roofing company we&apos;ve ever worked with. Fast, professional, and fair pricing...&quot;
                    </p>
                  </div>
                  {/* Trending icon */}
                  <div className="hidden sm:flex flex-col items-center bg-green-100 rounded-lg p-3 flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Faded Competitor */}
              <div className="opacity-40 mt-4 pt-4 border-t border-gray-200">
                <p className="text-blue-600 text-lg">Other Guy Roofing</p>
                <p className="text-gray-500 text-sm">We also do roofs sometimes...</p>
              </div>
            </div>

            {/* Bottom Banner */}
            <div className="bg-red-500 text-white text-center py-3 px-4">
              <p className="font-bold text-sm sm:text-base uppercase tracking-wide">
                Verified Result: +66% Search Impressions in 30 Days
              </p>
            </div>
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
                desc: 'Same SEO playbook that works for my roofing company. Adapted for your market.',
              },
              {
                title: 'You Work With Me Directly',
                desc: 'No account managers. No hand-offs. You text me, I respond.',
              },
              {
                title: 'Roofing-Specific Strategy',
                desc: 'I understand storm season, insurance jobs, and what homeowners actually search for.',
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

      {/* What is Roofing SEO - GEO Optimized Section */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            What is Roofing SEO?
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              <strong className="text-white">Roofing SEO</strong> is the practice of optimizing a roofing company&apos;s
              online presence to rank higher in Google search results and AI-powered search tools like ChatGPT and
              Perplexity. For roofing businesses, this means appearing when homeowners search for &quot;roofer near
              me,&quot; &quot;roof repair + [city],&quot; or &quot;best roofing company in [area].&quot;
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Key Components of Roofing SEO:</h3>
              <ul className="space-y-3">
                {[
                  'Google Business Profile optimization and management',
                  'Local keyword targeting for your service areas',
                  'Review generation and reputation management',
                  'Technical website optimization (speed, mobile, schema)',
                  'Content that answers homeowner questions about roofing',
                  'AI search visibility (GEO) for ChatGPT, Perplexity, and other AI tools',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p>
              The average roofing company that invests in proper SEO sees a <strong className="text-white">40-60%
              increase</strong> in organic leads within 6 months. Unlike paid ads that stop the moment you stop paying,
              SEO builds lasting visibility that compounds over time.
            </p>
          </div>
        </div>
      </section>

      {/* Why Specialized SEO Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Why Generic SEO Doesn&apos;t Work for Roofing Companies
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              Most SEO agencies treat roofing companies like any other local business. They use the same cookie-cutter
              approach they use for dentists, lawyers, and restaurants. But roofing has unique challenges:
            </p>

            <div className="grid gap-4">
              {[
                {
                  title: 'Storm Season Dynamics',
                  desc: 'Search volume spikes 300-500% after major storms. Generic agencies don\'t know how to capitalize on this.',
                },
                {
                  title: 'Trust is Everything',
                  desc: 'Homeowners are letting strangers on their roof. Reviews, credentials, and local presence matter more than any other industry.',
                },
                {
                  title: 'Lead Quality Over Quantity',
                  desc: 'A single roofing job is worth $8,000-$25,000. You need qualified homeowners, not tire-kickers.',
                },
                {
                  title: 'Insurance Job Keywords',
                  desc: 'Understanding terms like "storm damage," "insurance claim," and "roof inspection" requires industry knowledge.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>

            <p>
              That&apos;s why we built Obieo specifically for home service businesses. We understand the nuances because
              we live them every day with our own roofing company.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section - Schema Markup Already Added */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight text-center mb-12">
            Frequently Asked Questions About Roofing SEO
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'How much does roofing SEO cost?',
                a: 'Roofing SEO services typically range from $1,500 to $5,000 per month depending on your market competitiveness and goals. At Obieo, we offer transparent pricing with no long-term contracts required. We\'ll give you an honest assessment on our strategy call.',
              },
              {
                q: 'How long until I see results from roofing SEO?',
                a: 'Most roofing companies see measurable improvements in 60-90 days, with significant ranking gains within 3-6 months. We achieved +5 ranking positions and 66% more impressions in just 30 days for our own roofing company.',
              },
              {
                q: 'Is SEO better than Google Ads for roofing companies?',
                a: 'Both have their place. Google Ads delivers immediate leads but stops when you stop paying. SEO builds long-term organic visibility that compounds over time. Most successful roofing companies use both, with SEO providing the foundation for sustainable growth.',
              },
              {
                q: 'Do you guarantee first page rankings?',
                a: 'Any agency that guarantees specific rankings is a red flag—Google\'s algorithm changes constantly. What we do guarantee is applying the same proven system that got our own roofing company to rank, with transparent reporting so you can track progress.',
              },
              {
                q: 'What makes Obieo different from other roofing marketing agencies?',
                a: 'Obieo was built by Hunter Lapeyre, who owns and operates Lapeyre Roofing in Texas and Louisiana. We don\'t just study roofing SEO—we use it every day for our own company. You get the exact system that works for us, adapted to your market.',
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
      <RelatedIndustries currentSlug="roofing" />

      {/* Calendar Section */}
      <section id="book-call" className="py-16 sm:py-24 bg-[#0c0a09] scroll-mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to Stop Being Treated Like a Number?
          </h2>

          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Book a 20-minute call. I&apos;ll take a look at your current rankings, your competition,
            and give you an honest assessment of what it would take to dominate your local market.
          </p>

          {/* GHL Calendar Widget */}
          <div className="mt-10 rounded-2xl overflow-hidden">
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/0sf1QEe5x3p5eHFHPJLW?source=roofing-page"
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
              scrolling="no"
              id="ghl-roofing-calendar"
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
