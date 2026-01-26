/**
 * Definition Section Component
 * First 40-60 words are AI-extractable definition
 * CITABLE compliant semantic block
 */

interface DefinitionSectionProps {
  industryName: string
  direct: string
  expanded: string
}

export function DefinitionSection({ industryName, direct, expanded }: DefinitionSectionProps) {
  return (
    <section id="what-is" className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        What Is {industryName} SEO?
      </h2>

      {/* Direct definition - extractable by AI (40-60 words) */}
      <p className="text-lg text-gray-800 leading-relaxed mb-4">
        {direct}
      </p>

      {/* Expanded explanation (100-150 words) */}
      <p className="text-gray-700 leading-relaxed">
        {expanded}
      </p>
    </section>
  )
}
