# Premium Redesign Phase 2: Core Layout & Navigation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the Header component with new navigation structure, add theme toggle to UI, and create reusable layout primitives.

**Architecture:** Update Header with Work link and theme toggle. Create Section and Container components for consistent layout. Add mobile menu improvements.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Framer Motion

**Depends on:** Phase 1 complete

---

## Task 1: Update Header Navigation Structure

**Files:**
- Modify: `src/components/Header.tsx`

**Step 1: Read current Header implementation**

Read: `src/components/Header.tsx`

Understand current structure before modifying.

**Step 2: Update Header with new nav items and theme toggle**

Modify `src/components/Header.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendlyButton } from './CalendlyButton'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { name: 'Work', href: '/work' },
  { name: 'Services', href: '/services' },
  { name: 'Industries', href: '/industries' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--bg-primary)]/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
          >
            Obieo
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
              >
                {item.name}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[var(--accent)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <CalendlyButton className="px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--accent-hover)] hover:scale-[1.02] transition-all">
              Book a Call
            </CalendlyButton>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-[var(--text-primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[var(--bg-primary)] border-t border-[var(--border)]"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4">
                <CalendlyButton className="w-full px-4 py-3 bg-[var(--accent)] text-white text-base font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-center">
                  Book a Call
                </CalendlyButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
```

**Step 3: Test navigation**

Run:
```bash
npm run dev
```

Test:
- [ ] Desktop nav shows Work, Services, Industries, About, Contact
- [ ] Theme toggle visible in header
- [ ] Mobile menu works with animations
- [ ] Header becomes solid on scroll

**Step 4: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: update header with work link, theme toggle, and scroll behavior"
```

---

## Task 2: Create Section Layout Component

**Files:**
- Create: `src/components/ui/Section.tsx`
- Modify: `src/components/ui/index.ts`

**Step 1: Create Section component**

Create `src/components/ui/Section.tsx`:
```typescript
import { HTMLAttributes, forwardRef } from 'react'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'alternate' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--bg-primary)]',
      alternate: 'bg-[var(--bg-secondary)]',
      dark: 'bg-[var(--text-primary)] text-[var(--bg-primary)]',
    }

    const sizes = {
      sm: 'py-16 md:py-20',
      md: 'py-20 md:py-28',
      lg: 'py-28 md:py-36',
    }

    return (
      <section
        ref={ref}
        className={`${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </section>
    )
  }
)

Section.displayName = 'Section'
```

**Step 2: Create Container component**

Create `src/components/ui/Container.tsx`:
```typescript
import { HTMLAttributes, forwardRef } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'lg', className = '', children, ...props }, ref) => {
    const sizes = {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
    }

    return (
      <div
        ref={ref}
        className={`${sizes[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'
```

**Step 3: Update index exports**

Modify `src/components/ui/index.ts`:
```typescript
export { Button } from './Button'
export { Card, CardHeader, CardContent, CardFooter } from './Card'
export { Input } from './Input'
export { Textarea } from './Textarea'
export { Section } from './Section'
export { Container } from './Container'
```

**Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add Section and Container layout components"
```

---

## Task 3: Create Work Page Placeholder

**Files:**
- Create: `src/app/work/page.tsx`

**Step 1: Create Work page**

Create `src/app/work/page.tsx`:
```typescript
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container, Button } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Our Work | Obieo',
  description: 'See how we help home service businesses grow with websites that convert.',
}

export default function WorkPage() {
  return (
    <>
      {/* Hero */}
      <Section size="lg" className="pt-32">
        <Container>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
            Our Work
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl">
            Results that speak for themselves. See how we've helped home service businesses
            grow with websites built to convert.
          </p>
        </Container>
      </Section>

      {/* Featured Project Placeholder */}
      <Section variant="alternate">
        <Container>
          <div className="bg-[var(--bg-card)] rounded-2xl p-8 md:p-12 border border-[var(--border)]">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-sm font-medium text-[var(--accent)] mb-2">
                  Featured Case Study
                </p>
                <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                  Lapeyre Roofing
                </h2>
                <p className="text-[var(--text-secondary)] mb-6">
                  From invisible online to the top roofer in Baton Rouge.
                  See how we transformed their digital presence.
                </p>
                <div className="flex gap-6 mb-8">
                  <div>
                    <p className="text-3xl font-semibold text-[var(--accent)]">+147%</p>
                    <p className="text-sm text-[var(--text-secondary)]">Organic Leads</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-[var(--accent)]">#1</p>
                    <p className="text-sm text-[var(--text-secondary)]">Google Ranking</p>
                  </div>
                </div>
                <Link href="/work/lapeyre-roofing">
                  <Button>View Case Study</Button>
                </Link>
              </div>
              <div className="aspect-video bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center">
                <p className="text-[var(--text-muted)]">Project Image</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* More Projects Placeholder */}
      <Section>
        <Container>
          <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8">
            More Projects
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center border border-[var(--border)]"
              >
                <p className="text-[var(--text-muted)]">Coming Soon</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section variant="alternate">
        <Container className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            Ready for results like these?
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Let's talk about how we can transform your online presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz">
              <Button size="lg">Get Your Free Website Score</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Book a Call</Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
```

**Step 2: Test page loads**

Run:
```bash
npm run dev
```

Navigate to: http://localhost:3000/work

Expected: Work page displays with placeholder content

**Step 3: Commit**

```bash
git add src/app/work/
git commit -m "feat: add work page placeholder"
```

---

## Task 4: Create Case Study Page Template

**Files:**
- Create: `src/app/work/[slug]/page.tsx`

**Step 1: Create dynamic case study page**

Create `src/app/work/[slug]/page.tsx`:
```typescript
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section, Container, Button } from '@/components/ui'

// Temporary static data until Sanity is connected
const projects: Record<string, {
  title: string
  client: string
  tagline: string
  metrics: { label: string; value: string; prefix?: string; suffix?: string }[]
  challenge: string
  approach: string
  results: string
}> = {
  'lapeyre-roofing': {
    title: 'Lapeyre Roofing',
    client: 'Lapeyre Roofing',
    tagline: 'From invisible online to the top roofer in Baton Rouge.',
    metrics: [
      { label: 'Organic Leads', value: '147', prefix: '+', suffix: '%' },
      { label: 'Google Ranking', value: '1', prefix: '#' },
      { label: 'Load Time', value: '1.1', suffix: 's' },
    ],
    challenge: `Lapeyre Roofing had been serving the Baton Rouge area for years, but their online presence didn't reflect the quality of their work. Their outdated website was slow, not mobile-friendly, and invisible on Google. They were losing potential customers to competitors with better digital presence.`,
    approach: `We started with a complete audit of their competitive landscape and identified key opportunities. Then we designed and built a new website focused on conversion: clear calls-to-action, trust signals, and local SEO optimization. Every page was crafted to turn visitors into leads.`,
    results: `Within 6 months, Lapeyre Roofing went from page 3 to #1 on Google for their key local search terms. Organic leads increased by 147%, and the new site loads in under 1.2 seconds. Most importantly, they're now booking more quality jobs than ever.`,
  },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = projects[slug]

  if (!project) {
    return { title: 'Project Not Found | Obieo' }
  }

  return {
    title: `${project.title} | Our Work | Obieo`,
    description: project.tagline,
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const project = projects[slug]

  if (!project) {
    notFound()
  }

  return (
    <>
      {/* Hero */}
      <Section size="lg" className="pt-32">
        <Container>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Work
          </Link>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            {project.title}
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 max-w-3xl">
            {project.tagline}
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl">
            {project.metrics.map((metric, i) => (
              <div key={i} className="text-center md:text-left">
                <p className="text-3xl md:text-4xl font-semibold text-[var(--accent)]">
                  {metric.prefix}{metric.value}{metric.suffix}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Hero Image Placeholder */}
      <Section size="sm" className="py-0">
        <Container size="xl">
          <div className="aspect-video bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border)]">
            <p className="text-[var(--text-muted)]">Hero Image</p>
          </div>
        </Container>
      </Section>

      {/* The Challenge */}
      <Section>
        <Container size="md">
          <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
            The Challenge
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            {project.challenge}
          </p>
        </Container>
      </Section>

      {/* Before Image Placeholder */}
      <Section size="sm" variant="alternate" className="py-12">
        <Container>
          <div className="aspect-video bg-[var(--bg-card)] rounded-xl flex items-center justify-center border border-[var(--border)]">
            <p className="text-[var(--text-muted)]">Before Screenshot</p>
          </div>
        </Container>
      </Section>

      {/* The Approach */}
      <Section>
        <Container size="md">
          <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
            The Approach
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            {project.approach}
          </p>
        </Container>
      </Section>

      {/* The Results */}
      <Section variant="alternate">
        <Container size="md">
          <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
            The Results
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            {project.results}
          </p>
        </Container>
      </Section>

      {/* After Image Placeholder */}
      <Section size="sm" className="py-12">
        <Container size="xl">
          <div className="aspect-video bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border)]">
            <p className="text-[var(--text-muted)]">After Screenshot / Final Design</p>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section variant="alternate">
        <Container className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            Ready to get results like this?
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Let's talk about transforming your online presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz">
              <Button size="lg">Get Your Free Website Score</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Book a Call</Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
```

**Step 2: Test case study page**

Navigate to: http://localhost:3000/work/lapeyre-roofing

Expected: Case study page displays with placeholder content

**Step 3: Test 404 for unknown slug**

Navigate to: http://localhost:3000/work/unknown-project

Expected: 404 page

**Step 4: Commit**

```bash
git add src/app/work/
git commit -m "feat: add case study page template with lapeyre-roofing placeholder"
```

---

## Task 5: Update Footer with Theme-Aware Styles

**Files:**
- Modify: `src/components/Footer.tsx`

**Step 1: Read current Footer**

Read: `src/components/Footer.tsx`

**Step 2: Update Footer with CSS variables**

Modify `src/components/Footer.tsx`:
```typescript
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]"
            >
              Obieo
            </Link>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Websites that turn clicks into customers for home service businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Work', href: '/work' },
                { name: 'Services', href: '/services' },
                { name: 'Industries', href: '/industries' },
                { name: 'About', href: '/about' },
                { name: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services#sprint"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  Fix & Foundation Sprint
                </Link>
              </li>
              <li>
                <Link
                  href="/services#retainer"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  Ongoing Growth Retainer
                </Link>
              </li>
              <li>
                <Link
                  href="/quiz"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  Free Website Score
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hunter@obieo.com"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  hunter@obieo.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+15551234567"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  (555) 123-4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)] text-center">
            &copy; {new Date().getFullYear()} Obieo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

**Step 3: Verify footer in both themes**

Test: Toggle dark mode, verify footer looks correct

**Step 4: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: update footer with theme-aware styles and work link"
```

---

## Task 6: Add Spacer for Fixed Header

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Update layout to account for fixed header**

The header is now fixed, so we need to ensure content doesn't hide under it. Update `src/app/layout.tsx` to add top padding to main:

```typescript
import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Obieo | Websites for Home Service Businesses",
  description:
    "We build websites that turn clicks into customers for home service businesses. SEO-optimized, conversion-focused websites that generate leads.",
  keywords: [
    "home service website",
    "contractor website",
    "roofing website",
    "HVAC website",
    "plumbing website",
    "local SEO",
  ],
  authors: [{ name: "Obieo" }],
  openGraph: {
    title: "Obieo | Websites for Home Service Businesses",
    description:
      "We build websites that turn clicks into customers for home service businesses.",
    url: "https://obieo.com",
    siteName: "Obieo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Obieo | Websites for Home Service Businesses",
    description:
      "We build websites that turn clicks into customers for home service businesses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      </head>
      <body
        className={`${dmSans.variable} ${outfit.variable} antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]`}
      >
        <ThemeProvider>
          <SmoothScroll>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Note: Individual pages handle their own top padding (pt-32) to account for the fixed header.

**Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: update layout with theme-aware body styles"
```

---

## Task 7: Final Phase 2 Verification

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

**Step 3: Manual testing checklist**

Run:
```bash
npm run dev
```

Test:
- [ ] Header shows Work in navigation
- [ ] Theme toggle works (light/dark)
- [ ] Theme persists on refresh
- [ ] Mobile menu opens/closes with animation
- [ ] Header becomes solid on scroll
- [ ] Work page loads at /work
- [ ] Case study page loads at /work/lapeyre-roofing
- [ ] Unknown project shows 404
- [ ] Footer links work
- [ ] Page transitions animate between routes

**Step 4: Commit completion**

```bash
git add -A
git commit -m "chore: phase 2 layout and navigation complete"
```

---

## Phase 2 Complete

Layout and navigation updated:
- ✅ Header with Work link and theme toggle
- ✅ Fixed header with scroll behavior
- ✅ Mobile menu with Framer Motion animations
- ✅ Section and Container layout components
- ✅ Work page placeholder
- ✅ Case study page template
- ✅ Footer with theme-aware styles

**Next:** Phase 3 - Homepage Rebuild (hero with animations, scroll effects, restructured content)
