'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { FormInput } from './FormInput'
import type { CalculatorInputs as Inputs } from './types'

interface Props {
  onCalculate: (data: Inputs) => void
}

const defaultValues: Inputs = {
  averageTicketSize: 8500,
  closeRate: 35,
  currentLeadsPerMonth: 25,
  grossProfitMargin: 40,
}

const inputConfig = [
  {
    key: 'averageTicketSize' as const,
    label: 'Average Job Ticket Size',
    placeholder: '8500',
    helper: 'What do you charge per job on average?',
    prefix: '$',
    min: 100,
    max: 1000000,
  },
  {
    key: 'currentLeadsPerMonth' as const,
    label: 'Leads Per Month',
    placeholder: '25',
    helper: 'How many leads do you get each month?',
    min: 1,
    max: 10000,
  },
  {
    key: 'closeRate' as const,
    label: 'Close Rate',
    placeholder: '35',
    helper: 'What percentage of leads become paying customers?',
    suffix: '%',
    min: 1,
    max: 100,
  },
  {
    key: 'grossProfitMargin' as const,
    label: 'Gross Profit Margin',
    placeholder: '40',
    helper: 'After direct costs (labor, materials), what percentage is profit?',
    suffix: '%',
    min: 1,
    max: 100,
  },
]

export function CalculatorInputs({ onCalculate }: Props) {
  const [values, setValues] = useState<Inputs>(defaultValues)
  const [errors, setErrors] = useState<Partial<Record<keyof Inputs, string>>>({})

  function handleChange(key: keyof Inputs, value: string): void {
    const numValue = parseFloat(value) || 0
    setValues((prev) => ({ ...prev, [key]: numValue }))

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof Inputs, string>> = {}

    for (const { key, min, max, label } of inputConfig) {
      const value = values[key]
      if (!value || value < min) {
        newErrors[key] = `${label} must be at least ${min}`
      } else if (value > max) {
        newErrors[key] = `${label} must be less than ${max.toLocaleString()}`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (validate()) {
      onCalculate(values)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]">
        <div className="grid gap-6">
          {inputConfig.map(({ key, label, placeholder, helper, prefix, suffix }) => (
            <FormInput
              key={key}
              id={key}
              type="number"
              label={label}
              value={values[key] || ''}
              onChange={(value) => handleChange(key, value)}
              placeholder={placeholder}
              helper={helper}
              error={errors[key]}
              prefix={prefix}
              suffix={suffix}
            />
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full">
        Calculate My ROI
      </Button>
    </motion.form>
  )
}
