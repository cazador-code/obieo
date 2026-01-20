import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// Rate limiters for different endpoints
export const leadsLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  prefix: 'ratelimit:leads',
});

export const authLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  prefix: 'ratelimit:auth',
});

export const auditLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(3, '1 m'), // 3 requests per minute (expensive endpoint)
  prefix: 'ratelimit:audit',
});

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0].trim() ?? 'anonymous';
}

export function rateLimitResponse(remaining: number) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
        'Retry-After': '60',
      },
    }
  );
}
