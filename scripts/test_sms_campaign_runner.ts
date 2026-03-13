import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import {
  createOrFindSmsCampaignJob,
  enqueueSmsCampaignRun,
  getSmsCampaignJobDetail,
} from '@/lib/sms-campaign-runner/repository'
import type { SmsCampaignRunAction } from '@/lib/sms-campaign-runner/types'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function writeFixtureCsv(filePath: string, broken = false) {
  const rows = broken
    ? [
        ['firstName', 'lastName', 'propertyAddress', 'phone1', 'phone2', 'phone2_type', 'phone3', 'phone3_type'],
        ['JANE', 'DOE', '123 Main St, Houston, TX 77001', '(713) 555-1111', '', '', '', ''],
      ]
    : [
        ['firstName', 'lastName', 'propertyAddress', 'phone1', 'phone1_type', 'phone2', 'phone2_type', 'phone3', 'phone3_type', 'email1', 'email2', 'email3'],
        ['JANE', 'DOE', '123 Main St, Houston, TX 77001', '(713) 555-1111', 'W', '', '', '', '', 'jane@example.com', '', ''],
        ['JOHN', 'SMITH', '456 Oak Ave, Houston, TX 77001', '', '', '713-555-2222', 'W', '', '', '', '', ''],
        ['SARA', 'JONES', '789 Pine Rd, Houston, TX 77002', '', '', '', '', '7135553333', 'W', '', '', ''],
        ['JANE', 'DOE', '999 Duplicate Ln, Houston, TX 77001', '+1 (713) 555-1111', 'W', '', '', '', '', '', '', ''],
      ]
  fs.writeFileSync(
    filePath,
    `${rows.map((row) => row.map((value) => escapeCsv(value)).join(',')).join('\n')}\n`,
    'utf8',
  )
}

async function waitForRun(jobKey: string, action: SmsCampaignRunAction, runId: number) {
  const timeoutAt = Date.now() + 60_000
  for (;;) {
    const detail = getSmsCampaignJobDetail(jobKey)
    assert(detail, `Missing job detail for ${jobKey}.`)
    const run = detail.runs.find((candidate) => candidate.id === runId)
    assert(run, `Missing run ${runId} for ${jobKey}.`)
    if (run.state === 'succeeded' || run.state === 'failed') {
      return { detail, run }
    }
    if (Date.now() > timeoutAt) {
      throw new Error(`Timed out waiting for ${action} run ${run.run_key}. Last known state: ${run.state}`)
    }
    await sleep(250)
  }
}

function logProof(label: string, value: string) {
  process.stdout.write(`[proof] ${label}: ${value}\n`)
}

async function main() {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sms-campaign-runner-'))
  const sourceCsvPath = path.join(fixtureDir, 'merged_master_v1_fixture.csv')
  const brokenSourceCsvPath = path.join(fixtureDir, 'merged_master_v1_broken_fixture.csv')
  writeFixtureCsv(sourceCsvPath)
  writeFixtureCsv(brokenSourceCsvPath, true)

  const clientName = `Runner Test ${Date.now()}`
  const created = createOrFindSmsCampaignJob({
    clientName,
    sourceCsvPath,
    desiredLeadsPerDay: 1,
    textsPerLead: 500,
    selectedZipCodes: ['77001', '77002'],
    chunkStrategy: 'zip',
    chunkSizeOverride: 2,
  })
  assert.equal(created.created, true, 'Expected a brand new test job.')
  logProof('job_key', created.jobKey)

  const duplicateCreate = createOrFindSmsCampaignJob({
    clientName,
    sourceCsvPath,
    desiredLeadsPerDay: 1,
    textsPerLead: 500,
    selectedZipCodes: ['77001', '77002'],
    chunkStrategy: 'zip',
    chunkSizeOverride: 2,
  })
  assert.equal(duplicateCreate.created, false, 'Expected duplicate create to return the existing job.')
  assert.equal(duplicateCreate.jobKey, created.jobKey)
  logProof('create_idempotency', `duplicate create returned ${duplicateCreate.jobKey}`)

  const firstExtract = enqueueSmsCampaignRun(created.jobKey, 'extract_raw')
  const duplicateExtract = enqueueSmsCampaignRun(created.jobKey, 'extract_raw')
  assert.equal(duplicateExtract.alreadyRunning, true, 'Second extract trigger should reuse the active run.')
  assert.equal(duplicateExtract.run.id, firstExtract.run.id, 'Duplicate extract should return the existing run.')
  logProof('concurrency_guard', `extract double-trigger returned ${duplicateExtract.run.run_key}`)

  const extractResult = await waitForRun(created.jobKey, 'extract_raw', firstExtract.run.id)
  assert.equal(extractResult.run.state, 'succeeded')
  assert.equal(extractResult.detail.status, 'raw_exported')
  logProof('extract_status', `${extractResult.run.run_key} -> ${extractResult.detail.status}`)

  const firstFormat = enqueueSmsCampaignRun(created.jobKey, 'format_batches')
  const formatResult = await waitForRun(created.jobKey, 'format_batches', firstFormat.run.id)
  assert.equal(formatResult.run.state, 'succeeded')
  assert.equal(formatResult.detail.status, 'formatted')
  assert(formatResult.detail.currentBatches.length > 0, 'Format run should create at least one batch.')
  assert(formatResult.detail.currentBatches.every((batch) => batch.source_run_id === firstFormat.run.id))
  logProof(
    'current_batch_set_after_format_001',
    `${firstFormat.run.run_key} with ${formatResult.detail.currentBatches.length} files`,
  )

  const firstValidate = enqueueSmsCampaignRun(created.jobKey, 'validate_lr_ready')
  const validateResult = await waitForRun(created.jobKey, 'validate_lr_ready', firstValidate.run.id)
  assert.equal(validateResult.run.state, 'succeeded')
  assert.equal(validateResult.detail.status, 'lr_ready')
  logProof('validate_status', `${firstValidate.run.run_key} -> ${validateResult.detail.status}`)

  const secondFormat = enqueueSmsCampaignRun(created.jobKey, 'format_batches')
  const secondFormatResult = await waitForRun(created.jobKey, 'format_batches', secondFormat.run.id)
  assert.equal(secondFormatResult.run.state, 'succeeded')
  assert.equal(secondFormatResult.detail.status, 'formatted')
  assert.equal(secondFormatResult.detail.nextAction, 'Validate LR-ready')
  assert.equal(secondFormatResult.detail.latestRuns.format?.id, secondFormat.run.id)
  assert(secondFormatResult.detail.currentBatches.every((batch) => batch.source_run_id === secondFormat.run.id))
  assert(
    secondFormatResult.detail.batches.some((batch) => batch.source_run_id === firstFormat.run.id),
    'Expected first format batch set to remain visible as history.',
  )
  logProof(
    'superseded_format_behavior',
    `${secondFormat.run.run_key} is current, ${firstFormat.run.run_key} remains historical, status=${secondFormatResult.detail.status}`,
  )

  const secondValidate = enqueueSmsCampaignRun(created.jobKey, 'validate_lr_ready')
  const secondValidateResult = await waitForRun(created.jobKey, 'validate_lr_ready', secondValidate.run.id)
  assert.equal(secondValidateResult.run.state, 'succeeded')
  assert.equal(secondValidateResult.detail.status, 'lr_ready')
  logProof('revalidated_status', `${secondValidate.run.run_key} -> ${secondValidateResult.detail.status}`)

  const blockedJob = createOrFindSmsCampaignJob({
    clientName: `${clientName} Blocked`,
    sourceCsvPath: brokenSourceCsvPath,
    desiredLeadsPerDay: 1,
    textsPerLead: 500,
    selectedZipCodes: ['77001'],
    chunkStrategy: 'zip',
    chunkSizeOverride: 2,
  })
  const blockedExtract = enqueueSmsCampaignRun(blockedJob.jobKey, 'extract_raw')
  const blockedResult = await waitForRun(blockedJob.jobKey, 'extract_raw', blockedExtract.run.id)
  assert.equal(blockedResult.run.state, 'failed')
  assert.equal(blockedResult.detail.status, 'blocked')
  assert(blockedResult.detail.blockedReason, 'Blocked job should surface a blocked reason.')
  logProof('blocked_run_visibility', `${blockedExtract.run.run_key} failed with blocker: ${blockedResult.detail.blockedReason}`)

  const detailPageSource = fs.readFileSync(
    path.join(process.cwd(), 'src/app/app/internal/sms-campaigns/[jobKey]/page.tsx'),
    'utf8',
  )
  for (const marker of ['Current authoritative results', 'Current authoritative batch set', 'Historical batch sets', 'Latest blocker']) {
    assert(detailPageSource.includes(marker), `Expected page source to include ${marker}.`)
  }
  logProof('job_detail_markers', 'page source contains authoritative, historical, and blocker sections')
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`)
  process.exit(1)
})
