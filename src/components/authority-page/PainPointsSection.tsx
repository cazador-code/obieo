/**
 * Pain Points Section Component
 * Displays 5-7 industry pain points with stats
 * Each pain point is a 200-400 word semantic block
 */

interface PainPoint {
  title: string
  problem: string
  impact: string
  stat: string
  statSource: string
  solutionTeaser: string
}

interface PainPointsSectionProps {
  industryName: string
  painPoints: PainPoint[]
  accentColor: string
}

export function PainPointsSection({
  industryName,
  painPoints,
}: PainPointsSectionProps) {
  return (
    <section id="pain-points" className="mb-12">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mb-6">
        Common {industryName} SEO Challenges
      </h2>

      <div className="space-y-6">
        {painPoints.map((point, index) => (
          <article
            key={index}
            className="border border-[var(--border)] rounded-lg p-6 bg-[var(--bg-card)] hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
              {index + 1}. {point.title}
            </h3>

            <p className="text-[var(--text-secondary)] mb-3">{point.problem}</p>

            <p className="text-[var(--text-secondary)] mb-4">{point.impact}</p>

            {/* Stat callout */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-[var(--accent)]">{point.stat}</span>
              <span className="text-sm text-[var(--text-muted)]">— {point.statSource}</span>
            </div>

            {/* Solution teaser */}
            <p className="text-sm text-[var(--text-muted)] italic">
              Solution: {point.solutionTeaser}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
