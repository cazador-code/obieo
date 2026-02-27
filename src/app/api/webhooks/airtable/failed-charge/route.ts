import { NextRequest, NextResponse } from 'next/server'
import { linkFailedChargeRecordToClient } from '@/lib/airtable-client-links'
import { getClientIp, rateLimitResponse, webhookLimiter } from '@/lib/rate-limit'

export const runtime = 'nodejs'

interface AirtableFailedChargePayload {
  recordId?: string
  record_id?: string
  failedChargeRecordId?: string
  failed_charge_record_id?: string
  portalKey?: string
  portal_key?: string
  clientKey?: string
  client_key?: string
  businessName?: string
  business_name?: string
  clientCompany?: string
  client_company?: string
  name?: string
  email?: string
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned || null
}

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7).trim()
  return token || null
}

function resolveRecordId(payload: AirtableFailedChargePayload): string | null {
  const candidates = [
    payload.recordId,
    payload.record_id,
    payload.failedChargeRecordId,
    payload.failed_charge_record_id,
  ]

  for (const candidate of candidates) {
    const normalized = normalizeString(candidate)
    if (normalized) return normalized
  }

  return null
}

function mapResultToStatus(reason?: string): number {
  if (reason === 'invalid_record_id') return 400
  if (reason === 'client_not_found') return 404
  if (reason === 'client_ambiguous') return 409
  if (reason === 'not_configured') return 503
  return 502
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await webhookLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  const webhookSecret =
    process.env.AIRTABLE_FAILED_CHARGE_WEBHOOK_SECRET?.trim() ||
    process.env.AIRTABLE_LEAD_DELIVERED_WEBHOOK_SECRET?.trim()

  if (!webhookSecret) {
    return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 })
  }

  const token = getBearerToken(request)
  if (!token || token !== webhookSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let payload: AirtableFailedChargePayload
  try {
    payload = (await request.json()) as AirtableFailedChargePayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const recordId = resolveRecordId(payload)
  if (!recordId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing failed-charge record ID',
        hint: 'Pass recordId (or failedChargeRecordId) from Airtable automation payload.',
      },
      { status: 400 }
    )
  }

  const portalKey =
    normalizeString(payload.portalKey) ||
    normalizeString(payload.portal_key) ||
    normalizeString(payload.clientKey) ||
    normalizeString(payload.client_key) ||
    undefined
  const businessName =
    normalizeString(payload.businessName) ||
    normalizeString(payload.business_name) ||
    normalizeString(payload.clientCompany) ||
    normalizeString(payload.client_company) ||
    normalizeString(payload.name) ||
    undefined
  const email = normalizeString(payload.email) || undefined

  const linkResult = await linkFailedChargeRecordToClient({
    recordId,
    portalKey,
    businessName,
    email,
  })

  if (!linkResult.linked) {
    return NextResponse.json(
      {
        success: false,
        error: linkResult.message || 'Could not link failed charge to client row.',
        reason: linkResult.reason,
        recordId,
      },
      { status: mapResultToStatus(linkResult.reason) }
    )
  }

  return NextResponse.json({
    success: true,
    recordId,
    linkedClientRecordId: linkResult.clientRecordId,
    linkResult,
  })
}
