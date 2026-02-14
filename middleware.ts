import { NextRequest, NextResponse } from 'next/server'

function unauthorized(): NextResponse {
  return new NextResponse('Authorization required.', {
    status: 401,
    headers: {
      // Browser-native password prompt.
      'WWW-Authenticate': 'Basic realm="Obieo Internal", charset="UTF-8"',
    },
  })
}

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
    decoded = atob(encoded)
  } catch {
    return null
  }

  const idx = decoded.indexOf(':')
  if (idx < 0) return null
  return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) }
}

export function middleware(request: NextRequest) {
  const expectedUser = process.env.INTERNAL_LEADGEN_BASIC_AUTH_USER || ''
  const expectedPass = process.env.INTERNAL_LEADGEN_BASIC_AUTH_PASS || ''
  const isProd =
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production'

  // Fail closed in production if secrets are missing.
  // Using NODE_ENV here is more reliable than Vercel-specific vars in edge middleware.
  if ((!expectedUser || !expectedPass) && isProd) {
    return new NextResponse('Internal tools auth is not configured.', { status: 503 })
  }

  // In local/dev environments, allow access if Basic Auth isn't configured.
  if (!expectedUser || !expectedPass) return NextResponse.next()

  const creds = decodeBasicAuthHeader(request.headers.get('authorization') || '')
  if (!creds) return unauthorized()

  const ok =
    timingSafeEqual(creds.user, expectedUser) &&
    timingSafeEqual(creds.pass, expectedPass)

  if (!ok) return unauthorized()
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/internal/leadgen/payment-link',
    '/internal/leadgen/payment-link/:path*',
    '/api/internal/leadgen/payment-link',
  ],
}
