'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { QuizStep } from './QuizStep'
import { QuizResults } from './QuizResults'
import { quizQuestions, calculateScore } from './data'
import { QuizAnswers } from './types'

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
