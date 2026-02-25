import { NextRequest, NextResponse } from 'next/server'
import { resolveZipChangeRequestInConvex } from '@/lib/convex'

export const runtime = 'nodejs'

function verifyBasicAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Basic ')) return false

  const expected = process.env.INTERNAL_API_BASIC_AUTH
  if (!expected) return true // No auth configured = allow (dev only)

  try {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString()
    return decoded === expected
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  if (!verifyBasicAuth(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { requestId?: unknown; decision?: unknown; resolutionNotes?: unknown; resolvedBy?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body.requestId !== 'string' || !body.requestId.trim()) {
    return NextResponse.json({ success: false, error: 'requestId is required' }, { status: 400 })
  }

  if (body.decision !== 'approve' && body.decision !== 'reject') {
    return NextResponse.json({ success: false, error: 'decision must be "approve" or "reject"' }, { status: 400 })
  }

  if (body.decision === 'reject' && (typeof body.resolutionNotes !== 'string' || !body.resolutionNotes.trim())) {
    return NextResponse.json({ success: false, error: 'resolutionNotes required when rejecting' }, { status: 400 })
  }

  try {
    const result = await resolveZipChangeRequestInConvex({
      requestId: body.requestId.trim(),
      decision: body.decision,
      resolutionNotes: typeof body.resolutionNotes === 'string' ? body.resolutionNotes.trim().slice(0, 1000) : undefined,
      resolvedBy: typeof body.resolvedBy === 'string' ? body.resolvedBy.trim() : 'admin',
    })

    if (!result) {
      return NextResponse.json({ success: false, error: 'Could not resolve request.' }, { status: 500 })
    }

    if (!result.updated) {
      return NextResponse.json({ success: false, error: result.reason || 'Request already resolved.' }, { status: 400 })
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to resolve request.'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
