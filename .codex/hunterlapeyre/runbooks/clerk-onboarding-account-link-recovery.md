# Clerk Onboarding "Account Not Linked" Recovery

Use when a signed-in customer sees:
`Account is not linked to this organization. Please contact support.`
on `/leadgen/onboarding`.

## Preconditions
- Repo root: `/Users/hunterlapeyre/Developer/obieo`
- `.env.local` contains valid `CLERK_SECRET_KEY`

## 1) Confirm user email and typo drift
Check exact domain and spelling from screenshot/UI (common drift: `bestchouce` vs `bestchoice`).

```bash
set -a; source .env.local; set +a
curl -sS -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  "https://api.clerk.com/v1/users?email_address=<email>&limit=10" | jq 'length'
```

If `0`, check likely variants immediately.

## 2) Confirm invitation state and portal mapping
```bash
set -a; source .env.local; set +a
curl -sS -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  "https://api.clerk.com/v1/invitations?limit=500&offset=0" \
  | jq '.[] | select((.email_address|ascii_downcase)==("<email>|ascii_downcase")) | {id,email_address,status,public_metadata,created_at}'
```

Expected: `status: "pending"` or accepted history, and `public_metadata.portalKey` present.

## 3) Confirm signed-in user metadata
```bash
set -a; source .env.local; set +a
curl -sS -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  "https://api.clerk.com/v1/users?email_address=<email>&limit=10" \
  | jq '[.[] | {id,email_addresses:[.email_addresses[].email_address],public_metadata,last_sign_in_at}]'
```

If `public_metadata.portalKey` is missing but user is valid, this is metadata-link drift.

## 4) Immediate unblock (one-time metadata patch)
```bash
set -a; source .env.local; set +a
curl -sS -X PATCH \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  "https://api.clerk.com/v1/users/<user_id>/metadata" \
  --data '{"public_metadata":{"portalKey":"<portal_key>"}}' \
  | jq '{id,public_metadata}'
```

Then ask customer to refresh and submit onboarding again.

## 5) Permanent fix expectation
`src/app/api/public/leadgen/onboarding-complete/route.ts` should self-heal:
- If `portalKey` metadata missing, verify signed-in primary email equals intent billing email.
- Backfill `public_metadata.portalKey`.
- Continue onboarding completion.
