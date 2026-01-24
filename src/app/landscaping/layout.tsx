import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Landscaping SEO Services | Get More Lawn Care Leads | Obieo',
  description: 'Specialized SEO for landscaping companies that gets you found for lawn care, hardscaping, and outdoor living projects. Book a free strategy call.',
  keywords: ['landscaping seo', 'seo for landscapers', 'lawn care marketing', 'landscaping marketing', 'local seo for landscaping companies'],
  openGraph: {
    title: 'Landscaping SEO Services | Get More Lawn Care Leads | Obieo',
    description: 'Specialized SEO for landscaping companies that gets you found for lawn care and outdoor projects.',
    url: 'https://obieo.com/landscaping',
    siteName: 'Obieo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Landscaping SEO Services | Get More Lawn Care Leads | Obieo',
    description: 'Specialized SEO for landscaping companies.',
  },
  alternates: {
    canonical: 'https://obieo.com/landscaping',
  },
}

export default function LandscapingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
