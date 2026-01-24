'use client'

import { useState, useCallback, useEffect } from 'react'

interface EmailInputProps {
  value: string
  onChange: (email: string) => void
  onVerified?: (isVerified: boolean) => void
  error?: string
  label?: string
  placeholder?: string
  required?: boolean
}

interface VerificationResult {
  valid: boolean
  reason?: string
  suggestion?: string
  isDisposable?: boolean
}

/**
 * Email input with real-time verification using ZeroBounce API.
 * Validates on blur and shows helpful feedback.
 */
export function EmailInput({
  value,
  onChange,
  onVerified,
  error: externalError,
  label = 'Email Address',
  placeholder = 'you@company.com',
  required = true,
}: EmailInputProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [touched, setTouched] = useState(false)

  // Reset verification when value changes
  useEffect(() => {
    if (verificationResult && value !== verificationResult.suggestion) {
      setVerificationResult(null)
    }
  }, [value, verificationResult])

  const verifyEmail = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) return

    setIsVerifying(true)
    try {
      const response = await fetch('/api/quiz/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result: VerificationResult = await response.json()
      setVerificationResult(result)
      onVerified?.(result.valid)
    } catch (error) {
      console.error('Email verification failed:', error)
      // Fail open - assume valid if API fails
      setVerificationResult({ valid: true })
      onVerified?.(true)
    } finally {
      setIsVerifying(false)
    }
  }, [onVerified])

  const handleBlur = useCallback(() => {
    setTouched(true)
    if (value && value.includes('@')) {
      verifyEmail(value)
    }
  }, [value, verifyEmail])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleUseSuggestion = () => {
    if (verificationResult?.suggestion) {
      onChange(verificationResult.suggestion)
      setVerificationResult(null)
      // Re-verify with corrected email
      setTimeout(() => verifyEmail(verificationResult.suggestion!), 100)
    }
  }

  // Determine display state
  const showError = touched && (externalError || (verificationResult && !verificationResult.valid))
  const showSuccess = touched && verificationResult?.valid && !externalError
  const errorMessage = externalError || verificationResult?.reason

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="email"
        className="text-sm font-medium text-[var(--text-primary)]"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id="email"
          type="email"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          autoComplete="email"
          className={`
            w-full px-4 py-3 rounded-lg
            bg-[var(--bg-card)]
            border border-[var(--border)]
            text-[var(--text-primary)]
            placeholder:text-[var(--text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
            transition-all duration-200
            pr-10
            ${showError ? 'border-red-500 focus:ring-red-500' : ''}
            ${showSuccess ? 'border-green-500' : ''}
          `}
        />
        {/* Status indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isVerifying ? (
            <div className="w-5 h-5 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin" />
          ) : showSuccess ? (
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : showError ? (
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : null}
        </div>
      </div>

      {/* Error message */}
      {showError && errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      {/* Typo suggestion */}
      {verificationResult?.suggestion && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-amber-500">Did you mean:</span>
          <button
            type="button"
            onClick={handleUseSuggestion}
            className="text-[var(--accent)] hover:underline font-medium"
          >
            {verificationResult.suggestion}
          </button>
        </div>
      )}

      {/* Disposable email warning */}
      {verificationResult?.isDisposable && (
        <p className="text-sm text-amber-500">
          Please use your business email for better results
        </p>
      )}

      {/* Success message */}
      {showSuccess && (
        <p className="text-sm text-green-600">✓ Email verified</p>
      )}
    </div>
  )
}
