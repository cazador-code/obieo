import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SEO For Roofing Companies | Built By a Roofer | Obieo',
  description: 'We built an SEO system for our own roofing company. Now we\'ll install it in yours. +5 ranking positions and 66% more impressions in 30 days.',
  openGraph: {
    title: 'SEO For Roofing Companies | Built By a Roofer',
    description: 'We built an SEO system for our own roofing company. Now we\'ll install it in yours.',
  },
  robots: 'noindex, nofollow', // Don't index ad landing pages
}

export default function RoofingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Hide the main header/nav for this landing page funnel */}
      <style>{`
        header, nav, footer {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  )
}
