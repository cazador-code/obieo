/**
 * TL;DR Block Component
 * CITABLE compliant - first extractable content block for AI
 */

interface TLDRBlockProps {
  content: string
  accentColor: string
}

export function TLDRBlock({ content }: TLDRBlockProps) {
  return (
    <div className="border-l-4 border-[var(--accent)] bg-[var(--accent)]/5 p-6 rounded-r-lg mb-8">
      <p className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wide mb-2">
        TL;DR
      </p>
      <p className="text-lg text-[var(--text-primary)] leading-relaxed">{content}</p>
    </div>
  )
}
