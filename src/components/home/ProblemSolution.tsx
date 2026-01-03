'use client'

import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

const problems = [
  {
    title: 'Buried on Google',
    description: "You search for your services and find your competitors on page one. Meanwhile, you're nowhere. Those are your leads calling someone else.",
  },
  {
    title: 'Wasted ad spend',
    description: "You keep paying for ads because organic traffic doesn't exist. But the moment you stop paying, the leads stop too.",
  },
  {
    title: 'No local presence',
    description: "Customers in your service area don't know you exist. Your Google Business Profile is crickets. Reviews aren't coming in.",
  },
]

const solutions = [
  {
    title: 'Rank for what matters',
    description: "We target the exact searches your customers make—'emergency plumber near me,' 'roof repair [your city].' You show up when they're ready to call.",
  },
  {
    title: 'Build lasting traffic',
    description: "SEO compounds over time. Every month your rankings improve, leads increase, and you depend less on paid ads.",
  },
  {
    title: 'Own your local market',
    description: "Google Business optimization, local citations, review generation. We make you the obvious choice in your service area.",
  },
]

export function ProblemSolution() {
  return (
    <Section>
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Problems */}
          <FadeInSection staggerChildren={0.15}>
            <div className="space-y-8">
              <div>
                <p className="text-sm font-medium text-red-500 uppercase tracking-wider mb-2">
                  The Problem
                </p>
                <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]">
                  Sound familiar?
                </h2>
              </div>
              {problems.map((problem, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                      {problem.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {problem.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>

          {/* Solutions */}
          <FadeInSection staggerChildren={0.15} delay={0.2}>
            <div className="space-y-8">
              <div>
                <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider mb-2">
                  The Solution
                </p>
                <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]">
                  Here&apos;s how we fix it
                </h2>
              </div>
              {solutions.map((solution, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[var(--accent)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                      {solution.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {solution.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </Container>
    </Section>
  )
}
