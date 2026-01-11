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
