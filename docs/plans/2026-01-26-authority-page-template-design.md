# Authority Page Template Design (v2 - GEO Optimized)

**Date:** January 26, 2026
**Purpose:** Template structure for `/industries/[industry]` authority hub pages
**Audit:** Validated against SEO/GEO Content Framework

---

## Architecture Decision

### URL Structure
```
/industries/[industry]  → Authority hub (educational, SEO/GEO-focused)
/[industry]             → Conversion landing page (sales-focused)
```

### Internal Linking Strategy
- Authority page → Landing page: "Ready to get started? [Get a free strategy call →](/[industry])"
- Landing page → Authority page: "Learn more about [Industry] SEO →"
- Authority pages cross-link to related industries' authority pages
- Authority pages link to `/industries` hub page

---

## GEO CITABLE Framework Compliance

Each page must satisfy the **CITABLE** requirements for AI citation:

| Element | Implementation |
|---------|----------------|
| **C**lear Entity Structure | TL;DR block in first 100 words naming Obieo, category (SEO agency), positioning (for home services) |
| **I**ntent Architecture | Answer main question + 5-7 adjacent questions in FAQ |
| **T**hird-Party Validation | Link to industry associations, cite reputable sources |
| **A**nswer Grounding | All stats have year + source attribution |
| **B**lock-Structured for RAG | 200-400 word semantic blocks, each standalone |
| **L**atest and Consistent | Visible "Last updated: [date]" + schema dateModified |
| **E**ntity Graph | Elite schema with knowsAbout, hasOfferCatalog |

---

## Page Structure (Target: 4,000-5,000 words)

### 1. Hero Section (~150 words)
- **H1:** "The Complete Guide to [Industry] SEO in 2026"
- **Subtitle:** Clear value proposition with keyword
- **Breadcrumb:** Home > Industries > [Industry] SEO
- **TL;DR Block:** 2-3 sentence summary (CITABLE requirement)
- **Last Updated:** Visible date
- **Table of Contents:** Jump links to all H2 sections

```
TL;DR: [Industry] SEO helps [type] companies rank higher on Google
and get cited by AI search tools like ChatGPT and Perplexity. This
guide covers the biggest challenges, proven strategies, and keywords
that drive leads for [industry] businesses in 2026.
```

### 2. Definition Section (~400 words, 2 blocks)
**Purpose:** Provide quotable, extractable definition for AI systems

**Block 1: Direct Answer (200 words)**
- H2: "What is [Industry] SEO?"
- **First 40-60 words:** Direct, quotable definition
- Why it matters for [industry] businesses
- Link to conversion page

**Block 2: Key Statistics (200 words)**
- 3-5 statistics with sources and years
- Formatted as a comparison table
- Each stat linked to source where possible

```markdown
| Metric | Value | Source |
|--------|-------|--------|
| % of homeowners who search online | 87% | BrightLocal 2025 |
| Average conversion rate for SEO leads | 14.6% | HubSpot 2025 |
```

### 3. Industry Landscape (~500 words, 2-3 blocks)
**Purpose:** Establish authority with market knowledge

**Block 1: Market Overview (200 words)**
- H2: "The [Industry] Industry in 2026"
- Market size and growth statistics
- Consumer behavior trends

**Block 2: Technology & Trends (200 words)**
- Technology changes (EV chargers for electrical, etc.)
- How search behavior is evolving
- AI search impact on the industry

**Block 3: Seasonal Patterns (100 words)** *(if applicable)*
- Seasonal demand fluctuations
- How to optimize for peak seasons

### 4. Pain Points Section (~800 words, 5-7 blocks)
**Purpose:** Address specific challenges business owners face

- H2: "Top [5-7] SEO Challenges [Industry] Companies Face"
- **Each pain point as a 100-150 word block:**
  - H3: Challenge title
  - Problem description (2-3 sentences)
  - Impact on business (1-2 sentences)
  - Stat to support (with source)
  - Brief solution teaser

**Pain Point Block Template:**
```markdown
### [Challenge Title]

[Direct statement of the problem in 1-2 sentences.]

**Impact:** [How this hurts revenue/leads in 1-2 sentences.]

**The data:** [Specific stat with source, e.g., "76% of consumers
who search for [service] don't have a specific company in mind
(BrightLocal 2025)."]

**Solution preview:** [1 sentence teaser linking to strategies section.]
```

### 5. Strategies Section (~1,200 words, 6-8 blocks)
**Purpose:** Provide actionable guidance (demonstrates expertise)

- H2: "Proven [Industry] SEO Strategies for 2026"
- **Each strategy as a 150-200 word block:**
  - H3: Strategy title
  - Why it works (1-2 sentences)
  - 3-5 concrete steps (numbered list)
  - Pro tip callout box

**Required Strategies:**
1. Google Business Profile Optimization
2. Local Keyword Strategy
3. Service Page Optimization
4. Review Generation & Management
5. Content Marketing for [Industry]
6. Technical SEO Foundations
7. AI Search Visibility (GEO/AEO) ← Differentiator

**Strategy Block Template:**
```markdown
### [Strategy Title]

[Why this works in 1-2 sentences.]

**How to implement:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]

> **Pro tip:** [Actionable insight specific to this industry]
```

### 6. Keywords Section (~400 words, 2 blocks)
**Purpose:** SEO-valuable, searchable content

**Block 1: Keyword Categories (200 words)**
- H2: "High-Value [Industry] SEO Keywords"
- Brief explanation of keyword intent types
- Why these matter for [industry]

**Block 2: Keyword Lists (200 words)**
- **Table format for AI extraction:**

| Category | Example Keywords |
|----------|------------------|
| Emergency/Urgent | "emergency [service] near me", "24 hour [service]" |
| Location-based | "[service] in [city]", "[service] near me" |
| Service-specific | "[specific service] cost", "[service] installation" |
| Long-tail | "[brand] [product] installation [city]" |

### 7. Local SEO Section (~400 words, 2 blocks)
**Purpose:** Highly relevant for service businesses

**Block 1: GBP Optimization (200 words)**
- H2: "Local SEO for [Industry] Companies"
- Google Business Profile tips (numbered list)
- Category selection guidance

**Block 2: Citations & Reviews (200 words)**
- NAP consistency importance
- Top citation sources for [industry]
- Review generation strategies

### 8. AI Search Section (~500 words, 2-3 blocks)
**Purpose:** Differentiator - most competitors don't cover this

**Block 1: What is GEO (200 words)**
- H2: "Getting Found in AI Search: GEO for [Industry]"
- Definition of GEO/AEO
- Why it matters (stats on AI search usage)

**Block 2: Platform Differences (150 words)**
- How ChatGPT, Perplexity, Google AI Overviews differ
- What each looks for in citations

**Block 3: GEO Tactics (150 words)**
- Specific tactics for [industry]
- How to get cited by AI systems

### 9. Comparison Table Section (~200 words) ← NEW
**Purpose:** AI systems love structured comparisons

- H2: "SEO vs. Google Ads for [Industry] Companies"
- Comparison table format

| Factor | SEO | Google Ads |
|--------|-----|------------|
| Time to results | 3-6 months | Immediate |
| Cost structure | Monthly retainer | Pay per click |
| Long-term value | Compounds | Stops when you stop |
| Best for | Sustainable growth | Quick leads |

### 10. FAQ Section (~1,000 words, 12-15 questions)
**Purpose:** Schema-rich, AI-extractable Q&A

- H2: "Frequently Asked Questions About [Industry] SEO"
- **12-15 questions organized by category:**

| Category | Example Questions |
|----------|-------------------|
| Cost/Investment (3) | "How much does [industry] SEO cost?" |
| Timeline (2) | "How long until I see results?" |
| Strategy (3) | "Is SEO better than Google Ads for [industry]?" |
| Technical (2) | "Do I need a new website for SEO?" |
| Comparison (2-3) | "What's the difference between SEO and GEO?" |
| Industry-specific (2) | "[Industry]-specific questions" |

**FAQ Answer Requirements:**
- Each answer: 50-100 words
- Direct answer in first sentence
- Specific numbers where possible
- End with actionable next step

### 11. Author Section (~100 words) ← NEW
**Purpose:** E-E-A-T signals for both Google and AI

- H2 (visually hidden): "About the Author"
- Author photo
- Name: Hunter Lapeyre
- Credentials: Owner of Lapeyre Roofing, SEO strategist
- Brief bio demonstrating experience

### 12. CTA Section (~100 words)
**Purpose:** Bridge to conversion page

- H2: "Ready to Dominate [Industry] Search?"
- Brief pitch (2-3 sentences)
- Primary CTA: Link to landing page or quiz
- Secondary CTA: Link to contact

### 13. Related Industries (~100 words)
**Purpose:** Internal linking, topic clustering

- H2: "Related Industries We Serve"
- 3 related industry cards linking to their **authority pages** (not landing pages)

---

## Schema Markup Requirements (Elite Level - Target Score: 9/10)

### 1. Article Schema (with full author details)
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The Complete Guide to [Industry] SEO in 2026",
  "description": "[Meta description]",
  "image": "https://obieo.com/og/[industry]-seo.png",
  "datePublished": "2026-01-26",
  "dateModified": "2026-01-26",
  "author": {
    "@type": "Person",
    "name": "Hunter Lapeyre",
    "url": "https://obieo.com/about",
    "jobTitle": "Founder & SEO Strategist",
    "worksFor": {
      "@type": "Organization",
      "name": "Obieo"
    },
    "sameAs": [
      "https://www.linkedin.com/in/hunterlapeyre"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "name": "Obieo",
    "logo": {
      "@type": "ImageObject",
      "url": "https://obieo.com/logo.png"
    }
  }
}
```

### 2. FAQPage Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer]"
      }
    }
    // ... 12-15 questions
  ]
}
```

### 3. Service Schema (with hasOfferCatalog)
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "[Industry] SEO Services",
  "description": "Specialized SEO and AI search optimization for [industry] companies",
  "provider": {
    "@type": "ProfessionalService",
    "name": "Obieo",
    "url": "https://obieo.com"
  },
  "serviceType": "Search Engine Optimization",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "[Industry] SEO Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Local SEO for [Industry]",
          "description": "Google Business Profile optimization, local citations, and review management"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "GEO Optimization for [Industry]",
          "description": "AI search visibility for ChatGPT, Perplexity, and Google AI Overviews"
        }
      }
    ]
  }
}
```

### 4. BreadcrumbList Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://obieo.com" },
    { "@type": "ListItem", "position": 2, "name": "Industries", "item": "https://obieo.com/industries" },
    { "@type": "ListItem", "position": 3, "name": "[Industry] SEO", "item": "https://obieo.com/industries/[slug]" }
  ]
}
```

### 5. Organization Schema (with knowsAbout - Elite)
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Obieo",
  "url": "https://obieo.com",
  "description": "SEO and AI search optimization agency for home service businesses",
  "founder": {
    "@type": "Person",
    "name": "Hunter Lapeyre"
  },
  "knowsAbout": [
    {
      "@type": "Thing",
      "name": "[Industry] SEO",
      "description": "Search engine optimization for [industry] companies"
    },
    {
      "@type": "Thing",
      "name": "Local SEO",
      "sameAs": "https://en.wikipedia.org/wiki/Local_search_(Internet)"
    },
    {
      "@type": "Thing",
      "name": "Generative Engine Optimization",
      "description": "Optimization for AI search tools like ChatGPT and Perplexity"
    },
    {
      "@type": "Thing",
      "name": "Google Business Profile Optimization"
    },
    {
      "@type": "Thing",
      "name": "Home Services Marketing"
    }
    // Add 10-15 more industry-specific entries
  ],
  "areaServed": [
    {
      "@type": "Country",
      "name": "United States"
    }
  ]
}
```

### 6. HowTo Schema (for Strategies section)
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Improve [Industry] SEO",
  "description": "Step-by-step guide to improving search visibility for [industry] companies",
  "totalTime": "PT30M",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Optimize Google Business Profile",
      "text": "Claim and fully optimize your GBP with accurate categories, photos, and service areas"
    },
    {
      "@type": "HowToStep",
      "name": "Build Local Citations",
      "text": "List your business on industry directories and local business listings"
    }
    // ... more steps
  ]
}
```

---

## Schema Depth Scorecard (Target: 9+/10)

| Element | Points | Status |
|---------|--------|--------|
| Specialized type (ProfessionalService) | 1 | ✅ |
| knowsAbout with 5+ entries | 1 | ✅ |
| knowsAbout with 10+ entries | 1 | ✅ |
| knowsAbout with 15+ entries | 1 | ✅ |
| sameAs links to Wikipedia | 1 | ✅ |
| hasOfferCatalog with service details | 1 | ✅ |
| aggregateRating (when reviews exist) | 1 | Future |
| Detailed areaServed (country) | 1 | ✅ |
| founder/author with credentials | 1 | ✅ |
| Article + FAQPage + BreadcrumbList | 1 | ✅ |
| **Total** | **9/10** | |

---

## Data Structure (Updated)

```typescript
interface IndustryAuthorityData {
  // Core
  slug: string
  name: string
  accentColor: string

  // Meta
  title: string
  description: string
  lastUpdated: string // ISO date

  // Hero
  tldr: string // 2-3 sentence TL;DR for CITABLE compliance

  // Definition (Block 1)
  definition: {
    direct: string // First 40-60 words - extractable definition
    expanded: string
  }

  // Statistics (Block 2) - with sources
  stats: Array<{
    metric: string
    value: string
    source: string
    year: number
    url?: string
  }>

  // Industry Landscape
  landscape: {
    marketSize: string
    marketSizeSource: string
    growth: string
    trends: string[]
    seasonal?: string
  }

  // Pain Points (5-7)
  painPoints: Array<{
    title: string
    problem: string
    impact: string
    stat: string
    statSource: string
    solutionTeaser: string
  }>

  // Strategies (6-8)
  strategies: Array<{
    title: string
    why: string
    steps: string[]
    proTip: string
  }>

  // Keywords
  keywords: {
    emergency: string[]
    location: string[]
    service: string[]
    longTail: string[]
  }

  // Comparison table
  seoVsAdsComparison: Array<{
    factor: string
    seo: string
    ads: string
  }>

  // FAQs (12-15)
  faqs: Array<{
    question: string
    answer: string
    category: 'cost' | 'timeline' | 'strategy' | 'technical' | 'comparison' | 'industry'
  }>

  // Schema data
  knowsAbout: Array<{
    name: string
    description?: string
    sameAs?: string
  }>

  // Links
  landingPageSlug: string
  relatedIndustries: string[]
}
```

---

## Component Architecture

```
src/
├── app/
│   └── industries/
│       ├── page.tsx              # Industries hub
│       └── [industry]/
│           └── page.tsx          # Dynamic authority page
├── components/
│   └── authority-page/
│       ├── index.ts
│       ├── AuthorityPageLayout.tsx   # Main wrapper
│       ├── TLDRBlock.tsx             # CITABLE TL;DR
│       ├── TableOfContents.tsx
│       ├── DefinitionSection.tsx
│       ├── StatsTable.tsx            # Comparison tables
│       ├── IndustryLandscape.tsx
│       ├── PainPointsSection.tsx
│       ├── StrategiesSection.tsx
│       ├── KeywordsSection.tsx
│       ├── LocalSEOSection.tsx
│       ├── AISearchSection.tsx
│       ├── ComparisonTable.tsx       # SEO vs Ads
│       ├── FAQSection.tsx
│       ├── AuthorBio.tsx             # E-E-A-T
│       ├── AuthorityCTA.tsx
│       └── RelatedIndustries.tsx
├── lib/
│   └── schema/
│       ├── generateArticleSchema.ts
│       ├── generateFAQSchema.ts
│       ├── generateServiceSchema.ts
│       ├── generateBreadcrumbSchema.ts
│       ├── generateOrganizationSchema.ts
│       └── generateHowToSchema.ts
└── data/
    └── industries/
        ├── index.ts
        ├── types.ts              # IndustryAuthorityData interface
        ├── roofing.ts
        ├── hvac.ts
        └── ... (all 10)
```

---

## Pre-Launch Checklist

### Content Quality
- [ ] Each section is 200-400 words (RAG-friendly blocks)
- [ ] TL;DR block at page start
- [ ] First 40-60 words are direct, quotable definition
- [ ] 10+ statistics with sources and years
- [ ] All tables formatted for AI extraction
- [ ] Author bio with credentials

### Schema Validation
- [ ] All 6 schemas implemented
- [ ] Tested in Google Rich Results Test
- [ ] Tested in Schema.org validator
- [ ] Schema depth score 9+/10
- [ ] knowsAbout has 15+ entries

### Technical SEO
- [ ] Title 50-60 characters with keyword
- [ ] Meta description 150-160 characters
- [ ] H1 contains primary keyword
- [ ] Logical heading hierarchy (H1→H2→H3)
- [ ] Internal links with keyword-rich anchor text
- [ ] Images with descriptive alt text
- [ ] Page loads under 2 seconds
- [ ] Mobile-optimized

### GEO Compliance
- [ ] Satisfies all CITABLE requirements
- [ ] Visible "Last updated" date
- [ ] Platform-specific optimization mentioned
- [ ] Comparison tables included
- [ ] FAQ answers are direct and quotable

---

## Next Steps

1. ✅ Research complete
2. ✅ Template design complete (v2 - GEO optimized)
3. Create schema generation utilities
4. Build reusable authority page components
5. Build data files for each industry
6. Implement the dynamic route
7. Update internal linking
8. Run competitive schema audit before launch
