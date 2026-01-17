import type { MetadataRoute } from 'next'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { sanityFetch } from '@/sanity/client'
import { blogPostsQuery, projectsQuery } from '@/sanity/queries'

const baseUrl = 'https://www.obieo.com'

interface SanityPost {
  slug: { current: string }
  publishedAt?: string
}

interface SanityProject {
  slug: { current: string }
}

/**
 * Scans a directory for static Next.js pages (folders containing page.tsx)
 * Excludes dynamic routes like [slug]
 */
function getStaticPages(dir: string): string[] {
  const slugs: string[] = []

  try {
    const entries = readdirSync(dir)

    for (const entry of entries) {
      // Skip dynamic routes and the index page
      if (entry.startsWith('[') || entry === 'page.tsx') continue

      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        // Check if this directory has a page.tsx (making it a valid route)
        try {
          statSync(join(fullPath, 'page.tsx'))
          slugs.push(entry)
        } catch {
          // No page.tsx, not a route
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return slugs
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic content from Sanity
  const [sanityPosts, sanityProjects] = await Promise.all([
    sanityFetch<SanityPost[]>({ query: blogPostsQuery, defaultValue: [] }),
    sanityFetch<SanityProject[]>({ query: projectsQuery, defaultValue: [] }),
  ])

  // Scan filesystem for static pages
  const staticBlogSlugs = getStaticPages(join(process.cwd(), 'src/app/blog'))
  const staticWorkSlugs = getStaticPages(join(process.cwd(), 'src/app/work'))

  // Combine Sanity slugs with static slugs (deduplicated)
  const sanityBlogSlugs = sanityPosts.map(p => p.slug.current)
  const sanityWorkSlugs = sanityProjects.map(p => p.slug.current)

  const allBlogSlugs = [...new Set([...sanityBlogSlugs, ...staticBlogSlugs])]
  const allWorkSlugs = [...new Set([...sanityWorkSlugs, ...staticWorkSlugs])]

  // Create blog entries with publishedAt dates when available
  const blogEntries: MetadataRoute.Sitemap = allBlogSlugs.map(slug => {
    const sanityPost = sanityPosts.find(p => p.slug.current === slug)
    return {
      url: `${baseUrl}/blog/${slug}`,
      lastModified: sanityPost?.publishedAt ? new Date(sanityPost.publishedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }
  })

  // Create work/project entries
  const workEntries: MetadataRoute.Sitemap = allWorkSlugs.map(slug => ({
    url: `${baseUrl}/work/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    // Core pages
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/local-dominance`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/process`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/call`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // Index pages
    {
      url: `${baseUrl}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // Dynamic content
    ...workEntries,
    ...blogEntries,

    // Secondary pages
    {
      url: `${baseUrl}/industries`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/roi-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // Legal pages
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/fulfillment-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/ai-privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
