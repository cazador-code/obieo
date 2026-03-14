import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { kv } from '@vercel/kv'
import { syncAirtableBillingSnapshotFromConvex } from '@/lib/airtable-billing-sync'
import { getStripeClient } from '@/lib/stripe'
import {
  activateCustomer,
  getActivationCandidateFromCheckout,
  getActivationCandidateFromInvoice,
  type ActivationCandidate,
} from '@/lib/stripe-activation'
import {
  applyConfirmedPurchaseInConvex,
  grantLeadCreditsFromInvoiceInConvex,
  markLeadgenPaidInConvex,
  queueLeadgenManualReviewInConvex,
  recordInvoiceEventInConvex,
  upsertOrganizationInConvex,
} from '@/lib/convex'
import { getBillingModelDefaults, normalizeBillingModel } from '@/lib/billing-models'

export const runtime = 'nodejs'

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned ? cleaned : null
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const intVal = Math.floor(value)
    return intVal > 0 ? intVal : null
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return null
    const intVal = Math.floor(parsed)
    return intVal > 0 ? intVal : null
  }
  return null
}

function logStripeLeadgen(event: string, details: Record<string, unknown>) {
  console.info(`[stripe-webhook-leadgen] ${event}`, details)
}

async function isEventAlreadyProcessed(eventId: string): Promise<boolean> {
  try {
    const value = await kv.get<string>(`billing:stripe-webhook:${eventId}`)
    return Boolean(value)
  } catch (error) {
    console.error('KV read failed for Stripe webhook dedupe:', error)
    return false
  }
}

async function markEventProcessed(eventId: string, payload: Record<string, unknown>): Promise<void> {
  try {
    await kv.set(`billing:stripe-webhook:${eventId}`, JSON.stringify(payload), {
      ex: 60 * 60 * 24 * 120,
    })
  } catch (error) {
    console.error('KV write failed for Stripe webhook dedupe:', error)
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient()
  if (!stripe) {
    return NextResponse.json(
      { success: false, error: 'STRIPE_SECRET_KEY is not configured' },
      { status: 500 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) {
    return NextResponse.json(
      { success: false, error: 'STRIPE_WEBHOOK_SECRET is not configured' },
      { status: 500 }
    )
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json(
      { success: false, error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const rawBody = await request.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    console.error('Stripe signature verification failed:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid Stripe webhook signature' },
      { status: 400 }
    )
  }

  if (await isEventAlreadyProcessed(event.id)) {
    return NextResponse.json({
      success: true,
      duplicate: true,
      eventId: event.id,
    })
  }

  let candidate: ActivationCandidate | null = null

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object as Stripe.Checkout.Session
    const journey = normalizeString(session.metadata?.obieo_journey)

    // Payment-first leadgen flow: mark leadgen paid + ensure org shell exists before inviting.
    if (session.payment_status === 'paid' && journey === 'leadgen_payment_first') {
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
            'Stripe checkout completed for leadgen_payment_first without portal_key metadata. Payment was not attached to a client and requires manual review.',
          payloadJson: JSON.stringify({
            eventId: event.id,
            checkoutSessionId: session.id,
            stripeCustomerId,
            billingModel,
            amountTotal: session.amount_total,
            metadata: session.metadata,
          }),
        })

        logStripeLeadgen('manual_review_required', {
          eventId: event.id,
          purchaseKey,
          reason: 'missing_stable_client_identifier',
        })

        candidate = null
      } else {
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
            eventId: event.id,
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
          throw new Error('Failed to apply Stripe checkout purchase to organization')
        }

        await upsertOrganizationInConvex({
          portalKey,
          stripeCustomerId,
          billingModel,
          isActive: true,
        })

        logStripeLeadgen('purchase_applied', {
          eventId: event.id,
          purchaseKey,
          portalKey,
          organizationCreated: purchase.organizationCreated,
          purchaseRowCreated: !purchase.alreadyApplied,
          prepaidLeadCredits: purchase.prepaidLeadCredits,
          leadCommitmentTotal: purchase.leadCommitmentTotal,
        })

        const airtableBillingSync = await syncAirtableBillingSnapshotFromConvex({ portalKey })
        if (!airtableBillingSync.ok) {
          logStripeLeadgen('airtable_sync_after_purchase_failed', {
            eventId: event.id,
            portalKey,
            status: airtableBillingSync.status,
            error: airtableBillingSync.error,
          })
        } else if (!airtableBillingSync.syncResult.synced && airtableBillingSync.syncResult.reason !== 'not_configured') {
          logStripeLeadgen('airtable_sync_after_purchase_failed', {
            eventId: event.id,
            portalKey,
            reason: airtableBillingSync.syncResult.reason,
            error: airtableBillingSync.syncResult.message,
          })
        }
      }
    }

    candidate =
      journey === 'leadgen_payment_first' && session.payment_status === 'paid' && !normalizeString(session.metadata?.portal_key)
        ? null
        : getActivationCandidateFromCheckout(session)
  } else if (
    event.type === 'invoice.payment_succeeded' ||
    event.type === 'invoice.paid'
  ) {
    const invoice = event.data.object as Stripe.Invoice
    candidate = getActivationCandidateFromInvoice(invoice)

    // If this invoice was for purchasing lead credits, grant them after payment.
    if (invoice.status === 'paid') {
      const portalKey = normalizeString(invoice.metadata?.portal_key)
      const credits = parsePositiveInt(invoice.metadata?.obieo_lead_credits)
      if (portalKey && credits) {
        const invoiceUrl = normalizeString(invoice.hosted_invoice_url) || undefined
        const amountCents = typeof invoice.amount_paid === 'number' ? invoice.amount_paid : undefined

        const grant = await grantLeadCreditsFromInvoiceInConvex({
          portalKey,
          invoiceId: invoice.id,
          credits,
          amountCents,
          invoiceUrl,
        })

        if (!grant) {
          throw new Error('Failed to grant lead credits (Convex not configured or request failed)')
        }

        await recordInvoiceEventInConvex({
          portalKey,
          invoiceId: invoice.id,
          status: 'paid',
          amountCents,
          invoiceUrl,
        })

        const airtableBillingSync = await syncAirtableBillingSnapshotFromConvex({ portalKey })
        if (!airtableBillingSync.ok) {
          logStripeLeadgen('airtable_sync_after_invoice_failed', {
            eventId: event.id,
            portalKey,
            status: airtableBillingSync.status,
            error: airtableBillingSync.error,
          })
        } else if (!airtableBillingSync.syncResult.synced && airtableBillingSync.syncResult.reason !== 'not_configured') {
          logStripeLeadgen('airtable_sync_after_invoice_failed', {
            eventId: event.id,
            portalKey,
            reason: airtableBillingSync.syncResult.reason,
            error: airtableBillingSync.syncResult.message,
          })
        }
      }
    }
  }

  if (!candidate) {
    await markEventProcessed(event.id, {
      processedAt: new Date().toISOString(),
      eventType: event.type,
      handled: false,
      reason: 'Event ignored by activation workflow',
    })

    return NextResponse.json({
      success: true,
      handled: false,
      eventId: event.id,
      eventType: event.type,
    })
  }

  try {
    const activation = await activateCustomer({
      stripe,
      candidate,
    })

    await markEventProcessed(event.id, {
      processedAt: new Date().toISOString(),
      eventType: event.type,
      handled: true,
      activation,
    })

    return NextResponse.json({
      success: true,
      handled: true,
      eventId: event.id,
      eventType: event.type,
      activation,
    })
  } catch (error) {
    console.error('Stripe activation handling failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Activation workflow failed',
      },
      { status: 500 }
    )
  }
}
