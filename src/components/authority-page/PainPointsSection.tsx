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
  accentColor,
}: PainPointsSectionProps) {
  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  }

  const colors = colorClasses[accentColor] || colorClasses.blue

  return (
    <section id="pain-points" className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Common {industryName} SEO Challenges
      </h2>

      <div className="space-y-6">
        {painPoints.map((point, index) => (
          <article
            key={index}
            className={`border rounded-lg p-6 ${colors.border} ${colors.bg}`}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {index + 1}. {point.title}
            </h3>

            <p className="text-gray-700 mb-3">{point.problem}</p>

            <p className="text-gray-700 mb-4">{point.impact}</p>

            {/* Stat callout */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-2xl font-bold ${colors.text}`}>{point.stat}</span>
              <span className="text-sm text-gray-600">— {point.statSource}</span>
            </div>

            {/* Solution teaser */}
            <p className="text-sm text-gray-600 italic">
              Solution: {point.solutionTeaser}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
