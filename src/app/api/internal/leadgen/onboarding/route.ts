import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { Resend } from 'resend'
import { submitClientOnboardingInConvex, upsertOrganizationInConvex } from '@/lib/convex'
import { provisionLeadBillingForOnboarding } from '@/lib/stripe-onboarding'
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
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
  serviceAreas?: string[]
  targetZipCodes?: string[]
  serviceTypes?: string[]
  desiredLeadVolumeDaily?: number
  operatingHoursStart?: string
  operatingHoursEnd?: string
  leadRoutingPhones?: string[]
  leadRoutingEmails?: string[]
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

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    const secret = getJwtSecret()
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function toPortalKeyBase(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildPortalKey(companyName: string, requestedPortalKey: string | null): string {
  const requested = requestedPortalKey ? toPortalKeyBase(requestedPortalKey) : ''
  if (requested) {
    return requested
  }

  return toPortalKeyBase(companyName) || 'client'
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => cleanString(entry))
    .filter((entry): entry is string => Boolean(entry))
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

function getOpsRecipients(): string[] {
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

function isLeadgenStripeActive(): boolean {
  return process.env.LEADGEN_STRIPE_ACTIVE?.trim() === 'true'
}

async function sendOnboardingEmail(input: {
  companyName: string
  portalKey: string
  billingModelLabel: string
  serviceAreas: string[]
  targetZipCodes: string[]
  serviceTypes: string[]
  leadRoutingPhones: string[]
  leadRoutingEmails: string[]
  leadUnitPriceCents: number
  leadChargeThreshold: number
}) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@obieo.com'
  const recipients = getOpsRecipients()
  if (!apiKey || recipients.length === 0) return

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: fromEmail,
    to: recipients,
    subject: `Client Intake Completed: ${input.companyName}`,
    html: `
      <h2>Client Intake Completed</h2>
      <p><strong>Company:</strong> ${input.companyName}</p>
      <p><strong>Portal Key:</strong> ${input.portalKey}</p>
      <p><strong>Billing Model:</strong> ${input.billingModelLabel}</p>
      <p><strong>Service Areas:</strong> ${input.serviceAreas.join(', ')}</p>
      <p><strong>Target ZIPs:</strong> ${input.targetZipCodes.join(', ')}</p>
      <p><strong>Service Types:</strong> ${input.serviceTypes.join(', ')}</p>
      <p><strong>Lead Routing Phones:</strong> ${input.leadRoutingPhones.join(', ')}</p>
      <p><strong>Lead Routing Emails:</strong> ${input.leadRoutingEmails.join(', ')}</p>
      <p><strong>Lead Price:</strong> $${(input.leadUnitPriceCents / 100).toFixed(2)}</p>
      <p><strong>Threshold:</strong> ${input.leadChargeThreshold} leads</p>
      <p>Next step: launch ad campaign and route leads.</p>
    `,
  })
}

function formatConvexError(err: unknown): string {
  const raw =
    err instanceof Error && err.message
      ? err.message
      : (() => {
          try {
            return JSON.stringify(err)
          } catch {
            return String(err)
          }
        })()

  // Avoid leaking secrets into the UI. Convex error strings sometimes echo the full args object.
  const redacted = raw
    .replace(/authSecret:\s*\"[^\"]+\"/g, 'authSecret: "<redacted>"')
    .replace(/token:\s*\"[^\"]+\"/g, 'token: "<redacted>"')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer <redacted>')

  // Prefer the actionable part of Convex messages.
  // Example: "... ArgumentValidationError: ... Object: {...} Validator: ..."
  const objectIndex = redacted.indexOf(' Object:')
  if (objectIndex > 0) {
    return redacted.slice(0, objectIndex).trim()
  }

  return redacted
}

export async function POST(request: NextRequest) {
  // Always respond with JSON so the onboarding UI can display meaningful errors.
  // Any uncaught throw here becomes an HTML 500, which is hard to debug from the client.
  try {
  const ip = getClientIp(request)
  const { success, remaining } = await auditLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const authorized = await verifyAuthToken(token)
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: OnboardingPayload
  try {
    body = (await request.json()) as OnboardingPayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const companyName = cleanString(body.companyName)
  const requestedPortalKey = cleanString(body.portalKey)
  const accountLoginEmail = cleanString(body.accountLoginEmail)
  if (!companyName || !accountLoginEmail) {
    return NextResponse.json(
      { success: false, error: 'companyName and accountLoginEmail are required' },
      { status: 400 }
    )
  }
  const portalKey = buildPortalKey(companyName, requestedPortalKey)

  const serviceAreas = normalizeStringArray(body.serviceAreas)
  const targetZipCodes = normalizeStringArray(body.targetZipCodes)
  const serviceTypes = normalizeStringArray(body.serviceTypes)
  const leadRoutingPhones = normalizeStringArray(body.leadRoutingPhones)
  const leadRoutingEmails = normalizeStringArray(body.leadRoutingEmails)
  const billingModel = normalizeBillingModel(body.billingModel)

  if (serviceAreas.length === 0) {
    return NextResponse.json({ success: false, error: 'At least one service area is required' }, { status: 400 })
  }

  if (targetZipCodes.length < 5) {
    return NextResponse.json({ success: false, error: 'At least 5 target ZIP codes are required' }, { status: 400 })
  }
  if (targetZipCodes.length > 10) {
    return NextResponse.json({ success: false, error: 'Maximum 10 target ZIP codes allowed' }, { status: 400 })
  }

  if (serviceTypes.length === 0) {
    return NextResponse.json({ success: false, error: 'At least one service type is required' }, { status: 400 })
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

  if (!process.env.CONVEX_URL || !process.env.CONVEX_AUTH_ADAPTER_SECRET) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Convex is not configured for onboarding storage. Set CONVEX_URL and CONVEX_AUTH_ADAPTER_SECRET in .env.local (Next.js) and set CONVEX_AUTH_ADAPTER_SECRET in Convex Deployment Settings.',
      },
      { status: 500 }
    )
  }

  let result:
    | { submissionId: string; organizationId: string; portalKey: string }
    | null = null
  try {
    result = await submitClientOnboardingInConvex(
      {
    companyId: cleanString(body.companyId) || undefined,
    portalKey,
    accountFirstName: cleanString(body.accountFirstName) || undefined,
    accountLastName: cleanString(body.accountLastName) || undefined,
    accountLoginEmail,
    businessPhone: cleanString(body.businessPhone) || undefined,
    businessAddress: cleanString(body.businessAddress) || undefined,
    companyName,
    serviceAreas,
    targetZipCodes,
    serviceTypes,
    desiredLeadVolumeDaily: normalizeOptionalPositiveInt(body.desiredLeadVolumeDaily),
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
      },
      { throwOnError: true }
    )
  } catch (error) {
    const msg = formatConvexError(error)
    return NextResponse.json(
      {
        success: false,
        error: `Convex mutation failed: ${msg}`,
      },
      { status: 500 }
    )
  }

  if (!result) {
    return NextResponse.json(
      {
        success: false,
        error: 'Convex onboarding storage failed (no response). Check Convex logs for leadLedger:submitClientOnboarding.',
      },
      { status: 500 }
    )
  }

  let stripeProvisioning:
    | {
        status: 'provisioned'
        details: {
          stripeCustomerId: string
          stripeProductId?: string
          stripePriceId?: string
          stripeSubscriptionId?: string
          stripeSubscriptionItemId?: string
          reusedSubscription?: boolean
          initialCheckoutUrl?: string
          initialCheckoutSessionId?: string
          initialCheckoutAmountCents?: number
        }
      }
    | {
        status: 'failed'
        error: string
      }
    | {
        status: 'skipped'
        reason: string
      } = {
    status: 'skipped',
    reason: 'Leadgen Stripe provisioning is disabled (set LEADGEN_STRIPE_ACTIVE=true to enable).',
  }

  const billingEmail =
    cleanString(body.billingContactEmail) ||
    cleanString(body.accountLoginEmail) ||
    cleanString(body.leadNotificationEmail)
  const billingName =
    cleanString(body.billingContactName) ||
    [cleanString(body.accountFirstName), cleanString(body.accountLastName)].filter(Boolean).join(' ') ||
    companyName

  if (isLeadgenStripeActive() && billingEmail) {
    try {
      const provisioned = await provisionLeadBillingForOnboarding({
        portalKey,
        companyName,
        billingEmail,
        billingName: billingName || undefined,
        leadUnitPriceCents,
        leadChargeThreshold,
        billingModel,
      })

      if (!provisioned) {
        stripeProvisioning = {
          status: 'skipped',
          reason: 'Stripe secret key missing',
        }
      } else {
        await upsertOrganizationInConvex({
          companyId: cleanString(body.companyId) || undefined,
          portalKey,
          name: companyName,
          stripeCustomerId: provisioned.stripeCustomerId,
          stripeSubscriptionId: provisioned.stripeSubscriptionId,
          stripeSubscriptionItemId: provisioned.stripeSubscriptionItemId,
          billingModel,
          prepaidLeadCredits: billingDefaults.prepaidLeadCredits,
          leadCommitmentTotal: billingDefaults.leadCommitmentTotal || undefined,
          initialChargeCents: billingDefaults.initialChargeCents,
          leadChargeThreshold,
          leadUnitPriceCents,
          isActive: true,
        })

        stripeProvisioning = {
          status: 'provisioned',
          details: provisioned,
        }
      }
    } catch (error) {
      console.error('Stripe provisioning failed during onboarding:', error)
      stripeProvisioning = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown Stripe provisioning error',
      }
    }
  } else if (!isLeadgenStripeActive()) {
    stripeProvisioning = {
      status: 'skipped',
      reason: 'Leadgen Stripe provisioning is disabled (set LEADGEN_STRIPE_ACTIVE=true to enable).',
    }
  } else {
    stripeProvisioning = {
      status: 'failed',
      error: 'Missing billing email for Stripe provisioning',
    }
  }

  try {
    await sendOnboardingEmail({
      companyName,
      portalKey,
      billingModelLabel: BILLING_MODEL_LABELS[billingModel],
      serviceAreas,
      targetZipCodes,
      serviceTypes,
      leadRoutingPhones,
      leadRoutingEmails,
      leadUnitPriceCents,
      leadChargeThreshold,
    })
  } catch (error) {
    console.error('Failed to send onboarding completion email:', error)
  }

  return NextResponse.json({
    success: true,
    submissionId: result.submissionId,
    organizationId: result.organizationId,
    portalKey,
    billingModel,
    stripeProvisioning,
  })
  } catch (error) {
    console.error('Internal leadgen onboarding failed:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? `Internal onboarding error: ${error.message}`
            : 'Internal onboarding error',
      },
      { status: 500 }
    )
  }
}
