/**
 * Authority CTA Component
 * Call-to-action linking to conversion landing page
 */

import Link from 'next/link'

interface AuthorityCTAProps {
  industryName: string
  landingPageSlug: string
  accentColor: string
}

export function AuthorityCTA({
  industryName,
  landingPageSlug,
}: AuthorityCTAProps) {
  return (
    <section id="cta" className="mb-12">
      <div className="bg-[var(--accent)] rounded-xl p-8 md:p-12 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-white mb-4">
          Ready to Dominate {industryName} Search Results?
        </h2>

        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Get a free SEO audit and discover exactly how your {industryName.toLowerCase()} company
          can rank higher on Google and AI search platforms like ChatGPT and Perplexity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={landingPageSlug}
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-[var(--accent)] font-semibold rounded-lg hover:bg-white/90 transition-colors"
          >
            Get Your Free SEO Audit
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          <Link
            href="/quiz"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
          >
            Take the AI Visibility Quiz
          </Link>
        </div>
      </div>
    </section>
  )
}
