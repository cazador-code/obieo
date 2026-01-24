import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Garage Door SEO Services | Get More Repair & Install Leads | Obieo',
  description: 'Specialized SEO for garage door companies that gets you found for emergency repairs and new installations. Local SEO for garage door services. Book a free call.',
  keywords: ['garage door seo', 'seo for garage door companies', 'garage door marketing', 'garage door repair marketing', 'local seo for garage door services'],
  openGraph: {
    title: 'Garage Door SEO Services | Get More Repair & Install Leads | Obieo',
    description: 'Specialized SEO for garage door companies that gets you found for repairs and installations.',
    url: 'https://obieo.com/garage-doors',
    siteName: 'Obieo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garage Door SEO Services | Get More Repair & Install Leads | Obieo',
    description: 'Specialized SEO for garage door companies.',
  },
  alternates: {
    canonical: 'https://obieo.com/garage-doors',
  },
}

export default function GarageDoorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
