'use client'

import { useState, useRef, useCallback } from 'react'

const GHL_BOOKING_URL = 'https://api.leadconnectorhq.com/widget/booking/0sf1QEe5x3p5eHFHPJLW'

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

const INPUT_CLASS = 'w-full px-4 py-3.5 bg-[#f5f2ed] border border-[#e8e4dc] rounded-lg text-[#1a1612] placeholder:text-[#8a8279] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors'

function BookingForm() {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    companyName: '',
    hasWebsite: '' as '' | 'yes' | 'no',
    websiteUrl: '',
    name: '',
    email: '',
    phone: '',
  })

  const companyRef = useRef<HTMLInputElement>(null)
  const websiteRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const totalSteps = 3

  const update = useCallback((field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }, [])

  const next = useCallback(() => {
    // Step 1: Contact info
    if (step === 0) {
      if (!form.name.trim()) { setError('Please enter your name'); nameRef.current?.focus(); return }
      if (!form.email.trim() || !form.email.includes('@')) { setError('Please enter a valid email'); return }
    }
    // Step 2: Company name
    if (step === 1 && !form.companyName.trim()) {
      setError('Please enter your company name')
      companyRef.current?.focus()
      return
    }
    setError('')
    setStep(prev => Math.min(prev + 1, totalSteps - 1))
    setTimeout(() => {
      if (step === 0) companyRef.current?.focus()
    }, 100)
  }, [step, form])

  const prev = useCallback(() => {
    setError('')
    setStep(s => Math.max(s - 1, 0))
  }, [])

  const submit = useCallback(async () => {
    if (!form.hasWebsite) { setError('Please select an option'); return }
    if (form.hasWebsite === 'yes' && !form.websiteUrl.trim()) {
      setError('Please enter your website URL')
      websiteRef.current?.focus()
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          website: form.hasWebsite === 'yes' ? form.websiteUrl.trim() : '',
          score: 0,
          source: 'call-page',
          answers: {
            companyName: form.companyName.trim(),
            hasWebsite: form.hasWebsite,
            websiteUrl: form.hasWebsite === 'yes' ? form.websiteUrl.trim() : '',
          },
          phone: form.phone.trim(),
        }),
      })
    } catch {
      // Don't block redirect if lead capture fails
    }

    const params = new URLSearchParams({
      source: 'call-page',
      name: form.name.trim(),
      email: form.email.trim(),
      ...(form.phone.trim() && { phone: form.phone.trim() }),
    })
    window.location.href = `${GHL_BOOKING_URL}?${params.toString()}`
  }, [form])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (step < totalSteps - 1) next()
      else submit()
    }
  }, [step, next, submit])

  const progress = ((step + 1) / totalSteps) * 100
  const buttonLabels = ['Next: Company Info', 'Next: Website Check']

  return (
    <div className="max-w-md mx-auto bg-[#fdfcfa] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/30 border border-[#e8e4dc]" onKeyDown={handleKeyDown}>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-[#8a8279] mb-2">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-[#e8e4dc] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[280px]">
        {/* Step 1: Contact Info (capture lead first) */}
        {step === 0 && (
          <div>
            <label className="block text-lg font-semibold text-[#1a1612] mb-2">
              Let&apos;s get you on the calendar
            </label>
            <p className="text-[#5c5549] text-sm mb-5">Takes 30 seconds. We&apos;ll send a calendar invite right away.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[#5c5549] mb-1.5">Full Name</label>
                <input
                  ref={nameRef}
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="e.g. John Smith"
                  autoFocus
                  autoComplete="name"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-sm text-[#5c5549] mb-1.5">Email</label>
                <input
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="john@company.com"
                  autoComplete="email"
                  className={INPUT_CLASS}
                />
                <p className="mt-1.5 text-xs text-[#8a8279]">Only used to send your calendar invite.</p>
              </div>
              <div>
                <label className="block text-sm text-[#5c5549] mb-1.5">Phone <span className="text-[#8a8279]">(optional)</span></label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Company Name */}
        {step === 1 && (
          <div>
            <label className="block text-lg font-semibold text-[#1a1612] mb-2">
              What&apos;s your company name?
            </label>
            <p className="text-[#5c5549] text-sm mb-4">So we can research your market before the call.</p>
            <input
              ref={companyRef}
              type="text"
              value={form.companyName}
              onChange={e => update('companyName', e.target.value)}
              placeholder="e.g. Johnson Plumbing"
              autoFocus
              className={INPUT_CLASS}
            />
          </div>
        )}

        {/* Step 3: Website */}
        {step === 2 && (
          <div>
            <label className="block text-lg font-semibold text-[#1a1612] mb-2">
              Do you currently have a website?
            </label>
            <p className="text-[#5c5549] text-sm mb-4">We&apos;ll audit it before our call (free).</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => update('hasWebsite', 'yes')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg border text-left transition-all ${
                  form.hasWebsite === 'yes'
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[#1a1612]'
                    : 'border-[#e8e4dc] bg-[#f5f2ed] text-[#5c5549] hover:border-[#d97650]/40'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  form.hasWebsite === 'yes' ? 'border-[var(--accent)]' : 'border-[#8a8279]'
                }`}>
                  {form.hasWebsite === 'yes' && <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />}
                </span>
                Yes, I have a website
              </button>
              <button
                type="button"
                onClick={() => {
                  update('hasWebsite', 'no')
                  update('websiteUrl', '')
                  // Auto-submit after short delay since no URL needed
                  setTimeout(() => {
                    setSubmitting(true)
                    fetch('/api/leads', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: form.name.trim(),
                        email: form.email.trim(),
                        website: '',
                        score: 0,
                        source: 'call-page',
                        answers: { companyName: form.companyName.trim(), hasWebsite: 'no', websiteUrl: '' },
                        phone: form.phone.trim(),
                      }),
                    }).catch(() => {})
                    const params = new URLSearchParams({
                      source: 'call-page',
                      name: form.name.trim(),
                      email: form.email.trim(),
                      ...(form.phone.trim() && { phone: form.phone.trim() }),
                    })
                    window.location.href = `${GHL_BOOKING_URL}?${params.toString()}`
                  }, 300)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg border text-left transition-all ${
                  form.hasWebsite === 'no'
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[#1a1612]'
                    : 'border-[#e8e4dc] bg-[#f5f2ed] text-[#5c5549] hover:border-[#d97650]/40'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  form.hasWebsite === 'no' ? 'border-[var(--accent)]' : 'border-[#8a8279]'
                }`}>
                  {form.hasWebsite === 'no' && <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />}
                </span>
                No, not yet
              </button>
            </div>
            {form.hasWebsite === 'yes' && (
              <div className="mt-4">
                <label className="block text-sm text-[#5c5549] mb-1.5">Website URL</label>
                <input
                  ref={websiteRef}
                  type="url"
                  inputMode="url"
                  value={form.websiteUrl}
                  onChange={e => update('websiteUrl', e.target.value)}
                  placeholder="https://yourcompany.com"
                  autoFocus
                  className={INPUT_CLASS}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      {/* Trust signals inside the form (near submit) */}
      {step === totalSteps - 1 && form.hasWebsite === 'yes' && (
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#8a8279]">
          <span className="flex items-center gap-1.5">
            <CheckIcon />
            Free 20-min call
          </span>
          <span className="flex items-center gap-1.5">
            <CheckIcon />
            No contracts
          </span>
          <span className="flex items-center gap-1.5">
            <CheckIcon />
            Honest assessment
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={prev}
            className="px-6 py-3 border border-[#e8e4dc] text-[#5c5549] rounded-lg hover:bg-[#f5f2ed] transition-colors"
          >
            Back
          </button>
        )}
        {step < totalSteps - 1 ? (
          <button
            type="button"
            onClick={next}
            className="flex-1 px-6 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-lg transition-all hover:scale-[1.01] shadow-lg shadow-[var(--accent)]/25"
          >
            {buttonLabels[step]}
          </button>
        ) : (
          form.hasWebsite === 'yes' && (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="flex-1 px-6 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-lg transition-all hover:scale-[1.01] shadow-lg shadow-[var(--accent)]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Redirecting to Calendar...' : 'Pick a Time'}
            </button>
          )
        )}
      </div>
    </div>
  )
}

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
              3 client spots left — I do the work myself, so capacity is limited
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            Your Competitors Are Getting the Calls{' '}
            <span className="text-[var(--accent)]">You Should Be Getting.</span>{' '}
            We Fix That.
          </h1>

          {/* Subhead - Founder Credibility */}
          <p className="mt-8 text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            I&apos;m not an agency. I&apos;m a home service owner who got tired of paying for SEO that didn&apos;t work. So I built something that did.
          </p>

          <p className="mt-6 text-lg text-white/50">
            <strong className="text-white/80">+5 ranking positions</strong> and <strong className="text-white/80">66% more impressions</strong> in 30 days. On my own company.
          </p>

          {/* Primary CTA */}
          <div className="mt-10">
            <a
              href="#book-call"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-lg transition-all cursor-pointer text-lg shadow-lg shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 hover:scale-[1.02]"
            >
              Book Your Free 20-Min Strategy Call
              <ArrowIcon />
            </a>
            <p className="mt-3 text-sm text-white/40">
              No pitch deck. Just real talk about your market.
            </p>
          </div>
        </div>
      </section>

      {/* Pain Agitation Section */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Here&apos;s what $3,000/month gets you at most agencies:
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
            I&apos;m Not an Agency. I&apos;m a Contractor Who Figured Out SEO.
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
                title: 'My $0 to Page 1 Playbook',
                desc: 'The same steps I used to rank my own company. No theory — just what worked.',
              },
              {
                title: 'Text Me. I\u2019ll Text Back.',
                desc: 'No account managers, no ticket systems. You get my cell number.',
              },
              {
                title: 'I Know What "Slow Season" Feels Like',
                desc: 'I plan content around your busy months because I manage the same cycles.',
              },
              {
                title: 'Calls, Not Clicks',
                desc: 'I don\u2019t send you a PDF full of graphs. I show you which searches turned into phone calls.',
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

      {/* Booking Form Section */}
      <section id="book-call" className="py-16 sm:py-24 bg-[#0c0a09] scroll-mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              I&apos;ll Research Your Market Before We Talk. For Free.
            </h2>
          </div>

          {/* What happens next - 3 step visual */}
          <div className="flex items-start justify-center gap-4 sm:gap-8 mb-10 text-center">
            <div className="flex-1 max-w-[140px]">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] font-bold flex items-center justify-center mx-auto mb-2 text-sm">1</div>
              <p className="text-white/60 text-xs sm:text-sm">Answer 3 quick questions</p>
            </div>
            <div className="flex-1 max-w-[140px]">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] font-bold flex items-center justify-center mx-auto mb-2 text-sm">2</div>
              <p className="text-white/60 text-xs sm:text-sm">Pick a time that works</p>
            </div>
            <div className="flex-1 max-w-[140px]">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] font-bold flex items-center justify-center mx-auto mb-2 text-sm">3</div>
              <p className="text-white/60 text-xs sm:text-sm">We research your market before we talk</p>
            </div>
          </div>

          <BookingForm />
        </div>
      </section>
    </div>
  )
}
