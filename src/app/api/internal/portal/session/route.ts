import { NextRequest, NextResponse } from 'next/server'
import {
  createInternalPortalSupportToken,
  INTERNAL_PORTAL_SUPPORT_COOKIE_MAX_AGE_SECONDS,
  INTERNAL_PORTAL_SUPPORT_COOKIE_NAME,
} from '@/lib/internal-portal-preview'

export const runtime = 'nodejs'

function normalizeString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned.length > 0 ? cleaned : null
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const action = normalizeString(formData.get('action'))

  if (action === 'clear') {
    const response = NextResponse.redirect(new URL('/internal/clients', request.url), { status: 303 })
    response.cookies.set({
      name: INTERNAL_PORTAL_SUPPORT_COOKIE_NAME,
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    return response
  }

  const portalKey = normalizeString(formData.get('portalKey'))
  if (!portalKey) {
    return NextResponse.json({ success: false, error: 'portalKey is required' }, { status: 400 })
  }

  const token = await createInternalPortalSupportToken(portalKey)
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Internal portal support login is not configured.' },
      { status: 503 }
    )
  }

  const response = NextResponse.redirect(new URL('/portal', request.url), { status: 303 })
  response.cookies.set({
    name: INTERNAL_PORTAL_SUPPORT_COOKIE_NAME,
    value: token,
    httpOnly: true,
    maxAge: INTERNAL_PORTAL_SUPPORT_COOKIE_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}
