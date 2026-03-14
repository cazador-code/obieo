import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api.js'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_CLIENT_BASE_ID || 'appqsVEAHr4AaaBAt'
const CLIENT_TABLE_ID = process.env.AIRTABLE_CLIENT_TABLE_ID || 'tblK1w4DWwbtEBZGf'

const FIELD_IDS = {
  businessName: 'fldcUUlwTa7ilHUUt',
  lifecycleStatus: 'fldih1MfZsOmH4SQ3',
  csStatus: 'fldh80TwV8JKwM0Pb',
  outboundSeat: 'fldXbftPmmSNq9rnV',
  pricingTier: 'fldHORHFSYyCJWMeW',
  pendingCreditsManual: 'fldsJ7kpBrj74s4mv',
  leadsPerDay: 'fldtU0kOpkKcYtoBD',
  clientNotes: 'fldFADuk8QTrFTEvF',
  notificationEmail: 'fldy7AUYFxf3vB1tL',
  prospectEmail: 'fldN6PVrSXozaE2JM',
  portalKey: 'fld4AuvIhp4xjPgNM',
  linkedLeads: 'fldd3DxeRrwsAi8um',
  billingSummary: 'fldcX0vYwjoiptXvW',
  currentLeadCommitment: 'fldkfN0LCSSuaX77A',
  remainingLeads: 'fldXbmNv8sDq8cRzG',
  packagePurchases: 'fldMMW5zZY791frwx',
  totalCredited: 'fld0JgQF0FLktvqnF',
  totalOwedCount: 'fldXo8DhJeashjE6K',
  totalOwedValue: 'fldmO2DMU3r9bptzL',
  creditsGrantedValue: 'fldeJednFvUevYisP',
}

const FIELD_PATCHES = [
  {
    id: FIELD_IDS.lifecycleStatus,
    name: 'Lifecycle Status',
    description: 'Client lifecycle from open to onboarding to ready-to-launch to launched.',
  },
  {
    id: FIELD_IDS.csStatus,
    name: 'CS Status',
    description: 'Manual customer-success operating status used for fulfillment and support workflows.',
  },
  {
    id: FIELD_IDS.outboundSeat,
    name: 'Outbound Seat (manual)',
    description: 'Manual routing slot or outbound account label. This is not synced from Convex.',
  },
  {
    id: FIELD_IDS.pendingCreditsManual,
    name: 'Pending Credits (manual)',
    description:
      'Manual reminder for make-goods still owed but not yet granted. Use the calculated pending credit fields for lead-status-driven truth.',
  },
  {
    id: FIELD_IDS.leadsPerDay,
    name: 'Target Leads / Day',
    description: 'Daily lead target captured during onboarding.',
  },
  {
    id: FIELD_IDS.totalCredited,
    name: 'Lifetime Credits Granted',
    description: 'Calculated count of linked leads marked as credited.',
  },
  {
    id: FIELD_IDS.totalOwedCount,
    name: 'Pending Credits Count',
    description: 'Calculated count of linked leads currently marked as owed.',
  },
  {
    id: FIELD_IDS.totalOwedValue,
    name: 'Pending Credits Value ($)',
    description: 'Calculated dollar value of linked leads currently marked as owed.',
  },
  {
    id: FIELD_IDS.creditsGrantedValue,
    name: 'Credits Granted Value ($)',
    description: 'Calculated dollar value of linked leads that were credited back to the client.',
  },
  {
    id: FIELD_IDS.portalKey,
    name: 'Portal Key (stable ID)',
    description: 'Stable client identifier used by the app and Convex. Must be unique.',
  },
  {
    id: FIELD_IDS.linkedLeads,
    name: 'Linked Leads',
    description: 'Linked lead records used to power delivery, owed, and credited rollups.',
  },
  {
    id: FIELD_IDS.billingSummary,
    name: 'Billing Terms Summary',
    description: 'Operator-facing billing summary synced from app and Convex.',
  },
  {
    id: FIELD_IDS.currentLeadCommitment,
    name: 'Current Lead Commitment',
    description: 'Current total lead commitment synced from Convex for package and commitment clients.',
  },
  {
    id: FIELD_IDS.remainingLeads,
    name: 'Remaining Leads',
    description: 'Current remaining lead balance synced from Convex after delivered and credited lead events are applied.',
  },
  {
    id: FIELD_IDS.packagePurchases,
    name: 'Package Purchases',
    description: 'Count of package purchase events recorded in Convex for this client.',
  },
  {
    id: FIELD_IDS.pricingTier,
    name: 'Pricing Tier',
    description: 'Short pricing label for operators. See Billing Terms Summary for non-standard or custom deals.',
  },
]

function requireEnv(name) {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value.trim()
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizePositiveInt(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const normalized = Math.floor(value)
  return normalized > 0 ? normalized : null
}

function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

function parseExternalPaymentEvent(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  if (value.kind !== 'external_payment') return null

  let payload = null
  if (typeof value.payloadJson === 'string' && value.payloadJson.trim()) {
    try {
      const parsed = JSON.parse(value.payloadJson)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        payload = parsed
      }
    } catch {
      payload = null
    }
  }

  return {
    amountCents: normalizePositiveInt(value.amountCents),
    purchasePrepaidLeadCredits: normalizePositiveInt(payload?.prepaidPurchased),
    purchaseLeadCommitmentTotal: normalizePositiveInt(payload?.commitmentPurchased),
  }
}

function getPackagePurchaseEvents(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.billingEvents)) return []
  return snapshot.billingEvents.map((value) => parseExternalPaymentEvent(value)).filter(Boolean)
}

function countStandardPaidInFullEvents(values) {
  return values.filter((value) => value.purchasePrepaidLeadCredits === 40 && value.purchaseLeadCommitmentTotal === 40).length
}

function countStandardCommitmentEvents(values) {
  return values.filter((value) => value.purchasePrepaidLeadCredits === 10 && value.purchaseLeadCommitmentTotal === 40).length
}

function inferStandardPaidInFullPurchaseCount({ prepaidLeadCredits, leadCommitmentTotal, explicitStandardEventCount }) {
  if (explicitStandardEventCount <= 0) return null
  if (prepaidLeadCredits !== leadCommitmentTotal) return null
  if (!leadCommitmentTotal || leadCommitmentTotal % 40 !== 0) return null
  return Math.max(explicitStandardEventCount, leadCommitmentTotal / 40)
}

function inferStandardCommitmentPurchaseCount({ prepaidLeadCredits, leadCommitmentTotal, explicitStandardEventCount }) {
  if (explicitStandardEventCount <= 0) return null
  if (!leadCommitmentTotal || leadCommitmentTotal % 40 !== 0) return null
  const inferredCount = leadCommitmentTotal / 40
  if (prepaidLeadCredits !== inferredCount * 10) return null
  return Math.max(explicitStandardEventCount, inferredCount)
}

function isStandardPaidInFullPackage({ prepaidLeadCredits, leadCommitmentTotal, packagePurchaseCount }) {
  return prepaidLeadCredits === packagePurchaseCount * 40 && leadCommitmentTotal === packagePurchaseCount * 40
}

function isStandardCommitmentPackage({ prepaidLeadCredits, leadCommitmentTotal, packagePurchaseCount }) {
  return prepaidLeadCredits === packagePurchaseCount * 10 && leadCommitmentTotal === packagePurchaseCount * 40
}

function buildBillingState(org, snapshot) {
  const billingModel = normalizeString(org.billingModel)
  const leadUnitPriceCents = normalizePositiveInt(org.leadUnitPriceCents) || 4000
  const prepaidLeadCredits = normalizePositiveInt(org.prepaidLeadCredits) || 0
  const leadCommitmentTotal = normalizePositiveInt(org.leadCommitmentTotal)
  const initialChargeCents = normalizePositiveInt(org.initialChargeCents) || 0
  const leadChargeThreshold = normalizePositiveInt(org.leadChargeThreshold) || 1
  const deliveredLeadCount = normalizePositiveInt(snapshot?.leadCounts?.total) || 0
  const packagePurchaseEvents = getPackagePurchaseEvents(snapshot)
  const standardPaidInFullEventCount = countStandardPaidInFullEvents(packagePurchaseEvents)
  const standardCommitmentEventCount = countStandardCommitmentEvents(packagePurchaseEvents)
  let packagePurchaseCount = packagePurchaseEvents.length || null
  const remainingLeads =
    leadCommitmentTotal !== null ? Math.max(0, leadCommitmentTotal - deliveredLeadCount) : null

  if (billingModel === 'package_40_paid_in_full') {
    packagePurchaseCount =
      inferStandardPaidInFullPurchaseCount({
        prepaidLeadCredits,
        leadCommitmentTotal,
        explicitStandardEventCount: standardPaidInFullEventCount,
      }) || packagePurchaseCount
  }

  if (billingModel === 'commitment_40_with_10_upfront') {
    packagePurchaseCount =
      inferStandardCommitmentPurchaseCount({
        prepaidLeadCredits,
        leadCommitmentTotal,
        explicitStandardEventCount: standardCommitmentEventCount,
      }) || packagePurchaseCount
  }

  let pricingTier = null

  if (billingModel === 'package_40_paid_in_full') {
    if (
      packagePurchaseCount &&
      packagePurchaseCount > 1 &&
      isStandardPaidInFullPackage({ prepaidLeadCredits, leadCommitmentTotal, packagePurchaseCount })
    ) {
      pricingTier = '40 Lead Package'
      const totalAmountCents = packagePurchaseCount * leadUnitPriceCents * 40
      return {
        pricingTier,
        billingSummary: `${packagePurchaseCount} x 40 Lead Packages purchased${
          totalAmountCents > 0 ? ` (${formatCurrency(totalAmountCents)} total)` : ''
        }`,
        currentLeadCommitment: leadCommitmentTotal,
        remainingLeads,
        packagePurchaseCount,
      }
    }

    const packageMap = {
      10: '10 Lead Package',
      20: '20 Lead Package',
      40: '40 Lead Package',
      80: '80 Lead Package',
    }
    pricingTier = packageMap[leadCommitmentTotal || 40] || 'Custom Package'
  } else if (billingModel === 'commitment_40_with_10_upfront') {
    if (
      packagePurchaseCount &&
      packagePurchaseCount > 1 &&
      isStandardCommitmentPackage({ prepaidLeadCredits, leadCommitmentTotal, packagePurchaseCount })
    ) {
      pricingTier = '40 Lead Package'
      const totalAmountCents = packagePurchaseCount * leadUnitPriceCents * 10
      return {
        pricingTier,
        billingSummary: `${packagePurchaseCount} x 40 Lead Commitments purchased${
          totalAmountCents > 0 ? ` (${formatCurrency(totalAmountCents)} upfront total)` : ''
        }`,
        currentLeadCommitment: leadCommitmentTotal,
        remainingLeads,
        packagePurchaseCount,
      }
    }

    const packageMap = {
      10: '10 Lead Package',
      20: '20 Lead Package',
      40: '40 Lead Package',
      80: '80 Lead Package',
    }
    pricingTier = packageMap[leadCommitmentTotal || 40] || 'Custom Package'
  } else if (billingModel === 'pay_per_lead_perpetual' || billingModel === 'pay_per_lead_40_first_lead') {
    const priceMap = {
      4500: 'PPL ($45)',
      4700: 'PPL ($47)',
      5000: 'PPL ($50)',
      5500: 'PPL ($55)',
      6000: 'PPL ($60)',
      6500: 'PPL ($65)',
      7000: 'PPL ($70)',
    }
    pricingTier = priceMap[leadUnitPriceCents] || null
  }

  let billingSummary = null
  const isStandardPaidInFull =
    billingModel === 'package_40_paid_in_full' &&
    prepaidLeadCredits === 40 &&
    leadCommitmentTotal === 40 &&
    initialChargeCents === leadUnitPriceCents * 40 &&
    leadChargeThreshold === 10

  if (isStandardPaidInFull) {
    billingSummary = '$1,600 paid in full (40 leads)'
  } else {
    const isStandardCommitment =
      billingModel === 'commitment_40_with_10_upfront' &&
      prepaidLeadCredits === 10 &&
      leadCommitmentTotal === 40 &&
      initialChargeCents === leadUnitPriceCents * 10 &&
      leadChargeThreshold === 10

    if (isStandardCommitment) {
      billingSummary = '$400 upfront, then billed per 10 leads (40 total)'
    } else if (billingModel === 'pay_per_lead_perpetual') {
      billingSummary = `${formatCurrency(leadUnitPriceCents)}/lead with ${formatCurrency(initialChargeCents || 100)} verification, billed every ${leadChargeThreshold} lead${leadChargeThreshold === 1 ? '' : 's'}`
    } else if (billingModel === 'pay_per_lead_40_first_lead') {
      billingSummary = `${formatCurrency(leadUnitPriceCents)}/lead with ${formatCurrency(initialChargeCents || leadUnitPriceCents)} first charge, billed every ${leadChargeThreshold} lead${leadChargeThreshold === 1 ? '' : 's'}`
    } else if (billingModel === 'package_40_paid_in_full') {
      billingSummary = `Custom paid-in-full package: ${prepaidLeadCredits} prepaid leads, ${formatCurrency(initialChargeCents)}, ${leadCommitmentTotal ?? prepaidLeadCredits} total commitment, ${formatCurrency(leadUnitPriceCents)}/lead`
    } else if (billingModel === 'commitment_40_with_10_upfront') {
      billingSummary = `Custom commitment package: ${prepaidLeadCredits} prepaid leads, ${formatCurrency(initialChargeCents)}, ${leadCommitmentTotal ?? prepaidLeadCredits} total commitment, ${formatCurrency(leadUnitPriceCents)}/lead, billed every ${leadChargeThreshold} leads`
    }
  }

  return {
    pricingTier,
    billingSummary,
    currentLeadCommitment: leadCommitmentTotal,
    remainingLeads,
    packagePurchaseCount,
  }
}

async function airtableRequest(path, { method = 'GET', body } = {}) {
  const token = requireEnv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
  const response = await fetch(`https://api.airtable.com/v0${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(`Airtable ${method} ${path} failed (${response.status}): ${text}`)
  }
  return payload
}

async function patchField(fieldPatch) {
  return airtableRequest(
    `/meta/bases/${AIRTABLE_BASE_ID}/tables/${CLIENT_TABLE_ID}/fields/${fieldPatch.id}`,
    {
      method: 'PATCH',
      body: {
        name: fieldPatch.name,
        description: fieldPatch.description,
      },
    }
  )
}

async function listClientRecords() {
  const fieldIds = [
    FIELD_IDS.businessName,
    FIELD_IDS.portalKey,
    FIELD_IDS.notificationEmail,
    FIELD_IDS.prospectEmail,
    FIELD_IDS.pricingTier,
    FIELD_IDS.billingSummary,
  ]

  const records = []
  let offset = null
  while (true) {
    const params = new URLSearchParams()
    params.set('pageSize', '100')
    params.set('returnFieldsByFieldId', 'true')
    for (const fieldId of fieldIds) {
      params.append('fields[]', fieldId)
    }
    if (offset) params.set('offset', offset)

    const payload = await airtableRequest(`/${AIRTABLE_BASE_ID}/${CLIENT_TABLE_ID}?${params.toString()}`)
    records.push(...(payload.records || []))
    offset = payload.offset || null
    if (!offset) break
  }
  return records
}

async function patchRecord(recordId, fields) {
  return airtableRequest(`/${AIRTABLE_BASE_ID}/${CLIENT_TABLE_ID}/${recordId}?returnFieldsByFieldId=true`, {
    method: 'PATCH',
    body: { fields, typecast: true },
  })
}

async function fetchConvexOrganizations() {
  const convex = new ConvexHttpClient(requireEnv('CONVEX_URL'))
  const authSecret = requireEnv('CONVEX_AUTH_ADAPTER_SECRET')
  const organizations = await convex.query(api.leadLedger.listOrganizationsForOps, {
    authSecret,
    limit: 1000,
  })
  return { convex, authSecret, organizations }
}

async function fetchConvexSnapshot(convex, authSecret, portalKey) {
  return convex.query(api.leadLedger.getOrganizationSnapshot, {
    authSecret,
    portalKey,
  })
}

function findExactOrganizationMatch(record, organizations) {
  const fields = record.fields || {}
  const currentPortalKey = normalizeString(fields[FIELD_IDS.portalKey])
  if (currentPortalKey) {
    return organizations.find((org) => normalizeString(org.portalKey) === currentPortalKey) || null
  }

  const businessName = normalizeString(fields[FIELD_IDS.businessName]).toLowerCase()
  const notificationEmail = normalizeString(fields[FIELD_IDS.notificationEmail]).toLowerCase()
  const prospectEmail = normalizeString(fields[FIELD_IDS.prospectEmail]).toLowerCase()

  const candidates = organizations.filter((org) => {
    const orgName = normalizeString(org.name).toLowerCase()
    const orgEmails = Array.isArray(org.leadDeliveryEmails)
      ? org.leadDeliveryEmails.map((email) => normalizeString(email).toLowerCase()).filter(Boolean)
      : []
    const nameMatch = businessName && orgName === businessName
    const emailMatch =
      Boolean(notificationEmail) && orgEmails.includes(notificationEmail) ||
      Boolean(prospectEmail) && orgEmails.includes(prospectEmail)
    return nameMatch || emailMatch
  })

  return candidates.length === 1 ? candidates[0] : null
}

async function syncBillingSummariesAndMissingPortalKeys() {
  const [records, convexState] = await Promise.all([listClientRecords(), fetchConvexOrganizations()])
  const { convex, authSecret, organizations } = convexState
  const updates = []

  for (const record of records) {
    const org = findExactOrganizationMatch(record, organizations)
    if (!org) continue
    const snapshot = await fetchConvexSnapshot(convex, authSecret, normalizeString(org.portalKey))

    const fields = record.fields || {}
    const nextFields = {}
    const currentPortalKey = normalizeString(fields[FIELD_IDS.portalKey])
    if (!currentPortalKey && normalizeString(org.portalKey)) {
      nextFields[FIELD_IDS.portalKey] = normalizeString(org.portalKey)
    }

    const billingState = buildBillingState(org, snapshot)
    const pricingTier = billingState.pricingTier
    const currentPricingTier = normalizeString(fields[FIELD_IDS.pricingTier]?.name || fields[FIELD_IDS.pricingTier])
    if (pricingTier && pricingTier !== currentPricingTier) {
      nextFields[FIELD_IDS.pricingTier] = pricingTier
    }

    const billingSummary = billingState.billingSummary
    const currentBillingSummary = normalizeString(fields[FIELD_IDS.billingSummary])
    if (billingSummary && billingSummary !== currentBillingSummary) {
      nextFields[FIELD_IDS.billingSummary] = billingSummary
    }

    if (typeof billingState.currentLeadCommitment === 'number') {
      nextFields[FIELD_IDS.currentLeadCommitment] = billingState.currentLeadCommitment
    }

    if (typeof billingState.remainingLeads === 'number') {
      nextFields[FIELD_IDS.remainingLeads] = billingState.remainingLeads
    }

    if (typeof billingState.packagePurchaseCount === 'number') {
      nextFields[FIELD_IDS.packagePurchases] = billingState.packagePurchaseCount
    }

    if (Object.keys(nextFields).length === 0) continue
    updates.push({ id: record.id, businessName: normalizeString(fields[FIELD_IDS.businessName]), fields: nextFields })
  }

  for (const update of updates) {
    await patchRecord(update.id, update.fields)
  }

  return updates
}

async function main() {
  const fieldResults = []
  for (const patch of FIELD_PATCHES) {
    const result = await patchField(patch)
    fieldResults.push({ id: patch.id, name: result.name })
  }

  const recordUpdates = await syncBillingSummariesAndMissingPortalKeys()

  console.log(
    JSON.stringify(
      {
        patchedFields: fieldResults,
        updatedRecords: recordUpdates,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error))
  process.exit(1)
})
