#!/usr/bin/env node

import fs from 'fs'

const DEFAULT_ENV_FILE = '.env.local'
const AIRTABLE_LIST_MAX_PAGES = 200

const DEFAULT_BASE_ID = 'appqsVEAHr4AaaBAt'
const CLIENT_TABLE_ID = 'tblK1w4DWwbtEBZGf'
const CLIENT_NAME_FIELD_ID = 'fldcUUlwTa7ilHUUt'
const CLIENT_NOTIFICATION_EMAIL_FIELD_ID = 'fldy7AUYFxf3vB1tL'
const CLIENT_PROSPECT_EMAIL_FIELD_ID = 'fldN6PVrSXozaE2JM'

const LEAD_SHEET_TABLE_ID = 'tblvzFd4X0M1ejhX4'
const LEAD_SHEET_CLIENT_LINK_FIELD_ID = 'fldLPXBW3cRgCDkZp'
const LEAD_SHEET_TAGS_FIELD_ID = 'fldfaZZtHOTHkTA3e'
const LEAD_SHEET_TITLE_FIELD_ID = 'fld1SbuKltBSxq0wZ'

const FAILED_CHARGES_TABLE_ID = 'tblN52RL7EsR6frOb'
const FAILED_CHARGES_CLIENT_LINK_FIELD_ID = 'fldwjQPX7yGM5K3p8'
const FAILED_CHARGES_NAME_FIELD_ID = 'fldSkEm96qovsuTY4'
const FAILED_CHARGES_EMAIL_FIELD_ID = 'fld9DGByo3kd08VGH'

function readCliArgs() {
  const out = {
    envFile: DEFAULT_ENV_FILE,
    dryRun: true,
  }

  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--env-file' && args[i + 1]) {
      out.envFile = args[i + 1]
      i += 1
      continue
    }
    if (arg === '--write') {
      out.dryRun = false
      continue
    }
    if (arg === '--dry-run') {
      out.dryRun = true
      continue
    }
  }

  return out
}

function parseEnvFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const env = {}

  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx < 0) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[key] = value.replace(/\\n/g, '\n')
  }

  return env
}

function cleanString(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function normalizeName(value) {
  return cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeEmail(value) {
  return cleanString(value).toLowerCase()
}

function parsePortalMap(raw) {
  if (!raw) return {}
  let source = raw.trim()
  if ((source.startsWith('"') && source.endsWith('"')) || (source.startsWith("'") && source.endsWith("'"))) {
    source = source.slice(1, -1)
  }
  source = source.replace(/\\"/g, '"')

  try {
    const parsed = JSON.parse(source)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out = {}
    for (const [key, value] of Object.entries(parsed)) {
      const normalizedBusinessName = normalizeName(key)
      const portalKey = cleanString(value)
      if (!normalizedBusinessName || !portalKey) continue
      out[normalizedBusinessName] = portalKey
    }
    return out
  } catch {
    return {}
  }
}

function parseTagTokens(raw) {
  const text = cleanString(raw)
  if (!text) return []
  return text
    .split(/[;,|]/g)
    .map((entry) => normalizeName(entry))
    .filter(Boolean)
}

function parseLeadTitleBusinessHint(raw) {
  const title = cleanString(raw)
  if (!title.includes('-')) return ''
  const [, maybeBusiness] = title.split('-')
  return normalizeName(maybeBusiness)
}

async function listTableRows({ token, baseId, tableId, fieldIds }) {
  const rows = []
  let offset = null
  let pageCount = 0

  while (true) {
    pageCount += 1
    if (pageCount > AIRTABLE_LIST_MAX_PAGES) {
      throw new Error(`Pagination safety cap hit for table ${tableId}`)
    }

    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`)
    url.searchParams.set('pageSize', '100')
    url.searchParams.set('returnFieldsByFieldId', 'true')
    for (const fieldId of fieldIds) {
      url.searchParams.append('fields[]', fieldId)
    }
    if (offset) url.searchParams.set('offset', offset)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`List failed for table ${tableId} (${response.status}): ${text.slice(0, 300)}`)
    }

    const payload = await response.json()
    const records = Array.isArray(payload.records) ? payload.records : []
    rows.push(...records)
    offset = payload.offset || null
    if (!offset) break
  }

  return rows
}

async function patchRecordLink({ token, baseId, tableId, recordId, linkFieldId, clientId, dryRun }) {
  if (dryRun) return

  const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}?returnFieldsByFieldId=true`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        [linkFieldId]: [clientId],
      },
      typecast: true,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Patch failed for ${tableId}/${recordId} (${response.status}): ${text.slice(0, 300)}`)
  }
}

function pickClientIdByNames({ nameMap, candidates }) {
  const matches = new Set()
  for (const name of candidates) {
    const id = nameMap.get(name)
    if (id) matches.add(id)
  }
  if (matches.size !== 1) return null
  return [...matches][0]
}

async function main() {
  const args = readCliArgs()
  if (!fs.existsSync(args.envFile)) {
    throw new Error(`Env file not found: ${args.envFile}`)
  }

  const env = parseEnvFile(args.envFile)
  const token = cleanString(env.AIRTABLE_PERSONAL_ACCESS_TOKEN || env.AIRTABLE_API_KEY)
  const baseId = cleanString(env.AIRTABLE_CLIENT_BASE_ID || env.AIRTABLE_BASE_ID || DEFAULT_BASE_ID)
  const portalMap = parsePortalMap(env.AIRTABLE_PORTAL_KEY_MAP_JSON || '')

  if (!token || !baseId) {
    throw new Error('Missing Airtable credentials/config in env file.')
  }

  const clientRows = await listTableRows({
    token,
    baseId,
    tableId: CLIENT_TABLE_ID,
    fieldIds: [CLIENT_NAME_FIELD_ID, CLIENT_NOTIFICATION_EMAIL_FIELD_ID, CLIENT_PROSPECT_EMAIL_FIELD_ID],
  })

  const clientByName = new Map()
  const clientByEmail = new Map()

  for (const row of clientRows) {
    const fields = row.fields || {}
    const normalizedName = normalizeName(fields[CLIENT_NAME_FIELD_ID])
    const notificationEmail = normalizeEmail(fields[CLIENT_NOTIFICATION_EMAIL_FIELD_ID])
    const prospectEmail = normalizeEmail(fields[CLIENT_PROSPECT_EMAIL_FIELD_ID])

    if (normalizedName && !clientByName.has(normalizedName)) {
      clientByName.set(normalizedName, row.id)
    }
    if (notificationEmail && !clientByEmail.has(notificationEmail)) {
      clientByEmail.set(notificationEmail, row.id)
    }
    if (prospectEmail && !clientByEmail.has(prospectEmail)) {
      clientByEmail.set(prospectEmail, row.id)
    }
  }

  let leadUpdated = 0
  let leadSkipped = 0
  const leadFailures = []

  const leadRows = await listTableRows({
    token,
    baseId,
    tableId: LEAD_SHEET_TABLE_ID,
    fieldIds: [LEAD_SHEET_CLIENT_LINK_FIELD_ID, LEAD_SHEET_TAGS_FIELD_ID, LEAD_SHEET_TITLE_FIELD_ID],
  })

  for (const row of leadRows) {
    const fields = row.fields || {}
    const existingLinks = Array.isArray(fields[LEAD_SHEET_CLIENT_LINK_FIELD_ID])
      ? fields[LEAD_SHEET_CLIENT_LINK_FIELD_ID]
      : []

    if (existingLinks.length > 0) {
      leadSkipped += 1
      continue
    }

    const tagCandidates = parseTagTokens(fields[LEAD_SHEET_TAGS_FIELD_ID])
    const titleCandidate = parseLeadTitleBusinessHint(fields[LEAD_SHEET_TITLE_FIELD_ID])
    const candidates = new Set([...tagCandidates, titleCandidate].filter(Boolean))

    for (const candidate of [...candidates]) {
      const mappedPortalKey = portalMap[candidate]
      if (!mappedPortalKey) continue
      for (const [businessName, portalKey] of Object.entries(portalMap)) {
        if (portalKey === mappedPortalKey) candidates.add(businessName)
      }
    }

    const clientId = pickClientIdByNames({
      nameMap: clientByName,
      candidates,
    })

    if (!clientId) {
      leadSkipped += 1
      continue
    }

    try {
      await patchRecordLink({
        token,
        baseId,
        tableId: LEAD_SHEET_TABLE_ID,
        recordId: row.id,
        linkFieldId: LEAD_SHEET_CLIENT_LINK_FIELD_ID,
        clientId,
        dryRun: args.dryRun,
      })
      leadUpdated += 1
    } catch (error) {
      leadFailures.push({ id: row.id, error: error instanceof Error ? error.message : String(error) })
    }
  }

  let failedChargesUpdated = 0
  let failedChargesSkipped = 0
  const failedChargeFailures = []

  const failedChargeRows = await listTableRows({
    token,
    baseId,
    tableId: FAILED_CHARGES_TABLE_ID,
    fieldIds: [
      FAILED_CHARGES_CLIENT_LINK_FIELD_ID,
      FAILED_CHARGES_NAME_FIELD_ID,
      FAILED_CHARGES_EMAIL_FIELD_ID,
    ],
  })

  for (const row of failedChargeRows) {
    const fields = row.fields || {}
    const existingLinks = Array.isArray(fields[FAILED_CHARGES_CLIENT_LINK_FIELD_ID])
      ? fields[FAILED_CHARGES_CLIENT_LINK_FIELD_ID]
      : []

    if (existingLinks.length > 0) {
      failedChargesSkipped += 1
      continue
    }

    const normalizedName = normalizeName(fields[FAILED_CHARGES_NAME_FIELD_ID])
    const normalizedEmail = normalizeEmail(fields[FAILED_CHARGES_EMAIL_FIELD_ID])
    const clientFromName = normalizedName ? clientByName.get(normalizedName) : null
    const clientFromEmail = normalizedEmail ? clientByEmail.get(normalizedEmail) : null
    const clientId = clientFromName || clientFromEmail

    if (!clientId) {
      failedChargesSkipped += 1
      continue
    }

    try {
      await patchRecordLink({
        token,
        baseId,
        tableId: FAILED_CHARGES_TABLE_ID,
        recordId: row.id,
        linkFieldId: FAILED_CHARGES_CLIENT_LINK_FIELD_ID,
        clientId,
        dryRun: args.dryRun,
      })
      failedChargesUpdated += 1
    } catch (error) {
      failedChargeFailures.push({ id: row.id, error: error instanceof Error ? error.message : String(error) })
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun: args.dryRun,
        baseId,
        summary: {
          leadSheet: {
            total: leadRows.length,
            updated: leadUpdated,
            skipped: leadSkipped,
            failed: leadFailures.length,
          },
          failedCharges: {
            total: failedChargeRows.length,
            updated: failedChargesUpdated,
            skipped: failedChargesSkipped,
            failed: failedChargeFailures.length,
          },
        },
      },
      null,
      2
    )
  )

  for (const failure of leadFailures) {
    console.error(`LEAD_LINK_FAIL ${failure.id}: ${failure.error}`)
  }
  for (const failure of failedChargeFailures) {
    console.error(`FAILED_CHARGE_LINK_FAIL ${failure.id}: ${failure.error}`)
  }

  if (leadFailures.length > 0 || failedChargeFailures.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
