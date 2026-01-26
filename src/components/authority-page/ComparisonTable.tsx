/**
 * Comparison Table Component
 * SEO vs Paid Ads comparison for each industry
 * CITABLE compliant - structured data for AI extraction
 */

interface ComparisonRow {
  factor: string
  seo: string
  ads: string
}

interface ComparisonTableProps {
  industryName: string
  comparisons: ComparisonRow[]
}

export function ComparisonTable({ industryName, comparisons }: ComparisonTableProps) {
  return (
    <section id="seo-vs-ads" className="mb-12">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mb-6">
        {industryName} SEO vs. Paid Advertising
      </h2>

      <p className="text-[var(--text-secondary)] mb-6">
        Should {industryName.toLowerCase()} companies invest in SEO or paid ads? Here is how
        they compare for typical {industryName.toLowerCase()} businesses:
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-[var(--border)] rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[var(--bg-secondary)]">
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-secondary)] border-b border-[var(--border)]">
                Factor
              </th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--accent)] border-b border-[var(--border)] bg-[var(--accent)]/5">
                SEO
              </th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-secondary)] border-b border-[var(--border)]">
                Paid Ads
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-secondary)]'}>
                <td className="px-4 py-3 font-medium text-[var(--text-primary)] border-b border-[var(--border-light)]">
                  {row.factor}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)] border-b border-[var(--border-light)]">{row.seo}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)] border-b border-[var(--border-light)]">{row.ads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg">
        <p className="text-sm text-[var(--text-primary)]">
          <strong className="text-[var(--accent)]">Our Recommendation:</strong> For most {industryName.toLowerCase()} companies,
          SEO provides better long-term ROI. Paid ads can supplement SEO during peak seasons
          or while building organic visibility.
        </p>
      </div>
    </section>
  )
}
