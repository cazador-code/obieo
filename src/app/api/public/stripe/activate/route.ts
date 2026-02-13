import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/lib/stripe'
import { authLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { activateCustomer, getActivationCandidateFromCheckout } from '@/lib/stripe-activation'

export const runtime = 'nodejs'

function extractCheckoutSessionId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null

  // Accept full URLs as input (helpful for support/debugging).
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

async function retrieveCheckoutSession(stripe: Stripe, sessionId: string): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId)
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await authLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  const stripe = getStripeClient()
  if (!stripe) {
    return NextResponse.json({ success: false, error: 'Stripe is not configured' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const sessionId = extractCheckoutSessionId(payload.sessionId || payload.checkoutSessionId)
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 })
  }

  try {
    const session = await retrieveCheckoutSession(stripe, sessionId)
    const candidate = getActivationCandidateFromCheckout(session)
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Checkout session is not eligible for activation.' },
        { status: 400 }
      )
    }

    const activation = await activateCustomer({ stripe, candidate })
    return NextResponse.json({ success: true, activation })
  } catch (error) {
    console.error('Public activation failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Activation failed' },
      { status: 500 }
    )
  }
}
