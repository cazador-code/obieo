# Premium Redesign Phase 5: Quiz Funnel

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the multi-step assessment quiz with scoring, results page, and lead capture.

**Architecture:** Client-side quiz state management, Framer Motion step transitions, weighted scoring algorithm, form submission to Sanity with email notification.

**Tech Stack:** React, Framer Motion, Sanity (for lead storage)

**Depends on:** Phase 1-4 complete

---

## Task 1: Create Quiz Types and Data

**Files:**
- Create: `src/components/quiz/types.ts`
- Create: `src/components/quiz/data.ts`

**Step 1: Create quiz types**

Create `src/components/quiz/types.ts`:
```typescript
export interface QuizOption {
  label: string
  value: string
  score: number // Weight for scoring
}

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
}

export interface QuizAnswers {
  industry: string
  hasWebsite: string
  leadSource: string
  frustration: string
  goals: string
}

export interface QuizResult {
  score: number
  category: 'poor' | 'needs-work' | 'good' | 'excellent'
  insights: string[]
}

export interface LeadData {
  name: string
  email: string
  website?: string
  phone?: string
  answers: QuizAnswers
  score: number
}
```

**Step 2: Create quiz questions data**

Create `src/components/quiz/data.ts`:
```typescript
import { QuizQuestion } from './types'

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'industry',
    question: 'What type of home service business do you run?',
    options: [
      { label: 'Roofing', value: 'roofing', score: 10 },
      { label: 'HVAC', value: 'hvac', score: 10 },
      { label: 'Plumbing', value: 'plumbing', score: 10 },
      { label: 'Electrical', value: 'electrical', score: 10 },
      { label: 'Landscaping', value: 'landscaping', score: 10 },
      { label: 'Other', value: 'other', score: 10 },
    ],
  },
  {
    id: 'hasWebsite',
    question: 'Do you have a website currently?',
    options: [
      { label: "Yes, but it's outdated", value: 'outdated', score: 5 },
      { label: "Yes, it's decent but not great", value: 'decent', score: 15 },
      { label: 'Yes, professionally built', value: 'professional', score: 25 },
      { label: 'No website yet', value: 'none', score: 0 },
    ],
  },
  {
    id: 'leadSource',
    question: 'How are you getting leads right now?',
    options: [
      { label: 'Word of mouth only', value: 'referrals', score: 5 },
      { label: 'Some online, mostly referrals', value: 'mixed-referrals', score: 15 },
      { label: 'Paid ads (Google, Facebook)', value: 'paid', score: 10 },
      { label: 'Mix of organic and paid', value: 'balanced', score: 25 },
    ],
  },
  {
    id: 'frustration',
    question: "What's your biggest frustration with your online presence?",
    options: [
      { label: 'Not showing up on Google', value: 'seo', score: 5 },
      { label: 'Website looks unprofessional', value: 'design', score: 10 },
      { label: 'Getting traffic but no calls', value: 'conversion', score: 15 },
      { label: "Don't know what's wrong", value: 'unknown', score: 0 },
    ],
  },
  {
    id: 'goals',
    question: 'What would success look like in 6 months?',
    options: [
      { label: '2x my current leads', value: 'double', score: 20 },
      { label: 'Dominate local search', value: 'seo-dominant', score: 20 },
      { label: 'Look more professional than competitors', value: 'professional', score: 15 },
      { label: 'All of the above', value: 'all', score: 25 },
    ],
  },
]

export function calculateScore(answers: Record<string, string>): number {
  let total = 0
  quizQuestions.forEach((question) => {
    const answer = answers[question.id]
    const option = question.options.find((o) => o.value === answer)
    if (option) {
      total += option.score
    }
  })
  return total
}

export function getScoreCategory(score: number): 'poor' | 'needs-work' | 'good' | 'excellent' {
  if (score < 30) return 'poor'
  if (score < 55) return 'needs-work'
  if (score < 75) return 'good'
  return 'excellent'
}

export function getInsights(answers: Record<string, string>): string[] {
  const insights: string[] = []

  if (answers.hasWebsite === 'none' || answers.hasWebsite === 'outdated') {
    insights.push("Your website is your 24/7 salesperson—it needs to work harder for you.")
  }

  if (answers.leadSource === 'referrals') {
    insights.push("Relying solely on referrals limits your growth potential.")
  }

  if (answers.frustration === 'seo') {
    insights.push("If customers can't find you on Google, they're finding your competitors instead.")
  }

  if (answers.frustration === 'conversion') {
    insights.push("Traffic without conversions means your website isn't built to sell.")
  }

  if (answers.goals === 'all') {
    insights.push("You have ambitious goals—that's a great sign you're ready to invest in growth.")
  }

  // Always add a positive note
  if (insights.length === 0) {
    insights.push("You have a solid foundation—small improvements can drive big results.")
  }

  return insights.slice(0, 3) // Max 3 insights
}
```

**Step 3: Commit**

```bash
git add src/components/quiz/
git commit -m "feat: add quiz types and question data with scoring"
```

---

## Task 2: Create Quiz Step Component

**Files:**
- Create: `src/components/quiz/QuizStep.tsx`

**Step 1: Create QuizStep component**

Create `src/components/quiz/QuizStep.tsx`:
```typescript
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
```

**Step 2: Commit**

```bash
git add src/components/quiz/QuizStep.tsx
git commit -m "feat: add QuizStep component with animated options"
```

---

## Task 3: Create Quiz Results Component

**Files:**
- Create: `src/components/quiz/QuizResults.tsx`

**Step 1: Create QuizResults component**

Create `src/components/quiz/QuizResults.tsx`:
```typescript
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
    } catch (err) {
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
            We'll review your site and send personalized recommendations within 24 hours.
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
            You're all set!
          </h3>
          <p className="text-[var(--text-secondary)]">
            Check your inbox—we'll send your personalized audit within 24 hours.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/quiz/QuizResults.tsx
git commit -m "feat: add QuizResults component with lead capture form"
```

---

## Task 4: Create Main Quiz Container

**Files:**
- Create: `src/components/quiz/Quiz.tsx`
- Create: `src/components/quiz/index.ts`

**Step 1: Create Quiz container component**

Create `src/components/quiz/Quiz.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { QuizStep } from './QuizStep'
import { QuizResults } from './QuizResults'
import { quizQuestions, calculateScore } from './data'
import { QuizAnswers } from './types'
import { Button } from '@/components/ui'

export function Quiz() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = quizQuestions[currentStep]
  const isLastStep = currentStep === quizQuestions.length - 1

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)

    // Auto-advance after short delay
    setTimeout(() => {
      if (isLastStep) {
        setIsComplete(true)
      } else {
        setCurrentStep((prev) => prev + 1)
      }
    }, 300)
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmitLead = async (data: { name: string; email: string; website?: string }) => {
    const score = calculateScore(answers as Record<string, string>)

    // Submit to API route (which will save to Sanity)
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        answers,
        score,
        source: 'quiz',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to submit')
    }
  }

  const score = calculateScore(answers as Record<string, string>)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <div key={`step-${currentStep}`}>
            <QuizStep
              question={currentQuestion}
              selectedValue={answers[currentQuestion.id as keyof QuizAnswers]}
              onSelect={handleSelect}
              stepNumber={currentStep + 1}
              totalSteps={quizQuestions.length}
            />

            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="mt-8 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
        ) : (
          <QuizResults
            key="results"
            score={score}
            answers={answers as QuizAnswers}
            onSubmit={handleSubmitLead}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
```

**Step 2: Create index export**

Create `src/components/quiz/index.ts`:
```typescript
export { Quiz } from './Quiz'
export { QuizStep } from './QuizStep'
export { QuizResults } from './QuizResults'
export * from './types'
export * from './data'
```

**Step 3: Commit**

```bash
git add src/components/quiz/
git commit -m "feat: add Quiz container component with step management"
```

---

## Task 5: Create Quiz API Route

**Files:**
- Create: `src/app/api/leads/route.ts`

**Step 1: Create API route for lead submission**

Create `src/app/api/leads/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, website, phone, answers, score, source } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Create lead in Sanity
    const lead = await client.create({
      _type: 'lead',
      name: name || '',
      email,
      website: website || '',
      phone: phone || '',
      source: source || 'quiz',
      quizAnswers: answers || {},
      score: score || 0,
      status: 'new',
      createdAt: new Date().toISOString(),
    })

    // TODO: Send email notification (integrate with Resend, SendGrid, etc.)
    // await sendNotificationEmail({ name, email, score, answers })

    return NextResponse.json({ success: true, id: lead._id })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/leads/
git commit -m "feat: add leads API route for quiz submissions"
```

---

## Task 6: Create Quiz Page

**Files:**
- Create: `src/app/quiz/page.tsx`

**Step 1: Create quiz page**

Create `src/app/quiz/page.tsx`:
```typescript
import type { Metadata } from 'next'
import Link from 'next/link'
import { Quiz } from '@/components/quiz'

export const metadata: Metadata = {
  title: 'Free Website Score | Obieo',
  description: 'Take our free 2-minute assessment to get your personalized website score and see what\'s holding your business back online.',
}

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
      {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]"
          >
            Obieo
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ✕ Close
          </Link>
        </div>
      </header>

      {/* Quiz content */}
      <main className="pt-16 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
              Let's see how your website stacks up
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Answer 5 quick questions to get your personalized website score.
            </p>
          </div>

          <Quiz />
        </div>
      </main>
    </div>
  )
}
```

**Step 2: Override layout for quiz page (optional minimal layout)**

The quiz page uses the main layout but has its own fixed header. This works well as-is, but we could create a separate layout if needed.

**Step 3: Test quiz flow**

Run:
```bash
npm run dev
```

Navigate to: http://localhost:3000/quiz

Test:
- [ ] Quiz loads with first question
- [ ] Clicking option advances to next question
- [ ] Progress bar updates
- [ ] Back button works
- [ ] Results show score and insights
- [ ] Form submission works (check console/network)

**Step 4: Commit**

```bash
git add src/app/quiz/
git commit -m "feat: add quiz page with minimal header"
```

---

## Task 7: Final Phase 5 Verification

**Step 1: Run build**

```bash
npm run build
```

**Step 2: Test complete flow**

- [ ] Navigate to /quiz
- [ ] Answer all 5 questions
- [ ] See animated score result
- [ ] See personalized insights
- [ ] Submit lead capture form
- [ ] See success message

**Step 3: Commit completion**

```bash
git add -A
git commit -m "chore: phase 5 quiz funnel complete"
```

---

## Phase 5 Complete

Quiz funnel implemented:
- ✅ 5-step assessment quiz
- ✅ Animated step transitions
- ✅ Progress bar
- ✅ Weighted scoring algorithm
- ✅ Personalized insights
- ✅ Animated score display
- ✅ Lead capture form
- ✅ API route for Sanity submission
- ✅ Dedicated quiz page with minimal header

**Next:** Phase 6 - Connect Work/Portfolio to Sanity CMS
