/**
 * Stats Table Component
 * Displays industry statistics with sources for credibility
 * CITABLE compliant - specific numbers with attributions
 */

interface Stat {
  metric: string
  value: string
  source: string
  year: number
  url?: string
}

interface StatsTableProps {
  stats: Stat[]
  title?: string
}

export function StatsTable({ stats, title = 'Key Industry Statistics' }: StatsTableProps) {
  return (
    <section id="statistics" className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b">
                Metric
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b">
                Value
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => (
              <tr key={index} className="border-b last:border-b-0">
                <td className="px-4 py-3 text-gray-800">{stat.metric}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{stat.value}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {stat.url ? (
                    <a
                      href={stat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {stat.source} ({stat.year})
                    </a>
                  ) : (
                    <span>{stat.source} ({stat.year})</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
