/**
 * Keywords Section Component
 * Displays keywords organized by intent category
 * CITABLE compliant - structured for AI extraction
 */

interface KeywordsProps {
  industryName: string
  keywords: {
    emergency: string[]
    location: string[]
    service: string[]
    longTail: string[]
  }
}

export function KeywordsSection({ industryName, keywords }: KeywordsProps) {
  const categories = [
    {
      title: 'Emergency Keywords',
      description: 'High-intent keywords from customers needing immediate help',
      items: keywords.emergency,
      tagClass: 'bg-red-500/10 text-red-600 border border-red-500/20',
    },
    {
      title: 'Location Keywords',
      description: 'Geo-modified keywords for local search visibility',
      items: keywords.location,
      tagClass: 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20',
    },
    {
      title: 'Service Keywords',
      description: 'Specific service types customers search for',
      items: keywords.service,
      tagClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    },
    {
      title: 'Long-Tail Keywords',
      description: 'Specific queries with lower competition and higher intent',
      items: keywords.longTail,
      tagClass: 'bg-violet-500/10 text-violet-600 border border-violet-500/20',
    },
  ]

  return (
    <section id="keywords" className="mb-12">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mb-6">
        Essential {industryName} Keywords
      </h2>

      <p className="text-[var(--text-secondary)] mb-6">
        The most valuable keywords for {industryName.toLowerCase()} companies fall into four
        categories based on search intent. Understanding these categories helps prioritize
        your content and SEO efforts.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div key={category.title} className="border border-[var(--border)] rounded-lg p-6 bg-[var(--bg-card)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{category.title}</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">{category.description}</p>

            <div className="flex flex-wrap gap-2">
              {category.items.map((keyword, index) => (
                <span
                  key={index}
                  className={`inline-block px-3 py-1 rounded-full text-sm ${category.tagClass}`}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
