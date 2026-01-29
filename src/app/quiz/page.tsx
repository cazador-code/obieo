import type { Metadata } from 'next'
import Link from 'next/link'
import { AIVisibilityQuiz } from '@/components/quiz'

// JSON-LD Schema for Quiz Page (static content, safe for inline script)
const quizSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Visibility Quiz',
  description: 'Free AI visibility analysis to see if your business appears in ChatGPT, Perplexity, and other AI search results.',
  url: 'https://obieo.com/quiz',
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
  title: 'Free AI Visibility Check',
  description: 'See if your business appears in AI search results. Get a free analysis of your visibility on ChatGPT, Perplexity, and other AI platforms.',
  alternates: {
    canonical: '/quiz',
  },
}

export default function QuizPage() {
  return (
    <>
      {/* JSON-LD Schema - static server content, no user input */}
      <script
        type="application/ld+json"
        // Safe: quizSchema is a static object defined at build time
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
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

        {/* Quiz content */}
        <main className="pt-16 pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <AIVisibilityQuiz />
          </div>
        </main>
      </div>
    </>
  )
}
