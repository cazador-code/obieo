import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import Whop from '@whop/sdk'
import {
  confirmLeadgenPayment,
  type LeadgenPaymentConfirmationRequest,
} from '@/lib/leadgen-payment-confirmation'
import { queueLeadgenManualReviewInConvex } from '@/lib/convex'

export const runtime = 'nodejs'

type WhopWebhookEnvelope = {
  id?: string
  action?: string
  type?: string
  company_id?: string
  api_version?: string
  data?: unknown
  [key: string]: unknown
}

type WhopPaymentData = {
  id?: string
  status?: string
  substatus?: string
  created_at?: string
  paid_at?: string
  total?: number
  currency?: string
  billing_reason?: string
  product?: {
    id?: string
    title?: string
    route?: string
  }
  user?: {
    id?: string
    name?: string | null
    username?: string | null
    email?: string | null
  }
  member?: {
    id?: string
    phone?: string | null
  }
  company?: {
    id?: string
    title?: string
    route?: string
  }
  billing_address?: {
    name?: string | null
    line1?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
  }
  metadata?: Record<string, unknown> | null
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function cleanNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return value
}

function getWhopClient(): Whop | null {
  const apiKey = process.env.WHOP_API_KEY?.trim()
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET?.trim()
  if (!apiKey || !webhookSecret) return null
  const webhookKey = Buffer.from(webhookSecret, 'utf8').toString('base64')
  return new Whop({ apiKey, webhookKey })
}

function toHeaderObject(headers: Headers): Record<string, string> {
  return Object.fromEntries(headers.entries())
}

function logWhopWebhook(event: string, details: Record<string, unknown>) {
  console.info(`[whop-webhook] ${event}`, details)
}

async function isEventAlreadyProcessed(eventId: string): Promise<boolean> {
  try {
    const value = await kv.get<string>(`billing:whop-webhook:${eventId}`)
    return Boolean(value)
  } catch (error) {
    console.error('KV read failed for Whop webhook dedupe:', error)
    return false
  }
}

async function markEventProcessed(eventId: string, payload: Record<string, unknown>): Promise<void> {
  try {
    await kv.set(`billing:whop-webhook:${eventId}`, JSON.stringify(payload), {
      ex: 60 * 60 * 24 * 120,
    })
  } catch (error) {
    console.error('KV write failed for Whop webhook dedupe:', error)
  }
}

function normalizeEventType(event: WhopWebhookEnvelope): string {
  const raw = cleanString(event.type) || cleanString(event.action) || 'unknown'
  return raw.replace(/_/g, '.')
}

function metadataString(metadata: Record<string, unknown> | null | undefined, ...keys: string[]): string | null {
  if (!metadata) return null
  for (const key of keys) {
    const value = cleanString(metadata[key])
    if (value) return value
  }
  return null
}

function metadataPositiveInt(metadata: Record<string, unknown> | null | undefined, ...keys: string[]): number | null {
  if (!metadata) return null
  for (const key of keys) {
    const raw = metadata[key]
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      const normalized = Math.floor(raw)
      if (normalized > 0) return normalized
    }
    if (typeof raw === 'string') {
      const parsed = Number(raw)
      if (!Number.isFinite(parsed)) continue
      const normalized = Math.floor(parsed)
      if (normalized > 0) return normalized
    }
  }
  return null
}

function extractLeadCount(...values: Array<string | null | undefined>): number | null {
  for (const value of values) {
    if (!value) continue
    const match = value.match(/(?:^|\b)(\d{1,3})(?=\s*(?:[a-z-]+\s*){0,6}leads?\b)/i)
    if (!match) continue
    const parsed = Number(match[1])
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return null
}

function looksDeferredBilling(...values: Array<string | null | undefined>): boolean {
  return values.some((value) =>
    typeof value === 'string' &&
    /(upfront|deposit|per[- ]lead|then billed|billed every|verification|first lead|commitment)/i.test(value)
  )
}

function humanizeSlug(value: string | null): string | null {
  if (!value) return null
  const cleaned = value
    .replace(/[_-]+/g, ' ')
    .replace(/\d+/g, ' ')
    .trim()
  if (!cleaned) return null
  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function bestEffortCompanyName(payment: WhopPaymentData): string | null {
  const metadata = payment.metadata || null
  return (
    metadataString(metadata, 'company_name', 'companyName', 'business_name', 'businessName') ||
    cleanString(payment.billing_address?.name) ||
    cleanString(payment.user?.name) ||
    humanizeSlug(cleanString(payment.user?.username)) ||
    humanizeSlug(cleanString(payment.user?.email)?.split('@')[0] || null)
  )
}

function toAmountCents(total: number | null): number | null {
  if (total === null) return null
  const cents = Math.round(total * 100)
  return cents > 0 ? cents : null
}

function buildWhopPaymentConfirmationRequest(
  payment: WhopPaymentData
): { ok: true; input: LeadgenPaymentConfirmationRequest } | { ok: false; reason: string } {
  const metadata = payment.metadata || null
  const billingEmail = cleanString(payment.user?.email)?.toLowerCase() || null
  if (!billingEmail) {
    return { ok: false, reason: 'Whop payment is missing user.email' }
  }

  const paymentReference = cleanString(payment.id)
  if (!paymentReference) {
    return { ok: false, reason: 'Whop payment is missing data.id' }
  }

  const companyName = bestEffortCompanyName(payment)
  if (!companyName) {
    return { ok: false, reason: 'Whop payment is missing a usable company name signal' }
  }

  const portalKey =
    metadataString(metadata, 'portal_key', 'portalKey', 'existing_portal_key', 'existingPortalKey') || undefined
  const billingName = cleanString(payment.billing_address?.name) || cleanString(payment.user?.name) || undefined
  const billingModel = metadataString(metadata, 'billing_model', 'billingModel') || 'package_40_paid_in_full'
  const prepaidLeadCredits = metadataPositiveInt(metadata, 'prepaid_leads', 'prepaidLeadCredits', 'included_leads', 'includedLeads')
  const leadCommitmentTotal = metadataPositiveInt(
    metadata,
    'lead_commitment_total',
    'leadCommitmentTotal',
    'commitment_leads',
    'commitmentLeads'
  )
  const initialChargeCentsMetadata = metadataPositiveInt(
    metadata,
    'initial_charge_cents',
    'initialChargeCents',
    'amount_cents',
    'amountCents'
  )
  const leadUnitPriceCentsMetadata = metadataPositiveInt(
    metadata,
    'lead_unit_price_cents',
    'leadUnitPriceCents',
    'unit_price_cents',
    'unitPriceCents'
  )

  if (
    prepaidLeadCredits !== null ||
    leadCommitmentTotal !== null ||
    initialChargeCentsMetadata !== null ||
    leadUnitPriceCentsMetadata !== null
  ) {
    return {
      ok: true,
      input: {
        portalKey,
        companyName,
        billingEmail,
        billingName,
        billingModel,
        paymentProvider: 'whop',
        paymentReference,
        source: 'whop-webhook',
        prepaidLeadCredits: prepaidLeadCredits ?? undefined,
        leadCommitmentTotal: leadCommitmentTotal ?? undefined,
        initialChargeCents: initialChargeCentsMetadata ?? undefined,
        leadUnitPriceCents: leadUnitPriceCentsMetadata ?? undefined,
      },
    }
  }

  if (cleanString(payment.billing_reason) && cleanString(payment.billing_reason) !== 'one_time') {
    return { ok: false, reason: `Unsupported Whop billing_reason=${payment.billing_reason}` }
  }

  const productTitle = cleanString(payment.product?.title)
  const productRoute = cleanString(payment.product?.route)
  if (looksDeferredBilling(productTitle, productRoute)) {
    return { ok: false, reason: 'Product title/route looks like deferred or pay-per-lead billing' }
  }

  const leadCount = extractLeadCount(productTitle, productRoute)
  if (!leadCount) {
    return { ok: false, reason: 'Could not infer lead count from Whop product title/route' }
  }

  const amountCents = toAmountCents(cleanNumber(payment.total))
  if (!amountCents) {
    return { ok: false, reason: 'Whop payment is missing a valid total amount' }
  }

  const leadUnitPriceCents = Math.max(100, Math.round(amountCents / leadCount))
  if (leadUnitPriceCents < 2500) {
    return {
      ok: false,
      reason: `Amount per lead (${leadUnitPriceCents} cents) looks like a deposit or non-prepaid package`,
    }
  }

  return {
    ok: true,
    input: {
      portalKey,
      companyName,
      billingEmail,
      billingName,
      billingModel: 'package_40_paid_in_full',
      paymentProvider: 'whop',
      paymentReference,
      source: 'whop-webhook',
      prepaidLeadCredits: leadCount,
      leadCommitmentTotal: leadCount,
      initialChargeCents: amountCents,
      leadUnitPriceCents,
    },
  }
}

async function queueWhopManualReview(input: {
  eventId?: string | null
  action: string
  companyName?: string | null
  billingEmail?: string | null
  portalKey?: string | null
  reason: string
  payloadJson: string
}): Promise<boolean> {
  const paymentEventId = `whop:${input.eventId || crypto.randomUUID()}`
  const queued = await queueLeadgenManualReviewInConvex({
    paymentEventId,
    portalKey: input.portalKey || undefined,
    companyName: input.companyName || undefined,
    billingEmail: input.billingEmail || undefined,
    reason: 'missing_stable_client_identifier',
    details: `[Whop ${input.action}] ${input.reason}`,
    payloadJson: input.payloadJson,
  })
  return Boolean(queued?.queued)
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    webhook: 'whop',
    endpoint: '/api/webhooks/whop',
  })
}

export async function POST(request: NextRequest) {
  const client = getWhopClient()
  if (!client) {
    return NextResponse.json(
      { success: false, error: 'WHOP_API_KEY or WHOP_WEBHOOK_SECRET is not configured' },
      { status: 500 }
    )
  }

  const rawBody = await request.text()

  let event: WhopWebhookEnvelope
  try {
    event = client.webhooks.unwrap(rawBody, {
      headers: toHeaderObject(request.headers),
    }) as unknown as WhopWebhookEnvelope
  } catch (error) {
    console.error('Whop webhook signature verification failed:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid Whop webhook signature' },
      { status: 400 }
    )
  }

  const eventId = cleanString(event.id)
  const action = normalizeEventType(event)
  const companyId = cleanString(event.company_id)
  const apiVersion = cleanString(event.api_version)
  const expectedCompanyId = cleanString(process.env.WHOP_COMPANY_ID)

  if (expectedCompanyId && companyId && expectedCompanyId !== companyId) {
    logWhopWebhook('ignored_wrong_company', {
      eventId,
      action,
      companyId,
      expectedCompanyId,
    })
    return NextResponse.json({
      success: true,
      ignored: true,
      reason: 'wrong_company',
      eventId,
      action,
    })
  }

  if (eventId && (await isEventAlreadyProcessed(eventId))) {
    return NextResponse.json({
      success: true,
      duplicate: true,
      eventId,
      action,
    })
  }

  const expectedApiVersion = cleanString(process.env.WHOP_WEBHOOK_API_VERSION) || 'v1'
  if (apiVersion && apiVersion.toLowerCase() !== expectedApiVersion.toLowerCase()) {
    logWhopWebhook('unexpected_api_version', {
      eventId,
      action,
      apiVersion,
      expectedApiVersion,
    })
  }

  logWhopWebhook('received', {
    eventId,
    action,
    companyId,
    apiVersion,
  })

  if (action === 'payment.succeeded') {
    const payment = (event.data || {}) as WhopPaymentData
    const mapped = buildWhopPaymentConfirmationRequest(payment)

    if (!mapped.ok) {
      const manualReviewQueued = await queueWhopManualReview({
        eventId,
        action,
        companyName: bestEffortCompanyName(payment),
        billingEmail: cleanString(payment.user?.email)?.toLowerCase() || null,
        portalKey: metadataString(payment.metadata || null, 'portal_key', 'portalKey'),
        reason: mapped.reason,
        payloadJson: rawBody,
      })

      if (!manualReviewQueued) {
        return NextResponse.json(
          { success: false, error: `Failed to queue Whop manual review: ${mapped.reason}` },
          { status: 500 }
        )
      }

      if (eventId) {
        await markEventProcessed(eventId, {
          action,
          companyId,
          apiVersion,
          handled: 'manual_review',
          reason: mapped.reason,
          receivedAt: Date.now(),
        })
      }

      return NextResponse.json({
        success: true,
        received: true,
        eventId,
        action,
        manualReviewRequired: true,
        reason: mapped.reason,
      })
    }

    const confirmation = await confirmLeadgenPayment(mapped.input)
    if (!confirmation.body.success) {
      if (confirmation.status >= 500) {
        return NextResponse.json(
          {
            success: false,
            error: confirmation.body.error,
            eventId,
            action,
          },
          { status: 500 }
        )
      }

      if (eventId) {
        await markEventProcessed(eventId, {
          action,
          companyId,
          apiVersion,
          handled: confirmation.body.manualReviewRequired ? 'manual_review' : 'rejected',
          reason: confirmation.body.error,
          receivedAt: Date.now(),
        })
      }

      return NextResponse.json({
        success: true,
        received: true,
        eventId,
        action,
        manualReviewRequired: confirmation.body.manualReviewRequired === true,
        reason: confirmation.body.error,
      })
    }

    if (eventId) {
      await markEventProcessed(eventId, {
        action,
        companyId,
        apiVersion,
        handled: 'payment_confirmed',
        portalKey: confirmation.body.portalKey,
        purchaseRecorded: confirmation.body.purchaseRecorded,
        receivedAt: Date.now(),
      })
    }

    return NextResponse.json({
      success: true,
      received: true,
      eventId,
      action,
      portalKey: confirmation.body.portalKey,
      purchaseRecorded: confirmation.body.purchaseRecorded,
      onboardingUrl: confirmation.body.onboardingUrl,
    })
  }

  if (eventId) {
    await markEventProcessed(eventId, {
      action,
      companyId,
      apiVersion,
      receivedAt: Date.now(),
    })
  }

  return NextResponse.json({
    success: true,
    received: true,
    eventId,
    action,
  })
}
