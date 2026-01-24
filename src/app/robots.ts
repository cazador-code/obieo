import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/api/', '/_next/static/chunks/'],
    },
    sitemap: 'https://www.obieo.com/sitemap.xml',
  }
}
