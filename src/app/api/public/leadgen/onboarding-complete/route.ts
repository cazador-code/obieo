import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import {
  getLeadgenIntentByTokenInConvex,
  markLeadgenOnboardingCompletedInConvex,
  submitClientOnboardingInConvex,
  upsertOrganizationInConvex,
} from '@/lib/convex'
import { getBillingModelDefaults } from '@/lib/billing-models'

export const runtime = 'nodejs'

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => cleanString(entry))
    .filter((entry): entry is string => Boolean(entry))
}

function normalizeOptionalPositiveInt(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const intVal = Math.floor(value)
  return intVal > 0 ? intVal : undefined
}

function getPortalKeyFromUser(user: { publicMetadata?: Record<string, unknown> }): string | null {
  const meta = user.publicMetadata || {}
  const portalKey =
    (typeof meta.portalKey === 'string' && meta.portalKey.trim()) ||
    (typeof meta.portal_key === 'string' && meta.portal_key.trim()) ||
    null
  return portalKey ? portalKey.trim() : null
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { token?: unknown; onboardingPayload?: unknown }
  try {
    body = (await request.json()) as { token?: unknown; onboardingPayload?: unknown }
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const token = cleanString(body.token)
  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 })
  }

  const intent = await getLeadgenIntentByTokenInConvex({ token })
  if (!intent) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 404 })
  }

  if (intent.status !== 'paid' && intent.status !== 'invited' && intent.status !== 'onboarding_completed') {
    return NextResponse.json(
      { success: false, error: 'Payment not confirmed yet. Please contact support.' },
      { status: 409 }
    )
  }

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const portalKey = getPortalKeyFromUser(user)
  if (!portalKey || portalKey !== intent.portalKey) {
    return NextResponse.json(
      { success: false, error: 'Account is not linked to this organization. Please contact support.' },
      { status: 403 }
    )
  }

  const payload = (body.onboardingPayload || {}) as Record<string, unknown>
  const serviceAreas = normalizeStringArray(payload.serviceAreas)
  const targetZipCodes = normalizeStringArray(payload.targetZipCodes)
  const serviceTypes = normalizeStringArray(payload.serviceTypes)
  const leadRoutingPhones = normalizeStringArray(payload.leadRoutingPhones)
  const leadRoutingEmails = normalizeStringArray(payload.leadRoutingEmails)

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

  const billingModel = intent.billingModel || 'package_40_paid_in_full'
  const defaults = getBillingModelDefaults(billingModel, 4000)

  // Ensure org is present and has correct paid-in-full billing defaults.
  await upsertOrganizationInConvex({
    portalKey,
    name: intent.companyName,
    stripeCustomerId: intent.stripeCustomerId || undefined,
    billingModel,
    prepaidLeadCredits: defaults.prepaidLeadCredits,
    leadCommitmentTotal: defaults.leadCommitmentTotal || undefined,
    initialChargeCents: defaults.initialChargeCents,
    leadChargeThreshold: defaults.leadChargeThreshold,
    leadUnitPriceCents: defaults.leadUnitPriceCents,
    isActive: true,
  })

  // Persist onboarding payload in the same structures as internal onboarding for audit.
  await submitClientOnboardingInConvex({
    portalKey,
    companyName: intent.companyName,
    accountLoginEmail: intent.billingEmail,
    businessPhone: cleanString(payload.businessPhone) || undefined,
    businessAddress: cleanString(payload.businessAddress) || undefined,
    serviceAreas,
    targetZipCodes,
    serviceTypes,
    desiredLeadVolumeDaily: normalizeOptionalPositiveInt(payload.desiredLeadVolumeDaily),
    operatingHoursStart: cleanString(payload.operatingHoursStart) || undefined,
    operatingHoursEnd: cleanString(payload.operatingHoursEnd) || undefined,
    leadRoutingPhones,
    leadRoutingEmails,
    leadNotificationPhone: cleanString(payload.leadNotificationPhone) || undefined,
    leadNotificationEmail: cleanString(payload.leadNotificationEmail) || undefined,
    leadProspectEmail: cleanString(payload.leadProspectEmail) || undefined,
    billingModel,
    prepaidLeadCredits: defaults.prepaidLeadCredits,
    leadCommitmentTotal: defaults.leadCommitmentTotal || undefined,
    initialChargeCents: defaults.initialChargeCents,
    leadChargeThreshold: defaults.leadChargeThreshold,
    leadUnitPriceCents: defaults.leadUnitPriceCents,
    notes: undefined,
  })

  // Mark onboarding completion status on org + leadgen intent.
  await upsertOrganizationInConvex({
    portalKey,
    onboardingStatus: 'completed',
    onboardingCompletedAt: Date.now(),
  })
  await markLeadgenOnboardingCompletedInConvex({ portalKey })

  return NextResponse.json({ success: true, portalKey })
}
