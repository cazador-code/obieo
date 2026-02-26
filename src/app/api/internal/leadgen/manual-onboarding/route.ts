import { NextRequest, NextResponse } from 'next/server'
import { submitClientOnboardingInConvex } from '@/lib/convex'
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { getBillingModelDefaults, normalizeBillingModel } from '@/lib/billing-models'
import { verifyInternalToolToken } from '@/lib/internal-tool-auth'
import {
  dedupeStringList,
  getInvalidTargetZipError,
  getTargetZipCountError,
  parseTargetZipCodes,
} from '@/lib/leadgen-target-zips'

export const runtime = 'nodejs'

interface ManualOnboardingPayload {
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
  captureMethod?: string
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
  if (requested) return requested
  return toPortalKeyBase(companyName) || 'client'
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => cleanString(entry))
      .filter((entry): entry is string => Boolean(entry))
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map((entry) => entry.trim())
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

  const redacted = raw
    .replace(/authSecret:\s*\"[^\"]+\"/g, 'authSecret: "<redacted>"')
    .replace(/token:\s*\"[^\"]+\"/g, 'token: "<redacted>"')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer <redacted>')

  const objectIndex = redacted.indexOf(' Object:')
  if (objectIndex > 0) {
    return redacted.slice(0, objectIndex).trim()
  }

  return redacted
}

function buildNotes(input: { notes: string | null; captureMethod: string | null }): string | undefined {
  const lines = ['Captured via internal manual onboarding intake.']
  if (input.captureMethod) {
    lines.push(`Capture method: ${input.captureMethod}`)
  }
  if (input.notes) {
    lines.push(input.notes)
  }

  const combined = lines.join('\n\n').trim()
  return combined || undefined
}

export async function POST(request: NextRequest) {
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
    const authorized = await verifyInternalToolToken(token)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let body: ManualOnboardingPayload
    try {
      body = (await request.json()) as ManualOnboardingPayload
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const companyName = cleanString(body.companyName)
    if (!companyName) {
      return NextResponse.json({ success: false, error: 'companyName is required' }, { status: 400 })
    }

    if (!process.env.CONVEX_URL || !process.env.CONVEX_AUTH_ADAPTER_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Convex is not configured for onboarding storage. Set CONVEX_URL and CONVEX_AUTH_ADAPTER_SECRET in .env.local and in Convex deployment settings.',
        },
        { status: 500 }
      )
    }

    const requestedPortalKey = cleanString(body.portalKey)
    const portalKey = buildPortalKey(companyName, requestedPortalKey)
    const serviceAreas = normalizeStringList(body.serviceAreas)
    const { zipCodes: targetZipCodes, invalidZipCodes } = parseTargetZipCodes(body.targetZipCodes)
    const serviceTypes = normalizeStringList(body.serviceTypes)
    const leadRoutingPhones = normalizeStringList(body.leadRoutingPhones)
    const leadRoutingEmails = normalizeStringList(body.leadRoutingEmails)
    const billingModel = normalizeBillingModel(body.billingModel)

    const accountLoginEmail = cleanString(body.accountLoginEmail)
    const leadNotificationEmail = cleanString(body.leadNotificationEmail)
    const leadNotificationPhone = cleanString(body.leadNotificationPhone)
    const businessPhone = cleanString(body.businessPhone)

    if (serviceAreas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one service area is required' },
        { status: 400 }
      )
    }
    const invalidTargetZipError = getInvalidTargetZipError(invalidZipCodes)
    if (invalidTargetZipError) {
      return NextResponse.json(
        { success: false, error: invalidTargetZipError },
        { status: 400 }
      )
    }

    const targetZipCountError = getTargetZipCountError(targetZipCodes.length)
    if (targetZipCountError) {
      return NextResponse.json(
        { success: false, error: targetZipCountError },
        { status: 400 }
      )
    }

    const normalizedLeadRoutingPhones = dedupeStringList(leadRoutingPhones)
    const normalizedLeadRoutingEmails = dedupeStringList(leadRoutingEmails.map((email) => email.toLowerCase()))

    if (normalizedLeadRoutingPhones.length === 0 && normalizedLeadRoutingEmails.length === 0) {
      const hasNonRoutingContacts = Boolean(
        leadNotificationPhone ||
          leadNotificationEmail ||
          accountLoginEmail ||
          businessPhone
      )
      return NextResponse.json(
        {
          success: false,
          error: hasNonRoutingContacts
            ? 'Lead destination phone/email is required. Alert or business contacts do not route leads.'
            : 'Provide at least one lead destination phone or email.',
        },
        { status: 400 }
      )
    }

    const leadUnitPriceCentsInput = normalizePositiveInt(body.leadUnitPriceCents, 4000)
    const billingDefaults = getBillingModelDefaults(billingModel, leadUnitPriceCentsInput)
    const leadUnitPriceCents = billingDefaults.leadUnitPriceCents
    const requestedThreshold = normalizePositiveInt(body.leadChargeThreshold, billingDefaults.leadChargeThreshold)
    const leadChargeThreshold =
      billingModel === 'pay_per_lead_perpetual' ? 1 : requestedThreshold

    let result:
      | {
          submissionId: string
          organizationId: string
          portalKey: string
        }
      | null = null

    try {
      result = await submitClientOnboardingInConvex(
        {
          companyId: cleanString(body.companyId) || undefined,
          portalKey,
          accountFirstName: cleanString(body.accountFirstName) || undefined,
          accountLastName: cleanString(body.accountLastName) || undefined,
          accountLoginEmail: accountLoginEmail?.toLowerCase() || undefined,
          businessPhone: businessPhone || undefined,
          businessAddress: cleanString(body.businessAddress) || undefined,
          companyName,
          serviceAreas,
          targetZipCodes,
          serviceTypes: serviceTypes.length > 0 ? serviceTypes : undefined,
          desiredLeadVolumeDaily: normalizeOptionalPositiveInt(body.desiredLeadVolumeDaily),
          operatingHoursStart: cleanString(body.operatingHoursStart) || undefined,
          operatingHoursEnd: cleanString(body.operatingHoursEnd) || undefined,
          leadRoutingPhones: normalizedLeadRoutingPhones,
          leadRoutingEmails: normalizedLeadRoutingEmails,
          leadNotificationPhone: leadNotificationPhone || undefined,
          leadNotificationEmail: leadNotificationEmail?.toLowerCase() || undefined,
          leadProspectEmail: cleanString(body.leadProspectEmail)?.toLowerCase() || undefined,
          billingContactName: cleanString(body.billingContactName) || undefined,
          billingContactEmail: cleanString(body.billingContactEmail)?.toLowerCase() || undefined,
          billingModel,
          prepaidLeadCredits: billingDefaults.prepaidLeadCredits,
          leadCommitmentTotal: billingDefaults.leadCommitmentTotal || undefined,
          initialChargeCents: billingDefaults.initialChargeCents,
          leadChargeThreshold,
          leadUnitPriceCents,
          notes: buildNotes({
            notes: cleanString(body.notes),
            captureMethod: cleanString(body.captureMethod),
          }),
        },
        { throwOnError: true }
      )
    } catch (error) {
      const msg = formatConvexError(error)
      console.error('Manual onboarding Convex mutation failed:', msg)
      return NextResponse.json(
        {
          success: false,
          error: 'Could not record onboarding answers right now. Please try again.',
        },
        { status: 500 }
      )
    }

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Convex onboarding storage failed (no response).',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Manual onboarding answers recorded.',
      portalKey,
      submissionId: result.submissionId,
      organizationId: result.organizationId,
      billingModel,
      leadUnitPriceCents,
      leadChargeThreshold,
    })
  } catch (error) {
    console.error('Manual onboarding intake failed:', formatConvexError(error))
    return NextResponse.json(
      {
        success: false,
        error: 'Manual onboarding intake failed. Please try again.',
      },
      { status: 500 }
    )
  }
}
