import { groq } from 'next-sanity'

// Site Settings
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    siteName,
    siteDescription,
    contactEmail,
    contactPhone,
    calendlyUrl,
    socialLinks
  }
`

// Projects
export const projectsQuery = groq`
  *[_type == "project"] | order(order asc) {
    _id,
    title,
    slug,
    client,
    tagline,
    excerpt,
    thumbnail,
    metrics,
    featured
  }
`

export const featuredProjectQuery = groq`
  *[_type == "project" && featured == true][0] {
    _id,
    title,
    slug,
    client,
    tagline,
    excerpt,
    heroImage,
    metrics
  }
`

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    client,
    tagline,
    heroImage,
    metrics,
    challenge,
    challengeImage,
    approach,
    approachImages,
    results,
    resultsImage
  }
`

// Testimonials
export const testimonialsQuery = groq`
  *[_type == "testimonial"] | order(featured desc) {
    _id,
    quote,
    author,
    role,
    company,
    image,
    metric,
    featured
  }
`

export const featuredTestimonialQuery = groq`
  *[_type == "testimonial" && featured == true][0] {
    _id,
    quote,
    author,
    role,
    company,
    image,
    metric
  }
`

// Services
export const servicesQuery = groq`
  *[_type == "service"] | order(order asc) {
    _id,
    title,
    slug,
    subtitle,
    description,
    price,
    priceNote,
    inclusions,
    idealFor,
    ctaText
  }
`

// FAQs
export const faqsQuery = groq`
  *[_type == "faq"] | order(order asc) {
    _id,
    question,
    answer,
    category
  }
`

export const faqsByCategoryQuery = groq`
  *[_type == "faq" && category == $category] | order(order asc) {
    _id,
    question,
    answer
  }
`
