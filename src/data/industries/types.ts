/**
 * Type definitions for Industry Authority Pages
 * Optimized for SEO/GEO/AEO per the authority page template design
 */

export interface IndustryAuthorityData {
  // Core identifiers
  slug: string
  name: string
  accentColor: string // Tailwind color class (e.g., 'red', 'blue', 'violet')

  // Meta tags
  title: string // 50-60 chars with keyword
  description: string // 150-160 chars

  // Tracking
  lastUpdated: string // ISO date string (YYYY-MM-DD)

  // Hero section
  tldr: string // 2-3 sentence TL;DR for CITABLE compliance

  // Definition section
  definition: {
    direct: string // First 40-60 words - extractable definition for AI
    expanded: string // Deeper explanation (100-150 words)
  }

  // Statistics with sources (for credibility and AI citation)
  stats: Array<{
    metric: string
    value: string
    source: string
    year: number
    url?: string
  }>

  // Industry landscape
  landscape: {
    marketSize: string
    marketSizeSource: string
    growth: string
    trends: string[]
    seasonal?: string // Optional seasonal patterns
  }

  // Pain points (5-7 items)
  painPoints: Array<{
    title: string
    problem: string // 2-3 sentences
    impact: string // 1-2 sentences
    stat: string
    statSource: string
    solutionTeaser: string // Links to strategies section
  }>

  // Strategies (6-8 items)
  strategies: Array<{
    title: string
    why: string // 1-2 sentences
    steps: string[] // 3-5 concrete steps
    proTip: string
  }>

  // Keywords organized by intent
  keywords: {
    emergency: string[]
    location: string[]
    service: string[]
    longTail: string[]
  }

  // SEO vs Ads comparison table
  seoVsAdsComparison: Array<{
    factor: string
    seo: string
    ads: string
  }>

  // FAQs (12-15 items)
  faqs: Array<{
    question: string
    answer: string // 50-100 words, direct answer first
    category: 'cost' | 'timeline' | 'strategy' | 'technical' | 'comparison' | 'industry'
  }>

  // Schema.org knowsAbout entries (15+ for elite schema)
  knowsAbout: Array<{
    name: string
    description?: string
    sameAs?: string // Wikipedia or authoritative URL
  }>

  // Internal linking
  landingPageSlug: string // e.g., '/roofing'
  relatedIndustries: string[] // slugs of related industries
}

// Helper type for the FAQ categories
export type FAQCategory = 'cost' | 'timeline' | 'strategy' | 'technical' | 'comparison' | 'industry'

// Helper type for grouping FAQs by category
export type GroupedFAQs = Record<FAQCategory, IndustryAuthorityData['faqs']>

// Schema types for JSON-LD generation
export interface ArticleSchema {
  '@context': 'https://schema.org'
  '@type': 'Article'
  headline: string
  description: string
  image: string
  datePublished: string
  dateModified: string
  author: {
    '@type': 'Person'
    name: string
    url: string
    jobTitle: string
    worksFor: {
      '@type': 'Organization'
      name: string
    }
    sameAs: string[]
  }
  publisher: {
    '@type': 'Organization'
    name: string
    logo: {
      '@type': 'ImageObject'
      url: string
    }
  }
}

export interface FAQSchema {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
}

export interface ServiceSchema {
  '@context': 'https://schema.org'
  '@type': 'Service'
  name: string
  description: string
  provider: {
    '@type': 'ProfessionalService'
    name: string
    url: string
  }
  serviceType: string
  areaServed: {
    '@type': 'Country'
    name: string
  }
  hasOfferCatalog: {
    '@type': 'OfferCatalog'
    name: string
    itemListElement: Array<{
      '@type': 'Offer'
      itemOffered: {
        '@type': 'Service'
        name: string
        description: string
      }
    }>
  }
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

export interface OrganizationSchema {
  '@context': 'https://schema.org'
  '@type': 'ProfessionalService'
  name: string
  url: string
  description: string
  founder: {
    '@type': 'Person'
    name: string
  }
  knowsAbout: Array<{
    '@type': 'Thing'
    name: string
    description?: string
    sameAs?: string
  }>
  areaServed: Array<{
    '@type': 'Country'
    name: string
  }>
}

export interface HowToSchema {
  '@context': 'https://schema.org'
  '@type': 'HowTo'
  name: string
  description: string
  totalTime: string
  step: Array<{
    '@type': 'HowToStep'
    name: string
    text: string
  }>
}
