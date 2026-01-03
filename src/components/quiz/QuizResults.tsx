'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Counter } from '@/components/animations'
import { Button, Input } from '@/components/ui'
import { QuizAnswers } from './types'
import { getScoreCategory, getInsights } from './data'

interface QuizResultsProps {
  score: number
  answers: QuizAnswers
  onSubmit: (data: { name: string; email: string; website?: string }) => Promise<void>
}

const categoryLabels = {
  poor: 'Needs Major Work',
  'needs-work': 'Needs Improvement',
  good: 'Good Foundation',
  excellent: 'Looking Strong',
}

const categoryColors = {
  poor: 'text-red-500',
  'needs-work': 'text-orange-500',
  good: 'text-[var(--accent)]',
  excellent: 'text-green-500',
}

export function QuizResults({ score, answers, onSubmit }: QuizResultsProps) {
  const [formData, setFormData] = useState({ name: '', email: '', website: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const category = getScoreCategory(score)
  const insights = getInsights(answers as unknown as Record<string, string>)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email) {
      setError('Email is required')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setIsSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Score Display */}
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          Your Website Score
        </p>
        <div className="inline-flex items-baseline gap-1 mb-2">
          <span className={`text-7xl md:text-8xl font-bold ${categoryColors[category]}`}>
            <Counter value={score} duration={1.5} />
          </span>
          <span className="text-3xl text-[var(--text-muted)]">/100</span>
        </div>
        <p className={`text-xl font-medium ${categoryColors[category]}`}>
          {categoryLabels[category]}
        </p>
      </div>

      {/* Insights */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 md:p-8 mb-8">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Based on your answers:
        </h3>
        <ul className="space-y-3">
          {insights.map((insight, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex gap-3"
            >
              <span className="text-[var(--accent)]">→</span>
              <span className="text-[var(--text-secondary)]">{insight}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Lead Capture Form */}
      {!isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]"
        >
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Want the full picture?
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Get a free, personalized website audit with specific recommendations
            for your business.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Website URL (optional)"
              placeholder="https://yoursite.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Get My Free Audit'}
            </Button>
          </form>

          <p className="text-xs text-[var(--text-muted)] text-center mt-4">
            We&apos;ll review your site and send personalized recommendations within 24 hours.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--bg-card)] rounded-2xl p-8 md:p-12 border border-[var(--border)] text-center"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            You&apos;re all set!
          </h3>
          <p className="text-[var(--text-secondary)]">
            Check your inbox—we&apos;ll send your personalized audit within 24 hours.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
