'use client'

import { useState } from 'react'
import Script from 'next/script'
import { motion } from 'framer-motion'
import { CheckIcon, XIcon, ChevronDownIcon } from '@/components/ui'

// JSON-LD Schema - static hardcoded content for SEO, safe for dangerouslySetInnerHTML
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Google Business Profile Optimization Services',
  description: 'Expert Google Business Profile optimization for home service businesses. Get more calls from Google Maps and local search with proven GBP SEO strategies.',
  provider: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
  areaServed: 'United States',
  serviceType: 'Google Business Profile Optimization',
}

// FAQ Schema - static hardcoded content for SEO, safe for dangerouslySetInnerHTML
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Google Business Profile optimization?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Google Business Profile (GBP) optimization is the process of improving your business listing on Google to rank higher in local search results and Google Maps. This includes optimizing your business information, categories, photos, reviews, posts, and Q&A to increase visibility and generate more calls and leads.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does GBP optimization take to show results?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most businesses see improvements in their Google Maps rankings within 4-8 weeks of professional GBP optimization. However, competitive markets may take 3-6 months to see significant ranking improvements. Ongoing optimization and review management accelerate and maintain results.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between GBP and GMB?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'GBP (Google Business Profile) and GMB (Google My Business) refer to the same service. Google rebranded Google My Business to Google Business Profile in November 2021. All features and functionality remain the same under the new name.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does GBP optimization cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Professional GBP optimization typically ranges from $300-1,500 for initial setup and optimization, with ongoing management plans ranging from $200-800/month. Pricing varies based on competition level, number of locations, and scope of services included.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I do GBP optimization myself?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, basic GBP optimization can be done yourself. However, professional optimization includes advanced strategies like schema markup, citation building, review management systems, and competitive analysis that significantly improve results. Most business owners see 3-5x better results with professional management.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does GBP optimization help with voice search?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, GBP optimization directly impacts voice search results. When people ask Siri, Alexa, or Google Assistant for local services, the results come primarily from Google Business Profiles. Optimized profiles are more likely to be recommended by AI assistants.',
      },
    },
  ],
}

const stats = [
  { value: '46%', label: 'of Google searches have local intent' },
  { value: '78%', label: 'of local mobile searches result in offline purchase' },
  { value: '88%', label: 'of consumers trust online reviews as much as personal recommendations' },
  { value: '3x', label: 'more likely to get clicks with complete GBP listing' },
]

const optimizationChecklist = [
  { title: 'Complete Business Information', description: 'Name, address, phone, hours, website, and service areas fully filled out' },
  { title: 'Primary & Secondary Categories', description: 'Correct primary category with all relevant secondary categories selected' },
  { title: 'High-Quality Photos', description: 'Professional photos of your work, team, equipment, and location (minimum 10+)' },
  { title: 'Services & Products Listed', description: 'All services with descriptions and pricing where applicable' },
  { title: 'Regular Google Posts', description: 'Weekly updates, offers, and news to show Google youre active' },
  { title: 'Review Generation System', description: 'Consistent flow of new 5-star reviews with professional responses' },
  { title: 'Q&A Section Populated', description: 'Pre-populated questions and answers about your services' },
  { title: 'Attributes & Highlights', description: 'All relevant business attributes like certifications, payment methods, accessibility' },
  { title: 'Booking Integration', description: 'Direct booking links for appointments and estimates' },
  { title: 'Citation Consistency', description: 'NAP (Name, Address, Phone) identical across all directories' },
]

const commonMistakes = [
  { mistake: 'Keyword stuffing in business name', consequence: 'Profile suspension or demotion' },
  { mistake: 'Fake or purchased reviews', consequence: 'Review removal and ranking penalty' },
  { mistake: 'Inconsistent NAP across directories', consequence: 'Lower local rankings' },
  { mistake: 'Ignoring negative reviews', consequence: 'Lost trust and lower conversion' },
  { mistake: 'No photos or low-quality images', consequence: '42% fewer direction requests' },
  { mistake: 'Incorrect business category', consequence: 'Not showing for relevant searches' },
  { mistake: 'Stale profile with no updates', consequence: 'Signals inactive business to Google' },
  { mistake: 'Missing service area settings', consequence: 'Not appearing in nearby searches' },
]

const services = [
  {
    emoji: '📍',
    title: 'GBP Setup & Optimization',
    description: 'Complete profile optimization including categories, attributes, services, and business information.',
  },
  {
    emoji: '⭐',
    title: 'Review Management',
    description: 'Review generation systems, response templates, and reputation monitoring.',
  },
  {
    emoji: '📸',
    title: 'Photo & Visual Strategy',
    description: 'Professional photo optimization, geo-tagging, and visual content planning.',
  },
  {
    emoji: '📝',
    title: 'Google Posts Management',
    description: 'Weekly posts, offers, events, and updates to keep your profile active.',
  },
  {
    emoji: '📞',
    title: 'Citation Building',
    description: 'NAP consistency across 50+ directories and local business listings.',
  },
  {
    emoji: '📅',
    title: 'Ongoing Management',
    description: 'Monthly optimization, reporting, and strategy adjustments.',
  },
]

export default function GBPOptimizationPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* JSON-LD Schema - static hardcoded content defined above */}
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
              +420% YoY Search Growth
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Google Business Profile
              <span className="text-blue-400"> Optimization</span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto mb-8">
              Get more calls from Google Maps and local search. Expert GBP optimization
              that puts your home service business in the local 3-pack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#calendar"
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Get Free GBP Audit
              </a>
              <a
                href="#services"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg border border-white/10 transition-colors"
              >
                View Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What is GBP Optimization - GEO Optimized */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            What is Google Business Profile Optimization?
          </h2>
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-neutral-300 text-lg leading-relaxed mb-6">
              <strong>Google Business Profile optimization</strong> (formerly Google My Business optimization)
              is the process of improving your free Google business listing to rank higher in local search
              results and Google Maps. For home service businesses, GBP optimization is often the
              highest-ROI marketing investment because it targets customers actively searching for
              services in your area.
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed mb-6">
              When someone searches &quot;plumber near me&quot; or &quot;HVAC repair [city name],&quot; Google displays
              a &quot;Local Pack&quot; or &quot;Map Pack&quot; of three businesses at the top of search results.
              <strong> GBP optimization determines whether your business appears in this prime real estate</strong>—where
              44% of local searchers click.
            </p>
            <p className="text-neutral-300 text-lg leading-relaxed">
              Professional GBP optimization includes category selection, photo optimization, review
              management, Google Posts, Q&A population, citation building, and ongoing profile
              maintenance. The goal is to signal to Google that your business is relevant, trustworthy,
              and actively serving customers in your service area.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Grid */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why GBP Optimization Matters
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-3">
                  {stat.value}
                </div>
                <p className="text-neutral-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Optimization Checklist */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            GBP Optimization Checklist
          </h2>
          <p className="text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
            A fully optimized Google Business Profile includes these 10 essential elements
          </p>
          <div className="space-y-4">
            {optimizationChecklist.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <CheckIcon className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold">{item.title}</h3>
                  <p className="text-neutral-400 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Common GBP Mistakes to Avoid
          </h2>
          <p className="text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
            These mistakes can hurt your rankings or get your profile suspended
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {commonMistakes.map((item, index) => (
              <motion.div
                key={item.mistake}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 p-4 bg-red-500/5 rounded-lg border border-red-500/20"
              >
                <XIcon className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold">{item.mistake}</h3>
                  <p className="text-red-400/80 text-sm">{item.consequence}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Our GBP Optimization Services
          </h2>
          <p className="text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
            Comprehensive Google Business Profile management for home service businesses
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-colors"
              >
                <span className="text-4xl mb-4 block">{service.emoji}</span>
                <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-neutral-400">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-400 text-center mb-12">
            Common questions about Google Business Profile optimization
          </p>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((faq, index) => (
              <div
                key={faq.name}
                className="border border-white/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white font-medium pr-4">{faq.name}</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-blue-400 transition-transform flex-shrink-0 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="p-4 bg-white/[0.02]">
                    <p className="text-neutral-300">{faq.acceptedAnswer.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section id="calendar" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get Your Free GBP Audit
          </h2>
          <p className="text-neutral-400 mb-12 max-w-2xl mx-auto">
            See exactly how your Google Business Profile compares to top-ranking competitors in your area
          </p>
          {/* GHL Calendar Widget */}
          <div className="bg-white rounded-xl overflow-hidden">
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/0sf1QEe5x3p5eHFHPJLW?source=gbp-optimization-page"
              style={{ width: '100%', border: 'none', overflow: 'hidden', height: '700px' }}
              scrolling="no"
              id="ghl-gbp-optimization-calendar"
              title="Book a GBP Audit Call"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
