import { NextRequest, NextResponse } from 'next/server';
import { authLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import {
  createInternalToolToken,
  isInternalToolJwtConfigured,
  verifyInternalToolToken,
} from '@/lib/internal-tool-auth';

// JWT configuration
// This is an internal tool gate, not customer auth. Keep it stable and low-friction.
const TOKEN_EXPIRATION = process.env.INTERNAL_TOOL_TOKEN_EXPIRATION?.trim() || '30d';

// Create a signed JWT with expiration
async function createToken(): Promise<string> {
  return createInternalToolToken(TOKEN_EXPIRATION);
}

// Verify a JWT token
async function verifyToken(token: string): Promise<boolean> {
  return verifyInternalToolToken(token);
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

    if (!isInternalToolJwtConfigured()) {
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
