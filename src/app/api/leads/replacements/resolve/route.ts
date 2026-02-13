import { NextRequest, NextResponse } from 'next/server'
import { resolveLeadReplacementRequestInConvex } from '@/lib/convex'

export const runtime = 'nodejs'

interface ResolvePayload {
  requestId?: string
  decision?: 'approve' | 'reject'
  resolutionNotes?: string
  resolvedBy?: string
}

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7).trim()
}

function getApiSecret(): string | null {
  return (
    process.env.LEAD_REPLACEMENT_ADMIN_API_SECRET?.trim() ||
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

export async function POST(request: NextRequest) {
  const expectedSecret = getApiSecret()
  if (!expectedSecret) {
    return NextResponse.json(
      { success: false, error: 'Server misconfiguration: missing replacement admin API secret' },
      { status: 500 }
    )
  }

  const token = getBearerToken(request)
  if (!token || token !== expectedSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: ResolvePayload
  try {
    body = (await request.json()) as ResolvePayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const requestId = cleanString(body.requestId)
  if (!requestId) {
    return NextResponse.json({ success: false, error: 'requestId is required' }, { status: 400 })
  }

  if (body.decision !== 'approve' && body.decision !== 'reject') {
    return NextResponse.json(
      { success: false, error: "decision must be 'approve' or 'reject'" },
      { status: 400 }
    )
  }

  const result = await resolveLeadReplacementRequestInConvex({
    requestId,
    decision: body.decision,
    resolutionNotes: cleanString(body.resolutionNotes) || undefined,
    resolvedBy: cleanString(body.resolvedBy) || undefined,
  })

  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Convex is not configured for replacement resolution' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    ...result,
  })
}
