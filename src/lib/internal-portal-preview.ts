import 'server-only'

import { SignJWT, jwtVerify } from 'jose'

const INTERNAL_PORTAL_PREVIEW_SCOPE = 'internal_portal_preview'
const INTERNAL_PORTAL_PREVIEW_EXPIRATION =
  process.env.INTERNAL_PORTAL_PREVIEW_TOKEN_EXPIRATION?.trim() || '30m'

type InternalPortalPreviewPayload = {
  scope?: string
  portalKey?: string
}

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) return null
  return new TextEncoder().encode(secret)
}

export async function createInternalPortalPreviewToken(portalKey: string): Promise<string | null> {
  const cleanedPortalKey = portalKey.trim()
  if (!cleanedPortalKey) return null

  const secret = getJwtSecret()
  if (!secret) return null

  return new SignJWT({
    scope: INTERNAL_PORTAL_PREVIEW_SCOPE,
    portalKey: cleanedPortalKey,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(INTERNAL_PORTAL_PREVIEW_EXPIRATION)
    .sign(secret)
}

export async function resolveInternalPortalPreviewToken(token: string): Promise<string | null> {
  const cleaned = token.trim()
  if (!cleaned) return null

  const secret = getJwtSecret()
  if (!secret) return null

  try {
    const verified = await jwtVerify(cleaned, secret)
    const payload = verified.payload as InternalPortalPreviewPayload
    if (payload.scope !== INTERNAL_PORTAL_PREVIEW_SCOPE) return null
    if (typeof payload.portalKey !== 'string') return null
    const portalKey = payload.portalKey.trim()
    return portalKey || null
  } catch {
    return null
  }
}
