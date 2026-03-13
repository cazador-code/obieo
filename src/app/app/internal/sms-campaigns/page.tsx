import Link from 'next/link'
import CreateSmsCampaignJobForm from './CreateSmsCampaignJobForm'
import { getSmsCampaignDefaults, listSmsCampaignJobs } from '@/lib/sms-campaign-runner/repository'

export const dynamic = 'force-dynamic'

function statusClass(status: string): string {
  switch (status) {
    case 'lr_ready':
      return 'border-emerald-300 bg-emerald-50 text-emerald-700'
    case 'formatted':
      return 'border-sky-300 bg-sky-50 text-sky-700'
    case 'raw_exported':
      return 'border-amber-300 bg-amber-50 text-amber-700'
    case 'blocked':
      return 'border-red-300 bg-red-50 text-red-700'
    default:
      return 'border-slate-300 bg-slate-50 text-slate-700'
  }
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export default function SmsCampaignsPage() {
  const jobs = listSmsCampaignJobs()
  const defaults = getSmsCampaignDefaults()

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">SMS Campaign Runner</h1>
          <p className="mt-2 max-w-3xl text-[var(--text-secondary)]">
            Local-first operator tool for DuckDB extraction, batch formatting, LR-ready validation,
            and deterministic run history.
          </p>
        </header>

        <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Create campaign job</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Canonical source of truth is local SQLite at `.tools/sms-campaign-runner/runner.db`.
          </p>
          <div className="mt-6">
            <CreateSmsCampaignJobForm defaultSourceCsvPath={defaults.sourceCsvPath} />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Jobs</h2>
            <div className="text-sm text-[var(--text-secondary)]">{jobs.length} total</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  <th className="border-b border-[var(--border)] px-3 py-2">Client</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">ZIPs</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Status</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Next Action</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Latest Run</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-[var(--text-secondary)]">
                      No SMS campaign jobs yet.
                    </td>
                  </tr>
                ) : (
                  jobs.map((view) => (
                    <tr key={view.job.job_key} className="align-top">
                      <td className="border-b border-[var(--border)] px-3 py-3">
                        <Link
                          href={`/app/internal/sms-campaigns/${view.job.job_key}`}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {view.job.client_name}
                        </Link>
                        <div className="mt-1 text-xs text-[var(--text-muted)]">{view.job.job_key}</div>
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {view.zipCodes.map((row) => row.zip_code).join(', ')}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusClass(view.status)}`}>
                          {view.status}
                        </span>
                        {view.blockedReason ? (
                          <div className="mt-2 max-w-xs text-xs text-red-700">{view.blockedReason}</div>
                        ) : null}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {view.nextAction}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {view.latestRuns.latest ? `${view.latestRuns.latest.action} · ${view.latestRuns.latest.state}` : 'No runs yet'}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {formatDate(view.job.updated_at)}
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
