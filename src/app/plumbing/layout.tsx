import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plumber SEO Services | Get More Emergency Calls | Obieo',
  description: 'Specialized SEO for plumbing companies that gets you found when pipes burst. Local SEO for plumbers with +414% growth. Book a free strategy call.',
  keywords: ['seo for plumbers', 'local seo for plumbers', 'plumbing seo services', 'plumber seo agency', 'plumbing marketing'],
  openGraph: {
    title: 'Plumber SEO Services | Get More Emergency Calls | Obieo',
    description: 'Specialized SEO for plumbing companies that gets you found when pipes burst. Local SEO for plumbers with +414% growth.',
    url: 'https://obieo.com/plumbing',
    siteName: 'Obieo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plumber SEO Services | Get More Emergency Calls | Obieo',
    description: 'Specialized SEO for plumbing companies that gets you found when pipes burst.',
  },
  alternates: {
    canonical: 'https://obieo.com/plumbing',
  },
}

export default function PlumbingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
