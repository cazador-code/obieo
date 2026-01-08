import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'You\'re Booked! | Obieo',
  description: 'Your strategy call is confirmed. Watch this video before our call.',
  robots: 'noindex, nofollow', // Don't index thank you pages
}

export default function RoofingThankYouPage() {
  return (
    <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
      {/* Subtle grain texture */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        {/* Success checkmark */}
        <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          You&apos;re Booked!
        </h1>

        <p className="mt-4 text-xl text-white/60">
          Check your email for the calendar invite.
        </p>

        {/* Divider */}
        <div className="my-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/40 text-sm uppercase tracking-wide">Before our call</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* VSL Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Watch This First
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            This 10-minute video will show you exactly how our SEO system works, so you can
            come to the call with the right questions.
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="aspect-video bg-[#141210] rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
          <div className="text-center p-8">
            {/* Play button */}
            <div className="w-24 h-24 bg-[var(--accent)]/10 border-2 border-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-6 cursor-pointer hover:bg-[var(--accent)]/20 transition-colors">
              <svg className="w-10 h-10 text-[var(--accent)] ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            <p className="text-white/40 text-sm">
              Video coming soon
            </p>
            <p className="text-white/20 text-xs mt-2">
              (Placeholder for VSL embed)
            </p>
          </div>
        </div>

        {/* What to expect */}
        <div className="mt-12 text-left max-w-xl mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4">
            What to expect on our call:
          </h3>
          <ul className="space-y-3">
            {[
              'Quick audit of your current Google rankings',
              'Analysis of your top 3 local competitors',
              'Honest assessment of what it would take to beat them',
              'Clear next steps if we\'re a good fit',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white/70">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact info */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/40 text-sm">
            Need to reschedule? Email me at{' '}
            <a href="mailto:hunter@obieo.com" className="text-[var(--accent)] hover:text-[var(--accent-hover)]">
              hunter@obieo.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
