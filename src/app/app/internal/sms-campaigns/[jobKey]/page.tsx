import Link from 'next/link'
import { notFound } from 'next/navigation'
import ActiveRunPoller from '../ActiveRunPoller'
import JobActionButtons from '../JobActionButtons'
import type { SmsCampaignBatchRow, SmsCampaignJobDetail, SmsCampaignRunRow } from '@/lib/sms-campaign-runner/types'
import { getSmsCampaignJobDetail } from '@/lib/sms-campaign-runner/repository'

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

function runStateClass(state: string): string {
  switch (state) {
    case 'succeeded':
      return 'border-emerald-300 bg-emerald-50 text-emerald-700'
    case 'running':
      return 'border-amber-300 bg-amber-50 text-amber-700'
    case 'queued':
      return 'border-sky-300 bg-sky-50 text-sky-700'
    case 'failed':
      return 'border-red-300 bg-red-50 text-red-700'
    default:
      return 'border-slate-300 bg-slate-50 text-slate-700'
  }
}

function roleClass(kind: 'current' | 'active' | 'failed' | 'historical'): string {
  switch (kind) {
    case 'current':
      return 'border-emerald-300 bg-emerald-50 text-emerald-700'
    case 'active':
      return 'border-amber-300 bg-amber-50 text-amber-700'
    case 'failed':
      return 'border-red-300 bg-red-50 text-red-700'
    default:
      return 'border-slate-300 bg-slate-50 text-slate-600'
  }
}

function actionLabel(action: string): string {
  switch (action) {
    case 'extract_raw':
      return 'Extract'
    case 'format_batches':
      return 'Format'
    case 'validate_lr_ready':
      return 'Validate'
    default:
      return action
  }
}

function formatDate(value: string | null): string {
  if (!value) return 'N/A'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function getRunRole(
  run: SmsCampaignRunRow,
  detail: SmsCampaignJobDetail,
): { label: string; kind: 'current' | 'active' | 'failed' | 'historical' } {
  if (detail.latestRuns.active?.id === run.id) {
    return { label: 'Active run', kind: 'active' }
  }
  if (detail.latestRuns.validate?.id === run.id) {
    return { label: 'Current validation result', kind: 'current' }
  }
  if (detail.latestRuns.format?.id === run.id) {
    return { label: 'Current batch set', kind: 'current' }
  }
  if (detail.latestRuns.extract?.id === run.id) {
    return { label: 'Current extract result', kind: 'current' }
  }
  if (run.state === 'failed') {
    return { label: 'Failed history', kind: 'failed' }
  }
  if (run.action === 'extract_raw') {
    return { label: 'Superseded extract', kind: 'historical' }
  }
  if (run.action === 'format_batches') {
    return { label: 'Historical batch set', kind: 'historical' }
  }
  if (run.action === 'validate_lr_ready') {
    return { label: 'Superseded validation', kind: 'historical' }
  }
  return { label: 'Historical', kind: 'historical' }
}

function groupHistoricalBatchSets(
  detail: SmsCampaignJobDetail,
): Array<{ run: SmsCampaignRunRow; batches: SmsCampaignBatchRow[] }> {
  const currentFormatRunId = detail.latestRuns.format?.id || null
  const runsById = new Map(detail.runs.map((run) => [run.id, run]))
  const groups = new Map<number, SmsCampaignBatchRow[]>()

  for (const batch of detail.batches) {
    if (batch.source_run_id === currentFormatRunId) {
      continue
    }
    const existing = groups.get(batch.source_run_id)
    if (existing) {
      existing.push(batch)
    } else {
      groups.set(batch.source_run_id, [batch])
    }
  }

  return Array.from(groups.entries())
    .map(([runId, batches]) => ({
      run: runsById.get(runId),
      batches: [...batches].sort((a, b) => a.batch_index - b.batch_index),
    }))
    .filter((group): group is { run: SmsCampaignRunRow; batches: SmsCampaignBatchRow[] } => Boolean(group.run))
    .sort((a, b) => b.run.id - a.run.id)
}

function DetailStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-sm text-[var(--text-primary)]">{value}</div>
    </div>
  )
}

export default async function SmsCampaignJobDetailPage({
  params,
}: {
  params: Promise<{ jobKey: string }>
}) {
  const { jobKey } = await params
  const detail = getSmsCampaignJobDetail(jobKey)
  if (!detail) {
    notFound()
  }

  const canValidate = Boolean(
    detail.latestRuns.format &&
      (!detail.latestRuns.extract || detail.latestRuns.format.input_run_id === detail.latestRuns.extract.id),
  )
  const latestFailedRun = detail.runs.find((run) => run.state === 'failed') || null
  const historicalBatchSets = groupHistoricalBatchSets(detail)

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-10">
      <ActiveRunPoller enabled={Boolean(detail.latestRuns.active)} />
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg">
          <Link href="/internal/sms-campaigns" className="text-sm text-[var(--accent)] hover:underline">
            ← Back to SMS Campaign Runner
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">{detail.job.client_name}</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{detail.job.job_key}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusClass(detail.status)}`}>
                {detail.status}
              </span>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Next action: {detail.nextAction}</p>
            </div>
          </div>
        </header>

        {latestFailedRun ? (
          <section className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-red-800">Latest blocker</h2>
                <p className="mt-1 text-sm text-red-700">
                  {latestFailedRun.run_key} failed during {actionLabel(latestFailedRun.action).toLowerCase()}.
                </p>
              </div>
              <span className="inline-flex rounded-full border border-red-300 bg-white px-3 py-1 text-sm font-semibold text-red-700">
                {detail.nextAction}
              </span>
            </div>
            <div className="mt-4 rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-800">
              {latestFailedRun.error_text || detail.blockedReason || 'Run failed without an error message.'}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DetailStat label="Failed Run" value={latestFailedRun.run_key} />
              <DetailStat label="Action" value={actionLabel(latestFailedRun.action)} />
              <DetailStat label="Started" value={formatDate(latestFailedRun.started_at)} />
              <DetailStat label="Ended" value={formatDate(latestFailedRun.ended_at)} />
              <DetailStat label="Artifact Folder" value={latestFailedRun.artifact_dir_rel_path} />
              <DetailStat label="Stdout Log" value={latestFailedRun.stdout_rel_path || 'Not written'} />
              <DetailStat label="Stderr Log" value={latestFailedRun.stderr_rel_path || 'Not written'} />
              <DetailStat label="Summary" value={latestFailedRun.summary_rel_path || 'Not written'} />
            </div>
          </section>
        ) : null}

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Job plan</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailStat label="Source" value={detail.job.source_csv_path} />
              <DetailStat label="ZIPs" value={detail.zipCodes.map((row) => row.zip_code).join(', ')} />
              <DetailStat label="Desired Leads / Day" value={String(detail.job.desired_leads_per_day)} />
              <DetailStat label="Target Contacts" value={detail.job.target_contacts.toLocaleString()} />
              <DetailStat label="Chunk Strategy" value={detail.job.chunk_strategy} />
              <DetailStat label="Chunk Size" value={detail.job.chunk_size.toLocaleString()} />
            </div>
            <div className="mt-6">
              <JobActionButtons
                jobKey={detail.job.job_key}
                activeRunAction={detail.latestRuns.active?.action || null}
                canFormat={Boolean(detail.latestRuns.extract)}
                canValidate={canValidate}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Current authoritative results</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              These are the run results the runner currently trusts. Older runs remain below as history.
            </p>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Extract', run: detail.latestRuns.extract },
                { label: 'Format', run: detail.latestRuns.format },
                { label: 'Validate', run: detail.latestRuns.validate },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{item.label}</div>
                      <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                        {item.run?.run_key || 'No successful run yet'}
                      </div>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                        item.run ? roleClass('current') : roleClass('historical')
                      }`}
                    >
                      {item.run ? 'Authoritative' : 'Pending'}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-[var(--text-secondary)]">
                    {item.run ? (
                      <>
                        <div>State: {item.run.state}</div>
                        <div>Started: {formatDate(item.run.started_at)}</div>
                        <div>Ended: {formatDate(item.run.ended_at)}</div>
                      </>
                    ) : (
                      <div>This stage has not produced a successful result yet.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {detail.latestRuns.active ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Active run: <span className="font-semibold">{detail.latestRuns.active.run_key}</span> is currently{' '}
                {detail.latestRuns.active.state}. Historical results stay visible below until this run finishes.
              </div>
            ) : null}
            {detail.latestValidationSummary ? (
              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
                <div className="font-semibold text-[var(--text-primary)]">Latest validation proof</div>
                <div className="mt-2">Passed: {String(detail.latestValidationSummary.passed ?? false)}</div>
                <div>Duplicate phone count: {String(detail.latestValidationSummary.duplicate_phone_count ?? 0)}</div>
                <div>
                  Batches checked:{' '}
                  {Array.isArray(detail.latestValidationSummary.batches)
                    ? detail.latestValidationSummary.batches.length
                    : 0}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Current authoritative batch set</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {detail.latestRuns.format
                  ? `These files come from ${detail.latestRuns.format.run_key} and are the only batch files treated as current.`
                  : 'No successful format run yet, so there is no current batch set.'}
              </p>
            </div>
            {detail.latestRuns.format ? (
              <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${roleClass('current')}`}>
                {detail.latestRuns.format.run_key}
              </span>
            ) : null}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  <th className="border-b border-[var(--border)] px-3 py-2">File</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Rows</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">ZIP</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Headers</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">ZIP Purity</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Traceability</th>
                </tr>
              </thead>
              <tbody>
                {detail.currentBatches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-[var(--text-secondary)]">
                      No formatted batches yet.
                    </td>
                  </tr>
                ) : (
                  detail.currentBatches.map((batch) => (
                    <tr key={batch.batch_key}>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-primary)]">
                        {batch.file_name}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {batch.row_count.toLocaleString()}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {batch.zip_code || 'Mixed'}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {batch.headers_verified ? 'Yes' : 'No'}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {batch.zip_purity_verified ? 'Yes' : 'No'}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {batch.traceability_verified ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Historical batch sets</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Older batch files stay available for audit, but they are not treated as the current batch set.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {historicalBatchSets.length === 0 ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
                No historical batch sets yet.
              </div>
            ) : (
              historicalBatchSets.map((group) => (
                <div key={group.run.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{group.run.run_key}</div>
                      <div className="mt-1 text-sm text-[var(--text-secondary)]">
                        {group.batches.length} files, {group.batches.reduce((sum, batch) => sum + batch.row_count, 0).toLocaleString()} rows
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${roleClass('historical')}`}>
                      Historical only
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {group.batches.map((batch) => (
                      <div
                        key={batch.batch_key}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm"
                      >
                        <span className="text-[var(--text-primary)]">{batch.file_name}</span>
                        <span className="text-[var(--text-secondary)]">
                          {batch.row_count.toLocaleString()} rows · {batch.zip_code || 'Mixed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-lg">
          <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">Run history</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  <th className="border-b border-[var(--border)] px-3 py-2">Run</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Action</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">State</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Role</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Input Run</th>
                  <th className="border-b border-[var(--border)] px-3 py-2">Ended</th>
                </tr>
              </thead>
              <tbody>
                {detail.runs.map((run) => {
                  const role = getRunRole(run, detail)
                  return (
                    <tr key={run.id}>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-primary)]">
                        <div className="font-semibold">{run.run_key}</div>
                        <div className="mt-1 text-xs text-[var(--text-muted)]">{run.artifact_dir_rel_path}</div>
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {actionLabel(run.action)}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${runStateClass(run.state)}`}>
                          {run.state}
                        </span>
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${roleClass(role.kind)}`}>
                          {role.label}
                        </span>
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {run.input_run_id || 'N/A'}
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        {formatDate(run.ended_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
