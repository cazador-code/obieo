'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const GHL_BOOKING_URL = 'https://api.leadconnectorhq.com/widget/booking/0sf1QEe5x3p5eHFHPJLW'

type Step = 'business' | 'contact'
type Status = 'idle' | 'submitting' | 'redirecting'

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function rawDigits(phone: string): string {
  return phone.replace(/\D/g, '')
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

const BackArrow = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const INPUT_CLASS = 'w-full px-4 py-3.5 bg-[#f5f2ed] border-2 border-[#e8e4dc] rounded-lg text-[#1a1612] placeholder:text-[#8a8279] focus-visible:outline-none focus:outline-none focus:border-[var(--accent)] transition-colors text-lg'

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
}

function BookingForm() {
  const [currentStep, setCurrentStep] = useState<Step>('business')
  const [direction, setDirection] = useState(1)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    companyName: '',
    hasWebsite: '' as '' | 'yes' | 'no',
    websiteUrl: '',
    name: '',
    email: '',
    phone: '',
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const partialSaved = useRef(false)

  const websiteValue = form.hasWebsite === 'yes' ? form.websiteUrl.trim() : ''

  // Build the lead payload used by both partial capture and final submission
  const buildLeadPayload = useCallback((source: string) => {
    return {
      name: form.name.trim(),
      email: form.email.trim(),
      website: websiteValue,
      score: 0,
      source,
      answers: {
        companyName: form.companyName.trim(),
        hasWebsite: form.hasWebsite,
        websiteUrl: websiteValue,
      },
      phone: rawDigits(form.phone),
    }
  }, [form, websiteValue])

  // Returns JSON string for partial lead, or null if email is not yet valid
  const buildPartialPayload = useCallback(() => {
    const email = form.email.trim()
    if (!email || !email.includes('@') || !email.includes('.')) return null
    return JSON.stringify(buildLeadPayload('call-page-partial'))
  }, [form.email, buildLeadPayload])

  // Beacon partial lead on tab close / navigate away
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !partialSaved.current) {
        const payload = buildPartialPayload()
        if (payload) {
          navigator.sendBeacon('/api/leads', new Blob([payload], { type: 'application/json' }))
          partialSaved.current = true
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [buildPartialPayload])

  // Focus first input when step changes
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150)
    return () => clearTimeout(timer)
  }, [currentStep])

  const update = useCallback((field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }, [])

  const goTo = useCallback((step: Step, dir: number) => {
    setDirection(dir)
    setError('')
    setCurrentStep(step)
  }, [])

  const submit = useCallback(async () => {
    // Validate contact fields
    if (!form.name.trim()) { setError('Please enter your name'); return }
    const emailVal = form.email.trim()
    if (!emailVal || !emailVal.includes('@') || !emailVal.includes('.')) {
      setError('Please enter a valid email'); return
    }
    const digits = rawDigits(form.phone)
    if (digits.length !== 10) { setError('Please enter a valid 10-digit phone number'); return }

    setStatus('submitting')
    setError('')

    // Mark as saved so beacon doesn't double-fire
    partialSaved.current = true

    // Fire-and-forget lead capture
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildLeadPayload('call-page')),
    }).catch(() => {})

    // Brief success state then redirect
    setStatus('redirecting')
    setTimeout(() => {
      const params = new URLSearchParams({
        source: 'call-page',
        name: form.name.trim(),
        email: form.email.trim(),
        phone: digits,
      })
      window.location.href = `${GHL_BOOKING_URL}?${params.toString()}`
    }, 500)
  }, [form, buildLeadPayload])

  const advanceBusiness = useCallback(() => {
    setError('')
    if (!form.companyName.trim()) { setError('Please enter your company name'); return }
    if (form.hasWebsite === '') { setError('Please select whether you have a website'); return }
    if (form.hasWebsite === 'yes' && !form.websiteUrl.trim()) { setError('Please enter your website URL'); return }
    goTo('contact', 1)
  }, [form, goTo])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (currentStep === 'business') advanceBusiness()
      else submit()
    }
  }, [currentStep, advanceBusiness, submit])

  return (
    <div className="max-w-lg mx-auto bg-[#fdfcfa] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/30 border border-[#e8e4dc]" onKeyDown={handleKeyDown}>

      {/* Back arrow */}
      {currentStep === 'contact' && status === 'idle' && (
        <button
          type="button"
          onClick={() => goTo('business', -1)}
          className="flex items-center gap-1 text-sm text-[#8a8279] hover:text-[#5c5549] transition-colors mb-4 -mt-2"
        >
          <BackArrow />
          Back
        </button>
      )}

      {/* Step content with animation */}
      <div className="min-h-[280px] relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {/* Step 1: Business Info */}
            {currentStep === 'business' && (
              <div>
                <label className="block text-xl font-semibold text-[#1a1612] mb-1">
                  Tell me about your business
                </label>
                <p className="text-[#5c5549] text-sm mb-5">So I can research your competitors before we talk.</p>

                <div className="space-y-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={form.companyName}
                    onChange={e => update('companyName', e.target.value)}
                    placeholder="Company name"
                    autoFocus
                    className={INPUT_CLASS}
                  />

                  {/* Has website toggle */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => update('hasWebsite', 'yes')}
                      className={`flex-1 px-4 py-3 rounded-lg border text-center transition-all ${
                        form.hasWebsite === 'yes'
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[#1a1612] font-medium'
                          : 'border-[#e8e4dc] bg-[#f5f2ed] text-[#5c5549] hover:border-[#d97650]/40'
                      }`}
                    >
                      I have a website
                    </button>
                    <button
                      type="button"
                      onClick={() => { update('hasWebsite', 'no'); update('websiteUrl', '') }}
                      className={`flex-1 px-4 py-3 rounded-lg border text-center transition-all ${
                        form.hasWebsite === 'no'
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[#1a1612] font-medium'
                          : 'border-[#e8e4dc] bg-[#f5f2ed] text-[#5c5549] hover:border-[#d97650]/40'
                      }`}
                    >
                      No website yet
                    </button>
                  </div>

                  {/* Conditional website URL */}
                  {form.hasWebsite === 'yes' && (
                    <input
                      type="url"
                      inputMode="url"
                      value={form.websiteUrl}
                      onChange={e => update('websiteUrl', e.target.value)}
                      placeholder="https://yourcompany.com"
                      className={INPUT_CLASS}
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={advanceBusiness}
                  className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-lg transition-all text-base"
                >
                  Continue <ArrowIcon />
                </button>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {currentStep === 'contact' && (
              <div>
                {status === 'redirecting' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-xl font-semibold text-[#1a1612]">Redirecting to calendar...</p>
                  </div>
                ) : (
                  <>
                    <label className="block text-xl font-semibold text-[#1a1612] mb-1">
                      How can I reach you?
                    </label>
                    <p className="text-[#5c5549] text-sm mb-5">I&apos;ll send your custom market brief here.</p>

                    <div className="space-y-4">
                      <input
                        ref={inputRef}
                        type="text"
                        value={form.name}
                        onChange={e => update('name', e.target.value)}
                        placeholder="Your name"
                        autoFocus
                        autoComplete="name"
                        className={INPUT_CLASS}
                      />
                      <div>
                        <input
                          type="email"
                          inputMode="email"
                          value={form.email}
                          onChange={e => update('email', e.target.value)}
                          placeholder="Email address"
                          autoComplete="email"
                          className={INPUT_CLASS}
                        />
                        <p className="text-[#8a8279] text-xs mt-1">Where I&apos;ll send your calendar invite</p>
                      </div>
                      <div>
                        <input
                          type="tel"
                          inputMode="tel"
                          value={form.phone}
                          onChange={e => update('phone', formatPhone(e.target.value))}
                          placeholder="(555) 123-4567"
                          autoComplete="tel"
                          className={INPUT_CLASS}
                        />
                        <p className="text-[#8a8279] text-xs mt-1">Direct line in case I find something urgent</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={submit}
                      disabled={status === 'submitting'}
                      className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all text-lg"
                    >
                      {status === 'submitting' ? 'Submitting...' : <>Pick a Time <ArrowIcon /></>}
                    </button>

                    {/* Trust signals */}
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-[#8a8279]">
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
                      <span className="flex items-center gap-1.5">
                        <CheckIcon />
                        $50 guarantee
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}
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
          {/* Roster Availability */}
          <p className="text-white/40 text-sm mb-8">
            I work with <span className="text-[var(--accent)] font-medium">10 companies</span> at a time. I currently have room for <span className="text-[var(--accent)] font-medium">3 more</span>.
          </p>

          {/* Main Headline */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            Your Competitors Are Getting the Calls{' '}
            <span className="text-[var(--accent)]">You Should Be Getting.</span>{' '}
            I Fix That.
          </h1>

          {/* Subhead - Founder Credibility */}
          <p className="mt-8 text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            I&apos;m not an agency. I&apos;m a home service owner who got tired of paying for SEO that didn&apos;t work. So I built something that did.
          </p>

          <p className="mt-6 text-lg text-white/50">
            <strong className="text-white/80">+19 ranking positions</strong> and <strong className="text-white/80">113% more impressions</strong> in 4 months. On my own company.
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
            <p className="mt-2 text-sm text-white/50">
              $50 guarantee if the call isn&apos;t worth your time.
            </p>
          </div>

          <p className="mt-10 text-base text-white/50 max-w-xl mx-auto leading-relaxed">
            Before we talk, I&apos;ll research your competitors, your rankings, and your market - at no cost.
            The audit is yours whether we work together or not.
          </p>
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
              "You're six months in, still waiting for the results they promised",
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

          <a
            href="#book-call"
            className="inline-flex items-center gap-2 mt-8 text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors text-lg"
          >
            I built a system that fixes this. See what 20 minutes with me looks like
            <ArrowIcon />
          </a>
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
              In <strong className="text-white">4 months</strong>, I went from position 36 to position 17 in Google
              with a 113% increase in daily search impressions.
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

      {/* Real Proof Section */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight text-center mb-4">
            Real Results From My Own Company
          </h2>
          <p className="text-white/50 text-center mb-10 max-w-2xl mx-auto">
            Real data from my own company&apos;s Google Search Console. Unedited.
          </p>

          {/* Before / After Screenshots */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div>
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider mb-3 text-center">Oct 1 - Starting Point</p>
              <div className="rounded-xl border border-white/10 overflow-hidden shadow-xl">
                <div className="bg-[#1a1a1a] px-3 py-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 bg-[#2a2a2a] rounded px-3 py-1">
                    <span className="text-white/30 text-xs">search.google.com/search-console</span>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/proof/gsc-before.png"
                  alt="Google Search Console on Oct 1 - Position 36.3, 810 daily impressions"
                  className="w-full block"
                />
              </div>
              <div className="mt-3 flex justify-center gap-6 text-sm">
                <span className="text-white/40">Position: <strong className="text-white/70">36.3</strong></span>
                <span className="text-white/40">Impressions: <strong className="text-white/70">810/day</strong></span>
              </div>
            </div>

            {/* After */}
            <div>
              <p className="text-[var(--accent)] text-sm font-medium uppercase tracking-wider mb-3 text-center">Feb 1 - 4 Months Later</p>
              <div className="rounded-xl border border-[var(--accent)]/30 overflow-hidden shadow-xl">
                <div className="bg-[#1a1a1a] px-3 py-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 bg-[#2a2a2a] rounded px-3 py-1">
                    <span className="text-white/30 text-xs">search.google.com/search-console</span>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/proof/gsc-after.png"
                  alt="Google Search Console on Feb 1 - Position 17.6, 1,723 daily impressions"
                  className="w-full block"
                />
              </div>
              <div className="mt-3 flex justify-center gap-6 text-sm">
                <span className="text-white/40">Position: <strong className="text-[var(--accent)]">17.6</strong></span>
                <span className="text-white/40">Impressions: <strong className="text-[var(--accent)]">1,723/day</strong></span>
              </div>
            </div>
          </div>

          {/* Metric Callouts */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">+19</p>
              <p className="text-white/50 text-sm mt-1">Positions gained</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">+113%</p>
              <p className="text-white/50 text-sm mt-1">Daily impressions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">3x</p>
              <p className="text-white/50 text-sm mt-1">Daily clicks</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Happens on the Call */}
      <section className="py-16 sm:py-24 bg-[#0c0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight text-center mb-12">
            Here&apos;s Exactly What Happens on Our 20-Minute Call
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Your top 3 competitors and what they're doing to outrank you",
                desc: "You'll see the exact searches they're winning that you're not.",
              },
              {
                title: 'Your #1 fastest path to more calls',
                desc: 'Not a 47-point checklist. One specific move for your business.',
              },
              {
                title: "Honest assessment - even if SEO isn't your problem",
                desc: "If your issue is reviews, pricing, or something else, I'll tell you.",
              },
              {
                title: 'A clear next step, no pressure',
                desc: 'No "let me send you a proposal." Just clarity on what to do next.',
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

      {/* Guarantee Section */}
      <section className="py-16 sm:py-24 bg-[#141210]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0c0a09] border-2 border-[var(--accent)] rounded-2xl p-8 sm:p-10 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-white mb-4">
              My Guarantee
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
              If you don&apos;t walk away with at least <strong className="text-white">3 specific, actionable ways to get more calls from Google</strong> - things you can do yourself even if you never hire me - I&apos;ll Venmo you <strong className="text-white">$50</strong> for wasting your time.
            </p>
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
              <p className="text-white/60 text-xs sm:text-sm">Answer a few quick questions</p>
            </div>
            <div className="flex-1 max-w-[140px]">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] font-bold flex items-center justify-center mx-auto mb-2 text-sm">2</div>
              <p className="text-white/60 text-xs sm:text-sm">Pick a time that works</p>
            </div>
            <div className="flex-1 max-w-[140px]">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] font-bold flex items-center justify-center mx-auto mb-2 text-sm">3</div>
              <p className="text-white/60 text-xs sm:text-sm">I research your market before we talk</p>
            </div>
          </div>

          <BookingForm />
        </div>
      </section>
    </div>
  )
}
