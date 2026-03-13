import 'server-only'

const DEFAULT_AIRTABLE_BASE_ID = 'appqsVEAHr4AaaBAt'
const DEFAULT_CLIENT_TABLE_ID = 'tblK1w4DWwbtEBZGf'
const DEFAULT_CLIENT_USER_ID_FIELD_ID = 'fld4AuvIhp4xjPgNM'
const DEFAULT_LEAD_SHEET_TABLE_ID = 'tblvzFd4X0M1ejhX4'
const DEFAULT_LEAD_SHEET_CLIENT_LINK_FIELD_ID = 'fldLPXBW3cRgCDkZp'
const DEFAULT_FAILED_CHARGES_TABLE_ID = 'tblN52RL7EsR6frOb'
const DEFAULT_FAILED_CHARGES_CLIENT_LINK_FIELD_ID = 'fldwjQPX7yGM5K3p8'
const AIRTABLE_LIST_MAX_PAGES = 200

type AirtableConfig = {
  token: string
  baseId: string
  clientTableId: string
  clientUserIdFieldId: string
  leadSheetTableId: string
  leadSheetClientLinkFieldId: string
  failedChargesTableId: string
  failedChargesClientLinkFieldId: string
}

type ClientLookupRow = {
  id: string
  clientKey: string
}

export type AirtableClientLinkReason =
  | 'not_configured'
  | 'invalid_record_id'
  | 'fetch_failed'
  | 'client_not_found'
  | 'client_ambiguous'
  | 'update_failed'

export type AirtableClientLinkResult = {
  linked: boolean
  reason?: AirtableClientLinkReason
  message?: string
  clientRecordId?: string
  candidateCount?: number
}

type ClientResolverInput = {
  portalKey?: string
}

function cleanString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function getAirtableToken(): string {
  return process.env.AIRTABLE_API_KEY?.trim() || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN?.trim() || ''
}

function getConfig(): AirtableConfig | null {
  const token = getAirtableToken()
  if (!token) return null

  const baseId = process.env.AIRTABLE_CLIENT_BASE_ID?.trim() || DEFAULT_AIRTABLE_BASE_ID
  const clientTableId = process.env.AIRTABLE_CLIENT_TABLE_ID?.trim() || DEFAULT_CLIENT_TABLE_ID
  const clientUserIdFieldId =
    process.env.AIRTABLE_CLIENT_USER_ID_FIELD_ID?.trim() || DEFAULT_CLIENT_USER_ID_FIELD_ID
  const leadSheetTableId = process.env.AIRTABLE_LEAD_SHEET_TABLE_ID?.trim() || DEFAULT_LEAD_SHEET_TABLE_ID
  const leadSheetClientLinkFieldId =
    process.env.AIRTABLE_LEAD_SHEET_CLIENT_LINK_FIELD_ID?.trim() || DEFAULT_LEAD_SHEET_CLIENT_LINK_FIELD_ID
  const failedChargesTableId =
    process.env.AIRTABLE_FAILED_CHARGES_TABLE_ID?.trim() || DEFAULT_FAILED_CHARGES_TABLE_ID
  const failedChargesClientLinkFieldId =
    process.env.AIRTABLE_FAILED_CHARGES_CLIENT_LINK_FIELD_ID?.trim() ||
    DEFAULT_FAILED_CHARGES_CLIENT_LINK_FIELD_ID

  if (
    !baseId ||
    !clientTableId ||
    !clientUserIdFieldId ||
    !leadSheetTableId ||
    !leadSheetClientLinkFieldId ||
    !failedChargesTableId ||
    !failedChargesClientLinkFieldId
  ) {
    return null
  }

  return {
    token,
    baseId,
    clientTableId,
    clientUserIdFieldId,
    leadSheetTableId,
    leadSheetClientLinkFieldId,
    failedChargesTableId,
    failedChargesClientLinkFieldId,
  }
}

async function listClientLookupRows(config: AirtableConfig): Promise<ClientLookupRow[]> {
  const fields = [
    config.clientUserIdFieldId,
  ]

  const rows: ClientLookupRow[] = []
  let offset: string | null = null
  let pageCount = 0

  while (true) {
    pageCount += 1
    if (pageCount > AIRTABLE_LIST_MAX_PAGES) {
      throw new Error(`Airtable pagination safety cap hit at ${AIRTABLE_LIST_MAX_PAGES} pages.`)
    }

    const url = new URL(`https://api.airtable.com/v0/${config.baseId}/${config.clientTableId}`)
    url.searchParams.set('pageSize', '100')
    url.searchParams.set('returnFieldsByFieldId', 'true')
    for (const fieldId of fields) {
      url.searchParams.append('fields[]', fieldId)
    }
    if (offset) url.searchParams.set('offset', offset)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${config.token}` },
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Airtable list client rows failed (${response.status}): ${text.slice(0, 500)}`)
    }

    const payload = (await response.json()) as {
      records?: Array<{ id: string; fields?: Record<string, unknown> }>
      offset?: string
    }
    const records = Array.isArray(payload.records) ? payload.records : []

    for (const record of records) {
      const fieldsMap = record.fields || {}
      const clientKey = cleanString(fieldsMap[config.clientUserIdFieldId])
      if (!clientKey) continue
      rows.push({
        id: record.id,
        clientKey,
      })
    }

    offset = payload.offset || null
    if (!offset) break
  }

  return rows
}

function resolveClientCandidates(rows: ClientLookupRow[], input: ClientResolverInput): ClientLookupRow[] {
  const clientKey = cleanString(input.portalKey)
  if (!clientKey) return []
  return rows.filter((row) => row.clientKey === clientKey)
}

async function patchRecordLink(input: {
  config: AirtableConfig
  tableId: string
  linkFieldId: string
  recordId: string
  clientRecordId: string
}): Promise<void> {
  const url = new URL(
    `https://api.airtable.com/v0/${input.config.baseId}/${input.tableId}/${input.recordId}`
  )
  url.searchParams.set('returnFieldsByFieldId', 'true')

  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${input.config.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        [input.linkFieldId]: [input.clientRecordId],
      },
      typecast: true,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Airtable link patch failed (${response.status}): ${text.slice(0, 500)}`)
  }
}

async function linkRecordToClient(input: {
  config: AirtableConfig
  tableId: string
  linkFieldId: string
  recordId: string
  resolver: ClientResolverInput
}): Promise<AirtableClientLinkResult> {
  const recordId = cleanString(input.recordId)
  if (!recordId) {
    return {
      linked: false,
      reason: 'invalid_record_id',
      message: 'Missing Airtable record ID.',
    }
  }

  let clients: ClientLookupRow[]
  try {
    clients = await listClientLookupRows(input.config)
  } catch (error) {
    console.error('Failed to list client rows before linking:', error)
    return {
      linked: false,
      reason: 'fetch_failed',
      message: 'Could not list Airtable client rows.',
    }
  }

  const candidates = resolveClientCandidates(clients, input.resolver)
  if (candidates.length === 0) {
    return {
      linked: false,
      reason: 'client_not_found',
      message: 'No client row matched the exact stable client ID.',
      candidateCount: 0,
    }
  }

  if (candidates.length > 1) {
    return {
      linked: false,
      reason: 'client_ambiguous',
      message: 'Multiple client rows matched the webhook payload.',
      candidateCount: candidates.length,
    }
  }

  const [client] = candidates
  try {
    await patchRecordLink({
      config: input.config,
      tableId: input.tableId,
      linkFieldId: input.linkFieldId,
      recordId,
      clientRecordId: client.id,
    })
  } catch (error) {
    console.error('Failed to patch Airtable record link:', error)
    return {
      linked: false,
      reason: 'update_failed',
      message: 'Could not patch Airtable record link.',
      clientRecordId: client.id,
    }
  }

  return {
    linked: true,
    clientRecordId: client.id,
    candidateCount: 1,
  }
}

export async function linkLeadSheetRecordToClient(input: {
  recordId: string
  portalKey?: string
}): Promise<AirtableClientLinkResult> {
  const config = getConfig()
  if (!config) {
    return {
      linked: false,
      reason: 'not_configured',
      message: 'Airtable client-link sync is not configured.',
    }
  }

  return linkRecordToClient({
    config,
    tableId: config.leadSheetTableId,
    linkFieldId: config.leadSheetClientLinkFieldId,
    recordId: input.recordId,
    resolver: {
      portalKey: input.portalKey,
    },
  })
}

export async function linkFailedChargeRecordToClient(input: {
  recordId: string
  portalKey?: string
}): Promise<AirtableClientLinkResult> {
  const config = getConfig()
  if (!config) {
    return {
      linked: false,
      reason: 'not_configured',
      message: 'Airtable client-link sync is not configured.',
    }
  }

  return linkRecordToClient({
    config,
    tableId: config.failedChargesTableId,
    linkFieldId: config.failedChargesClientLinkFieldId,
    recordId: input.recordId,
    resolver: {
      portalKey: input.portalKey,
    },
  })
}
