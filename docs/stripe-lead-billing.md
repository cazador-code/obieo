# Stripe Lead Billing Models

This setup supports three billing options:

1. `package_40_paid_in_full`
- Initial charge: `$1,600` checkout session
- Lead billing behavior: first `40` leads are prepaid (no metered usage charges)

2. `commitment_40_with_10_upfront`
- Initial charge: `$400` checkout session
- Lead billing behavior: first `10` leads are prepaid, remaining leads billed with Stripe metered usage
- Metered threshold default: every `10` billable leads
- Commitment cap: `40` total leads

3. `pay_per_lead_perpetual`
- Initial charge: `$1` card verification checkout session (`setup_future_usage=off_session`)
- Lead billing behavior: metered at `$40/lead` with threshold `1` (true pay-per-lead)

## ASAP Setup (Stripe + Convex)

1. Start Convex locally and deploy schema/functions:
   - `npm run convex:dev` (local dev/codegen)
   - `npm run convex:deploy` (when ready for prod)
2. Create a Stripe metered subscription + Convex org mapping:
   - `npm run stripe:lead-subscription -- --portal-key acme-roofing --email billing@acme.com --price-id price_123 --threshold 10`
3. If you need to send a large invoice immediately:
   - `npm run stripe:invoice -- --customer-email billing@acme.com --amount 4200 --description "Lead package invoice" --portal-key acme-roofing`
4. Configure GHL delivered-lead webhook to:
   - `POST /api/webhooks/ghl/lead-delivered`
   - include `portal_key` + `source_external_id`
5. Configure Stripe webhook to:
   - `POST /api/webhooks/stripe`
   - events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.payment_succeeded`, `invoice.paid`
   - set `STRIPE_WEBHOOK_SECRET` from Stripe endpoint signing secret

## 1) Stripe Setup (once)

1. Create a product in Stripe, for example: `Delivered Leads`.
2. Create a **metered recurring price** for that product.
3. Configure invoice thresholding so Stripe bills at your desired lead chunk.
4. Ensure the subscription is set to auto-charge the saved card (automatic collection).

Notes:
- `1 usage unit = 1 delivered lead`.
- The per-lead dollar amount comes from the metered price.

## 2) Create a Subscription Item Per Client

For each client:
1. Create/find Stripe customer.
2. Start subscription on the metered price.
3. Capture the `subscription_item` id (example: `si_...`).

You can map that `si_...` id by client key/email/company using `STRIPE_LEAD_BILLING_MAP_JSON`.

## 3) Configure Environment Variables

In `.env.local`:

```bash
STRIPE_SECRET_KEY=<your_stripe_secret_key>
STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_signing_secret>
STRIPE_API_VERSION=2024-10-28.acacia
# Recommended: pin canonical catalog IDs so provisioning never creates duplicates.
STRIPE_DEFAULT_LEAD_PRODUCT_ID=prod_...
STRIPE_DEFAULT_LEAD_PRICE_ID=price_... # metered $40/lead
STRIPE_CARD_VERIFICATION_PRICE_ID=price_... # $1 one-time
STRIPE_UPFRONT_BUNDLE_PRICE_ID=price_... # $400 one-time
GHL_LEAD_DELIVERED_WEBHOOK_SECRET=your-long-random-secret
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_AUTH_ADAPTER_SECRET=your-convex-shared-secret
STRIPE_LEAD_BILLING_MAP_JSON={"acme-hvac":"si_123","billing@acme.com":"si_123"}
CLIENT_PORTAL_LOGIN_URL=https://www.obieo.com/sign-in
CLERK_INVITATION_REDIRECT_URL=https://www.obieo.com/portal
```

## 4) Lead Delivery Webhook Endpoint

Endpoint:

`POST /api/webhooks/ghl/lead-delivered`

Auth:

`Authorization: Bearer <GHL_LEAD_DELIVERED_WEBHOOK_SECRET>`

Body fields:
- `leadId` (recommended for idempotency)
- `eventId` or `idempotencyKey` (optional alternatives)
- `portal_key` (recommended; ties lead to Convex org)
- `source_external_id` (recommended; stable lead id from GHL)
- `quantity` (optional, defaults to `1`)
- `deliveredAt` (optional ISO date or unix timestamp)
- `stripeSubscriptionItemId` (optional direct override)
- `clientKey`, `clientEmail`, `clientCompany` (optional lookup keys for map-based routing)

Minimal payload example:

```json
{
  "portal_key": "acme-hvac",
  "source_external_id": "ghl-opportunity-12345",
  "quantity": 1
}
```

Direct item payload example:

```json
{
  "leadId": "ghl-opportunity-12345",
  "stripeSubscriptionItemId": "si_123",
  "quantity": 1
}
```

## 5) GHL Workflow Recommendation

In your "lead delivered" workflow:
1. Add a webhook action to call `/api/webhooks/ghl/lead-delivered`.
2. Set `Authorization` header with your bearer secret.
3. Send `source_external_id` as a stable unique value (opportunity/contact event id).
4. Include `portal_key` or `stripeSubscriptionItemId`.

This endpoint is idempotent. If GHL retries the same event id, the request returns success with `duplicate: true` and does not increment usage twice.

## 6) Standardized Client Onboarding API

Endpoint:

`POST /api/onboarding/clients`

Auth:

`Authorization: Bearer <CLIENT_ONBOARDING_API_SECRET>`

If `CLIENT_ONBOARDING_API_SECRET` is not set, this route falls back to `GHL_LEAD_DELIVERED_WEBHOOK_SECRET`.

Example payload:

```json
{
  "companyId": "2",
  "portalKey": "roofing-solutions-usa",
  "companyName": "Roofing Solutions USA",
  "billingModel": "commitment_40_with_10_upfront",
  "serviceAreas": ["Winter Haven", "Lakeland", "Tampa", "Clearwater", "St. Petersburg"],
  "leadRoutingPhones": ["8103204787", "8104797789"],
  "leadRoutingEmails": ["Logan@nemediagroup.com", "Elijah@nemediagroup.com"],
  "billingContactName": "Logan",
  "billingContactEmail": "Logan@nemediagroup.com",
  "leadChargeThreshold": 10,
  "leadUnitPriceCents": 4000
}
```

What it does:

1. Upserts organization billing/routing settings.
2. Stores a normalized onboarding submission row.
3. Queues internal notifications in `workflowNotifications`.
4. Attempts to send an ops email if `RESEND_API_KEY` + recipients are configured.

Internal wizard (recommended for your team):

1. Open `/internal/leadgen/onboarding`
2. Authenticate via your existing internal password gate
3. Complete the 5-step intake flow (account, notifications, targeting, preferences, review)
4. Wizard submits to `POST /api/internal/leadgen/onboarding` with JWT auth
5. On submit, backend attempts automatic Stripe provisioning:
   - find/create customer
   - create plan-specific initial charge checkout session (returns URL)
   - for metered models, create/reuse subscription with billing threshold (`usage_gte`)
   - save Stripe customer/subscription/subscription item IDs and billing model fields to Convex organization
6. After customer pays checkout/invoice, Stripe calls `/api/webhooks/stripe`:
   - verifies Stripe signature
   - identifies first-payment events for activation
   - creates Clerk invitation email (customer sets password securely)
   - sends Resend payment confirmation + ops activation notice
   - stores activation marker on Stripe customer metadata to prevent duplicate invites

### New env vars (optional)

```bash
STRIPE_ONBOARDING_RETURN_BASE_URL=https://www.obieo.com
STRIPE_ONBOARDING_SUCCESS_URL=https://www.obieo.com/checkout/success?session_id={CHECKOUT_SESSION_ID}
STRIPE_ONBOARDING_CANCEL_URL=https://www.obieo.com/checkout/cancel
CLIENT_PORTAL_LOGIN_URL=https://www.obieo.com/sign-in
CLERK_INVITATION_REDIRECT_URL=https://www.obieo.com/portal
```

## 6.1) End-to-End Smoke Test (Recommended Before First Live Customer)

1. Start app locally:
   - `npm run dev`
2. In another terminal, forward Stripe webhooks:
   - `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - copy the printed signing secret into `.env.local` as `STRIPE_WEBHOOK_SECRET`
3. Open onboarding tool:
   - `http://localhost:3000/internal/leadgen/onboarding`
4. Submit a test client and click `Open Initial Charge Checkout`.
5. Complete payment in Stripe checkout.
6. Verify webhook response logs show `handled: true`.
7. Confirm customer receives:
   - Clerk invitation email (account activation + password setup)
   - Resend confirmation email
8. Log in with that invited account at:
   - `http://localhost:3000/sign-in`
9. Confirm post-login route works:
   - `http://localhost:3000/portal`

## 7) Lead Replacement Request API (Credit Workflow)

Endpoint:

`POST /api/leads/replacements`

Auth:

`Authorization: Bearer <LEAD_REPLACEMENT_API_SECRET>`

If `LEAD_REPLACEMENT_API_SECRET` is not set, this route falls back to `GHL_LEAD_DELIVERED_WEBHOOK_SECRET`.

Example payload:

```json
{
  "portalKey": "roofing-solutions-usa",
  "sourceExternalId": "ghl-opportunity-12345",
  "reason": "never_answered",
  "contactAttemptedAt": "2026-02-11T14:09:00-05:00",
  "contactAttemptMethod": "double_call",
  "evidenceNotes": "Double-called in 6 minutes, no answer.",
  "evidenceUrls": ["https://example.com/call-log-screenshot"],
  "requestedBy": "elijah@nemediagroup.com"
}
```

Current auto-checks:

1. Request is within 7 days of `deliveredAt`.
2. First contact attempt occurred within 15 minutes of lead delivery.
3. Reason is in allowed credit reason codes.
4. Lead status is still `delivered` (not already credited/invalid).

Response includes the policy booleans so you can explain why a request was auto-rejected.

## 8) Lead Replacement Resolution API (Internal)

Endpoint:

`POST /api/leads/replacements/resolve`

Auth:

`Authorization: Bearer <LEAD_REPLACEMENT_ADMIN_API_SECRET>`

If `LEAD_REPLACEMENT_ADMIN_API_SECRET` is not set, this route falls back to `LEAD_REPLACEMENT_API_SECRET`, then `GHL_LEAD_DELIVERED_WEBHOOK_SECRET`.

Example payload:

```json
{
  "requestId": "k17g8n0kq5w6...",
  "decision": "approve",
  "resolutionNotes": "Verified call logs and issue type.",
  "resolvedBy": "ops@obieo.com"
}
```

Approval effects:

1. Replacement request status becomes `approved`.
2. Lead status is patched to `credited`.
3. Billing/audit event is logged.
4. Internal notification queue entry is created.
## Convex Auth Secret Setup (Required for Onboarding + Lead Storage)

The internal onboarding flow stores client records in Convex via HTTP mutations.
Those mutations are protected by a shared secret:

- `CONVEX_AUTH_ADAPTER_SECRET` in **Next.js** (`.env.local`)
- `CONVEX_AUTH_ADAPTER_SECRET` in **Convex** (deployment environment variables)

They must match exactly.

If you already have the secret in `.env.local`, you can sync it to Convex with:

```bash
cd /Users/hunterlapeyre/Developer/obieo
./scripts/convex-sync-auth-secret.sh
```

If the Convex CLI prompts you to authenticate, either:

- Set `CONVEX_DEPLOY_KEY` in your shell (recommended for headless / CI), or
- Run `npx convex dev` once to link your local repo to the deployment.
