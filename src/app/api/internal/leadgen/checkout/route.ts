import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { provisionLeadBillingForOnboarding } from '@/lib/stripe-onboarding'
import { authLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { normalizeBillingModel } from '@/lib/billing-models'

export const runtime = 'nodejs'
const INTERNAL_TOKEN_ISSUER = process.env.INTERNAL_TOOL_TOKEN_ISSUER?.trim() || 'obieo-internal-tool'
const INTERNAL_TOKEN_AUDIENCE = process.env.INTERNAL_TOOL_TOKEN_AUDIENCE?.trim() || 'obieo-internal-api'

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
    const verified = await jwtVerify(token, secret, {
      issuer: INTERNAL_TOKEN_ISSUER,
      audience: INTERNAL_TOKEN_AUDIENCE,
      algorithms: ['HS256'],
    })
    return verified.payload.authorized === true
  } catch {
    return false
  }
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function isLeadgenStripeActive(): boolean {
  return process.env.LEADGEN_STRIPE_ACTIVE?.trim() === 'true'
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await authLimiter.limit(ip)
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

  if (!isLeadgenStripeActive()) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Stripe checkout regeneration is disabled (set LEADGEN_STRIPE_ACTIVE=true to re-enable).',
      },
      { status: 409 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const portalKey = cleanString(payload.portalKey)
  const companyName = cleanString(payload.companyName)
  const billingEmail = cleanString(payload.billingEmail)
  const billingName = cleanString(payload.billingName) || undefined
  const billingModel = normalizeBillingModel(payload.billingModel)
  const leadUnitPriceCents =
    typeof payload.leadUnitPriceCents === 'number' && Number.isFinite(payload.leadUnitPriceCents)
      ? Math.round(payload.leadUnitPriceCents)
      : 4000
  const leadChargeThreshold =
    typeof payload.leadChargeThreshold === 'number' && Number.isFinite(payload.leadChargeThreshold)
      ? Math.floor(payload.leadChargeThreshold)
      : 10

  if (!portalKey || !companyName || !billingEmail) {
    return NextResponse.json(
      { success: false, error: 'portalKey, companyName, and billingEmail are required' },
      { status: 400 }
    )
  }

  const provisioned = await provisionLeadBillingForOnboarding({
    portalKey,
    companyName,
    billingEmail,
    billingName,
    leadUnitPriceCents,
    leadChargeThreshold,
    billingModel,
  })

  if (!provisioned) {
    return NextResponse.json(
      { success: false, error: 'Stripe is not configured (missing STRIPE_SECRET_KEY)' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    stripeCustomerId: provisioned.stripeCustomerId,
    stripeSubscriptionId: provisioned.stripeSubscriptionId,
    stripeSubscriptionItemId: provisioned.stripeSubscriptionItemId,
    initialCheckoutUrl: provisioned.initialCheckoutUrl,
    initialCheckoutAmountCents: provisioned.initialCheckoutAmountCents,
    billingModel: provisioned.billingModel,
  })
}
