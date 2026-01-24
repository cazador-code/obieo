import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Google Business Profile Optimization Services | GBP SEO | Obieo',
  description: 'Expert Google Business Profile optimization for home service businesses. Get more calls from Google Maps and local search. Free GBP audit available.',
  keywords: ['gbp optimization', 'google business profile optimization', 'gbp seo', 'google my business optimization', 'local seo services', 'google maps ranking'],
  openGraph: {
    title: 'Google Business Profile Optimization Services | GBP SEO | Obieo',
    description: 'Expert GBP optimization that gets you more calls from Google Maps and local search.',
    url: 'https://obieo.com/gbp-optimization',
    siteName: 'Obieo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Google Business Profile Optimization Services | GBP SEO | Obieo',
    description: 'Expert GBP optimization for home service businesses.',
  },
  alternates: {
    canonical: 'https://obieo.com/gbp-optimization',
  },
}

export default function GBPOptimizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
