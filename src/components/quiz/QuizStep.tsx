'use client'

import { motion } from 'framer-motion'
import { QuizQuestion } from './types'

interface QuizStepProps {
  question: QuizQuestion
  selectedValue?: string
  onSelect: (value: string) => void
  stepNumber: number
  totalSteps: number
}

export function QuizStep({
  question,
  selectedValue,
  onSelect,
  stepNumber,
  totalSteps,
}: QuizStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
          <span>Question {stepNumber} of {totalSteps}</span>
          <span>{Math.round((stepNumber / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--accent)]"
            initial={{ width: 0 }}
            animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8">
        {question.question}
      </h2>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option, i) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(option.value)}
            className={`
              w-full p-4 text-left rounded-xl border-2 transition-all
              ${
                selectedValue === option.value
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-[var(--border)] hover:border-[var(--accent)]/50 bg-[var(--bg-card)]'
              }
            `}
          >
            <span className="text-lg text-[var(--text-primary)]">
              {option.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
