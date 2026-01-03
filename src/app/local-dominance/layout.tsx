import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Local Dominance — $2,000/mo SEO Retainer for Home Service Businesses | Obieo',
  description:
    'The Local Dominance Retainer: Google Business Profile management, 2 SEO pages/month, technical SEO, local citations, and quality link building. Everything a $1-3M home service company needs to rank on Google.',
  openGraph: {
    title: 'Local Dominance — SEO Retainer for Home Service Businesses',
    description:
      'Stop guessing. Start ranking. $2,000/month for everything you need to show up on Google and convert more visitors.',
  },
}

export default function LocalDominanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
