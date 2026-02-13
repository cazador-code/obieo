import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { kv } from '@vercel/kv'
import { getStripeClient } from '@/lib/stripe'
import {
  activateCustomer,
  getActivationCandidateFromCheckout,
  getActivationCandidateFromInvoice,
  type ActivationCandidate,
} from '@/lib/stripe-activation'
import { grantLeadCreditsFromInvoiceInConvex, recordInvoiceEventInConvex } from '@/lib/convex'

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
    candidate = getActivationCandidateFromCheckout(
      event.data.object as Stripe.Checkout.Session
    )
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
