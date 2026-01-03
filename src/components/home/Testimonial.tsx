'use client'

import Image from 'next/image'
import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

interface TestimonialProps {
  quote: string
  author: string
  role?: string
  company?: string
  metric?: string
  image?: string
}

export function Testimonial({
  quote,
  author,
  role,
  company,
  metric,
  image,
}: TestimonialProps) {
  return (
    <Section variant="alternate">
      <Container size="md">
        <FadeInSection>
          <div className="text-center">
            {/* Quote mark */}
            <svg
              className="w-12 h-12 text-[var(--accent)]/20 mx-auto mb-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl lg:text-3xl text-[var(--text-primary)] font-medium leading-relaxed mb-8">
              &ldquo;{quote}&rdquo;
            </blockquote>

            {/* Metric highlight */}
            {metric && (
              <p className="text-lg text-[var(--accent)] font-semibold mb-6">
                {metric}
              </p>
            )}

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              {image ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image src={image} alt={author} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-[var(--accent)]">
                    {author.charAt(0)}
                  </span>
                </div>
              )}
              <div className="text-left">
                <p className="font-semibold text-[var(--text-primary)]">{author}</p>
                {(role || company) && (
                  <p className="text-sm text-[var(--text-secondary)]">
                    {role}{role && company && ', '}{company}
                  </p>
                )}
              </div>
            </div>
          </div>
        </FadeInSection>
      </Container>
    </Section>
  )
}
