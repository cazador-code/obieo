'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

type Industry = {
  name: string
  slug: string
  description: string
}

// All available industries for cross-linking
const allIndustries: Industry[] = [
  { name: 'Roofing', slug: 'roofing', description: 'SEO for roofing companies' },
  { name: 'HVAC', slug: 'hvac', description: 'Marketing for HVAC contractors' },
  { name: 'Plumbing', slug: 'plumbing', description: 'SEO for plumbers' },
  { name: 'Electrical', slug: 'electrical', description: 'SEO for electricians' },
  { name: 'Pest Control', slug: 'pest-control', description: 'SEO for pest control' },
  { name: 'Landscaping', slug: 'landscaping', description: 'SEO for landscapers' },
  { name: 'Cleaning', slug: 'cleaning', description: 'SEO for cleaning services' },
  { name: 'Garage Doors', slug: 'garage-doors', description: 'SEO for garage door companies' },
  { name: 'Painting', slug: 'painting', description: 'SEO for painters' },
  { name: 'Flooring', slug: 'flooring', description: 'SEO for flooring contractors' },
]

// Related industry mappings - which industries relate to each other
const relatedMapping: Record<string, string[]> = {
  roofing: ['hvac', 'painting', 'electrical', 'gutters'],
  hvac: ['roofing', 'plumbing', 'electrical'],
  plumbing: ['hvac', 'electrical', 'cleaning'],
  electrical: ['hvac', 'roofing', 'plumbing'],
  'pest-control': ['cleaning', 'landscaping'],
  landscaping: ['pest-control', 'painting', 'flooring'],
  cleaning: ['pest-control', 'plumbing', 'painting'],
  'garage-doors': ['roofing', 'electrical', 'painting'],
  painting: ['roofing', 'flooring', 'cleaning'],
  flooring: ['painting', 'cleaning', 'electrical'],
}

interface RelatedIndustriesProps {
  currentSlug: string
  heading?: string
  subheading?: string
  showServices?: boolean
}

export function RelatedIndustries({
  currentSlug,
  heading = 'Related Industries We Serve',
  subheading = 'We help home service businesses across multiple trades with specialized SEO strategies',
  showServices = true,
}: RelatedIndustriesProps) {
  // Get related industries based on mapping, fall back to first 3 if not mapped
  const relatedSlugs = relatedMapping[currentSlug] || []
  const relatedIndustries = relatedSlugs
    .map(slug => allIndustries.find(i => i.slug === slug))
    .filter((i): i is Industry => i !== undefined)
    .slice(0, 3)

  // If no related industries found, pick 3 random ones (excluding current)
  const displayIndustries = relatedIndustries.length > 0
    ? relatedIndustries
    : allIndustries.filter(i => i.slug !== currentSlug).slice(0, 3)

  return (
    <section className="py-16 sm:py-20 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {heading}
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            {subheading}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {displayIndustries.map((industry, index) => (
            <motion.div
              key={industry.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/${industry.slug}`}
                className="block p-6 bg-white/5 rounded-xl border border-white/10 hover:border-orange-500/30 hover:bg-white/[0.07] transition-all group"
              >
                <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors mb-2">
                  {industry.name} SEO
                </h3>
                <p className="text-neutral-400 text-sm mb-4">
                  {industry.description}
                </p>
                <span className="text-orange-400 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {showServices && (
          <div className="mt-12 text-center">
            <p className="text-neutral-400 mb-4">
              Looking for specific services?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/gbp-optimization"
                className="px-4 py-2 bg-white/5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                GBP Optimization
              </Link>
              <Link
                href="/services"
                className="px-4 py-2 bg-white/5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                All Services
              </Link>
              <Link
                href="/industries"
                className="px-4 py-2 bg-white/5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                All Industries
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
