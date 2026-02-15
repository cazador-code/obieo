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
- Typecheck: `npx tsc -p tsconfig.json --noEmit` (note: there is no `npm run typecheck` script)
- Lint: `npm run lint`
- Build: `npm run build`
- Deploy Convex functions/schema: `npm run convex:deploy`
- Vercel prod deploy (if CLI network allows): `vercel deploy --prod --yes`
- Check internal tool auth headers: `curl -I https://www.obieo.com/internal/leadgen/payment-link`
- Check internal tool auth (should return 200): `curl -u "USER:PASS" -I https://www.obieo.com/internal/leadgen/payment-link`
- Search (fallback when `rg` is unavailable): `grep -RIn "pattern" .`
- Find files: `find . -maxdepth 4 -type f -name "foo*"`

## Codebase Map (fill in over time)
- Frontend framework:
- Routing:
- State management:
- Analytics/tracking:
- Payments/billing:
  - Stripe Checkout + invoices
  - Webhook handler: `src/app/api/webhooks/stripe/route.ts`
  - Activation + Clerk invite: `src/lib/stripe-activation.ts`
  - Billing provisioning: `src/lib/stripe-onboarding.ts`
- CMS/content:
- Pay-per-lead landing page: `claim-area.obieo.com`

## Gotchas / Sharp Edges (fill in over time)
- Node version: local Node `v25.x` can break `next build` (webpack WasmHash crash). Use `nvm use` (see `.nvmrc` = 20).
- Internal tools Basic Auth:
  - `/internal/leadgen/payment-link` is protected via `middleware.ts` Basic Auth.
  - Requires Vercel env vars: `INTERNAL_LEADGEN_BASIC_AUTH_USER` + `INTERNAL_LEADGEN_BASIC_AUTH_PASS`.
  - Middleware is fail-closed: missing creds returns `503 Internal tools auth is not configured.`
- Stripe webhook 400s almost always mean `STRIPE_WEBHOOK_SECRET` mismatch. Fix by copying the endpoint signing secret (`whsec_...`) from Stripe and setting Vercel **Production** env var, then redeploy.
- Stripe webhook dedupe: re-sending the same event id returns `{ duplicate: true }` and will not re-run activation.
- Stripe coupons: the coupon “Name” shown in the dashboard is not the coupon ID. Prefer coupon ID (e.g. `aW0d883k`) or promo code ID (`promo_...`). The internal payment-link tool can now resolve a coupon name -> ID, but ID is still the most reliable.
- Clerk invites: if a Stripe customer already has `obieo_activation_invite_sent_at`, activation will normally skip. The `/checkout/success` “Resend invitation email” button forces a fresh invite (revokes prior invitation ID if present).
- Convex deploy can fail in some networks with `getaddrinfo ENOTFOUND o1192621.ingest.sentry.io` (Convex CLI telemetry). Retry on a different network/VPN or later.
- Vercel deploy may fail in restricted environments with `getaddrinfo ENOTFOUND api.vercel.com`. In that case, rely on Vercel's GitHub integration (push to `main`) to redeploy production.

## Reusable Verification (fill in over time)
- Lint: `npm run lint`
- Typecheck: `npx tsc -p tsconfig.json --noEmit`
- Build: `npm run build`
- Unit tests:
- E2E:

## Session Notes (append, newest first)
### YYYY-MM-DD
- What we did:
- What we learned:
- Next time, do:
### 2026-02-15
- What we did:
  - Added corporate pay-per-lead offering: `pay_per_lead_40_first_lead` ($40 first lead, then $40 per delivered lead).
  - Added Basic Auth protection to internal payment-link generator via `middleware.ts`.
  - Fixed Vercel build type error by updating Convex validation union for the new billing model.
  - Switched middleware to fail-closed so missing auth env vars cannot silently expose the internal tool.
- What we learned:
  - If Basic Auth "does nothing", verify you're not relying on a permissive fallback: missing `INTERNAL_LEADGEN_BASIC_AUTH_*` should return 503.
  - Some environments cannot reach Vercel's API via CLI (DNS); pushing to `main` is the reliable prod redeploy path.
- Next time, do:
  - After setting Vercel env vars, validate Basic Auth from an incognito window or with `curl -I` / `curl -u`.
  - If you need local access to the internal tool, set `INTERNAL_LEADGEN_BASIC_AUTH_USER/PASS` in `.env.local` (middleware is fail-closed).
### 2026-02-13
- What we did:
  - Shipped production payment-first onboarding: internal payment link -> Stripe Checkout -> webhook -> Clerk invite -> `/leadgen/onboarding` -> `/portal`.
  - Added internal-only “test discount” support for Checkout to run $0 end-to-end tests.
  - Fixed production Stripe webhook failures by aligning `STRIPE_WEBHOOK_SECRET` with Stripe endpoint signing secret.
  - Fixed a sign-in redirect loop by removing Clerk `forceRedirectUrl` and adding portalKey recovery/backfill (Convex by email + Stripe customer metadata fallback).
  - Added a forced “resend invitation” path from `/checkout/success`.
- What we learned:
  - Stripe event resends are idempotent in our handler (KV dedupe); use a new event/session to re-trigger, or use the explicit resend flow.
  - Clerk redirects should respect `redirect_url` for onboarding; `forceRedirectUrl` can override and cause loops.
- Next time, do:
  - For a clean smoke test, use a brand-new billing email (or plus alias) so Stripe customer metadata is fresh.
  - Verify the 3-system handshake: Stripe event delivery 200 + Stripe customer metadata invite fields + Clerk user `publicMetadata.portalKey` + Convex org `onboardingStatus=completed`.
### 2026-02-12
- What we did:
  - Configured production Stripe webhook destination `obieo-prod-stripe-activation-webhook` for `https://www.obieo.com/api/webhooks/stripe` with 4 activation events.
  - Updated local env: `STRIPE_WEBHOOK_SECRET` is set in `.env.local`.
- What we learned:
  - Stripe Dashboard destinations require public URLs; localhost requires Stripe CLI forwarding.
- Next time, do:
  - Mirror this webhook config in production environment variables and send one test checkout to confirm invite email flow.
