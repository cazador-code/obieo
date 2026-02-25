import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { authLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

// JWT configuration
// This is an internal tool gate, not customer auth. Keep it stable and low-friction.
const TOKEN_EXPIRATION = process.env.INTERNAL_TOOL_TOKEN_EXPIRATION?.trim() || '30d';
const TOKEN_ISSUER = process.env.INTERNAL_TOOL_TOKEN_ISSUER?.trim() || 'obieo-internal-tool';
const TOKEN_AUDIENCE = process.env.INTERNAL_TOOL_TOKEN_AUDIENCE?.trim() || 'obieo-internal-api';

// Get the secret as Uint8Array for jose
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

function isJwtSecretConfigured(): boolean {
  const secret = process.env.JWT_SECRET;
  return Boolean(secret && secret.length >= 32);
}

// Create a signed JWT with expiration
async function createToken(): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ authorized: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(secret);
}

// Verify a JWT token
async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = getJwtSecret();
    const verified = await jwtVerify(token, secret, {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      algorithms: ['HS256'],
    });
    return verified.payload.authorized === true;
  } catch {
    // Token is invalid or expired
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting - prevents brute force attacks
  const ip = getClientIp(request);
  const { success, remaining } = await authLimiter.limit(ip);
  if (!success) {
    return rateLimitResponse(remaining);
  }

  try {
    const body = await request.json();
    const { password, token } = body;

    const correctPassword = process.env.INTERNAL_TOOL_PASSWORD;
    if (!correctPassword) {
      console.error('INTERNAL_TOOL_PASSWORD not configured');
      return NextResponse.json(
        { valid: false, error: 'Server misconfigured: INTERNAL_TOOL_PASSWORD is not set.' },
        { status: 500 }
      );
    }

    if (!isJwtSecretConfigured()) {
      console.error('JWT_SECRET not configured or too short');
      return NextResponse.json(
        { valid: false, error: 'Server misconfigured: JWT_SECRET is missing or too short.' },
        { status: 500 }
      );
    }

    // If token provided, verify it
    if (token) {
      const isValid = await verifyToken(token);
      return NextResponse.json({ valid: isValid });
    }

    // If password provided, check it and return new token
    if (password) {
      if (password === correctPassword) {
        const newToken = await createToken();
        return NextResponse.json({ valid: true, token: newToken });
      }
      return NextResponse.json({ valid: false, error: 'Incorrect password.' }, { status: 401 });
    }

    return NextResponse.json({ valid: false });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { valid: false, error: 'Invalid request. Please try again.' },
      { status: 400 }
    );
  }
}
