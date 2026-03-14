# Runbook: Airtable Duplicate Client Row Targeted Repair

## Goal
Fix one broken Airtable client-row resolver case without triggering a broader identity migration or changing unrelated client data.

## When To Use This
- Two Airtable client rows appear to represent the same real customer.
- The repo code expects Airtable `User ID` to equal Convex `portalKey`, but production data is only partially backfilled.
- You need the shortest safe repair: one row should resolve for future Airtable sync/linking, and the duplicate should stay untouched until later review.

## Preconditions
- Access to the Airtable Client Table base and table.
- Read access to Convex org/onboarding data if you need to confirm the intended `portalKey`.
- Airtable credentials available either from shell env or parsed from `.vercel/.env.production.local`.

## Steps
1. Identify the duplicate pair and choose the canonical row to keep.
   - Prefer the row that matches the current Convex org/onboarding payload.
   - Do not guess record IDs.
2. Confirm identifier semantics before writing.
   - `portalKey` is the stable client identifier in Convex.
   - Airtable `User ID` is the field current repo code uses to store that `portalKey`.
   - Treat this as a targeted repair, not proof that Airtable identity is globally normalized.
3. Fetch a pre-write snapshot of both Airtable rows.
   - Record at minimum: record id, created time, business name, `User ID`, and identifying contact fields.
4. Apply exactly one Airtable update to the kept row.
   - Set `User ID` on the kept record to the intended `portalKey`.
   - Do not modify the retiring row.
   - Do not merge status/contact fields in the same step unless separately approved.
5. Fetch the kept row again after the write.
6. Run a read-only verification search for exact `User ID = <portalKey>`.
   - Success means exactly one matching row exists, and it is the kept record.
7. Stop after verification.
   - Leave duplicate cleanup, merge review, and broader migration work for a separate pass.

## Verification
- Commands:
  - `node --input-type=module` script that parses `.vercel/.env.production.local`, fetches both records, patches only the kept record `User ID`, then searches Airtable for exact `User ID = <portalKey>`
- Expected result:
  - Pre-write snapshot confirms the target pair.
  - Post-write kept row shows the intended `User ID`.
  - Exact-match verification returns one record only, and it is the kept row.

## Rollback / Undo
- Do not delete the retiring row during the repair.
- If the kept row `User ID` was set incorrectly, restore that field on the kept row to its prior value from the pre-write snapshot.
- Re-run the exact-match verification query to confirm the mistaken value no longer resolves.

## Notes
- Do not `source` `.vercel/.env.production.local` directly; parse it line-by-line because JSON-like env values can break shell parsing.
- Airtable single-record GET requests should not include `fields[]`; fetch the record and filter fields locally.
- If many Airtable client rows still have blank `User ID`, that indicates a partially migrated identity model. Keep this runbook scoped to one-client repair.
