import Link from 'next/link'
import { getInternalClientsDashboardData, type InternalClientRow } from '@/lib/internal-clients'
import { createInternalPortalPreviewToken } from '@/lib/internal-portal-preview'
import AirtableResyncButton from './AirtableResyncButton'
import ZipRequestActions from './ZipRequestActions'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>

const STAGE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'paid', label: 'Paid' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'setup', label: 'Setup' },
] as const

function getFirstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

function formatDate(value: number | null): string {
  if (!value || !Number.isFinite(value)) return 'N/A'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return 'N/A'
  }
}

function formatBillingModel(value: string | null): string {
  if (!value) return 'N/A'
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function stageBadgeClass(stage: InternalClientRow['stage']): string {
  switch (stage) {
    case 'active':
      return 'border-emerald-300 bg-emerald-50 text-emerald-700'
    case 'invited':
      return 'border-sky-300 bg-sky-50 text-sky-700'
    case 'paid':
      return 'border-cyan-300 bg-cyan-50 text-cyan-700'
    case 'checkout':
      return 'border-amber-300 bg-amber-50 text-amber-700'
    case 'onboarding':
      return 'border-violet-300 bg-violet-50 text-violet-700'
    case 'setup':
      return 'border-slate-300 bg-slate-50 text-slate-700'
    default:
      return 'border-slate-300 bg-slate-50 text-slate-700'
  }
}

export default async function InternalClientsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const params = (await searchParams) || {}
  const query = getFirstParam(params.q).trim().toLowerCase()
  const stage = getFirstParam(params.stage).trim().toLowerCase() || 'all'

  const { rows, summary } = await getInternalClientsDashboardData()
  const filteredRows = rows.filter((row) => {
    if (stage !== 'all' && row.stage !== stage) return false
    if (!query) return true

    const searchable = [
      row.portalKey,
      row.companyName || '',
      row.billingEmail || '',
      row.intentSource || '',
      row.onboardingStatus || '',
      ...row.clerkUsers,
      ...row.invitationEmails,
    ]
      .join(' ')
      .toLowerCase()

    return searchable.includes(query)
  })
  const previewTokenByPortalKey = new Map<string, string>()
  await Promise.all(
    filteredRows.map(async (row) => {
      const token = await createInternalPortalPreviewToken(row.portalKey)
      if (!token) return
      previewTokenByPortalKey.set(row.portalKey, token)
    })
  )

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Clients Dashboard</h1>
              <p className="mt-2 text-[var(--text-secondary)]">
                Internal view of client lifecycle across Convex and Clerk.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/internal/leadgen/payment-link"
                className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white hover:bg-[var(--accent-hover)]"
              >
                Confirm Payment
              </Link>
              <Link
                href="/internal/leadgen/manual-onboarding"
                className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                Manual Entry
              </Link>
              <Link
                href="/internal/leadgen/onboarding"
                className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                Onboarding Tool
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Total</div>
              <div className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{summary.total}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Active</div>
              <div className="mt-1 text-2xl font-bold text-emerald-700">{summary.active}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Invited</div>
              <div className="mt-1 text-2xl font-bold text-sky-700">{summary.invited}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Paid</div>
              <div className="mt-1 text-2xl font-bold text-cyan-700">{summary.paid}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Checkout</div>
              <div className="mt-1 text-2xl font-bold text-amber-700">{summary.checkout}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Onboarding</div>
              <div className="mt-1 text-2xl font-bold text-violet-700">{summary.onboarding}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">ZIP Requests</div>
              <div className="mt-1 text-2xl font-bold text-amber-700">{summary.pendingZipRequests}</div>
            </div>
          </div>

          <form method="GET" className="mt-6 grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search company, email, portal key..."
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2 text-[var(--text-primary)]"
            />
            <select
              name="stage"
              defaultValue={stage}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2 text-[var(--text-primary)]"
            >
              {STAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              Apply
            </button>
          </form>
        </header>

        <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-lg">
          <div className="mb-3 text-sm text-[var(--text-secondary)]">
            Showing {filteredRows.length} of {rows.length} records
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  <th className="border-b border-[var(--border)] px-3 py-2">Client</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Portal Key</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Stage</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Billing</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Clerk</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Updated</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-sm text-[var(--text-secondary)]">
                      No matching clients.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.portalKey} className="align-top">
                      <td className="border-b border-[var(--border)] px-3 py-3">
                        <div className="font-semibold text-[var(--text-primary)]">{row.companyName || 'Unnamed'}</div>
                        <div className="mt-1 text-sm text-[var(--text-secondary)]">{row.billingEmail || 'No billing email'}</div>
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3">
                        <code className="text-xs text-[var(--text-primary)]">{row.portalKey}</code>
                        {row.intentSource && (
                          <div className="mt-1 text-xs text-[var(--text-muted)]">source: {row.intentSource}</div>
                        )}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${stageBadgeClass(row.stage)}`}>
                          {row.stageLabel}
                        </span>
                        <div className="mt-2 text-xs text-[var(--text-secondary)]">
                          intent: {row.intentStatus || 'none'}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          onboarding: {row.onboardingStatus || 'none'}
                        </div>
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        <div>model: {formatBillingModel(row.billingModel)}</div>
                        <div>unit: {typeof row.leadUnitPriceCents === 'number' ? `$${(row.leadUnitPriceCents / 100).toFixed(2)}` : 'N/A'}</div>
                        <div>credits: {typeof row.prepaidLeadCredits === 'number' ? row.prepaidLeadCredits : 'N/A'}</div>
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        <div>users: {row.clerkUserCount}</div>
                        <div>pending invites: {row.pendingInvitationCount}</div>
                        {row.clerkUsers.length > 0 && (
                          <div className="mt-1 text-xs">{row.clerkUsers.join(', ')}</div>
                        )}
                        {row.clerkUsers.length === 0 && row.invitationEmails.length > 0 && (
                          <div className="mt-1 text-xs">{row.invitationEmails.join(', ')}</div>
                        )}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {formatDate(row.lastUpdatedAt)}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3">
                        <div className="flex flex-col gap-2 text-xs">
                          {previewTokenByPortalKey.get(row.portalKey) && (
                            <Link
                              href={`/portal?preview_token=${encodeURIComponent(previewTokenByPortalKey.get(row.portalKey) || '')}`}
                              className="inline-flex rounded-lg bg-[var(--accent)] px-3 py-1.5 font-semibold text-white hover:bg-[var(--accent-hover)]"
                            >
                              View Client Portal
                            </Link>
                          )}
                          {row.onboardingLink && (
                            <Link
                              href={row.onboardingLink}
                              className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-1.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                            >
                              Open Onboarding
                            </Link>
                          )}
                          <Link
                            href="/internal/leadgen/payment-link"
                            className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-1.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                          >
                            Payment Confirmation
                          </Link>
                          <AirtableResyncButton portalKey={row.portalKey} />
                          {row.pendingZipRequest ? (
                            <ZipRequestActions
                              requestId={row.pendingZipRequest.requestId}
                              portalKey={row.portalKey}
                              currentZipCodes={row.pendingZipRequest.currentZipCodes}
                              requestedZipCodes={row.pendingZipRequest.requestedZipCodes}
                              addedZipCodes={row.pendingZipRequest.addedZipCodes}
                              removedZipCodes={row.pendingZipRequest.removedZipCodes}
                              note={row.pendingZipRequest.note}
                            />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
