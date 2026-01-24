import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flooring Contractor SEO Services | Get More Installation Leads | Obieo',
  description: 'Specialized SEO for flooring contractors that gets you found for hardwood, tile, carpet, and LVP installations. Book a free strategy call.',
  keywords: ['flooring contractor seo', 'seo for flooring companies', 'flooring marketing', 'flooring company marketing', 'local seo for flooring contractors'],
  openGraph: {
    title: 'Flooring Contractor SEO Services | Get More Installation Leads | Obieo',
    description: 'Specialized SEO for flooring contractors that gets you found for all flooring projects.',
    url: 'https://obieo.com/flooring',
    siteName: 'Obieo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flooring Contractor SEO Services | Get More Installation Leads | Obieo',
    description: 'Specialized SEO for flooring contractors.',
  },
  alternates: {
    canonical: 'https://obieo.com/flooring',
  },
}

export default function FlooringLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
