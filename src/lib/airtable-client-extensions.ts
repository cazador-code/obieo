import 'server-only'

const DEFAULT_BASE_ID = 'appqsVEAHr4AaaBAt'
const DEFAULT_CLIENT_TABLE_ID = 'tblK1w4DWwbtEBZGf'
const METRICS_TABLE_NAME = 'Client Metrics'
const OPS_TABLE_NAME = 'Client Ops'
const AIRTABLE_LIST_MAX_PAGES = 200

type AirtableTableField = {
  id: string
  name: string
}

type AirtableTable = {
  id: string
  name: string
  fields?: AirtableTableField[]
}

type ExtensionSchema = {
  baseId: string
  clientTableId: string
  metricsTableId: string
  opsTableId: string
  clientFieldIds: Record<string, string>
  metricsFieldIds: Record<string, string>
  opsFieldIds: Record<string, string>
}

let schemaCache: Promise<ExtensionSchema | null> | null = null

function getToken(): string {
  return process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN?.trim() || process.env.AIRTABLE_API_KEY?.trim() || ''
}

function cleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getSelectName(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value.trim() || null
  if (typeof value === 'object' && typeof (value as { name?: unknown }).name === 'string') {
    const name = ((value as { name?: unknown }).name as string).trim()
    return name || null
  }
  return null
}

async function airtableMeta(path: string): Promise<unknown> {
  const token = getToken()
  if (!token) return null

  const response = await fetch(`https://api.airtable.com/v0${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Airtable meta request failed (${response.status}): ${text.slice(0, 500)}`)
  }
  return text ? JSON.parse(text) : null
}

async function airtableData(path: string, init: RequestInit = {}): Promise<unknown> {
  const token = getToken()
  if (!token) return null

  const response = await fetch(`https://api.airtable.com/v0${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Airtable data request failed (${response.status}): ${text.slice(0, 500)}`)
  }
  return text ? JSON.parse(text) : null
}

function fieldIdByName(table: AirtableTable, name: string): string {
  const field = (table.fields || []).find((value) => value.name === name)
  if (!field) {
    throw new Error(`Missing Airtable field ${table.name}.${name}`)
  }
  return field.id
}

async function loadSchema(): Promise<ExtensionSchema | null> {
  const token = getToken()
  if (!token) return null

  const baseId = process.env.AIRTABLE_CLIENT_BASE_ID?.trim() || DEFAULT_BASE_ID
  const clientTableId = process.env.AIRTABLE_CLIENT_TABLE_ID?.trim() || DEFAULT_CLIENT_TABLE_ID

  const payload = (await airtableMeta(`/meta/bases/${baseId}/tables`)) as { tables?: AirtableTable[] } | null
  const tables = Array.isArray(payload?.tables) ? payload.tables : []
  const clientTable = tables.find((table) => table.id === clientTableId)
  const metricsTable = tables.find((table) => table.name === METRICS_TABLE_NAME)
  const opsTable = tables.find((table) => table.name === OPS_TABLE_NAME)
  if (!clientTable || !metricsTable || !opsTable) return null

  return {
    baseId,
    clientTableId,
    metricsTableId: metricsTable.id,
    opsTableId: opsTable.id,
    clientFieldIds: {
      portalKey: fieldIdByName(clientTable, 'Portal Key (stable ID)'),
      businessName: fieldIdByName(clientTable, 'Business Name'),
      pricingTier: fieldIdByName(clientTable, 'Pricing Tier'),
      billingSummary: fieldIdByName(clientTable, 'Billing Terms Summary'),
      currentLeadCommitment: fieldIdByName(clientTable, 'Current Lead Commitment'),
      remainingLeads: fieldIdByName(clientTable, 'Remaining Leads'),
      packagePurchases: fieldIdByName(clientTable, 'Package Purchases'),
      totalLeadsSent: fieldIdByName(clientTable, 'Total Leads Sent'),
      leadsToday: fieldIdByName(clientTable, 'Leads Today'),
      lifetimeCreditsGranted: fieldIdByName(clientTable, 'Lifetime Credits Granted'),
      pendingCreditsCount: fieldIdByName(clientTable, 'Pending Credits Count'),
      pendingCreditsValue: fieldIdByName(clientTable, 'Pending Credits Value ($)'),
      creditsGrantedValue: fieldIdByName(clientTable, 'Credits Granted Value ($)'),
      totalPaid: fieldIdByName(clientTable, 'Total Paid'),
      failedChargesValue: fieldIdByName(clientTable, 'Failed Charges $'),
      failedChargesCount: fieldIdByName(clientTable, 'Failed Charges Count'),
    },
    metricsFieldIds: {
      clientLink: fieldIdByName(metricsTable, 'Client'),
      portalKey: fieldIdByName(metricsTable, 'Portal Key'),
      businessName: fieldIdByName(metricsTable, 'Business Name'),
      pricingTier: fieldIdByName(metricsTable, 'Pricing Tier'),
      billingSummary: fieldIdByName(metricsTable, 'Billing Terms Summary'),
      currentLeadCommitment: fieldIdByName(metricsTable, 'Current Lead Commitment'),
      remainingLeads: fieldIdByName(metricsTable, 'Remaining Leads'),
      packagePurchases: fieldIdByName(metricsTable, 'Package Purchases'),
      totalLeadsSent: fieldIdByName(metricsTable, 'Total Leads Sent'),
      leadsToday: fieldIdByName(metricsTable, 'Leads Today'),
      lifetimeCreditsGranted: fieldIdByName(metricsTable, 'Lifetime Credits Granted'),
      pendingCreditsCount: fieldIdByName(metricsTable, 'Pending Credits Count'),
      pendingCreditsValue: fieldIdByName(metricsTable, 'Pending Credits Value ($)'),
      creditsGrantedValue: fieldIdByName(metricsTable, 'Credits Granted Value ($)'),
      totalPaid: fieldIdByName(metricsTable, 'Total Paid'),
      failedChargesValue: fieldIdByName(metricsTable, 'Failed Charges $'),
      failedChargesCount: fieldIdByName(metricsTable, 'Failed Charges Count'),
    },
    opsFieldIds: {
      clientLink: fieldIdByName(opsTable, 'Client'),
      portalKey: fieldIdByName(opsTable, 'Portal Key'),
      businessName: fieldIdByName(opsTable, 'Business Name'),
    },
  }
}

async function getSchema(): Promise<ExtensionSchema | null> {
  if (!schemaCache) schemaCache = loadSchema()
  return schemaCache
}

async function listRecords(baseId: string, tableId: string, fieldIds: string[]) {
  const records: Array<{ id: string; fields?: Record<string, unknown> }> = []
  let offset: string | null = null
  let pageCount = 0

  while (true) {
    pageCount += 1
    if (pageCount > AIRTABLE_LIST_MAX_PAGES) {
      throw new Error(`Airtable pagination safety cap hit at ${AIRTABLE_LIST_MAX_PAGES} pages.`)
    }

    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`)
    url.searchParams.set('pageSize', '100')
    url.searchParams.set('returnFieldsByFieldId', 'true')
    for (const fieldId of fieldIds) url.searchParams.append('fields[]', fieldId)
    if (offset) url.searchParams.set('offset', offset)

    const token = getToken()
    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const text = await response.text()
    if (!response.ok) {
      throw new Error(`Airtable list records failed (${response.status}): ${text.slice(0, 500)}`)
    }
    const payload = text ? JSON.parse(text) : {}
    records.push(...((payload.records as Array<{ id: string; fields?: Record<string, unknown> }>) || []))
    offset = typeof payload.offset === 'string' ? payload.offset : null
    if (!offset) break
  }

  return records
}

async function upsertMetricsRow(schema: ExtensionSchema, input: {
  parentRecordId: string
  portalKey: string
  businessName: string
  fields: Record<string, unknown>
}) {
  const existingRows = await listRecords(schema.baseId, schema.metricsTableId, [
    schema.metricsFieldIds.portalKey,
  ])
  const existing = existingRows.find(
    (record) => cleanString(record.fields?.[schema.metricsFieldIds.portalKey]) === input.portalKey
  )

  const payload = {
    [schema.metricsFieldIds.clientLink]: [input.parentRecordId],
    [schema.metricsFieldIds.portalKey]: input.portalKey,
    [schema.metricsFieldIds.businessName]: input.businessName || null,
    [schema.metricsFieldIds.pricingTier]: getSelectName(input.fields[schema.clientFieldIds.pricingTier]) || null,
    [schema.metricsFieldIds.billingSummary]:
      cleanString(input.fields[schema.clientFieldIds.billingSummary]) || null,
    [schema.metricsFieldIds.currentLeadCommitment]:
      input.fields[schema.clientFieldIds.currentLeadCommitment] ?? null,
    [schema.metricsFieldIds.remainingLeads]: input.fields[schema.clientFieldIds.remainingLeads] ?? null,
    [schema.metricsFieldIds.packagePurchases]: input.fields[schema.clientFieldIds.packagePurchases] ?? null,
    [schema.metricsFieldIds.totalLeadsSent]: input.fields[schema.clientFieldIds.totalLeadsSent] ?? null,
    [schema.metricsFieldIds.leadsToday]: input.fields[schema.clientFieldIds.leadsToday] ?? null,
    [schema.metricsFieldIds.lifetimeCreditsGranted]:
      input.fields[schema.clientFieldIds.lifetimeCreditsGranted] ?? null,
    [schema.metricsFieldIds.pendingCreditsCount]:
      input.fields[schema.clientFieldIds.pendingCreditsCount] ?? null,
    [schema.metricsFieldIds.pendingCreditsValue]:
      input.fields[schema.clientFieldIds.pendingCreditsValue] ?? null,
    [schema.metricsFieldIds.creditsGrantedValue]:
      input.fields[schema.clientFieldIds.creditsGrantedValue] ?? null,
    [schema.metricsFieldIds.totalPaid]: input.fields[schema.clientFieldIds.totalPaid] ?? null,
    [schema.metricsFieldIds.failedChargesValue]:
      input.fields[schema.clientFieldIds.failedChargesValue] ?? null,
    [schema.metricsFieldIds.failedChargesCount]:
      input.fields[schema.clientFieldIds.failedChargesCount] ?? null,
  }

  if (existing) {
    await airtableData(`/${schema.baseId}/${schema.metricsTableId}/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields: payload, typecast: true }),
    })
    return { created: false, recordId: existing.id }
  }

  const created = (await airtableData(`/${schema.baseId}/${schema.metricsTableId}`, {
    method: 'POST',
    body: JSON.stringify({ fields: payload, typecast: true }),
  })) as { id?: string } | null

  return { created: true, recordId: created?.id || null }
}

export async function syncClientMetricsExtension(input: {
  portalKey: string
}): Promise<{ synced: boolean; reason?: string; recordId?: string | null; created?: boolean }> {
  const schema = await getSchema()
  if (!schema) {
    return { synced: false, reason: 'not_configured' }
  }

  const parentRows = await listRecords(schema.baseId, schema.clientTableId, [
    ...Object.values(schema.clientFieldIds),
  ])
  const parent = parentRows.find(
    (record) => cleanString(record.fields?.[schema.clientFieldIds.portalKey]) === cleanString(input.portalKey)
  )
  if (!parent) {
    return { synced: false, reason: 'client_not_found' }
  }

  const businessName = cleanString(parent.fields?.[schema.clientFieldIds.businessName])
  const result = await upsertMetricsRow(schema, {
    parentRecordId: parent.id,
    portalKey: cleanString(input.portalKey),
    businessName,
    fields: parent.fields || {},
  })

  return { synced: true, recordId: result.recordId, created: result.created }
}
