import { NextRequest, NextResponse } from 'next/server'
import { getLeadgenIntentByTokenInConvex } from '@/lib/convex'

export const runtime = 'nodejs'

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export async function GET(request: NextRequest) {
  const token = normalizeString(request.nextUrl.searchParams.get('token'))
  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 })
  }

  const intent = await getLeadgenIntentByTokenInConvex({ token })
  if (!intent) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    portalKey: intent.portalKey,
    companyName: intent.companyName,
    billingEmail: intent.billingEmail,
    status: intent.status,
    tokenExpiresAt: intent.tokenExpiresAt,
  })
}

