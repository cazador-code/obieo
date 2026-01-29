import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/studio/',
        '/api/',
        '/internal/',
        '/thank-you',
        '/roofing/thank-you',
        '/_next/static/chunks/',
      ],
    },
    sitemap: 'https://www.obieo.com/sitemap.xml',
    host: 'https://www.obieo.com',
  }
}
