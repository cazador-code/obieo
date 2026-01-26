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
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mb-6">{title}</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--bg-secondary)]">
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-secondary)] border-b border-[var(--border)]">
                Metric
              </th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-secondary)] border-b border-[var(--border)]">
                Value
              </th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-secondary)] border-b border-[var(--border)]">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => (
              <tr key={index} className="border-b border-[var(--border-light)] last:border-b-0">
                <td className="px-4 py-3 text-[var(--text-primary)]">{stat.metric}</td>
                <td className="px-4 py-3 font-semibold text-[var(--accent)]">{stat.value}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                  {stat.url ? (
                    <a
                      href={stat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline"
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
