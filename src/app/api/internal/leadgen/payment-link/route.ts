import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import Stripe from 'stripe'
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { provisionLeadBillingForOnboarding } from '@/lib/stripe-onboarding'
import { getStripeClient } from '@/lib/stripe'
import { getBillingModelDefaults, normalizeBillingModel } from '@/lib/billing-models'
import {
  createLeadgenIntentInConvex,
  findActiveLeadgenIntentInConvex,
  upsertOrganizationInConvex,
  updateLeadgenCheckoutDetailsInConvex,
} from '@/lib/convex'

export const runtime = 'nodejs'

type RequestBody = {
  companyName?: unknown
  billingEmail?: unknown
  billingName?: unknown
  billingModel?: unknown
  source?: unknown
  utmSource?: unknown
  utmCampaign?: unknown
  utmMedium?: unknown
  utmContent?: unknown
  notes?: unknown
  testDiscount?: unknown
  forceNew?: unknown
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

  const ok =
    timingSafeEqual(creds.user, expectedUser) &&
    timingSafeEqual(creds.pass, expectedPass)
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

async function resolveTestDiscount(
  stripe: Stripe,
  rawInput: string
): Promise<{ coupon?: string; promotionCode?: string } | null> {
  const cleaned = rawInput.trim()
  if (!cleaned) return null

  // Direct ID forms.
  if (cleaned.startsWith('promo_')) return { promotionCode: cleaned }

  // 1) Try coupon ID directly.
  try {
    const coupon = await stripe.coupons.retrieve(cleaned)
    if (coupon && typeof coupon === 'object') {
      return { coupon: coupon.id }
    }
  } catch {
    // continue
  }

  // 2) Try promotion code by user-facing code string.
  try {
    const promos = await stripe.promotionCodes.list({ code: cleaned, active: true, limit: 1 })
    const promo = promos.data[0]
    if (promo) return { promotionCode: promo.id }
  } catch {
    // continue
  }

  // 3) Try coupon "name" (dashboard label) by listing and matching.
  try {
    const coupons = await stripe.coupons.list({ limit: 100 })
    const match = coupons.data.find((c) => (c.name || '').trim() === cleaned)
    if (match) return { coupon: match.id }
  } catch {
    // continue
  }

  throw new Error(
    `Unknown discount "${cleaned}". Use a coupon ID (like "aW0d883k"), a promotion code ID ("promo_..."), or a promo code string.`
  )
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
    const billingEmail = cleanString(body.billingEmail)
    const billingName = cleanString(body.billingName) || undefined
    const billingModelRaw = cleanString(body.billingModel)
    const billingModel = billingModelRaw ? normalizeBillingModel(billingModelRaw) : 'package_40_paid_in_full'
    const testDiscountRaw = cleanString(body.testDiscount) || ''
    const forceNew = body.forceNew === true
    if (!companyName || !billingEmail) {
      return NextResponse.json(
        { success: false, error: 'companyName and billingEmail are required' },
        { status: 400 }
      )
    }

    const existing = await findActiveLeadgenIntentInConvex({ billingEmail, companyName })
    if (existing) {
      if (existing.billingModel && existing.billingModel !== billingModel) {
        return NextResponse.json(
          {
            success: false,
            error: `Existing leadgen intent already exists for this billing email/company with billingModel=${existing.billingModel}. Use a new billing email (recommended) or complete/expire the existing intent.`,
          },
          { status: 409 }
        )
      }

      if (existing.status !== 'checkout_created' && existing.status !== 'paid' && existing.status !== 'invited') {
        // Unexpected, but return it anyway.
        return NextResponse.json({ success: true, ...existing })
      }

      if (!forceNew && !testDiscountRaw && existing.status === 'checkout_created' && existing.checkoutUrl) {
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
        billingModel,
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

    const stripe = getStripeClient()
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).' },
        { status: 500 }
      )
    }

    let resolvedDiscount: { coupon?: string; promotionCode?: string } | null = null
    try {
      resolvedDiscount = testDiscountRaw ? await resolveTestDiscount(stripe, testDiscountRaw) : null
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      return NextResponse.json({ success: false, error: msg }, { status: 400 })
    }

    let provisioned: Awaited<ReturnType<typeof provisionLeadBillingForOnboarding>> | null = null
    try {
      const defaults = getBillingModelDefaults(billingModel, 4000)
      provisioned = await provisionLeadBillingForOnboarding({
        portalKey,
        companyName,
        billingEmail,
        billingName,
        leadUnitPriceCents: 4000,
        leadChargeThreshold: defaults.leadChargeThreshold,
        billingModel,
        journey: 'leadgen_payment_first',
        ...(resolvedDiscount
          ? {
              discount: resolvedDiscount,
            }
          : {}),
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('Stripe provisioning failed in payment-link:', { portalKey, msg })
      return NextResponse.json(
        { success: false, error: `Stripe provisioning failed: ${msg}` },
        { status: 500 }
      )
    }

    if (!provisioned?.initialCheckoutUrl || !provisioned.initialCheckoutSessionId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Stripe provisioning failed (missing checkout URL). Check STRIPE_SECRET_KEY and catalog pins.',
        },
        { status: 500 }
      )
    }

    await updateLeadgenCheckoutDetailsInConvex({
      portalKey,
      stripeCustomerId: provisioned.stripeCustomerId,
      checkoutSessionId: provisioned.initialCheckoutSessionId,
      checkoutUrl: provisioned.initialCheckoutUrl,
    })

    // For pay-per-lead models, downstream lead delivery billing needs the Stripe subscription item id.
    // Store it early so the lead-delivered webhook can record usage as soon as leads start flowing.
    if (provisioned.stripeSubscriptionItemId || provisioned.stripeSubscriptionId) {
      await upsertOrganizationInConvex({
        portalKey,
        stripeCustomerId: provisioned.stripeCustomerId,
        stripeSubscriptionId: provisioned.stripeSubscriptionId,
        stripeSubscriptionItemId: provisioned.stripeSubscriptionItemId,
        billingModel,
      })
    }

    return NextResponse.json({
      success: true,
      portalKey,
      checkoutUrl: provisioned.initialCheckoutUrl,
      status: 'checkout_created',
      tokenExpiresAt,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Internal payment-link handler failed:', msg)
    return NextResponse.json({ success: false, error: `Server error: ${msg}` }, { status: 500 })
  }
}
