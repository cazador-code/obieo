'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { FormInput } from './FormInput'

interface Props {
  onSubmit: (data: { name: string; email: string; company?: string }) => void
}

export function LeadCaptureForm({ onSubmit }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(): boolean {
    const newErrors: { name?: string; email?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    await onSubmit({
      name: name.trim(),
      email: email.trim(),
      company: company.trim() || undefined,
    })
    setIsSubmitting(false)
  }

  function handleNameChange(value: string): void {
    setName(value)
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }))
    }
  }

  function handleEmailChange(value: string): void {
    setEmail(value)
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
          Get Your Full Report
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Enter your details to unlock your complete ROI breakdown
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="lead-name"
          type="text"
          label="Name"
          value={name}
          onChange={handleNameChange}
          placeholder="John Smith"
          error={errors.name}
        />

        <FormInput
          id="lead-email"
          type="email"
          label="Email"
          value={email}
          onChange={handleEmailChange}
          placeholder="john@company.com"
          error={errors.email}
        />

        <FormInput
          id="lead-company"
          type="text"
          label="Company"
          value={company}
          onChange={setCompany}
          placeholder="Your Company Name"
          optional
        />

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Unlocking...' : 'Unlock My Results'}
        </Button>

        <p className="text-xs text-center text-[var(--text-muted)]">
          We respect your privacy. No spam, ever.
        </p>
      </form>
    </motion.div>
  )
}
