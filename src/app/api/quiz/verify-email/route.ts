import { NextRequest, NextResponse } from 'next/server'

const ZEROBOUNCE_API_KEY = process.env.ZEROBOUNCE_API_KEY

interface ZeroBounceResponse {
  status: string // 'valid', 'invalid', 'catch-all', 'unknown', 'spamtrap', 'abuse', 'do_not_mail'
  sub_status: string
  email: string
  did_you_mean?: string
  domain_age_days?: string
  free_email?: boolean
  disposable?: boolean
}

interface VerifyEmailResponse {
  valid: boolean
  reason?: string
  suggestion?: string
  isDisposable?: boolean
  isFreeEmail?: boolean
}

/**
 * POST /api/quiz/verify-email
 * Verifies an email address using ZeroBounce API
 */
export async function POST(request: NextRequest): Promise<NextResponse<VerifyEmailResponse>> {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { valid: false, reason: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic format validation first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        valid: false,
        reason: 'Invalid email format',
      })
    }

    // If ZeroBounce isn't configured, do basic validation only
    if (!ZEROBOUNCE_API_KEY) {
      console.warn('ZEROBOUNCE_API_KEY not configured, using basic validation')

      // Check for common disposable email domains
      const disposableDomains = [
        'tempmail.com', 'throwaway.com', '10minutemail.com',
        'guerrillamail.com', 'mailinator.com', 'temp-mail.org',
        'fakeinbox.com', 'getnada.com', 'yopmail.com'
      ]
      const domain = email.split('@')[1]?.toLowerCase()

      if (disposableDomains.some(d => domain?.includes(d))) {
        return NextResponse.json({
          valid: false,
          reason: 'Disposable email addresses are not allowed',
          isDisposable: true,
        })
      }

      return NextResponse.json({ valid: true })
    }

    // Call ZeroBounce API
    const zbUrl = `https://api.zerobounce.net/v2/validate?api_key=${ZEROBOUNCE_API_KEY}&email=${encodeURIComponent(email)}`

    const response = await fetch(zbUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      console.error('ZeroBounce API error:', response.status)
      // Fail open - allow email if API fails
      return NextResponse.json({ valid: true })
    }

    const data: ZeroBounceResponse = await response.json()

    // Determine if email is valid based on ZeroBounce status
    const validStatuses = ['valid', 'catch-all']
    const isValid = validStatuses.includes(data.status)

    // Build response
    const result: VerifyEmailResponse = {
      valid: isValid,
      isDisposable: data.disposable,
      isFreeEmail: data.free_email,
    }

    if (!isValid) {
      // Provide helpful reason
      switch (data.status) {
        case 'invalid':
          result.reason = 'This email address appears to be invalid'
          break
        case 'spamtrap':
        case 'abuse':
          result.reason = 'This email address cannot be used'
          break
        case 'do_not_mail':
          result.reason = data.sub_status === 'disposable'
            ? 'Disposable email addresses are not allowed'
            : 'This email address cannot receive mail'
          break
        default:
          result.reason = 'Unable to verify this email address'
      }
    }

    // Include typo suggestion if available
    if (data.did_you_mean) {
      result.suggestion = data.did_you_mean
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Email verification error:', error)
    // Fail open - allow email if something goes wrong
    return NextResponse.json({ valid: true })
  }
}
