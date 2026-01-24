import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pest Control SEO Services | Get More Exterminator Leads | Obieo',
  description: 'Specialized SEO for pest control companies that gets you found when homeowners have infestations. Local SEO for exterminators. Book a free strategy call.',
  keywords: ['pest control seo', 'seo for pest control companies', 'exterminator marketing', 'pest control marketing', 'local seo for pest control'],
  openGraph: {
    title: 'Pest Control SEO Services | Get More Exterminator Leads | Obieo',
    description: 'Specialized SEO for pest control companies that gets you found when homeowners have infestations.',
    url: 'https://obieo.com/pest-control',
    siteName: 'Obieo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pest Control SEO Services | Get More Exterminator Leads | Obieo',
    description: 'Specialized SEO for pest control companies.',
  },
  alternates: {
    canonical: 'https://obieo.com/pest-control',
  },
}

export default function PestControlLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
