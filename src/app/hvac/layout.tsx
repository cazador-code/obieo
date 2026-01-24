import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HVAC Marketing Agency | SEO for HVAC Companies | Obieo',
  description: 'HVAC marketing that works in slow seasons and busy seasons. Specialized SEO for HVAC companies with +504% YoY growth. Book a free strategy call.',
  keywords: ['hvac marketing agencies', 'hvac marketing', 'seo for hvac company', 'hvac seo company', 'hvac advertising'],
  openGraph: {
    title: 'HVAC Marketing Agency | SEO for HVAC Companies | Obieo',
    description: 'HVAC marketing that works in slow seasons and busy seasons. Specialized SEO for HVAC companies with +504% YoY growth.',
    url: 'https://obieo.com/hvac',
    siteName: 'Obieo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HVAC Marketing Agency | SEO for HVAC Companies | Obieo',
    description: 'HVAC marketing that works in slow seasons and busy seasons.',
  },
  alternates: {
    canonical: 'https://obieo.com/hvac',
  },
}

export default function HVACLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
