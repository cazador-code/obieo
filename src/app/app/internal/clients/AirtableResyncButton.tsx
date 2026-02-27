'use client'

import { useState } from 'react'

type Props = {
  portalKey: string
}

type ResyncResponse = {
  success: boolean
  error?: string
  updatedFields?: string[]
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
      setNotice(count > 0 ? `Airtable synced (${count} fields).` : 'Airtable sync complete.')
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
