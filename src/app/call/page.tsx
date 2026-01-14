'use client'

import Script from 'next/script'

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

export default function CallLandingPage() {
  return (
    <div className="min-h-screen bg-[#0c0a09]">
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
              Attention home service business owners tired of generic agencies
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            We Will Install The Same{' '}
            <span className="text-[var(--accent)]">SEO System</span>{' '}
            We Used To Scale Our Own Home Service Company
          </h1>

          {/* Subhead - Founder Credibility */}
          <p className="mt-8 text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Forget generic &quot;marketing.&quot; We are home service business owners who built a proprietary system to dominate local search. We don&apos;t guess. We just copy-paste what worked for us into your business.
          </p>

          <p className="mt-6 text-lg text-white/50">
            <strong className="text-white/80">+5 ranking positions</strong> and <strong className="text-white/80">66% more impressions</strong> in 30 days. On our own company.
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
              "50 blog posts about \"industry history\" that have generated exactly zero leads",
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

      {/* The Difference Section */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Why I&apos;m Different
          </h2>

          <div className="mt-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              I&apos;m Hunter. I own a <strong className="text-white">home service company</strong> serving
              Texas and Louisiana. Real crews. Real trucks. Real customers.
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
              { label: 'I understand seasonal demand', desc: 'Because I live it every year' },
              { label: 'I know what makes homeowners trust a contractor', desc: 'Because I earn that trust daily' },
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
                <span className="text-white/60 text-sm">best [service] company in [CITY]</span>
              </div>
            </div>

            {/* Search Results */}
            <div className="bg-white p-4 sm:p-6">
              {/* Faded Ad Result */}
              <div className="opacity-50 mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Ad · Generic Company A</p>
                <p className="text-blue-600 text-lg">We Do Services | Call Us</p>
                <p className="text-gray-500 text-sm">The average agency result...</p>
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
                      <span className="bg-yellow-200 px-1">[Your Company]</span> | #1 Rated in <span className="bg-yellow-200 px-1">[Your City]</span>
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
                    <p className="text-gray-600 text-sm mt-1">Home Services · Serves <span className="bg-yellow-200 px-1">[Your Area]</span></p>
                    <p className="text-gray-700 text-sm mt-2 italic">
                      &quot;Best company we&apos;ve ever worked with. Fast, professional, and fair pricing...&quot;
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
                <p className="text-blue-600 text-lg">Other Guy Services</p>
                <p className="text-gray-500 text-sm">We also do services sometimes...</p>
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
                desc: 'Same SEO playbook that works for my company. Adapted for your market.',
              },
              {
                title: 'You Work With Me Directly',
                desc: 'No account managers. No hand-offs. You text me, I respond.',
              },
              {
                title: 'Industry-Specific Strategy',
                desc: 'I understand home services, seasonal demand, and what homeowners actually search for.',
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

      {/* Calendar Section */}
      <section id="book-call" className="py-16 sm:py-24 bg-[#141210] scroll-mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to Stop Being Treated Like a Number?
          </h2>

          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
            Book a 20-minute call. I&apos;ll take a look at your current rankings, your competition,
            and give you an honest assessment of what it would take to dominate your local market.
          </p>

          {/* Calendly Inline Widget */}
          <div className="mt-10">
            <div
              className="calendly-inline-widget rounded-2xl overflow-hidden"
              data-url="https://calendly.com/hello-obieo"
              style={{ minWidth: '320px', height: '950px' }}
            />
            <Script
              src="https://assets.calendly.com/assets/external/widget.js"
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
