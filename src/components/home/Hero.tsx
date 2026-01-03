'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TextReveal } from '@/components/animations'
import { Button } from '@/components/ui'

export function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-20 pb-16 bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl">
          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] leading-[1.1] mb-6">
            <TextReveal delay={0.2} stagger={0.03}>
              Websites that turn
            </TextReveal>
            <br />
            <span className="text-[var(--accent)]">
              <TextReveal delay={0.6} stagger={0.03}>
                clicks into customers.
              </TextReveal>
            </span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mb-10"
          >
            For home service businesses tired of agencies that overpromise and underdeliver.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/quiz">
              <Button size="lg" className="w-full sm:w-auto">
                Get Your Free Website Score
              </Button>
            </Link>
            <Link href="/work">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See Our Work
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-[var(--text-muted)]"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
