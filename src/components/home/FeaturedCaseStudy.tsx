'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection, Counter } from '@/components/animations'

interface Metric {
  label: string
  value: number
  prefix?: string
  suffix?: string
}

interface FeaturedCaseStudyProps {
  title: string
  client: string
  tagline: string
  metrics: Metric[]
  slug: string
  mockupImage?: string
  logo?: string
}

export function FeaturedCaseStudy({
  title,
  client,
  tagline,
  metrics,
  slug,
  mockupImage,
  logo,
}: FeaturedCaseStudyProps) {
  return (
    <Section variant="alternate">
      <Container>
        <FadeInSection>
          <div className="bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border)]">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Content */}
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
                <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider mb-3">
                  Featured Case Study
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                  {title}
                </h2>
                <p className="text-lg text-[var(--text-secondary)] mb-8">
                  {tagline}
                </p>

                {/* Metrics */}
                <div className="flex flex-wrap gap-8 mb-8">
                  {metrics.map((metric, i) => (
                    <div key={i}>
                      <p className="text-3xl md:text-4xl font-semibold text-[var(--accent)]">
                        <Counter
                          value={metric.value}
                          prefix={metric.prefix}
                          suffix={metric.suffix}
                        />
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>

                <Link href={`/work/${slug}`} className="inline-block">
                  <Button>View Case Study</Button>
                </Link>
              </div>

              {/* Mockup Image with Logo Overlay */}
              <div className="relative flex items-center justify-center p-8 md:p-12 lg:p-16 bg-gradient-to-br from-slate-100 to-slate-200 order-1 lg:order-2 overflow-visible">
                {mockupImage ? (
                  <div className="relative w-full max-w-md">
                    {/* Mockup */}
                    <Image
                      src={mockupImage}
                      alt={`${client} website mockup`}
                      width={500}
                      height={375}
                      className="w-full h-auto drop-shadow-2xl"
                      priority
                    />

                    {/* Floating Logo Badge */}
                    {logo && (
                      <motion.div
                        className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 z-10"
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                        viewport={{ once: true }}
                      >
                        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-5 border border-slate-100">
                          <div className="relative w-20 h-20 md:w-24 md:h-24">
                            <Image
                              src={logo}
                              alt={`${client} logo`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[4/3] w-full max-w-lg flex items-center justify-center bg-slate-200/50 rounded-xl">
                    <p className="text-[var(--text-muted)]">Project Image</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeInSection>
      </Container>
    </Section>
  )
}
