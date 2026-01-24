import type { Metadata } from 'next'
import Link from 'next/link'
import { ROICalculator } from '@/components/roi-calculator'

// JSON-LD Schema for ROI Calculator Page
const calculatorSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'SEO ROI Calculator',
  description: 'Calculate the potential ROI of SEO for your home service business. See how many extra leads, revenue, and company value you could gain.',
  url: 'https://obieo.com/roi-calculator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
}

export const metadata: Metadata = {
  title: 'SEO ROI Calculator | Obieo',
  description:
    'Calculate the potential ROI of SEO for your home service business. See how many extra leads, revenue, and company value you could gain.',
}

export default function ROICalculatorPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />

      <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
        {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]"
          >
            Obieo
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ✕ Close
          </Link>
        </div>
      </header>

      {/* Calculator content */}
      <main className="pt-16 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
              What&apos;s SEO Actually Worth to Your Business?
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Enter your numbers below to see your potential ROI in 60 seconds.
            </p>
          </div>

          <ROICalculator />
        </div>
      </main>
      </div>
    </>
  )
}
