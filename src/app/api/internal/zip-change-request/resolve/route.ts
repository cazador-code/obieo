import { NextRequest, NextResponse } from 'next/server'
import { resolveZipChangeRequestInConvex } from '@/lib/convex'

export const runtime = 'nodejs'

function unauthorizedResponse(): NextResponse {
  return new NextResponse('Authorization required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Obieo Internal", charset="UTF-8"',
    },
  })
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

function decodeBasicAuthHeader(value: string): { user: string; pass: string } | null {
  const [scheme, encoded] = value.split(' ')
  if (scheme !== 'Basic' || !encoded) return null

  let decoded = ''
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8')
  } catch {
    return null
  }

  const idx = decoded.indexOf(':')
  if (idx < 0) return null

  const user = decoded.slice(0, idx).trim()
  const pass = decoded.slice(idx + 1)
  if (!user || !pass) return null

  return { user, pass }
}

function requireInternalBasicAuth(
  request: NextRequest
): { ok: true; user: string } | { ok: false; response: NextResponse } {
  const expectedUser = process.env.INTERNAL_LEADGEN_BASIC_AUTH_USER || ''
  const expectedPass = process.env.INTERNAL_LEADGEN_BASIC_AUTH_PASS || ''
  if (!expectedUser || !expectedPass) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Internal tools auth is not configured.' },
        { status: 503 }
      ),
    }
  }

  const creds = decodeBasicAuthHeader(request.headers.get('authorization') || '')
  if (!creds) {
    return { ok: false, response: unauthorizedResponse() }
  }

  const ok =
    timingSafeEqual(creds.user, expectedUser) &&
    timingSafeEqual(creds.pass, expectedPass)
  if (!ok) {
    return { ok: false, response: unauthorizedResponse() }
  }

  return { ok: true, user: creds.user }
}

export async function POST(request: NextRequest) {
  const authResult = requireInternalBasicAuth(request)
  if (!authResult.ok) {
    return authResult.response
  }

  let body: { requestId?: unknown; decision?: unknown; resolutionNotes?: unknown }
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
      resolvedBy: authResult.user,
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
