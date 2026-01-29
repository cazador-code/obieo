/**
 * Schema Generation Utilities for Authority Pages
 * Generates JSON-LD structured data optimized for SEO/GEO
 * Target Schema Depth Score: 9/10
 */

import type {
  IndustryAuthorityData,
  ArticleSchema,
  FAQSchema,
  ServiceSchema,
  BreadcrumbSchema,
  OrganizationSchema,
  HowToSchema,
} from '@/data/industries/types'

const SITE_URL = 'https://www.obieo.com'
const AUTHOR_NAME = 'Hunter Lapeyre'
const AUTHOR_LINKEDIN = 'https://www.linkedin.com/in/hunterlapeyre'
const COMPANY_NAME = 'Obieo'
const LOGO_URL = `${SITE_URL}/logo.png`

/**
 * Generate Article schema for the authority page
 */
export function generateArticleSchema(data: IndustryAuthorityData): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    image: `${SITE_URL}/og/${data.slug}-seo.png`,
    datePublished: data.lastUpdated,
    dateModified: data.lastUpdated,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: `${SITE_URL}/about`,
      jobTitle: 'Founder & SEO Strategist',
      worksFor: {
        '@type': 'Organization',
        name: COMPANY_NAME,
      },
      sameAs: [AUTHOR_LINKEDIN],
    },
    publisher: {
      '@type': 'Organization',
      name: COMPANY_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
  }
}

/**
 * Generate FAQPage schema from FAQ data
 */
export function generateFAQSchema(data: IndustryAuthorityData): FAQSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generate Service schema with hasOfferCatalog
 */
export function generateServiceSchema(data: IndustryAuthorityData): ServiceSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${data.name} SEO Services`,
    description: `Specialized SEO and AI search optimization for ${data.name.toLowerCase()} companies. Get found on Google, ChatGPT, and Perplexity.`,
    provider: {
      '@type': 'ProfessionalService',
      name: COMPANY_NAME,
      url: SITE_URL,
    },
    serviceType: 'Search Engine Optimization',
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${data.name} SEO Services`,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `Local SEO for ${data.name} Companies`,
            description: 'Google Business Profile optimization, local citations, review management, and local content strategy',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `GEO Optimization for ${data.name}`,
            description: 'AI search visibility optimization for ChatGPT, Perplexity, Claude, and Google AI Overviews',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `${data.name} Website SEO`,
            description: 'Technical SEO audit, on-page optimization, and content strategy for contractor websites',
          },
        },
      ],
    },
  }
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(data: IndustryAuthorityData): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Industries',
        item: `${SITE_URL}/industries`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${data.name} SEO`,
        item: `${SITE_URL}/industries/${data.slug}`,
      },
    ],
  }
}

/**
 * Generate Organization schema with knowsAbout (Elite - 15+ entries)
 */
export function generateOrganizationSchema(data: IndustryAuthorityData): OrganizationSchema {
  // Base knowsAbout entries that apply to all industries
  const baseKnowsAbout = [
    {
      '@type': 'Thing' as const,
      name: 'Search Engine Optimization',
      sameAs: 'https://en.wikipedia.org/wiki/Search_engine_optimization',
    },
    {
      '@type': 'Thing' as const,
      name: 'Local SEO',
      sameAs: 'https://en.wikipedia.org/wiki/Local_search_(Internet)',
    },
    {
      '@type': 'Thing' as const,
      name: 'Generative Engine Optimization',
      description: 'Optimization for AI search tools like ChatGPT and Perplexity',
    },
    {
      '@type': 'Thing' as const,
      name: 'Answer Engine Optimization',
      description: 'Optimization for featured snippets and direct answers',
    },
    {
      '@type': 'Thing' as const,
      name: 'Google Business Profile Optimization',
    },
    {
      '@type': 'Thing' as const,
      name: 'Content Marketing',
      sameAs: 'https://en.wikipedia.org/wiki/Content_marketing',
    },
    {
      '@type': 'Thing' as const,
      name: 'Technical SEO',
    },
    {
      '@type': 'Thing' as const,
      name: 'Home Services Marketing',
    },
  ]

  // Combine base + industry-specific knowsAbout
  const allKnowsAbout = [
    ...baseKnowsAbout,
    ...data.knowsAbout.map((item) => ({
      '@type': 'Thing' as const,
      name: item.name,
      ...(item.description && { description: item.description }),
      ...(item.sameAs && { sameAs: item.sameAs }),
    })),
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: COMPANY_NAME,
    url: SITE_URL,
    description: 'SEO and AI search optimization agency for home service businesses. Built by a contractor, for contractors.',
    founder: {
      '@type': 'Person',
      name: AUTHOR_NAME,
    },
    knowsAbout: allKnowsAbout,
    areaServed: [
      {
        '@type': 'Country',
        name: 'United States',
      },
    ],
  }
}

/**
 * Generate HowTo schema from strategies
 */
export function generateHowToSchema(data: IndustryAuthorityData): HowToSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Improve ${data.name} SEO`,
    description: `Step-by-step guide to improving search visibility for ${data.name.toLowerCase()} companies in 2026`,
    totalTime: 'PT30M',
    step: data.strategies.slice(0, 7).map((strategy) => ({
      '@type': 'HowToStep',
      name: strategy.title,
      text: strategy.steps.join(' '),
    })),
  }
}

/**
 * Generate all schemas for a page as an array of JSON-LD objects
 */
export function generateAllSchemas(data: IndustryAuthorityData) {
  return [
    generateArticleSchema(data),
    generateFAQSchema(data),
    generateServiceSchema(data),
    generateBreadcrumbSchema(data),
    generateOrganizationSchema(data),
    generateHowToSchema(data),
  ]
}

/**
 * Render schemas as script tags for Next.js
 */
export function renderSchemaScripts(data: IndustryAuthorityData): string {
  const schemas = generateAllSchemas(data)
  return schemas
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n')
}
