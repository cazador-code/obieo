import type { Metadata } from 'next'
import Link from 'next/link'
import { Quiz } from '@/components/quiz'

// JSON-LD Schema for Quiz Page
const quizSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Visibility Quiz',
  description: 'Free 2-minute assessment to get your personalized website score and see what\'s holding your business back online.',
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
  title: 'Free Website Score | Obieo',
  description: 'Take our free 2-minute assessment to get your personalized website score and see what\'s holding your business back online.',
}

export default function QuizPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
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
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
              Let&apos;s see how your website stacks up
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Answer 5 quick questions to get your personalized website score.
            </p>
          </div>

          <Quiz />
        </div>
      </main>
      </div>
    </>
  )
}
