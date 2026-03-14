export type SmsCampaignChunkStrategy = 'daily' | 'zip' | 'mixed'
export type SmsCampaignRunAction = 'extract_raw' | 'format_batches' | 'validate_lr_ready'
export type SmsCampaignRunState = 'queued' | 'running' | 'succeeded' | 'failed'
export type SmsCampaignJobStatus = 'planned' | 'raw_exported' | 'formatted' | 'lr_ready' | 'blocked'
export type SmsCampaignNextAction =
  | 'Run extraction'
  | 'Format batches'
  | 'Validate LR-ready'
  | 'Upload to Landline Remover'
  | 'Resolve blocker and rerun failed step'
  | 'Run in progress'

export interface SmsCampaignJobRow {
  job_key: string
  fingerprint: string
  client_name: string
  client_slug: string
  source_type: string
  source_profile: string
  source_csv_path: string
  desired_leads_per_day: number
  texts_per_lead: number
  target_contacts: number
  chunk_strategy: SmsCampaignChunkStrategy
  chunk_size: number
  group_by_zip: number
  blocked_reason: string | null
  created_at: string
  updated_at: string
}

export interface SmsCampaignJobZipRow {
  id: number
  job_key: string
  zip_code: string
  selection_state: 'requested' | 'selected' | 'held_back'
  sort_order: number
}

export interface SmsCampaignRunRow {
  id: number
  job_key: string
  run_key: string
  action: SmsCampaignRunAction
  state: SmsCampaignRunState
  input_run_id: number | null
  worker_pid: number | null
  command_text: string | null
  artifact_dir_rel_path: string
  stdout_rel_path: string | null
  stderr_rel_path: string | null
  summary_rel_path: string | null
  error_text: string | null
  created_at: string
  started_at: string | null
  ended_at: string | null
}

export interface SmsCampaignBatchRow {
  batch_key: string
  job_key: string
  source_run_id: number
  batch_index: number
  zip_code: string | null
  file_name: string
  rel_path: string
  row_count: number
  headers_verified: number
  duplicate_phone_count: number
  zip_purity_verified: number
  traceability_verified: number
  validation_summary_rel_path: string | null
  created_at: string
  updated_at: string
}

export interface CreateSmsCampaignJobInput {
  clientName: string
  sourceCsvPath: string
  sourceType?: string
  sourceProfile?: string
  desiredLeadsPerDay: number
  textsPerLead: number
  selectedZipCodes: string[]
  chunkStrategy: SmsCampaignChunkStrategy
  chunkSizeOverride?: number | null
}

export interface SmsCampaignLatestRuns {
  extract: SmsCampaignRunRow | null
  format: SmsCampaignRunRow | null
  validate: SmsCampaignRunRow | null
  active: SmsCampaignRunRow | null
  latest: SmsCampaignRunRow | null
}

export interface SmsCampaignDerivedState {
  status: SmsCampaignJobStatus
  nextAction: SmsCampaignNextAction
  blockedReason: string | null
  latestRuns: SmsCampaignLatestRuns
  currentBatches: SmsCampaignBatchRow[]
}

export interface SmsCampaignJobView extends SmsCampaignDerivedState {
  job: SmsCampaignJobRow
  zipCodes: SmsCampaignJobZipRow[]
}

export interface SmsCampaignJobDetail extends SmsCampaignJobView {
  runs: SmsCampaignRunRow[]
  batches: SmsCampaignBatchRow[]
  latestValidationSummary: Record<string, unknown> | null
}
