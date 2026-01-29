import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book Your Free Strategy Call',
  description: 'Schedule a free 20-minute call to discuss your home service business. No pitch, no pressure - just honest advice.',
  robots: 'noindex, nofollow',
}

export default function CallLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`
        header, nav, footer {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  )
}
