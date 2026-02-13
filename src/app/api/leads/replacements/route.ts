import { NextRequest, NextResponse } from 'next/server'
import { submitLeadReplacementRequestInConvex } from '@/lib/convex'

export const runtime = 'nodejs'

type ReplacementReason =
  | 'lead_not_needed'
  | 'never_answered'
  | 'out_of_service_area'
  | 'invalid_contact_info'
  | 'already_under_contract'
  | 'wrong_service_requested'
  | 'other_quality_issue'

interface ReplacementPayload {
  portalKey?: string
  leadEventId?: string
  sourceExternalId?: string
  reason?: ReplacementReason
  contactAttemptedAt?: number | string
  contactAttemptMethod?: string
  evidenceNotes?: string
  evidenceUrls?: string[] | string
  requestedBy?: string
}

const ALLOWED_REASONS = new Set<ReplacementReason>([
  'lead_not_needed',
  'never_answered',
  'out_of_service_area',
  'invalid_contact_info',
  'already_under_contract',
  'wrong_service_requested',
  'other_quality_issue',
])

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7).trim()
}

function getApiSecret(): string | null {
  return (
    process.env.LEAD_REPLACEMENT_API_SECRET?.trim() ||
    process.env.GHL_LEAD_DELIVERED_WEBHOOK_SECRET?.trim() ||
    null
  )
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function normalizeTimestamp(value: unknown): number | undefined {
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

  return undefined
}

function normalizeStringList(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => cleanString(item))
      .filter((item): item is string => Boolean(item))
    return cleaned.length > 0 ? cleaned : undefined
  }

  if (typeof value === 'string') {
    const cleaned = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    return cleaned.length > 0 ? cleaned : undefined
  }

  return undefined
}

export async function POST(request: NextRequest) {
  const expectedSecret = getApiSecret()
  if (!expectedSecret) {
    return NextResponse.json(
      { success: false, error: 'Server misconfiguration: missing replacement API secret' },
      { status: 500 }
    )
  }

  const token = getBearerToken(request)
  if (!token || token !== expectedSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: ReplacementPayload
  try {
    body = (await request.json()) as ReplacementPayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const portalKey = cleanString(body.portalKey)
  if (!portalKey) {
    return NextResponse.json({ success: false, error: 'portalKey is required' }, { status: 400 })
  }

  const leadEventId = cleanString(body.leadEventId) || undefined
  const sourceExternalId = cleanString(body.sourceExternalId) || undefined

  if (!leadEventId && !sourceExternalId) {
    return NextResponse.json(
      { success: false, error: 'leadEventId or sourceExternalId is required' },
      { status: 400 }
    )
  }

  const reason = body.reason
  if (!reason || !ALLOWED_REASONS.has(reason)) {
    return NextResponse.json(
      {
        success: false,
        error: 'reason is required and must be a supported replacement reason',
      },
      { status: 400 }
    )
  }

  const result = await submitLeadReplacementRequestInConvex({
    portalKey,
    leadEventId,
    sourceExternalId,
    reason,
    contactAttemptedAt: normalizeTimestamp(body.contactAttemptedAt),
    contactAttemptMethod: cleanString(body.contactAttemptMethod) || undefined,
    evidenceNotes: cleanString(body.evidenceNotes) || undefined,
    evidenceUrls: normalizeStringList(body.evidenceUrls),
    requestedBy: cleanString(body.requestedBy) || undefined,
  })

  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Convex is not configured for replacement workflow' },
      { status: 500 }
    )
  }

  const autoRejected = result.status === 'auto_rejected_policy'

  return NextResponse.json({
    success: true,
    requestId: result.requestId,
    status: result.status,
    eligibleForReview: result.eligibleForReview,
    policy: result.policy,
    leadEventId: result.leadEventId,
    sourceExternalId: result.sourceExternalId,
    message: autoRejected
      ? 'Request auto-rejected by policy checks (see policy object)'
      : 'Request submitted for review',
  })
}
