/**
 * Industry Landscape Component
 * Market overview with trends and seasonality
 * CITABLE compliant - 200-400 word semantic block
 */

interface IndustryLandscapeProps {
  industryName: string
  marketSize: string
  marketSizeSource: string
  growth: string
  trends: string[]
  seasonal?: string
}

export function IndustryLandscape({
  industryName,
  marketSize,
  marketSizeSource,
  growth,
  trends,
  seasonal,
}: IndustryLandscapeProps) {
  return (
    <section id="industry-landscape" className="mb-12">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mb-6">
        {industryName} Industry Landscape
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Market Size Card */}
        <div className="bg-[var(--accent)]/10 rounded-lg p-6 border border-[var(--accent)]/20">
          <p className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wide mb-2">
            Market Size
          </p>
          <p className="text-3xl font-bold text-[var(--text-primary)] mb-2">{marketSize}</p>
          <p className="text-sm text-[var(--text-muted)]">{marketSizeSource}</p>
        </div>

        {/* Growth Card */}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
            Growth Outlook
          </p>
          <p className="text-lg text-[var(--text-primary)]">{growth}</p>
        </div>
      </div>

      {/* Industry Trends */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Key Industry Trends</h3>
        <ul className="space-y-2">
          {trends.map((trend, index) => (
            <li key={index} className="flex items-start">
              <span className="text-[var(--accent)] mr-2">→</span>
              <span className="text-[var(--text-secondary)]">{trend}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Seasonal Patterns */}
      {seasonal && (
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
            Seasonal Patterns
          </p>
          <p className="text-[var(--text-primary)]">{seasonal}</p>
        </div>
      )}
    </section>
  )
}
