import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { resolveLeadBillingSubscriptionItemId } from '@/lib/lead-billing'
import { markLeadUsageRecordedInConvex, recordLeadDeliveryInConvex } from '@/lib/convex'
import { getStripeClient } from '@/lib/stripe'

export const runtime = 'nodejs'

interface LeadDeliveredPayload {
  eventId?: string
  idempotencyKey?: string
  leadId?: string
  sourceExternalId?: string
  source_external_id?: string
  quantity?: number
  deliveredAt?: string | number
  source?: string
  portalKey?: string
  portal_key?: string
  clientKey?: string
  clientEmail?: string
  clientCompany?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  stripeSubscriptionItemId?: string
}

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    return null
  }
  return auth.slice(7).trim()
}

function normalizePositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }
  const intVal = Math.floor(value)
  if (intVal < 1) return fallback
  return intVal
}

function toUnixTimestampSeconds(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Accept either seconds or milliseconds.
    return value > 1_000_000_000_000 ? Math.floor(value / 1000) : Math.floor(value)
  }
  if (typeof value === 'string' && value.trim()) {
    const asNumber = Number(value)
    if (Number.isFinite(asNumber)) {
      return asNumber > 1_000_000_000_000 ? Math.floor(asNumber / 1000) : Math.floor(asNumber)
    }

    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) {
      return Math.floor(parsed / 1000)
    }
  }
  return Math.floor(Date.now() / 1000)
}

function hashPayload(payload: LeadDeliveredPayload): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

function resolveIdempotencyKey(payload: LeadDeliveredPayload): string | null {
  const candidates = [
    payload.idempotencyKey,
    payload.eventId,
    payload.leadId,
    payload.sourceExternalId,
    payload.source_external_id,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  return null
}

function resolveSubscriptionItemId(payload: LeadDeliveredPayload): string | null {
  if (payload.stripeSubscriptionItemId?.trim()) {
    return payload.stripeSubscriptionItemId.trim()
  }

  return resolveLeadBillingSubscriptionItemId({
    clientKey: payload.clientKey || payload.portalKey || payload.portal_key,
    clientEmail: payload.clientEmail,
    clientCompany: payload.clientCompany,
  })
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned || null
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.GHL_LEAD_DELIVERED_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      { success: false, error: 'Server misconfiguration' },
      { status: 500 }
    )
  }

  const token = getBearerToken(request)
  if (!token || token !== webhookSecret) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  let payload: LeadDeliveredPayload
  try {
    payload = (await request.json()) as LeadDeliveredPayload
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const idempotencyKey = resolveIdempotencyKey(payload) ?? hashPayload(payload)
  const dedupeKey = `billing:lead-delivered:${idempotencyKey}`

  // Best-effort duplicate prevention for provider retries.
  try {
    const existing = await kv.get<string>(dedupeKey)
    if (existing) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        idempotencyKey,
        message: 'Event already processed',
      })
    }
  } catch (error) {
    console.error('KV read failed in lead-delivered webhook:', error)
  }

  const stripe = getStripeClient()
  if (!stripe) {
    return NextResponse.json(
      { success: false, error: 'STRIPE_SECRET_KEY is not configured' },
      { status: 500 }
    )
  }

  const quantity = normalizePositiveInteger(payload.quantity, 1)
  let billableQuantity = quantity
  const timestamp = toUnixTimestampSeconds(payload.deliveredAt)
  const portalKey =
    normalizeString(payload.portal_key) ||
    normalizeString(payload.portalKey) ||
    normalizeString(payload.clientKey)
  const sourceExternalId =
    normalizeString(payload.source_external_id) ||
    normalizeString(payload.sourceExternalId) ||
    normalizeString(payload.leadId) ||
    normalizeString(payload.eventId)

  let convexLeadEventId: string | null = null
  let convexSubscriptionItemId: string | null = null
  let convexDuplicateUsageRecorded = false

  if (portalKey && sourceExternalId) {
    const convexResult = await recordLeadDeliveryInConvex({
      portalKey,
      sourceExternalId,
      idempotencyKey,
      deliveredAt: timestamp * 1000,
      quantity,
      source: normalizeString(payload.source) || 'ghl',
      name: normalizeString(payload.name) || undefined,
      email: normalizeString(payload.email) || undefined,
      phone: normalizeString(payload.phone) || undefined,
      address: normalizeString(payload.address) || undefined,
      city: normalizeString(payload.city) || undefined,
      state: normalizeString(payload.state) || undefined,
      zip: normalizeString(payload.zip) || undefined,
      stripeSubscriptionItemId: normalizeString(payload.stripeSubscriptionItemId) || undefined,
    })

    if (convexResult) {
      convexLeadEventId = convexResult.leadEventId
      convexSubscriptionItemId = convexResult.stripeSubscriptionItemId
      billableQuantity = convexResult.billableQuantity
      convexDuplicateUsageRecorded = convexResult.duplicate && convexResult.stripeUsageRecorded
    }
  }

  if (convexDuplicateUsageRecorded) {
    return NextResponse.json({
      success: true,
      duplicate: true,
      idempotencyKey,
      message: 'Lead already recorded and billed',
      convexLeadEventId,
    })
  }

  try {
    if (billableQuantity <= 0) {
      try {
        await kv.set(
          dedupeKey,
          JSON.stringify({
            processedAt: new Date().toISOString(),
            quantity,
            billableQuantity: 0,
            reason: 'prepaid_or_commitment',
          }),
          { ex: 60 * 60 * 24 * 120 }
        )
      } catch (error) {
        console.error('KV write failed in lead-delivered webhook:', error)
      }

      return NextResponse.json({
        success: true,
        duplicate: false,
        idempotencyKey,
        usageRecordId: null,
        quantity,
        billableQuantity: 0,
        subscriptionItemId: null,
        convexLeadEventId,
      })
    }

    const resolvedSubscriptionItemId = resolveSubscriptionItemId(payload) || convexSubscriptionItemId
    if (!resolvedSubscriptionItemId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Stripe subscription item',
          hint: 'Provide stripeSubscriptionItemId, configure STRIPE_LEAD_BILLING_MAP_JSON, or store in Convex org',
        },
        { status: 400 }
      )
    }

    // `subscriptionItems.createUsageRecord` was removed in stripe-node v18+ (API version 2025-03-31+).
    // We still use legacy usage records, so we send a raw request against the older endpoint.
    const usageRecordResponse = await stripe.rawRequest(
      'POST',
      `/v1/subscription_items/${resolvedSubscriptionItemId}/usage_records`,
      {
        quantity: billableQuantity,
        timestamp,
        action: 'increment',
      },
      {
        idempotencyKey: `lead-delivered:${idempotencyKey}`,
      }
    )

    const usageRecord = usageRecordResponse as unknown as { id?: unknown }
    if (!usageRecord || typeof usageRecord.id !== 'string') {
      throw new Error('Stripe usage record response is missing an id')
    }

    try {
      await kv.set(
        dedupeKey,
        JSON.stringify({
          processedAt: new Date().toISOString(),
          usageRecordId: usageRecord.id,
          quantity,
          billableQuantity,
          subscriptionItemId: resolvedSubscriptionItemId,
        }),
        { ex: 60 * 60 * 24 * 120 }
      )
    } catch (error) {
      console.error('KV write failed in lead-delivered webhook:', error)
    }

    if (convexLeadEventId) {
      await markLeadUsageRecordedInConvex({
        leadEventId: convexLeadEventId,
        stripeUsageRecordId: usageRecord.id,
        stripeSubscriptionItemId: resolvedSubscriptionItemId,
      })
    }

    return NextResponse.json({
      success: true,
      duplicate: false,
      idempotencyKey,
      usageRecordId: usageRecord.id,
      quantity,
      billableQuantity,
      subscriptionItemId: resolvedSubscriptionItemId,
      convexLeadEventId,
    })
  } catch (error) {
    console.error('Failed to record Stripe lead usage:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record usage in Stripe',
      },
      { status: 500 }
    )
  }
}
