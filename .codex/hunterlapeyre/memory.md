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
### 2026-02-22
- What we did:
  - Diagnosed Mark Roesel onboarding failures with live Clerk API checks and confirmed two separate causes: wrong domain typo (`bestchouce...`) and missing Clerk `public_metadata.portalKey` on the created user.
  - Applied immediate production unblock by patching Clerk metadata for `user_3A2El5h1NBMdWVcZvxRoA9nb2ww` to `portalKey=roofs-by-mark-48913e`.
  - Shipped permanent backend self-heal in `src/app/api/public/leadgen/onboarding-complete/route.ts`: when `portalKey` metadata is missing, validate signed-in primary email against intent billing email, then backfill `portalKey` and continue.
  - Built and verified, then committed and pushed `61d253c` to `origin/main`.
  - Closure analyzers: security-reviewer `pass`; code-simplifier `warn` (2 medium, 3 minor) on `src/app/api/public/leadgen/onboarding-complete/route.ts`.
- Commands used:
  - `curl -sS -H "Authorization: Bearer $CLERK_SECRET_KEY" "https://api.clerk.com/v1/users?email_address=..."`
  - `curl -sS -H "Authorization: Bearer $CLERK_SECRET_KEY" "https://api.clerk.com/v1/invitations?limit=500&offset=0"`
  - `curl -sS -X PATCH -H "Authorization: Bearer $CLERK_SECRET_KEY" -H "Content-Type: application/json" "https://api.clerk.com/v1/users/<user_id>/metadata" --data '{"public_metadata":{"portalKey":"..."}}'`
  - `npm run build`
  - `git add src/app/api/public/leadgen/onboarding-complete/route.ts`
  - `git commit -m "Fix onboarding account link fallback for Clerk metadata gaps"`
  - `git push origin main`
  - `python3 /Users/hunterlapeyre/.codex/skills/security-reviewer/scripts/run_security_review.py --repo "$PWD" --pretty`
  - `python3 /Users/hunterlapeyre/.codex/skills/code-simplifier/scripts/run_code_simplifier.py --repo "$PWD" --pretty`
- Patterns discovered:
  - `Account is not linked to this organization` can be a metadata-link drift issue even when the user is correctly invited and authenticated; matching by primary email to paid intent is a safe self-heal gate.
  - For onboarding incidents, fastest truth path is: Clerk users by email -> Clerk invitations by email -> user `public_metadata.portalKey` -> intent `portalKey`.
- Gotchas:
  - Invite typo domains create real divergence (`bestchouce` vs `bestchoice`) and look like OTP failures from user perspective.
  - Existing API behavior previously hard-failed when `public_metadata.portalKey` was empty, even with valid login and token.
  - code-simplifier still flags readability nits in the updated route (non-blocking).
- Next-time start:
  - For any onboarding-link report, run the four-step truth sequence (user, invite, metadata, intent) before UI debugging.
  - Keep the self-heal guardrails: only backfill portal metadata when signed-in primary email equals intent billing email.

### 2026-02-21
- What we did:
  - Built internal clients dashboard at `/internal/clients` with Convex + Clerk aggregated status rows and lifecycle summary cards.
  - Added internal portal preview authority: dashboard now issues signed `preview_token` links and `/portal` can render in preview mode for a target `portalKey`.
  - Hardened `/portal` preview behavior with explicit expired/invalid preview-link handling instead of fallback redirects.
  - Fixed production build break in `src/proxy.ts` by passing `NextFetchEvent` to `clerkProxy(request, event)`; `npm run build` succeeded after patch and commit `b90fec4` was pushed to `origin/main`.
  - Closure analyzers: security-reviewer `pass`; code-simplifier `warn` (1 medium, 1 minor in `src/proxy.ts`).
- Commands used:
  - `npm run lint`
  - `npm run build`
  - `git status --short`
  - `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
  - `git rev-list --left-right --count HEAD...@{u}`
  - `git commit -m "Fix Clerk proxy middleware signature for production build"`
  - `git push origin main`
  - `pkill -f "next dev" || true && rm -f .next/dev/lock`
- Patterns discovered:
  - For this app/router setup, internal route auth should be handled before Clerk middleware in `src/proxy.ts`; misordered auth handling causes unstable proxy behavior and local request resets.
  - Vercel build failures are fastest to resolve by reproducing with local `npm run build` first, then patching from the exact TS error.
  - Internal dashboard pages should degrade gracefully when Clerk listing APIs fail (return partial data, avoid 500).
- Gotchas:
  - Clerk production keys are domain-locked (`obieo.com`), so local `127.0.0.1` browser usage can fail in `ClerkProvider` with origin/domain mismatch even when app code is correct.
  - `next dev` lock conflicts recur if prior processes are still alive; killing only one port is insufficient when another dev server still holds `.next/dev/lock`.
  - code-simplifier warning remained on `src/proxy.ts` (readability/style only, non-blocking).
- Next-time start:
  - Verify deployment from latest `main` commit first, then validate `/internal/clients` and one `View Client Portal` click on production domain where Clerk keys are valid.
  - For local debugging, use test/dev Clerk keys before portal UX checks to avoid false failures from domain restrictions.

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
