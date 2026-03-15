const BASE_ID = process.env.AIRTABLE_CLIENT_BASE_ID || 'appqsVEAHr4AaaBAt'
const TOKEN =
  process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN?.trim() ||
  process.env.AIRTABLE_API_KEY?.trim() ||
  ''

if (!TOKEN) {
  throw new Error('Missing AIRTABLE_PERSONAL_ACCESS_TOKEN or AIRTABLE_API_KEY')
}

const CLIENT_TABLE_ID = process.env.AIRTABLE_CLIENT_TABLE_ID || 'tblK1w4DWwbtEBZGf'
const ONBOARDING_TABLE_NAME = 'Onboarding Submissions'

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
  const onboardingTable = await ensureTable(ONBOARDING_TABLE_NAME, 'Submission Key')

  const fields = [
    ['Portal Key', 'singleLineText'],
    ['Client', 'multipleRecordLinks', { linkedTableId: CLIENT_TABLE_ID }],
    [
      'Submission Status',
      'singleSelect',
      singleSelectChoices(['new', 'processed', 'needs_review', 'synced_to_obieo']),
    ],
    ['Obieo Synced', 'checkbox', { icon: 'check', color: 'greenBright' }],
    ['Obieo Sync Error', 'multilineText'],
    ['Automation Notes', 'multilineText'],
    ['Submitted At', 'dateTime', { dateFormat: { name: 'local' }, timeFormat: { name: '12hour' }, timeZone: 'client' }],
    ['Payment Provider', 'singleLineText'],
    ['Payment Reference', 'singleLineText'],
    ['Billing Email', 'email'],
    ['Primary Contact Name', 'singleLineText'],
    ['Legal Business Name', 'singleLineText'],
    ['Business Phone #', 'phoneNumber'],
    ['Best Cell for Lead Notifications', 'phoneNumber'],
    ['Best Email for Lead Notifications', 'email'],
    ['Portal Login Email', 'email'],
    ['Email Used To Communicate With Prospects', 'email'],
    ['Full Business Address', 'multilineText'],
    ['Service Areas', 'multilineText'],
    ['Target ZIP Codes (5-10 to start)', 'multilineText'],
    ['Service Types Offered', 'multilineText'],
    ['Desired Leads Per Day (Minimum 2)', 'number', { precision: 0 }],
    ['Operating Hours Start', 'singleLineText'],
    ['Operating Hours End', 'singleLineText'],
    ['Lead Delivery Preference', 'singleSelect', singleSelectChoices(['phone', 'email', 'both'])],
  ]

  for (const [name, type, options] of fields) {
    await ensureField(onboardingTable.id, name, type, options)
  }

  const tables = await getTables()
  const onboarding = tables.find((table) => table.id === onboardingTable.id)

  console.log(
    JSON.stringify(
      {
        baseId: BASE_ID,
        clientTableId: CLIENT_TABLE_ID,
        onboardingTableId: onboardingTable.id,
        onboardingFields: onboarding?.fields || [],
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
