'use client'

import { useState } from 'react'

type Props = {
  portalKey: string
}

type LeadBackfillResponse = {
  synced: boolean
  reason?: 'not_configured' | 'client_not_found' | 'client_ambiguous' | 'fetch_failed' | 'convex_write_failed'
  message?: string
  totalLinkedLeadRows: number
  scannedLeadRows: number
  createdLeadEvents: number
  duplicateLeadEvents: number
  failedLeadEvents: number
}

type ResyncResponse = {
  success: boolean
  error?: string
  updatedFields?: string[]
  created?: boolean
  leadBackfill?: LeadBackfillResponse
}

function humanizeLeadBackfillReason(reason: LeadBackfillResponse['reason']): string {
  switch (reason) {
    case 'not_configured':
      return 'Airtable lead backfill is not configured.'
    case 'client_not_found':
      return 'Backfill could not find a matching Airtable client row.'
    case 'client_ambiguous':
      return 'Backfill matched multiple Airtable client rows.'
    case 'fetch_failed':
      return 'Backfill could not read Airtable rows.'
    case 'convex_write_failed':
      return 'Backfill could not write one or more leads into Convex.'
    default:
      return 'Airtable lead backfill failed.'
  }
}

export default function AirtableResyncButton({ portalKey }: Props) {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleResync() {
    setSyncing(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch('/api/internal/clients/resync-airtable', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ portalKey }),
      })

      const data = (await response.json().catch(() => null)) as ResyncResponse | null
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Could not resync Airtable row.')
      }

      const count = Array.isArray(data.updatedFields) ? data.updatedFields.length : 0
      const leadBackfill = data.leadBackfill
      const leadSummary =
        leadBackfill && leadBackfill.synced
          ? ` Leads synced: +${leadBackfill.createdLeadEvents}, dupes ${leadBackfill.duplicateLeadEvents}, failed ${leadBackfill.failedLeadEvents}.`
          : ''
      const leadBackfillError =
        leadBackfill && !leadBackfill.synced
          ? leadBackfill.message || humanizeLeadBackfillReason(leadBackfill.reason)
          : null
      if (data?.created) {
        setNotice(
          count > 0
            ? `Airtable row created (${count} fields).${leadSummary}`
            : `Airtable row created.${leadSummary}`
        )
      } else {
        setNotice(
          count > 0
            ? `Airtable synced (${count} fields).${leadSummary}`
            : `Airtable sync complete.${leadSummary}`
        )
      }
      if (leadBackfillError) {
        setError(`Lead backfill warning: ${leadBackfillError}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resync Airtable row.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2">
      <button
        type="button"
        onClick={() => void handleResync()}
        disabled={syncing}
        className="inline-flex rounded-md border border-[var(--border)] bg-white px-2 py-1 text-[11px] font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {syncing ? 'Resyncing...' : 'Resync Airtable'}
      </button>
      {notice ? <p className="mt-1 text-[11px] text-emerald-700">{notice}</p> : null}
      {error ? <p className="mt-1 text-[11px] text-red-600">{error}</p> : null}
    </div>
  )
}
