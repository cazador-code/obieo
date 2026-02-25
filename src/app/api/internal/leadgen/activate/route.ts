import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import Stripe from 'stripe'
import { getStripeClient } from '@/lib/stripe'
import { authLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { activateCustomer, getActivationCandidateFromCheckout } from '@/lib/stripe-activation'

export const runtime = 'nodejs'
const INTERNAL_TOKEN_ISSUER = process.env.INTERNAL_TOOL_TOKEN_ISSUER?.trim() || 'obieo-internal-tool'
const INTERNAL_TOKEN_AUDIENCE = process.env.INTERNAL_TOOL_TOKEN_AUDIENCE?.trim() || 'obieo-internal-api'

type RequestBody = {
  sessionId?: unknown
  checkoutSessionId?: unknown
  forceResendInvitation?: unknown
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    const secret = getJwtSecret()
    const verified = await jwtVerify(token, secret, {
      issuer: INTERNAL_TOKEN_ISSUER,
      audience: INTERNAL_TOKEN_AUDIENCE,
      algorithms: ['HS256'],
    })
    return verified.payload.authorized === true
  } catch {
    return false
  }
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function extractCheckoutSessionId(value: unknown): string | null {
  const trimmed = cleanString(value)
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const fromQuery = url.searchParams.get('session_id') || url.searchParams.get('sessionId')
    if (fromQuery) {
      const match = fromQuery.match(/cs_(?:live|test)_[A-Za-z0-9]+/)
      return match ? match[0] : fromQuery.trim()
    }
  } catch {
    // not a URL
  }

  const match = trimmed.match(/cs_(?:live|test)_[A-Za-z0-9]+/)
  return match ? match[0] : trimmed
}

function isLeadgenStripeActive(): boolean {
  return process.env.LEADGEN_STRIPE_ACTIVE?.trim() === 'true'
}

async function retrieveCheckoutSession(
  stripe: Stripe,
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  // Not expanding payment_intent keeps this lightweight; activation relies on session metadata + customer.
  return stripe.checkout.sessions.retrieve(sessionId)
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await authLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const authorized = await verifyAuthToken(token)
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!isLeadgenStripeActive()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Stripe activation endpoint is disabled (set LEADGEN_STRIPE_ACTIVE=true to re-enable).',
      },
      { status: 409 }
    )
  }

  const stripe = getStripeClient()
  if (!stripe) {
    return NextResponse.json({ success: false, error: 'STRIPE_SECRET_KEY is not configured' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const payload = body as RequestBody & Record<string, unknown>
  const sessionId = extractCheckoutSessionId(payload.sessionId || payload.checkoutSessionId)
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 })
  }

  try {
    const session = await retrieveCheckoutSession(stripe, sessionId)
    const candidate = getActivationCandidateFromCheckout(session)
    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Checkout session is not eligible for activation (not paid or missing metadata).',
        },
        { status: 400 }
      )
    }

    const activation = await activateCustomer({
      stripe,
      candidate,
      forceResendInvitation: payload.forceResendInvitation === true,
    })
    return NextResponse.json({ success: true, activation })
  } catch (error) {
    console.error('Manual activation failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Activation failed' },
      { status: 500 }
    )
  }
}
