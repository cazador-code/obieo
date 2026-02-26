'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BILLING_MODEL_LABELS,
  DEFAULT_BILLING_MODEL,
  type BillingModel,
} from '@/lib/billing-models'
import {
  dedupeStringList,
  getTargetZipCountError,
} from '@/lib/leadgen-target-zips'

const STORED_AUTH_KEY = 'obieo-audit-auth'

interface ManualFormData {
  companyName: string
  portalKey: string
  accountFirstName: string
  accountLastName: string
  accountLoginEmail: string
  businessPhone: string
  businessAddress: string
  serviceAreasText: string
  targetZipCodesText: string
  serviceTypesText: string
  leadRoutingPhonesText: string
  leadRoutingEmailsText: string
  leadNotificationPhone: string
  leadNotificationEmail: string
  leadProspectEmail: string
  billingContactName: string
  billingContactEmail: string
  desiredLeadVolumeDaily: number
  operatingHoursStart: string
  operatingHoursEnd: string
  billingModel: BillingModel
  leadUnitPriceDollars: number
  leadChargeThreshold: number
  captureMethod: string
  notes: string
}

type SubmitResult = {
  message: string
  portalKey: string
  submissionId: string
  organizationId: string
}

const INITIAL_FORM: ManualFormData = {
  companyName: '',
  portalKey: '',
  accountFirstName: '',
  accountLastName: '',
  accountLoginEmail: '',
  businessPhone: '',
  businessAddress: '',
  serviceAreasText: '',
  targetZipCodesText: '',
  serviceTypesText: '',
  leadRoutingPhonesText: '',
  leadRoutingEmailsText: '',
  leadNotificationPhone: '',
  leadNotificationEmail: '',
  leadProspectEmail: '',
  billingContactName: '',
  billingContactEmail: '',
  desiredLeadVolumeDaily: 6,
  operatingHoursStart: '09:00',
  operatingHoursEnd: '17:00',
  billingModel: DEFAULT_BILLING_MODEL,
  leadUnitPriceDollars: 40,
  leadChargeThreshold: 10,
  captureMethod: 'phone_call',
  notes: '',
}

function cleanString(value: string): string {
  return value.trim()
}

function parseList(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
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

function getStoredAuthToken(): string | null {
  return sessionStorage.getItem(STORED_AUTH_KEY)
}

function setStoredAuthToken(token: string): void {
  sessionStorage.setItem(STORED_AUTH_KEY, token)
}

function clearStoredAuthToken(): void {
  sessionStorage.removeItem(STORED_AUTH_KEY)
}

export default function InternalManualOnboardingPage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null)

  const [form, setForm] = useState<ManualFormData>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null)

  useEffect(() => {
    const token = getStoredAuthToken()
    if (!token) {
      setCheckingAuth(false)
      return
    }

    void (async () => {
      try {
        const response = await fetch('/api/internal/verify-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          clearStoredAuthToken()
          setIsAuthenticated(false)
          return
        }

        const data = await response.json()
        if (data?.valid) {
          setIsAuthenticated(true)
        } else {
          clearStoredAuthToken()
          setIsAuthenticated(false)
        }
      } catch {
        clearStoredAuthToken()
        setIsAuthenticated(false)
      } finally {
        setCheckingAuth(false)
      }
    })()
  }, [])

  function setField<K extends keyof ManualFormData>(key: K, value: ManualFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function applyBillingModel(nextModel: BillingModel) {
    const threshold = nextModel === 'pay_per_lead_perpetual' ? 1 : Math.max(1, Math.floor(form.leadChargeThreshold))
    setForm((prev) => ({
      ...prev,
      billingModel: nextModel,
      leadChargeThreshold: threshold,
    }))
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    setAuthErrorMessage(null)

    try {
      const response = await fetch('/api/internal/verify-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await parseJsonResponse<{ valid?: boolean; token?: string; error?: string }>(response)
      if (response.ok && data?.valid && data.token) {
        setStoredAuthToken(data.token)
        setIsAuthenticated(true)
        return
      }

      const fallback =
        response.status === 429
          ? 'Too many attempts. Please wait 60 seconds and try again.'
          : response.status >= 500
            ? 'Server configuration error. Check env vars and restart the dev server.'
            : 'Incorrect password.'
      setAuthErrorMessage(data?.error || fallback)
    } catch {
      setAuthErrorMessage('Unable to unlock right now. Please try again.')
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitError(null)
    setSubmitResult(null)

    const authToken = getStoredAuthToken()
    if (!authToken) {
      setSubmitError('Session expired. Refresh and authenticate again.')
      return
    }

    if (!cleanString(form.companyName)) {
      setSubmitError('Company name is required.')
      return
    }

    if (parseList(form.serviceAreasText).length === 0) {
      setSubmitError('Add at least one service area.')
      return
    }

    const targetZipCodes = dedupeStringList(parseList(form.targetZipCodesText))
    const targetZipCountError = getTargetZipCountError(targetZipCodes.length)
    if (targetZipCountError) {
      setSubmitError(targetZipCountError)
      return
    }

    const leadRoutingPhones = parseList(form.leadRoutingPhonesText)
    const leadRoutingEmails = parseList(form.leadRoutingEmailsText).map((entry) => entry.toLowerCase())
    if (leadRoutingPhones.length === 0 && leadRoutingEmails.length === 0) {
      setSubmitError('Add at least one lead destination phone or email. Alert contacts do not route leads.')
      return
    }

    const leadUnitPriceCents = Math.max(100, Math.round((Number(form.leadUnitPriceDollars) || 0) * 100))
    const leadChargeThreshold =
      form.billingModel === 'pay_per_lead_perpetual' ? 1 : Math.max(1, Math.floor(Number(form.leadChargeThreshold) || 0))

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/internal/leadgen/manual-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          companyName: cleanString(form.companyName),
          portalKey: cleanString(form.portalKey) || undefined,
          accountFirstName: cleanString(form.accountFirstName) || undefined,
          accountLastName: cleanString(form.accountLastName) || undefined,
          accountLoginEmail: cleanString(form.accountLoginEmail).toLowerCase() || undefined,
          businessPhone: cleanString(form.businessPhone) || undefined,
          businessAddress: cleanString(form.businessAddress) || undefined,
          serviceAreas: parseList(form.serviceAreasText),
          targetZipCodes,
          serviceTypes: parseList(form.serviceTypesText),
          leadRoutingPhones,
          leadRoutingEmails,
          leadNotificationPhone: cleanString(form.leadNotificationPhone) || undefined,
          leadNotificationEmail: cleanString(form.leadNotificationEmail).toLowerCase() || undefined,
          leadProspectEmail: cleanString(form.leadProspectEmail).toLowerCase() || undefined,
          billingContactName: cleanString(form.billingContactName) || undefined,
          billingContactEmail: cleanString(form.billingContactEmail).toLowerCase() || undefined,
          desiredLeadVolumeDaily: Math.max(1, Math.floor(Number(form.desiredLeadVolumeDaily) || 0)),
          operatingHoursStart: cleanString(form.operatingHoursStart) || undefined,
          operatingHoursEnd: cleanString(form.operatingHoursEnd) || undefined,
          billingModel: form.billingModel,
          leadUnitPriceCents,
          leadChargeThreshold,
          captureMethod: cleanString(form.captureMethod) || undefined,
          notes: cleanString(form.notes) || undefined,
        }),
      })

      const payload = await parseJsonResponse<{
        success?: boolean
        error?: string
        message?: string
        portalKey?: string
        submissionId?: string
        organizationId?: string
      }>(response)
      if (response.status === 401) {
        clearStoredAuthToken()
        setIsAuthenticated(false)
        throw new Error('Session expired. Refresh and authenticate again.')
      }

      if (!response.ok || !payload?.success || !payload.portalKey || !payload.submissionId || !payload.organizationId) {
        throw new Error(payload?.error || `Failed to store onboarding answers (HTTP ${response.status})`)
      }

      setSubmitResult({
        message: payload.message || 'Manual onboarding answers recorded.',
        portalKey: payload.portalKey,
        submissionId: payload.submissionId,
        organizationId: payload.organizationId,
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/95 p-6 shadow-xl">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Manual Intake Access</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Internal tool for recording onboarding answers collected by phone or chat.
          </p>
          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
            <label htmlFor="manual-onboarding-password" className="sr-only">
              Internal tool password
            </label>
            <input
              id="manual-onboarding-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="Enter password"
            />
            {authErrorMessage && <p className="text-sm text-red-500">{authErrorMessage}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Manual Assisted Onboarding</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Use this when a customer gives answers over phone/text and cannot complete onboarding themselves.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/internal/leadgen/onboarding"
              className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              Full Intake Tool
            </Link>
            <Link
              href="/internal/clients"
              className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              Clients Dashboard
            </Link>
          </div>
        </header>

        {submitResult && (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <p className="font-semibold">{submitResult.message}</p>
            <p className="mt-1">
              Portal key: <span className="font-mono">{submitResult.portalKey}</span>
            </p>
            <p>
              Submission ID: <span className="font-mono">{submitResult.submissionId}</span>
            </p>
            <p>
              Organization ID: <span className="font-mono">{submitResult.organizationId}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="companyName" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Company Name *
              </label>
              <input
                id="companyName"
                value={form.companyName}
                onChange={(event) => setField('companyName', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder="ACME Roofing"
              />
            </div>
            <div>
              <label htmlFor="portalKey" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Portal Key (optional)
              </label>
              <input
                id="portalKey"
                value={form.portalKey}
                onChange={(event) => setField('portalKey', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder="acme-roofing"
              />
            </div>
            <div>
              <label htmlFor="accountLoginEmail" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Account Login Email
              </label>
              <input
                id="accountLoginEmail"
                type="email"
                value={form.accountLoginEmail}
                onChange={(event) => setField('accountLoginEmail', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder="owner@company.com"
              />
            </div>
            <div>
              <label htmlFor="businessPhone" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Business Phone
              </label>
              <input
                id="businessPhone"
                value={form.businessPhone}
                onChange={(event) => setField('businessPhone', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label htmlFor="accountFirstName" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                First Name
              </label>
              <input
                id="accountFirstName"
                value={form.accountFirstName}
                onChange={(event) => setField('accountFirstName', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="accountLastName" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Last Name
              </label>
              <input
                id="accountLastName"
                value={form.accountLastName}
                onChange={(event) => setField('accountLastName', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder="Doe"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="businessAddress" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Business Address
              </label>
              <input
                id="businessAddress"
                value={form.businessAddress}
                onChange={(event) => setField('businessAddress', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder="123 Main St, City, State 12345"
              />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
              <p className="font-semibold text-[var(--text-primary)]">Contact roles</p>
              <p className="mt-1">
                Lead destination phone/email: where leads are delivered.
              </p>
              <p className="mt-1">
                Alert phone/email: separate alert contacts (does not control lead delivery destination).
              </p>
              <p className="mt-1">
                Business email for prospects: customer-facing business email for prospect communication context.
              </p>
            </div>
            <div>
              <label htmlFor="serviceAreasText" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Service Areas * (comma or new line)
              </label>
              <textarea
                id="serviceAreasText"
                value={form.serviceAreasText}
                onChange={(event) => setField('serviceAreasText', event.target.value)}
                className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder={'Austin\nRound Rock\nCedar Park'}
              />
            </div>
            <div>
              <label htmlFor="targetZipCodesText" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Target ZIPs (comma or new line)
              </label>
              <textarea
                id="targetZipCodesText"
                value={form.targetZipCodesText}
                onChange={(event) => setField('targetZipCodesText', event.target.value)}
                className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder={'78701\n78702\n78703'}
              />
            </div>
            <div>
              <label htmlFor="serviceTypesText" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Service Types (comma or new line)
              </label>
              <textarea
                id="serviceTypesText"
                value={form.serviceTypesText}
                onChange={(event) => setField('serviceTypesText', event.target.value)}
                className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder={'Roofing\nSolar'}
              />
            </div>
            <div>
              <label htmlFor="leadRoutingPhonesText" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Lead Destination Phones * (comma or new line)
              </label>
              <textarea
                id="leadRoutingPhonesText"
                value={form.leadRoutingPhonesText}
                onChange={(event) => setField('leadRoutingPhonesText', event.target.value)}
                className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder={'(555) 111-2222\n(555) 333-4444'}
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">At least one destination phone or destination email is required.</p>
            </div>
            <div>
              <label htmlFor="leadRoutingEmailsText" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Lead Destination Emails
              </label>
              <textarea
                id="leadRoutingEmailsText"
                value={form.leadRoutingEmailsText}
                onChange={(event) => setField('leadRoutingEmailsText', event.target.value)}
                className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder={'ops@company.com\nowner@company.com'}
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">At least one destination phone or destination email is required.</p>
            </div>
            <div className="grid gap-4">
              <div>
                <label htmlFor="leadNotificationPhone" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                  Alert Phone
                </label>
                <input
                  id="leadNotificationPhone"
                  value={form.leadNotificationPhone}
                  onChange={(event) => setField('leadNotificationPhone', event.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                  placeholder="(555) 123-4567"
                />
                <p className="mt-1 text-xs text-[var(--text-muted)]">Optional alert contact only.</p>
              </div>
              <div>
                <label htmlFor="leadNotificationEmail" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                  Alert Email
                </label>
                <input
                  id="leadNotificationEmail"
                  type="email"
                  value={form.leadNotificationEmail}
                  onChange={(event) => setField('leadNotificationEmail', event.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                  placeholder="alerts@company.com"
                />
                <p className="mt-1 text-xs text-[var(--text-muted)]">Optional alert contact only.</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="leadProspectEmail" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Business Email For Prospects
              </label>
              <input
                id="leadProspectEmail"
                type="email"
                value={form.leadProspectEmail}
                onChange={(event) => setField('leadProspectEmail', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder="info@company.com"
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">Customer-facing business email for prospect messaging context.</p>
            </div>
            <div>
              <label htmlFor="billingContactName" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Billing Contact Name
              </label>
              <input
                id="billingContactName"
                value={form.billingContactName}
                onChange={(event) => setField('billingContactName', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label htmlFor="billingContactEmail" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Billing Contact Email
              </label>
              <input
                id="billingContactEmail"
                type="email"
                value={form.billingContactEmail}
                onChange={(event) => setField('billingContactEmail', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                placeholder="billing@company.com"
              />
            </div>
            <div>
              <label htmlFor="desiredLeadVolumeDaily" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Desired Leads Per Day
              </label>
              <input
                id="desiredLeadVolumeDaily"
                type="number"
                min={1}
                value={form.desiredLeadVolumeDaily}
                onChange={(event) => setField('desiredLeadVolumeDaily', Math.max(1, Number(event.target.value) || 1))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="operatingHoursStart" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Operating Hours Start
              </label>
              <input
                id="operatingHoursStart"
                type="time"
                value={form.operatingHoursStart}
                onChange={(event) => setField('operatingHoursStart', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="operatingHoursEnd" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Operating Hours End
              </label>
              <input
                id="operatingHoursEnd"
                type="time"
                value={form.operatingHoursEnd}
                onChange={(event) => setField('operatingHoursEnd', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <fieldset className="md:col-span-2">
              <legend className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">Billing Model</legend>
              <div className="grid gap-2 md:grid-cols-2">
                {(['pay_per_lead_perpetual', 'commitment_40_with_10_upfront'] as BillingModel[]).map((model) => {
                  const selected = form.billingModel === model
                  return (
                    <button
                      key={model}
                      id={`billingModel-${model}`}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => applyBillingModel(model)}
                      className={[
                        'rounded-xl border p-3 text-left text-sm',
                        selected
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-[var(--border)] bg-[var(--bg-card)]',
                      ].join(' ')}
                    >
                      <p className="font-semibold">{BILLING_MODEL_LABELS[model]}</p>
                    </button>
                  )
                })}
              </div>
            </fieldset>
            <div>
              <label htmlFor="leadUnitPriceDollars" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Price Per Lead (USD)
              </label>
              <input
                id="leadUnitPriceDollars"
                type="number"
                min={1}
                step={1}
                value={form.leadUnitPriceDollars}
                onChange={(event) => setField('leadUnitPriceDollars', Math.max(1, Number(event.target.value) || 1))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="leadChargeThreshold" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Charge Threshold (leads)
              </label>
              <input
                id="leadChargeThreshold"
                type="number"
                min={1}
                value={form.leadChargeThreshold}
                disabled={form.billingModel === 'pay_per_lead_perpetual'}
                onChange={(event) => setField('leadChargeThreshold', Math.max(1, Number(event.target.value) || 1))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 disabled:cursor-not-allowed disabled:bg-[var(--bg-secondary)]"
              />
            </div>
            <div>
              <label htmlFor="captureMethod" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                Capture Method
              </label>
              <select
                id="captureMethod"
                value={form.captureMethod}
                onChange={(event) => setField('captureMethod', event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              >
                <option value="phone_call">Phone call</option>
                <option value="sales_call">Sales call</option>
                <option value="sms_chat">SMS chat</option>
                <option value="email_thread">Email thread</option>
                <option value="other">Other</option>
              </select>
            </div>
          </section>

          <section>
            <label htmlFor="notes" className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
              Notes / Raw Answers
            </label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(event) => setField('notes', event.target.value)}
              className="min-h-36 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="Paste customer answers exactly as provided, plus any context for ops."
            />
          </section>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {isSubmitting ? 'Recording...' : 'Record Onboarding Answers'}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(INITIAL_FORM)
                setSubmitError(null)
                setSubmitResult(null)
              }}
              className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-5 py-3 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
