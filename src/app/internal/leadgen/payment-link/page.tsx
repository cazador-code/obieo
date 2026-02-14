'use client'

import { FormEvent, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

type BillingModel = 'package_40_paid_in_full' | 'pay_per_lead_40_first_lead'

type ApiResponse =
  | {
      success: true
      portalKey: string
      checkoutUrl: string | null
      status: string
      tokenExpiresAt: number
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
    // Give the caller a chance to show the raw response in a friendly way.
    return null
  }
}

export default function PaymentLinkPage() {
  const [billingModel, setBillingModel] = useState<BillingModel>('package_40_paid_in_full')

  const [companyName, setCompanyName] = useState('')
  const [billingEmail, setBillingEmail] = useState('')
  const [billingName, setBillingName] = useState('')
  const [source, setSource] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [notes, setNotes] = useState('')
  const [testDiscount, setTestDiscount] = useState('')
  const [forceNew, setForceNew] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<Extract<ApiResponse, { success: true }> | null>(null)

  const canSubmit = useMemo(() => {
    return Boolean(
      cleanString(companyName) &&
        isValidEmail(cleanString(billingEmail)) &&
        billingModel
    )
  }, [billingModel, companyName, billingEmail])

  async function handleGenerate(e: FormEvent) {
    e.preventDefault()

    setSubmitting(true)
    setSubmitError(null)
    setResult(null)

    try {
      const response = await fetch('/api/internal/leadgen/payment-link', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          billingModel,
          companyName,
          billingEmail,
          billingName: billingName || undefined,
          source: source || undefined,
          utmSource: utmSource || undefined,
          utmCampaign: utmCampaign || undefined,
          notes: notes || undefined,
          testDiscount: testDiscount || undefined,
          forceNew,
        }),
      })

      const data =
        (await parseJsonResponse<ApiResponse>(response)) ||
        ({ success: false, error: `Invalid response (${response.status}). Please check Vercel logs.` } as ApiResponse)
      if (!response.ok || !data.success) {
        setSubmitError((data as { error?: string }).error || 'Failed to generate payment link.')
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
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Payment Link Generator</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Create a Stripe Checkout link for a leadgen customer. This page is protected by Basic Auth.
        </p>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg"
        >
          <form onSubmit={handleGenerate} className="grid gap-4">
            <label>
              <span className="block text-sm font-semibold text-[var(--text-primary)]">Offering</span>
              <select
                value={billingModel}
                onChange={(e) => setBillingModel(e.target.value as BillingModel)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              >
                <option value="package_40_paid_in_full">$1,600 paid in full (40 leads)</option>
                <option value="pay_per_lead_40_first_lead">$40 first lead, then $40 per lead</option>
              </select>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Pay-per-lead creates a metered Stripe subscription (threshold=1) so each delivered lead triggers an
                immediate invoice/charge. Leads can still be delivered even if a payment later fails.
              </p>
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
                  <span className="block text-sm font-semibold text-[var(--text-primary)]">Source (optional)</span>
                  <input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                    placeholder="demo-call"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="block text-sm font-semibold text-[var(--text-primary)]">utm_source (optional)</span>
                  <input
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                  />
                </label>
                <label>
                  <span className="block text-sm font-semibold text-[var(--text-primary)]">utm_campaign (optional)</span>
                  <input
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                  />
                </label>
              </div>

              <label>
                <span className="block text-sm font-semibold text-[var(--text-primary)]">Notes (optional)</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 min-h-[96px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="block text-sm font-semibold text-[var(--text-primary)]">
                    Test discount (optional)
                  </span>
                  <input
                    value={testDiscount}
                    onChange={(e) => setTestDiscount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                    placeholder="test-lapeyre-roofing-100 or promo_..."
                  />
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Internal-only: applies a coupon or promotion code ID to make this checkout free for testing.
                  </p>
                </label>

                <label className="flex items-end gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={forceNew}
                    onChange={(e) => setForceNew(e.target.checked)}
                  />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Force new checkout link</span>
                </label>
              </div>

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
                {submitting
                  ? 'Generating...'
                  : billingModel === 'package_40_paid_in_full'
                    ? 'Generate $1,600 Checkout Link'
                    : 'Generate $40 Checkout Link'}
              </button>
            </form>

            {result && (
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  Status: <span className="font-semibold text-[var(--text-primary)]">{result.status}</span>
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Portal key: {result.portalKey}</p>

                {result.checkoutUrl ? (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Checkout URL</p>
                    <input
                      readOnly
                      value={result.checkoutUrl}
                      className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                        onClick={() => navigator.clipboard.writeText(result.checkoutUrl || '')}
                      >
                        Copy
                      </button>
                      <a
                        href={result.checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
                      >
                        Open in Stripe Checkout
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    No checkout URL returned (likely already paid or not yet provisioned).
                  </p>
                )}
              </div>
            )}
        </motion.section>
      </div>
    </main>
  )
}
