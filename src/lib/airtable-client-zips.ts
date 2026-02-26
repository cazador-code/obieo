import 'server-only'

const ZIP_RE = /^\d{5}$/

const DEFAULT_AIRTABLE_BASE_ID = 'appqsVEAHr4AaaBAt'
const DEFAULT_CLIENT_TABLE_ID = 'tblK1w4DWwbtEBZGf'
const DEFAULT_CLIENT_NAME_FIELD_ID = 'fldcUUlwTa7ilHUUt'
const DEFAULT_CLIENT_STATUS_FIELD_ID = 'fldih1MfZsOmH4SQ3'
const DEFAULT_CLIENT_TARGET_ZIPS_FIELD_ID = 'fldkhT7xvvsypQIy9'
const DEFAULT_ACTIVE_STATUS_NAMES = ['3. Ready to Launch', '4. Launched']
const AIRTABLE_LIST_MAX_PAGES = 200

type AirtableRawRecord = {
  id: string
  fields?: Record<string, unknown>
}

type AirtableClientRecord = {
  id: string
  businessNameRaw: string
  businessNameNormalized: string
  statusRaw: string
  statusNormalized: string
  targetZipCodes: string[]
}

export interface ZipConflictRow {
  zipCode: string
  businessName: string
  status: string
  airtableRecordId: string
}

export interface ZipConflictCheckResult {
  checked: boolean
  conflicts: ZipConflictRow[]
  reason?: 'not_configured' | 'fetch_failed'
  message?: string
}

export interface AirtableZipSyncResult {
  synced: boolean
  reason?: 'not_configured' | 'fetch_failed' | 'client_not_found' | 'client_ambiguous' | 'update_failed'
  message?: string
  airtableRecordId?: string
  targetZipCodes?: string[]
}

type AirtableConfig = {
  token: string
  baseId: string
  tableId: string
  nameFieldId: string
  statusFieldId: string
  targetZipFieldId: string
  activeStatusNames: Set<string>
}

function cleanString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeStatus(value: string): string {
  return value.trim().toLowerCase()
}

function parseZipCodes(value: unknown): string[] {
  const raw = cleanString(value)
  if (!raw) return []

  const parts = raw
    .split(/[\s,;]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean)

  const seen = new Set<string>()
  const output: string[] = []
  for (const part of parts) {
    if (!ZIP_RE.test(part)) continue
    if (seen.has(part)) continue
    seen.add(part)
    output.push(part)
  }
  return output
}

function parsePortalKeyMap(): Record<string, string> {
  const raw = process.env.AIRTABLE_PORTAL_KEY_MAP_JSON
  if (!raw || !raw.trim()) return {}

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    const out: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const businessName = normalizeName(cleanString(key))
      const portalKey = cleanString(value)
      if (!businessName || !portalKey) continue
      out[businessName] = portalKey
    }
    return out
  } catch (error) {
    console.error('Invalid AIRTABLE_PORTAL_KEY_MAP_JSON:', error)
    return {}
  }
}

function getAirtableToken(): string {
  return (
    process.env.AIRTABLE_API_KEY?.trim() ||
    process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN?.trim() ||
    ''
  )
}

function getActiveStatusNames(): Set<string> {
  const raw = process.env.AIRTABLE_ACTIVE_CLIENT_STATUS_NAMES?.trim()
  const source = raw
    ? raw
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : DEFAULT_ACTIVE_STATUS_NAMES

  return new Set(source.map((status) => normalizeStatus(status)))
}

function getAirtableConfig(): AirtableConfig | null {
  const token = getAirtableToken()
  if (!token) return null

  const baseId = process.env.AIRTABLE_CLIENT_BASE_ID?.trim() || DEFAULT_AIRTABLE_BASE_ID
  const tableId = process.env.AIRTABLE_CLIENT_TABLE_ID?.trim() || DEFAULT_CLIENT_TABLE_ID
  const nameFieldId = process.env.AIRTABLE_CLIENT_NAME_FIELD_ID?.trim() || DEFAULT_CLIENT_NAME_FIELD_ID
  const statusFieldId = process.env.AIRTABLE_CLIENT_STATUS_FIELD_ID?.trim() || DEFAULT_CLIENT_STATUS_FIELD_ID
  const targetZipFieldId =
    process.env.AIRTABLE_CLIENT_TARGET_ZIPS_FIELD_ID?.trim() || DEFAULT_CLIENT_TARGET_ZIPS_FIELD_ID

  if (!baseId || !tableId || !nameFieldId || !statusFieldId || !targetZipFieldId) return null

  return {
    token,
    baseId,
    tableId,
    nameFieldId,
    statusFieldId,
    targetZipFieldId,
    activeStatusNames: getActiveStatusNames(),
  }
}

function getSingleSelectName(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (value && typeof value === 'object' && 'name' in value) {
    const name = (value as { name?: unknown }).name
    return cleanString(name)
  }
  return ''
}

async function listAirtableClientRecords(config: AirtableConfig): Promise<AirtableClientRecord[]> {
  const fields = [config.nameFieldId, config.statusFieldId, config.targetZipFieldId]
  const results: AirtableClientRecord[] = []
  let offset: string | null = null
  let pageCount = 0

  while (true) {
    pageCount += 1
    if (pageCount > AIRTABLE_LIST_MAX_PAGES) {
      const message =
        `Airtable pagination safety cap hit after ${AIRTABLE_LIST_MAX_PAGES} pages ` +
        `for base ${config.baseId}, table ${config.tableId}. Last offset: ${offset ?? 'none'}.`
      console.error(message)
      throw new Error(message)
    }

    const url = new URL(`https://api.airtable.com/v0/${config.baseId}/${config.tableId}`)
    url.searchParams.set('pageSize', '100')
    for (const field of fields) {
      url.searchParams.append('fields[]', field)
    }
    if (offset) url.searchParams.set('offset', offset)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Airtable list records failed (${response.status}): ${text.slice(0, 500)}`)
    }

    const payload = (await response.json()) as { records?: AirtableRawRecord[]; offset?: string }
    const records = Array.isArray(payload.records) ? payload.records : []

    for (const record of records) {
      const fieldsMap = record.fields || {}
      const businessNameRaw = cleanString(fieldsMap[config.nameFieldId])
      const statusRaw = getSingleSelectName(fieldsMap[config.statusFieldId])
      const targetZipCodes = parseZipCodes(fieldsMap[config.targetZipFieldId])

      results.push({
        id: record.id,
        businessNameRaw,
        businessNameNormalized: normalizeName(businessNameRaw),
        statusRaw,
        statusNormalized: normalizeStatus(statusRaw),
        targetZipCodes,
      })
    }

    offset = payload.offset || null
    if (!offset) break
  }

  return results
}

function getBusinessNameCandidates(portalKey: string, organizationName?: string): Set<string> {
  const candidates = new Set<string>()
  const normalizedPortalKey = portalKey.trim()
  const portalMap = parsePortalKeyMap()
  for (const [businessName, mappedPortalKey] of Object.entries(portalMap)) {
    if (mappedPortalKey.trim() === normalizedPortalKey) {
      candidates.add(businessName)
    }
  }

  const orgName = normalizeName(cleanString(organizationName))
  if (orgName) candidates.add(orgName)

  return candidates
}

function findMatchingClientRecords(
  rows: AirtableClientRecord[],
  portalKey: string,
  organizationName?: string
): AirtableClientRecord[] {
  const candidates = getBusinessNameCandidates(portalKey, organizationName)
  if (candidates.size === 0) return []
  return rows.filter((row) => row.businessNameNormalized && candidates.has(row.businessNameNormalized))
}

export async function checkAirtableZipConflictsForApproval(input: {
  portalKey: string
  requestedAddZipCodes: string[]
  organizationName?: string
}): Promise<ZipConflictCheckResult> {
  const requestedAddZipCodes = Array.from(
    new Set(
      input.requestedAddZipCodes
        .map((zip) => cleanString(zip))
        .filter((zip) => ZIP_RE.test(zip))
    )
  )
  if (requestedAddZipCodes.length === 0) {
    return { checked: true, conflicts: [] }
  }

  const config = getAirtableConfig()
  if (!config) {
    return {
      checked: false,
      conflicts: [],
      reason: 'not_configured',
      message:
        'Airtable conflict check is not configured. Set AIRTABLE_API_KEY (or AIRTABLE_PERSONAL_ACCESS_TOKEN).',
    }
  }

  let rows: AirtableClientRecord[]
  try {
    rows = await listAirtableClientRecords(config)
  } catch (error) {
    return {
      checked: false,
      conflicts: [],
      reason: 'fetch_failed',
      message: error instanceof Error ? error.message : 'Failed to read Airtable records.',
    }
  }

  const selfRows = findMatchingClientRecords(rows, input.portalKey, input.organizationName)
  const selfRecordIdSet = new Set(selfRows.map((row) => row.id))
  const requestedZipSet = new Set(requestedAddZipCodes)
  const conflicts: ZipConflictRow[] = []
  const seenConflict = new Set<string>()

  for (const row of rows) {
    if (selfRecordIdSet.has(row.id)) continue
    if (!config.activeStatusNames.has(row.statusNormalized)) continue

    for (const zipCode of row.targetZipCodes) {
      if (!requestedZipSet.has(zipCode)) continue
      const dedupe = `${row.id}:${zipCode}`
      if (seenConflict.has(dedupe)) continue
      seenConflict.add(dedupe)
      conflicts.push({
        zipCode,
        businessName: row.businessNameRaw || 'Unknown Client',
        status: row.statusRaw || 'Unknown',
        airtableRecordId: row.id,
      })
    }
  }

  return { checked: true, conflicts }
}

export async function syncApprovedZipCodesToAirtable(input: {
  portalKey: string
  organizationName?: string
  targetZipCodes: string[]
}): Promise<AirtableZipSyncResult> {
  const config = getAirtableConfig()
  if (!config) {
    return {
      synced: false,
      reason: 'not_configured',
      message: 'Airtable sync is not configured. Set AIRTABLE_API_KEY (or AIRTABLE_PERSONAL_ACCESS_TOKEN).',
    }
  }

  let rows: AirtableClientRecord[]
  try {
    rows = await listAirtableClientRecords(config)
  } catch (error) {
    return {
      synced: false,
      reason: 'fetch_failed',
      message: error instanceof Error ? error.message : 'Failed to read Airtable records.',
    }
  }

  const matches = findMatchingClientRecords(rows, input.portalKey, input.organizationName)
  if (matches.length === 0) {
    return {
      synced: false,
      reason: 'client_not_found',
      message:
        'Could not find matching Airtable client row. Add or fix AIRTABLE_PORTAL_KEY_MAP_JSON for this portal key.',
    }
  }
  if (matches.length > 1) {
    return {
      synced: false,
      reason: 'client_ambiguous',
      message: 'Found multiple Airtable client rows for this portal key. Narrow AIRTABLE_PORTAL_KEY_MAP_JSON.',
    }
  }

  const target = matches[0]
  const normalizedTargetZipCodes = Array.from(
    new Set(input.targetZipCodes.map((zip) => cleanString(zip)).filter((zip) => ZIP_RE.test(zip)))
  )

  const response = await fetch(
    `https://api.airtable.com/v0/${config.baseId}/${config.tableId}/${target.id}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          [config.targetZipFieldId]: normalizedTargetZipCodes.join(', '),
        },
        typecast: true,
      }),
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    const text = await response.text()
    return {
      synced: false,
      reason: 'update_failed',
      message: `Airtable update failed (${response.status}): ${text.slice(0, 500)}`,
    }
  }

  return {
    synced: true,
    airtableRecordId: target.id,
    targetZipCodes: normalizedTargetZipCodes,
  }
}
