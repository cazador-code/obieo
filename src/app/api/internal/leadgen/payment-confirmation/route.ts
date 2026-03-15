import { NextRequest, NextResponse } from 'next/server'
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import {
  confirmLeadgenPayment,
  type LeadgenPaymentConfirmationRequest,
} from '@/lib/leadgen-payment-confirmation'

export const runtime = 'nodejs'

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
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
  return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) }
}

function requireBasicAuthInProd(request: NextRequest): NextResponse | null {
  const isProd = process.env.VERCEL_ENV === 'production'
  if (!isProd) return null

  const expectedUser = process.env.INTERNAL_LEADGEN_BASIC_AUTH_USER || ''
  const expectedPass = process.env.INTERNAL_LEADGEN_BASIC_AUTH_PASS || ''
  if (!expectedUser || !expectedPass) {
    return NextResponse.json(
      { success: false, error: 'Internal leadgen auth is not configured.' },
      { status: 503 }
    )
  }

  const creds = decodeBasicAuthHeader(request.headers.get('authorization') || '')
  if (!creds) {
    return new NextResponse('Authorization required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Obieo Internal", charset="UTF-8"' },
    })
  }

  const ok = timingSafeEqual(creds.user, expectedUser) && timingSafeEqual(creds.pass, expectedPass)
  if (!ok) {
    return new NextResponse('Authorization required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Obieo Internal", charset="UTF-8"' },
    })
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const authResponse = requireBasicAuthInProd(request)
    if (authResponse) return authResponse

    const ip = getClientIp(request)
    const { success, remaining } = await auditLimiter.limit(ip)
    if (!success) {
      return rateLimitResponse(remaining)
    }

    if (process.env.LEADGEN_PAYMENT_FIRST_ENABLED?.trim() !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Leadgen payment-first flow is disabled.' },
        { status: 403 }
      )
    }

    let body: LeadgenPaymentConfirmationRequest
    try {
      body = (await request.json()) as LeadgenPaymentConfirmationRequest
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const result = await confirmLeadgenPayment(body)
    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Internal payment confirmation failed:', msg)
    return NextResponse.json({ success: false, error: `Server error: ${msg}` }, { status: 500 })
  }
}
