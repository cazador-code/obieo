import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { getBillingModelDefaults, normalizeBillingModel } from '@/lib/billing-models'
import {
  createLeadgenIntentInConvex,
  findActiveLeadgenIntentInConvex,
  markLeadgenPaidInConvex,
  upsertOrganizationInConvex,
} from '@/lib/convex'
import { activateCustomer } from '@/lib/stripe-activation'

export const runtime = 'nodejs'

type PaymentProvider = 'whop' | 'ignition' | 'manual'

type RequestBody = {
  portalKey?: unknown
  companyName?: unknown
  billingEmail?: unknown
  billingName?: unknown
  billingModel?: unknown
  paymentProvider?: unknown
  paymentReference?: unknown
  source?: unknown
  utmSource?: unknown
  utmCampaign?: unknown
  utmMedium?: unknown
  utmContent?: unknown
  leadUnitPriceCents?: unknown
  forceResendInvitation?: unknown
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

function decodeBasicAuthHeader(value: string): { user: string; pass: string } | null {
  const [scheme, encoded] = value.split(' ')
  if (scheme !== 'Basic' || !encoded) return null
  let decoded = ''
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8')
  } catch {
    return null
  }
  const idx = decoded.indexOf(':')
  if (idx < 0) return null
  return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) }
}

function requireBasicAuthInProd(request: NextRequest): NextResponse | null {
  const isProd = process.env.VERCEL_ENV === 'production'
  if (!isProd) return null

  const expectedUser = process.env.INTERNAL_LEADGEN_BASIC_AUTH_USER || ''
  const expectedPass = process.env.INTERNAL_LEADGEN_BASIC_AUTH_PASS || ''
  if (!expectedUser || !expectedPass) {
    return NextResponse.json(
      { success: false, error: 'Internal leadgen auth is not configured.' },
      { status: 503 }
    )
  }

  const creds = decodeBasicAuthHeader(request.headers.get('authorization') || '')
  if (!creds) {
    return new NextResponse('Authorization required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Obieo Internal", charset="UTF-8"' },
    })
  }

  const ok = timingSafeEqual(creds.user, expectedUser) && timingSafeEqual(creds.pass, expectedPass)
  if (!ok) {
    return new NextResponse('Authorization required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Obieo Internal", charset="UTF-8"' },
    })
  }

  return null
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function normalizePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  const intVal = Math.floor(value)
  return intVal > 0 ? intVal : fallback
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
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

function generatePortalKey(companyName: string, requestedPortalKey?: string | null): string {
  const requested = requestedPortalKey ? toPortalKeyBase(requestedPortalKey) : ''
  if (requested) return requested

  const base = toPortalKeyBase(companyName) || 'client'
  const suffix = crypto.randomBytes(3).toString('hex') // 6 chars
  return `${base}-${suffix}`
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

function getPaymentProvider(value: unknown): PaymentProvider | null {
  const normalized = cleanString(value)?.toLowerCase()
  if (!normalized) return 'manual'
  if (normalized === 'whop' || normalized === 'ignition' || normalized === 'manual') return normalized
  return null
}

function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  try {
    const authResponse = requireBasicAuthInProd(request)
    if (authResponse) return authResponse

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

    let body: RequestBody
    try {
      body = (await request.json()) as RequestBody
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const companyName = cleanString(body.companyName)
    const billingEmailRaw = cleanString(body.billingEmail)
    const billingEmail = billingEmailRaw ? billingEmailRaw.toLowerCase() : null
    const billingName = cleanString(body.billingName) || undefined
    const billingModel = normalizeBillingModel(body.billingModel)
    const paymentProvider = getPaymentProvider(body.paymentProvider)
    const paymentReference = cleanString(body.paymentReference)
    const forceResendInvitation = body.forceResendInvitation === true
    const leadUnitPriceCentsInput = normalizePositiveInt(body.leadUnitPriceCents, 4000)

    if (!companyName || !billingEmail) {
      return NextResponse.json(
        { success: false, error: 'companyName and billingEmail are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(billingEmail)) {
      return NextResponse.json({ success: false, error: 'billingEmail must be a valid email address' }, { status: 400 })
    }

    if (!paymentProvider) {
      return NextResponse.json(
        { success: false, error: 'paymentProvider must be one of: whop, ignition, manual' },
        { status: 400 }
      )
    }

    const existing = await findActiveLeadgenIntentInConvex({ billingEmail, companyName })
    if (existing && existing.billingModel && existing.billingModel !== billingModel) {
      return NextResponse.json(
        {
          success: false,
          error: `Existing leadgen intent already exists for this billing email/company with billingModel=${existing.billingModel}.`,
        },
        { status: 409 }
      )
    }

    const portalKey = existing?.portalKey || generatePortalKey(companyName, cleanString(body.portalKey))
    const token = existing?.token || generateToken()
    const tokenExpiresAt = existing?.tokenExpiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000

    if (!existing) {
      const created = await createLeadgenIntentInConvex({
        portalKey,
        companyName,
        billingEmail,
        billingName,
        billingModel,
        token,
        tokenExpiresAt,
        source: cleanString(body.source) || `external-payment-${paymentProvider}`,
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

    const paidIntent = await markLeadgenPaidInConvex({
      portalKey,
    })
    if (!paidIntent) {
      return NextResponse.json(
        { success: false, error: 'Failed to mark leadgen intent as paid. Check Convex config.' },
        { status: 500 }
      )
    }

    const defaults = getBillingModelDefaults(billingModel, leadUnitPriceCentsInput)
    const upsertedOrg = await upsertOrganizationInConvex({
      portalKey,
      name: companyName,
      billingModel,
      prepaidLeadCredits: defaults.prepaidLeadCredits,
      leadCommitmentTotal: defaults.leadCommitmentTotal || undefined,
      initialChargeCents: defaults.initialChargeCents,
      leadChargeThreshold: defaults.leadChargeThreshold,
      leadUnitPriceCents: defaults.leadUnitPriceCents,
      isActive: true,
    })
    if (!upsertedOrg) {
      return NextResponse.json(
        { success: false, error: 'Failed to upsert organization defaults. Check Convex config.' },
        { status: 500 }
      )
    }

    const sourceId = paymentReference || `${paymentProvider}:${portalKey}:${Date.now()}`
    const activation = await activateCustomer({
      candidate: {
        source: paymentProvider,
        sourceId,
        email: billingEmail,
        portalKey,
        companyName,
        billingModel,
        chargeKind: 'external_payment',
        journey: 'leadgen_payment_first',
      },
      forceResendInvitation,
    })

    const onboardingUrl = `${getAppBaseUrl()}/onboarding?token=${encodeURIComponent(token)}`

    return NextResponse.json({
      success: true,
      portalKey,
      status: paidIntent.status,
      tokenExpiresAt,
      paymentProvider,
      paymentReference: paymentReference || null,
      onboardingUrl,
      activation,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Internal payment confirmation failed:', msg)
    return NextResponse.json({ success: false, error: `Server error: ${msg}` }, { status: 500 })
  }
}
