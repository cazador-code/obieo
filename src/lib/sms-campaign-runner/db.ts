import fs from 'node:fs'
import path from 'node:path'
import BetterSqlite3 from 'better-sqlite3'
import {
  SMS_CAMPAIGN_RUNNER_DB_PATH,
  SMS_CAMPAIGN_RUNNER_JOBS_DIR,
  SMS_CAMPAIGN_RUNNER_ROOT,
  SMS_CAMPAIGN_RUNNER_UPLOADS_DIR,
} from '@/lib/sms-campaign-runner/constants'

const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS campaign_jobs (
  job_key TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_slug TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_profile TEXT NOT NULL,
  source_csv_path TEXT NOT NULL,
  desired_leads_per_day INTEGER NOT NULL,
  texts_per_lead INTEGER NOT NULL,
  target_contacts INTEGER NOT NULL,
  chunk_strategy TEXT NOT NULL,
  chunk_size INTEGER NOT NULL,
  group_by_zip INTEGER NOT NULL DEFAULT 0,
  blocked_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS campaign_job_zips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_key TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  selection_state TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (job_key) REFERENCES campaign_jobs(job_key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campaign_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_key TEXT NOT NULL,
  run_key TEXT NOT NULL,
  action TEXT NOT NULL,
  state TEXT NOT NULL,
  input_run_id INTEGER,
  worker_pid INTEGER,
  command_text TEXT,
  artifact_dir_rel_path TEXT NOT NULL,
  stdout_rel_path TEXT,
  stderr_rel_path TEXT,
  summary_rel_path TEXT,
  error_text TEXT,
  created_at TEXT NOT NULL,
  started_at TEXT,
  ended_at TEXT,
  FOREIGN KEY (job_key) REFERENCES campaign_jobs(job_key) ON DELETE CASCADE,
  FOREIGN KEY (input_run_id) REFERENCES campaign_runs(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS campaign_batches (
  batch_key TEXT PRIMARY KEY,
  job_key TEXT NOT NULL,
  source_run_id INTEGER NOT NULL,
  batch_index INTEGER NOT NULL,
  zip_code TEXT,
  file_name TEXT NOT NULL,
  rel_path TEXT NOT NULL,
  row_count INTEGER NOT NULL,
  headers_verified INTEGER NOT NULL DEFAULT 0,
  duplicate_phone_count INTEGER NOT NULL DEFAULT 0,
  zip_purity_verified INTEGER NOT NULL DEFAULT 0,
  traceability_verified INTEGER NOT NULL DEFAULT 0,
  validation_summary_rel_path TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (job_key) REFERENCES campaign_jobs(job_key) ON DELETE CASCADE,
  FOREIGN KEY (source_run_id) REFERENCES campaign_runs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campaign_job_zips_job_key
  ON campaign_job_zips(job_key, sort_order);

CREATE INDEX IF NOT EXISTS idx_campaign_runs_job_key
  ON campaign_runs(job_key, id DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_runs_job_key_action_state
  ON campaign_runs(job_key, action, state, id DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_runs_one_active_per_job
  ON campaign_runs(job_key)
  WHERE state IN ('queued', 'running');

CREATE INDEX IF NOT EXISTS idx_campaign_batches_job_key
  ON campaign_batches(job_key, source_run_id, batch_index);
`

declare global {
  var __smsCampaignRunnerDb: BetterSqlite3 | undefined
}

function ensureRunnerDirectories() {
  fs.mkdirSync(SMS_CAMPAIGN_RUNNER_ROOT, { recursive: true })
  fs.mkdirSync(SMS_CAMPAIGN_RUNNER_JOBS_DIR, { recursive: true })
  fs.mkdirSync(SMS_CAMPAIGN_RUNNER_UPLOADS_DIR, { recursive: true })
  fs.mkdirSync(path.dirname(SMS_CAMPAIGN_RUNNER_DB_PATH), { recursive: true })
}

export function getSmsCampaignRunnerDb(): BetterSqlite3 {
  if (global.__smsCampaignRunnerDb) {
    return global.__smsCampaignRunnerDb
  }

  ensureRunnerDirectories()
  const db = new BetterSqlite3(SMS_CAMPAIGN_RUNNER_DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('busy_timeout = 5000')
  db.exec(SCHEMA_SQL)
  global.__smsCampaignRunnerDb = db
  return db
}
