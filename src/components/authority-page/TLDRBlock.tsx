/**
 * TL;DR Block Component
 * CITABLE compliant - first extractable content block for AI
 */

interface TLDRBlockProps {
  content: string
  accentColor: string
}

export function TLDRBlock({ content, accentColor }: TLDRBlockProps) {
  const colorClasses: Record<string, string> = {
    red: 'border-red-500 bg-red-50',
    blue: 'border-blue-500 bg-blue-50',
    violet: 'border-violet-500 bg-violet-50',
    green: 'border-green-500 bg-green-50',
    orange: 'border-orange-500 bg-orange-50',
    amber: 'border-amber-500 bg-amber-50',
    emerald: 'border-emerald-500 bg-emerald-50',
    cyan: 'border-cyan-500 bg-cyan-50',
    pink: 'border-pink-500 bg-pink-50',
    indigo: 'border-indigo-500 bg-indigo-50',
  }

  return (
    <div
      className={`border-l-4 p-6 rounded-r-lg mb-8 ${colorClasses[accentColor] || colorClasses.blue}`}
    >
      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
        TL;DR
      </p>
      <p className="text-lg text-gray-800 leading-relaxed">{content}</p>
    </div>
  )
}
