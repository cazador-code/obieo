# Airtable Package Re-up Reconciliation

Use this when a client bought another package and Airtable needs to show the repeat purchase clearly without collapsing plan type and cumulative balance into one field.

## Goal

- Keep `Pricing Tier` as the package archetype, for example `40 Lead Package`.
- Show repeat-buy history separately, for example `2 x 40 Lead Packages purchased`.
- Treat Airtable `Lead Sheet` as the source of truth for delivered lead history and remaining-balance math.

## Safe sequence

1. Confirm the client identity.
- Airtable row: verify `Portal Key (stable ID)`.
- Convex org: verify the same `portalKey`.

2. Confirm the purchase event that should be reflected.
- If the purchase already exists in Stripe/Convex, do not add it again.
- If it is a manual reconciliation, use an idempotent purchase key like `manual:<client>-<package>-<date>`.

3. Record the package purchase in Convex only once.
- Use:
```bash
node scripts/record-convex-package-purchase.mjs \
  --portal-key "<portal-key>" \
  --company-name "<company name>" \
  --purchase-key "manual:<client>-<package>-<date>" \
  --billing-model package_40_paid_in_full \
  --prepaid-lead-credits 40 \
  --lead-commitment-total 40 \
  --initial-charge-cents 160000 \
  --lead-charge-threshold 10 \
  --lead-unit-price-cents 4000
```

4. Sync Airtable from the corrected billing snapshot.
- Use:
```bash
export AIRTABLE_PERSONAL_ACCESS_TOKEN="$(sed -n 's/^AIRTABLE_PERSONAL_ACCESS_TOKEN=\"\\(.*\\)\"$/\\1/p' /tmp/obieo-vercel.env)"
set -a
source .env.local
set +a
node scripts/airtable_cleanup_schema_and_sync.mjs
```

5. Make the repeat purchase visible in Airtable.
- Unhide and place these fields near `Pricing Tier`:
  - `Billing Terms Summary`
  - `Package Purchases`
  - `Current Lead Commitment`
  - `Remaining Leads`

## What the row should communicate

- `Pricing Tier`: plan type, not cumulative quantity.
- `Billing Terms Summary`: human-readable package history.
- `Package Purchases`: count of package re-ups.
- `Current Lead Commitment`: total purchased lead commitment.
- `Remaining Leads`: package balance.

## Gotchas

- If those fields are hidden, the row will still look like a single-package client even when the re-up is recorded correctly.
- Do not use `80 Lead Package` to represent two 40-lead purchases unless the client actually changed to a distinct 80-lead product.
- If Airtable `Total Leads Sent` and `Remaining Leads` disagree, trust Airtable `Lead Sheet` history first and reconcile Convex math to it.
- Parse `.env.local` or pulled env files carefully; do not blindly `source` files that may contain shell-breaking values.
