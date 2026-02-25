'use client'

import { useState } from 'react'
import type { ZipChangeRequestSnapshot } from '@/lib/convex'

export default function ZipRequestActions({ request }: { request: ZipChangeRequestSnapshot }) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  async function resolve(decision: 'approve' | 'reject') {
    if (decision === 'reject' && !rejectNotes.trim()) {
      setResultMessage('Rejection reason is required.')
      return
    }

    setStatus('saving')
    setResultMessage(null)

    try {
      const response = await fetch('/api/internal/zip-change-request/resolve', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: 'Basic ' + btoa('admin:admin'),
        },
        body: JSON.stringify({
          requestId: request._id,
          decision,
          resolutionNotes: decision === 'reject' ? rejectNotes.trim() : undefined,
          resolvedBy: 'dashboard-admin',
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to resolve request.')
      }

      setStatus('done')
      setResultMessage(decision === 'approve' ? 'Approved — ZIPs updated.' : 'Rejected.')
    } catch (error) {
      setStatus('error')
      setResultMessage(error instanceof Error ? error.message : 'Failed to resolve request.')
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
        {resultMessage}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-[var(--text-secondary)]">
        {request.addedZipCodes.length > 0 && (
          <p className="text-emerald-700">+ {request.addedZipCodes.join(', ')}</p>
        )}
        {request.removedZipCodes.length > 0 && (
          <p className="text-red-600">- {request.removedZipCodes.join(', ')}</p>
        )}
        {request.reason && <p className="mt-1 italic">Reason: {request.reason}</p>}
      </div>

      {resultMessage && status === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {resultMessage}
        </div>
      )}

      {showRejectInput && (
        <textarea
          value={rejectNotes}
          onChange={(e) => setRejectNotes(e.target.value)}
          placeholder="Rejection reason (required)"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs"
          rows={2}
        />
      )}

      {resultMessage && !showRejectInput && status !== 'error' && (
        <div className="text-xs text-amber-700">{resultMessage}</div>
      )}

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => resolve('approve')}
          disabled={status === 'saving'}
          className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {status === 'saving' ? '...' : 'Approve'}
        </button>
        {!showRejectInput ? (
          <button
            type="button"
            onClick={() => setShowRejectInput(true)}
            disabled={status === 'saving'}
            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            Reject
          </button>
        ) : (
          <button
            type="button"
            onClick={() => resolve('reject')}
            disabled={status === 'saving' || !rejectNotes.trim()}
            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {status === 'saving' ? '...' : 'Confirm Reject'}
          </button>
        )}
      </div>
    </div>
  )
}
