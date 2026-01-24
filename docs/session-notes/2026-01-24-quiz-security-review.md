# AI Visibility Quiz - Security Review & Hardening

**Date:** 2026-01-24
**Status:** Complete - Deployed to production

---

## What Was Done

### Security Review
Performed comprehensive security audit of the newly deployed AI Visibility Quiz feature, identifying:

1. **SSRF Vulnerability (HIGH)** - `/api/quiz/analyze` fetched user-provided URLs with only protocol validation, allowing internal network probing
2. **Missing Rate Limiting (HIGH)** - Expensive endpoints (`/api/quiz/analyze`, `/api/quiz/verify-email`) had no rate limits, risking API credit abuse
3. **Prompt Injection Risk (MEDIUM)** - User inputs were passed directly to Anthropic API without sanitization

### Security Fixes Implemented

1. **SSRF Protection**
   - Added `isInternalUrl()` function to block:
     - Localhost variants (`localhost`, `127.0.0.1`, `::1`)
     - Private IP ranges (`10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`)
     - Link-local/metadata addresses (`169.254.x.x`)
     - Cloud metadata hostnames (`metadata.google.internal`, etc.)

2. **Rate Limiting**
   - `/api/quiz/analyze`: 3 requests/minute (uses Anthropic API)
   - `/api/quiz/verify-email`: 5 requests/minute (uses ZeroBounce)

3. **Prompt Sanitization**
   - Added `sanitizeForPrompt()` function that:
     - Strips control characters
     - Removes common injection patterns ("ignore previous instructions")
     - Limits input length (100 chars for business name/keyword/city)

### Good Practices Already Present
- HTML escaping for email content (XSS prevention)
- Rate limiting on `/api/leads` endpoint
- Server-side API keys (not exposed to client)
- Generic error messages (no info disclosure)
- Email hashing for Facebook CAPI

## Files Modified

- `src/app/api/quiz/analyze/route.ts` - Added SSRF checks, rate limiting, prompt sanitization
- `src/app/api/quiz/verify-email/route.ts` - Added rate limiting
- `CLAUDE.md` - Documented new environment variables

## Key Decisions

- Used existing `auditLimiter` (3 req/min) for analyze endpoint since it's the most expensive
- Used `leadsLimiter` (5 req/min) for email verification to match lead submission rate
- Chose to strip prompt injection patterns rather than escape them (cleaner approach)
- Block-by-default for unparseable URLs in SSRF check

## Next Steps

- Monitor rate limit hits in production logs
- Consider adding more sophisticated prompt injection detection if needed
- Add Google PageSpeed API key for higher rate limits (optional)
