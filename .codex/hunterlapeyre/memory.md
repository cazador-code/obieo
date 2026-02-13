# Codex Memory (obieo)

Use this file as durable, repo-specific “muscle memory”. Keep it concise and actionable.

## Working Agreements
- Prefer smallest change that is testable.
- Always leave a “how to verify” trail: exact commands, files, and expected output.
- Ask for a second opinion before merging anything risky (migrations, auth, billing, analytics, SEO changes).

## Repo Quickstart
- Install deps: `npm install`
- Dev server: `npm run dev`

## Common Commands
- Search (fallback when `rg` is unavailable): `grep -RIn "pattern" .`
- Find files: `find . -maxdepth 4 -type f -name "foo*"`

## Codebase Map (fill in over time)
- Frontend framework:
- Routing:
- State management:
- Analytics/tracking:
- Payments/billing:
- CMS/content:
- Pay-per-lead landing page: `claim-area.obieo.com`

## Gotchas / Sharp Edges (fill in over time)
- (Add items as they come up.)

## Reusable Verification (fill in over time)
- Lint:
- Typecheck:
- Unit tests:
- E2E:

## Session Notes (append, newest first)
### YYYY-MM-DD
- What we did:
- What we learned:
- Next time, do:
### 2026-02-12
- What we did:
  - Configured production Stripe webhook destination `obieo-prod-stripe-activation-webhook` for `https://www.obieo.com/api/webhooks/stripe` with 4 activation events.
  - Updated local env: `STRIPE_WEBHOOK_SECRET` is set in `.env.local`.
- What we learned:
  - Stripe Dashboard destinations require public URLs; localhost requires Stripe CLI forwarding.
- Next time, do:
  - Mirror this webhook config in production environment variables and send one test checkout to confirm invite email flow.
