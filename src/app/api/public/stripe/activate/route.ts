import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/lib/stripe'
import { authLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { activateCustomer, getActivationCandidateFromCheckout } from '@/lib/stripe-activation'
import { getBillingModelDefaults } from '@/lib/billing-models'
import { markLeadgenPaidInConvex, upsertOrganizationInConvex } from '@/lib/convex'

export const runtime = 'nodejs'

function extractCheckoutSessionId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null

  // Accept full URLs as input (helpful for support/debugging).
  try {
    const url = new URL(trimmed)
    const fromQuery = url.searchParams.get('session_id') || url.searchParams.get('sessionId')
    if (fromQuery) {
      const match = fromQuery.match(/cs_(?:live|test)_[A-Za-z0-9]+/)
      return match ? match[0] : fromQuery.trim()
    }
  } catch {
    // not a URL
  }

  const match = trimmed.match(/cs_(?:live|test)_[A-Za-z0-9]+/)
  return match ? match[0] : trimmed
}

async function retrieveCheckoutSession(stripe: Stripe, sessionId: string): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId)
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned ? cleaned : null
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await authLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  const stripe = getStripeClient()
  if (!stripe) {
    return NextResponse.json({ success: false, error: 'Stripe is not configured' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const sessionId = extractCheckoutSessionId(payload.sessionId || payload.checkoutSessionId)
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 })
  }

  try {
    const session = await retrieveCheckoutSession(stripe, sessionId)

    // Webhook-safe fallback: if the user is on the success page and the Stripe webhook
    // is temporarily failing/misconfigured, we still want the "resend invite" flow to
    // advance leadgen state so `/leadgen/onboarding` won't be blocked.
    if (session.payment_status === 'paid' && session.metadata?.obieo_journey === 'leadgen_payment_first') {
      const portalKey = normalizeString(session.metadata?.portal_key)
      const companyName = normalizeString(session.metadata?.company_name) || undefined
      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : undefined

      if (portalKey) {
        await markLeadgenPaidInConvex({
          portalKey,
          checkoutSessionId: session.id,
          stripeCustomerId,
        })

        const defaults = getBillingModelDefaults('package_40_paid_in_full', 4000)
        await upsertOrganizationInConvex({
          portalKey,
          name: companyName,
          stripeCustomerId,
          billingModel: 'package_40_paid_in_full',
          prepaidLeadCredits: defaults.prepaidLeadCredits,
          leadCommitmentTotal: defaults.leadCommitmentTotal || undefined,
          initialChargeCents: defaults.initialChargeCents,
          leadChargeThreshold: defaults.leadChargeThreshold,
          leadUnitPriceCents: defaults.leadUnitPriceCents,
          isActive: true,
        })
      }
    }

    const candidate = getActivationCandidateFromCheckout(session)
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Checkout session is not eligible for activation.' },
        { status: 400 }
      )
    }

    const activation = await activateCustomer({ stripe, candidate, forceResendInvitation: true })
    return NextResponse.json({ success: true, activation })
  } catch (error) {
    console.error('Public activation failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Activation failed' },
      { status: 500 }
    )
  }
}
