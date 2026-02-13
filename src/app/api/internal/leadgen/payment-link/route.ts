import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import crypto from 'crypto'
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { provisionLeadBillingForOnboarding } from '@/lib/stripe-onboarding'
import {
  createLeadgenIntentInConvex,
  findActiveLeadgenIntentInConvex,
  updateLeadgenCheckoutDetailsInConvex,
} from '@/lib/convex'

export const runtime = 'nodejs'

type RequestBody = {
  companyName?: unknown
  billingEmail?: unknown
  billingName?: unknown
  source?: unknown
  utmSource?: unknown
  utmCampaign?: unknown
  utmMedium?: unknown
  utmContent?: unknown
  notes?: unknown
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
  return trimmed ? trimmed : null
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

function generatePortalKey(companyName: string): string {
  const base = toPortalKeyBase(companyName) || 'client'
  const suffix = crypto.randomBytes(3).toString('hex') // 6 chars
  return `${base}-${suffix}`
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await auditLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  if (process.env.LEADGEN_PAYMENT_FIRST_ENABLED?.trim() !== 'true') {
    return NextResponse.json(
      { success: false, error: 'Leadgen payment-first flow is disabled.' },
      { status: 403 }
    )
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

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const companyName = cleanString(body.companyName)
  const billingEmail = cleanString(body.billingEmail)
  const billingName = cleanString(body.billingName) || undefined
  if (!companyName || !billingEmail) {
    return NextResponse.json(
      { success: false, error: 'companyName and billingEmail are required' },
      { status: 400 }
    )
  }

  const existing = await findActiveLeadgenIntentInConvex({ billingEmail, companyName })
  if (existing) {
    if (existing.status !== 'checkout_created' && existing.status !== 'paid' && existing.status !== 'invited') {
      // Unexpected, but return it anyway.
      return NextResponse.json({ success: true, ...existing })
    }

    if (existing.status === 'checkout_created' && existing.checkoutUrl) {
      return NextResponse.json({
        success: true,
        portalKey: existing.portalKey,
        checkoutUrl: existing.checkoutUrl,
        status: existing.status,
        tokenExpiresAt: existing.tokenExpiresAt,
      })
    }

    if (existing.status === 'paid' || existing.status === 'invited') {
      return NextResponse.json({
        success: true,
        portalKey: existing.portalKey,
        checkoutUrl: existing.checkoutUrl || null,
        status: existing.status,
        tokenExpiresAt: existing.tokenExpiresAt,
      })
    }
  }

  const portalKey = existing?.portalKey || generatePortalKey(companyName)
  const leadgenToken = existing?.token || generateToken()
  const tokenExpiresAt = existing?.tokenExpiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000

  if (!existing) {
    const created = await createLeadgenIntentInConvex({
      portalKey,
      companyName,
      billingEmail,
      billingName,
      token: leadgenToken,
      tokenExpiresAt,
      source: cleanString(body.source) || undefined,
      utmSource: cleanString(body.utmSource) || undefined,
      utmCampaign: cleanString(body.utmCampaign) || undefined,
      utmMedium: cleanString(body.utmMedium) || undefined,
      utmContent: cleanString(body.utmContent) || undefined,
    })

    if (!created) {
      return NextResponse.json(
        { success: false, error: 'Failed to create leadgen intent. Check Convex config.' },
        { status: 500 }
      )
    }
  }

  const provisioned = await provisionLeadBillingForOnboarding({
    portalKey,
    companyName,
    billingEmail,
    billingName,
    leadUnitPriceCents: 4000,
    leadChargeThreshold: 10,
    billingModel: 'package_40_paid_in_full',
    journey: 'leadgen_payment_first',
  })

  if (!provisioned?.initialCheckoutUrl || !provisioned.initialCheckoutSessionId) {
    return NextResponse.json(
      { success: false, error: 'Stripe provisioning failed (missing checkout URL). Check STRIPE_SECRET_KEY and catalog pins.' },
      { status: 500 }
    )
  }

  await updateLeadgenCheckoutDetailsInConvex({
    portalKey,
    stripeCustomerId: provisioned.stripeCustomerId,
    checkoutSessionId: provisioned.initialCheckoutSessionId,
    checkoutUrl: provisioned.initialCheckoutUrl,
  })

  return NextResponse.json({
    success: true,
    portalKey,
    checkoutUrl: provisioned.initialCheckoutUrl,
    status: 'checkout_created',
    tokenExpiresAt,
  })
}

