# Whop Webhook Setup

This is the env/config we need to automate Obieo after a Whop payment succeeds.

## Put These In Local Env

Add these to `.env.local`:

```env
WHOP_API_KEY=
WHOP_WEBHOOK_SECRET=
WHOP_COMPANY_ID=
WHOP_PRODUCT_ID=
WHOP_WEBHOOK_API_VERSION=v1
NEXT_PUBLIC_WHOP_DEFAULT_PURCHASE_URL=
```

## Put These In Vercel

Add the same values to the Vercel project environment variables for:

- `Production`
- `Preview` if you want to test on preview deployments

## What Each One Means

- `WHOP_API_KEY`
  Company/app API key used to retrieve payment details from Whop if needed.

- `WHOP_WEBHOOK_SECRET`
  Secret used to verify that incoming webhook requests really came from Whop.

- `WHOP_COMPANY_ID`
  Your Whop business/company ID, usually starts with `biz_`.

- `WHOP_PRODUCT_ID`
  Optional default product ID for your standard lead package. Helpful if we want to map a standard 40-lead offer directly.

- `WHOP_WEBHOOK_API_VERSION`
  Keep this on `v1` to match Whop's current webhook guidance.

- `NEXT_PUBLIC_WHOP_DEFAULT_PURCHASE_URL`
  Optional helper URL for the standard purchase link you most often send.

## Whop Events We Care About

Start with:

- `payment.succeeded`
- `payment.failed`

Nice to have later:

- `membership.activated`
- `membership.deactivated`

## Data Whop Says We Get On `payment.succeeded`

Whop's docs show the webhook includes a payment object with fields like:

- payment id
- created / paid timestamps
- product id, title, route
- user id, name, username, email
- member id, phone
- company id
- total / subtotal / currency
- payment method details
- billing address
- metadata object

That is enough for us to identify:

- who paid
- what they bought
- how much they paid
- which payment this was

## Target Automation Flow

1. Whop sends `payment.succeeded` to Obieo.
2. Obieo verifies the webhook signature.
3. Obieo checks whether the payment matches a known client or should create a new one.
4. Obieo records the purchase in Convex.
5. Obieo sends the onboarding invite automatically.
6. Airtable sync updates automatically.

## Important Note

Whop tells us that a payment succeeded. It does not automatically know your internal package rules unless we map them.

So we will still need one of these strategies:

1. Product-based mapping
   Standard Whop product IDs map to known billing models like 20-lead, 40-lead, etc.

2. Metadata-based mapping
   The Whop payment or checkout carries metadata like `portalKey`, billing model, package size, or source tag.

3. Hybrid
   Product ID covers standard offers, metadata handles custom packages and re-ups.

Hybrid is probably the safest long-term setup.
