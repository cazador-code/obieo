'use client'

import { FormEvent, useMemo, useState } from 'react'
import {
  normalizePortalEditableProfile,
  splitCsvOrLines,
  splitMultiline,
  type PortalEditableProfile,
} from '@/lib/portal-profile'
import { type ZipChangeRequestSnapshot } from '@/lib/convex'

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

const CHANGED_KEY_LABELS: Record<string, string> = {
  serviceAreas: 'Service Areas',
  targetZipCodes: 'Target ZIP Codes',
  leadDeliveryPhones: 'Lead Routing Phones',
  leadDeliveryEmails: 'Lead Routing Emails',
  leadNotificationPhone: 'Notification Phone',
  leadNotificationEmail: 'Notification Email',
  leadProspectEmail: 'Prospect Email',
}

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
  latestZipRequest,
  serviceAreas,
}: {
  initialProfile: PortalEditableProfile
  isPreviewMode: boolean
  previewToken?: string
  latestZipRequest?: ZipChangeRequestSnapshot | null
  serviceAreas?: string[]
}) {
  const [serviceAreasRaw, setServiceAreasRaw] = useState(initialProfile.serviceAreas.join('\n'))
  const [targetZipCodesRaw, setTargetZipCodesRaw] = useState(initialProfile.targetZipCodes.join(', '))
  const [leadDeliveryPhonesRaw, setLeadDeliveryPhonesRaw] = useState(initialProfile.leadDeliveryPhones.join(', '))
  const [leadDeliveryEmailsRaw, setLeadDeliveryEmailsRaw] = useState(initialProfile.leadDeliveryEmails.join(', '))
  const [leadNotificationPhone, setLeadNotificationPhone] = useState(initialProfile.leadNotificationPhone || '')
  const [leadNotificationEmail, setLeadNotificationEmail] = useState(initialProfile.leadNotificationEmail || '')
  const [leadProspectEmail, setLeadProspectEmail] = useState(initialProfile.leadProspectEmail || '')

  const [showZipRequestForm, setShowZipRequestForm] = useState(false)
  const [zipRequestRaw, setZipRequestRaw] = useState(initialProfile.targetZipCodes.join(', '))
  const [zipRequestReason, setZipRequestReason] = useState('')
  const [zipRequestSaving, setZipRequestSaving] = useState(false)
  const [zipRequestError, setZipRequestError] = useState<string | null>(null)
  const [zipRequestSuccess, setZipRequestSuccess] = useState<string | null>(null)
  const [currentZipRequest, setCurrentZipRequest] = useState(latestZipRequest || null)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [saveAudit, setSaveAudit] = useState<SaveResponse['audit'] | null>(null)

  const draftProfile = useMemo(
    () => ({
      serviceAreas: splitMultiline(serviceAreasRaw),
      targetZipCodes: splitCsvOrLines(targetZipCodesRaw),
      leadDeliveryPhones: splitCsvOrLines(leadDeliveryPhonesRaw),
      leadDeliveryEmails: splitCsvOrLines(leadDeliveryEmailsRaw),
      leadNotificationPhone: optionalText(leadNotificationPhone),
      leadNotificationEmail: optionalText(leadNotificationEmail),
      leadProspectEmail: optionalText(leadProspectEmail),
    }),
    [
      serviceAreasRaw,
      targetZipCodesRaw,
      leadDeliveryPhonesRaw,
      leadDeliveryEmailsRaw,
      leadNotificationPhone,
      leadNotificationEmail,
      leadProspectEmail,
    ]
  )

  const validation = useMemo(() => normalizePortalEditableProfile(draftProfile), [draftProfile])

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
      setTargetZipCodesRaw(normalized.profile.targetZipCodes.join(', '))
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

  async function handleZipChangeRequest() {
    setZipRequestError(null)
    setZipRequestSuccess(null)

    const zips = splitCsvOrLines(zipRequestRaw)
    if (zips.length < 5) {
      setZipRequestError('At least 5 ZIP codes required.')
      return
    }
    if (zips.length > 200) {
      setZipRequestError('Maximum 200 ZIP codes allowed.')
      return
    }
    const invalid = zips.find((z) => !/^\d{5}$/.test(z))
    if (invalid) {
      setZipRequestError(`ZIP must be 5 digits: ${invalid}`)
      return
    }

    setZipRequestSaving(true)
    try {
      const response = await fetch('/api/portal/zip-change-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          requestedZipCodes: zips,
          reason: zipRequestReason.trim() || undefined,
        }),
      })

      const text = await response.text()
      const data = parseJson<{
        success: boolean
        error?: string
        requestId?: string
        addedZipCodes?: string[]
        removedZipCodes?: string[]
      }>(text)

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to submit request.')
      }

      setZipRequestSuccess('ZIP change request submitted. We\'ll review it shortly.')
      setShowZipRequestForm(false)
      setCurrentZipRequest({
        _id: data.requestId || '',
        organizationId: '',
        portalKey: '',
        status: 'pending',
        currentZipCodes: initialProfile.targetZipCodes,
        requestedZipCodes: zips,
        addedZipCodes: data.addedZipCodes || [],
        removedZipCodes: data.removedZipCodes || [],
        requestedAt: Date.now(),
      })
    } catch (error) {
      setZipRequestError(error instanceof Error ? error.message : 'Failed to submit request.')
    } finally {
      setZipRequestSaving(false)
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
            Update where leads are routed and where your campaigns are active.
          </p>
        </div>
        {isPreviewMode ? (
          <span className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            Internal admin edit mode
          </span>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Service areas</span>
            {!isPreviewMode ? (
              <>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(serviceAreas || []).length > 0 ? (
                    (serviceAreas || []).map((area) => (
                      <span
                        key={area}
                        className="inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-1 text-sm text-[var(--text-primary)]"
                      >
                        {area}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[var(--text-muted)]">No service areas set</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Contact us to update your service areas.</p>
              </>
            ) : (
              <>
                <textarea
                  value={serviceAreasRaw}
                  onChange={(event) => setServiceAreasRaw(event.target.value)}
                  className="mt-2 min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                  placeholder={'New Orleans, LA\nMetairie, LA'}
                />
                <p className="mt-1 text-xs text-[var(--text-muted)]">One area per line.</p>
              </>
            )}
          </div>

          <div>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Target ZIP codes</span>
            {!isPreviewMode ? (
              <>
                <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)]">
                  {initialProfile.targetZipCodes.length > 0
                    ? initialProfile.targetZipCodes.join(', ')
                    : 'No ZIP codes set'}
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {initialProfile.targetZipCodes.length} ZIP codes active. Changes require admin approval.
                </p>

                {currentZipRequest?.status === 'pending' ? (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <p className="font-semibold">ZIP change request pending</p>
                    <p className="mt-1">
                      Submitted {new Date(currentZipRequest.requestedAt).toLocaleDateString()}.
                      {currentZipRequest.addedZipCodes.length > 0 && ` Adding ${currentZipRequest.addedZipCodes.length} ZIPs.`}
                      {currentZipRequest.removedZipCodes.length > 0 && ` Removing ${currentZipRequest.removedZipCodes.length} ZIPs.`}
                    </p>
                  </div>
                ) : null}

                {currentZipRequest?.status === 'rejected' ? (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-semibold">Last ZIP change request was not approved</p>
                    {currentZipRequest.resolutionNotes ? (
                      <p className="mt-1">{currentZipRequest.resolutionNotes}</p>
                    ) : null}
                  </div>
                ) : null}

                {zipRequestSuccess ? (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {zipRequestSuccess}
                  </div>
                ) : null}

                {currentZipRequest?.status !== 'pending' && !zipRequestSuccess ? (
                  !showZipRequestForm ? (
                    <button
                      type="button"
                      onClick={() => setShowZipRequestForm(true)}
                      className="mt-3 inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                    >
                      Request ZIP Change
                    </button>
                  ) : (
                    <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Request new ZIP codes</p>
                      <textarea
                        value={zipRequestRaw}
                        onChange={(event) => setZipRequestRaw(event.target.value)}
                        className="mt-2 min-h-[100px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm"
                        placeholder="70112, 70113, 70114"
                      />
                      <p className="mt-1 text-xs text-[var(--text-muted)]">5-digit ZIPs, comma or newline separated. Min 5, max 200.</p>
                      <textarea
                        value={zipRequestReason}
                        onChange={(event) => setZipRequestReason(event.target.value)}
                        className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm"
                        placeholder="Reason for change (optional)"
                        rows={2}
                      />
                      {zipRequestError ? (
                        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                          {zipRequestError}
                        </div>
                      ) : null}
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={handleZipChangeRequest}
                          disabled={zipRequestSaving}
                          className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
                        >
                          {zipRequestSaving ? 'Submitting...' : 'Submit Request'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowZipRequestForm(false)
                            setZipRequestError(null)
                          }}
                          className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )
                ) : null}
              </>
            ) : (
              <>
                <textarea
                  value={targetZipCodesRaw}
                  onChange={(event) => setTargetZipCodesRaw(event.target.value)}
                  className="mt-2 min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
                  placeholder={'70112, 70113, 70114\n70115, 70116'}
                />
                <p className="mt-1 text-xs text-[var(--text-muted)]">5-digit ZIPs only. Minimum 5, maximum 200.</p>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Lead routing phones</span>
            <input
              value={leadDeliveryPhonesRaw}
              onChange={(event) => setLeadDeliveryPhonesRaw(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="(555) 555-5555, (555) 555-5556"
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">Comma-separated.</p>
          </label>

          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Lead routing emails</span>
            <input
              value={leadDeliveryEmailsRaw}
              onChange={(event) => setLeadDeliveryEmailsRaw(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="leads@company.com, office@company.com"
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">Comma-separated.</p>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Notification phone</span>
            <input
              value={leadNotificationPhone}
              onChange={(event) => setLeadNotificationPhone(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="(555) 555-5555"
            />
          </label>

          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Notification email</span>
            <input
              value={leadNotificationEmail}
              onChange={(event) => setLeadNotificationEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="ops@company.com"
            />
          </label>

          <label>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">Prospect email</span>
            <input
              value={leadProspectEmail}
              onChange={(event) => setLeadProspectEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3"
              placeholder="prospects@company.com"
            />
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
    </section>
  )
}
