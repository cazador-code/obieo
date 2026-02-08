/**
 * Shared editorial components for blog posts and pillar pages.
 * These provide consistent styling across all long-form content.
 */

import Link from 'next/link'

// --- Props Types ---

interface PullQuoteProps {
  children: React.ReactNode
}

interface KeyInsightProps {
  title: string
  children: React.ReactNode
}

interface DataCardProps {
  label: string
  value: string
  subtext?: string
  variant?: 'default' | 'highlight' | 'warning'
}

interface ParagraphProps {
  children: React.ReactNode
  lead?: boolean
}

interface SectionHeadingProps {
  id?: string
  children: React.ReactNode
}

interface SubHeadingProps {
  children: React.ReactNode
}

interface InlineLinkProps {
  href: string
  external?: boolean
  children: React.ReactNode
}

interface NumberedStepProps {
  number: number
  title: string
  children: React.ReactNode
}

interface TableOfContentsProps {
  sections: Array<{ id: string; title: string }>
}

// --- Components ---

export function PullQuote({ children }: PullQuoteProps): React.ReactElement {
  return (
    <blockquote className="relative my-12 md:my-16 py-8 md:py-12">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--accent)] to-[var(--accent)]/20" />
      <div className="absolute -left-4 top-6 w-12 h-12 text-[var(--accent)]/10">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      <p className="pl-8 md:pl-12 text-2xl md:text-3xl lg:text-4xl font-[family-name:var(--font-display)] text-[var(--text-primary)] leading-snug font-medium">
        {children}
      </p>
    </blockquote>
  )
}

export function KeyInsight({ title, children }: KeyInsightProps): React.ReactElement {
  return (
    <div className="my-10 md:my-14 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10 border border-[var(--accent)]/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider">{title}</span>
        </div>
        <div className="text-lg md:text-xl text-[var(--text-primary)] leading-relaxed font-medium">
          {children}
        </div>
      </div>
    </div>
  )
}

const DATA_CARD_BG_STYLES: Record<DataCardProps['variant'] & string, string> = {
  default: 'bg-[var(--bg-secondary)] border-[var(--border)]',
  highlight: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30',
}

const DATA_CARD_VALUE_STYLES: Record<DataCardProps['variant'] & string, string> = {
  default: 'text-[var(--text-primary)]',
  highlight: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
}

export function DataCard({ label, value, subtext, variant = 'default' }: DataCardProps): React.ReactElement {
  return (
    <div className={`p-5 md:p-6 rounded-xl border ${DATA_CARD_BG_STYLES[variant]} transition-transform hover:scale-[1.02]`}>
      <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] ${DATA_CARD_VALUE_STYLES[variant]}`}>{value}</p>
      {subtext && <p className="text-sm text-[var(--text-secondary)] mt-2">{subtext}</p>}
    </div>
  )
}

export function Paragraph({ children, lead = false }: ParagraphProps): React.ReactElement {
  const textSize = lead ? 'text-xl md:text-2xl leading-relaxed' : 'text-lg leading-relaxed'
  return (
    <p className={`${textSize} text-[var(--text-secondary)] mb-6`}>
      {children}
    </p>
  )
}

export function SectionHeading({ id, children }: SectionHeadingProps): React.ReactElement {
  return (
    <h2
      id={id}
      className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mt-16 md:mt-20 mb-6 md:mb-8 relative"
    >
      <span className="absolute -left-4 md:-left-6 top-0 bottom-0 w-1 bg-[var(--accent)]" />
      {children}
    </h2>
  )
}

export function SubHeading({ children }: SubHeadingProps): React.ReactElement {
  return (
    <h3 className="text-xl md:text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mt-12 mb-4">
      {children}
    </h3>
  )
}

export function InlineLink({ href, external = false, children }: InlineLinkProps): React.ReactElement {
  return (
    <Link
      href={href}
      className="text-[var(--accent)] font-medium border-b-2 border-[var(--accent)]/30 hover:border-[var(--accent)] transition-colors"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </Link>
  )
}

export function NumberedStep({ number, title, children }: NumberedStepProps): React.ReactElement {
  return (
    <div className="flex gap-5 md:gap-6 py-6 first:pt-0 last:pb-0">
      <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white font-bold text-xl md:text-2xl font-[family-name:var(--font-display)] shadow-lg shadow-[var(--accent)]/20">
        {number}
      </div>
      <div className="flex-1 pt-1">
        <h4 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-2 font-[family-name:var(--font-display)]">{title}</h4>
        <div className="text-[var(--text-secondary)] leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export function BlogTableOfContents({ sections }: TableOfContentsProps): React.ReactElement {
  return (
    <nav className="my-10 p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
      <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">In This Guide</p>
      <ol className="space-y-2">
        {sections.map((section, i) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="flex items-center gap-3 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              <span className="text-xs font-bold text-[var(--accent)]">{String(i + 1).padStart(2, '0')}</span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
