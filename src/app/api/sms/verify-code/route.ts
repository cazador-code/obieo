import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { smsVerifyLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await smsVerifyLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  try {
    const { phone, code } = await request.json()
    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 })
    }

    if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID

    if (!accountSid || !authToken || !verifySid) {
      console.error('Twilio credentials not configured')
      return NextResponse.json({ error: 'SMS service not configured' }, { status: 500 })
    }

    const normalized = normalizePhone(phone)
    const client = twilio(accountSid, authToken)

    const check = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: normalized, code })

    if (check.status === 'approved') {
      return NextResponse.json({ verified: true })
    }

    return NextResponse.json({ verified: false, error: 'Incorrect code. Please try again.' })
  } catch (error: unknown) {
    console.error('SMS verify error:', error)

    // Twilio returns 404 when verification is expired or max attempts reached
    const twilioError = error as { status?: number }
    if (twilioError.status === 404) {
      return NextResponse.json({
        verified: false,
        error: 'Code expired. Click resend for a new one.',
      })
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
