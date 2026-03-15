import { NextRequest, NextResponse } from 'next/server'
import {
  getLeadgenIntentByPortalKeyInConvex,
  getOrganizationSnapshotInConvex,
  markLeadgenOnboardingCompletedInConvex,
  submitClientOnboardingInConvex,
  upsertOrganizationInConvex,
} from '@/lib/convex'
import {
  getBillingModelDefaults,
  normalizeBillingModel,
} from '@/lib/billing-models'
import { getInvalidTargetZipError, getTargetZipCountError, parseTargetZipCodes } from '@/lib/leadgen-target-zips'

export const runtime = 'nodejs'

type AirtableOnboardingPayload = Record<string, unknown>

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7).trim()
  return token || null
}

function getWebhookSecret(): string | null {
  return (
    process.env.AIRTABLE_ONBOARDING_SUBMITTED_WEBHOOK_SECRET?.trim() ||
    process.env.CLIENT_ONBOARDING_API_SECRET?.trim() ||
    process.env.AIRTABLE_LEAD_DELIVERED_WEBHOOK_SECRET?.trim() ||
    null
  )
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function readString(body: AirtableOnboardingPayload, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = cleanString(body[key])
    if (value) return value
  }
  return null
}

function splitDelimitedStrings(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function readStringList(body: AirtableOnboardingPayload, ...keys: string[]): string[] {
  for (const key of keys) {
    const value = body[key]
    if (Array.isArray(value)) {
      const normalized = value
        .map((entry) => cleanString(entry))
        .filter((entry): entry is string => Boolean(entry))
      if (normalized.length > 0) return normalized
    }

    if (typeof value === 'string') {
      const normalized = splitDelimitedStrings(value)
      if (normalized.length > 0) return normalized
    }
  }

  return []
}

function readPositiveInt(body: AirtableOnboardingPayload, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = body[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      const intVal = Math.floor(value)
      if (intVal > 0) return intVal
    }

    if (typeof value === 'string') {
      const parsed = Number.parseInt(value.trim(), 10)
      if (Number.isFinite(parsed) && parsed > 0) return parsed
    }
  }

  return undefined
}

function getLeadRouting(input: {
  leadDeliveryPreference: string | null
  leadNotificationPhone: string | null
  leadNotificationEmail: string | null
  leadProspectEmail: string | null
}): { leadRoutingPhones: string[]; leadRoutingEmails: string[] } {
  const preference = (input.leadDeliveryPreference || '').trim().toLowerCase()
  const includePhone = preference === 'phone' || preference === 'both'
  const includeEmail = preference === 'email' || preference === 'both'

  const phone = input.leadNotificationPhone ? [input.leadNotificationPhone] : []
  const notificationEmail = input.leadNotificationEmail ? [input.leadNotificationEmail] : []
  const prospectEmail = input.leadProspectEmail ? [input.leadProspectEmail] : []

  const leadRoutingPhones = includePhone ? phone : []
  const leadRoutingEmails = includeEmail ? notificationEmail : []

  if (leadRoutingPhones.length === 0 && leadRoutingEmails.length === 0) {
    return {
      leadRoutingPhones: phone,
      leadRoutingEmails: notificationEmail.length > 0 ? notificationEmail : prospectEmail,
    }
  }

  return { leadRoutingPhones, leadRoutingEmails }
}

function formatNotes(input: {
  paymentProvider: string | null
  paymentReference: string | null
  sourceRecordId: string | null
}): string | undefined {
  const notes = [
    input.paymentProvider ? `Payment provider: ${input.paymentProvider}` : null,
    input.paymentReference ? `Payment reference: ${input.paymentReference}` : null,
    input.sourceRecordId ? `Airtable submission: ${input.sourceRecordId}` : null,
  ].filter(Boolean)

  return notes.length > 0 ? notes.join('\n') : undefined
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    webhook: 'airtable-onboarding-submitted',
    endpoint: '/api/webhooks/airtable/onboarding-submitted',
  })
}

export async function POST(request: NextRequest) {
  const expectedSecret = getWebhookSecret()
  if (!expectedSecret) {
    return NextResponse.json(
      { success: false, error: 'Server misconfiguration: missing Airtable onboarding webhook secret.' },
      { status: 500 }
    )
  }

  const token = getBearerToken(request)
  if (!token || token !== expectedSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: AirtableOnboardingPayload
  try {
    body = (await request.json()) as AirtableOnboardingPayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const portalKey = readString(body, 'portalKey', 'Portal Key')
  const companyName = readString(body, 'companyName', 'Legal Business Name', 'Business Name')
  if (!portalKey || !companyName) {
    return NextResponse.json(
      { success: false, error: 'portalKey and companyName are required.' },
      { status: 400 }
    )
  }

  const serviceAreas = readStringList(body, 'serviceAreas', 'Service Areas')
  if (serviceAreas.length === 0) {
    return NextResponse.json({ success: false, error: 'At least one service area is required.' }, { status: 400 })
  }

  const { zipCodes: targetZipCodes, invalidZipCodes } = parseTargetZipCodes(
    body.targetZipCodes ?? body['Target ZIP Codes (5-10 to start)']
  )
  const invalidTargetZipError = getInvalidTargetZipError(invalidZipCodes)
  if (invalidTargetZipError) {
    return NextResponse.json({ success: false, error: invalidTargetZipError }, { status: 400 })
  }
  const targetZipCountError = getTargetZipCountError(targetZipCodes.length)
  if (targetZipCountError) {
    return NextResponse.json({ success: false, error: targetZipCountError }, { status: 400 })
  }

  const serviceTypes = readStringList(body, 'serviceTypes', 'Service Types Offered')
  if (serviceTypes.length === 0) {
    return NextResponse.json({ success: false, error: 'At least one service type is required.' }, { status: 400 })
  }

  const leadNotificationPhone = readString(body, 'leadNotificationPhone', 'Best Cell for Lead Notifications')
  const leadNotificationEmail = readString(body, 'leadNotificationEmail', 'Best Email for Lead Notifications')
  const leadProspectEmail = readString(body, 'leadProspectEmail', 'Email Used To Communicate With Prospects')
  const leadDeliveryPreference = readString(body, 'leadDeliveryPreference', 'Lead Delivery Preference')
  const { leadRoutingPhones, leadRoutingEmails } = getLeadRouting({
    leadDeliveryPreference,
    leadNotificationPhone,
    leadNotificationEmail,
    leadProspectEmail,
  })

  if (leadRoutingPhones.length === 0 && leadRoutingEmails.length === 0) {
    return NextResponse.json(
      { success: false, error: 'At least one lead routing phone or email is required.' },
      { status: 400 }
    )
  }

  const organizationSnapshot = await getOrganizationSnapshotInConvex({ portalKey })
  const organization = organizationSnapshot?.organization || {}
  const leadgenIntent = await getLeadgenIntentByPortalKeyInConvex({ portalKey })

  const billingModel = normalizeBillingModel(
    readString(body, 'billingModel') ||
      (typeof organization.billingModel === 'string' ? organization.billingModel : null) ||
      leadgenIntent?.billingModel ||
      'package_40_paid_in_full'
  )
  const existingLeadUnitPriceCents =
    typeof organization.leadUnitPriceCents === 'number' && Number.isFinite(organization.leadUnitPriceCents)
      ? Math.floor(organization.leadUnitPriceCents)
      : undefined
  const billingDefaults = getBillingModelDefaults(billingModel, existingLeadUnitPriceCents || 4000)
  const leadUnitPriceCents = existingLeadUnitPriceCents || billingDefaults.leadUnitPriceCents
  const leadChargeThreshold =
    (typeof organization.leadChargeThreshold === 'number' && Number.isFinite(organization.leadChargeThreshold)
      ? Math.floor(organization.leadChargeThreshold)
      : undefined) || billingDefaults.leadChargeThreshold
  const prepaidLeadCredits =
    typeof organization.prepaidLeadCredits === 'number' && Number.isFinite(organization.prepaidLeadCredits)
      ? Math.floor(organization.prepaidLeadCredits)
      : undefined
  const leadCommitmentTotal =
    typeof organization.leadCommitmentTotal === 'number' && Number.isFinite(organization.leadCommitmentTotal)
      ? Math.floor(organization.leadCommitmentTotal)
      : undefined
  const initialChargeCents =
    typeof organization.initialChargeCents === 'number' && Number.isFinite(organization.initialChargeCents)
      ? Math.floor(organization.initialChargeCents)
      : undefined

  await upsertOrganizationInConvex({
    portalKey,
    name: companyName,
    billingModel,
    prepaidLeadCredits,
    leadCommitmentTotal,
    initialChargeCents,
    leadChargeThreshold,
    leadUnitPriceCents,
    onboardingStatus: 'completed',
    onboardingCompletedAt: Date.now(),
    isActive: true,
  })

  const primaryContactName = readString(body, 'primaryContactName', 'Primary Contact Name')
  const accountLoginEmail =
    readString(body, 'accountLoginEmail', 'Portal Login Email') ||
    readString(body, 'billingEmail', 'Billing Email') ||
    leadgenIntent?.billingEmail ||
    undefined
  const desiredLeadVolumeDaily = readPositiveInt(body, 'desiredLeadVolumeDaily', 'Desired Leads Per Day (Minimum 2)')
  const sourceRecordId = readString(body, 'submissionRecordId', 'submissionAirtableRecordId', 'recordId')
  const paymentProvider = readString(body, 'paymentProvider', 'Payment Provider')
  const paymentReference = readString(body, 'paymentReference', 'Payment Reference')

  const result = await submitClientOnboardingInConvex(
    {
      portalKey,
      companyName,
      accountLoginEmail,
      businessPhone: readString(body, 'businessPhone', 'Business Phone #') || undefined,
      businessAddress: readString(body, 'businessAddress', 'Full Business Address') || undefined,
      serviceAreas,
      targetZipCodes,
      serviceTypes,
      desiredLeadVolumeDaily,
      operatingHoursStart: readString(body, 'operatingHoursStart', 'Operating Hours Start') || undefined,
      operatingHoursEnd: readString(body, 'operatingHoursEnd', 'Operating Hours End') || undefined,
      leadRoutingPhones,
      leadRoutingEmails,
      leadNotificationPhone: leadNotificationPhone || undefined,
      leadNotificationEmail: leadNotificationEmail || undefined,
      leadProspectEmail: leadProspectEmail || undefined,
      billingContactName: primaryContactName || undefined,
      billingContactEmail:
        readString(body, 'billingEmail', 'Billing Email') || leadgenIntent?.billingEmail || undefined,
      billingModel,
      prepaidLeadCredits,
      leadCommitmentTotal,
      initialChargeCents,
      leadChargeThreshold,
      leadUnitPriceCents,
      notes: formatNotes({ paymentProvider, paymentReference, sourceRecordId }),
    },
    { throwOnError: true }
  )

  await markLeadgenOnboardingCompletedInConvex({ portalKey })

  return NextResponse.json({
    success: true,
    portalKey,
    organizationId: result?.organizationId || null,
    submissionId: result?.submissionId || null,
    billingModel,
    onboardingStatus: 'completed',
  })
}
