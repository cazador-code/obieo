import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import type BetterSqlite3 from 'better-sqlite3'
import { parseTargetZipCodes } from '@/lib/leadgen-target-zips'
import {
  SMS_CAMPAIGN_MAX_CHUNK_SIZE,
  SMS_CAMPAIGN_RUNNER_DB_PATH,
  SMS_CAMPAIGN_RUNNER_DEFAULT_SOURCE_PATH,
  SMS_CAMPAIGN_RUNNER_ROOT,
  SMS_CAMPAIGN_RUNNER_UPLOAD_MAX_BYTES,
  SMS_CAMPAIGN_RUNNER_UPLOADS_DIR,
  SMS_CAMPAIGN_SOURCE_PROFILE,
  SMS_CAMPAIGN_TEXTS_PER_LEAD_OPTIONS,
} from '@/lib/sms-campaign-runner/constants'
import { getSmsCampaignRunnerDb } from '@/lib/sms-campaign-runner/db'
import type {
  CreateSmsCampaignJobInput,
  SmsCampaignBatchRow,
  SmsCampaignDerivedState,
  SmsCampaignJobDetail,
  SmsCampaignJobRow,
  SmsCampaignJobView,
  SmsCampaignJobZipRow,
  SmsCampaignLatestRuns,
  SmsCampaignNextAction,
  SmsCampaignRunAction,
  SmsCampaignRunRow,
} from '@/lib/sms-campaign-runner/types'

function nowIso(): string {
  return new Date().toISOString()
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'campaign'
}

function normalizeZipCodes(value: string[]): string[] {
  const { zipCodes } = parseTargetZipCodes(value.join(','))
  return zipCodes.sort()
}

function buildZipScope(zipCodes: string[]): string {
  if (zipCodes.length === 0) return 'no-zips'
  if (zipCodes.length === 1) return zipCodes[0]
  return `${zipCodes[0]}-${zipCodes[zipCodes.length - 1]}-x${zipCodes.length}`
}

function buildJobFingerprint(input: {
  clientSlug: string
  sourceCsvPath: string
  desiredLeadsPerDay: number
  textsPerLead: number
  zipCodes: string[]
  chunkStrategy: string
  chunkSize: number
}) {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex')
}

function buildJobKeyBase(clientSlug: string, zipCodes: string[]): string {
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `${dateKey}__${clientSlug}__duckdb__${buildZipScope(zipCodes)}`
}

function sanitizeUploadFileName(value: string): string {
  return path
    .basename(value.trim())
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function clampChunkSize(value: number): number {
  return Math.min(Math.max(value, 1), SMS_CAMPAIGN_MAX_CHUNK_SIZE)
}

function resolveChunkSize(input: CreateSmsCampaignJobInput): number {
  if (typeof input.chunkSizeOverride === 'number' && Number.isFinite(input.chunkSizeOverride)) {
    return clampChunkSize(Math.floor(input.chunkSizeOverride))
  }
  return clampChunkSize(input.desiredLeadsPerDay * input.textsPerLead)
}

function buildRunKey(action: SmsCampaignRunAction, count: number): string {
  const prefix =
    action === 'extract_raw' ? 'extract' : action === 'format_batches' ? 'format' : 'validate'
  return `${prefix}-${String(count).padStart(3, '0')}`
}

function getJobRows(db: BetterSqlite3): SmsCampaignJobRow[] {
  return db.prepare('SELECT * FROM campaign_jobs ORDER BY created_at DESC, job_key DESC').all() as SmsCampaignJobRow[]
}

function getZipRowsForJobs(db: BetterSqlite3, jobKeys: string[]): SmsCampaignJobZipRow[] {
  if (jobKeys.length === 0) return []
  const placeholders = jobKeys.map(() => '?').join(', ')
  return db
    .prepare(`SELECT * FROM campaign_job_zips WHERE job_key IN (${placeholders}) ORDER BY sort_order ASC, id ASC`)
    .all(...jobKeys) as SmsCampaignJobZipRow[]
}

function getRunRowsForJobs(db: BetterSqlite3, jobKeys: string[]): SmsCampaignRunRow[] {
  if (jobKeys.length === 0) return []
  const placeholders = jobKeys.map(() => '?').join(', ')
  return db
    .prepare(`SELECT * FROM campaign_runs WHERE job_key IN (${placeholders}) ORDER BY id DESC`)
    .all(...jobKeys) as SmsCampaignRunRow[]
}

function getBatchRowsForJobs(db: BetterSqlite3, jobKeys: string[]): SmsCampaignBatchRow[] {
  if (jobKeys.length === 0) return []
  const placeholders = jobKeys.map(() => '?').join(', ')
  return db
    .prepare(`SELECT * FROM campaign_batches WHERE job_key IN (${placeholders}) ORDER BY source_run_id DESC, batch_index ASC`)
    .all(...jobKeys) as SmsCampaignBatchRow[]
}

function latestRun(
  runs: SmsCampaignRunRow[],
  predicate: (run: SmsCampaignRunRow) => boolean,
): SmsCampaignRunRow | null {
  return runs.find(predicate) || null
}

function markRunLaunchFailed(runId: number, jobKey: string, message: string) {
  const db = getSmsCampaignRunnerDb()
  const failedAt = nowIso()
  db.prepare(`
    UPDATE campaign_runs
    SET state = 'failed', error_text = ?, ended_at = ?
    WHERE id = ?
      AND state = 'queued'
  `).run(message, failedAt, runId)
  db.prepare('UPDATE campaign_jobs SET blocked_reason = ?, updated_at = ? WHERE job_key = ?').run(
    message,
    failedAt,
    jobKey,
  )
}

function readSummary(relativePath: string | null): Record<string, unknown> | null {
  if (!relativePath) return null
  const absolutePath = path.join(SMS_CAMPAIGN_RUNNER_ROOT, relativePath)
  try {
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8')) as Record<string, unknown>
  } catch {
    return null
  }
}

function deriveState(
  job: SmsCampaignJobRow,
  runs: SmsCampaignRunRow[],
  batches: SmsCampaignBatchRow[],
): SmsCampaignDerivedState {
  const latest: SmsCampaignRunRow | null = runs[0] || null
  const active = latestRun(runs, (run) => run.state === 'queued' || run.state === 'running')
  const extract = latestRun(runs, (run) => run.action === 'extract_raw' && run.state === 'succeeded')
  const format = extract
    ? latestRun(
        runs,
        (run) =>
          run.action === 'format_batches' &&
          run.state === 'succeeded' &&
          run.input_run_id === extract.id,
      )
    : null
  const validate = format
    ? latestRun(
        runs,
        (run) =>
          run.action === 'validate_lr_ready' &&
          run.state === 'succeeded' &&
          run.input_run_id === format.id,
      )
    : null

  const latestRuns: SmsCampaignLatestRuns = {
    extract,
    format,
    validate,
    active,
    latest,
  }

  const currentBatches = format
    ? batches.filter((batch) => batch.source_run_id === format.id).sort((a, b) => a.batch_index - b.batch_index)
    : []

  const latestFailed = latest && latest.state === 'failed' ? latest : null

  let status: SmsCampaignDerivedState['status']
  if (latestFailed) {
    status = 'blocked'
  } else if (!extract) {
    status = 'planned'
  } else if (!format || format.input_run_id !== extract.id) {
    status = 'raw_exported'
  } else if (!validate || validate.input_run_id !== format.id) {
    status = 'formatted'
  } else {
    status = 'lr_ready'
  }

  let nextAction: SmsCampaignNextAction
  if (active) {
    nextAction = 'Run in progress'
  } else if (latestFailed) {
    nextAction = 'Resolve blocker and rerun failed step'
  } else if (!extract) {
    nextAction = 'Run extraction'
  } else if (!format || format.input_run_id !== extract.id) {
    nextAction = 'Format batches'
  } else if (!validate || validate.input_run_id !== format.id) {
    nextAction = 'Validate LR-ready'
  } else {
    nextAction = 'Upload to Landline Remover'
  }

  return {
    status,
    nextAction,
    blockedReason: active ? null : latestFailed?.error_text || job.blocked_reason || null,
    latestRuns,
    currentBatches,
  }
}

function buildJobView(
  job: SmsCampaignJobRow,
  zipRows: SmsCampaignJobZipRow[],
  runs: SmsCampaignRunRow[],
  batches: SmsCampaignBatchRow[],
): SmsCampaignJobView {
  return {
    job,
    zipCodes: zipRows,
    ...deriveState(job, runs, batches),
  }
}

function nextJobKey(db: BetterSqlite3, baseKey: string): string {
  const existing = db
    .prepare('SELECT job_key FROM campaign_jobs WHERE job_key = ? OR job_key LIKE ? ORDER BY job_key ASC')
    .all(baseKey, `${baseKey}__r%`) as Array<{ job_key: string }>
  if (existing.length === 0) return baseKey

  let revision = 2
  let candidate = `${baseKey}__r${String(revision).padStart(2, '0')}`
  const taken = new Set(existing.map((row) => row.job_key))
  while (taken.has(candidate)) {
    revision += 1
    candidate = `${baseKey}__r${String(revision).padStart(2, '0')}`
  }
  return candidate
}

function spawnWorker(runId: number, jobKey: string) {
  const workerPath = path.join(process.cwd(), 'scripts', 'sms_campaign_runner_worker.py')
  const child = spawn('python3', [workerPath, '--run-id', String(runId)], {
    cwd: process.cwd(),
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      PYTHONDONTWRITEBYTECODE: '1',
      SMS_CAMPAIGN_RUNNER_DB_PATH: SMS_CAMPAIGN_RUNNER_DB_PATH,
      SMS_CAMPAIGN_RUNNER_ROOT: SMS_CAMPAIGN_RUNNER_ROOT,
    },
  })

  child.once('error', (error) => {
    const message = error instanceof Error ? error.message : 'Failed to spawn worker.'
    console.error(`[sms-campaign-runner] worker launch failed for run ${runId}: ${message}`)
    markRunLaunchFailed(runId, jobKey, message)
  })

  child.unref()
}

export function storeUploadedSmsCampaignSourceCsv(input: {
  fileName: string
  bytes: Uint8Array
}) {
  const safeFileName = sanitizeUploadFileName(input.fileName)
  if (!safeFileName) {
    throw new Error('Uploaded source CSV must include a file name.')
  }
  if (path.extname(safeFileName).toLowerCase() !== '.csv') {
    throw new Error('Uploaded source must be a .csv file.')
  }
  if (input.bytes.byteLength === 0) {
    throw new Error('Uploaded source CSV is empty.')
  }
  if (input.bytes.byteLength > SMS_CAMPAIGN_RUNNER_UPLOAD_MAX_BYTES) {
    throw new Error('Uploaded source CSV is too large. Export a smaller filtered CSV first.')
  }

  fs.mkdirSync(SMS_CAMPAIGN_RUNNER_UPLOADS_DIR, { recursive: true })

  const uploadDate = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const fileHash = createHash('sha256').update(input.bytes).digest('hex').slice(0, 12)
  const stem = path.basename(safeFileName, '.csv').slice(0, 64) || 'source'
  const storedFileName = `${uploadDate}__${stem}__${fileHash}.csv`
  const sourceCsvPath = path.join(SMS_CAMPAIGN_RUNNER_UPLOADS_DIR, storedFileName)

  if (!fs.existsSync(sourceCsvPath)) {
    fs.writeFileSync(sourceCsvPath, Buffer.from(input.bytes))
  }

  return {
    sourceCsvPath,
    storedFileName,
  }
}

export function getSmsCampaignDefaults() {
  return {
    sourceCsvPath: SMS_CAMPAIGN_RUNNER_DEFAULT_SOURCE_PATH,
    textsPerLeadOptions: [...SMS_CAMPAIGN_TEXTS_PER_LEAD_OPTIONS],
  }
}

export function createOrFindSmsCampaignJob(input: CreateSmsCampaignJobInput) {
  const db = getSmsCampaignRunnerDb()
  const clientName = input.clientName.trim()
  if (!clientName) {
    throw new Error('Client name is required.')
  }
  if (!SMS_CAMPAIGN_TEXTS_PER_LEAD_OPTIONS.includes(input.textsPerLead as 500 | 750 | 1000)) {
    throw new Error('Texts-per-lead must be 500, 750, or 1000.')
  }
  if (!Number.isInteger(input.desiredLeadsPerDay) || input.desiredLeadsPerDay <= 0) {
    throw new Error('Desired leads per day must be a positive whole number.')
  }

  const selectedZipCodes = normalizeZipCodes(input.selectedZipCodes)
  if (selectedZipCodes.length === 0) {
    throw new Error('At least one valid ZIP code is required.')
  }

  const clientSlug = slugify(clientName)
  const sourceCsvPath = input.sourceCsvPath.trim() || SMS_CAMPAIGN_RUNNER_DEFAULT_SOURCE_PATH
  if (!sourceCsvPath) {
    throw new Error('Provide a source CSV path or upload a source CSV.')
  }
  const sourceType = input.sourceType?.trim() || 'duckdb'
  const sourceProfile = input.sourceProfile?.trim() || SMS_CAMPAIGN_SOURCE_PROFILE
  const chunkSize = resolveChunkSize(input)
  const fingerprint = buildJobFingerprint({
    clientSlug,
    sourceCsvPath,
    desiredLeadsPerDay: input.desiredLeadsPerDay,
    textsPerLead: input.textsPerLead,
    zipCodes: selectedZipCodes,
    chunkStrategy: input.chunkStrategy,
    chunkSize,
  })

  const existing = db.prepare('SELECT * FROM campaign_jobs WHERE fingerprint = ? LIMIT 1').get(fingerprint) as SmsCampaignJobRow | undefined
  if (existing) {
    return { jobKey: existing.job_key, created: false }
  }

  const targetContacts = input.desiredLeadsPerDay * input.textsPerLead
  const groupByZip = input.chunkStrategy === 'zip' ? 1 : 0
  const createdAt = nowIso()
  const jobKey = nextJobKey(db, buildJobKeyBase(clientSlug, selectedZipCodes))

  const insertJob = db.prepare(`
    INSERT INTO campaign_jobs (
      job_key, fingerprint, client_name, client_slug, source_type, source_profile,
      source_csv_path, desired_leads_per_day, texts_per_lead, target_contacts,
      chunk_strategy, chunk_size, group_by_zip, blocked_reason, created_at, updated_at
    ) VALUES (
      @job_key, @fingerprint, @client_name, @client_slug, @source_type, @source_profile,
      @source_csv_path, @desired_leads_per_day, @texts_per_lead, @target_contacts,
      @chunk_strategy, @chunk_size, @group_by_zip, NULL, @created_at, @updated_at
    )
  `)
  const insertZip = db.prepare(`
    INSERT INTO campaign_job_zips (job_key, zip_code, selection_state, sort_order)
    VALUES (?, ?, 'selected', ?)
  `)

  const transaction = db.transaction(() => {
    insertJob.run({
      job_key: jobKey,
      fingerprint,
      client_name: clientName,
      client_slug: clientSlug,
      source_type: sourceType,
      source_profile: sourceProfile,
      source_csv_path: sourceCsvPath,
      desired_leads_per_day: input.desiredLeadsPerDay,
      texts_per_lead: input.textsPerLead,
      target_contacts: targetContacts,
      chunk_strategy: input.chunkStrategy,
      chunk_size: chunkSize,
      group_by_zip: groupByZip,
      created_at: createdAt,
      updated_at: createdAt,
    })

    selectedZipCodes.forEach((zipCode, index) => {
      insertZip.run(jobKey, zipCode, index)
    })
  })

  transaction()
  return { jobKey, created: true }
}

export function listSmsCampaignJobs(): SmsCampaignJobView[] {
  const db = getSmsCampaignRunnerDb()
  const jobs = getJobRows(db)
  const jobKeys = jobs.map((job) => job.job_key)
  const zipRows = getZipRowsForJobs(db, jobKeys)
  const runs = getRunRowsForJobs(db, jobKeys)
  const batches = getBatchRowsForJobs(db, jobKeys)

  return jobs.map((job) =>
    buildJobView(
      job,
      zipRows.filter((row) => row.job_key === job.job_key),
      runs.filter((run) => run.job_key === job.job_key),
      batches.filter((batch) => batch.job_key === job.job_key),
    ),
  )
}

export function getSmsCampaignJobDetail(jobKey: string): SmsCampaignJobDetail | null {
  const db = getSmsCampaignRunnerDb()
  const job = db.prepare('SELECT * FROM campaign_jobs WHERE job_key = ? LIMIT 1').get(jobKey) as SmsCampaignJobRow | undefined
  if (!job) return null

  const zipCodes = db.prepare('SELECT * FROM campaign_job_zips WHERE job_key = ? ORDER BY sort_order ASC, id ASC').all(jobKey) as SmsCampaignJobZipRow[]
  const runs = db.prepare('SELECT * FROM campaign_runs WHERE job_key = ? ORDER BY id DESC').all(jobKey) as SmsCampaignRunRow[]
  const batches = db.prepare('SELECT * FROM campaign_batches WHERE job_key = ? ORDER BY source_run_id DESC, batch_index ASC').all(jobKey) as SmsCampaignBatchRow[]

  const derived = deriveState(job, runs, batches)
  const latestValidationSummary = readSummary(derived.latestRuns.validate?.summary_rel_path || null)

  return {
    job,
    zipCodes,
    runs,
    batches,
    latestValidationSummary,
    ...derived,
  }
}

function resolveActionInputRunId(
  action: SmsCampaignRunAction,
  derived: SmsCampaignDerivedState,
): number | null {
  if (action === 'extract_raw') {
    return null
  }
  if (action === 'format_batches') {
    return derived.latestRuns.extract?.id || null
  }
  return derived.latestRuns.format?.id || null
}

function assertActionAllowed(action: SmsCampaignRunAction, derived: SmsCampaignDerivedState) {
  if (action === 'format_batches' && !derived.latestRuns.extract) {
    throw new Error('Run extraction first.')
  }

  if (action === 'validate_lr_ready') {
    if (!derived.latestRuns.format) {
      throw new Error('Format batches first.')
    }
    if (derived.latestRuns.extract && derived.latestRuns.format.input_run_id !== derived.latestRuns.extract.id) {
      throw new Error('Re-format the latest extraction before validating LR-ready.')
    }
  }
}

export function enqueueSmsCampaignRun(jobKey: string, action: SmsCampaignRunAction) {
  const db = getSmsCampaignRunnerDb()
  const detail = getSmsCampaignJobDetail(jobKey)
  if (!detail) {
    throw new Error('Campaign job not found.')
  }

  const existingActive = detail.runs.find((run) => run.state === 'queued' || run.state === 'running')
  if (existingActive) {
    if (existingActive.action === action) {
      return { run: existingActive, alreadyRunning: true }
    }
    throw new Error(
      `${existingActive.run_key} (${existingActive.action}) is already ${existingActive.state}. Wait for it to finish before starting ${action}.`,
    )
  }

  assertActionAllowed(action, detail)

  let runId: number
  let alreadyRunning = false

  try {
    const transaction = db.transaction(() => {
      const activeRun = db
        .prepare(
          `SELECT * FROM campaign_runs
           WHERE job_key = ?
             AND state IN ('queued', 'running')
           ORDER BY id DESC
           LIMIT 1`,
        )
        .get(jobKey) as SmsCampaignRunRow | undefined

      if (activeRun) {
        if (activeRun.action !== action) {
          throw new Error(
            `${activeRun.run_key} (${activeRun.action}) is already ${activeRun.state}. Wait for it to finish before starting ${action}.`,
          )
        }
        alreadyRunning = true
        return activeRun.id
      }

      const runCount = db
        .prepare('SELECT COUNT(*) as count FROM campaign_runs WHERE job_key = ? AND action = ?')
        .get(jobKey, action) as { count: number }
      const runKey = buildRunKey(action, runCount.count + 1)
      const artifactDirRelPath = path.join('jobs', jobKey, 'runs', runKey)
      const createdAt = nowIso()
      const inputRunId = resolveActionInputRunId(action, detail)

      const insert = db.prepare(`
        INSERT INTO campaign_runs (
          job_key, run_key, action, state, input_run_id, worker_pid, command_text,
          artifact_dir_rel_path, stdout_rel_path, stderr_rel_path, summary_rel_path,
          error_text, created_at, started_at, ended_at
        ) VALUES (?, ?, ?, 'queued', ?, NULL, NULL, ?, NULL, NULL, NULL, NULL, ?, NULL, NULL)
      `)
      const result = insert.run(jobKey, runKey, action, inputRunId, artifactDirRelPath, createdAt)
      return Number(result.lastInsertRowid)
    })

    runId = transaction()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to queue run.'
    const isActiveRunConflict =
      message.includes('idx_campaign_runs_one_active_per_job') || message.includes('UNIQUE constraint failed')

    if (!isActiveRunConflict) {
      throw error
    }

    const activeRun = db
      .prepare(
        `SELECT * FROM campaign_runs
         WHERE job_key = ?
           AND state IN ('queued', 'running')
         ORDER BY id DESC
         LIMIT 1`,
      )
      .get(jobKey) as SmsCampaignRunRow | undefined

    if (!activeRun) {
      throw error
    }
    if (activeRun.action !== action) {
      throw new Error(
        `${activeRun.run_key} (${activeRun.action}) is already ${activeRun.state}. Wait for it to finish before starting ${action}.`,
      )
    }
    runId = activeRun.id
    alreadyRunning = true
  }

  const run = db.prepare('SELECT * FROM campaign_runs WHERE id = ?').get(runId) as SmsCampaignRunRow
  if (alreadyRunning) {
    return { run, alreadyRunning: true }
  }

  try {
    spawnWorker(runId, jobKey)
  } catch (error) {
    db.prepare(`
      UPDATE campaign_runs
      SET state = 'failed', error_text = ?, ended_at = ?
      WHERE id = ?
    `).run(error instanceof Error ? error.message : 'Failed to spawn worker.', nowIso(), runId)
    db.prepare('UPDATE campaign_jobs SET blocked_reason = ?, updated_at = ? WHERE job_key = ?').run(
      error instanceof Error ? error.message : 'Failed to spawn worker.',
      nowIso(),
      jobKey,
    )
    throw error
  }

  return { run, alreadyRunning: false }
}
