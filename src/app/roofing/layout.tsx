import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roofing SEO Services | Get Found by Homeowners | Obieo',
  description: 'Specialized roofing SEO that gets your company found on Google and AI search. Built by a roofer\'s son who grew the family business 10x. Book a free strategy call.',
  keywords: ['roofing seo', 'roofing company seo', 'roofing seo company', 'seo for roofers', 'roofing marketing'],
  openGraph: {
    title: 'Roofing SEO Services | Get Found by Homeowners | Obieo',
    description: 'Specialized roofing SEO that gets your company found on Google and AI search. Built by a roofer\'s son who grew the family business 10x.',
    url: 'https://obieo.com/roofing',
    siteName: 'Obieo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofing SEO Services | Get Found by Homeowners | Obieo',
    description: 'Specialized roofing SEO that gets your company found on Google and AI search.',
  },
  alternates: {
    canonical: 'https://obieo.com/roofing',
  },
}

export default function RoofingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
