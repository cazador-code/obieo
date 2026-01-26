/**
 * Strategies Section Component
 * Actionable SEO strategies with steps and pro tips
 * Maps to HowTo schema
 */

interface Strategy {
  title: string
  why: string
  steps: string[]
  proTip: string
}

interface StrategiesSectionProps {
  industryName: string
  strategies: Strategy[]
  accentColor: string
}

export function StrategiesSection({
  industryName,
  strategies,
}: StrategiesSectionProps) {
  return (
    <section id="strategies" className="mb-12">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mb-6">
        Proven {industryName} SEO Strategies
      </h2>

      <div className="space-y-8">
        {strategies.map((strategy, index) => (
          <article key={index} className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-card)]">
            {/* Strategy Header */}
            <div className="bg-[var(--accent)] px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                Strategy {index + 1}: {strategy.title}
              </h3>
            </div>

            <div className="p-6">
              {/* Why This Matters */}
              <p className="text-[var(--text-secondary)] mb-4">{strategy.why}</p>

              {/* Action Steps */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
                  Action Steps
                </h4>
                <ol className="space-y-2">
                  {strategy.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent)] text-white text-sm flex items-center justify-center mr-3"
                      >
                        {stepIndex + 1}
                      </span>
                      <span className="text-[var(--text-secondary)]">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Pro Tip */}
              <div className="bg-[var(--accent)]/10 border-l-4 border-[var(--accent)] p-4 rounded-r">
                <p className="text-sm font-semibold text-[var(--accent)] mb-1">Pro Tip</p>
                <p className="text-sm text-[var(--text-secondary)]">{strategy.proTip}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
