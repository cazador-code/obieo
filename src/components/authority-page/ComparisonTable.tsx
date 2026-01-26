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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {industryName} SEO vs. Paid Advertising
      </h2>

      <p className="text-gray-700 mb-6">
        Should {industryName.toLowerCase()} companies invest in SEO or paid ads? Here is how
        they compare for typical {industryName.toLowerCase()} businesses:
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b">
                Factor
              </th>
              <th className="text-left px-4 py-3 font-semibold text-green-700 border-b bg-green-50">
                SEO
              </th>
              <th className="text-left px-4 py-3 font-semibold text-blue-700 border-b bg-blue-50">
                Paid Ads
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 font-medium text-gray-900 border-b">
                  {row.factor}
                </td>
                <td className="px-4 py-3 text-gray-700 border-b">{row.seo}</td>
                <td className="px-4 py-3 text-gray-700 border-b">{row.ads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>Our Recommendation:</strong> For most {industryName.toLowerCase()} companies,
          SEO provides better long-term ROI. Paid ads can supplement SEO during peak seasons
          or while building organic visibility.
        </p>
      </div>
    </section>
  )
}
