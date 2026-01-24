'use client'

import { useState } from 'react'
import Script from 'next/script'
import CalendlyButton from '@/components/CalendlyButton'
import { CheckIcon, XIcon, ArrowRightIcon, ChevronDownIcon } from '@/components/ui'

// Note: metadata must be in a separate file for client components
// See layout.tsx for page metadata

// JSON-LD Schema for SEO
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Local Dominance SEO Retainer',
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
  description:
    'Monthly SEO retainer for home service businesses. Google Business Profile management, service pages, technical SEO, citations, and link building to dominate local search.',
  areaServed: 'United States',
  serviceType: 'Local SEO Services',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can you guarantee SEO rankings?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Anyone who guarantees rankings is lying or using tactics that will get your site penalized. We guarantee consistent, quality work. Rankings follow.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long until I see SEO results?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SEO isn\'t a light switch. Typically 3-4 months to see movement, 6+ months for significant results. We set realistic expectations based on your specific market.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if SEO isn\'t working after a few months?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We\'ll have an honest conversation. Sometimes markets are tougher than expected. Sometimes the site needs more work. We won\'t keep taking your money if we\'re not making progress.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is Obieo different from other SEO agencies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most agencies sell volume: 10 pages, 25 citations, 10 backlinks. Sounds impressive, delivers garbage. We focus on fewer, higher-quality deliverables that actually rank and convert.',
      },
    },
  ],
}

const problemBullets = [
  'Paying $2,500/month for "SEO" but can\'t explain what you\'re getting',
  'Monthly reports full of jargon and vanity metrics',
  '50 blog posts about "the history of roofing" that generate zero calls',
  'Promises of "10 backlinks a month" from sites you\'ve never heard of',
  'Six months in, still waiting for results',
]

const needleMovers = [
  'A Google Business Profile that\'s fully optimized and consistently active',
  'Service pages built to rank AND convert — not keyword-stuffed garbage',
  'Technical foundations that don\'t sabotage your rankings',
  'Local signals that tell Google you\'re legit in your area',
  'A steady drip of quality work — not one-time fixes that fade',
]

const includedItems = [
  { title: 'Google Business Profile Management', description: 'Full optimization + 8–10 posts/month + review responses + photo uploads + Q&A management. Your GBP will actually look like you care.' },
  { title: '2 SEO Pages Per Month', description: 'Service pages, location pages, or FAQ pages — built to rank for real searches and convert visitors into calls. Quality over quantity.' },
  { title: 'Technical SEO', description: 'Site speed, mobile optimization, schema markup, crawl fixes, internal linking. The unsexy stuff that makes everything else work.' },
  { title: 'Local Citations', description: 'Month 1: 20–30 core directory listings. Ongoing: monitoring + cleanup. Consistent name/address/phone everywhere Google looks.' },
  { title: 'Quality Link Building', description: '2–4 real links per month from local sources, industry directories, and outreach. No PBNs, no spam — just links that actually help your site.' },
  { title: 'Monthly Reporting', description: 'One-page report + 15-minute video walkthrough. Rankings, traffic, GBP metrics, calls. Plain English, no jargon.' },
]

const bonusItems = [
  { title: 'AEO (Answer Engine Optimization)', description: 'Every page built to show up in AI search results and featured snippets' },
  { title: 'Review Generation System', description: 'Templates + process to help you get more Google reviews (you still have to ask customers, but we make it easy)' },
  { title: 'Conversion Audit (Month 1)', description: 'We\'ll flag the top 5 things on your site killing conversions. Fix them or we\'ll quote it separately.' },
  { title: 'GA4 + Call Tracking Setup', description: 'So we both know what\'s actually working' },
]

const notIncluded = [
  '50 junk blog posts nobody reads',
  '"10 backlinks a month" from sketchy sites',
  'Daily GBP posts that look like spam',
  'Vague monthly reports about "SEO activities"',
  'A website redesign (unless you need it)',
  'Google Ads management (available as add-on)',
]

const timelineItems = [
  { period: 'Months 1–2', title: 'Foundation', description: 'We\'re auditing, fixing, optimizing, and building. Rankings may not move yet. This is normal.' },
  { period: 'Months 3–4', title: 'Movement', description: 'You\'ll see rankings improve on lower-competition keywords. GBP views and actions start climbing.' },
  { period: 'Months 5–6', title: 'Traction', description: 'Multiple first-page rankings. More calls from GBP. Organic traffic clearly trending up.' },
  { period: 'Months 6–12', title: 'Compounding', description: 'This is where SEO pays off. Rankings stick. Leads increase. Competitors wonder what happened.' },
]

const builtForItems = [
  { title: 'Established home service companies', description: 'Roofers, HVAC, plumbers, electricians, pest control, garage doors, landscaping, etc.' },
  { title: 'Owners who want more calls, not more meetings', description: 'You don\'t want a marketing team. You want a marketing partner who handles it.' },
  { title: 'Businesses in markets with real competition', description: 'If you\'re in a mid-size metro and competitors are outranking you, this fixes that.' },
  { title: 'People who\'ve been burned before', description: 'Skeptical of agencies? Good. We\'ll earn your trust with results, not promises.' },
]

const notFitItems = [
  'You need leads in 30 days (try Google Ads instead — we can help with that separately)',
  'You\'re in a hypercompetitive metro (NYC, LA, Dallas) going against funded competitors with massive budgets',
  'Your website is a complete disaster (we\'ll need to fix that first)',
  'You want to "set it and forget it" — we need your input on photos, reviews, and approvals',
]

const faqItems = [
  { question: 'Can you guarantee rankings?', answer: 'No. Anyone who guarantees rankings is lying or using tactics that will get your site penalized. I guarantee consistent, quality work. Rankings follow.' },
  { question: 'What if I need a new website?', answer: 'We can discuss that on our call. If your current site is salvageable, we\'ll work with it. If it needs a rebuild, I\'ll give you options.' },
  { question: 'What if it\'s not working after a few months?', answer: 'We\'ll have an honest conversation. Sometimes markets are tougher than expected. Sometimes the site needs more work. I won\'t keep taking your money if we\'re not making progress.' },
  { question: 'Do you do Google Ads?', answer: 'Yes, as a separate add-on. We can discuss that on the discovery call if paid ads make sense for your situation.' },
  { question: 'How is this different from what I tried before?', answer: 'Most agencies sell volume: 10 pages, 25 citations, 10 backlinks. Sounds impressive, delivers garbage. We focus on fewer, higher-quality deliverables that actually rank and convert.' },
  { question: 'How long until I see results?', answer: 'SEO isn\'t a light switch. Typically 3-4 months to see movement, 6+ months for significant results. We\'ll set realistic expectations on our call based on your market.' },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="font-semibold text-slate-900 pr-4">{question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="pb-5 text-slate-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function LocalDominancePage() {
  return (
    <div className="pt-16 sm:pt-20">
      {/* JSON-LD Schema */}
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

      {/* Hero */}
      <section className="bg-gradient-to-b from-cream-100 to-cream-50 py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
            Stop Guessing. Start Ranking.
          </h1>
          <p className="mt-6 text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            The Local Dominance Retainer — everything a home service company needs to show up on Google, convert more visitors, and grow. No bloat. No BS.
          </p>
          <div className="mt-10">
            <CalendlyButton source="local-dominance-hero" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all cursor-pointer text-lg">
              Book a Discovery Call
              <ArrowRightIcon />
            </CalendlyButton>
            <p className="mt-3 text-sm text-slate-500">
              Free 20-minute call. No pitch deck. Just answers.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Agitation */}
      <section className="bg-cream-50 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Most &quot;SEO Agencies&quot; Are Selling You Smoke
          </h2>
          <div className="mt-8 space-y-4 text-slate-600 leading-relaxed">
            <p>You&apos;ve probably been here before:</p>
            <ul className="space-y-3 ml-1">
              {problemBullets.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-terracotta-500 mt-1">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="pt-4">
              Meanwhile, your competitor down the street is getting the calls you should be getting.
            </p>
            <p className="font-medium text-slate-700">
              It&apos;s not that SEO doesn&apos;t work. It&apos;s that most agencies optimize for their efficiency, not your results.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Introduction */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            What Actually Moves the Needle
          </h2>
          <p className="mt-6 text-slate-600 leading-relaxed">
            After working with home service companies, we&apos;ve learned what actually drives calls from Google:
          </p>
          <ol className="mt-8 space-y-4">
            {needleMovers.map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="w-7 h-7 bg-terracotta-500/10 text-terracotta-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {i + 1}
                </span>
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-lg font-medium text-slate-900">
            That&apos;s what the Local Dominance retainer delivers. Every month. No filler.
          </p>
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-cream-50 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Here&apos;s Exactly What You Get
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {includedItems.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bonus Inclusions */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center mb-10">
            Also Included (Because They Matter)
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {bonusItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-slate-600 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's NOT Included */}
      <section className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">
            What You Won&apos;t Get (And Don&apos;t Need)
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {notIncluded.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <XIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-cream-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-center mb-12">
            When Will I See Results?
          </h2>

          <div className="space-y-8">
            {timelineItems.map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-terracotta-500 text-white rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  {i < timelineItems.length - 1 && <div className="w-0.5 h-full bg-terracotta-200 mt-2" />}
                </div>
                <div className="pb-8">
                  <p className="text-sm font-semibold text-terracotta-600 uppercase tracking-wide">{item.period}</p>
                  <h3 className="font-semibold text-slate-900 text-lg mt-1">{item.title}</h3>
                  <p className="text-slate-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-slate-500 text-sm text-center italic">
            SEO isn&apos;t a light switch — it&apos;s a compound effect. The clients who win are the ones who stay consistent while competitors start and stop.
          </p>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-center mb-12">
            This Is Built For
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {builtForItems.map((item, i) => (
              <div key={i} className="bg-cream-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 flex items-start gap-2">
                  <span className="text-terracotta-500">→</span>
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm mt-2 ml-5">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is NOT For */}
      <section className="bg-cream-100 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center mb-10">
            Not a Fit If
          </h2>

          <div className="space-y-4">
            {notFitItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-4">
                <XIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream-50 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border-2 border-terracotta-500 p-8 sm:p-10 text-center shadow-lg">
            <p className="text-sm font-semibold text-terracotta-600 uppercase tracking-wide">
              Local Dominance Retainer
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Let&apos;s Talk About Your Market
            </h2>
            <p className="mt-4 text-slate-600">
              Every market is different. Book a discovery call and I&apos;ll give you an honest assessment of what it would take to rank in your area.
            </p>
            <CalendlyButton source="local-dominance-cta" className="mt-8 inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all cursor-pointer text-lg">
              Book a Discovery Call
              <ArrowRightIcon />
            </CalendlyButton>
            <p className="mt-4 text-sm text-slate-500">
              Free 20-minute call. No pitch deck. Just answers.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-center mb-10">
            Questions You&apos;re Probably Thinking
          </h2>

          <div className="bg-cream-50 rounded-xl p-6 sm:p-8">
            {faqItems.map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Ready to Actually Show Up on Google?
          </h2>
          <p className="mt-6 text-slate-300 text-lg leading-relaxed">
            Book a 20-minute discovery call. No pitch deck. No pressure. We&apos;ll talk about your business, your market, and whether this is a fit.
          </p>
          <p className="mt-4 text-slate-400">
            If it&apos;s not, I&apos;ll tell you — and point you somewhere that is.
          </p>
          <div className="mt-10">
            <CalendlyButton source="local-dominance-final" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all cursor-pointer text-lg">
              Book Your Discovery Call
              <ArrowRightIcon />
            </CalendlyButton>
            <p className="mt-4 text-sm text-slate-500">
              Or email me directly: <a href="mailto:hunter@obieo.com" className="text-terracotta-400 hover:text-terracotta-300">hunter@obieo.com</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
