import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { submitClientOnboardingInConvex } from '@/lib/convex'
import {
  BILLING_MODEL_LABELS,
  getBillingModelDefaults,
  normalizeBillingModel,
} from '@/lib/billing-models'

export const runtime = 'nodejs'

interface OnboardingPayload {
  companyId?: string
  portalKey?: string
  accountFirstName?: string
  accountLastName?: string
  accountLoginEmail?: string
  businessPhone?: string
  businessAddress?: string
  companyName?: string
  serviceAreas?: string[] | string
  targetZipCodes?: string[] | string
  serviceTypes?: string[] | string
  desiredLeadVolumeDaily?: number
  operatingHoursStart?: string
  operatingHoursEnd?: string
  leadRoutingPhones?: string[] | string
  leadRoutingEmails?: string[] | string
  leadNotificationPhone?: string
  leadNotificationEmail?: string
  leadProspectEmail?: string
  billingContactName?: string
  billingContactEmail?: string
  billingModel?: string
  leadChargeThreshold?: number
  leadUnitPriceCents?: number
  notes?: string
}

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7).trim()
}

function getApiSecret(): string | null {
  return (
    process.env.CLIENT_ONBOARDING_API_SECRET?.trim() ||
    process.env.GHL_LEAD_DELIVERED_WEBHOOK_SECRET?.trim() ||
    null
  )
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanString(item))
      .filter((item): item is string => Boolean(item))
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function normalizePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  const intVal = Math.floor(value)
  return intVal > 0 ? intVal : fallback
}

function normalizeOptionalPositiveInt(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const intVal = Math.floor(value)
  return intVal > 0 ? intVal : undefined
}

function getNotificationRecipients(): string[] {
  const raw =
    process.env.ONBOARDING_NOTIFICATION_EMAILS ||
    process.env.LEAD_OPS_NOTIFICATION_EMAILS ||
    process.env.NOTIFICATION_EMAIL ||
    ''

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

async function sendInternalNotification(input: {
  portalKey: string
  companyName: string
  companyId?: string
  billingModelLabel: string
  leadChargeThreshold: number
  leadUnitPriceCents: number
  serviceAreas: string[]
  leadRoutingPhones: string[]
  leadRoutingEmails: string[]
}) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@obieo.com'
  const recipients = getNotificationRecipients()

  if (!apiKey || recipients.length === 0) {
    return
  }

  const resend = new Resend(apiKey)
  const priceDollars = (input.leadUnitPriceCents / 100).toFixed(2)

  await resend.emails.send({
    from: fromEmail,
    to: recipients,
    subject: `Onboarding completed: ${input.companyName}`,
    html: `
      <h2>Client Onboarding Completed</h2>
      <p><strong>Company:</strong> ${input.companyName}</p>
      <p><strong>Portal Key:</strong> ${input.portalKey}</p>
      <p><strong>Company ID:</strong> ${input.companyId || 'N/A'}</p>
      <p><strong>Billing Model:</strong> ${input.billingModelLabel}</p>
      <p><strong>Lead Price:</strong> $${priceDollars}</p>
      <p><strong>Threshold:</strong> ${input.leadChargeThreshold} leads</p>
      <p><strong>Service Areas:</strong> ${input.serviceAreas.join(', ') || 'N/A'}</p>
      <p><strong>Lead Routing Phones:</strong> ${input.leadRoutingPhones.join(', ') || 'N/A'}</p>
      <p><strong>Lead Routing Emails:</strong> ${input.leadRoutingEmails.join(', ') || 'N/A'}</p>
      <p>Next step: Kick off ad campaign and lead routing automation.</p>
    `,
  })
}

export async function POST(request: NextRequest) {
  const expectedSecret = getApiSecret()
  if (!expectedSecret) {
    return NextResponse.json(
      { success: false, error: 'Server misconfiguration: missing onboarding API secret' },
      { status: 500 }
    )
  }

  const token = getBearerToken(request)
  if (!token || token !== expectedSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: OnboardingPayload
  try {
    body = (await request.json()) as OnboardingPayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const portalKey = cleanString(body.portalKey)
  const companyName = cleanString(body.companyName)
  const companyId = cleanString(body.companyId) || undefined

  if (!portalKey || !companyName) {
    return NextResponse.json(
      { success: false, error: 'portalKey and companyName are required' },
      { status: 400 }
    )
  }

  const serviceAreas = normalizeStringList(body.serviceAreas)
  const targetZipCodes = normalizeStringList(body.targetZipCodes)
  const serviceTypes = normalizeStringList(body.serviceTypes)
  const leadRoutingPhones = normalizeStringList(body.leadRoutingPhones)
  const leadRoutingEmails = normalizeStringList(body.leadRoutingEmails)
  const billingModel = normalizeBillingModel(body.billingModel)

  if (serviceAreas.length === 0) {
    return NextResponse.json(
      { success: false, error: 'At least one service area is required' },
      { status: 400 }
    )
  }

  if (leadRoutingPhones.length === 0 && leadRoutingEmails.length === 0) {
    return NextResponse.json(
      { success: false, error: 'At least one lead routing phone or email is required' },
      { status: 400 }
    )
  }

  const leadUnitPriceCentsInput = normalizePositiveInt(body.leadUnitPriceCents, 4000)
  const billingDefaults = getBillingModelDefaults(billingModel, leadUnitPriceCentsInput)
  const leadUnitPriceCents = billingDefaults.leadUnitPriceCents
  const requestedThreshold = normalizePositiveInt(body.leadChargeThreshold, billingDefaults.leadChargeThreshold)
  const leadChargeThreshold =
    billingModel === 'pay_per_lead_perpetual' ? 1 : requestedThreshold
  const desiredLeadVolumeDaily = normalizeOptionalPositiveInt(body.desiredLeadVolumeDaily)

  const result = await submitClientOnboardingInConvex({
    companyId,
    portalKey,
    accountFirstName: cleanString(body.accountFirstName) || undefined,
    accountLastName: cleanString(body.accountLastName) || undefined,
    accountLoginEmail: cleanString(body.accountLoginEmail) || undefined,
    businessPhone: cleanString(body.businessPhone) || undefined,
    businessAddress: cleanString(body.businessAddress) || undefined,
    companyName,
    serviceAreas,
    targetZipCodes: targetZipCodes.length > 0 ? targetZipCodes : undefined,
    serviceTypes: serviceTypes.length > 0 ? serviceTypes : undefined,
    desiredLeadVolumeDaily,
    operatingHoursStart: cleanString(body.operatingHoursStart) || undefined,
    operatingHoursEnd: cleanString(body.operatingHoursEnd) || undefined,
    leadRoutingPhones,
    leadRoutingEmails,
    leadNotificationPhone: cleanString(body.leadNotificationPhone) || undefined,
    leadNotificationEmail: cleanString(body.leadNotificationEmail) || undefined,
    leadProspectEmail: cleanString(body.leadProspectEmail) || undefined,
    billingContactName: cleanString(body.billingContactName) || undefined,
    billingContactEmail: cleanString(body.billingContactEmail) || undefined,
    billingModel,
    prepaidLeadCredits: billingDefaults.prepaidLeadCredits,
    leadCommitmentTotal: billingDefaults.leadCommitmentTotal || undefined,
    initialChargeCents: billingDefaults.initialChargeCents,
    leadChargeThreshold,
    leadUnitPriceCents,
    notes: cleanString(body.notes) || undefined,
  })

  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Convex is not configured for onboarding storage' },
      { status: 500 }
    )
  }

  try {
    await sendInternalNotification({
      portalKey,
      companyName,
      companyId,
      billingModelLabel: BILLING_MODEL_LABELS[billingModel],
      leadChargeThreshold,
      leadUnitPriceCents,
      serviceAreas,
      leadRoutingPhones,
      leadRoutingEmails,
    })
  } catch (error) {
    console.error('Failed sending onboarding notification email:', error)
  }

  return NextResponse.json({
    success: true,
    portalKey,
    organizationId: result.organizationId,
    submissionId: result.submissionId,
    message: 'Onboarding stored and queued for campaign kickoff',
  })
}
