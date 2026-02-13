# Runbook: Payment-First Onboarding (Prod)

## Goal
Send a customer a $1,600 Stripe Checkout link and reliably land them in Clerk onboarding, then `/portal`, with billing + org state correctly created in Convex.

## When To Use This
- Sales/Ops needs to onboard a new “40 leads paid in full” customer.
- Stripe webhooks or Clerk invite/redirect behavior is acting weird and you need a repeatable debug flow.

## Preconditions
- Access: Vercel project settings, Stripe Live dashboard, Clerk dashboard, Convex dashboard.
- Vercel Production env vars (minimum for this flow):
  - `LEADGEN_PAYMENT_FIRST_ENABLED=true`
  - `STRIPE_SECRET_KEY` (live)
  - `STRIPE_WEBHOOK_SECRET` (the endpoint signing secret for `https://www.obieo.com/api/webhooks/stripe`)
  - `STRIPE_PAID_IN_FULL_PRICE_ID=price_...` (one-time $1,600 price)
  - `CLERK_SECRET_KEY` (live)
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (live)
  - `CONVEX_URL` (prod deployment URL)
  - `CONVEX_AUTH_ADAPTER_SECRET`
  - `JWT_SECRET` (>= 32 chars)
- Stripe Webhook endpoint configured (Live):
  - URL: `https://www.obieo.com/api/webhooks/stripe`
  - Events:
    - `checkout.session.completed`
    - `checkout.session.async_payment_succeeded`
    - `invoice.payment_succeeded`
    - `invoice.paid`

## Steps
1. Stripe catalog pin (one-time setup)
   - Stripe → Product catalog → create product “40 Lead Package (Paid in Full)” with a **one-time** $1,600 price.
   - Copy the **Price ID** (`price_...`) and set `STRIPE_PAID_IN_FULL_PRICE_ID` in Vercel Production.
   - Redeploy after env changes.

2. Stripe webhook signing secret (one-time setup / common fix)
   - Stripe → Developers → Webhooks → open endpoint for `https://www.obieo.com/api/webhooks/stripe`.
   - Copy Signing secret (`whsec_...`) and set `STRIPE_WEBHOOK_SECRET` in Vercel Production.
   - Redeploy after env changes.

3. Generate the payment link (Ops/Sales)
   - Open `/internal/leadgen/payment-link`.
   - Fill:
     - Company name
     - Billing email
     - Optional: billing name, source, UTMs, notes
   - Optional test-only: “Test discount”
     - Accepts coupon ID (`aW0d...`), coupon “name” (dashboard label), promotion code ID (`promo_...`), or promo code string.
   - Click “Generate $1,600 Checkout Link”.
   - Send checkout URL to customer.

4. Customer payment + invite + onboarding
   - Customer completes Stripe Checkout.
   - Stripe webhook should:
     - mark leadgen intent as paid
     - create org shell (credits ready)
     - send Clerk invitation redirecting to `/leadgen/onboarding?token=...`
   - Customer accepts invite, signs in, completes onboarding form.
   - Customer lands on `/portal` and sees “Buy More Leads”.

## Verification
- Stripe
  - Events: `checkout.session.completed` shows webhook delivery **200 OK** to `https://www.obieo.com/api/webhooks/stripe`.
  - Customer metadata includes:
    - `portal_key`
    - `company_name`
    - `obieo_activation_invite_sent_at`
    - `obieo_activation_invite_email`
    - `obieo_activation_invitation_id`
  - PaymentIntent metadata includes:
    - `obieo_journey=leadgen_payment_first`
    - `obieo_kind=paid_in_full`
    - `billing_model=package_40_paid_in_full`
    - `portal_key=...`

- Clerk
  - User exists and has `publicMetadata.portalKey`.
  - Invitation shows “accepted”.

- Convex
  - `leadgenIntents`: status progresses to `invited` then `onboarding_completed`.
  - `organizations`: has `portalKey`, `billingModel=package_40_paid_in_full`, `prepaidLeadCredits=40`, and `onboardingStatus=completed` after form submit.

- App
  - Visiting `/portal` while signed in does not redirect-loop.
  - “Buy More Leads” can create an invoice and shows an `in_...` id.

## Rollback / Undo
- Disable the flow immediately:
  - Vercel Production env: set `LEADGEN_PAYMENT_FIRST_ENABLED=false` and redeploy.
- Stop webhook processing:
  - Stripe: disable the webhook endpoint (deliveries will stop).

## Notes
- If Stripe shows webhook `400 Bad Request`, it is almost always an incorrect `STRIPE_WEBHOOK_SECRET` in Vercel Production.
- Stripe “Resend” on the same event id will often show `{ duplicate: true }` because we dedupe by `event.id` (expected).
- If activation says “invite already sent”:
  - Use `/checkout/success` → “Resend invitation email” (forces a new invite), or
  - Remove `obieo_activation_invite_*` fields from the Stripe customer metadata and resend the webhook event.
- Avoid local Node `v25.x` for builds; use Node 20 (`.nvmrc`).

