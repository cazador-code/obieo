#!/usr/bin/env node

import fs from 'fs'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api.js'

const DEFAULT_APP_ENV_FILE = '.env.local'
const DEFAULT_AIRTABLE_ENV_FILE = '.vercel/.env.production.local'
const DEFAULT_AIRTABLE_BASE_ID = 'appqsVEAHr4AaaBAt'
const DEFAULT_CLIENT_TABLE_ID = 'tblK1w4DWwbtEBZGf'
const DEFAULT_CLIENT_NAME_FIELD_ID = 'fldcUUlwTa7ilHUUt'
const DEFAULT_CLIENT_LINKED_LEADS_FIELD_ID = 'fldd3DxeRrwsAi8um'
const DEFAULT_LEAD_SHEET_TABLE_ID = 'tblvzFd4X0M1ejhX4'
const DEFAULT_LEAD_SHEET_NAME_FIELD_ID = 'fldky20wCEiA9whfa'
const DEFAULT_LEAD_SHEET_TIMESTAMP_FIELD_ID = 'fldNalvQg96GHhtOg'
const DEFAULT_LEAD_SHEET_STATUS_FIELD_ID = 'fldaKVkT2R2RYIT7y'
const AIRTABLE_LIST_MAX_PAGES = 200

function readCliArgs() {
  const out = {
    appEnvFile: DEFAULT_APP_ENV_FILE,
    airtableEnvFile: DEFAULT_AIRTABLE_ENV_FILE,
    portalKey: '',
  }

  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--app-env-file' && args[i + 1]) {
      out.appEnvFile = args[i + 1]
      i += 1
      continue
    }
    if (arg === '--airtable-env-file' && args[i + 1]) {
      out.airtableEnvFile = args[i + 1]
      i += 1
      continue
    }
    if (arg === '--portal-key' && args[i + 1]) {
      out.portalKey = args[i + 1]
      i += 1
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
    env[key] = value.replace(/\\n/g, '\n').trim()
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

function normalizeNameTokenKey(value) {
  const normalized = normalizeName(value)
  if (!normalized) return ''
  return normalized
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ')
}

function getLinkedRecordIds(value) {
  if (!Array.isArray(value)) return []
  return value.map((entry) => cleanString(entry)).filter(Boolean)
}

function toUnixTimestampMs(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1_000_000_000_000 ? Math.floor(value) : Math.floor(value * 1000)
  }
  if (typeof value === 'string' && value.trim()) {
    const asNumber = Number(value)
    if (Number.isFinite(asNumber)) {
      return asNumber > 1_000_000_000_000 ? Math.floor(asNumber) : Math.floor(asNumber * 1000)
    }
    const parsedDate = Date.parse(value)
    if (!Number.isNaN(parsedDate)) return parsedDate
  }
  return Date.now()
}

function parsePortalMap(raw) {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    const out = {}
    for (const [rawBusinessName, rawPortalKey] of Object.entries(parsed)) {
      const businessName = normalizeName(rawBusinessName)
      const portalKey = cleanString(rawPortalKey)
      if (!businessName || !portalKey) continue
      out[businessName] = portalKey
    }
    return out
  } catch (error) {
    console.error('Invalid AIRTABLE_PORTAL_KEY_MAP_JSON in env file:', error)
    return {}
  }
}

async function listTableRows({ token, baseId, tableId, fieldIds }) {
  const rows = []
  let offset = null
  let pageCount = 0

  while (true) {
    pageCount += 1
    if (pageCount > AIRTABLE_LIST_MAX_PAGES) {
      throw new Error(`Pagination safety cap hit at ${AIRTABLE_LIST_MAX_PAGES} pages for table ${tableId}.`)
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
      throw new Error(`Airtable list failed for ${tableId} (${response.status}): ${text.slice(0, 500)}`)
    }

    const payload = await response.json()
    const records = Array.isArray(payload.records) ? payload.records : []
    rows.push(...records)
    offset = payload.offset || null
    if (!offset) break
  }

  return rows
}

async function main() {
  const args = readCliArgs()
  const appEnv = parseEnvFile(args.appEnvFile)
  const airtableEnv = parseEnvFile(args.airtableEnvFile)

  const convexUrl = cleanString(appEnv.CONVEX_URL)
  const convexAuthSecret = cleanString(appEnv.CONVEX_AUTH_ADAPTER_SECRET)
  const airtableToken = cleanString(airtableEnv.AIRTABLE_PERSONAL_ACCESS_TOKEN || airtableEnv.AIRTABLE_API_KEY)
  const baseId = cleanString(airtableEnv.AIRTABLE_CLIENT_BASE_ID || DEFAULT_AIRTABLE_BASE_ID)
  const portalMap = parsePortalMap(airtableEnv.AIRTABLE_PORTAL_KEY_MAP_JSON || '')

  if (!convexUrl || !convexAuthSecret) {
    throw new Error('Missing CONVEX_URL or CONVEX_AUTH_ADAPTER_SECRET in app env file.')
  }
  if (!airtableToken || !baseId) {
    throw new Error('Missing Airtable token or base ID in Airtable env file.')
  }

  const convex = new ConvexHttpClient(convexUrl)
  const organizations = await convex.query(api.leadLedger.listOrganizationsForOps, {
    authSecret: convexAuthSecret,
    limit: 1000,
  })

  const portalKeyFilter = cleanString(args.portalKey)
  const organizationsByName = new Map()
  const organizationsByTokenKey = new Map()

  for (const organization of organizations) {
    const name = cleanString(organization.name)
    if (!name || !organization.portalKey) continue

    const exactName = normalizeName(name)
    const tokenKey = normalizeNameTokenKey(name)
    if (exactName && !organizationsByName.has(exactName)) {
      organizationsByName.set(exactName, organization.portalKey)
    }
    if (tokenKey) {
      const existing = organizationsByTokenKey.get(tokenKey) || []
      existing.push({ portalKey: organization.portalKey, name })
      organizationsByTokenKey.set(tokenKey, existing)
    }
  }

  const clientRows = await listTableRows({
    token: airtableToken,
    baseId,
    tableId: cleanString(airtableEnv.AIRTABLE_CLIENT_TABLE_ID || DEFAULT_CLIENT_TABLE_ID),
    fieldIds: [
      cleanString(airtableEnv.AIRTABLE_CLIENT_NAME_FIELD_ID || DEFAULT_CLIENT_NAME_FIELD_ID),
      cleanString(airtableEnv.AIRTABLE_CLIENT_LINKED_LEADS_FIELD_ID || DEFAULT_CLIENT_LINKED_LEADS_FIELD_ID),
    ],
  })

  const leadRows = await listTableRows({
    token: airtableToken,
    baseId,
    tableId: cleanString(airtableEnv.AIRTABLE_LEAD_SHEET_TABLE_ID || DEFAULT_LEAD_SHEET_TABLE_ID),
    fieldIds: [
      cleanString(airtableEnv.AIRTABLE_LEAD_SHEET_NAME_FIELD_ID || DEFAULT_LEAD_SHEET_NAME_FIELD_ID),
      cleanString(airtableEnv.AIRTABLE_LEAD_SHEET_TIMESTAMP_FIELD_ID || DEFAULT_LEAD_SHEET_TIMESTAMP_FIELD_ID),
      cleanString(airtableEnv.AIRTABLE_LEAD_SHEET_STATUS_FIELD_ID || DEFAULT_LEAD_SHEET_STATUS_FIELD_ID),
    ],
  })

  const leadRowMap = new Map(
    leadRows.map((row) => [
      row.id,
      {
        leadName: cleanString(row?.fields?.[cleanString(airtableEnv.AIRTABLE_LEAD_SHEET_NAME_FIELD_ID || DEFAULT_LEAD_SHEET_NAME_FIELD_ID)]) || undefined,
        deliveredAt: toUnixTimestampMs(row?.fields?.[cleanString(airtableEnv.AIRTABLE_LEAD_SHEET_TIMESTAMP_FIELD_ID || DEFAULT_LEAD_SHEET_TIMESTAMP_FIELD_ID)]),
        status: cleanString(row?.fields?.[cleanString(airtableEnv.AIRTABLE_LEAD_SHEET_STATUS_FIELD_ID || DEFAULT_LEAD_SHEET_STATUS_FIELD_ID)]) || undefined,
      },
    ])
  )

  const summary = []

  for (const clientRow of clientRows) {
    const fields = clientRow.fields || {}
    const businessName = cleanString(fields[cleanString(airtableEnv.AIRTABLE_CLIENT_NAME_FIELD_ID || DEFAULT_CLIENT_NAME_FIELD_ID)])
    const normalizedBusinessName = normalizeName(businessName)
    const tokenKey = normalizeNameTokenKey(businessName)
    const linkedLeadIds = getLinkedRecordIds(
      fields[cleanString(airtableEnv.AIRTABLE_CLIENT_LINKED_LEADS_FIELD_ID || DEFAULT_CLIENT_LINKED_LEADS_FIELD_ID)]
    )

    if (linkedLeadIds.length === 0) continue

    let portalKey = portalMap[normalizedBusinessName] || organizationsByName.get(normalizedBusinessName) || ''
    if (!portalKey && tokenKey) {
      const tokenMatches = organizationsByTokenKey.get(tokenKey) || []
      if (tokenMatches.length === 1) {
        portalKey = tokenMatches[0].portalKey
      }
    }

    if (!portalKey) {
      summary.push({
        businessName,
        portalKey: null,
        linkedLeadRows: linkedLeadIds.length,
        created: 0,
        duplicates: 0,
        failed: linkedLeadIds.length,
        reason: 'unresolved_portal_key',
      })
      continue
    }

    if (portalKeyFilter && portalKey !== portalKeyFilter) continue

    let created = 0
    let duplicates = 0
    let failed = 0

    for (const leadId of linkedLeadIds) {
      const lead = leadRowMap.get(leadId)
      if (!lead) {
        failed += 1
        continue
      }

      const result = await convex.mutation(api.leadLedger.recordLeadDelivery, {
        authSecret: convexAuthSecret,
        portalKey,
        sourceExternalId: `airtable:lead-sheet:${leadId}`,
        idempotencyKey: `airtable:lead-sheet:${leadId}`,
        deliveredAt: lead.deliveredAt,
        quantity: 1,
        source: 'airtable_backfill',
        name: lead.leadName,
      })

      if (result?.duplicate) {
        duplicates += 1
      } else {
        created += 1
      }
    }

    summary.push({
      businessName,
      portalKey,
      linkedLeadRows: linkedLeadIds.length,
      created,
      duplicates,
      failed,
    })
  }

  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
