# Obieo Lead Intake + Stripe Billing + Activation (Go-Live Runbook)

Last updated: 2026-02-13

This document captures what we built, how it works end-to-end, how to test locally, and what needs to happen to go live.

It intentionally avoids putting real secret values in the repo. Use placeholders and keep all secrets in `.env.local` (local) and your hosting provider's env settings (prod).

> Current mode (February 2026): leadgen onboarding is driven by external payment confirmation (Ignition/Whop/manual). Stripe code is retained but inactive unless `LEADGEN_STRIPE_ACTIVE=true`.

---

## 1) What We Have Working Right Now

### Internal ops intake (multi-step form)
- URL: `/internal/leadgen/onboarding`
- Purpose: standardized client intake -> writes company profile + billing config -> provisions Stripe -> generates initial Checkout link.
- Access: password-gated (internal only).
- UX: draft + last submission are persisted so refreshes don't wipe progress.

### Stripe billing provisioning
When intake is submitted, we provision:
- Stripe customer (metadata includes portal key + company name)
- Stripe subscription for metered "Delivered Leads" (usage billing, auto-charge, threshold-based)
- Stripe one-time Checkout session for the initial charge (either $1600, $400, or $1 depending on billing model)

### Activation after payment (customer can login)
Primary path (production):
- Stripe calls our webhook endpoint: `POST /api/webhooks/stripe`
- Webhook handler:
  - verifies signature (`STRIPE_WEBHOOK_SECRET`)
  - dedupes events via Vercel KV
  - creates a Clerk invitation (customer sets password)
  - sends confirmation emails via Resend (customer + ops)

Safety valve (especially helpful in local dev):
- Public page: `/checkout/success?session_id=cs_...`
- Button: "Resend invitation email"
- That calls: `POST /api/public/stripe/activate`
  - it retrieves the Checkout Session from Stripe and triggers the same activation pipeline.

This means customers never need to touch the internal intake password page.

---

## 2) Architecture (Plain English)

1. Ops collects client details (or enters them) in the internal intake.
2. Intake writes a "company config" record to Convex.
3. Intake provisions Stripe for that company:
   - customer
   - subscription (metered delivered leads)
   - initial Checkout link (one-time charge)
4. Ops sends the Checkout link to the customer (or customer pays immediately if you embed it later).
5. Customer pays in Stripe Checkout.
6. Stripe triggers activation:
   - webhook `POST /api/webhooks/stripe` (production)
   - and/or customer lands on `/checkout/success?session_id=...` and clicks resend as backup
7. Activation creates a Clerk invitation email:
   - customer sets password
   - customer signs in at `/sign-in`
8. Next step (not fully built yet): customer portal shows leads, replacements, buy-more, etc.

---

## 3) URLs & Endpoints (Quick Map)

### Pages
- Internal intake: `/internal/leadgen/onboarding`
- Checkout success (public): `/checkout/success?session_id=cs_...`
- Checkout cancel (public): `/checkout/cancel`

### Internal API (JWT-gated, ops-only)
- Unlock / token verify: `POST /api/internal/verify-auth`
- Submit onboarding: `POST /api/internal/leadgen/onboarding`
- Regenerate Checkout session: `POST /api/internal/leadgen/checkout`
- Manual activation (fallback for ops): `POST /api/internal/leadgen/activate`

### Internal API (Basic Auth protected, external payment flow)
- Confirm external payment + send onboarding invite: `POST /api/internal/leadgen/payment-confirmation`

### Public API
- Resend activation from Stripe session id: `POST /api/public/stripe/activate`

### Stripe webhooks
- `POST /api/webhooks/stripe`

---

## 4) Where Data Lives

### Convex (system of record)
- company profile + targeting preferences + routing preferences + billing model settings
- later: leads table, replacements workflow, lead ledger, etc.

### Stripe (billing)
- customers, products/prices, subscriptions, checkout sessions, invoices

### Clerk (customer auth)
- customers become users via Clerk invitations (this is when they set their password)

### Resend (email delivery)
- sends payment received notice + ops activation notice

### Vercel KV (infra utilities)
- rate limiting
- webhook dedupe records (so a Stripe event doesn't re-trigger activation)

### Browser localStorage (internal intake UX only)
- Draft state:
  - key: `obieo-leadgen-onboarding-draft:v1`
- Last submission snapshot:
  - key: `obieo-leadgen-onboarding-last-submission:v1`
- Internal JWT auth token:
  - key: `obieo-audit-auth`

Important gotcha:
- localStorage is per-hostname. `localhost:3000` and `192.168.x.x:3000` are different stores.

---

## 5) Environment Variables (Local)

Set these in `.env.local` (do not commit secrets).

### Required
- `INTERNAL_TOOL_PASSWORD=...`
- `JWT_SECRET=...` (32+ chars)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...`
- `CLERK_SECRET_KEY=...`
- `STRIPE_SECRET_KEY=...`
- `STRIPE_WEBHOOK_SECRET=whsec_...` (local uses Stripe CLI secret; prod uses Dashboard endpoint secret)
- Stripe catalog pins (recommended so provisioning does not create duplicates):
  - `STRIPE_DEFAULT_LEAD_PRODUCT_ID=prod_...` ("Delivered Leads")
  - `STRIPE_DEFAULT_LEAD_PRICE_ID=price_...` (metered $40/lead)
  - `STRIPE_CARD_VERIFICATION_PRICE_ID=price_...` ($1 one-time)
  - `STRIPE_UPFRONT_BUNDLE_PRICE_ID=price_...` ($400 one-time)
  - `STRIPE_PAID_IN_FULL_PRICE_ID=price_...` ($1,600 one-time)
- `RESEND_API_KEY=...`
- `RESEND_FROM_EMAIL=noreply@obieo.com` (must be verified in Resend)
- `CONVEX_URL=https://<your-deployment>.convex.cloud`
- `CONVEX_DEPLOY_KEY=...` (don't commit)
- `CONVEX_AUTH_ADAPTER_SECRET=...` (must match Convex env var)
- Vercel KV / Upstash vars (whatever your KV setup uses)
  - commonly: `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`

### Recommended
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `CLIENT_PORTAL_LOGIN_URL=http://localhost:3000/sign-in`
- `CLERK_INVITATION_REDIRECT_URL=http://localhost:3000/portal`
- `ONBOARDING_NOTIFICATION_EMAILS=...,...` (where ops activation alerts go)

### Optional (internal QA "no charge" flows)
These only apply in non-production environments:
- `STRIPE_INTERNAL_TEST_COUPON_ID=coupon_...`
- `STRIPE_INTERNAL_TEST_PROMOTION_CODE_ID=promo_...`

Notes:
- In non-production, Checkout sessions allow promotion codes.
- If you set one of the above env vars, we hard-apply the discount to initial Checkout so you can test without charging $400.

### Optional (override default return URLs)
- `STRIPE_ONBOARDING_SUCCESS_URL=http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- `STRIPE_ONBOARDING_CANCEL_URL=http://localhost:3000/checkout/cancel`

---

## 6) Stripe Product/Billing Assumptions

The code is designed to:
- reuse existing products/prices when they match
- create them if they don't exist

### Metered delivered-leads subscription
- Product: "Delivered Leads" (or any product with `metadata.obieo_kind=delivered_leads`)
- Price:
  - recurring monthly
  - `usage_type=metered`
  - unit amount = price per lead (ex: $40 -> 4000 cents)
- Subscription item has `billing_thresholds.usage_gte` (threshold leads before Stripe invoices)

### Initial one-time charges
Billing models supported in code:
- `package_40_paid_in_full`
  - initial charge: $1600 one-time
  - no subscription saved payment method
- `commitment_40_with_10_upfront`
  - initial charge: $400 one-time
  - creates subscription + saves payment method for ongoing usage billing
  - threshold usually 10 leads
- `pay_per_lead_perpetual`
  - initial charge: $1 one-time (card verification)
  - creates subscription + saves payment method for ongoing usage billing
  - threshold locked to 1 lead

---

## 7) Local Testing (End-to-End)

### Step A: Run the app
1. `npm run dev`
2. Open internal intake: `http://localhost:3000/internal/leadgen/onboarding`
3. Unlock with `INTERNAL_TOOL_PASSWORD`

### Step B: Submit intake
1. Fill steps 1-5
2. Submit
3. You should see:
   - "Client Onboarding Submitted"
   - Stripe status "provisioned"
   - "Open Initial Charge Checkout"

### Step C: Stripe webhook (local)
You have 2 modes:

Test-mode webhooks:
1. `stripe login`
2. `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` (local)
4. Restart `npm run dev`

Live-mode webhooks (only if using `sk_live...`):
1. `stripe login`
2. `stripe listen --live --forward-to localhost:3000/api/webhooks/stripe`
3. Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` (local)
4. Restart `npm run dev`

### Step D: Pay
1. Open the Checkout link from the submitted screen
2. Complete payment

Expected:
- Stripe webhook hits `POST /api/webhooks/stripe` (in prod, always; in local, only if Stripe CLI is listening)
- Activation triggers Clerk invite
- Customer receives invitation email

### Step E: If invite didn't arrive
Open:
- `http://localhost:3000/checkout/success?session_id=cs_...`

Click:
- "Resend invitation email"

Notes:
- The resend endpoint is rate-limited (avoid clicking repeatedly; wait 60 seconds if you hit it).
- If you re-open a paid Checkout link, Stripe shows "You're all done here" and won't redirect. Use `/checkout/success?...` with the session id.

---

## 8) Go-Live Checklist (Production)

### 1. Hosting env vars
On Vercel (or your host), set all required env vars (no `.env.local` in prod).

Minimum must-haves:
- Clerk keys
- Stripe secret key
- Stripe webhook secret (for the production webhook endpoint)
- Resend API key + from email
- Convex URL + auth secret
- KV config (rate limiting + webhook dedupe)

### 2. Stripe webhook endpoint
In Stripe Dashboard:
- Create endpoint: `https://www.obieo.com/api/webhooks/stripe`
- Select events:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `invoice.payment_succeeded`
  - `invoice.paid`
- Copy `whsec_...` into production env `STRIPE_WEBHOOK_SECRET`

### 3. Checkout redirect URLs
Ensure these are used in production:
- success: `https://www.obieo.com/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- cancel: `https://www.obieo.com/checkout/cancel`

You can set:
- `STRIPE_ONBOARDING_SUCCESS_URL=...`
- `STRIPE_ONBOARDING_CANCEL_URL=...`

Or rely on defaults from `NEXT_PUBLIC_APP_URL`.

### 4. Resend domain
In Resend:
- verify the domain for `RESEND_FROM_EMAIL` (ex: `noreply@obieo.com`)

### 5. Clerk redirect URLs
In Clerk:
- ensure invitation redirect URL matches `CLERK_INVITATION_REDIRECT_URL`
- ensure sign-in is at `/sign-in`

### 6. Smoke test
Run a real flow using the $1 card verification model:
- confirm Stripe webhook calls your prod endpoint
- confirm customer gets Clerk invite + can sign in

Run a payment-first flow ($1,600 paid-in-full):
1. Set `LEADGEN_PAYMENT_FIRST_ENABLED=true` in production env.
2. Create a checkout link at `/internal/leadgen/payment-link`.
3. Pay the Checkout link.
4. Confirm Clerk invitation redirects to `/leadgen/onboarding?token=...`.
5. Complete onboarding and confirm `/portal` access works (portal blocks until onboarding complete).

---

## 9) Troubleshooting

### "Why didn't the invite email send?"
1. Check Stripe -> Developers -> Events for `checkout.session.completed`
2. Confirm the webhook endpoint delivery shows `200`
3. If local:
   - if you used `cs_live_...`, your Stripe CLI must be `stripe listen --live`
4. Use the safety valve:
   - `/checkout/success?session_id=...` -> "Resend invitation email"

### "Too many requests. Please try again later."
- That's the rate limiter (5/minute). Wait 60 seconds and retry once.

### "Stripe checkout link just says you're all done here"
- That link is already paid. Use:
  - `/checkout/success?session_id=cs_...`

### "Internal intake reset / draft disappeared"
- Make sure you stayed on the same hostname (localhost vs LAN IP).
- Draft is stored in localStorage.

---

## 10) Code Map (Key Files)

### Internal intake UI
- `src/app/internal/leadgen/onboarding/page.tsx`

### Internal auth gate (ops-only password)
- `src/app/api/internal/verify-auth/route.ts`
  - token expiry configurable via `INTERNAL_TOOL_TOKEN_EXPIRATION` (defaults to `30d`)

### Intake submit + checkout regeneration
- `src/app/api/internal/leadgen/onboarding/route.ts`
- `src/app/api/internal/leadgen/checkout/route.ts`

### Public customer-facing checkout result pages
- `src/app/checkout/success/page.tsx`
- `src/app/checkout/success/success_client.tsx`
- `src/app/checkout/cancel/page.tsx`

### Stripe webhook + activation pipeline
- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/stripe-activation.ts`

### Public "resend invite" endpoint
- `src/app/api/public/stripe/activate/route.ts`

### Stripe provisioning logic
- `src/lib/stripe-onboarding.ts`
- `src/lib/billing-models.ts`

### Convex functions
- `convex/leadLedger.ts`

---

## 11) Known Issues / TODO Before Production

1. TypeScript build health:
   - Status (2026-02-13): resolved. These files were updated and TS should be clean:
     - `convex/leadLedger.ts`
     - `src/lib/convex.ts`
     - `src/app/api/webhooks/ghl/lead-delivered/route.ts`
   - Before go-live, still run:
     - `npm run build`
     - and fix anything it fails on.
   - Node version note:
     - Use Node 20 (recommended) or Node 22. Newer Node majors may break `next build` locally.

2. Customer portal:
   - Clerk sign-in is in place, but the full customer-facing leads dashboard + replacements workflow is not completed yet.

3. Billing model selection UX:
   - In practice you'll pre-sell the model on a call; intake UI should eventually "lock" or preselect the billing model.

4. Lead replacement policy workflow:
   - Not implemented yet. Needs: lead swap request UI + evidence upload + policy rules + approval/denial + audit trail.
