'use client'

import { useMemo, useState } from 'react'

type ApiResponse =
  | {
      success: true
      leads: number
      unitPriceCents: number
      amountCents: number
      invoiceId: string
      hostedInvoiceUrl?: string | null
      invoicePdf?: string | null
      status?: string | null
    }
  | { success: false; error: string }

function formatUsd(cents: number) {
  const dollars = (cents / 100).toFixed(2)
  return `$${dollars}`
}

export default function LeadTopUpCard() {
  const [leads, setLeads] = useState(40)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Extract<ApiResponse, { success: true }> | null>(null)

  const estimatedTotal = useMemo(() => {
    if (!Number.isFinite(leads) || leads <= 0) return null
    return leads * 4000
  }, [leads])

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/portal/billing/topup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ leads }),
      })

      const data = (await res.json()) as ApiResponse
      if (!res.ok || !data.success) {
        setError((data as { error?: string }).error || 'Failed to generate invoice')
        return
      }

      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Buy More Leads</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Request additional lead credits. Default pricing is $40/lead.
        If self-serve billing is disabled, support will handle your reorder manually.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">How many leads?</span>
          <input
            type="number"
            min={1}
            max={400}
            step={1}
            value={Number.isFinite(leads) ? leads : 40}
            onChange={(e) => setLeads(Number(e.target.value))}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Tip: Use 40 for a standard re-up. For the 10-upfront model, this extends the 40-lead cap.
          </p>
        </label>

        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-white hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Request Top-up'}
          </button>
        </div>
      </div>

      {estimatedTotal !== null && !result && (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Estimated total: <span className="font-semibold text-[var(--text-primary)]">{formatUsd(estimatedTotal)}</span>
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <p className="text-sm text-[var(--text-secondary)]">Invoice created.</p>
          <p className="mt-2 text-sm">
            Amount: <span className="font-semibold">{formatUsd(result.amountCents)}</span>
            {' '}({result.leads} leads)
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Invoice ID: {result.invoiceId}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {result.hostedInvoiceUrl && (
              <a
                href={result.hostedInvoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
              >
                Open Stripe Invoice
              </a>
            )}
            {result.invoicePdf && (
              <a
                href={result.invoicePdf}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                Download PDF
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
