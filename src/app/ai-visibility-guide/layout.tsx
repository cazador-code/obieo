import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Is ChatGPT Recommending You? Free AI Visibility Check | Obieo',
  description:
    'Check if AI assistants like ChatGPT recommend your business or your competitors. Learn what makes AI recommend certain home service companies and how to improve your AI visibility.',
  openGraph: {
    title: 'Is ChatGPT Recommending You or Your Competitors?',
    description:
      'Homeowners are asking AI for recommendations. AI picks 2-3 businesses. Find out if you\'re one of them.',
  },
}

export default function AIVisibilityGuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
