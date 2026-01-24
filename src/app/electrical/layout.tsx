import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Electrician SEO Services | Get More Service Calls | Obieo',
  description: 'Specialized SEO for electrical contractors that gets you found for emergency calls and installations. Local SEO for electricians. Book a free strategy call.',
  keywords: ['electrician seo', 'seo for electricians', 'electrical contractor marketing', 'electrician marketing', 'local seo for electricians'],
  openGraph: {
    title: 'Electrician SEO Services | Get More Service Calls | Obieo',
    description: 'Specialized SEO for electrical contractors that gets you found for emergency calls and installations.',
    url: 'https://obieo.com/electrical',
    siteName: 'Obieo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Electrician SEO Services | Get More Service Calls | Obieo',
    description: 'Specialized SEO for electrical contractors that gets you found for emergency calls.',
  },
  alternates: {
    canonical: 'https://obieo.com/electrical',
  },
}

export default function ElectricalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
