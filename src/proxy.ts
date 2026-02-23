import { clerkMiddleware } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/* ------------------------------------------------------------------ */
/*  Subdomain routing                                                  */
/* ------------------------------------------------------------------ */

const APP_HOSTNAMES = new Set([
  'app.obieo.com',
  'app.localhost:3000',
  'app.localhost',
])

function isAppHostname(host: string): boolean {
  return APP_HOSTNAMES.has(host)
}

/* ------------------------------------------------------------------ */
/*  Internal basic-auth guard                                          */
/* ------------------------------------------------------------------ */

const INTERNAL_AUTH_BASE_PATHS = [
  '/internal/leadgen/payment-link',
  '/internal/clients',
  '/api/internal/leadgen/payment-link',
  '/api/internal/leadgen/payment-confirmation',
] as const

function unauthorized(): NextResponse {
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

function requiresInternalBasicAuth(pathname: string): boolean {
  return INTERNAL_AUTH_BASE_PATHS.some(
    (basePath) => pathname === basePath || pathname.startsWith(`${basePath}/`)
  )
}

export default clerkMiddleware((_auth, request: NextRequest) => {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 1. Internal basic-auth guard (validate first, then continue to rewrite logic)
  if (requiresInternalBasicAuth(pathname)) {
    const expectedUser = process.env.INTERNAL_LEADGEN_BASIC_AUTH_USER || ''
    const expectedPass = process.env.INTERNAL_LEADGEN_BASIC_AUTH_PASS || ''
    if (!expectedUser || !expectedPass) {
      return new NextResponse('Internal tools auth is not configured.', { status: 503 })
    }

    const creds = decodeBasicAuthHeader(request.headers.get('authorization') || '')
    if (!creds) return unauthorized()

    const ok =
      timingSafeEqual(creds.user, expectedUser) &&
      timingSafeEqual(creds.pass, expectedPass)
    if (!ok) return unauthorized()
  }

  // 2. Subdomain routing for app.obieo.com
  if (isAppHostname(hostname)) {
    // Static assets / Next.js internals — don't rewrite
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon') ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml'
    ) {
      return NextResponse.next()
    }

    // API routes are shared — don't rewrite
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // Rewrite to /app/* route group
    const url = request.nextUrl.clone()
    url.pathname = `/app${pathname}`
    return NextResponse.rewrite(url)
  }

  // 3. www.obieo.com or any other hostname — pass through
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
