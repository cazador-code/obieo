const BASE_ID = process.env.AIRTABLE_CLIENT_BASE_ID || 'appqsVEAHr4AaaBAt'
const TOKEN =
  process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN?.trim() ||
  process.env.AIRTABLE_API_KEY?.trim() ||
  ''

if (!TOKEN) {
  throw new Error('Missing AIRTABLE_PERSONAL_ACCESS_TOKEN or AIRTABLE_API_KEY')
}

const CLIENT_TABLE_ID = process.env.AIRTABLE_CLIENT_TABLE_ID || 'tblK1w4DWwbtEBZGf'
const METRICS_TABLE_NAME = 'Client Metrics'
const OPS_TABLE_NAME = 'Client Ops'

async function airtable(path, init = {}) {
  const response = await fetch(`https://api.airtable.com/v0${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  const text = await response.text()
  const json = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(`Airtable request failed ${response.status}: ${text}`)
  }
  return json
}

async function getTables() {
  const payload = await airtable(`/meta/bases/${BASE_ID}/tables`)
  return Array.isArray(payload.tables) ? payload.tables : []
}

function getFieldId(table, fieldName) {
  const field = (table.fields || []).find((value) => value.name === fieldName)
  if (!field) throw new Error(`Missing field ${table.name}.${fieldName}`)
  return field.id
}

async function listAllRecords(tableId, fieldIds) {
  const records = []
  let offset = null

  while (true) {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`)
    url.searchParams.set('pageSize', '100')
    url.searchParams.set('returnFieldsByFieldId', 'true')
    for (const fieldId of fieldIds) url.searchParams.append('fields[]', fieldId)
    if (offset) url.searchParams.set('offset', offset)

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    const text = await response.text()
    const payload = text ? JSON.parse(text) : null
    if (!response.ok) throw new Error(`List records failed ${response.status}: ${text}`)

    records.push(...(payload.records || []))
    offset = payload.offset || null
    if (!offset) break
  }

  return records
}

function normalizeSelectName(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && typeof value.name === 'string') return value.name
  return null
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

async function createRecord(tableId, fields) {
  return airtable(`/${BASE_ID}/${tableId}`, {
    method: 'POST',
    body: JSON.stringify({ fields, typecast: true }),
  })
}

async function updateRecord(tableId, recordId, fields) {
  return airtable(`/${BASE_ID}/${tableId}/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields, typecast: true }),
  })
}

async function main() {
  const tables = await getTables()
  const clientTable = tables.find((table) => table.id === CLIENT_TABLE_ID)
  const metricsTable = tables.find((table) => table.name === METRICS_TABLE_NAME)
  const opsTable = tables.find((table) => table.name === OPS_TABLE_NAME)

  if (!clientTable || !metricsTable || !opsTable) {
    throw new Error('Missing one or more required tables')
  }

  const clientFieldIds = {
    portalKey: getFieldId(clientTable, 'Portal Key (stable ID)'),
    businessName: getFieldId(clientTable, 'Business Name'),
    pricingTier: getFieldId(clientTable, 'Pricing Tier'),
    billingSummary: getFieldId(clientTable, 'Billing Terms Summary'),
    currentLeadCommitment: getFieldId(clientTable, 'Current Lead Commitment'),
    remainingLeads: getFieldId(clientTable, 'Remaining Leads'),
    packagePurchases: getFieldId(clientTable, 'Package Purchases'),
    totalLeadsSent: getFieldId(clientTable, 'Total Leads Sent'),
    leadsToday: getFieldId(clientTable, 'Leads Today'),
    lifetimeCreditsGranted: getFieldId(clientTable, 'Lifetime Credits Granted'),
    pendingCreditsCount: getFieldId(clientTable, 'Pending Credits Count'),
    pendingCreditsValue: getFieldId(clientTable, 'Pending Credits Value ($)'),
    creditsGrantedValue: getFieldId(clientTable, 'Credits Granted Value ($)'),
    totalPaid: getFieldId(clientTable, 'Total Paid'),
    failedChargesValue: getFieldId(clientTable, 'Failed Charges $'),
    failedChargesCount: getFieldId(clientTable, 'Failed Charges Count'),
    csStatus: getFieldId(clientTable, 'CS Status'),
    outboundSeat: getFieldId(clientTable, 'Outbound Seat (manual)'),
    pendingCreditsManual: getFieldId(clientTable, 'Pending Credits (manual)'),
    clientNotes: getFieldId(clientTable, 'Client Notes'),
    zipCodesScraped: getFieldId(clientTable, 'Zip Codes Scraped (short text)'),
    mondayCheckup: getFieldId(clientTable, 'Monday Checkup'),
    wednesdayCheckup: getFieldId(clientTable, 'Wednesday Checkup'),
    fridayCheckup: getFieldId(clientTable, 'Friday Checkup'),
    leadSheetCopy: getFieldId(clientTable, 'Lead Sheet copy'),
  }

  const metricsFieldIds = {
    clientLink: getFieldId(metricsTable, 'Client'),
    portalKey: getFieldId(metricsTable, 'Portal Key'),
    businessName: getFieldId(metricsTable, 'Business Name'),
    pricingTier: getFieldId(metricsTable, 'Pricing Tier'),
    billingSummary: getFieldId(metricsTable, 'Billing Terms Summary'),
    currentLeadCommitment: getFieldId(metricsTable, 'Current Lead Commitment'),
    remainingLeads: getFieldId(metricsTable, 'Remaining Leads'),
    packagePurchases: getFieldId(metricsTable, 'Package Purchases'),
    totalLeadsSent: getFieldId(metricsTable, 'Total Leads Sent'),
    leadsToday: getFieldId(metricsTable, 'Leads Today'),
    lifetimeCreditsGranted: getFieldId(metricsTable, 'Lifetime Credits Granted'),
    pendingCreditsCount: getFieldId(metricsTable, 'Pending Credits Count'),
    pendingCreditsValue: getFieldId(metricsTable, 'Pending Credits Value ($)'),
    creditsGrantedValue: getFieldId(metricsTable, 'Credits Granted Value ($)'),
    totalPaid: getFieldId(metricsTable, 'Total Paid'),
    failedChargesValue: getFieldId(metricsTable, 'Failed Charges $'),
    failedChargesCount: getFieldId(metricsTable, 'Failed Charges Count'),
  }

  const opsFieldIds = {
    clientLink: getFieldId(opsTable, 'Client'),
    portalKey: getFieldId(opsTable, 'Portal Key'),
    businessName: getFieldId(opsTable, 'Business Name'),
    csStatus: getFieldId(opsTable, 'CS Status'),
    outboundSeat: getFieldId(opsTable, 'Outbound Seat (manual)'),
    pendingCreditsManual: getFieldId(opsTable, 'Pending Credits (manual)'),
    clientNotes: getFieldId(opsTable, 'Client Notes'),
    zipCodesScraped: getFieldId(opsTable, 'Zip Codes Scraped (short text)'),
    mondayCheckup: getFieldId(opsTable, 'Monday Checkup'),
    wednesdayCheckup: getFieldId(opsTable, 'Wednesday Checkup'),
    fridayCheckup: getFieldId(opsTable, 'Friday Checkup'),
    leadSheetCopy: getFieldId(opsTable, 'Lead Sheet copy'),
  }

  const clientRecords = await listAllRecords(CLIENT_TABLE_ID, Object.values(clientFieldIds))
  const metricsRecords = await listAllRecords(metricsTable.id, [
    metricsFieldIds.portalKey,
    metricsFieldIds.clientLink,
  ])
  const opsRecords = await listAllRecords(opsTable.id, [opsFieldIds.portalKey, opsFieldIds.clientLink])

  const metricsByPortalKey = new Map()
  for (const record of metricsRecords) {
    const portalKey = cleanString(record.fields?.[metricsFieldIds.portalKey])
    if (portalKey) metricsByPortalKey.set(portalKey, record)
  }

  const opsByPortalKey = new Map()
  for (const record of opsRecords) {
    const portalKey = cleanString(record.fields?.[opsFieldIds.portalKey])
    if (portalKey) opsByPortalKey.set(portalKey, record)
  }

  let metricsCreated = 0
  let metricsUpdated = 0
  let opsCreated = 0
  let opsUpdated = 0

  for (const record of clientRecords) {
    const fields = record.fields || {}
    const portalKey = cleanString(fields[clientFieldIds.portalKey])
    const businessName = cleanString(fields[clientFieldIds.businessName])
    if (!portalKey) continue

    const metricFields = {
      [metricsFieldIds.clientLink]: [record.id],
      [metricsFieldIds.portalKey]: portalKey,
      [metricsFieldIds.businessName]: businessName || null,
      [metricsFieldIds.pricingTier]: normalizeSelectName(fields[clientFieldIds.pricingTier]) || null,
      [metricsFieldIds.billingSummary]: cleanString(fields[clientFieldIds.billingSummary]) || null,
      [metricsFieldIds.currentLeadCommitment]: fields[clientFieldIds.currentLeadCommitment] ?? null,
      [metricsFieldIds.remainingLeads]: fields[clientFieldIds.remainingLeads] ?? null,
      [metricsFieldIds.packagePurchases]: fields[clientFieldIds.packagePurchases] ?? null,
      [metricsFieldIds.totalLeadsSent]: fields[clientFieldIds.totalLeadsSent] ?? null,
      [metricsFieldIds.leadsToday]: fields[clientFieldIds.leadsToday] ?? null,
      [metricsFieldIds.lifetimeCreditsGranted]: fields[clientFieldIds.lifetimeCreditsGranted] ?? null,
      [metricsFieldIds.pendingCreditsCount]: fields[clientFieldIds.pendingCreditsCount] ?? null,
      [metricsFieldIds.pendingCreditsValue]: fields[clientFieldIds.pendingCreditsValue] ?? null,
      [metricsFieldIds.creditsGrantedValue]: fields[clientFieldIds.creditsGrantedValue] ?? null,
      [metricsFieldIds.totalPaid]: fields[clientFieldIds.totalPaid] ?? null,
      [metricsFieldIds.failedChargesValue]: fields[clientFieldIds.failedChargesValue] ?? null,
      [metricsFieldIds.failedChargesCount]: fields[clientFieldIds.failedChargesCount] ?? null,
    }

    const opsFields = {
      [opsFieldIds.clientLink]: [record.id],
      [opsFieldIds.portalKey]: portalKey,
      [opsFieldIds.businessName]: businessName || null,
      [opsFieldIds.csStatus]: normalizeSelectName(fields[clientFieldIds.csStatus]) || null,
      [opsFieldIds.outboundSeat]: normalizeSelectName(fields[clientFieldIds.outboundSeat]) || null,
      [opsFieldIds.pendingCreditsManual]:
        normalizeSelectName(fields[clientFieldIds.pendingCreditsManual]) || null,
      [opsFieldIds.clientNotes]: cleanString(fields[clientFieldIds.clientNotes]) || null,
      [opsFieldIds.zipCodesScraped]: cleanString(fields[clientFieldIds.zipCodesScraped]) || null,
      [opsFieldIds.mondayCheckup]: Boolean(fields[clientFieldIds.mondayCheckup]),
      [opsFieldIds.wednesdayCheckup]: Boolean(fields[clientFieldIds.wednesdayCheckup]),
      [opsFieldIds.fridayCheckup]: Boolean(fields[clientFieldIds.fridayCheckup]),
      [opsFieldIds.leadSheetCopy]: cleanString(fields[clientFieldIds.leadSheetCopy]) || null,
    }

    const existingMetric = metricsByPortalKey.get(portalKey)
    if (existingMetric) {
      await updateRecord(metricsTable.id, existingMetric.id, metricFields)
      metricsUpdated += 1
    } else {
      await createRecord(metricsTable.id, metricFields)
      metricsCreated += 1
    }

    const existingOps = opsByPortalKey.get(portalKey)
    if (existingOps) {
      await updateRecord(opsTable.id, existingOps.id, opsFields)
      opsUpdated += 1
    } else {
      await createRecord(opsTable.id, opsFields)
      opsCreated += 1
    }
  }

  console.log(
    JSON.stringify(
      {
        clientCount: clientRecords.length,
        metricsCreated,
        metricsUpdated,
        opsCreated,
        opsUpdated,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
