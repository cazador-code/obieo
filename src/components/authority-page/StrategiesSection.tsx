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
  accentColor,
}: StrategiesSectionProps) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    violet: 'bg-violet-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    amber: 'bg-amber-600',
    emerald: 'bg-emerald-600',
    cyan: 'bg-cyan-600',
    pink: 'bg-pink-600',
    indigo: 'bg-indigo-600',
  }

  const bgColor = colorClasses[accentColor] || colorClasses.blue

  return (
    <section id="strategies" className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Proven {industryName} SEO Strategies
      </h2>

      <div className="space-y-8">
        {strategies.map((strategy, index) => (
          <article key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Strategy Header */}
            <div className={`${bgColor} px-6 py-4`}>
              <h3 className="text-lg font-semibold text-white">
                Strategy {index + 1}: {strategy.title}
              </h3>
            </div>

            <div className="p-6">
              {/* Why This Matters */}
              <p className="text-gray-700 mb-4">{strategy.why}</p>

              {/* Action Steps */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Action Steps
                </h4>
                <ol className="space-y-2">
                  {strategy.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start">
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-full ${bgColor} text-white text-sm flex items-center justify-center mr-3`}
                      >
                        {stepIndex + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Pro Tip */}
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r">
                <p className="text-sm font-semibold text-amber-800 mb-1">Pro Tip</p>
                <p className="text-sm text-amber-900">{strategy.proTip}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
