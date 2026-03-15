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

async function ensureTable(name, primaryFieldName) {
  const tables = await getTables()
  const existing = tables.find((table) => table.name === name)
  if (existing) return existing

  return airtable(`/meta/bases/${BASE_ID}/tables`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      fields: [{ name: primaryFieldName, type: 'singleLineText' }],
    }),
  })
}

async function ensureField(tableId, name, type, options = undefined) {
  const tables = await getTables()
  const table = tables.find((value) => value.id === tableId)
  if (!table) throw new Error(`Unknown table: ${tableId}`)

  const existing = (table.fields || []).find((field) => field.name === name)
  if (existing) return existing

  const body = { name, type }
  if (options) body.options = options

  return airtable(`/meta/bases/${BASE_ID}/tables/${tableId}/fields`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function singleSelectChoices(names) {
  return {
    choices: names.map((name) => ({ name })),
  }
}

async function main() {
  const metricsTable = await ensureTable(METRICS_TABLE_NAME, 'Metric Key')
  const opsTable = await ensureTable(OPS_TABLE_NAME, 'Ops Key')

  await ensureField(metricsTable.id, 'Client', 'multipleRecordLinks', {
    linkedTableId: CLIENT_TABLE_ID,
  })
  await ensureField(opsTable.id, 'Client', 'multipleRecordLinks', {
    linkedTableId: CLIENT_TABLE_ID,
  })

  const metricsFields = [
    ['Portal Key', 'singleLineText'],
    ['Business Name', 'singleLineText'],
    ['Pricing Tier', 'singleLineText'],
    ['Billing Terms Summary', 'singleLineText'],
    ['Current Lead Commitment', 'number', { precision: 0 }],
    ['Remaining Leads', 'number', { precision: 0 }],
    ['Package Purchases', 'number', { precision: 0 }],
    ['Total Leads Sent', 'number', { precision: 0 }],
    ['Leads Today', 'number', { precision: 0 }],
    ['Lifetime Credits Granted', 'number', { precision: 0 }],
    ['Pending Credits Count', 'number', { precision: 0 }],
    ['Pending Credits Value ($)', 'currency', { precision: 2, symbol: '$' }],
    ['Credits Granted Value ($)', 'currency', { precision: 2, symbol: '$' }],
    ['Total Paid', 'currency', { precision: 2, symbol: '$' }],
    ['Failed Charges $', 'currency', { precision: 2, symbol: '$' }],
    ['Failed Charges Count', 'number', { precision: 0 }],
  ]

  for (const [name, type, options] of metricsFields) {
    await ensureField(metricsTable.id, name, type, options)
  }

  const csStatusChoices = [
    'Needs Help',
    'Waiting For Contacts',
    'Churn Risk',
    'Card Failed',
    'Offboard',
    'At KPI',
    'Paused',
    'Need More Zip Codes CSM',
    'PACKAGE FUFILLED',
    'NOT TAKING IN MORE CLIENTS',
  ]
  const outboundSeatChoices = [
    '1. Roofing',
    '2. Roofing',
    '3. Roofing',
    '4. Roofing',
    '5. Roofing',
    '6. Roofing',
    '7. Roofing',
    '8. Roofing',
    '9. Roofing',
    '10. Roofing',
  ]
  const pendingCreditChoices = ['NONE', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

  const opsFields = [
    ['Portal Key', 'singleLineText'],
    ['Business Name', 'singleLineText'],
    ['CS Status', 'singleSelect', singleSelectChoices(csStatusChoices)],
    ['Outbound Seat (manual)', 'singleSelect', singleSelectChoices(outboundSeatChoices)],
    ['Pending Credits (manual)', 'singleSelect', singleSelectChoices(pendingCreditChoices)],
    ['Client Notes', 'multilineText'],
    ['Zip Codes Scraped (short text)', 'multilineText'],
    ['Monday Checkup', 'checkbox', { icon: 'check', color: 'greenBright' }],
    ['Wednesday Checkup', 'checkbox', { icon: 'check', color: 'greenBright' }],
    ['Friday Checkup', 'checkbox', { icon: 'check', color: 'greenBright' }],
    ['Lead Sheet copy', 'singleLineText'],
  ]

  for (const [name, type, options] of opsFields) {
    await ensureField(opsTable.id, name, type, options)
  }

  const tables = await getTables()
  const metrics = tables.find((table) => table.id === metricsTable.id)
  const ops = tables.find((table) => table.id === opsTable.id)

  console.log(
    JSON.stringify(
      {
        baseId: BASE_ID,
        clientTableId: CLIENT_TABLE_ID,
        metricsTableId: metricsTable.id,
        opsTableId: opsTable.id,
        metricsFields: metrics?.fields || [],
        opsFields: ops?.fields || [],
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
