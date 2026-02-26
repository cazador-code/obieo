'use client'

import { useId, useMemo, useState } from 'react'

type Props = {
  requestId: string
  portalKey: string
  currentZipCodes: string[]
  requestedZipCodes: string[]
  addedZipCodes: string[]
  removedZipCodes: string[]
  note?: string
}

type ResolveResponse = {
  success: boolean
  error?: string
  decision?: 'approve' | 'reject'
  targetZipCodes?: string[]
}

function asCsv(values: string[]): string {
  return values.length > 0 ? values.join(', ') : 'none'
}

export default function ZipRequestActions({
  requestId,
  portalKey,
  currentZipCodes,
  requestedZipCodes,
  addedZipCodes,
  removedZipCodes,
  note,
}: Props) {
  const [isSaving, setIsSaving] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const resolutionNotesFieldId = useId()

  const deltaSummary = useMemo(
    () => ({
      add: asCsv(addedZipCodes),
      remove: asCsv(removedZipCodes),
      current: asCsv(currentZipCodes),
      requested: asCsv(requestedZipCodes),
    }),
    [addedZipCodes, currentZipCodes, removedZipCodes, requestedZipCodes]
  )

  async function handleResolve(decision: 'approve' | 'reject') {
    setIsSaving(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch('/api/internal/zip-change-request/resolve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          requestId,
          decision,
          resolutionNotes: resolutionNotes.trim() || undefined,
        }),
      })

      const data = (await response.json().catch(() => null)) as ResolveResponse | null
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Could not resolve ZIP request.')
      }

      setNotice(
        decision === 'approve'
          ? 'ZIP request approved. Convex and Airtable are now updated.'
          : 'ZIP request rejected.'
      )

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resolve ZIP request.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
      <p className="font-semibold">Pending ZIP Request</p>
      <p className="mt-1">
        Add: {deltaSummary.add}
      </p>
      <p>
        Remove: {deltaSummary.remove}
      </p>
      <p className="mt-1 text-[11px] text-amber-800">
        Current: {deltaSummary.current}
      </p>
      <p className="text-[11px] text-amber-800">
        Requested: {deltaSummary.requested}
      </p>
      {note ? <p className="mt-1 text-[11px] text-amber-800">Note: {note}</p> : null}
      <label htmlFor={resolutionNotesFieldId} className="mt-2 block text-[11px] font-medium text-amber-900">
        Resolution notes (optional)
      </label>
      <textarea
        id={resolutionNotesFieldId}
        name="resolutionNotes"
        value={resolutionNotes}
        onChange={(event) => setResolutionNotes(event.target.value)}
        placeholder="Optional resolution note"
        className="mt-1 min-h-[58px] w-full rounded-md border border-amber-300 bg-white px-2 py-1.5 text-xs text-[var(--text-primary)]"
      />
      {error ? <p className="mt-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-red-700">{error}</p> : null}
      {notice ? (
        <p className="mt-2 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">{notice}</p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleResolve('approve')}
          className="rounded bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Approve'}
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleResolve('reject')}
          className="rounded bg-slate-700 px-2.5 py-1 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reject
        </button>
      </div>
      <p className="mt-2 text-[11px] text-amber-800">
        Approval checks Airtable active clients for ZIP conflicts before applying changes.
      </p>
      <p className="text-[11px] text-amber-800">Request ID: {requestId}</p>
      <p className="text-[11px] text-amber-800">Portal: {portalKey}</p>
    </div>
  )
}
