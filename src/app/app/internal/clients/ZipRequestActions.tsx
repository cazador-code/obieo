'use client'

import { useEffect, useId, useMemo, useState } from 'react'

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
  reason?: string
  conflictingZipCodes?: string[]
  conflicts?: ZipConflictRow[]
  conflictCount?: number
}

type ZipConflictRow = {
  zipCode: string
  businessName: string
  status: string
}

type CheckConflictsResponse = {
  success: boolean
  error?: string
  conflict?: boolean
  conflictingZipCodes?: string[]
  conflicts?: ZipConflictRow[]
  conflictCount?: number
}

function asCsv(values: string[]): string {
  return values.length > 0 ? values.join(', ') : 'none'
}

function getDisplayedConflictZipCodes(conflictingZipCodes: string[], conflicts: ZipConflictRow[]): string[] {
  return conflictingZipCodes.length > 0
    ? conflictingZipCodes
    : Array.from(new Set(conflicts.map((item) => item.zipCode)))
}

function conflictSummary(
  conflictingZipCodes: string[],
  conflicts: ZipConflictRow[],
  conflictCount?: number
): string {
  const zipText = getDisplayedConflictZipCodes(conflictingZipCodes, conflicts).join(', ')
  const sample = conflicts.slice(0, 3).map((item) => `${item.zipCode} (${item.businessName})`)
  const extras =
    typeof conflictCount === 'number' && conflictCount > sample.length
      ? ` +${conflictCount - sample.length} more`
      : ''

  if (sample.length === 0) {
    return `Geo exclusivity conflict detected for ZIPs: ${zipText}.`
  }

  return `Geo exclusivity conflict detected for ZIPs: ${zipText}. Matches: ${sample.join(', ')}${extras}.`
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
  const [checkingConflicts, setCheckingConflicts] = useState(true)
  const [conflictError, setConflictError] = useState<string | null>(null)
  const [conflictingZipCodes, setConflictingZipCodes] = useState<string[]>([])
  const [conflicts, setConflicts] = useState<ZipConflictRow[]>([])
  const [conflictCount, setConflictCount] = useState<number>(0)
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

  const displayedConflictZipCodes = useMemo(
    () => getDisplayedConflictZipCodes(conflictingZipCodes, conflicts),
    [conflictingZipCodes, conflicts]
  )

  const hasConflicts = conflictingZipCodes.length > 0 || conflicts.length > 0 || conflictCount > 0

  useEffect(() => {
    let isActive = true

    async function runConflictCheck() {
      setCheckingConflicts(true)
      setConflictError(null)
      try {
        const response = await fetch('/api/internal/zip-change-request/conflicts', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ requestId }),
        })

        const data = (await response.json().catch(() => null)) as CheckConflictsResponse | null
        if (!response.ok || !data?.success) {
          throw new Error(data?.error || 'Could not run Airtable conflict check.')
        }

        if (!isActive) return
        setConflictingZipCodes(data.conflictingZipCodes || [])
        setConflicts(data.conflicts || [])
        setConflictCount(typeof data.conflictCount === 'number' ? data.conflictCount : 0)
      } catch (err) {
        if (!isActive) return
        setConflictingZipCodes([])
        setConflicts([])
        setConflictCount(0)
        setConflictError(err instanceof Error ? err.message : 'Could not run Airtable conflict check.')
      } finally {
        if (isActive) setCheckingConflicts(false)
      }
    }

    void runConflictCheck()
    return () => {
      isActive = false
    }
  }, [requestId])

  async function handleResolve(decision: 'approve' | 'reject') {
    if (decision === 'approve' && checkingConflicts) {
      setError('Still checking Airtable for exclusivity conflicts. Please wait 1-2 seconds.')
      return
    }

    if (decision === 'approve' && hasConflicts) {
      setError(conflictSummary(conflictingZipCodes, conflicts, conflictCount))
      return
    }

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
        if (data?.reason === 'zip_conflict') {
          const nextConflictingZipCodes = data.conflictingZipCodes || []
          const nextConflicts = data.conflicts || []
          const nextConflictCount = typeof data.conflictCount === 'number' ? data.conflictCount : nextConflicts.length
          setConflictingZipCodes(nextConflictingZipCodes)
          setConflicts(nextConflicts)
          setConflictCount(nextConflictCount)
          throw new Error(
            conflictSummary(nextConflictingZipCodes, nextConflicts, nextConflictCount)
          )
        }

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

      <p className="mt-2 text-[11px] font-semibold text-amber-900">Geo exclusivity check</p>
      {checkingConflicts ? (
        <p className="mt-1 text-[11px] text-amber-800">Checking Airtable active-client ZIP conflicts...</p>
      ) : null}
      {!checkingConflicts && !hasConflicts && !conflictError ? (
        <p className="mt-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">
          No Airtable active-client ZIP conflicts found.
        </p>
      ) : null}
      {!checkingConflicts && hasConflicts ? (
        <div className="mt-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-700">
          <p className="font-semibold">
            Conflict found for ZIPs: {displayedConflictZipCodes.join(', ')}
          </p>
          {conflicts.slice(0, 6).map((item, idx) => (
            <p key={`${item.zipCode}:${item.businessName}:${idx}`}>
              {item.zipCode} to {item.businessName} ({item.status || 'Unknown'})
            </p>
          ))}
          {conflictCount > conflicts.length ? (
            <p>+{conflictCount - conflicts.length} more conflict rows</p>
          ) : null}
        </div>
      ) : null}
      {!checkingConflicts && conflictError ? (
        <p className="mt-1 rounded border border-amber-300 bg-amber-100 px-2 py-1 text-[11px] text-amber-900">
          Could not auto-check Airtable conflicts: {conflictError}
        </p>
      ) : null}

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
          disabled={isSaving || checkingConflicts || hasConflicts}
          onClick={() => void handleResolve('approve')}
          className="rounded bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : checkingConflicts ? 'Checking...' : hasConflicts ? 'Blocked (Conflict)' : 'Approve'}
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
