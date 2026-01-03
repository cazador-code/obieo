# Obieo Premium Redesign - Design Document

**Date:** 2026-01-03
**Status:** Approved
**Goal:** Transform Obieo into a premium, conversion-optimized site that demonstrates design capability

---

## Goals

1. **Demonstrate design capability** — Site serves as portfolio piece
2. **Improve conversions** — Better lead generation
3. **Modernize the feel** — Premium, current aesthetic
4. **All equally important** — No compromises

## Constraints

- No hard deadline, quality over speed
- Full tech stack implementation
- Light mode default with dark mode toggle
- Lapeyre Roofing as flagship case study

---

## Technical Architecture

### Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 16 (App Router) | Keep current, SSR/SSG, excellent SEO |
| Styling | Tailwind CSS v4 + CSS Variables | Keep current, utility-first, theming |
| Animations | Framer Motion + GSAP | Declarative UI + powerful timelines |
| Smooth Scroll | Lenis | Lightweight, ScrollTrigger compatible |
| CMS | Sanity v3 | Real-time preview, generous free tier |
| Deployment | Vercel | Native Next.js optimization |

### New Dependencies

```
framer-motion
gsap (with ScrollTrigger, SplitText)
lenis
next-sanity
@sanity/image-url
@sanity/client
```

### Project Structure Additions

```
/src
  /components
    /ui          # Buttons, inputs, cards
    /animations  # Cursor, transitions, reveals
    /quiz        # Assessment funnel components
  /sanity
    /schemas     # Content types
    /lib         # Client, queries
/sanity          # Sanity Studio
```

### Sanity Schemas

- `project` — Case studies with problem/approach/results
- `testimonial` — Quote, name, company, metrics
- `service` — Title, description, price, inclusions
- `faq` — Question, answer, category
- `page` — Flexible page builder
- `siteSettings` — Global content, contact info, social links
- `lead` — Quiz submissions and contact form entries

---

## Visual Design System

### Color Palette (Light Mode — Default)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#fdfcfa` | Page backgrounds |
| `--bg-secondary` | `#f5f2ed` | Alternate sections |
| `--bg-card` | `#ffffff` | Elevated cards |
| `--text-primary` | `#1a1612` | Headlines, body |
| `--text-secondary` | `#5c5549` | Muted text |
| `--accent` | `#d97650` | CTAs, links, highlights |
| `--accent-hover` | `#c4613c` | Hover states |
| `--border` | `#e8e4dc` | Subtle dividers |

### Color Palette (Dark Mode)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0f0d0b` | Deep warm black |
| `--bg-secondary` | `#1a1714` | Alternate sections |
| `--bg-card` | `#242019` | Elevated cards |
| `--text-primary` | `#f5f2ed` | Headlines, body |
| `--text-secondary` | `#a39e94` | Muted text |
| `--accent` | `#e8916b` | Lighter terracotta for contrast |
| `--accent-hover` | `#f2b094` | Hover states |
| `--border` | `#2d2922` | Subtle dividers |

### Typography

| Element | Font | Size (Desktop) | Weight |
|---------|------|----------------|--------|
| Hero headline | Outfit | 72-96px | 600 |
| Section headlines | Outfit | 48-56px | 600 |
| Subheadlines | Outfit | 24-32px | 500 |
| Body | DM Sans | 18px | 400 |
| Small/labels | DM Sans | 14px | 500 |
| Buttons | DM Sans | 16px | 600 |

### Spacing & Layout

- **Base unit:** 4px
- **Section padding:** 120-160px vertical
- **Content max-width:** 1152px
- **Border radius:** 8px (buttons), 16px (cards), 24px (large containers)

---

## Homepage Structure

### Flow

1. **Hero** — Typography-focused with subtle cursor interaction
   - Headline: "Websites that turn clicks into customers."
   - Subhead: "For home service businesses tired of agencies that overpromise and underdeliver."
   - CTAs: "Get Your Free Website Score" (primary) + "See Our Work →" (secondary)
   - GSAP SplitText character reveal animation

2. **Credibility Strip** — Metrics or client logos

3. **Featured Case Study** — Lapeyre Roofing mini-feature with key metrics

4. **Problem → Solution** — Condensed: 3 pain points → 3 differentiators

5. **Services Overview** — Sprint + Retainer cards with pricing

6. **Quiz CTA** — "Not sure what you need?"

7. **Testimonial** — Single powerful quote with metrics

8. **Final CTA** — "Ready to stop losing leads?" + Book a Call

---

## Navigation

**Items:** Work | Services | Industries | About | Contact | [Book a Call]

- Sticky header, transparent → solid on scroll
- Desktop: Visible horizontal nav
- Mobile: Hamburger with full-screen overlay
- Dark mode toggle in header or footer

---

## Work/Portfolio

### Work Page (`/work`)

- Featured project (Lapeyre) gets hero treatment
- Grid below for future projects
- Custom cursor shows "View" on hover
- Cards have lift + shadow on hover

### Case Study Template

1. Hero with title, tagline, key metrics (animated count-up)
2. The Challenge — Problem description with before screenshot
3. The Approach — Strategy, process, key decisions
4. The Results — After screenshot, detailed metrics, testimonial
5. CTA — Quiz or Book a Call

### Sanity Schema for Projects

```typescript
{
  title: string
  slug: string
  client: string
  heroImage: image
  thumbnail: image
  tagline: string
  excerpt: string
  metrics: [{ label, value, prefix?, suffix? }]
  challenge: richText
  challengeImage?: image
  approach: richText
  approachImages?: image[]
  results: richText
  resultsImage: image
  testimonial?: reference
  featured: boolean
}
```

---

## Assessment Quiz Funnel

### Entry Points

- Hero CTA: "Get Your Free Website Score"
- Homepage section: "Not sure what you need?"
- Dedicated page: `/quiz`

### Quiz Steps (5)

1. **Industry** — What type of home service business?
2. **Current Website** — Do you have one? What state?
3. **Lead Situation** — How are you getting leads now?
4. **Main Frustration** — Biggest pain point?
5. **Goals** — What does success look like?

### Results Page

- Animated score (0-100) with category label
- Personalized insights based on answers
- Lead capture form for full audit:
  - Name, Email, Website URL
- Alternative CTA: Skip audit, Book a Call

### Technical Implementation

- Client-side state (React useState)
- Framer Motion step transitions
- Weighted scoring algorithm
- Form → Sanity (lead record) + email notification

---

## Micro-Interactions & Animations

### Custom Cursor

| Context | Behavior |
|---------|----------|
| Default | 8px dot + 32px ring, follows with delay |
| Buttons | Scale to 48px, magnetic pull |
| Portfolio cards | Circle with "View" text |
| Links | Grows, changes to accent color |
| Click | Quick scale down/up |
| Mobile/reduced-motion | Disabled |

### Page Transitions (Framer Motion)

- Exit: Fade + slide up (200ms)
- Enter: Fade in + slide up (300ms)
- Shared layout for nav elements

### Scroll Animations (GSAP ScrollTrigger)

| Element | Animation |
|---------|-----------|
| Headings | Fade up + SplitText reveal |
| Paragraphs | Fade up, staggered |
| Cards | Fade up, stagger 100ms |
| Stats | Count up from 0 |
| Images | Subtle parallax |

### Hover Effects

| Element | Effect |
|---------|--------|
| Primary buttons | Color shift, scale 1.02, magnetic |
| Secondary buttons | Border + text transition |
| Cards | Lift -8px, shadow increase |
| Nav links | Underline slides from left |

### Lenis Smooth Scroll

- Duration: 1.2s lerp
- Disabled on mobile
- Synced with ScrollTrigger

---

## Other Pages

### Services (`/services`)

- Hero: "Two ways to work with us."
- Sprint + Retainer cards with full details
- Comparison helper
- Service-specific FAQ
- Quiz or Call CTA

### About (`/about`)

- Your story and home service background
- Photo of you
- Differentiators with icons
- CTA to Work or Contact

### Contact (`/contact`)

- Calendly embed + direct contact
- "What to expect" section
- Optional FAQ

### Industries (`/industries`)

- Grid of 10 industries
- Each links to services or filtered work
- "Don't see yours?" CTA

### Quiz (`/quiz`)

- Full-page experience
- Minimal nav (logo + close)
- Prominent progress bar

---

## Mobile Considerations

- Custom cursor: Disabled
- Lenis: Disabled (native scroll)
- Animations: Reduced complexity, faster
- Touch targets: Minimum 44x44px
- Hero headline: 40-48px
- Nav: Hamburger → full-screen overlay
- Optional: Sticky bottom CTA bar

---

## Performance Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |

### Optimization Strategy

- next/image with AVIF/WebP, priority for hero
- next/font for zero layout shift
- Lazy load below-fold content
- Code split heavy animation libraries
- Blur placeholders for images

---

## Implementation Phases

### Phase 1: Foundation

- [ ] Install new dependencies (Framer Motion, GSAP, Lenis, Sanity)
- [ ] Set up Sanity project and schemas
- [ ] Implement CSS variable theming system
- [ ] Add dark mode toggle with persistence
- [ ] Create base UI components (Button, Card, Input)

### Phase 2: Core Layout & Navigation

- [ ] Refactor Header with new nav structure (add Work)
- [ ] Implement Lenis smooth scroll
- [ ] Add page transition wrapper
- [ ] Create responsive layout primitives

### Phase 3: Homepage Rebuild

- [ ] Build new hero with text animations
- [ ] Implement scroll-triggered section reveals
- [ ] Create featured case study component
- [ ] Condense problem/solution section
- [ ] Add services overview cards
- [ ] Build testimonial component
- [ ] Add final CTA section

### Phase 4: Custom Cursor

- [ ] Build cursor component with states
- [ ] Add magnetic button effect
- [ ] Implement "View" state for portfolio
- [ ] Add reduced-motion and mobile detection

### Phase 5: Quiz Funnel

- [ ] Build quiz container and step components
- [ ] Implement step transitions
- [ ] Create scoring algorithm
- [ ] Build results page with animations
- [ ] Add lead capture form
- [ ] Connect to Sanity for lead storage

### Phase 6: Work/Portfolio

- [ ] Build Work page with project grid
- [ ] Create case study template page
- [ ] Add Lapeyre Roofing content
- [ ] Implement project hover effects
- [ ] Add case study scroll animations

### Phase 7: Remaining Pages

- [ ] Refactor Services page
- [ ] Refactor About page with new layout
- [ ] Refactor Contact page
- [ ] Refactor Industries page
- [ ] Connect all pages to Sanity CMS

### Phase 8: Polish & Optimization

- [ ] Performance audit and optimization
- [ ] Cross-browser testing
- [ ] Mobile testing on real devices
- [ ] Accessibility audit
- [ ] Final animation timing adjustments
- [ ] Content population in Sanity

---

## Reference Sites

| Site | Key Lesson |
|------|------------|
| locomotive.ca | Minimalist mastery, custom typography |
| jesperlandberg.com | Solo practitioner at highest level |
| wearecollins.com | Premium positioning, programs-based |
| pentagram.com | Work-forward, portfolio speaks |
| buildinamsterdam.com | Clean, strategic presentation |

---

## Success Criteria

1. Site immediately signals "premium" to visitors
2. Home service business owners understand value prop in < 5 seconds
3. Quiz captures qualified leads with contact info
4. Case study demonstrates measurable results
5. Mobile experience is fast and friction-free
6. Dark mode feels intentional, not inverted
7. Animations enhance rather than distract
8. Page load < 2.5s on 4G connection
