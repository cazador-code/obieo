'use client'

import { motion } from 'framer-motion'
import { Counter } from '@/components/animations'
import { QuizAnalysisResult, AnalysisIssue } from './types'
import { useBookingModal } from '@/components/BookingModalContext'

interface AIVisibilityResultsProps {
  analysis: QuizAnalysisResult
  issues: AnalysisIssue[]
  businessName: string
  keyword: string
}

function ScoreGauge({
  score,
  label,
  delay = 0,
}: {
  score: number
  label: string
  delay?: number
}) {
  const getColor = (s: number) => {
    if (s >= 70) return 'text-green-500'
    if (s >= 50) return 'text-amber-500'
    return 'text-red-500'
  }

  const getBgColor = (s: number) => {
    if (s >= 70) return 'bg-green-500'
    if (s >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="text-center"
    >
      <div className="relative w-24 h-24 mx-auto mb-2">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-[var(--bg-secondary)]"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={getBgColor(score)}
            initial={{ strokeDasharray: '0 264' }}
            animate={{ strokeDasharray: `${(score / 100) * 264} 264` }}
            transition={{ duration: 1, delay: delay + 0.3 }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${getColor(score)}`}>
            <Counter value={score} duration={1.5} />
          </span>
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
    </motion.div>
  )
}

function IssueCard({ issue, index }: { issue: AnalysisIssue; index: number }) {
  const severityColors = {
    critical: 'border-red-500 bg-red-500/5',
    warning: 'border-amber-500 bg-amber-500/5',
    info: 'border-blue-500 bg-blue-500/5',
  }

  const severityIcons = {
    critical: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
      className={`p-4 rounded-lg border-l-4 ${severityColors[issue.severity]}`}
    >
      <div className="flex gap-3">
        {severityIcons[issue.severity]}
        <div className="flex-1">
          <h4 className="font-semibold text-[var(--text-primary)]">{issue.title}</h4>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{issue.description}</p>
          <p className="text-xs text-[var(--text-muted)] mt-2 italic">{issue.impact}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function AIVisibilityResults({
  analysis,
  issues,
  businessName,
  keyword,
}: AIVisibilityResultsProps) {
  const { openModal } = useBookingModal()

  const criticalIssues = issues.filter((i) => i.severity === 'critical')
  const warningIssues = issues.filter((i) => i.severity === 'warning')

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
          AI Visibility Report
        </h1>
        <p className="text-[var(--text-secondary)]">
          for <span className="font-semibold">{businessName}</span>
        </p>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 mb-8"
      >
        <div className="text-center mb-6">
          <p className="text-sm text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Overall AI Visibility Score
          </p>
          <div className="flex items-baseline justify-center gap-2">
            <span
              className={`text-7xl font-bold ${
                analysis.overallScore >= 70
                  ? 'text-green-500'
                  : analysis.overallScore >= 50
                  ? 'text-amber-500'
                  : 'text-red-500'
              }`}
            >
              <Counter value={analysis.overallScore} duration={2} />
            </span>
            <span className="text-2xl text-[var(--text-muted)]">/100</span>
          </div>
          <p className="text-[var(--text-secondary)] mt-2">
            {analysis.overallScore >= 70
              ? 'Good foundation - room to dominate'
              : analysis.overallScore >= 50
              ? 'Needs improvement - competitors are winning'
              : 'Critical gaps - invisible to AI search'}
          </p>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border)]">
          <ScoreGauge
            score={analysis.technical.performanceScore}
            label="Performance"
            delay={0.3}
          />
          <ScoreGauge
            score={analysis.technical.seoScore}
            label="SEO"
            delay={0.4}
          />
          <ScoreGauge
            score={analysis.aiVisibility.aiReadinessScore}
            label="AI Readiness"
            delay={0.5}
          />
        </div>
      </motion.div>

      {/* AI Visibility Section - The "Wow" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 mb-8"
      >
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          AI Search Analysis: &quot;{keyword}&quot;
        </h2>

        {/* Citation status */}
        <div
          className={`p-4 rounded-lg mb-6 ${
            analysis.aiVisibility.wasCited
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          <div className="flex items-start gap-3">
            {analysis.aiVisibility.wasCited ? (
              <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div>
              <p className={`font-semibold ${analysis.aiVisibility.wasCited ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.aiVisibility.wasCited
                  ? `${businessName} appears in AI search results`
                  : `${businessName} is NOT appearing in AI search results`}
              </p>
              {analysis.aiVisibility.citationContext && (
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  {analysis.aiVisibility.citationContext}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Competitors who ARE being cited */}
        {analysis.aiVisibility.competitors.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Who IS Being Cited Instead
            </h3>
            <div className="space-y-2">
              {analysis.aiVisibility.competitors.map((comp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg"
                >
                  <span className="w-6 h-6 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{comp.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{comp.reason}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Why not cited */}
        {analysis.aiVisibility.whyNotCited.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Why You&apos;re Not Appearing
            </h3>
            <ul className="space-y-2">
              {analysis.aiVisibility.whyNotCited.map((reason, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="flex items-start gap-2 text-[var(--text-secondary)]"
                >
                  <span className="text-red-500 mt-1">✗</span>
                  {reason}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {analysis.aiVisibility.recommendations.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              How to Start Getting Cited
            </h3>
            <ul className="space-y-2">
              {analysis.aiVisibility.recommendations.map((rec, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="flex items-start gap-2 text-[var(--text-secondary)]"
                >
                  <span className="text-[var(--accent)] mt-1">→</span>
                  {rec}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Issues Found */}
      {issues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 mb-8"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Issues Found
            <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
              ({criticalIssues.length} critical, {warningIssues.length} warnings)
            </span>
          </h2>

          <div className="space-y-3">
            {criticalIssues.slice(0, 5).map((issue, i) => (
              <IssueCard key={i} issue={issue} index={i} />
            ))}
            {warningIssues.slice(0, 3).map((issue, i) => (
              <IssueCard key={i + criticalIssues.length} issue={issue} index={i + criticalIssues.length} />
            ))}
          </div>

          {issues.length > 8 && (
            <p className="text-sm text-[var(--text-muted)] mt-4 text-center">
              + {issues.length - 8} more issues found
            </p>
          )}
        </motion.div>
      )}

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-2xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
          Want to Fix This?
        </h2>
        <p className="text-[var(--text-secondary)] mb-6 max-w-lg mx-auto">
          In a free 20-minute strategy call, I&apos;ll show you exactly how to get your business cited by AI search engines and start capturing leads your competitors are getting.
        </p>

        <div className="space-y-4">
          <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
            <li className="flex items-center gap-2 text-[var(--text-secondary)]">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Full competitor analysis
            </li>
            <li className="flex items-center gap-2 text-[var(--text-secondary)]">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Content gap report
            </li>
            <li className="flex items-center gap-2 text-[var(--text-secondary)]">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              90-day action plan
            </li>
            <li className="flex items-center gap-2 text-[var(--text-secondary)]">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              ROI projection
            </li>
          </ul>

          <button
            onClick={() => openModal('ai-quiz-results')}
            className="
              px-8 py-4 rounded-lg font-semibold text-white text-lg
              bg-[var(--accent)] hover:bg-[var(--accent-hover)]
              transition-all duration-200
              shadow-lg shadow-[var(--accent)]/25
            "
          >
            Book Your Free Strategy Call →
          </button>

          <p className="text-xs text-[var(--text-muted)]">
            No obligation. Just actionable insights.
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center text-sm text-[var(--text-muted)] mt-8"
      >
        Analysis completed on {new Date(analysis.analyzedAt).toLocaleDateString()}
      </motion.p>
    </div>
  )
}
