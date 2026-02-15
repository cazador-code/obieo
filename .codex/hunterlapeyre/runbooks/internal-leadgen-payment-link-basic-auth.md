# Runbook: Internal Leadgen Payment Link (Basic Auth, Prod)

## Goal
Ensure `https://www.obieo.com/internal/leadgen/payment-link` is password-protected and usable for generating Stripe Checkout links for leadgen customers.

## When To Use This
- The internal payment-link generator isn’t prompting for a password.
- You see `503 Internal tools auth is not configured.` and need to get the tool back online.
- You need a repeatable “VIP client onboarding” flow for paid-in-full or pay-per-lead.

## Preconditions
- Access: Vercel project settings (Production env vars), production deploy logs.
- Vercel Production env vars:
  - `INTERNAL_LEADGEN_BASIC_AUTH_USER`
  - `INTERNAL_LEADGEN_BASIC_AUTH_PASS`

## Implementation Notes (how it works)
- Protection is enforced in Next middleware: `middleware.ts`.
- The middleware is **fail-closed**:
  - If either env var is missing, requests return `503 Internal tools auth is not configured.`
  - If creds are present but missing/incorrect in the request, response is `401` with `WWW-Authenticate: Basic ...` (browser password prompt).

## Setup / Fix Steps (Prod)
1. Set Vercel Production env vars
   - Add/Update:
     - `INTERNAL_LEADGEN_BASIC_AUTH_USER` = your chosen username
     - `INTERNAL_LEADGEN_BASIC_AUTH_PASS` = your chosen password

2. Redeploy production
   - Use Vercel’s GitHub integration (push to `main`) to trigger a new production build.
   - Note: `vercel deploy --prod --yes` may fail in some environments with `getaddrinfo ENOTFOUND api.vercel.com`.

3. Verify the password prompt
   - Open the page in an incognito window:
     - `https://www.obieo.com/internal/leadgen/payment-link`
   - Expected: browser prompts for username/password.

4. Verify with curl (optional)
   - Without creds (should be 401 or 503):
     - `curl -I https://www.obieo.com/internal/leadgen/payment-link`
   - With creds (should be 200):
     - `curl -u "USER:PASS" -I https://www.obieo.com/internal/leadgen/payment-link`

## Troubleshooting
- No password prompt, page loads normally:
  - Confirm Vercel **Production** env vars are set and a new production deployment completed.
  - Try incognito (avoid cached auth state).
- Seeing `503 Internal tools auth is not configured.`:
  - One or both env vars are missing in the runtime. Set them in Vercel Production and redeploy.
- Vercel CLI deploy fails with DNS:
  - Use GitHub integration to deploy (push to `main`).

