import 'server-only'

import { recordLeadDeliveryInConvex } from '@/lib/convex'
import airtableBackfillDefaults from '@/lib/airtable-backfill-defaults.json'

const AIRTABLE_LIST_MAX_PAGES = 200
const ALLOWED_DELIVERY_STATUSES = new Set(['delivered', 'completed'])

type AirtableConfig = {
  token: string
  baseId: string
  clientTableId: string
  clientNameFieldId: string
  clientLinkedLeadsFieldId: string
  leadSheetTableId: string
  leadSheetNameFieldId: string
  leadSheetTimestampFieldId: string
  leadSheetStatusFieldId: string
}

type AirtableClientRow = {
  id: string
  businessName: string
  businessNameNormalized: string
  businessNameTokenKey: string
  linkedLeadIds: string[]
}

type AirtableLeadRow = {
  id: string
  leadName?: string
  status?: string
  deliveredAt?: number
}

export type AirtableLeadBackfillResult = {
  synced: boolean
  reason?: 'not_configured' | 'client_not_found' | 'client_ambiguous' | 'fetch_failed' | 'convex_write_failed'
  message?: string
  airtableClientRecordId?: string
  matchedBusinessName?: string
  totalLinkedLeadRows: number
  scannedLeadRows: number
  createdLeadEvents: number
  duplicateLeadEvents: number
  failedLeadEvents: number
}

function cleanString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function normalizeName(value: unknown): string {
  return cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeNameTokenKey(value: unknown): string {
  const normalized = normalizeName(value)
  if (!normalized) return ''
  return normalized
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ')
}

function parsePortalKeyMap(): Record<string, string> {
  const raw = process.env.AIRTABLE_PORTAL_KEY_MAP_JSON
  if (!raw?.trim()) return {}

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    const out: Record<string, string> = {}
    for (const [rawBusinessName, rawPortalKey] of Object.entries(parsed as Record<string, unknown>)) {
      const businessName = normalizeName(rawBusinessName)
      const portalKey = cleanString(rawPortalKey)
      if (!businessName || !portalKey) continue
      out[businessName] = portalKey
    }
    return out
  } catch (error) {
    console.error('Invalid AIRTABLE_PORTAL_KEY_MAP_JSON while backfilling Airtable leads:', error)
    return {}
  }
}

function getMappedBusinessNamesForPortalKey(portalKey: string): string[] {
  const normalizedPortalKey = cleanString(portalKey)
  if (!normalizedPortalKey) return []

  const matches: string[] = []
  for (const [businessName, mappedPortalKey] of Object.entries(parsePortalKeyMap())) {
    if (mappedPortalKey === normalizedPortalKey) matches.push(businessName)
  }
  return matches
}

function getAirtableToken(): string {
  return process.env.AIRTABLE_API_KEY?.trim() || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN?.trim() || ''
}

function getAirtableConfig(): AirtableConfig | null {
  const token = getAirtableToken()
  if (!token) return null

  return {
    token,
    baseId: process.env.AIRTABLE_CLIENT_BASE_ID?.trim() || airtableBackfillDefaults.baseId,
    clientTableId: process.env.AIRTABLE_CLIENT_TABLE_ID?.trim() || airtableBackfillDefaults.clientTableId,
    clientNameFieldId:
      process.env.AIRTABLE_CLIENT_NAME_FIELD_ID?.trim() || airtableBackfillDefaults.clientNameFieldId,
    clientLinkedLeadsFieldId:
      process.env.AIRTABLE_CLIENT_LINKED_LEADS_FIELD_ID?.trim() || airtableBackfillDefaults.clientLinkedLeadsFieldId,
    leadSheetTableId: process.env.AIRTABLE_LEAD_SHEET_TABLE_ID?.trim() || airtableBackfillDefaults.leadSheetTableId,
    leadSheetNameFieldId:
      process.env.AIRTABLE_LEAD_SHEET_NAME_FIELD_ID?.trim() || airtableBackfillDefaults.leadSheetNameFieldId,
    leadSheetTimestampFieldId:
      process.env.AIRTABLE_LEAD_SHEET_TIMESTAMP_FIELD_ID?.trim() || airtableBackfillDefaults.leadSheetTimestampFieldId,
    leadSheetStatusFieldId:
      process.env.AIRTABLE_LEAD_SHEET_STATUS_FIELD_ID?.trim() || airtableBackfillDefaults.leadSheetStatusFieldId,
  }
}

function getLinkedRecordIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => cleanString(entry)).filter(Boolean)
}

function toUnixTimestampMs(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1_000_000_000_000 ? Math.floor(value) : Math.floor(value * 1000)
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedNumber = Number(value)
    if (Number.isFinite(parsedNumber)) {
      return parsedNumber > 1_000_000_000_000 ? Math.floor(parsedNumber) : Math.floor(parsedNumber * 1000)
    }
    const parsedDate = Date.parse(value)
    if (!Number.isNaN(parsedDate)) return parsedDate
  }

  return undefined
}

function normalizeStatus(value: unknown): string {
  return cleanString(value).toLowerCase()
}

function isAllowedDeliveryStatus(status: string | undefined): boolean {
  if (!status) return false
  return ALLOWED_DELIVERY_STATUSES.has(normalizeStatus(status))
}

async function listAirtableClientRows(config: AirtableConfig): Promise<AirtableClientRow[]> {
  const rows: AirtableClientRow[] = []
  let offset: string | null = null
  let pageCount = 0

  while (true) {
    pageCount += 1
    if (pageCount > AIRTABLE_LIST_MAX_PAGES) {
      throw new Error(`Airtable client pagination safety cap hit at ${AIRTABLE_LIST_MAX_PAGES} pages.`)
    }

    const url = new URL(`https://api.airtable.com/v0/${config.baseId}/${config.clientTableId}`)
    url.searchParams.set('pageSize', '100')
    url.searchParams.set('returnFieldsByFieldId', 'true')
    url.searchParams.append('fields[]', config.clientNameFieldId)
    url.searchParams.append('fields[]', config.clientLinkedLeadsFieldId)
    if (offset) url.searchParams.set('offset', offset)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${config.token}` },
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Airtable client list failed (${response.status}): ${text.slice(0, 500)}`)
    }

    const payload = (await response.json()) as {
      records?: Array<{ id: string; fields?: Record<string, unknown> }>
      offset?: string
    }
    const records = Array.isArray(payload.records) ? payload.records : []

    for (const record of records) {
      const fields = record.fields || {}
      const businessName = cleanString(fields[config.clientNameFieldId])
      rows.push({
        id: record.id,
        businessName,
        businessNameNormalized: normalizeName(businessName),
        businessNameTokenKey: normalizeNameTokenKey(businessName),
        linkedLeadIds: getLinkedRecordIds(fields[config.clientLinkedLeadsFieldId]),
      })
    }

    offset = payload.offset || null
    if (!offset) break
  }

  return rows
}

async function listLeadSheetRows(config: AirtableConfig, linkedLeadIds: Set<string>): Promise<AirtableLeadRow[]> {
  if (linkedLeadIds.size === 0) return []

  const rows: AirtableLeadRow[] = []
  let offset: string | null = null
  let pageCount = 0

  while (true) {
    pageCount += 1
    if (pageCount > AIRTABLE_LIST_MAX_PAGES) {
      throw new Error(`Airtable lead-sheet pagination safety cap hit at ${AIRTABLE_LIST_MAX_PAGES} pages.`)
    }

    const url = new URL(`https://api.airtable.com/v0/${config.baseId}/${config.leadSheetTableId}`)
    url.searchParams.set('pageSize', '100')
    url.searchParams.set('returnFieldsByFieldId', 'true')
    url.searchParams.append('fields[]', config.leadSheetNameFieldId)
    url.searchParams.append('fields[]', config.leadSheetTimestampFieldId)
    url.searchParams.append('fields[]', config.leadSheetStatusFieldId)
    if (offset) url.searchParams.set('offset', offset)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${config.token}` },
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Airtable lead-sheet list failed (${response.status}): ${text.slice(0, 500)}`)
    }

    const payload = (await response.json()) as {
      records?: Array<{ id: string; fields?: Record<string, unknown> }>
      offset?: string
    }
    const records = Array.isArray(payload.records) ? payload.records : []

    for (const record of records) {
      if (!linkedLeadIds.has(record.id)) continue
      const fields = record.fields || {}
      rows.push({
        id: record.id,
        leadName: cleanString(fields[config.leadSheetNameFieldId]) || undefined,
        status: cleanString(fields[config.leadSheetStatusFieldId]) || undefined,
        deliveredAt: toUnixTimestampMs(fields[config.leadSheetTimestampFieldId]),
      })
    }

    offset = payload.offset || null
    if (!offset) break
  }

  return rows
}

function findMatchingClientRows(rows: AirtableClientRow[], portalKey: string, organizationName?: string): AirtableClientRow[] {
  const exactNameCandidates = new Set<string>(getMappedBusinessNamesForPortalKey(portalKey))
  const exactOrganizationName = normalizeName(organizationName)
  if (exactOrganizationName) exactNameCandidates.add(exactOrganizationName)

  const tokenCandidates = new Set<string>()
  for (const candidate of exactNameCandidates) {
    const tokenKey = normalizeNameTokenKey(candidate)
    if (tokenKey) tokenCandidates.add(tokenKey)
  }
  const organizationTokenKey = normalizeNameTokenKey(organizationName)
  if (organizationTokenKey) tokenCandidates.add(organizationTokenKey)

  return rows.filter((row) => {
    if (row.businessNameNormalized && exactNameCandidates.has(row.businessNameNormalized)) return true
    if (row.businessNameTokenKey && tokenCandidates.has(row.businessNameTokenKey)) return true
    return false
  })
}

export async function backfillPortalLeadHistoryFromAirtable(input: {
  portalKey: string
  organizationName?: string
}): Promise<AirtableLeadBackfillResult> {
  const config = getAirtableConfig()
  if (!config) {
    return {
      synced: false,
      reason: 'not_configured',
      message: 'Airtable lead backfill is not configured. Set AIRTABLE_PERSONAL_ACCESS_TOKEN (or AIRTABLE_API_KEY).',
      totalLinkedLeadRows: 0,
      scannedLeadRows: 0,
      createdLeadEvents: 0,
      duplicateLeadEvents: 0,
      failedLeadEvents: 0,
    }
  }

  let clientRows: AirtableClientRow[]
  try {
    clientRows = await listAirtableClientRows(config)
  } catch (error) {
    return {
      synced: false,
      reason: 'fetch_failed',
      message: error instanceof Error ? error.message : 'Failed to read Airtable client rows.',
      totalLinkedLeadRows: 0,
      scannedLeadRows: 0,
      createdLeadEvents: 0,
      duplicateLeadEvents: 0,
      failedLeadEvents: 0,
    }
  }

  const matches = findMatchingClientRows(clientRows, input.portalKey, input.organizationName)
  if (matches.length === 0) {
    return {
      synced: false,
      reason: 'client_not_found',
      message: 'Could not find a matching Airtable client row for this portal key.',
      totalLinkedLeadRows: 0,
      scannedLeadRows: 0,
      createdLeadEvents: 0,
      duplicateLeadEvents: 0,
      failedLeadEvents: 0,
    }
  }

  if (matches.length > 1) {
    return {
      synced: false,
      reason: 'client_ambiguous',
      message: 'Multiple Airtable client rows matched this portal key.',
      totalLinkedLeadRows: 0,
      scannedLeadRows: 0,
      createdLeadEvents: 0,
      duplicateLeadEvents: 0,
      failedLeadEvents: 0,
    }
  }

  const [clientRow] = matches
  const linkedLeadIds = new Set(clientRow.linkedLeadIds)

  let leadRows: AirtableLeadRow[]
  try {
    leadRows = await listLeadSheetRows(config, linkedLeadIds)
  } catch (error) {
    return {
      synced: false,
      reason: 'fetch_failed',
      message: error instanceof Error ? error.message : 'Failed to read Airtable lead sheet rows.',
      airtableClientRecordId: clientRow.id,
      matchedBusinessName: clientRow.businessName,
      totalLinkedLeadRows: linkedLeadIds.size,
      scannedLeadRows: 0,
      createdLeadEvents: 0,
      duplicateLeadEvents: 0,
      failedLeadEvents: 0,
    }
  }

  let createdLeadEvents = 0
  let duplicateLeadEvents = 0
  let failedLeadEvents = 0

  for (const leadRow of leadRows) {
    const sourceExternalId = `airtable:lead-sheet:${leadRow.id}`
    if (!isAllowedDeliveryStatus(leadRow.status)) {
      console.info('Skipping Airtable lead row during backfill due to non-delivered status.', {
        portalKey: input.portalKey,
        leadId: leadRow.id,
        sourceExternalId,
        status: leadRow.status || 'missing',
      })
      continue
    }

    if (typeof leadRow.deliveredAt !== 'number' || !Number.isFinite(leadRow.deliveredAt)) {
      console.error('Skipping Airtable lead row during backfill due to invalid deliveredAt timestamp.', {
        portalKey: input.portalKey,
        leadId: leadRow.id,
        sourceExternalId,
        rawStatus: leadRow.status || 'missing',
      })
      failedLeadEvents += 1
      continue
    }

    let convexResult
    try {
      convexResult = await recordLeadDeliveryInConvex({
        portalKey: input.portalKey,
        sourceExternalId,
        idempotencyKey: sourceExternalId,
        deliveredAt: leadRow.deliveredAt,
        quantity: 1,
        source: 'airtable_backfill',
        name: leadRow.leadName,
      })
    } catch (error) {
      console.error('Failed to record Airtable lead row during backfill.', {
        portalKey: input.portalKey,
        leadId: leadRow.id,
        sourceExternalId,
        error,
      })
      failedLeadEvents += 1
      continue
    }

    if (!convexResult) {
      failedLeadEvents += 1
      continue
    }

    if (convexResult.duplicate) {
      duplicateLeadEvents += 1
    } else {
      createdLeadEvents += 1
    }
  }

  const synced = failedLeadEvents === 0
  return {
    synced,
    ...(synced ? {} : { reason: 'convex_write_failed' as const }),
    ...(synced ? {} : { message: 'One or more Airtable leads could not be written into Convex.' }),
    airtableClientRecordId: clientRow.id,
    matchedBusinessName: clientRow.businessName,
    totalLinkedLeadRows: linkedLeadIds.size,
    scannedLeadRows: leadRows.length,
    createdLeadEvents,
    duplicateLeadEvents,
    failedLeadEvents,
  }
}
