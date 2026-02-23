'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

type SessionResponse =
  | {
      success: true
      portalKey: string
      companyName: string
      billingEmail: string
      status: string
      tokenExpiresAt: number
    }
  | { success: false; error: string }

type CompleteResponse =
  | { success: true; portalKey: string }
  | { success: false; error: string }

const DRAFT_STORAGE_KEY_PREFIX = 'obieo-public-leadgen-onboarding-draft:v1'

function cleanString(value: string) {
  return value.trim()
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean)
}

function splitComma(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

const SERVICE_TYPES = [
  'Roofing',
  'HVAC',
  'Solar',
  'Plumbing',
  'Electrical',
  'Flooring',
  'Windows & Doors',
  'Landscaping',
  'Kitchen Remodeling',
  'Bathroom Remodeling',
  'Painting',
] as const

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T
  } catch {
    return null
  }
}

type OnboardingDraftForm = {
  serviceAreasRaw: string
  targetZipCodesRaw: string
  serviceTypes: string[]
  operatingHoursStart: string
  operatingHoursEnd: string
  leadRoutingPhonesRaw: string
  leadRoutingEmailsRaw: string
  leadNotificationPhone: string
  leadNotificationEmail: string
  leadProspectEmail: string
  businessPhone: string
  businessAddress: string
  desiredLeadVolumeDaily: number
}

type OnboardingDraftSnapshot = {
  savedAt: number
  form: OnboardingDraftForm
}

function getDraftStorageKey(token: string) {
  return `${DRAFT_STORAGE_KEY_PREFIX}:${token}`
}

function safeReadDraft(storageKey: string): unknown | null {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function safeWriteDraft(storageKey: string, payload: unknown): boolean {
  try {
    localStorage.setItem(storageKey, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

function safeClearDraft(storageKey: string) {
  try {
    localStorage.removeItem(storageKey)
  } catch {
    // ignore
  }
}

function parseOnboardingDraft(value: unknown): OnboardingDraftSnapshot | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Record<string, unknown>
  const rawForm = data.form
  if (!rawForm || typeof rawForm !== 'object') return null

  const form = rawForm as Record<string, unknown>
  const parsedServiceTypes = Array.isArray(form.serviceTypes)
    ? form.serviceTypes.filter(
        (entry): entry is string => typeof entry === 'string' && SERVICE_TYPES.includes(entry as (typeof SERVICE_TYPES)[number])
      )
    : []

  return {
    savedAt: typeof data.savedAt === 'number' && Number.isFinite(data.savedAt) ? data.savedAt : Date.now(),
    form: {
      serviceAreasRaw: typeof form.serviceAreasRaw === 'string' ? form.serviceAreasRaw : '',
      targetZipCodesRaw: typeof form.targetZipCodesRaw === 'string' ? form.targetZipCodesRaw : '',
      serviceTypes: parsedServiceTypes.length > 0 ? parsedServiceTypes : ['Roofing'],
      operatingHoursStart: typeof form.operatingHoursStart === 'string' ? form.operatingHoursStart : '09:00',
      operatingHoursEnd: typeof form.operatingHoursEnd === 'string' ? form.operatingHoursEnd : '17:00',
      leadRoutingPhonesRaw: typeof form.leadRoutingPhonesRaw === 'string' ? form.leadRoutingPhonesRaw : '',
      leadRoutingEmailsRaw: typeof form.leadRoutingEmailsRaw === 'string' ? form.leadRoutingEmailsRaw : '',
      leadNotificationPhone: typeof form.leadNotificationPhone === 'string' ? form.leadNotificationPhone : '',
      leadNotificationEmail: typeof form.leadNotificationEmail === 'string' ? form.leadNotificationEmail : '',
      leadProspectEmail: typeof form.leadProspectEmail === 'string' ? form.leadProspectEmail : '',
      businessPhone: typeof form.businessPhone === 'string' ? form.businessPhone : '',
      businessAddress: typeof form.businessAddress === 'string' ? form.businessAddress : '',
      desiredLeadVolumeDaily:
        typeof form.desiredLeadVolumeDaily === 'number' &&
        Number.isFinite(form.desiredLeadVolumeDaily) &&
        form.desiredLeadVolumeDaily > 0
          ? Math.floor(form.desiredLeadVolumeDaily)
          : 6,
    },
  }
}

export default function LeadgenOnboardingClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<Extract<SessionResponse, { success: true }> | null>(null)

  const [serviceAreasRaw, setServiceAreasRaw] = useState('')
  const [targetZipCodesRaw, setTargetZipCodesRaw] = useState('')
  const [serviceTypes, setServiceTypes] = useState<string[]>(['Roofing'])
  const [operatingHoursStart, setOperatingHoursStart] = useState('09:00')
  const [operatingHoursEnd, setOperatingHoursEnd] = useState('17:00')
  const [leadRoutingPhonesRaw, setLeadRoutingPhonesRaw] = useState('')
  const [leadRoutingEmailsRaw, setLeadRoutingEmailsRaw] = useState('')
  const [leadNotificationPhone, setLeadNotificationPhone] = useState('')
  const [leadNotificationEmail, setLeadNotificationEmail] = useState('')
  const [leadProspectEmail, setLeadProspectEmail] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [desiredLeadVolumeDaily, setDesiredLeadVolumeDaily] = useState<number>(6)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const draftStorageKey = useMemo(() => getDraftStorageKey(token), [token])

  useEffect(() => {
    const draft = parseOnboardingDraft(safeReadDraft(draftStorageKey))
    if (!draft) return
    setServiceAreasRaw(draft.form.serviceAreasRaw)
    setTargetZipCodesRaw(draft.form.targetZipCodesRaw)
    setServiceTypes(draft.form.serviceTypes)
    setOperatingHoursStart(draft.form.operatingHoursStart)
    setOperatingHoursEnd(draft.form.operatingHoursEnd)
    setLeadRoutingPhonesRaw(draft.form.leadRoutingPhonesRaw)
    setLeadRoutingEmailsRaw(draft.form.leadRoutingEmailsRaw)
    setLeadNotificationPhone(draft.form.leadNotificationPhone)
    setLeadNotificationEmail(draft.form.leadNotificationEmail)
    setLeadProspectEmail(draft.form.leadProspectEmail)
    setBusinessPhone(draft.form.businessPhone)
    setBusinessAddress(draft.form.businessAddress)
    setDesiredLeadVolumeDaily(draft.form.desiredLeadVolumeDaily)
    setSaveNotice(`Draft restored from ${new Date(draft.savedAt).toLocaleString()}.`)
  }, [draftStorageKey])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/public/leadgen/onboarding-session?token=${encodeURIComponent(token)}`)
        const data = (await parseJson<SessionResponse>(res)) || { success: false, error: 'Invalid response' }
        if (!res.ok || !data.success) {
          throw new Error((data as { error?: string }).error || 'Failed to load session')
        }
        if (!mounted) return
        setSession(data)
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'Failed to load session')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [token])

  const validation = useMemo(() => {
    const serviceAreas = splitLines(serviceAreasRaw)
    const targetZipCodes = splitComma(targetZipCodesRaw)
    const leadRoutingPhones = splitComma(leadRoutingPhonesRaw)
    const leadRoutingEmails = splitComma(leadRoutingEmailsRaw)

    const errors: string[] = []
    if (serviceAreas.length === 0) errors.push('Add at least 1 service area.')
    if (targetZipCodes.length < 5) errors.push('Add at least 5 target ZIP codes.')
    if (targetZipCodes.length > 10) errors.push('Maximum 10 target ZIP codes.')
    if (serviceTypes.length === 0) errors.push('Select at least 1 service type.')
    if (leadRoutingPhones.length === 0 && leadRoutingEmails.length === 0) {
      errors.push('Add at least 1 lead routing phone or email.')
    }

    return {
      ok: errors.length === 0,
      errors,
      payload: {
        businessPhone: cleanString(businessPhone) || undefined,
        businessAddress: cleanString(businessAddress) || undefined,
        serviceAreas,
        targetZipCodes,
        serviceTypes,
        desiredLeadVolumeDaily: Number.isFinite(desiredLeadVolumeDaily) ? desiredLeadVolumeDaily : undefined,
        operatingHoursStart: cleanString(operatingHoursStart) || undefined,
        operatingHoursEnd: cleanString(operatingHoursEnd) || undefined,
        leadRoutingPhones,
        leadRoutingEmails,
        leadNotificationPhone: cleanString(leadNotificationPhone) || undefined,
        leadNotificationEmail: cleanString(leadNotificationEmail) || undefined,
        leadProspectEmail: cleanString(leadProspectEmail) || undefined,
      },
    }
  }, [
    businessPhone,
    businessAddress,
    serviceAreasRaw,
    targetZipCodesRaw,
    serviceTypes,
    desiredLeadVolumeDaily,
    operatingHoursStart,
    operatingHoursEnd,
    leadRoutingPhonesRaw,
    leadRoutingEmailsRaw,
    leadNotificationPhone,
    leadNotificationEmail,
    leadProspectEmail,
  ])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setSaveError(null)

    if (!validation.ok) {
      setSubmitError(validation.errors[0] || 'Please fix the form.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/public/leadgen/onboarding-complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token,
          onboardingPayload: validation.payload,
        }),
      })
      const data = (await parseJson<CompleteResponse>(res)) || { success: false, error: 'Invalid response' }
      if (!res.ok || !data.success) {
        throw new Error((data as { error?: string }).error || 'Failed to complete onboarding')
      }
      safeClearDraft(draftStorageKey)
      window.location.assign('/portal')
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to complete onboarding')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSaveForLater() {
    setSubmitError(null)
    setSaveError(null)

    const snapshot: OnboardingDraftSnapshot = {
      savedAt: Date.now(),
      form: {
        serviceAreasRaw,
        targetZipCodesRaw,
        serviceTypes,
        operatingHoursStart,
        operatingHoursEnd,
        leadRoutingPhonesRaw,
        leadRoutingEmailsRaw,
        leadNotificationPhone,
        leadNotificationEmail,
        leadProspectEmail,
        businessPhone,
        businessAddress,
        desiredLeadVolumeDaily,
      },
    }

    const saved = safeWriteDraft(draftStorageKey, snapshot)
    if (!saved) {
      setSaveError('Could not save your draft in this browser. Please keep this tab open and try again.')
      return
    }

    setSaveNotice(`Draft saved at ${new Date(snapshot.savedAt).toLocaleString()}. You can complete this later.`)
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-lg">
        <p className="text-[var(--text-secondary)]">Loading onboarding...</p>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-lg">
        <p className="font-semibold">Unable to load onboarding session</p>
        <p className="mt-2 text-sm">{error || 'Invalid link.'}</p>
      </div>
    )
  }

  if (session.status !== 'paid' && session.status !== 'invited' && session.status !== 'onboarding_completed') {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-lg">
        <p className="text-[var(--text-primary)] font-semibold">Payment not confirmed yet</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          If you just paid, please wait a minute and refresh. If this persists, contact support.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Finish Setup</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Company: <span className="font-semibold text-[var(--text-primary)]">{session.companyName}</span>
        {' '}({session.billingEmail})
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Business phone (optional)</span>
            <input
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
            />
          </label>
          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Desired leads/day (optional)</span>
            <input
              type="number"
              min={1}
              step={1}
              value={desiredLeadVolumeDaily}
              onChange={(e) => setDesiredLeadVolumeDaily(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
            />
          </label>
        </div>

        <label>
          <span className="block text-sm font-semibold text-[var(--text-primary)]">Business address (optional)</span>
          <input
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
          />
        </label>

        <label>
          <span className="block text-sm font-semibold text-[var(--text-primary)]">Service areas</span>
          <textarea
            value={serviceAreasRaw}
            onChange={(e) => setServiceAreasRaw(e.target.value)}
            placeholder={"New Orleans, LA\nMetairie, LA"}
            className="mt-1 min-h-[110px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">One per line.</p>
        </label>

        <label>
          <span className="block text-sm font-semibold text-[var(--text-primary)]">Target ZIP codes</span>
          <input
            value={targetZipCodesRaw}
            onChange={(e) => setTargetZipCodesRaw(e.target.value)}
            placeholder="70112, 70113, 70114, 70115, 70116"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">Comma-separated. Minimum 5, maximum 10.</p>
        </label>

        <fieldset className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
          <legend className="px-2 text-sm font-semibold text-[var(--text-primary)]">Service types</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SERVICE_TYPES.map((type) => {
              const checked = serviceTypes.includes(type)
              return (
                <label key={type} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setServiceTypes((prev) => (checked ? prev.filter((t) => t !== type) : [...prev, type]))
                    }}
                  />
                  <span>{type}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Operating hours start</span>
            <input
              type="time"
              value={operatingHoursStart}
              onChange={(e) => setOperatingHoursStart(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
            />
          </label>
          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Operating hours end</span>
            <input
              type="time"
              value={operatingHoursEnd}
              onChange={(e) => setOperatingHoursEnd(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
            />
          </label>
        </div>

        <label>
          <span className="block text-sm font-semibold text-[var(--text-primary)]">Lead routing phones (optional)</span>
          <input
            value={leadRoutingPhonesRaw}
            onChange={(e) => setLeadRoutingPhonesRaw(e.target.value)}
            placeholder="(555) 555-5555, (555) 555-5556"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
          />
        </label>

        <label>
          <span className="block text-sm font-semibold text-[var(--text-primary)]">Lead routing emails (optional)</span>
          <input
            value={leadRoutingEmailsRaw}
            onChange={(e) => setLeadRoutingEmailsRaw(e.target.value)}
            placeholder="leads@company.com, office@company.com"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Notification phone (optional)</span>
            <input
              value={leadNotificationPhone}
              onChange={(e) => setLeadNotificationPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
            />
          </label>
          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Notification email (optional)</span>
            <input
              value={leadNotificationEmail}
              onChange={(e) => setLeadNotificationEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
            />
          </label>
        </div>

        <label>
          <span className="block text-sm font-semibold text-[var(--text-primary)]">Prospect email (optional)</span>
          <input
            value={leadProspectEmail}
            onChange={(e) => setLeadProspectEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
          />
        </label>

        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {saveError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            {saveError}
          </div>
        )}

        {saveNotice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {saveNotice}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSaveForLater}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save & Complete Later
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-white hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Complete Onboarding'}
          </button>
        </div>
      </form>
    </div>
  )
}
