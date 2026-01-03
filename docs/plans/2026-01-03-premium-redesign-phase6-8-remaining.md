# Premium Redesign Phases 6-8: Remaining Work

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

# Phase 6: Connect Work/Portfolio to Sanity

**Goal:** Connect Work page and Case Study pages to Sanity CMS for dynamic content.

---

## Task 1: Update Work Page to Fetch from Sanity

**Files:**
- Modify: `src/app/work/page.tsx`

**Step 1: Add Sanity fetching**

```typescript
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection, Counter } from '@/components/animations'
import { sanityFetch, urlFor } from '@/sanity/client'
import { projectsQuery, featuredProjectQuery } from '@/sanity/queries'

export const metadata: Metadata = {
  title: 'Our Work | Obieo',
  description: 'See how we help home service businesses grow with websites that convert.',
}

interface Project {
  _id: string
  title: string
  slug: { current: string }
  client: string
  tagline: string
  excerpt: string
  thumbnail: any
  heroImage: any
  metrics: { label: string; value: string; prefix?: string; suffix?: string }[]
  featured: boolean
}

export default async function WorkPage() {
  const [featuredProject, projects] = await Promise.all([
    sanityFetch<Project | null>({ query: featuredProjectQuery, tags: ['project'] }),
    sanityFetch<Project[]>({ query: projectsQuery, tags: ['project'] }),
  ])

  const otherProjects = projects.filter((p) => !p.featured)

  return (
    <>
      {/* Hero */}
      <Section size="lg" className="pt-32">
        <Container>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
            Our Work
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl">
            Results that speak for themselves.
          </p>
        </Container>
      </Section>

      {/* Featured Project */}
      {featuredProject && (
        <Section variant="alternate">
          <Container>
            <FadeInSection>
              <Link href={`/work/${featuredProject.slug.current}`}>
                <div className="bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border)] hover:shadow-xl transition-shadow" data-cursor="view">
                  <div className="grid lg:grid-cols-2 gap-0">
                    <div className="p-8 md:p-12 lg:p-16">
                      <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider mb-3">
                        Featured Case Study
                      </p>
                      <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                        {featuredProject.title}
                      </h2>
                      <p className="text-lg text-[var(--text-secondary)] mb-8">
                        {featuredProject.tagline}
                      </p>
                      <div className="flex flex-wrap gap-8 mb-8">
                        {featuredProject.metrics?.map((metric, i) => (
                          <div key={i}>
                            <p className="text-3xl font-semibold text-[var(--accent)]">
                              {metric.prefix}{metric.value}{metric.suffix}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
                          </div>
                        ))}
                      </div>
                      <Button>View Case Study</Button>
                    </div>
                    <div className="relative aspect-square lg:aspect-auto bg-[var(--bg-secondary)]">
                      {featuredProject.heroImage && (
                        <Image
                          src={urlFor(featuredProject.heroImage).width(800).url()}
                          alt={featuredProject.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </FadeInSection>
          </Container>
        </Section>
      )}

      {/* Other Projects Grid */}
      {otherProjects.length > 0 && (
        <Section>
          <Container>
            <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8">
              More Projects
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherProjects.map((project) => (
                <FadeInSection key={project._id}>
                  <Link href={`/work/${project.slug.current}`}>
                    <div className="group" data-cursor="view">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg-secondary)] mb-4">
                        {project.thumbnail && (
                          <Image
                            src={urlFor(project.thumbnail).width(600).url()}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{project.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{project.tagline}</p>
                    </div>
                  </Link>
                </FadeInSection>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/work/page.tsx
git commit -m "feat: connect work page to sanity cms"
```

---

## Task 2: Update Case Study Page to Fetch from Sanity

**Files:**
- Modify: `src/app/work/[slug]/page.tsx`

Update to fetch project by slug from Sanity, render rich text blocks using @portabletext/react.

**Install portable text renderer:**
```bash
npm install @portabletext/react
```

**Step 2: Update case study page**

```typescript
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection, Counter } from '@/components/animations'
import { sanityFetch, urlFor } from '@/sanity/client'
import { projectBySlugQuery, projectsQuery } from '@/sanity/queries'

interface Project {
  _id: string
  title: string
  slug: { current: string }
  client: string
  tagline: string
  heroImage: any
  metrics: { label: string; value: string; prefix?: string; suffix?: string }[]
  challenge: any[]
  challengeImage: any
  approach: any[]
  approachImages: any[]
  results: any[]
  resultsImage: any
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const projects = await sanityFetch<{ slug: { current: string } }[]>({
    query: projectsQuery,
  })
  return projects.map((project) => ({ slug: project.slug.current }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await sanityFetch<Project | null>({
    query: projectBySlugQuery,
    params: { slug },
  })

  if (!project) return { title: 'Project Not Found | Obieo' }

  return {
    title: `${project.title} | Our Work | Obieo`,
    description: project.tagline,
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const project = await sanityFetch<Project | null>({
    query: projectBySlugQuery,
    params: { slug },
    tags: ['project'],
  })

  if (!project) notFound()

  return (
    <>
      {/* Hero */}
      <Section size="lg" className="pt-32">
        <Container>
          <Link href="/work" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8">
            ← Back to Work
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            {project.title}
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 max-w-3xl">
            {project.tagline}
          </p>
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl">
            {project.metrics?.map((metric, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="text-center md:text-left">
                  <p className="text-3xl md:text-4xl font-semibold text-[var(--accent)]">
                    <Counter value={parseFloat(metric.value)} prefix={metric.prefix} suffix={metric.suffix} />
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </Container>
      </Section>

      {/* Hero Image */}
      {project.heroImage && (
        <Section size="sm" className="py-0">
          <Container size="xl">
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <Image
                src={urlFor(project.heroImage).width(1400).url()}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Container>
        </Section>
      )}

      {/* Challenge */}
      {project.challenge && (
        <Section>
          <Container size="md">
            <FadeInSection>
              <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                The Challenge
              </h2>
              <div className="prose prose-lg text-[var(--text-secondary)]">
                <PortableText value={project.challenge} />
              </div>
            </FadeInSection>
          </Container>
        </Section>
      )}

      {/* Approach */}
      {project.approach && (
        <Section variant="alternate">
          <Container size="md">
            <FadeInSection>
              <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                The Approach
              </h2>
              <div className="prose prose-lg text-[var(--text-secondary)]">
                <PortableText value={project.approach} />
              </div>
            </FadeInSection>
          </Container>
        </Section>
      )}

      {/* Results */}
      {project.results && (
        <Section>
          <Container size="md">
            <FadeInSection>
              <h2 className="text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
                The Results
              </h2>
              <div className="prose prose-lg text-[var(--text-secondary)]">
                <PortableText value={project.results} />
              </div>
            </FadeInSection>
          </Container>
        </Section>
      )}

      {/* CTA */}
      <Section variant="alternate">
        <Container className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            Ready to get results like this?
          </h2>
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

**Step 3: Commit**

```bash
git add src/app/work/
git commit -m "feat: connect case study pages to sanity with portable text"
```

---

## Task 3: Update Homepage Featured Case Study

**Files:**
- Modify: `src/app/page.tsx`

Fetch featured project from Sanity instead of hardcoded data.

**Commit:**
```bash
git commit -m "feat: fetch homepage featured project from sanity"
```

---

# Phase 7: Refactor Remaining Pages

**Goal:** Update Services, About, Contact, Industries pages to use new components and connect to Sanity where appropriate.

---

## Task 1: Refactor Services Page

- Use Section, Container, Card components
- Add FadeInSection animations
- Connect services and FAQs to Sanity
- Keep Sprint/Retainer structure

## Task 2: Refactor About Page

- Add your photo and story
- Use layout components
- Add animations
- Connect team/about content to Sanity (optional)

## Task 3: Refactor Contact Page

- Improve Calendly embed styling
- Add contact form submission to Sanity leads
- Use new form components

## Task 4: Refactor Industries Page

- Use new Card components
- Add hover animations
- Connect industries to Sanity (optional)

**Commits for each:**
```bash
git commit -m "feat: refactor services page with new components"
git commit -m "feat: refactor about page with animations"
git commit -m "feat: refactor contact page with improved form"
git commit -m "feat: refactor industries page with card animations"
```

---

# Phase 8: Polish & Optimization

**Goal:** Performance optimization, accessibility audit, final polish.

---

## Task 1: Performance Optimization

**Step 1: Image optimization**
- Ensure all images use next/image with proper sizing
- Add blur placeholders
- Use AVIF/WebP formats

**Step 2: Code splitting**
- Dynamic import for GSAP (only load when needed)
- Lazy load below-fold sections

**Step 3: Core Web Vitals check**
```bash
npx lighthouse http://localhost:3000 --view
```

Target:
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

## Task 2: Accessibility Audit

**Step 1: Keyboard navigation**
- Ensure all interactive elements are focusable
- Focus states visible
- Skip links work

**Step 2: Screen reader testing**
- Proper heading hierarchy
- Alt text on images
- Form labels

**Step 3: Reduced motion**
- Verify all animations respect prefers-reduced-motion

## Task 3: Cross-Browser Testing

Test on:
- Chrome
- Firefox
- Safari
- Mobile Safari
- Mobile Chrome

## Task 4: Final Content Population

**Step 1: Sanity Studio content entry**
- Add Lapeyre Roofing case study with real content
- Add services content
- Add FAQs
- Add testimonials
- Configure site settings

**Step 2: Real images**
- Add project screenshots
- Add before/after images
- Add testimonial photos

## Task 5: Pre-Launch Checklist

- [ ] All pages load without errors
- [ ] Dark mode works throughout
- [ ] Quiz funnel captures leads
- [ ] Calendly integration works
- [ ] Mobile experience is smooth
- [ ] Animations perform well
- [ ] SEO meta tags present
- [ ] Favicon and og:image set
- [ ] Analytics connected (if applicable)
- [ ] Error pages work (404, 500)

**Final Commit:**
```bash
git add -A
git commit -m "chore: polish and optimization complete"
```

---

# All Phases Complete

## Summary

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Foundation | Dependencies, Sanity, theming, base components |
| 2 | Layout | Header, navigation, Work page structure |
| 3 | Homepage | Hero animations, section components, new flow |
| 4 | Cursor | Custom cursor, magnetic buttons, view states |
| 5 | Quiz | Assessment funnel, scoring, lead capture |
| 6 | Portfolio | Sanity-powered Work and Case Study pages |
| 7 | Pages | Refactored Services, About, Contact, Industries |
| 8 | Polish | Performance, accessibility, final content |

## Recommended Execution Order

1. Phase 1-2 together (foundation + layout)
2. Phase 3 (homepage - most visible impact)
3. Phase 5 (quiz - key conversion feature)
4. Phase 4 (cursor - differentiator)
5. Phase 6-7 (remaining pages)
6. Phase 8 (polish before launch)

Total estimated tasks: ~50 bite-sized steps
