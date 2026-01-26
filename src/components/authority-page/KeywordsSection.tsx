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
      color: 'bg-red-100 text-red-800',
    },
    {
      title: 'Location Keywords',
      description: 'Geo-modified keywords for local search visibility',
      items: keywords.location,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Service Keywords',
      description: 'Specific service types customers search for',
      items: keywords.service,
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Long-Tail Keywords',
      description: 'Specific queries with lower competition and higher intent',
      items: keywords.longTail,
      color: 'bg-purple-100 text-purple-800',
    },
  ]

  return (
    <section id="keywords" className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Essential {industryName} Keywords
      </h2>

      <p className="text-gray-700 mb-6">
        The most valuable keywords for {industryName.toLowerCase()} companies fall into four
        categories based on search intent. Understanding these categories helps prioritize
        your content and SEO efforts.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div key={category.title} className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{category.description}</p>

            <div className="flex flex-wrap gap-2">
              {category.items.map((keyword, index) => (
                <span
                  key={index}
                  className={`inline-block px-3 py-1 rounded-full text-sm ${category.color}`}
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
