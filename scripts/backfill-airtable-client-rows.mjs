#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const DEFAULT_ENV_FILE = '/tmp/obieo-prod.env'
const DEFAULT_CONVEX_JSON = '/tmp/convex-organizations-live.json'

const AIRTABLE_NAME_FIELD_ID = 'fldcUUlwTa7ilHUUt'
const AIRTABLE_TARGET_ZIPS_FIELD_ID = 'fldkhT7xvvsypQIy9'
const AIRTABLE_PRICING_TIER_FIELD_ID = 'fldHORHFSYyCJWMeW'
const AIRTABLE_LEADS_PER_DAY_FIELD_ID = 'fldtU0kOpkKcYtoBD'
const AIRTABLE_SERVICES_OFFERED_FIELD_ID = 'flddzKcnRCoPDpAZy'
const AIRTABLE_CITY_FIELD_ID = 'fldBdDEVng8IvEnww'
const AIRTABLE_BUSINESS_PHONE_FIELD_ID = 'fldVR1hy8BTi9OrKz'
const AIRTABLE_NOTIFICATION_PHONE_FIELD_ID = 'fld2najORzjs3zdKE'
const AIRTABLE_NOTIFICATION_EMAIL_FIELD_ID = 'fldy7AUYFxf3vB1tL'
const AIRTABLE_PROSPECT_EMAIL_FIELD_ID = 'fldN6PVrSXozaE2JM'

function readCliArgs() {
  const out = {
    envFile: DEFAULT_ENV_FILE,
    convexJsonPath: DEFAULT_CONVEX_JSON,
    dryRun: false,
  }

  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--dry-run') {
      out.dryRun = true
      continue
    }
    if (arg === '--env-file' && args[i + 1]) {
      out.envFile = args[i + 1]
      i += 1
      continue
    }
    if (arg === '--convex-json' && args[i + 1]) {
      out.convexJsonPath = args[i + 1]
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
    env[key] = value.replace(/\\n/g, '\n')
  }

  return env
}

function normalizeName(value) {
  if (typeof value !== 'string') return ''
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanString(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function cleanEmail(value) {
  const cleaned = cleanString(value)
  return cleaned ? cleaned.toLowerCase() : ''
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => cleanString(entry))
    .filter(Boolean)
}

function resolvePricingTier(org) {
  const model = cleanString(org.billingModel)
  const leadUnitPriceCents =
    typeof org.leadUnitPriceCents === 'number' && Number.isFinite(org.leadUnitPriceCents)
      ? Math.floor(org.leadUnitPriceCents)
      : 0

  if (model === 'package_40_paid_in_full' || model === 'commitment_40_with_10_upfront') {
    return '40 Lead Package'
  }
  if (model !== 'pay_per_lead_perpetual' && model !== 'pay_per_lead_40_first_lead') {
    return ''
  }

  const map = {
    4500: 'PPL ($45)',
    4700: 'PPL ($47)',
    5000: 'PPL ($50)',
    5500: 'PPL ($55)',
    6000: 'PPL ($60)',
    6500: 'PPL ($65)',
    7000: 'PPL ($70)',
  }
  return map[leadUnitPriceCents] || ''
}

function resolveClientCity(org) {
  const address = cleanString(org.businessAddress)
  if (address) {
    const parts = address
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    if (parts.length >= 3) {
      return cleanString(parts[parts.length - 2])
    }
    if (parts.length === 2) {
      const [first, second] = parts
      return /\d/.test(first) ? cleanString(second) : cleanString(first)
    }
  }

  const serviceAreas = normalizeStringArray(org.serviceAreas)
  if (serviceAreas.length === 0) return ''
  const first = serviceAreas[0]
  const city = first.split(',')[0]
  return cleanString(city || first)
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
    return parsed
  } catch {
    return {}
  }
}

async function listAirtableRows({ token, baseId, tableId }) {
  const rows = []
  let offset = null

  while (true) {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`)
    url.searchParams.set('pageSize', '100')
    url.searchParams.set('returnFieldsByFieldId', 'true')
    url.searchParams.append('fields[]', AIRTABLE_NAME_FIELD_ID)
    if (offset) url.searchParams.set('offset', offset)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Airtable list failed (${response.status}): ${text.slice(0, 200)}`)
    }

    const payload = await response.json()
    const records = Array.isArray(payload.records) ? payload.records : []
    for (const row of records) {
      const businessName = cleanString(row?.fields?.[AIRTABLE_NAME_FIELD_ID] || '')
      rows.push({
        id: row.id,
        businessName,
        businessNameNormalized: normalizeName(businessName),
      })
    }

    offset = payload.offset || null
    if (!offset) break
  }

  return rows
}

function buildUpdateFields(org) {
  const fields = {}

  const targetZipCodes = normalizeStringArray(org.targetZipCodes)
  if (targetZipCodes.length > 0) {
    fields[AIRTABLE_TARGET_ZIPS_FIELD_ID] = targetZipCodes.join(', ')
  }

  const businessPhone = cleanString(normalizeStringArray(org.leadDeliveryPhones)[0] || '')
  if (businessPhone) {
    fields[AIRTABLE_BUSINESS_PHONE_FIELD_ID] = businessPhone
  }

  const notificationPhone = cleanString(org.leadNotificationPhone)
  if (notificationPhone) {
    fields[AIRTABLE_NOTIFICATION_PHONE_FIELD_ID] = notificationPhone
  }

  const notificationEmail = cleanEmail(org.leadNotificationEmail)
  if (notificationEmail) {
    fields[AIRTABLE_NOTIFICATION_EMAIL_FIELD_ID] = notificationEmail
  }

  const prospectEmail = cleanEmail(org.leadProspectEmail)
  if (prospectEmail) {
    fields[AIRTABLE_PROSPECT_EMAIL_FIELD_ID] = prospectEmail
  }

  const pricingTier = resolvePricingTier(org)
  if (pricingTier) {
    fields[AIRTABLE_PRICING_TIER_FIELD_ID] = pricingTier
  }

  if (typeof org.desiredLeadVolumeDaily === 'number' && Number.isFinite(org.desiredLeadVolumeDaily) && org.desiredLeadVolumeDaily > 0) {
    fields[AIRTABLE_LEADS_PER_DAY_FIELD_ID] = String(Math.floor(org.desiredLeadVolumeDaily))
  }

  const serviceTypes = normalizeStringArray(org.serviceTypes)
  if (serviceTypes.length > 0) {
    fields[AIRTABLE_SERVICES_OFFERED_FIELD_ID] = serviceTypes.join(', ')
  }

  const clientCity = resolveClientCity(org)
  if (clientCity) {
    fields[AIRTABLE_CITY_FIELD_ID] = clientCity
  }

  return fields
}

async function patchAirtableRow({ token, baseId, tableId, recordId, fields, dryRun }) {
  if (dryRun) return
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}?returnFieldsByFieldId=true`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      fields,
      typecast: true,
    }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Airtable update failed (${response.status}): ${text.slice(0, 200)}`)
  }
}

async function main() {
  const args = readCliArgs()
  if (!fs.existsSync(args.envFile)) {
    throw new Error(`Env file not found: ${args.envFile}`)
  }
  if (!fs.existsSync(args.convexJsonPath)) {
    throw new Error(`Convex JSON file not found: ${args.convexJsonPath}`)
  }

  const env = parseEnvFile(args.envFile)
  const token = cleanString(env.AIRTABLE_PERSONAL_ACCESS_TOKEN || env.AIRTABLE_API_KEY)
  const baseId = cleanString(env.AIRTABLE_CLIENT_BASE_ID || env.AIRTABLE_BASE_ID || '')
  const tableId = cleanString(env.AIRTABLE_CLIENT_TABLE_ID || '')
  const portalMap = parsePortalMap(env.AIRTABLE_PORTAL_KEY_MAP_JSON || '')

  if (!token || !baseId || !tableId) {
    throw new Error('Missing Airtable config (token/baseId/tableId) in env file.')
  }

  const orgs = JSON.parse(fs.readFileSync(args.convexJsonPath, 'utf8'))
  if (!Array.isArray(orgs)) {
    throw new Error('Convex JSON must be an array of organizations.')
  }

  const airtableRows = await listAirtableRows({ token, baseId, tableId })
  const rowsByName = new Map()
  for (const row of airtableRows) {
    if (!row.businessNameNormalized) continue
    const existing = rowsByName.get(row.businessNameNormalized) || []
    existing.push(row)
    rowsByName.set(row.businessNameNormalized, existing)
  }

  const businessByPortal = {}
  for (const [businessName, portalKey] of Object.entries(portalMap)) {
    businessByPortal[cleanString(portalKey)] = normalizeName(businessName)
  }

  let updated = 0
  let skipped = 0
  const failures = []

  for (const org of orgs) {
    const portalKey = cleanString(org.portalKey)
    const orgNameNormalized = normalizeName(org.name)
    const mappedNameNormalized = businessByPortal[portalKey] || ''
    const orgNameMatches = orgNameNormalized ? rowsByName.get(orgNameNormalized) || [] : []
    const mappedNameMatches = mappedNameNormalized ? rowsByName.get(mappedNameNormalized) || [] : []

    let row = null
    if (orgNameMatches.length === 1) {
      row = orgNameMatches[0]
    } else if (mappedNameMatches.length === 1) {
      row = mappedNameMatches[0]
    } else if (orgNameMatches.length > 1 || mappedNameMatches.length > 1) {
      skipped += 1
      failures.push({
        portalKey,
        businessName: cleanString(org.name) || '(unknown)',
        error: `Ambiguous Airtable match (orgNameMatches=${orgNameMatches.length}, mappedNameMatches=${mappedNameMatches.length})`,
      })
      continue
    }

    if (!row) {
      skipped += 1
      continue
    }

    const fields = buildUpdateFields(org)
    if (Object.keys(fields).length === 0) {
      skipped += 1
      continue
    }

    try {
      await patchAirtableRow({
        token,
        baseId,
        tableId,
        recordId: row.id,
        fields,
        dryRun: args.dryRun,
      })
      updated += 1
      const mode = args.dryRun ? 'DRY-RUN' : 'UPDATED'
      console.log(`${mode} ${row.businessName} (${row.id}) fields=${Object.keys(fields).length}`)
    } catch (error) {
      failures.push({
        portalKey,
        businessName: row.businessName,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  console.log(`done updated=${updated} skipped=${skipped} failures=${failures.length} dryRun=${args.dryRun}`)
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL ${failure.businessName} (${failure.portalKey}): ${failure.error}`)
    }
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
