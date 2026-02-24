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
    <section className="flex h-full flex-col justify-between rounded-2xl border-0 bg-[var(--bg-card)] p-6 md:p-8 shadow-md ring-1 ring-[var(--border)]">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">Buy More Leads</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Request additional lead credits. Default pricing is <strong className="text-[var(--text-primary)]">$40/lead</strong>.
          If self-serve billing is disabled, support will handle your reorder manually.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">Quantity</span>
          <input
            type="number"
            min={1}
            max={400}
            step={1}
            value={Number.isFinite(leads) ? leads : 40}
            onChange={(e) => setLeads(Number(e.target.value))}
            className="w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-lg font-medium transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-0"
          />
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Tip: Use 40 for a standard re-up.
          </p>
        </label>

        <div className="w-full sm:w-auto sm:pb-6">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full whitespace-nowrap rounded-xl bg-[var(--accent)] px-6 py-3 text-lg font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md"
          >
            {loading ? 'Submitting...' : 'Request Top-up'}
          </button>
        </div>
      </div>

      {estimatedTotal !== null && !result && (
        <div className="mt-8">
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            Estimated total
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {formatUsd(estimatedTotal)}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">Invoice created</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Amount: <span className="font-semibold text-[var(--text-primary)]">{formatUsd(result.amountCents)}</span>
                {' '}for {result.leads} leads
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">ID: {result.invoiceId}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            {result.hostedInvoiceUrl && (
              <a
                href={result.hostedInvoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-xl bg-[var(--text-primary)] px-4 py-2 text-sm font-bold text-[var(--bg-primary)] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Pay Invoice
              </a>
            )}
            {result.invoicePdf && (
              <a
                href={result.invoicePdf}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-xl border-2 border-[var(--border)] bg-transparent px-4 py-2 text-sm font-bold text-[var(--text-primary)] transition-all hover:border-[var(--text-primary)]"
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
