'use client'

import { FormEvent, useMemo, useState } from 'react'
import {
  normalizePortalEditableProfile,
  splitCsvOrLines,
  splitMultiline,
  type PortalEditableProfile,
} from '@/lib/portal-profile'

type SaveResponse = {
  success: boolean
  error?: string
  errors?: string[]
  profile?: PortalEditableProfile
  audit?: {
    editId: string
    changedKeys: string[]
    addedZipCodes: string[]
    removedZipCodes: string[]
  }
}

type ZipChangeRequestResponse = {
  success: boolean
  error?: string
  message?: string
  requested?: {
    addZipCodes: string[]
    removeZipCodes: string[]
    note?: string
  }
}

const CHANGED_KEY_LABELS: Record<string, string> = {
  serviceAreas: 'Service Areas',
  targetZipCodes: 'Target ZIP Codes',
  leadDeliveryPhones: 'Lead Destination Phones',
  leadDeliveryEmails: 'Lead Destination Emails',
  leadNotificationPhone: 'Alert Phone',
  leadNotificationEmail: 'Alert Email',
  leadProspectEmail: 'Business Email For Prospects',
}

const ZIP_RE = /^\d{5}$/

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function optionalText(value: string): string | undefined {
  const cleaned = value.trim()
  return cleaned.length > 0 ? cleaned : undefined
}

export default function PortalProfileEditor({
  initialProfile,
  isPreviewMode,
  previewToken,
}: {
  initialProfile: PortalEditableProfile
  isPreviewMode: boolean
  previewToken?: string
}) {
  const [serviceAreasRaw, setServiceAreasRaw] = useState(initialProfile.serviceAreas.join('\n'))
  const [targetZipCodes, setTargetZipCodes] = useState(initialProfile.targetZipCodes)
  const [leadDeliveryPhonesRaw, setLeadDeliveryPhonesRaw] = useState(initialProfile.leadDeliveryPhones.join(', '))
  const [leadDeliveryEmailsRaw, setLeadDeliveryEmailsRaw] = useState(initialProfile.leadDeliveryEmails.join(', '))
  const [leadNotificationPhone, setLeadNotificationPhone] = useState(initialProfile.leadNotificationPhone || '')
  const [leadNotificationEmail, setLeadNotificationEmail] = useState(initialProfile.leadNotificationEmail || '')
  const [leadProspectEmail, setLeadProspectEmail] = useState(initialProfile.leadProspectEmail || '')
  const [zipAddRequestRaw, setZipAddRequestRaw] = useState('')
  const [zipRemoveRequestRaw, setZipRemoveRequestRaw] = useState('')
  const [zipRequestNoteRaw, setZipRequestNoteRaw] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [saveAudit, setSaveAudit] = useState<SaveResponse['audit'] | null>(null)
  const [zipRequesting, setZipRequesting] = useState(false)
  const [zipRequestError, setZipRequestError] = useState<string | null>(null)
  const [zipRequestNotice, setZipRequestNotice] = useState<string | null>(null)

  const draftProfile = useMemo(
    () => ({
      serviceAreas: splitMultiline(serviceAreasRaw),
      targetZipCodes,
      leadDeliveryPhones: splitCsvOrLines(leadDeliveryPhonesRaw),
      leadDeliveryEmails: splitCsvOrLines(leadDeliveryEmailsRaw),
      leadNotificationPhone: optionalText(leadNotificationPhone),
      leadNotificationEmail: optionalText(leadNotificationEmail),
      leadProspectEmail: optionalText(leadProspectEmail),
    }),
    [
      serviceAreasRaw,
      targetZipCodes,
      leadDeliveryPhonesRaw,
      leadDeliveryEmailsRaw,
      leadNotificationPhone,
      leadNotificationEmail,
      leadProspectEmail,
    ]
  )

  const validation = useMemo(() => normalizePortalEditableProfile(draftProfile), [draftProfile])
  const zipRequestDraft = useMemo(
    () => ({
      addZipCodes: splitCsvOrLines(zipAddRequestRaw),
      removeZipCodes: splitCsvOrLines(zipRemoveRequestRaw),
      note: optionalText(zipRequestNoteRaw),
    }),
    [zipAddRequestRaw, zipRemoveRequestRaw, zipRequestNoteRaw]
  )

  const zipRequestValidationError = useMemo(() => {
    if (zipRequestDraft.addZipCodes.length === 0 && zipRequestDraft.removeZipCodes.length === 0) {
      return 'Add at least one ZIP to request.'
    }

    const invalidAddZip = zipRequestDraft.addZipCodes.find((zip) => !ZIP_RE.test(zip))
    if (invalidAddZip) {
      return `ZIP must be 5 digits: ${invalidAddZip}`
    }

    const invalidRemoveZip = zipRequestDraft.removeZipCodes.find((zip) => !ZIP_RE.test(zip))
    if (invalidRemoveZip) {
      return `ZIP must be 5 digits: ${invalidRemoveZip}`
    }

    const removeSet = new Set(zipRequestDraft.removeZipCodes)
    const overlap = zipRequestDraft.addZipCodes.find((zip) => removeSet.has(zip))
    if (overlap) {
      return `ZIP cannot be both add and remove in the same request: ${overlap}`
    }

    return null
  }, [zipRequestDraft])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaveError(null)
    setSaveNotice(null)

    if (!validation.ok) {
      setSaveError(validation.errors[0] || 'Please fix the form errors before saving.')
      return
    }

    if (isPreviewMode && !previewToken) {
      setSaveError('Internal preview token is missing. Open this portal again from the internal dashboard.')
      return
    }

    setSaving(true)

    try {
      const endpoint = isPreviewMode ? '/api/internal/portal/profile' : '/api/portal/profile'
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          profile: validation.profile,
          previewToken: isPreviewMode ? previewToken : undefined,
        }),
      })

      const text = await response.text()
      const data = parseJson<SaveResponse>(text)
      if (!response.ok || !data?.success) {
        const errorMessage = data?.error || 'Failed to save profile changes.'
        throw new Error(errorMessage)
      }

      const normalized = normalizePortalEditableProfile(data.profile || validation.profile)
      setServiceAreasRaw(normalized.profile.serviceAreas.join('\n'))
      setTargetZipCodes(normalized.profile.targetZipCodes)
      setLeadDeliveryPhonesRaw(normalized.profile.leadDeliveryPhones.join(', '))
      setLeadDeliveryEmailsRaw(normalized.profile.leadDeliveryEmails.join(', '))
      setLeadNotificationPhone(normalized.profile.leadNotificationPhone || '')
      setLeadNotificationEmail(normalized.profile.leadNotificationEmail || '')
      setLeadProspectEmail(normalized.profile.leadProspectEmail || '')
      setSaveAudit(data.audit || null)
      setSaveNotice('Lead settings updated successfully.')
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handleZipRequestSubmit(event: FormEvent) {
    event.preventDefault()
    setZipRequestError(null)
    setZipRequestNotice(null)

    if (isPreviewMode) {
      setZipRequestError('ZIP requests are only available in client mode.')
      return
    }

    if (zipRequestValidationError) {
      setZipRequestError(zipRequestValidationError)
      return
    }

    setZipRequesting(true)
    try {
      const response = await fetch('/api/portal/zip-change-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          addZipCodes: zipRequestDraft.addZipCodes,
          removeZipCodes: zipRequestDraft.removeZipCodes,
          note: zipRequestDraft.note,
        }),
      })

      const text = await response.text()
      const data = parseJson<ZipChangeRequestResponse>(text)
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to submit ZIP change request.')
      }

      setZipAddRequestRaw('')
      setZipRemoveRequestRaw('')
      setZipRequestNoteRaw('')
      setZipRequestNotice(data.message || 'ZIP change request submitted.')
    } catch (error) {
      setZipRequestError(error instanceof Error ? error.message : 'Failed to submit ZIP change request.')
    } finally {
      setZipRequesting(false)
    }
  }

  return (
    <section className="mt-8 rounded-2xl border-0 bg-[var(--bg-card)] p-6 shadow-md ring-1 ring-[var(--border)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">
            Edit Lead Settings
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Update where leads are sent and who should receive alerts.
          </p>
        </div>
        {isPreviewMode ? (
          <span className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            Internal admin edit mode
          </span>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">How contact fields work</p>
          <p className="mt-1">
            Lead destination phone/email: where new leads are delivered.
          </p>
          <p className="mt-1">
            Alert phone/email: separate alert contacts (does not control lead delivery destination).
          </p>
          <p className="mt-1">
            Business email for prospects: your customer-facing email for prospect communications.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Service areas</span>
            <textarea
              value={serviceAreasRaw}
              onChange={(event) => setServiceAreasRaw(event.target.value)}
              className="mt-2 min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder={'New Orleans, LA\nMetairie, LA'}
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">One area per line.</p>
          </label>

          <div>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Active target ZIP codes</span>
            <div className="mt-2 min-h-[120px] rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3">
              {targetZipCodes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {targetZipCodes.map((zip) => (
                    <span
                      key={zip}
                      className="inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1 text-sm font-semibold text-[var(--text-primary)]"
                    >
                      {zip}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No ZIP codes on file yet.</p>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Managed by support. Use request form below to add or remove ZIPs.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Lead destination phones</span>
            <input
              value={leadDeliveryPhonesRaw}
              onChange={(event) => setLeadDeliveryPhonesRaw(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="(555) 555-5555, (555) 555-5556"
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              New leads can be routed here. Comma-separated.
            </p>
          </label>

          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Lead destination emails</span>
            <input
              value={leadDeliveryEmailsRaw}
              onChange={(event) => setLeadDeliveryEmailsRaw(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="leads@company.com, office@company.com"
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              New lead details can be emailed here. Comma-separated.
            </p>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Alert phone</span>
            <input
              value={leadNotificationPhone}
              onChange={(event) => setLeadNotificationPhone(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="(555) 555-5555"
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Optional alert contact only. Does not route leads.
            </p>
          </label>

          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Alert email</span>
            <input
              value={leadNotificationEmail}
              onChange={(event) => setLeadNotificationEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="ops@company.com"
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Optional alert contact only. Does not route leads.
            </p>
          </label>

          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Business email for prospects</span>
            <input
              value={leadProspectEmail}
              onChange={(event) => setLeadProspectEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="info@company.com"
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Customer-facing email used for prospect communications.
            </p>
          </label>
        </div>

        {!validation.ok ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {validation.errors[0]}
          </div>
        ) : null}

        {saveError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</div>
        ) : null}

        {saveNotice ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{saveNotice}</div>
        ) : null}

        {saveAudit ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">Change summary</p>
            <p className="mt-1">
              Updated fields:{' '}
              {saveAudit.changedKeys.length > 0
                ? saveAudit.changedKeys.map((key) => CHANGED_KEY_LABELS[key] || key).join(', ')
                : 'No field values changed'}
            </p>
            <p className="mt-1">ZIP added: {saveAudit.addedZipCodes.length > 0 ? saveAudit.addedZipCodes.join(', ') : 'none'}</p>
            <p className="mt-1">ZIP removed: {saveAudit.removedZipCodes.length > 0 ? saveAudit.removedZipCodes.join(', ') : 'none'}</p>
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md"
          >
            {saving ? 'Saving...' : 'Save Lead Settings'}
          </button>
        </div>
      </form>

      {!isPreviewMode ? (
        <form
          onSubmit={handleZipRequestSubmit}
          className="mt-8 grid gap-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5"
        >
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--text-primary)]">
              Request ZIP Changes
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Submit ZIP additions/removals for manual review. Your active ZIP list stays unchanged until support confirms the update.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="block text-sm font-semibold text-[var(--text-primary)]">ZIPs to add</span>
              <textarea
                value={zipAddRequestRaw}
                onChange={(event) => setZipAddRequestRaw(event.target.value)}
                className="mt-2 min-h-[100px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
                placeholder={'70132, 70001'}
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">Comma or new line. 5-digit ZIPs only.</p>
            </label>

            <label>
              <span className="block text-sm font-semibold text-[var(--text-primary)]">ZIPs to remove</span>
              <textarea
                value={zipRemoveRequestRaw}
                onChange={(event) => setZipRemoveRequestRaw(event.target.value)}
                className="mt-2 min-h-[100px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
                placeholder={'70115'}
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">Comma or new line. Leave blank if no removals.</p>
            </label>
          </div>

          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Notes (optional)</span>
            <textarea
              value={zipRequestNoteRaw}
              onChange={(event) => setZipRequestNoteRaw(event.target.value)}
              className="mt-2 min-h-[90px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
              placeholder="Anything we should know about these ZIP changes?"
            />
          </label>

          {zipRequestError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{zipRequestError}</div>
          ) : null}

          {zipRequestNotice ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{zipRequestNotice}</div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={zipRequesting}
              className="inline-flex rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md"
            >
              {zipRequesting ? 'Submitting...' : 'Submit ZIP Request'}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
