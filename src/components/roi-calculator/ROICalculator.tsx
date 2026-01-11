'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CalculatorInputs } from './CalculatorInputs'
import { TeaserResults } from './TeaserResults'
import { GatedResults } from './GatedResults'
import { calculateROI } from './calculations'
import type {
  CalculatorInputs as Inputs,
  CalculatorResults,
  CalculatorStep,
} from './types'

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function ROICalculator() {
  const [step, setStep] = useState<CalculatorStep>('input')
  const [inputs, setInputs] = useState<Inputs | null>(null)
  const [results, setResults] = useState<CalculatorResults | null>(null)

  function handleCalculate(data: Inputs): void {
    setInputs(data)
    setResults(calculateROI(data))
    setStep('teaser')
    scrollToTop()
  }

  async function handleUnlock(leadData: {
    name: string
    email: string
    company?: string
  }): Promise<void> {
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadData.name,
          email: leadData.email,
          website: leadData.company || '',
          source: 'roi-calculator',
          quizAnswers: inputs,
          score: results?.additionalAnnualRevenue || 0,
        }),
      })
    } catch (error) {
      console.error('Failed to submit lead:', error)
    }

    setStep('gated')
    scrollToTop()
  }

  function handleReset(): void {
    setStep('input')
    setInputs(null)
    setResults(null)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <CalculatorInputs key="input" onCalculate={handleCalculate} />
        )}
        {step === 'teaser' && results && (
          <TeaserResults
            key="teaser"
            results={results}
            onUnlock={handleUnlock}
          />
        )}
        {step === 'gated' && results && inputs && (
          <GatedResults key="gated" results={results} inputs={inputs} />
        )}
      </AnimatePresence>

      {step !== 'input' && (
        <button
          onClick={handleReset}
          className="mt-6 mx-auto block text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Start over with new numbers
        </button>
      )}
    </div>
  )
}
