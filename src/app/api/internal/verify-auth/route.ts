import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { authLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

// Simple token generation - hash of password + secret
function generateToken(password: string): string {
  const secret = process.env.INTERNAL_AUTH_SECRET || 'obieo-internal-2024';
  return createHash('sha256').update(`${password}-${secret}`).digest('hex');
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

    const correctPassword = process.env.INTERNAL_TOOL_PASSWORD || 'obieo2024';

    // If token provided, verify it
    if (token) {
      const expectedToken = generateToken(correctPassword);
      return NextResponse.json({ valid: token === expectedToken });
    }

    // If password provided, check it and return token
    if (password) {
      if (password === correctPassword) {
        const newToken = generateToken(correctPassword);
        return NextResponse.json({ valid: true, token: newToken });
      }
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: false });
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
