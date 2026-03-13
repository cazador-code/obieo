import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/lib/stripe'
import { authLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { activateCustomer, getActivationCandidateFromCheckout } from '@/lib/stripe-activation'
import { getBillingModelDefaults, normalizeBillingModel } from '@/lib/billing-models'
import {
  applyConfirmedPurchaseInConvex,
  markLeadgenPaidInConvex,
  queueLeadgenManualReviewInConvex,
  upsertOrganizationInConvex,
} from '@/lib/convex'

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

function isLeadgenStripeActive(): boolean {
  return process.env.LEADGEN_STRIPE_ACTIVE?.trim() === 'true'
}

function logStripeActivate(event: string, details: Record<string, unknown>) {
  console.info(`[stripe-public-activate] ${event}`, details)
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await authLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  if (!isLeadgenStripeActive()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Stripe activation endpoint is disabled (set LEADGEN_STRIPE_ACTIVE=true to re-enable).',
      },
      { status: 409 }
    )
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
      const billingEmail =
        normalizeString(session.customer_details?.email) ||
        normalizeString(session.customer_email) ||
        undefined
      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : undefined
      const billingModel =
        session.metadata?.billing_model ? normalizeBillingModel(session.metadata.billing_model) : 'package_40_paid_in_full'
      const purchaseKey = `stripe_checkout:${session.id}`

      if (!portalKey) {
        await queueLeadgenManualReviewInConvex({
          paymentEventId: purchaseKey,
          companyName,
          billingEmail,
          reason: 'missing_stable_client_identifier',
          details:
            'Stripe activation fallback saw a paid leadgen_payment_first checkout without portal_key metadata. Activation stopped for manual review.',
          payloadJson: JSON.stringify({
            checkoutSessionId: session.id,
            stripeCustomerId,
            billingModel,
            amountTotal: session.amount_total,
            metadata: session.metadata,
          }),
        })

        logStripeActivate('manual_review_required', {
          purchaseKey,
          reason: 'missing_stable_client_identifier',
        })

        return NextResponse.json(
          {
            success: false,
            error:
              'This checkout is missing the stable client identifier (portalKey). Activation was stopped and queued for manual review.',
            manualReviewRequired: true,
          },
          { status: 409 }
        )
      }

      if (portalKey) {
        await markLeadgenPaidInConvex({
          portalKey,
          checkoutSessionId: session.id,
          stripeCustomerId,
        })

        const defaults = getBillingModelDefaults(billingModel, 4000)
        const purchase = await applyConfirmedPurchaseInConvex({
          portalKey,
          purchaseKey,
          companyName,
          billingModel,
          prepaidLeadCredits: defaults.prepaidLeadCredits,
          leadCommitmentTotal: defaults.leadCommitmentTotal || undefined,
          initialChargeCents:
            typeof session.amount_total === 'number' && session.amount_total > 0
              ? session.amount_total
              : defaults.initialChargeCents,
          leadChargeThreshold: defaults.leadChargeThreshold,
          leadUnitPriceCents: defaults.leadUnitPriceCents,
          payloadJson: JSON.stringify({
            checkoutSessionId: session.id,
            stripeCustomerId,
            billingEmail,
            billingModel,
            amountTotal: session.amount_total,
            currency: session.currency,
            paymentStatus: session.payment_status,
          }),
        })

        if (!purchase) {
          return NextResponse.json(
            { success: false, error: 'Failed to apply Stripe checkout purchase.' },
            { status: 500 }
          )
        }

        await upsertOrganizationInConvex({
          portalKey,
          stripeCustomerId,
          billingModel,
          isActive: true,
        })

        logStripeActivate('purchase_applied', {
          purchaseKey,
          portalKey,
          organizationCreated: purchase.organizationCreated,
          purchaseRowCreated: !purchase.alreadyApplied,
          prepaidLeadCredits: purchase.prepaidLeadCredits,
          leadCommitmentTotal: purchase.leadCommitmentTotal,
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
