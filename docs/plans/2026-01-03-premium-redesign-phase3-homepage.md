# Premium Redesign Phase 3: Homepage Rebuild

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the homepage with typography-focused hero, scroll-triggered animations, and restructured content flow per the design document.

**Architecture:** Create animated hero with GSAP SplitText, implement scroll-triggered reveals, restructure sections for hybrid "impressive + conversion" flow.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Framer Motion, GSAP (ScrollTrigger, SplitText)

**Depends on:** Phase 1 & 2 complete

---

## Task 1: Create GSAP Animation Hooks

**Files:**
- Create: `src/hooks/useGsap.ts`
- Create: `src/components/animations/TextReveal.tsx`

**Step 1: Create GSAP hook for scroll triggers**

Create `src/hooks/useGsap.ts`:
```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function useScrollTrigger() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    // Refresh ScrollTrigger when layout changes
    ScrollTrigger.refresh()

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return ref
}

export function useFadeInOnScroll(options?: {
  y?: number
  duration?: number
  delay?: number
  stagger?: number
}) {
  const ref = useRef<HTMLElement>(null)
  const { y = 30, duration = 0.8, delay = 0, stagger = 0.1 } = options || {}

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const children = element.children.length > 0 ? element.children : [element]

    gsap.set(children, { y, opacity: 0 })

    const animation = gsap.to(children, {
      y: 0,
      opacity: 1,
      duration,
      delay,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    return () => {
      animation.kill()
    }
  }, [y, duration, delay, stagger])

  return ref
}

export function useCountUp(endValue: number, options?: {
  duration?: number
  prefix?: string
  suffix?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const { duration = 2, prefix = '', suffix = '' } = options || {}

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      element.textContent = `${prefix}${endValue}${suffix}`
      return
    }

    const obj = { value: 0 }

    const animation = gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        element.textContent = `${prefix}${Math.round(obj.value)}${suffix}`
      },
    })

    return () => {
      animation.kill()
    }
  }, [endValue, duration, prefix, suffix])

  return ref
}
```

**Step 2: Create TextReveal component**

Create `src/components/animations/TextReveal.tsx`:
```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface TextRevealProps {
  children: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  delay?: number
  stagger?: number
  triggerOnScroll?: boolean
}

export function TextReveal({
  children,
  className = '',
  as: Component = 'span',
  delay = 0,
  stagger = 0.02,
  triggerOnScroll = false,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Split text into characters
    const text = children
    const chars = text.split('')

    // Clear container and add character spans
    container.innerHTML = ''
    chars.forEach((char) => {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? '\u00A0' : char
      span.style.display = 'inline-block'
      span.style.opacity = '0'
      span.style.transform = 'translateY(20px)'
      container.appendChild(span)
    })

    const charElements = container.querySelectorAll('span')

    const animationConfig = {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger,
      delay,
      ease: 'power3.out',
    }

    if (triggerOnScroll) {
      gsap.to(charElements, {
        ...animationConfig,
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    } else {
      gsap.to(charElements, animationConfig)
    }

    return () => {
      gsap.killTweensOf(charElements)
    }
  }, [children, delay, stagger, triggerOnScroll])

  return (
    <Component ref={containerRef as any} className={className}>
      {children}
    </Component>
  )
}
```

**Step 3: Create index export**

Create `src/components/animations/index.ts`:
```typescript
export { TextReveal } from './TextReveal'
```

**Step 4: Commit**

```bash
git add src/hooks/useGsap.ts src/components/animations/
git commit -m "feat: add GSAP hooks and TextReveal animation component"
```

---

## Task 2: Create Scroll-Triggered Section Wrapper

**Files:**
- Create: `src/components/animations/FadeInSection.tsx`
- Modify: `src/components/animations/index.ts`

**Step 1: Create FadeInSection component**

Create `src/components/animations/FadeInSection.tsx`:
```typescript
'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface FadeInSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  duration?: number
  staggerChildren?: number
}

export function FadeInSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 40,
  duration = 0.8,
  staggerChildren = 0,
}: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const getOffset = () => {
      switch (direction) {
        case 'up':
          return { x: 0, y: distance }
        case 'down':
          return { x: 0, y: -distance }
        case 'left':
          return { x: distance, y: 0 }
        case 'right':
          return { x: -distance, y: 0 }
        case 'none':
          return { x: 0, y: 0 }
      }
    }

    const { x, y } = getOffset()
    const targets = staggerChildren > 0 ? element.children : element

    gsap.set(targets, { opacity: 0, x, y })

    const animation = gsap.to(targets, {
      opacity: 1,
      x: 0,
      y: 0,
      duration,
      delay,
      stagger: staggerChildren,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    return () => {
      animation.kill()
    }
  }, [delay, direction, distance, duration, staggerChildren])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
```

**Step 2: Update exports**

Modify `src/components/animations/index.ts`:
```typescript
export { TextReveal } from './TextReveal'
export { FadeInSection } from './FadeInSection'
```

**Step 3: Commit**

```bash
git add src/components/animations/
git commit -m "feat: add FadeInSection scroll-triggered animation component"
```

---

## Task 3: Create Animated Counter Component

**Files:**
- Create: `src/components/animations/Counter.tsx`
- Modify: `src/components/animations/index.ts`

**Step 1: Create Counter component**

Create `src/components/animations/Counter.tsx`:
```typescript
'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface CounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function Counter({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  className = '',
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || hasAnimated.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => {
        if (hasAnimated.current) return
        hasAnimated.current = true

        const obj = { val: 0 }
        gsap.to(obj, {
          val: value,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            setDisplayValue(Math.round(obj.val))
          },
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}
```

**Step 2: Update exports**

Modify `src/components/animations/index.ts`:
```typescript
export { TextReveal } from './TextReveal'
export { FadeInSection } from './FadeInSection'
export { Counter } from './Counter'
```

**Step 3: Commit**

```bash
git add src/components/animations/
git commit -m "feat: add animated Counter component for metrics"
```

---

## Task 4: Create New Hero Section Component

**Files:**
- Create: `src/components/home/Hero.tsx`

**Step 1: Create Hero component**

Create `src/components/home/Hero.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TextReveal } from '@/components/animations'
import { Button } from '@/components/ui'
import { CalendlyButton } from '@/components/CalendlyButton'

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
                See Our Work →
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
```

**Step 2: Create components/home index**

Create `src/components/home/index.ts`:
```typescript
export { Hero } from './Hero'
```

**Step 3: Commit**

```bash
git add src/components/home/
git commit -m "feat: add animated Hero component with text reveal"
```

---

## Task 5: Create Featured Case Study Section

**Files:**
- Create: `src/components/home/FeaturedCaseStudy.tsx`
- Modify: `src/components/home/index.ts`

**Step 1: Create FeaturedCaseStudy component**

Create `src/components/home/FeaturedCaseStudy.tsx`:
```typescript
'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  image?: string
}

export function FeaturedCaseStudy({
  title,
  client,
  tagline,
  metrics,
  slug,
  image,
}: FeaturedCaseStudyProps) {
  return (
    <Section variant="alternate">
      <Container>
        <FadeInSection>
          <div className="bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border)]">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Content */}
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
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

              {/* Image */}
              <div className="relative aspect-square lg:aspect-auto bg-[var(--bg-secondary)]">
                {image ? (
                  <Image
                    src={image}
                    alt={`${title} project screenshot`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
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
```

**Step 2: Update exports**

Modify `src/components/home/index.ts`:
```typescript
export { Hero } from './Hero'
export { FeaturedCaseStudy } from './FeaturedCaseStudy'
```

**Step 3: Commit**

```bash
git add src/components/home/
git commit -m "feat: add FeaturedCaseStudy component with animated metrics"
```

---

## Task 6: Create Problem/Solution Section

**Files:**
- Create: `src/components/home/ProblemSolution.tsx`
- Modify: `src/components/home/index.ts`

**Step 1: Create ProblemSolution component**

Create `src/components/home/ProblemSolution.tsx`:
```typescript
'use client'

import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

const problems = [
  {
    title: 'Invisible online',
    description: "Your competitors show up on Google. You don't. Every day you're losing potential customers who can't find you.",
  },
  {
    title: 'Outdated website',
    description: "Your site looks like it was built in 2015. Visitors bounce before they see what you offer.",
  },
  {
    title: 'No leads',
    description: "You're paying for a website that doesn't generate business. It's a digital brochure, not a sales tool.",
  },
]

const solutions = [
  {
    title: 'Dominate local search',
    description: "We build sites optimized for the searches your customers are making. Show up where it matters.",
  },
  {
    title: 'Built to convert',
    description: "Every page designed to turn visitors into leads. Clear calls-to-action, trust signals, and mobile-first design.",
  },
  {
    title: 'Measurable results',
    description: "Track your leads, see your rankings improve. We focus on outcomes, not vanity metrics.",
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
                  Here's how we fix it
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
```

**Step 2: Update exports**

Modify `src/components/home/index.ts`:
```typescript
export { Hero } from './Hero'
export { FeaturedCaseStudy } from './FeaturedCaseStudy'
export { ProblemSolution } from './ProblemSolution'
```

**Step 3: Commit**

```bash
git add src/components/home/
git commit -m "feat: add ProblemSolution component with staggered animations"
```

---

## Task 7: Create Services Overview Section

**Files:**
- Create: `src/components/home/ServicesOverview.tsx`
- Modify: `src/components/home/index.ts`

**Step 1: Create ServicesOverview component**

Create `src/components/home/ServicesOverview.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { Section, Container, Card, CardContent, Button } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

const services = [
  {
    title: 'Fix & Foundation Sprint',
    price: '$2,500',
    priceNote: 'one-time',
    description: 'A complete website overhaul in 2 weeks. New design, SEO foundation, and conversion optimization.',
    highlights: [
      'Custom responsive design',
      'On-page SEO setup',
      'Mobile optimization',
      'Speed optimization',
    ],
    href: '/services#sprint',
    featured: false,
  },
  {
    title: 'Ongoing Growth Retainer',
    price: '$1,250',
    priceNote: '/month',
    description: 'Continuous improvement and growth. Monthly content, SEO, and conversion optimization.',
    highlights: [
      'Everything in Sprint',
      'Monthly content updates',
      'Ongoing SEO work',
      'Performance reports',
    ],
    href: '/services#retainer',
    featured: true,
  },
]

export function ServicesOverview() {
  return (
    <Section variant="alternate">
      <Container>
        <FadeInSection className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            Two ways to work with us
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Whether you need a one-time fix or ongoing growth, we have a solution that fits.
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, i) => (
            <FadeInSection key={i} delay={i * 0.1}>
              <Card
                variant={service.featured ? 'elevated' : 'bordered'}
                className={`h-full ${service.featured ? 'ring-2 ring-[var(--accent)]' : ''}`}
              >
                <CardContent className="p-8">
                  {service.featured && (
                    <p className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider mb-4">
                      Most Popular
                    </p>
                  )}
                  <h3 className="text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-2">
                    {service.title}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-semibold text-[var(--text-primary)]">
                      {service.price}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {service.priceNote}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] mb-6">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {service.highlights.map((highlight, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm">
                        <svg
                          className="w-5 h-5 text-[var(--accent)] flex-shrink-0"
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
                        <span className="text-[var(--text-primary)]">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={service.href}>
                    <Button
                      variant={service.featured ? 'primary' : 'outline'}
                      className="w-full"
                    >
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </FadeInSection>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

**Step 2: Update exports**

Modify `src/components/home/index.ts`:
```typescript
export { Hero } from './Hero'
export { FeaturedCaseStudy } from './FeaturedCaseStudy'
export { ProblemSolution } from './ProblemSolution'
export { ServicesOverview } from './ServicesOverview'
```

**Step 3: Commit**

```bash
git add src/components/home/
git commit -m "feat: add ServicesOverview component with pricing cards"
```

---

## Task 8: Create Quiz CTA Section

**Files:**
- Create: `src/components/home/QuizCTA.tsx`
- Modify: `src/components/home/index.ts`

**Step 1: Create QuizCTA component**

Create `src/components/home/QuizCTA.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

export function QuizCTA() {
  return (
    <Section>
      <Container size="md">
        <FadeInSection>
          <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] rounded-3xl p-8 md:p-12 lg:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-white mb-4">
              Not sure what you need?
            </h2>
            <p className="text-lg text-white/90 max-w-xl mx-auto mb-8">
              Take our free 2-minute assessment to get a personalized website score
              and see exactly what's holding your business back online.
            </p>
            <Link href="/quiz">
              <Button
                size="lg"
                className="bg-white text-[var(--accent)] hover:bg-white/90 hover:text-[var(--accent-hover)]"
              >
                Get Your Free Website Score
              </Button>
            </Link>
          </div>
        </FadeInSection>
      </Container>
    </Section>
  )
}
```

**Step 2: Update exports**

Modify `src/components/home/index.ts`:
```typescript
export { Hero } from './Hero'
export { FeaturedCaseStudy } from './FeaturedCaseStudy'
export { ProblemSolution } from './ProblemSolution'
export { ServicesOverview } from './ServicesOverview'
export { QuizCTA } from './QuizCTA'
```

**Step 3: Commit**

```bash
git add src/components/home/
git commit -m "feat: add QuizCTA component with gradient background"
```

---

## Task 9: Create Testimonial Section

**Files:**
- Create: `src/components/home/Testimonial.tsx`
- Modify: `src/components/home/index.ts`

**Step 1: Create Testimonial component**

Create `src/components/home/Testimonial.tsx`:
```typescript
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
              "{quote}"
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
```

**Step 2: Update exports**

Modify `src/components/home/index.ts`:
```typescript
export { Hero } from './Hero'
export { FeaturedCaseStudy } from './FeaturedCaseStudy'
export { ProblemSolution } from './ProblemSolution'
export { ServicesOverview } from './ServicesOverview'
export { QuizCTA } from './QuizCTA'
export { Testimonial } from './Testimonial'
```

**Step 3: Commit**

```bash
git add src/components/home/
git commit -m "feat: add Testimonial component with quote styling"
```

---

## Task 10: Create Final CTA Section

**Files:**
- Create: `src/components/home/FinalCTA.tsx`
- Modify: `src/components/home/index.ts`

**Step 1: Create FinalCTA component**

Create `src/components/home/FinalCTA.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection } from '@/components/animations'
import { CalendlyButton } from '@/components/CalendlyButton'

export function FinalCTA() {
  return (
    <Section size="lg">
      <Container className="text-center">
        <FadeInSection>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            Ready to stop losing leads?
          </h2>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Let's talk about how we can transform your online presence and start
            generating the leads your business deserves.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CalendlyButton className="px-8 py-4 bg-[var(--accent)] text-white text-lg font-semibold rounded-lg hover:bg-[var(--accent-hover)] hover:scale-[1.02] transition-all">
              Book a Free Call
            </CalendlyButton>
            <Link href="/quiz">
              <Button variant="outline" size="lg">
                Or take the quiz first
              </Button>
            </Link>
          </div>
        </FadeInSection>
      </Container>
    </Section>
  )
}
```

**Step 2: Update exports**

Modify `src/components/home/index.ts`:
```typescript
export { Hero } from './Hero'
export { FeaturedCaseStudy } from './FeaturedCaseStudy'
export { ProblemSolution } from './ProblemSolution'
export { ServicesOverview } from './ServicesOverview'
export { QuizCTA } from './QuizCTA'
export { Testimonial } from './Testimonial'
export { FinalCTA } from './FinalCTA'
```

**Step 3: Commit**

```bash
git add src/components/home/
git commit -m "feat: add FinalCTA component"
```

---

## Task 11: Rebuild Homepage with New Components

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Replace homepage content**

Modify `src/app/page.tsx`:
```typescript
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
          { label: 'Load Time', value: 1.1, suffix: 's' },
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
```

**Step 2: Test homepage**

Run:
```bash
npm run dev
```

Navigate to: http://localhost:3000

Verify:
- [ ] Hero animates on load (text reveals character by character)
- [ ] Scroll down triggers section animations
- [ ] Counter animates when visible
- [ ] All sections display correctly
- [ ] CTAs link to correct pages
- [ ] Dark mode toggle works throughout

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rebuild homepage with animated components"
```

---

## Task 12: Final Phase 3 Verification

**Step 1: Run build**

Run:
```bash
npm run build
```

Expected: Build completes without errors

**Step 2: Run lint**

Run:
```bash
npm run lint
```

Expected: No lint errors

**Step 3: Performance check**

Run dev server and check:
- [ ] Hero animation completes within 2 seconds
- [ ] No layout shift during animations
- [ ] Scroll is smooth
- [ ] No console errors

**Step 4: Commit completion**

```bash
git add -A
git commit -m "chore: phase 3 homepage rebuild complete"
```

---

## Phase 3 Complete

Homepage rebuilt with:
- ✅ GSAP hooks for scroll animations
- ✅ TextReveal component for hero headline
- ✅ FadeInSection for scroll-triggered content
- ✅ Counter component for animated metrics
- ✅ Hero with character-by-character text reveal
- ✅ Featured case study with animated metrics
- ✅ Problem/Solution side-by-side layout
- ✅ Services overview with pricing cards
- ✅ Quiz CTA with gradient background
- ✅ Testimonial section
- ✅ Final CTA

**Next:** Phase 4 - Custom Cursor (magnetic effects, view state, accessibility)
