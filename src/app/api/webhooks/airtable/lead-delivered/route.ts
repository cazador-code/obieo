import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { recordLeadDeliveryInConvex } from '@/lib/convex'
import { linkLeadSheetRecordToClient } from '@/lib/airtable-client-links'
import { getClientIp, rateLimitResponse, webhookLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

interface AirtableLeadDeliveredPayload {
  idempotencyKey?: string
  eventId?: string
  leadId?: string
  leadSheetRecordId?: string
  lead_sheet_record_id?: string
  sourceExternalId?: string
  source_external_id?: string
  recordId?: string
  record_id?: string
  portalKey?: string
  portal_key?: string
  clientKey?: string
  client_key?: string
  quantity?: number
  deliveredAt?: string | number
  source?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7).trim()
  return token || null
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned || null
}

function toUnixTimestampMs(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1_000_000_000_000 ? Math.floor(value) : Math.floor(value * 1000)
  }

  if (typeof value === 'string' && value.trim()) {
    const asNumber = Number(value)
    if (Number.isFinite(asNumber)) {
      return asNumber > 1_000_000_000_000 ? Math.floor(asNumber) : Math.floor(asNumber * 1000)
    }
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  return Date.now()
}

function normalizePositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  const intVal = Math.floor(value)
  return intVal > 0 ? intVal : fallback
}

function hashPayload(payload: AirtableLeadDeliveredPayload): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

function resolveIdempotencyKey(payload: AirtableLeadDeliveredPayload): string {
  const candidates = [
    payload.idempotencyKey,
    payload.eventId,
    payload.leadId,
    payload.sourceExternalId,
    payload.source_external_id,
    payload.recordId,
    payload.record_id,
  ]

  for (const candidate of candidates) {
    const normalized = normalizeString(candidate)
    if (normalized) return normalized
  }

  return hashPayload(payload)
}

function resolveSourceExternalId(payload: AirtableLeadDeliveredPayload): string {
  const candidates = [
    payload.sourceExternalId,
    payload.source_external_id,
    payload.leadId,
    payload.recordId,
    payload.record_id,
    payload.eventId,
  ]

  for (const candidate of candidates) {
    const normalized = normalizeString(candidate)
    if (normalized) return normalized
  }

  return `airtable:${hashPayload(payload)}`
}

function resolveAirtableRecordId(payload: AirtableLeadDeliveredPayload): string | null {
  const candidates = [payload.leadSheetRecordId, payload.lead_sheet_record_id, payload.recordId, payload.record_id]

  for (const candidate of candidates) {
    const normalized = normalizeString(candidate)
    if (normalized) return normalized
  }

  return null
}

function resolvePortalKey(payload: AirtableLeadDeliveredPayload): string | null {
  const direct = [
    payload.portalKey,
    payload.portal_key,
    payload.clientKey,
    payload.client_key,
  ]
    .map((value) => normalizeString(value))
    .find(Boolean)
  return direct || null
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await webhookLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  const webhookSecret = process.env.AIRTABLE_LEAD_DELIVERED_WEBHOOK_SECRET
  if (!webhookSecret?.trim()) {
    return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 })
  }

  const token = getBearerToken(request)
  if (!token || token !== webhookSecret.trim()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let payload: AirtableLeadDeliveredPayload
  try {
    payload = (await request.json()) as AirtableLeadDeliveredPayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const portalKey = resolvePortalKey(payload)
  if (!portalKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to resolve portalKey',
        hint:
          'Pass portalKey (or clientKey) in payload. Lead delivery now fails closed when stable client identity is missing.',
      },
      { status: 400 }
    )
  }

  const idempotencyKey = resolveIdempotencyKey(payload)
  const sourceExternalId = resolveSourceExternalId(payload)
  const quantity = normalizePositiveInteger(payload.quantity, 1)
  const deliveredAt = toUnixTimestampMs(payload.deliveredAt)
  const dedupeKey = `lead-delivered:airtable:${idempotencyKey}`

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
    console.error('KV read failed in Airtable lead webhook:', error)
  }

  const convexResult = await recordLeadDeliveryInConvex({
    portalKey,
    sourceExternalId,
    idempotencyKey,
    deliveredAt,
    quantity,
    source: normalizeString(payload.source) || 'airtable',
    name: normalizeString(payload.name) || undefined,
    email: normalizeString(payload.email) || undefined,
    phone: normalizeString(payload.phone) || undefined,
    address: normalizeString(payload.address) || undefined,
    city: normalizeString(payload.city) || undefined,
    state: normalizeString(payload.state) || undefined,
    zip: normalizeString(payload.zip) || undefined,
  })

  if (!convexResult) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to write lead to portal store',
        hint: 'Check CONVEX_URL and CONVEX_AUTH_ADAPTER_SECRET.',
      },
      { status: 502 }
    )
  }

  const leadSheetRecordId = resolveAirtableRecordId(payload)
  let leadSheetLink: Awaited<ReturnType<typeof linkLeadSheetRecordToClient>> | null = null

  if (leadSheetRecordId) {
    leadSheetLink = await linkLeadSheetRecordToClient({
      recordId: leadSheetRecordId,
      portalKey,
    })

    if (!leadSheetLink.linked && leadSheetLink.reason !== 'client_not_found') {
      console.error('Airtable lead-sheet link sync failed:', leadSheetLink)
    }
  }

  try {
    await kv.set(
      dedupeKey,
      JSON.stringify({
        processedAt: new Date().toISOString(),
        portalKey,
        sourceExternalId,
        leadEventId: convexResult.leadEventId,
        duplicate: convexResult.duplicate,
      }),
      { ex: 60 * 60 * 24 * 120 }
    )
  } catch (error) {
    console.error('KV write failed in Airtable lead webhook:', error)
  }

  return NextResponse.json({
    success: true,
    duplicate: convexResult.duplicate,
    idempotencyKey,
    portalKey,
    sourceExternalId,
    leadEventId: convexResult.leadEventId,
    billableQuantity: convexResult.billableQuantity,
    billingSkippedReason: convexResult.billingSkippedReason || null,
    leadSheetLink,
  })
}
