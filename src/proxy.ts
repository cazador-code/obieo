import { clerkMiddleware } from '@clerk/nextjs/server'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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

const clerkProxy = clerkMiddleware()

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!requiresInternalBasicAuth(request.nextUrl.pathname)) {
    return clerkProxy(request, event)
  }

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

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
