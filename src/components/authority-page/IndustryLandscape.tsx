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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {industryName} Industry Landscape
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Market Size Card */}
        <div className="bg-blue-50 rounded-lg p-6">
          <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">
            Market Size
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{marketSize}</p>
          <p className="text-sm text-gray-600">{marketSizeSource}</p>
        </div>

        {/* Growth Card */}
        <div className="bg-green-50 rounded-lg p-6">
          <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">
            Growth Outlook
          </p>
          <p className="text-lg text-gray-800">{growth}</p>
        </div>
      </div>

      {/* Industry Trends */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Industry Trends</h3>
        <ul className="space-y-2">
          {trends.map((trend, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">→</span>
              <span className="text-gray-700">{trend}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Seasonal Patterns */}
      {seasonal && (
        <div className="bg-amber-50 rounded-lg p-6">
          <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2">
            Seasonal Patterns
          </p>
          <p className="text-gray-800">{seasonal}</p>
        </div>
      )}
    </section>
  )
}
