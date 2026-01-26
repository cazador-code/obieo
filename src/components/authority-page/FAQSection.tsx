/**
 * FAQ Section Component
 * Displays 12-15 FAQs grouped by category
 * Maps to FAQPage schema for rich results
 */

'use client'

import { useState } from 'react'
import type { FAQCategory } from '@/data/industries/types'

interface FAQ {
  question: string
  answer: string
  category: FAQCategory
}

interface FAQSectionProps {
  industryName: string
  faqs: FAQ[]
}

const categoryLabels: Record<FAQCategory, string> = {
  cost: 'Cost & Pricing',
  timeline: 'Timeline & Results',
  strategy: 'Strategy',
  technical: 'Technical',
  comparison: 'Comparisons',
  industry: 'Industry-Specific',
}

const categoryOrder: FAQCategory[] = ['cost', 'timeline', 'strategy', 'technical', 'comparison', 'industry']

export function FAQSection({ industryName, faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<FAQCategory | 'all'>('all')

  // Group FAQs by category
  const groupedFaqs = faqs.reduce(
    (acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = []
      acc[faq.category].push(faq)
      return acc
    },
    {} as Record<FAQCategory, FAQ[]>
  )

  // Filter FAQs based on active category
  const displayedFaqs = activeCategory === 'all'
    ? faqs
    : faqs.filter((faq) => faq.category === activeCategory)

  return (
    <section id="faq" className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Frequently Asked Questions About {industryName} SEO
      </h2>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({faqs.length})
        </button>
        {categoryOrder.map((cat) => {
          const count = groupedFaqs[cat]?.length || 0
          if (count === 0) return null
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryLabels[cat]} ({count})
            </button>
          )
        })}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {displayedFaqs.map((faq) => {
          const globalIndex = faqs.indexOf(faq)
          const isOpen = openIndex === globalIndex

          return (
            <div key={globalIndex} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                <span className="flex-shrink-0 text-gray-500">
                  {isOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </span>
              </button>

              {isOpen && (
                <div className="px-6 pb-4 bg-gray-50">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
