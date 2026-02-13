'use client'

import { useEffect, useMemo, useState } from 'react'

export function ActivateFromStripeSession({ sessionId }: { sessionId: string | null }) {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0)

  const canRun = useMemo(() => Boolean(sessionId), [sessionId])

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const handle = window.setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(handle)
  }, [cooldownSeconds])

  async function onResend() {
    if (!sessionId) return
    setStatus('running')
    setMessage(null)
    try {
      const res = await fetch('/api/public/stripe/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (res.status === 429) {
        const retryAfterRaw = res.headers.get('Retry-After')
        const retryAfter = retryAfterRaw ? Math.max(0, Number.parseInt(retryAfterRaw, 10) || 0) : 60
        setCooldownSeconds(retryAfter || 60)
        setStatus('error')
        setMessage(`Too many attempts. Please wait ${retryAfter || 60} seconds and try again.`)
        return
      }

      const payload = (await res.json().catch(() => null)) as
        | { success?: boolean; error?: string; activation?: { status?: string; reason?: string } }
        | null

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error || 'Unable to resend invite right now.')
      }

      const activationStatus = payload.activation?.status
      if (activationStatus === 'activated') {
        setStatus('success')
        setMessage('Invitation sent. Please check your email.')
      } else {
        setStatus('success')
        setMessage(payload.activation?.reason || 'Invite already sent. Please check your email.')
      }
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Unable to resend invite.')
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onResend}
        disabled={!canRun || status === 'running' || cooldownSeconds > 0}
        className="inline-flex rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
      >
        {status === 'running'
          ? 'Sending...'
          : cooldownSeconds > 0
            ? `Try again in ${cooldownSeconds}s`
            : 'Resend invitation email'}
      </button>
      {!canRun && (
        <p className="mt-2 text-xs text-red-600">Missing Stripe session id. Please return to the checkout success page.</p>
      )}
      {message && (
        <p className={['mt-2 text-xs', status === 'error' ? 'text-red-600' : 'text-[var(--text-secondary)]'].join(' ')}>
          {message}
        </p>
      )}
    </div>
  )
}
