'use client'

import { useState, type FormEvent } from 'react'

const formFields = [
  { id: 'name', label: 'Name', type: 'text', placeholder: 'John Smith', half: true, required: true },
  { id: 'company', label: 'Company', type: 'text', placeholder: 'Smith Roofing', half: true, required: false },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'john@smithroofing.com', half: true, required: true },
  { id: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '(555) 123-4567', half: true, required: false },
  { id: 'website', label: 'Your Website (if you have one)', type: 'url', placeholder: 'https://smithroofing.com', half: false, required: false },
] as const

const inputClasses = 'w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 transition-colors outline-none'
const labelClasses = 'block text-sm font-medium text-slate-700 mb-2'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
      message: formData.get('message') as string,
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setStatus('success')
      } else {
        const result = await response.json()
        setErrorMessage(result.error || 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-900">
          Message Sent
        </h3>
        <p className="mt-2 text-slate-600">
          Thanks for reaching out. I&apos;ll get back to you within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        {formFields.filter(f => f.half).slice(0, 2).map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className={labelClasses}>
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.id}
              name={field.id}
              required={field.required}
              className={inputClasses}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {formFields.filter(f => f.half).slice(2, 4).map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className={labelClasses}>
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.id}
              name={field.id}
              required={field.required}
              className={inputClasses}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      {formFields.filter(f => !f.half).map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className={labelClasses}>
            {field.label}
          </label>
          <input
            type={field.type}
            id={field.id}
            name={field.id}
            required={field.required}
            className={inputClasses}
            placeholder={field.placeholder}
          />
        </div>
      ))}

      <div>
        <label htmlFor="message" className={labelClasses}>
          What can I help with?
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className={`${inputClasses} resize-none`}
          placeholder="Tell me a bit about your business and what you're looking for..."
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 text-center">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full px-6 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
      >
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
