'use client'

import { FormEvent, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BILLING_MODEL_LABELS,
  DEFAULT_BILLING_MODEL,
  type BillingModel,
  normalizeBillingModel,
} from '@/lib/billing-models'

type PaymentProvider = 'ignition' | 'whop' | 'manual'

type ActivationResult = {
  status?: 'activated' | 'skipped'
  reason?: string
  invitationId?: string
  loginUrl?: string
  email?: string
}

type ApiResponse =
  | {
      success: true
      portalKey: string
      status: string
      tokenExpiresAt: number
      paymentProvider: PaymentProvider
      paymentReference: string | null
      onboardingUrl: string
      activation: ActivationResult
    }
  | { success: false; error: string }

function cleanString(value: string) {
  return value.trim()
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function formatDate(value: number): string {
  if (!Number.isFinite(value)) return 'N/A'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return 'N/A'
  }
}

const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  ignition: 'Ignition',
  whop: 'Whop',
  manual: 'Manual confirmation',
}

const BILLING_MODEL_OPTIONS: BillingModel[] = [
  'package_40_paid_in_full',
  'commitment_40_with_10_upfront',
  'pay_per_lead_40_first_lead',
  'pay_per_lead_perpetual',
]

export default function PaymentLinkPage() {
  const [billingModel, setBillingModel] = useState<BillingModel>(DEFAULT_BILLING_MODEL)

  const [companyName, setCompanyName] = useState('')
  const [billingEmail, setBillingEmail] = useState('')
  const [billingName, setBillingName] = useState('')
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('ignition')
  const [paymentReference, setPaymentReference] = useState('')
  const [source, setSource] = useState('')
  const [forceResendInvitation, setForceResendInvitation] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<Extract<ApiResponse, { success: true }> | null>(null)

  const canSubmit = useMemo(() => {
    return Boolean(cleanString(companyName) && isValidEmail(cleanString(billingEmail)) && billingModel)
  }, [billingModel, companyName, billingEmail])

  async function handleConfirmPayment(e: FormEvent) {
    e.preventDefault()

    setSubmitting(true)
    setSubmitError(null)
    setResult(null)

    try {
      const response = await fetch('/api/internal/leadgen/payment-confirmation', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          billingModel,
          companyName,
          billingEmail,
          billingName: billingName || undefined,
          paymentProvider,
          paymentReference: paymentReference || undefined,
          source: source || undefined,
          forceResendInvitation,
        }),
      })

      const data =
        (await parseJsonResponse<ApiResponse>(response)) ||
        ({ success: false, error: `Invalid response (${response.status}). Please check logs.` } as ApiResponse)

      if (!response.ok || !data.success) {
        setSubmitError((data as { error?: string }).error || 'Failed to confirm payment.')
        return
      }

      setResult(data)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Payment Confirmation & Onboarding Invite</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Use this after payment is confirmed in Ignition/Whop. It sends the client account invitation and onboarding
          questionnaire link.
        </p>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg"
        >
          <form onSubmit={handleConfirmPayment} className="grid gap-4">
            <label>
              <span className="block text-sm font-semibold text-[var(--text-primary)]">Billing model</span>
              <select
                value={billingModel}
                onChange={(e) => setBillingModel(normalizeBillingModel(e.target.value))}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              >
                {BILLING_MODEL_OPTIONS.map((model) => (
                  <option key={model} value={model}>
                    {BILLING_MODEL_LABELS[model]}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="block text-sm font-semibold text-[var(--text-primary)]">Company name</span>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                  placeholder="Lapeyre Roofing"
                />
              </label>

              <label>
                <span className="block text-sm font-semibold text-[var(--text-primary)]">Billing email</span>
                <input
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                  placeholder="owner@company.com"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="block text-sm font-semibold text-[var(--text-primary)]">Billing name (optional)</span>
                <input
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                  placeholder="Jane Smith"
                />
              </label>

              <label>
                <span className="block text-sm font-semibold text-[var(--text-primary)]">Payment provider</span>
                <select
                  value={paymentProvider}
                  onChange={(e) => setPaymentProvider(e.target.value as PaymentProvider)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                >
                  {Object.entries(PAYMENT_PROVIDER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="block text-sm font-semibold text-[var(--text-primary)]">Payment reference (optional)</span>
                <input
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                  placeholder="invoice_123 / order_abc"
                />
              </label>

              <label>
                <span className="block text-sm font-semibold text-[var(--text-primary)]">Source tag (optional)</span>
                <input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                  placeholder="sales-call"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3">
              <input
                type="checkbox"
                checked={forceResendInvitation}
                onChange={(e) => setForceResendInvitation(e.target.checked)}
              />
              <span className="text-sm font-semibold text-[var(--text-primary)]">Force resend invitation email</span>
            </label>

            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-white hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Confirming...' : 'Confirm Payment & Send Onboarding Invite'}
            </button>
          </form>

          {result && (
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Leadgen status: <span className="font-semibold text-[var(--text-primary)]">{result.status}</span>
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Portal key: {result.portalKey}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Provider: {PAYMENT_PROVIDER_LABELS[result.paymentProvider]}
                {result.paymentReference ? ` (${result.paymentReference})` : ''}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Token expires: {formatDate(result.tokenExpiresAt)}</p>

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Activation result</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Status: <span className="font-semibold">{result.activation?.status || 'unknown'}</span>
                </p>
                {result.activation?.reason && (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{result.activation.reason}</p>
                )}
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Onboarding URL</p>
                <input
                  readOnly
                  value={result.onboardingUrl}
                  className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                    onClick={() => navigator.clipboard.writeText(result.onboardingUrl)}
                  >
                    Copy
                  </button>
                  <a
                    href={result.onboardingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
                  >
                    Open Onboarding URL
                  </a>
                </div>
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </main>
  )
}
