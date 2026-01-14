'use client'

import Script from 'next/script'

export default function CallLandingPage() {
  return (
    <div className="min-h-screen bg-[#0c0a09] flex flex-col">
      {/* Minimal Header - Just Logo */}
      <div className="py-6 text-center">
        <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
          Obieo
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        <div className="max-w-2xl w-full text-center mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Pick a Time That Works
          </h1>
          <p className="mt-4 text-lg text-white/60">
            20 minutes. Free. No sales pitch.
          </p>
        </div>

        {/* Calendly Embed - The Star of the Show */}
        <div className="w-full max-w-3xl">
          <div
            className="calendly-inline-widget rounded-2xl overflow-hidden bg-white"
            data-url="https://calendly.com/hello-obieo"
            style={{ minWidth: '320px', height: '700px' }}
          />
          <Script
            src="https://assets.calendly.com/assets/external/widget.js"
            strategy="lazyOnload"
          />
        </div>
      </div>
    </div>
  )
}
