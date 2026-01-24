import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Painting Contractor SEO Services | Get More Paint Jobs | Obieo',
  description: 'Specialized SEO for painting contractors that gets you found for interior, exterior, and commercial painting projects. Book a free strategy call.',
  keywords: ['painting contractor seo', 'seo for painters', 'painting company marketing', 'painter marketing', 'local seo for painting contractors'],
  openGraph: {
    title: 'Painting Contractor SEO Services | Get More Paint Jobs | Obieo',
    description: 'Specialized SEO for painting contractors that gets you found for residential and commercial projects.',
    url: 'https://obieo.com/painting',
    siteName: 'Obieo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Painting Contractor SEO Services | Get More Paint Jobs | Obieo',
    description: 'Specialized SEO for painting contractors.',
  },
  alternates: {
    canonical: 'https://obieo.com/painting',
  },
}

export default function PaintingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
