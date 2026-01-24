'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BusinessInput } from './BusinessInput'
import { EmailInput } from './EmailInput'
import { AIVisibilityResults } from './AIVisibilityResults'
import { Input } from '@/components/ui'
import {
  VerifiedBusiness,
  AIQuizInputs,
  QuizAnalysisResult,
  AnalysisIssue,
} from './types'

type QuizStep = 'business' | 'website' | 'qualifying' | 'contact' | 'analyzing' | 'results'

interface QuizState {
  business: VerifiedBusiness | null
  websiteUrl: string
  targetKeyword: string
  leadSource: AIQuizInputs['leadSource'] | ''
  monthlyLeadGoal: AIQuizInputs['monthlyLeadGoal'] | ''
  name: string
  email: string
  phone: string
  emailVerified: boolean
}

const leadSourceOptions = [
  { value: 'referrals', label: 'Word of mouth / Referrals only' },
  { value: 'mixed', label: 'Mix of referrals and online' },
  { value: 'paid', label: 'Paid ads (Google, Facebook)' },
  { value: 'organic', label: 'Organic search / SEO' },
  { value: 'none', label: "I'm just getting started" },
] as const

const leadGoalOptions = [
  { value: 'under-10', label: 'Under 10 leads/month' },
  { value: '10-25', label: '10-25 leads/month' },
  { value: '25-50', label: '25-50 leads/month' },
  { value: '50-plus', label: '50+ leads/month' },
] as const

export function AIVisibilityQuiz() {
  const [step, setStep] = useState<QuizStep>('business')
  const [state, setState] = useState<QuizState>({
    business: null,
    websiteUrl: '',
    targetKeyword: '',
    leadSource: '',
    monthlyLeadGoal: '',
    name: '',
    email: '',
    phone: '',
    emailVerified: false,
  })
  const [analysis, setAnalysis] = useState<QuizAnalysisResult | null>(null)
  const [issues, setIssues] = useState<AnalysisIssue[]>([])
  const [error, setError] = useState('')

  const updateState = useCallback((updates: Partial<QuizState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const runAnalysis = useCallback(async () => {
    if (!state.business || !state.websiteUrl || !state.targetKeyword) return

    setStep('analyzing')
    setError('')

    try {
      // Normalize URL - add https:// if missing
      let normalizedUrl = state.websiteUrl.trim()
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl
      }

      const response = await fetch('/api/quiz/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: state.business.name,
          websiteUrl: normalizedUrl,
          targetKeyword: state.targetKeyword,
          city: state.business.city,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysis(data.analysis)
      setIssues(data.issues || [])
      setStep('results')

      // Send notification email to hunter@obieo.com
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: state.name || 'Quiz Lead',
            email: state.email,
            phone: state.phone,
            website: normalizedUrl,
            source: 'ai-visibility-quiz',
            score: data.analysis.overallScore,
            aiQuizData: {
              business: state.business,
              websiteUrl: normalizedUrl,
              targetKeyword: state.targetKeyword,
              leadSource: state.leadSource,
              monthlyLeadGoal: state.monthlyLeadGoal,
              contact: {
                name: state.name,
                email: state.email,
                phone: state.phone || undefined,
              },
            },
            analysisResults: data.analysis,
            issues: data.issues,
          }),
        })
      } catch (emailErr) {
        console.error('Failed to send notification:', emailErr)
        // Don't block the user
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('contact') // Go back to let them retry
    }
  }, [state])

  const canProceedFromBusiness = state.business !== null
  const canProceedFromWebsite = state.websiteUrl.includes('.') && state.targetKeyword.length >= 3
  const canProceedFromQualifying = state.leadSource !== '' && state.monthlyLeadGoal !== ''
  const canProceedFromContact = state.email && state.emailVerified

  // Step navigation
  const goToNextStep = useCallback(() => {
    switch (step) {
      case 'business':
        if (canProceedFromBusiness) setStep('website')
        break
      case 'website':
        if (canProceedFromWebsite) setStep('qualifying')
        break
      case 'qualifying':
        if (canProceedFromQualifying) setStep('contact')
        break
      case 'contact':
        if (canProceedFromContact) {
          runAnalysis()
        }
        break
    }
  }, [step, canProceedFromBusiness, canProceedFromWebsite, canProceedFromQualifying, canProceedFromContact, runAnalysis])

  const goToPrevStep = useCallback(() => {
    switch (step) {
      case 'website':
        setStep('business')
        break
      case 'qualifying':
        setStep('website')
        break
      case 'contact':
        setStep('qualifying')
        break
    }
  }, [step])

  // Handle Enter key to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Don't trigger if user is in a textarea or if focus is on a button
        const target = e.target as HTMLElement
        if (target.tagName === 'TEXTAREA') return
        if (target.tagName === 'BUTTON') return

        e.preventDefault()
        goToNextStep()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextStep])

  // Render results
  if (step === 'results' && analysis) {
    return (
      <AIVisibilityResults
        analysis={analysis}
        issues={issues}
        businessName={state.business?.name || ''}
        keyword={state.targetKeyword}
      />
    )
  }

  // Render analyzing state
  if (step === 'analyzing') {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Analyzing Your Website
        </h2>
        <p className="text-[var(--text-secondary)]">
          Running AI visibility analysis for "{state.targetKeyword}"...
        </p>
        <div className="mt-8 space-y-2 text-sm text-[var(--text-muted)]">
          <p>✓ Checking technical performance</p>
          <p>✓ Scanning content structure</p>
          <p className="animate-pulse">→ Analyzing AI search visibility...</p>
        </div>
      </div>
    )
  }

  const stepNumber = ['business', 'website', 'qualifying', 'contact'].indexOf(step) + 1

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
          <span>Step {stepNumber} of 4</span>
          <span>{Math.round((stepNumber / 4) * 100)}%</span>
        </div>
        <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--accent)]"
            initial={{ width: 0 }}
            animate={{ width: `${(stepNumber / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Business Info */}
        {step === 'business' && (
          <motion.div
            key="business"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Value proposition header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                $250 Value — Yours Free
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                Get your free AI visibility report
              </h2>
              <p className="text-[var(--text-secondary)]">
                Most agencies charge <span className="text-[var(--text-primary)] font-semibold">$250+</span> for this exact analysis.
                I'm giving it away because I want you to see what's actually possible.
              </p>
            </div>

            {/* What you'll get */}
            <div className="bg-[var(--bg-secondary)] rounded-xl p-5 space-y-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">In 60 seconds, you'll discover:</p>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Whether ChatGPT & Perplexity are recommending <strong className="text-[var(--text-primary)]">your competitors instead of you</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Your <strong className="text-[var(--text-primary)]">technical SEO score</strong> — page speed, mobile optimization, Core Web Vitals</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong className="text-[var(--text-primary)]">Exactly what to fix first</strong> to start showing up in AI search results</span>
                </li>
              </ul>
            </div>

            <BusinessInput
              value={state.business}
              onChange={(business) => updateState({ business })}
              placeholder="Start typing your business name..."
            />

            <button
              onClick={goToNextStep}
              disabled={!canProceedFromBusiness}
              className={`
                w-full py-4 rounded-lg font-semibold text-white
                transition-all duration-200
                ${canProceedFromBusiness
                  ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-lg shadow-[var(--accent)]/25'
                  : 'bg-gray-400 cursor-not-allowed'
                }
              `}
            >
              Start My Free Analysis →
            </button>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                No credit card
              </span>
              <span>•</span>
              <span>Takes 60 seconds</span>
              <span>•</span>
              <span>100% free</span>
            </div>
          </motion.div>
        )}

        {/* Step 2: Website & Keyword */}
        {step === 'website' && (
          <motion.div
            key="website"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                What do you want to rank for?
              </h2>
              <p className="text-[var(--text-secondary)]">
                Enter your website and the search term you want to dominate.
              </p>
            </div>

            <Input
              label="Website URL"
              type="url"
              placeholder="https://yourcompany.com"
              value={state.websiteUrl}
              onChange={(e) => updateState({ websiteUrl: e.target.value })}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Target Search Keyword
              </label>
              <input
                type="text"
                placeholder='e.g., "roof repair dallas" or "emergency plumber austin"'
                value={state.targetKeyword}
                onChange={(e) => updateState({ targetKeyword: e.target.value })}
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-[var(--bg-card)]
                  border border-[var(--border)]
                  text-[var(--text-primary)]
                  placeholder:text-[var(--text-muted)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
                "
              />
              <p className="text-sm text-[var(--text-muted)]">
                This is the phrase your customers search when looking for your services
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={goToPrevStep}
                className="px-6 py-4 rounded-lg font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={goToNextStep}
                disabled={!canProceedFromWebsite}
                className={`
                  flex-1 py-4 rounded-lg font-semibold text-white
                  transition-all duration-200
                  ${canProceedFromWebsite
                    ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'
                    : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Qualifying Questions */}
        {step === 'qualifying' && (
          <motion.div
            key="qualifying"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Quick questions
              </h2>
              <p className="text-[var(--text-secondary)]">
                Help us understand your current situation.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                How are you getting leads right now?
              </label>
              <div className="grid gap-2">
                {leadSourceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateState({ leadSource: option.value })}
                    className={`
                      w-full p-4 rounded-lg text-left transition-all duration-200
                      border
                      ${state.leadSource === option.value
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]'
                        : 'border-[var(--border)] hover:border-[var(--accent)]/50 text-[var(--text-secondary)]'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                What's your monthly lead goal?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {leadGoalOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateState({ monthlyLeadGoal: option.value })}
                    className={`
                      p-4 rounded-lg text-center transition-all duration-200
                      border
                      ${state.monthlyLeadGoal === option.value
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]'
                        : 'border-[var(--border)] hover:border-[var(--accent)]/50 text-[var(--text-secondary)]'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={goToPrevStep}
                className="px-6 py-4 rounded-lg font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={goToNextStep}
                disabled={!canProceedFromQualifying}
                className={`
                  flex-1 py-4 rounded-lg font-semibold text-white
                  transition-all duration-200
                  ${canProceedFromQualifying
                    ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'
                    : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Contact Info (Email Gate) */}
        {step === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Where should we send your report?
              </h2>
              <p className="text-[var(--text-secondary)]">
                Your personalized AI visibility analysis is ready. Enter your info to see your results.
              </p>
            </div>

            <Input
              label="Your Name"
              placeholder="John Smith"
              value={state.name}
              onChange={(e) => updateState({ name: e.target.value })}
            />

            <EmailInput
              value={state.email}
              onChange={(email) => updateState({ email })}
              onVerified={(verified) => updateState({ emailVerified: verified })}
              placeholder="you@company.com"
            />

            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="(555) 123-4567"
              value={state.phone}
              onChange={(e) => updateState({ phone: e.target.value })}
            />

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={goToPrevStep}
                className="px-6 py-4 rounded-lg font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={goToNextStep}
                disabled={!canProceedFromContact}
                className={`
                  flex-1 py-4 rounded-lg font-semibold text-white
                  transition-all duration-200
                  ${canProceedFromContact
                    ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-lg shadow-[var(--accent)]/25'
                    : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Get My Free Report →
              </button>
            </div>

            <p className="text-xs text-center text-[var(--text-muted)] flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              No spam, ever. Your report is ready instantly.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
