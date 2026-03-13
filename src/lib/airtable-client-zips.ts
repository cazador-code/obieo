import 'server-only'

const ZIP_RE = /^\d{5}$/

const DEFAULT_AIRTABLE_BASE_ID = 'appqsVEAHr4AaaBAt'
const DEFAULT_CLIENT_TABLE_ID = 'tblK1w4DWwbtEBZGf'
const DEFAULT_CLIENT_NAME_FIELD_ID = 'fldcUUlwTa7ilHUUt'
const DEFAULT_CLIENT_STATUS_FIELD_ID = 'fldih1MfZsOmH4SQ3'
const DEFAULT_CLIENT_TARGET_ZIPS_FIELD_ID = 'fldkhT7xvvsypQIy9'
const DEFAULT_CLIENT_CONTRACTOR_NAME_FIELD_ID = 'fldJcjuEu4m3xhZ91'
const DEFAULT_CLIENT_PRICING_TIER_FIELD_ID = 'fldHORHFSYyCJWMeW'
const DEFAULT_CLIENT_LEADS_PER_DAY_FIELD_ID = 'fldtU0kOpkKcYtoBD'
const DEFAULT_CLIENT_NOTES_FIELD_ID = 'fldFADuk8QTrFTEvF'
const DEFAULT_CLIENT_SERVICES_OFFERED_FIELD_ID = 'flddzKcnRCoPDpAZy'
const DEFAULT_CLIENT_CITY_FIELD_ID = 'fldBdDEVng8IvEnww'
const DEFAULT_CLIENT_BUSINESS_PHONE_FIELD_ID = 'fldVR1hy8BTi9OrKz'
const DEFAULT_CLIENT_NOTIFICATION_PHONE_FIELD_ID = 'fld2najORzjs3zdKE'
const DEFAULT_CLIENT_NOTIFICATION_EMAIL_FIELD_ID = 'fldy7AUYFxf3vB1tL'
const DEFAULT_CLIENT_PROSPECT_EMAIL_FIELD_ID = 'fldN6PVrSXozaE2JM'
const DEFAULT_CLIENT_USER_ID_FIELD_ID = 'fld4AuvIhp4xjPgNM'
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
  clientUserId: string
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
  reason?: 'not_configured' | 'fetch_failed' | 'client_not_found' | 'client_ambiguous' | 'update_failed' | 'create_failed'
  message?: string
  airtableRecordId?: string
  targetZipCodes?: string[]
  updatedFields?: string[]
  created?: boolean
}

type AirtableConfig = {
  token: string
  baseId: string
  tableId: string
  nameFieldId: string
  statusFieldId: string
  targetZipFieldId: string
  contractorNameFieldId: string
  pricingTierFieldId: string
  leadsPerDayFieldId: string
  clientNotesFieldId: string
  servicesOfferedFieldId: string
  clientCityFieldId: string
  businessPhoneFieldId: string
  notificationPhoneFieldId: string
  notificationEmailFieldId: string
  prospectEmailFieldId: string
  userIdFieldId: string
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

function getMappedBusinessNameForPortalKey(portalKey: string): string | undefined {
  const raw = process.env.AIRTABLE_PORTAL_KEY_MAP_JSON
  if (!raw || !raw.trim()) return undefined

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined

    const normalizedPortalKey = cleanString(portalKey)
    for (const [rawBusinessName, rawPortalKey] of Object.entries(parsed as Record<string, unknown>)) {
      if (cleanString(rawPortalKey) !== normalizedPortalKey) continue
      const businessName = cleanString(rawBusinessName)
      if (businessName) return businessName
    }
  } catch (error) {
    console.error('Invalid AIRTABLE_PORTAL_KEY_MAP_JSON:', error)
  }

  return undefined
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
  const contractorNameFieldId =
    process.env.AIRTABLE_CLIENT_CONTRACTOR_NAME_FIELD_ID?.trim() || DEFAULT_CLIENT_CONTRACTOR_NAME_FIELD_ID
  const pricingTierFieldId =
    process.env.AIRTABLE_CLIENT_PRICING_TIER_FIELD_ID?.trim() || DEFAULT_CLIENT_PRICING_TIER_FIELD_ID
  const leadsPerDayFieldId =
    process.env.AIRTABLE_CLIENT_LEADS_PER_DAY_FIELD_ID?.trim() || DEFAULT_CLIENT_LEADS_PER_DAY_FIELD_ID
  const clientNotesFieldId =
    process.env.AIRTABLE_CLIENT_NOTES_FIELD_ID?.trim() || DEFAULT_CLIENT_NOTES_FIELD_ID
  const servicesOfferedFieldId =
    process.env.AIRTABLE_CLIENT_SERVICES_OFFERED_FIELD_ID?.trim() || DEFAULT_CLIENT_SERVICES_OFFERED_FIELD_ID
  const clientCityFieldId =
    process.env.AIRTABLE_CLIENT_CITY_FIELD_ID?.trim() || DEFAULT_CLIENT_CITY_FIELD_ID
  const businessPhoneFieldId =
    process.env.AIRTABLE_CLIENT_BUSINESS_PHONE_FIELD_ID?.trim() || DEFAULT_CLIENT_BUSINESS_PHONE_FIELD_ID
  const notificationPhoneFieldId =
    process.env.AIRTABLE_CLIENT_NOTIFICATION_PHONE_FIELD_ID?.trim() || DEFAULT_CLIENT_NOTIFICATION_PHONE_FIELD_ID
  const notificationEmailFieldId =
    process.env.AIRTABLE_CLIENT_NOTIFICATION_EMAIL_FIELD_ID?.trim() || DEFAULT_CLIENT_NOTIFICATION_EMAIL_FIELD_ID
  const prospectEmailFieldId =
    process.env.AIRTABLE_CLIENT_PROSPECT_EMAIL_FIELD_ID?.trim() || DEFAULT_CLIENT_PROSPECT_EMAIL_FIELD_ID
  const userIdFieldId =
    process.env.AIRTABLE_CLIENT_USER_ID_FIELD_ID?.trim() || DEFAULT_CLIENT_USER_ID_FIELD_ID

  if (
    !baseId ||
    !tableId ||
    !nameFieldId ||
    !statusFieldId ||
    !targetZipFieldId ||
    !contractorNameFieldId ||
    !pricingTierFieldId ||
    !leadsPerDayFieldId ||
    !clientNotesFieldId ||
    !servicesOfferedFieldId ||
    !clientCityFieldId ||
    !businessPhoneFieldId ||
    !notificationPhoneFieldId ||
    !notificationEmailFieldId ||
    !prospectEmailFieldId ||
    !userIdFieldId
  ) {
    return null
  }

  return {
    token,
    baseId,
    tableId,
    nameFieldId,
    statusFieldId,
    targetZipFieldId,
    contractorNameFieldId,
    pricingTierFieldId,
    leadsPerDayFieldId,
    clientNotesFieldId,
    servicesOfferedFieldId,
    clientCityFieldId,
    businessPhoneFieldId,
    notificationPhoneFieldId,
    notificationEmailFieldId,
    prospectEmailFieldId,
    userIdFieldId,
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
  const fields = [config.nameFieldId, config.userIdFieldId, config.statusFieldId, config.targetZipFieldId]
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
    url.searchParams.set('returnFieldsByFieldId', 'true')
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
      const clientUserId = cleanString(fieldsMap[config.userIdFieldId])
      const statusRaw = getSingleSelectName(fieldsMap[config.statusFieldId])
      const targetZipCodes = parseZipCodes(fieldsMap[config.targetZipFieldId])

      results.push({
        id: record.id,
        businessNameRaw,
        businessNameNormalized: normalizeName(businessNameRaw),
        clientUserId,
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

function findMatchingClientRecords(
  rows: AirtableClientRecord[],
  portalKey: string
): AirtableClientRecord[] {
  const normalizedPortalKey = cleanString(portalKey)
  if (!normalizedPortalKey) return []
  return rows.filter((row) => row.clientUserId === normalizedPortalKey)
}

function normalizePhoneList(values: string[] | null | undefined): string[] {
  if (!Array.isArray(values)) return []
  return values.map((value) => cleanString(value)).filter(Boolean)
}

function normalizeEmailValue(value: string | null | undefined): string | null {
  const cleaned = cleanString(value)
  return cleaned ? cleaned.toLowerCase() : null
}

function hasOwn(input: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(input, key)
}

function buildFieldUpdates(
  config: AirtableConfig,
  input: Parameters<typeof syncPortalProfileToAirtable>[0]
): {
  fieldUpdates: Record<string, string | null>
  updatedFields: string[]
  normalizedTargetZipCodes: string[] | undefined
} {
  const fieldUpdates: Record<string, string | null> = {}
  const updatedFields: string[] = []
  let normalizedTargetZipCodes: string[] | undefined

  if (hasOwn(input, 'businessName')) {
    fieldUpdates[config.nameFieldId] = cleanString(input.businessName) || null
    updatedFields.push(config.nameFieldId)
  }

  const normalizedPortalKey = cleanString(input.portalKey)
  if (normalizedPortalKey) {
    fieldUpdates[config.userIdFieldId] = normalizedPortalKey
    updatedFields.push(config.userIdFieldId)
  }

  if (hasOwn(input, 'contractorName')) {
    fieldUpdates[config.contractorNameFieldId] = cleanString(input.contractorName) || null
    updatedFields.push(config.contractorNameFieldId)
  }

  if (hasOwn(input, 'targetZipCodes')) {
    normalizedTargetZipCodes = Array.from(
      new Set((input.targetZipCodes || []).map((zip) => cleanString(zip)).filter((zip) => ZIP_RE.test(zip)))
    )
    fieldUpdates[config.targetZipFieldId] =
      normalizedTargetZipCodes.length > 0 ? normalizedTargetZipCodes.join(', ') : null
    updatedFields.push(config.targetZipFieldId)
  }

  if (hasOwn(input, 'businessPhone')) {
    fieldUpdates[config.businessPhoneFieldId] = cleanString(input.businessPhone) || null
    updatedFields.push(config.businessPhoneFieldId)
  } else if (hasOwn(input, 'leadDeliveryPhones')) {
    const leadDeliveryPhones = normalizePhoneList(input.leadDeliveryPhones)
    fieldUpdates[config.businessPhoneFieldId] = leadDeliveryPhones[0] || null
    updatedFields.push(config.businessPhoneFieldId)
  }

  if (hasOwn(input, 'leadNotificationPhone')) {
    fieldUpdates[config.notificationPhoneFieldId] = cleanString(input.leadNotificationPhone) || null
    updatedFields.push(config.notificationPhoneFieldId)
  }

  if (hasOwn(input, 'leadNotificationEmail')) {
    fieldUpdates[config.notificationEmailFieldId] = normalizeEmailValue(input.leadNotificationEmail)
    updatedFields.push(config.notificationEmailFieldId)
  }

  if (hasOwn(input, 'leadProspectEmail')) {
    fieldUpdates[config.prospectEmailFieldId] = normalizeEmailValue(input.leadProspectEmail)
    updatedFields.push(config.prospectEmailFieldId)
  }

  if (hasOwn(input, 'pricingTier')) {
    fieldUpdates[config.pricingTierFieldId] = cleanString(input.pricingTier) || null
    updatedFields.push(config.pricingTierFieldId)
  }

  if (hasOwn(input, 'desiredLeadVolumeDaily')) {
    const leadsPerDayRaw = input.desiredLeadVolumeDaily
    const leadsPerDay =
      typeof leadsPerDayRaw === 'number' && Number.isFinite(leadsPerDayRaw) && leadsPerDayRaw > 0
        ? String(Math.floor(leadsPerDayRaw))
        : null
    fieldUpdates[config.leadsPerDayFieldId] = leadsPerDay
    updatedFields.push(config.leadsPerDayFieldId)
  }

  if (hasOwn(input, 'clientNotes')) {
    fieldUpdates[config.clientNotesFieldId] = cleanString(input.clientNotes) || null
    updatedFields.push(config.clientNotesFieldId)
  }

  if (hasOwn(input, 'servicesOffered')) {
    const services =
      typeof input.servicesOffered === 'string'
        ? cleanString(input.servicesOffered)
        : Array.isArray(input.servicesOffered)
          ? input.servicesOffered.map((value) => cleanString(value)).filter(Boolean).join(', ')
          : null
    fieldUpdates[config.servicesOfferedFieldId] = services || null
    updatedFields.push(config.servicesOfferedFieldId)
  }

  if (hasOwn(input, 'clientCity')) {
    fieldUpdates[config.clientCityFieldId] = cleanString(input.clientCity) || null
    updatedFields.push(config.clientCityFieldId)
  }

  return {
    fieldUpdates,
    updatedFields,
    normalizedTargetZipCodes,
  }
}

async function createAirtableClientRecord(
  config: AirtableConfig,
  fieldUpdates: Record<string, string | null>
): Promise<{ id: string } | { error: string }> {
  const createUrl = new URL(`https://api.airtable.com/v0/${config.baseId}/${config.tableId}`)
  createUrl.searchParams.set('returnFieldsByFieldId', 'true')

  const response = await fetch(createUrl.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      fields: fieldUpdates,
      typecast: true,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    return { error: `Airtable create failed (${response.status}): ${text.slice(0, 500)}` }
  }

  const payload = (await response.json()) as { id?: unknown }
  const id = cleanString(payload.id)
  if (!id) {
    return { error: 'Airtable create succeeded but did not return a record id.' }
  }

  return { id }
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

  const selfRows = findMatchingClientRecords(rows, input.portalKey)
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
  return syncPortalProfileToAirtable({
    portalKey: input.portalKey,
    organizationName: input.organizationName,
    targetZipCodes: input.targetZipCodes,
  })
}

export async function syncPortalProfileToAirtable(input: {
  portalKey: string
  organizationName?: string
  businessName?: string | null
  contractorName?: string | null
  targetZipCodes?: string[]
  businessPhone?: string | null
  leadDeliveryPhones?: string[] | null
  leadNotificationPhone?: string | null
  leadNotificationEmail?: string | null
  leadProspectEmail?: string | null
  pricingTier?: string | null
  desiredLeadVolumeDaily?: number | null
  clientNotes?: string | null
  servicesOffered?: string[] | string | null
  clientCity?: string | null
  createIfMissing?: boolean
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

  const matches = findMatchingClientRecords(rows, input.portalKey)
  const {
    fieldUpdates,
    updatedFields,
    normalizedTargetZipCodes,
  } = buildFieldUpdates(config, input)

  if (matches.length === 0) {
    if (!input.createIfMissing) {
      return {
        synced: false,
        reason: 'client_not_found',
        message: 'Could not find an Airtable client row with an exact matching User ID.',
      }
    }

    const createBusinessName =
      cleanString(input.businessName) ||
      cleanString(input.organizationName) ||
      getMappedBusinessNameForPortalKey(input.portalKey)

    if (!createBusinessName) {
      return {
        synced: false,
        reason: 'client_not_found',
        message:
          'Could not find matching Airtable client row, and no business name was available to create one.',
      }
    }

    const createInput = {
      ...input,
      businessName: createBusinessName,
    }
    const createFieldResult = buildFieldUpdates(config, createInput)
    const createdRecord = await createAirtableClientRecord(config, createFieldResult.fieldUpdates)
    if ('error' in createdRecord) {
      return {
        synced: false,
        reason: 'create_failed',
        message: createdRecord.error,
      }
    }

    return {
      synced: true,
      airtableRecordId: createdRecord.id,
      targetZipCodes: createFieldResult.normalizedTargetZipCodes,
      updatedFields: createFieldResult.updatedFields,
      created: true,
    }
  }
  if (matches.length > 1) {
    return {
      synced: false,
      reason: 'client_ambiguous',
      message: 'Found multiple Airtable client rows with the same exact User ID.',
    }
  }

  const target = matches[0]
  if (Object.keys(fieldUpdates).length === 0) {
    return {
      synced: true,
      airtableRecordId: target.id,
      targetZipCodes: normalizedTargetZipCodes,
      updatedFields: [],
    }
  }

  const updateUrl = new URL(`https://api.airtable.com/v0/${config.baseId}/${config.tableId}/${target.id}`)
  updateUrl.searchParams.set('returnFieldsByFieldId', 'true')

  const response = await fetch(updateUrl.toString(), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      fields: fieldUpdates,
      typecast: true,
    }),
    cache: 'no-store',
  })

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
    updatedFields,
  }
}
