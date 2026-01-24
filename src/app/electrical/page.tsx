'use client'

import Script from 'next/script'
import { useState } from 'react'
import { StackTheCash } from '@/components/roi-widgets/StackTheCash'
import { RelatedIndustries } from '@/components/RelatedIndustries'

// JSON-LD Schema for SEO
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Electrician SEO Services',
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
  description: 'Specialized SEO services for electrical contractors that help you rank higher on Google and generate more service calls and installation leads.',
  areaServed: 'United States',
  serviceType: 'Marketing Services',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does electrician SEO cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Electrician SEO services typically range from $1,500 to $5,000 per month depending on your market size, competition, and the services included. At Obieo, we offer transparent pricing with no long-term contracts required.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long until I see results from electrician SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most electrical contractors see measurable improvements in 60-90 days, with significant ranking gains within 3-6 months. Emergency service keywords often improve faster than competitive terms like "panel upgrade."',
      },
    },
    {
      '@type': 'Question',
      name: 'What keywords should electricians target?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Target emergency keywords (electrician near me, emergency electrician), service keywords (panel upgrade, EV charger installation), and local keywords (electrician + your city). We research the highest-value keywords for your specific market.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can SEO help me get EV charger installation leads?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'EV charger installation searches are growing rapidly. SEO helps you capture this emerging market by ranking for terms like "EV charger installation near me," "Tesla charger electrician," and "home EV charging setup."',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes Obieo different from other electrician marketing agencies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Obieo was built by someone who owns and operates a trades business. We understand service calls vs. project work, licensing requirements, and what drives homeowners to choose one electrician over another.',
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

export default function ElectricalLandingPage() {
  const [ebitdaIncrease, setEbitdaIncrease] = useState(75000)
  const multiplier = 4 // Typical electrical company EBITDA multiple

  return (
    <div className="min-h-screen bg-[#0c0a09]">
      {/* JSON-LD Schema - static content defined above, safe for dangerouslySetInnerHTML */}
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-yellow-400 text-sm font-medium">
              Attention electrical contractors tired of generic agencies
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            SEO That Powers{' '}
            <span className="text-yellow-400">More Leads</span>{' '}
            For Electricians
          </h1>

          {/* Subhead */}
          <p className="mt-8 text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            I run a trades business. I know the difference between a service call and a panel upgrade project. My SEO system is built for electrical contractors.
          </p>

          <p className="mt-6 text-lg text-white/50">
            <strong className="text-white/80">+5 ranking positions</strong> and <strong className="text-white/80">66% more impressions</strong> in 30 days. On my own company.
          </p>

          {/* Primary CTA */}
          <div className="mt-10">
            <a
              href="#book-call"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-all cursor-pointer text-lg shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-[1.02]"
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
              "You're a licensed electrician but getting outranked by handymen who 'do electrical'",
              "EV charger searches are exploding but you're not capturing that traffic",
              "Your agency doesn't understand the difference between residential service and new construction",
              "Generic blog posts about 'electrical safety tips' that generate zero qualified leads",
              "Homeowners searching for 'electrician near me' are calling your competitor instead",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <XIcon />
                <span className="text-white/80">{pain}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xl text-white/60">
            Meanwhile, some other electrician is getting every panel upgrade and EV charger install in your area.
          </p>

          <p className="mt-4 text-lg text-white font-medium">
            It&apos;s not that SEO doesn&apos;t work for electricians. It&apos;s that most agencies don&apos;t understand licensed trades.
          </p>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Stack Your Exit Value
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Every dollar of EBITDA you add through SEO gets multiplied at exit. Electrical companies typically sell at 3-5x EBITDA.
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
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <div className="flex justify-between text-sm text-white/40 mt-2">
              <span>$25K</span>
              <span className="text-lg font-bold text-yellow-400">${ebitdaIncrease.toLocaleString()}</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Widget Container */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 flex items-center justify-center">
            <StackTheCash ebitdaIncrease={ebitdaIncrease} multiplier={multiplier} />
          </div>

          <p className="mt-6 text-center text-white/40 text-sm">
            More visibility → more service calls + projects → more revenue → higher EBITDA → bigger exit.
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
              { label: 'I understand licensing matters', desc: 'Homeowners want real electricians, not handymen' },
              { label: 'I know the EV market is exploding', desc: 'And most agencies have no idea how to capture it' },
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
                desc: 'Same SEO playbook that works for my company. Adapted for electrical-specific keywords.',
              },
              {
                title: 'You Work With Me Directly',
                desc: 'No account managers. No hand-offs. You text me, I respond.',
              },
              {
                title: 'Electrical-Specific Strategy',
                desc: 'I understand panel upgrades, EV chargers, rewiring - and what homeowners search for.',
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

      {/* What is Electrician SEO Section - GEO Optimized */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            What is Electrician SEO?
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              <strong className="text-white">Electrician SEO</strong> is the process of optimizing your electrical contracting business to appear at the top of Google when homeowners and businesses search for electrical services. This includes emergency searches like &quot;electrician near me,&quot; service-specific terms like &quot;panel upgrade cost,&quot; and emerging markets like &quot;EV charger installation.&quot;
            </p>
            <p>
              The electrical industry is seeing major shifts—EV charger installations are up 200%+ as electric vehicle adoption accelerates. Smart home technology, solar panel integration, and whole-house generator installations are all growing markets. Effective electrician SEO positions you to capture these high-value searches before your competitors.
            </p>
            <p>
              At Obieo, we specialize in SEO for electrical contractors because we understand the difference between a $150 outlet repair and a $15,000 service upgrade. Our strategies focus on the keywords that drive profitable work, not just clicks.
            </p>
          </div>
        </div>
      </section>

      {/* Why Generic SEO Doesn't Work Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Why Generic SEO Doesn&apos;t Work for Electricians
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              Most marketing agencies treat electrical contractors like any other local business. They don&apos;t understand licensing requirements, the difference between residential and commercial work, or why &quot;electrician near me&quot; has completely different intent than &quot;commercial electrical contractor.&quot;
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Licensed vs. Unlicensed Competition</p>
                  <p className="text-white/60 text-sm mt-1">You&apos;re competing against &quot;handymen&quot; who shouldn&apos;t be doing electrical work. SEO helps you differentiate your licensed expertise.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Service Calls vs. Project Work</p>
                  <p className="text-white/60 text-sm mt-1">A $200 outlet repair vs. a $10,000 panel upgrade require different keyword strategies. We target the work you actually want.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Emerging Markets</p>
                  <p className="text-white/60 text-sm mt-1">EV chargers, solar, smart homes—these growing markets have less competition and higher margins. We help you dominate them early.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <CheckIcon />
                <div>
                  <p className="text-white font-medium">Commercial vs. Residential</p>
                  <p className="text-white/60 text-sm mt-1">If you want commercial work, you need commercial keywords. We build strategies based on the type of work you want to grow.</p>
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
            Frequently Asked Questions About Electrician SEO
          </h2>

          <div className="space-y-4">
            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                How much does electrician SEO cost?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Electrician SEO services typically range from $1,500 to $5,000 per month depending on your market size, competition, and the services included. At Obieo, we offer transparent pricing with no long-term contracts required.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                How long until I see results from electrician SEO?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Most electrical contractors see measurable improvements in 60-90 days, with significant ranking gains within 3-6 months. Emergency service keywords often improve faster than competitive terms like &quot;panel upgrade.&quot;
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                What keywords should electricians target?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Target emergency keywords (electrician near me, emergency electrician), service keywords (panel upgrade, EV charger installation), and local keywords (electrician + your city). We research the highest-value keywords for your specific market.
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                Can SEO help me get EV charger installation leads?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                EV charger installation searches are growing rapidly. SEO helps you capture this emerging market by ranking for terms like &quot;EV charger installation near me,&quot; &quot;Tesla charger electrician,&quot; and &quot;home EV charging setup.&quot;
              </div>
            </details>

            <details className="group bg-white/5 rounded-lg border border-white/10">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
                What makes Obieo different from other electrician marketing agencies?
                <span className="ml-2 text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-white/70">
                Obieo was built by someone who owns and operates a trades business. We understand service calls vs. project work, licensing requirements, and what drives homeowners to choose one electrician over another.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Related Industries */}
      <RelatedIndustries currentSlug="electrical" />

      {/* Calendar Section */}
      <section id="book-call" className="py-16 sm:py-24 bg-[#0c0a09] scroll-mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to Power Up Your Lead Flow?
          </h2>

          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Book a 20-minute call. I&apos;ll take a look at your current rankings, your competition,
            and give you an honest assessment of what it would take to dominate electrical search in your area.
          </p>

          {/* GHL Calendar Widget */}
          <div className="mt-10 rounded-2xl overflow-hidden">
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/0sf1QEe5x3p5eHFHPJLW?source=electrical-page"
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
              scrolling="no"
              id="ghl-electrical-calendar"
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
