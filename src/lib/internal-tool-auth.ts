import 'server-only'

import { SignJWT, jwtVerify } from 'jose'

const INTERNAL_TOOL_TOKEN_ISSUER =
  process.env.INTERNAL_TOOL_TOKEN_ISSUER?.trim() || 'obieo-internal-tool'
const INTERNAL_TOOL_TOKEN_AUDIENCE =
  process.env.INTERNAL_TOOL_TOKEN_AUDIENCE?.trim() || 'obieo-internal-api'
const INTERNAL_TOOL_TOKEN_ALGORITHM = 'HS256'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

export function isInternalToolJwtConfigured(): boolean {
  const secret = process.env.JWT_SECRET
  return Boolean(secret && secret.length >= 32)
}

export async function createInternalToolToken(expiration: string): Promise<string> {
  const secret = getJwtSecret()
  return new SignJWT({ authorized: true })
    .setProtectedHeader({ alg: INTERNAL_TOOL_TOKEN_ALGORITHM })
    .setIssuedAt()
    .setIssuer(INTERNAL_TOOL_TOKEN_ISSUER)
    .setAudience(INTERNAL_TOOL_TOKEN_AUDIENCE)
    .setExpirationTime(expiration)
    .sign(secret)
}

export async function verifyInternalToolToken(token: string): Promise<boolean> {
  try {
    const secret = getJwtSecret()
    const verified = await jwtVerify(token, secret, {
      issuer: INTERNAL_TOOL_TOKEN_ISSUER,
      audience: INTERNAL_TOOL_TOKEN_AUDIENCE,
      algorithms: [INTERNAL_TOOL_TOKEN_ALGORITHM],
    })
    return verified.payload.authorized === true
  } catch {
    return false
  }
}
