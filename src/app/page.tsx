import {
  Hero,
  FeaturedCaseStudy,
  ProblemSolution,
  ServicesOverview,
  QuizCTA,
  Testimonial,
  FinalCTA,
} from '@/components/home'

export default function Home() {
  return (
    <>
      <Hero />

      <FeaturedCaseStudy
        title="Lapeyre Roofing"
        client="Lapeyre Roofing"
        tagline="From invisible online to the top roofer in Baton Rouge."
        metrics={[
          { label: 'Organic Leads', value: 147, prefix: '+', suffix: '%' },
          { label: 'Google Ranking', value: 1, prefix: '#' },
          { label: 'Load Time', value: 1, suffix: 's' },
        ]}
        slug="lapeyre-roofing"
      />

      <ProblemSolution />

      <ServicesOverview />

      <QuizCTA />

      <Testimonial
        quote="Obieo transformed our online presence. We went from getting maybe one call a week from the website to multiple leads every day. The ROI has been incredible."
        author="Hunter Lapeyre"
        role="Owner"
        company="Lapeyre Roofing"
        metric="Increased leads by 147% in 6 months"
      />

      <FinalCTA />
    </>
  )
}
