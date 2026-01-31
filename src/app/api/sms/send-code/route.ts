import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { kv } from '@vercel/kv'
import { smsSendLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await smsSendLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  try {
    const { phone } = await request.json()
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const normalized = normalizePhone(phone)
    if (!/^\+1\d{10}$/.test(normalized)) {
      return NextResponse.json({ error: 'Please enter a valid US phone number' }, { status: 400 })
    }

    // Per-phone rate limit: 3 per hour via KV
    const phoneKey = `sms:phone:${normalized}`
    const phoneCount = await kv.get<number>(phoneKey)
    if (phoneCount !== null && phoneCount >= 3) {
      return NextResponse.json(
        { error: 'Too many codes sent to this number. Try again later.' },
        { status: 429 }
      )
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID

    if (!accountSid || !authToken || !verifySid) {
      console.error('Twilio credentials not configured')
      return NextResponse.json({ error: 'SMS service not configured' }, { status: 500 })
    }

    const client = twilio(accountSid, authToken)
    await client.verify.v2.services(verifySid).verifications.create({
      to: normalized,
      channel: 'sms',
    })

    // Increment per-phone counter (TTL 1 hour)
    if (phoneCount === null) {
      await kv.set(phoneKey, 1, { ex: 3600 })
    } else {
      await kv.incr(phoneKey)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('SMS send error:', message, error)
    return NextResponse.json(
      { error: 'Failed to send verification code. Please try again.', debug: message },
      { status: 500 }
    )
  }
}
