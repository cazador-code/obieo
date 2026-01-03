# Premium Redesign Phase 1: Foundation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up the technical foundation for the premium redesign including dependencies, Sanity CMS, theming system, and base UI components.

**Architecture:** Install animation libraries (Framer Motion, GSAP, Lenis) and Sanity CMS. Implement CSS variable-based theming with dark mode support. Create reusable UI primitives that respect the design system.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Framer Motion, GSAP (ScrollTrigger, SplitText), Lenis, Sanity v3

---

## Task 1: Install Animation Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Framer Motion**

Run:
```bash
npm install framer-motion
```

Expected: Package added to dependencies

**Step 2: Install GSAP with plugins**

Run:
```bash
npm install gsap
```

Expected: Package added to dependencies

Note: ScrollTrigger and SplitText are included in gsap package. SplitText requires Club GreenSock for commercial use, but we can use the free trial or implement a custom solution.

**Step 3: Install Lenis**

Run:
```bash
npm install lenis
```

Expected: Package added to dependencies

**Step 4: Verify installations**

Run:
```bash
npm ls framer-motion gsap lenis
```

Expected: All three packages listed with versions

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add animation libraries (framer-motion, gsap, lenis)"
```

---

## Task 2: Install Sanity Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Sanity client packages**

Run:
```bash
npm install next-sanity @sanity/image-url @sanity/client
```

Expected: Packages added to dependencies

**Step 2: Install Sanity Studio (for embedded studio)**

Run:
```bash
npm install sanity @sanity/vision
```

Expected: Packages added to dependencies

**Step 3: Verify installations**

Run:
```bash
npm ls next-sanity sanity @sanity/client @sanity/image-url @sanity/vision
```

Expected: All packages listed

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add sanity cms dependencies"
```

---

## Task 3: Create Sanity Project Configuration

**Files:**
- Create: `src/sanity/config.ts`
- Create: `src/sanity/client.ts`
- Create: `.env.local`
- Modify: `.gitignore` (verify .env.local is ignored)

**Step 1: Create Sanity project on sanity.io**

Manual step:
1. Go to https://www.sanity.io/manage
2. Create new project named "obieo"
3. Choose "Create empty project"
4. Copy the Project ID and Dataset name (usually "production")

**Step 2: Create environment file**

Create `.env.local`:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_token_here
```

Note: Get API token from Sanity project settings → API → Add API token (Editor permissions)

**Step 3: Verify .env.local is in .gitignore**

Run:
```bash
grep ".env" .gitignore
```

Expected: Should see `.env*` or `.env.local` listed

**Step 4: Create Sanity config file**

Create `src/sanity/config.ts`:
```typescript
export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
}
```

**Step 5: Create Sanity client**

Create `src/sanity/client.ts`:
```typescript
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { sanityConfig } from './config'

export const client = createClient({
  ...sanityConfig,
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}
```

**Step 6: Commit (without .env.local)**

```bash
git add src/sanity/config.ts src/sanity/client.ts
git commit -m "feat: add sanity client configuration"
```

---

## Task 4: Create Sanity Schemas - Site Settings

**Files:**
- Create: `src/sanity/schemas/siteSettings.ts`
- Create: `src/sanity/schemas/index.ts`

**Step 1: Create site settings schema**

Create `src/sanity/schemas/siteSettings.ts`:
```typescript
import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    }),
    defineField({
      name: 'calendlyUrl',
      title: 'Calendly URL',
      type: 'url',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({ name: 'twitter', type: 'url', title: 'Twitter' }),
        defineField({ name: 'linkedin', type: 'url', title: 'LinkedIn' }),
        defineField({ name: 'instagram', type: 'url', title: 'Instagram' }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'siteName',
    },
  },
})
```

**Step 2: Create schema index**

Create `src/sanity/schemas/index.ts`:
```typescript
import { siteSettings } from './siteSettings'

export const schemaTypes = [siteSettings]
```

**Step 3: Commit**

```bash
git add src/sanity/schemas/
git commit -m "feat: add sanity site settings schema"
```

---

## Task 5: Create Sanity Schemas - Project (Case Study)

**Files:**
- Create: `src/sanity/schemas/project.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Create project schema**

Create `src/sanity/schemas/project.ts`:
```typescript
import { defineType, defineField, defineArrayMember } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Client Name',
      type: 'string',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short one-line description',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 2,
      description: 'Brief summary for cards',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'metrics',
      title: 'Key Metrics',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label' }),
            defineField({ name: 'value', type: 'string', title: 'Value' }),
            defineField({ name: 'prefix', type: 'string', title: 'Prefix (e.g., +)' }),
            defineField({ name: 'suffix', type: 'string', title: 'Suffix (e.g., %)' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'challenge',
      title: 'The Challenge',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'challengeImage',
      title: 'Challenge Image (Before)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'approach',
      title: 'The Approach',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'approachImages',
      title: 'Approach Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'results',
      title: 'The Results',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'resultsImage',
      title: 'Results Image (After)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      client: 'client',
      media: 'thumbnail',
    },
    prepare({ title, client, media }) {
      return {
        title,
        subtitle: client,
        media,
      }
    },
  },
})
```

**Step 2: Update schema index**

Modify `src/sanity/schemas/index.ts`:
```typescript
import { siteSettings } from './siteSettings'
import { project } from './project'

export const schemaTypes = [siteSettings, project]
```

**Step 3: Commit**

```bash
git add src/sanity/schemas/
git commit -m "feat: add sanity project (case study) schema"
```

---

## Task 6: Create Sanity Schemas - Testimonial, Service, FAQ

**Files:**
- Create: `src/sanity/schemas/testimonial.ts`
- Create: `src/sanity/schemas/service.ts`
- Create: `src/sanity/schemas/faq.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Create testimonial schema**

Create `src/sanity/schemas/testimonial.ts`:
```typescript
import { defineType, defineField } from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role/Title',
      type: 'string',
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Author Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'metric',
      title: 'Key Metric',
      type: 'string',
      description: 'e.g., "Increased leads by 147%"',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'author',
      subtitle: 'company',
      media: 'image',
    },
  },
})
```

**Step 2: Create service schema**

Create `src/sanity/schemas/service.ts`:
```typescript
import { defineType, defineField, defineArrayMember } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'e.g., "$2,500" or "$1,250/month"',
    }),
    defineField({
      name: 'priceNote',
      title: 'Price Note',
      type: 'string',
      description: 'e.g., "one-time" or "monthly"',
    }),
    defineField({
      name: 'inclusions',
      title: 'What\'s Included',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'idealFor',
      title: 'Ideal For',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Button Text',
      type: 'string',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'price',
    },
  },
})
```

**Step 3: Create FAQ schema**

Create `src/sanity/schemas/faq.ts`:
```typescript
import { defineType, defineField } from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'General', value: 'general' },
          { title: 'Services', value: 'services' },
          { title: 'Process', value: 'process' },
          { title: 'Pricing', value: 'pricing' },
        ],
      },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'category',
    },
  },
})
```

**Step 4: Update schema index**

Modify `src/sanity/schemas/index.ts`:
```typescript
import { siteSettings } from './siteSettings'
import { project } from './project'
import { testimonial } from './testimonial'
import { service } from './service'
import { faq } from './faq'

export const schemaTypes = [
  siteSettings,
  project,
  testimonial,
  service,
  faq,
]
```

**Step 5: Commit**

```bash
git add src/sanity/schemas/
git commit -m "feat: add sanity schemas for testimonial, service, and faq"
```

---

## Task 7: Create Sanity Schema - Lead (Quiz Submissions)

**Files:**
- Create: `src/sanity/schemas/lead.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Create lead schema**

Create `src/sanity/schemas/lead.ts`:
```typescript
import { defineType, defineField } from 'sanity'

export const lead = defineType({
  name: 'lead',
  title: 'Lead',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'website',
      title: 'Website URL',
      type: 'url',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Quiz', value: 'quiz' },
          { title: 'Contact Form', value: 'contact' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'quizAnswers',
      title: 'Quiz Answers',
      type: 'object',
      fields: [
        defineField({ name: 'industry', type: 'string', title: 'Industry' }),
        defineField({ name: 'hasWebsite', type: 'string', title: 'Has Website' }),
        defineField({ name: 'leadSource', type: 'string', title: 'Lead Source' }),
        defineField({ name: 'frustration', type: 'string', title: 'Main Frustration' }),
        defineField({ name: 'goals', type: 'string', title: 'Goals' }),
      ],
    }),
    defineField({
      name: 'score',
      title: 'Quiz Score',
      type: 'number',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Qualified', value: 'qualified' },
          { title: 'Closed', value: 'closed' },
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'source',
    },
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
})
```

**Step 2: Update schema index**

Modify `src/sanity/schemas/index.ts`:
```typescript
import { siteSettings } from './siteSettings'
import { project } from './project'
import { testimonial } from './testimonial'
import { service } from './service'
import { faq } from './faq'
import { lead } from './lead'

export const schemaTypes = [
  siteSettings,
  project,
  testimonial,
  service,
  faq,
  lead,
]
```

**Step 3: Commit**

```bash
git add src/sanity/schemas/
git commit -m "feat: add sanity lead schema for quiz submissions"
```

---

## Task 8: Set Up Embedded Sanity Studio

**Files:**
- Create: `src/app/studio/[[...tool]]/page.tsx`
- Create: `sanity.config.ts` (project root)
- Modify: `next.config.ts`

**Step 1: Create Sanity config at project root**

Create `sanity.config.ts`:
```typescript
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schemas'

export default defineConfig({
  name: 'obieo-studio',
  title: 'Obieo CMS',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
```

**Step 2: Create Studio page**

Create `src/app/studio/[[...tool]]/page.tsx`:
```typescript
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

**Step 3: Update Next.js config for Sanity Studio**

Modify `next.config.ts`:
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Sanity Studio requires this
  transpilePackages: ['sanity'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default nextConfig
```

**Step 4: Test studio loads**

Run:
```bash
npm run dev
```

Navigate to: http://localhost:3000/studio

Expected: Sanity Studio interface loads (may show "Configure project" if env vars not set)

**Step 5: Commit**

```bash
git add src/app/studio/ sanity.config.ts next.config.ts
git commit -m "feat: add embedded sanity studio at /studio"
```

---

## Task 9: Implement CSS Variable Theming System

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Replace color variables with semantic tokens**

Modify `src/app/globals.css` - replace the existing color variables with:
```css
@import "tailwindcss";

:root {
  /* Light mode (default) */
  --bg-primary: #fdfcfa;
  --bg-secondary: #f5f2ed;
  --bg-card: #ffffff;
  --bg-elevated: #ffffff;

  --text-primary: #1a1612;
  --text-secondary: #5c5549;
  --text-muted: #8a8279;

  --accent: #d97650;
  --accent-hover: #c4613c;
  --accent-light: #f2b094;

  --border: #e8e4dc;
  --border-light: #f0ece4;

  /* Keep existing terracotta and slate for backwards compatibility */
  --terracotta-600: #c4613c;
  --terracotta-500: #d97650;
  --terracotta-400: #e8916b;
  --terracotta-300: #f2b094;

  /* Font variables */
  --font-display: var(--font-outfit);
  --font-body: var(--font-dm-sans);
}

[data-theme="dark"] {
  --bg-primary: #0f0d0b;
  --bg-secondary: #1a1714;
  --bg-card: #242019;
  --bg-elevated: #2d2922;

  --text-primary: #f5f2ed;
  --text-secondary: #a39e94;
  --text-muted: #6b665e;

  --accent: #e8916b;
  --accent-hover: #f2b094;
  --accent-light: #c4613c;

  --border: #2d2922;
  --border-light: #3d3830;
}

/* Apply theme colors */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Smooth theme transitions */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

/* Rest of existing styles... */
html {
  scroll-behavior: smooth;
}

::selection {
  background-color: var(--accent);
  color: var(--bg-primary);
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

**Step 2: Verify build succeeds**

Run:
```bash
npm run build
```

Expected: Build completes without errors

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: implement css variable theming system with dark mode support"
```

---

## Task 10: Create Theme Provider and Toggle

**Files:**
- Create: `src/components/ThemeProvider.tsx`
- Create: `src/components/ThemeToggle.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create ThemeProvider**

Create `src/components/ThemeProvider.tsx`:
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) {
      setTheme(stored)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

**Step 2: Create ThemeToggle component**

Create `src/components/ThemeToggle.tsx`:
```typescript
'use client'

import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      )}
    </button>
  )
}
```

**Step 3: Add ThemeProvider to layout**

Modify `src/app/layout.tsx` - wrap children with ThemeProvider:
```typescript
import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  // ... existing metadata
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
        className={`${dmSans.variable} ${outfit.variable} antialiased`}
      >
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 4: Test theme toggle**

Run:
```bash
npm run dev
```

Test: Theme toggle should work (we'll add it to header in next task)

**Step 5: Commit**

```bash
git add src/components/ThemeProvider.tsx src/components/ThemeToggle.tsx src/app/layout.tsx
git commit -m "feat: add theme provider and toggle component with localStorage persistence"
```

---

## Task 11: Create Base UI Components - Button

**Files:**
- Create: `src/components/ui/Button.tsx`

**Step 1: Create Button component**

Create `src/components/ui/Button.tsx`:
```typescript
import { forwardRef, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
      primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:scale-[1.02]',
      secondary: 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-secondary)]',
      outline: 'border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white',
      ghost: 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

**Step 2: Create index export**

Create `src/components/ui/index.ts`:
```typescript
export { Button } from './Button'
```

**Step 3: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add base Button component with variants and sizes"
```

---

## Task 12: Create Base UI Components - Card

**Files:**
- Create: `src/components/ui/Card.tsx`
- Modify: `src/components/ui/index.ts`

**Step 1: Create Card component**

Create `src/components/ui/Card.tsx`:
```typescript
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered'
  hover?: boolean
  children: React.ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-200'

    const variants = {
      default: 'bg-[var(--bg-card)]',
      elevated: 'bg-[var(--bg-card)] shadow-lg',
      bordered: 'bg-[var(--bg-card)] border border-[var(--border)]',
    }

    const hoverStyles = hover
      ? 'hover:-translate-y-2 hover:shadow-xl cursor-pointer'
      : ''

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card sub-components
export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pb-0 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  )
}
```

**Step 2: Update index export**

Modify `src/components/ui/index.ts`:
```typescript
export { Button } from './Button'
export { Card, CardHeader, CardContent, CardFooter } from './Card'
```

**Step 3: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add Card component with variants and sub-components"
```

---

## Task 13: Create Base UI Components - Input

**Files:**
- Create: `src/components/ui/Input.tsx`
- Modify: `src/components/ui/index.ts`

**Step 1: Create Input component**

Create `src/components/ui/Input.tsx`:
```typescript
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-[var(--bg-card)]
            border border-[var(--border)]
            text-[var(--text-primary)]
            placeholder:text-[var(--text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

**Step 2: Create Textarea component**

Create `src/components/ui/Textarea.tsx`:
```typescript
import { forwardRef, TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-[var(--bg-card)]
            border border-[var(--border)]
            text-[var(--text-primary)]
            placeholder:text-[var(--text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
            transition-all duration-200
            resize-y min-h-[120px]
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
```

**Step 3: Update index export**

Modify `src/components/ui/index.ts`:
```typescript
export { Button } from './Button'
export { Card, CardHeader, CardContent, CardFooter } from './Card'
export { Input } from './Input'
export { Textarea } from './Textarea'
```

**Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add Input and Textarea components"
```

---

## Task 14: Set Up Lenis Smooth Scroll

**Files:**
- Create: `src/components/SmoothScroll.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create SmoothScroll provider**

Create `src/components/SmoothScroll.tsx`:
```typescript
'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Skip on mobile for better native scroll feel
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isMobile || prefersReducedMotion) {
      return
    }

    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })

    function raf(time: number) {
      lenisRef.current?.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenisRef.current?.destroy()
    }
  }, [])

  return <>{children}</>
}
```

**Step 2: Add SmoothScroll to layout**

Modify `src/app/layout.tsx` - add SmoothScroll wrapper:
```typescript
import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

// ... fonts and metadata stay the same

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
        className={`${dmSans.variable} ${outfit.variable} antialiased`}
      >
        <ThemeProvider>
          <SmoothScroll>
            <Header />
            <main>{children}</main>
            <Footer />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 3: Test smooth scroll**

Run:
```bash
npm run dev
```

Test: Scroll should feel smooth and weighted on desktop, native on mobile

**Step 4: Commit**

```bash
git add src/components/SmoothScroll.tsx src/app/layout.tsx
git commit -m "feat: add Lenis smooth scroll with mobile and reduced-motion detection"
```

---

## Task 15: Set Up Framer Motion Page Transitions

**Files:**
- Create: `src/components/PageTransition.tsx`
- Create: `src/app/template.tsx`

**Step 1: Create PageTransition component**

Create `src/components/PageTransition.tsx`:
```typescript
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
```

**Step 2: Create template for page transitions**

Create `src/app/template.tsx`:
```typescript
'use client'

import { PageTransition } from '@/components/PageTransition'

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
```

**Step 3: Test page transitions**

Run:
```bash
npm run dev
```

Test: Navigate between pages - should see fade/slide animations

**Step 4: Commit**

```bash
git add src/components/PageTransition.tsx src/app/template.tsx
git commit -m "feat: add framer motion page transitions"
```

---

## Task 16: Create Sanity Query Helpers

**Files:**
- Create: `src/sanity/queries.ts`

**Step 1: Create query helpers**

Create `src/sanity/queries.ts`:
```typescript
import { groq } from 'next-sanity'

// Site Settings
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    siteName,
    siteDescription,
    contactEmail,
    contactPhone,
    calendlyUrl,
    socialLinks
  }
`

// Projects
export const projectsQuery = groq`
  *[_type == "project"] | order(order asc) {
    _id,
    title,
    slug,
    client,
    tagline,
    excerpt,
    thumbnail,
    metrics,
    featured
  }
`

export const featuredProjectQuery = groq`
  *[_type == "project" && featured == true][0] {
    _id,
    title,
    slug,
    client,
    tagline,
    excerpt,
    heroImage,
    metrics
  }
`

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    client,
    tagline,
    heroImage,
    metrics,
    challenge,
    challengeImage,
    approach,
    approachImages,
    results,
    resultsImage
  }
`

// Testimonials
export const testimonialsQuery = groq`
  *[_type == "testimonial"] | order(featured desc) {
    _id,
    quote,
    author,
    role,
    company,
    image,
    metric,
    featured
  }
`

export const featuredTestimonialQuery = groq`
  *[_type == "testimonial" && featured == true][0] {
    _id,
    quote,
    author,
    role,
    company,
    image,
    metric
  }
`

// Services
export const servicesQuery = groq`
  *[_type == "service"] | order(order asc) {
    _id,
    title,
    slug,
    subtitle,
    description,
    price,
    priceNote,
    inclusions,
    idealFor,
    ctaText
  }
`

// FAQs
export const faqsQuery = groq`
  *[_type == "faq"] | order(order asc) {
    _id,
    question,
    answer,
    category
  }
`

export const faqsByCategoryQuery = groq`
  *[_type == "faq" && category == $category] | order(order asc) {
    _id,
    question,
    answer
  }
`
```

**Step 2: Create fetch helper**

Update `src/sanity/client.ts`:
```typescript
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { sanityConfig } from './config'

export const client = createClient({
  ...sanityConfig,
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Type-safe fetch helper
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
}: {
  query: string
  params?: Record<string, any>
  tags?: string[]
}): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {
      revalidate: process.env.NODE_ENV === 'development' ? 0 : 60,
      tags,
    },
  })
}
```

**Step 3: Commit**

```bash
git add src/sanity/queries.ts src/sanity/client.ts
git commit -m "feat: add sanity query helpers and fetch utility"
```

---

## Task 17: Final Phase 1 Verification

**Step 1: Run full build**

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

Expected: No lint errors (warnings acceptable)

**Step 3: Test dev server**

Run:
```bash
npm run dev
```

Verify:
- [ ] Homepage loads
- [ ] Theme toggle would work (not in UI yet, but provider is ready)
- [ ] Smooth scroll works on desktop
- [ ] Page transitions work when navigating
- [ ] Studio loads at /studio (if env vars configured)

**Step 4: Commit any fixes and tag phase completion**

```bash
git add -A
git commit -m "chore: phase 1 foundation complete"
```

---

## Phase 1 Complete

Foundation is ready:
- ✅ Animation libraries installed (Framer Motion, GSAP, Lenis)
- ✅ Sanity CMS configured with all schemas
- ✅ CSS variable theming with dark mode support
- ✅ ThemeProvider with localStorage persistence
- ✅ Base UI components (Button, Card, Input, Textarea)
- ✅ Lenis smooth scroll (desktop only)
- ✅ Framer Motion page transitions
- ✅ Sanity query helpers

**Next:** Phase 2 - Core Layout & Navigation (Header refactor, add Work to nav, add theme toggle to UI)
