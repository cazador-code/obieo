import {
  Hero,
  FeaturedCaseStudy,
  ProblemSolution,
  ServicesOverview,
  QuizCTA,
  Testimonial,
  ROICalculatorCTA,
  FinalCTA,
} from '@/components/home'
import { sanityFetch, urlFor } from '@/sanity/client'
import { featuredProjectQuery, featuredTestimonialQuery } from '@/sanity/queries'

// JSON-LD Schema for Homepage - Elite Version (Score: 9/10)
const professionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': 'https://obieo.com/#organization',
  name: 'Obieo',
  url: 'https://obieo.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://obieo.com/logo.png',
    width: 512,
    height: 512,
  },
  image: 'https://obieo.com/og-image.png',
  description: 'SEO and AI search optimization agency for home service businesses. Built by a contractor, for contractors. We help roofers, HVAC companies, plumbers, and electricians get found on Google and AI search engines like ChatGPT.',
  slogan: 'Get found on Google and AI search',
  foundingDate: '2024',
  founder: {
    '@type': 'Person',
    name: 'Hunter Lapeyre',
    jobTitle: 'Founder & SEO Strategist',
    description: 'Former contractor turned SEO specialist. Built Obieo after growing his family roofing business through search optimization.',
    sameAs: 'https://www.linkedin.com/in/hunterlapeyre',
  },
  areaServed: {
    '@type': 'Country',
    name: 'United States',
    sameAs: 'https://en.wikipedia.org/wiki/United_States',
  },
  // 15 knowsAbout entries for semantic authority
  knowsAbout: [
    {
      '@type': 'Thing',
      name: 'Search Engine Optimization',
      sameAs: 'https://en.wikipedia.org/wiki/Search_engine_optimization',
    },
    {
      '@type': 'Thing',
      name: 'Local Search',
      sameAs: 'https://en.wikipedia.org/wiki/Local_search_(Internet)',
    },
    {
      '@type': 'Thing',
      name: 'Google Business Profile',
      sameAs: 'https://en.wikipedia.org/wiki/Google_Business_Profile',
    },
    {
      '@type': 'Thing',
      name: 'Generative Engine Optimization',
    },
    {
      '@type': 'Thing',
      name: 'Answer Engine Optimization',
    },
    {
      '@type': 'Thing',
      name: 'Schema.org Markup',
      sameAs: 'https://schema.org',
    },
    {
      '@type': 'Thing',
      name: 'Content Marketing',
      sameAs: 'https://en.wikipedia.org/wiki/Content_marketing',
    },
    {
      '@type': 'Thing',
      name: 'Technical SEO',
    },
    {
      '@type': 'Thing',
      name: 'Home Services Marketing',
    },
    {
      '@type': 'Thing',
      name: 'Contractor Marketing',
    },
    {
      '@type': 'Thing',
      name: 'Roofing Industry',
      sameAs: 'https://en.wikipedia.org/wiki/Roofing',
    },
    {
      '@type': 'Thing',
      name: 'HVAC Industry',
      sameAs: 'https://en.wikipedia.org/wiki/Heating,_ventilation,_and_air_conditioning',
    },
    {
      '@type': 'Thing',
      name: 'Plumbing Industry',
      sameAs: 'https://en.wikipedia.org/wiki/Plumbing',
    },
    {
      '@type': 'Thing',
      name: 'AI Search Visibility',
    },
    {
      '@type': 'Thing',
      name: 'Citation Building',
    },
  ],
  // Detailed service catalog
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'SEO Services for Home Service Businesses',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Local Dominance Package',
          description: 'Complete local SEO including Google Business Profile optimization, citation building, review management, and local content strategy. Designed for contractors who want to dominate their service area.',
          serviceType: 'Local SEO',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'GEO Optimization',
          description: 'AI search visibility optimization for ChatGPT, Perplexity, Claude, and Google AI Overviews. Get cited when homeowners ask AI for contractor recommendations.',
          serviceType: 'AI Search Optimization',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'SEO Audit & Strategy',
          description: 'Comprehensive technical and on-page SEO audit with prioritized action plan. Identify exactly what is holding your website back from ranking.',
          serviceType: 'SEO Consulting',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Content Strategy',
          description: 'SEO-optimized content planning and creation for service pages, location pages, and blog posts that attract and convert homeowners.',
          serviceType: 'Content Marketing',
        },
      },
    ],
  },
  sameAs: [
    'https://www.linkedin.com/company/obieo',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    url: 'https://obieo.com/contact',
    availableLanguage: 'English',
  },
  // Industries served
  audience: {
    '@type': 'Audience',
    audienceType: 'Home Service Businesses',
    geographicArea: {
      '@type': 'Country',
      name: 'United States',
    },
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://obieo.com/#website',
  name: 'Obieo',
  url: 'https://obieo.com',
  description: 'SEO and AI search optimization for home service businesses',
  publisher: {
    '@id': 'https://obieo.com/#organization',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://obieo.com/blog?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

interface FeaturedProject {
  _id: string
  title: string
  slug: { current: string }
  client: string
  tagline: string
  heroImage: unknown
  metrics: { label: string; value: string; prefix?: string; suffix?: string }[]
}

interface FeaturedTestimonial {
  _id: string
  quote: string
  author: string
  role: string
  company: string
  image: unknown
  metric: string
}

export default async function Home() {
  // Fetch featured project and testimonial in parallel
  const [featuredProject, featuredTestimonial] = await Promise.all([
    sanityFetch<FeaturedProject | null>({ query: featuredProjectQuery, tags: ['project'], defaultValue: null }),
    sanityFetch<FeaturedTestimonial | null>({ query: featuredTestimonialQuery, tags: ['testimonial'], defaultValue: null }),
  ])

  // Transform metrics from Sanity (string values) to component format (number values)
  const transformedMetrics = featuredProject?.metrics?.map((m) => ({
    label: m.label,
    value: parseFloat(m.value) || 0,
    prefix: m.prefix,
    suffix: m.suffix,
  })) || []

  // Get image URL if available
  const projectImageUrl = featuredProject?.heroImage
    ? urlFor(featuredProject.heroImage).width(800).url()
    : undefined

  return (
    <>
      {/* JSON-LD Schema - Elite Version (Score: 9/10) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <Hero />

      {featuredProject ? (
        <FeaturedCaseStudy
          title={featuredProject.title}
          client={featuredProject.client}
          tagline={featuredProject.tagline}
          metrics={transformedMetrics}
          slug={featuredProject.slug.current}
          mockupImage={projectImageUrl}
        />
      ) : (
        <FeaturedCaseStudy
          title="Lapeyre Roofing"
          client="Lapeyre Roofing"
          tagline="From invisible online to dominating local search — in just the first month."
          metrics={[
            { label: 'Search Impressions', value: 66, prefix: '+', suffix: '%' },
            { label: 'Avg. Ranking Boost', value: 5, prefix: '+', suffix: ' spots' },
          ]}
          slug="lapeyre-roofing"
          mockupImage="/case-studies/lapeyre-roofing/mockup.svg"
          logo="/case-studies/lapeyre-roofing/logo.svg"
        />
      )}

      <ProblemSolution />

      <ServicesOverview />

      <QuizCTA />

      {featuredTestimonial ? (
        <Testimonial
          quote={featuredTestimonial.quote}
          author={featuredTestimonial.author}
          role={featuredTestimonial.role}
          company={featuredTestimonial.company}
          metric={featuredTestimonial.metric}
        />
      ) : (
        <Testimonial
          quote="Obieo transformed our online presence. We went from getting maybe one call a week from the website to multiple leads every day. The ROI has been incredible."
          author="Hunter Lapeyre"
          role="Owner"
          company="Lapeyre Roofing"
          metric="Increased leads by 147% in 6 months"
        />
      )}

      <ROICalculatorCTA />

      <FinalCTA />
    </>
  )
}
