# Airtable Ops Audit

Date: 2026-03-14

## Goal

Make the Obieo Airtable setup more intuitive for operators without drifting away from the real billing and delivery truth stored in Convex.

## Current Problems

1. `User ID` is missing on some live client rows.
   - This is the highest-risk issue because the app uses Airtable `User ID` as the stable `portalKey` match.
   - Rows missing `User ID` cannot be matched safely by the sync and webhook flows.

2. `Pricing Tier` is too limited.
   - Airtable currently only supports `10/20/40/80 Lead Package` and fixed PPL labels.
   - The app already supports custom paid-in-full packages in production.
   - Standard commitment deals can also look misleading if the row shows only the prepaid portion.

3. `Credits Owed` is a manual dropdown, while the real credit math is split across rollups.
   - `Credits Owed` currently behaves like a manual ops reminder.
   - `Total Credited`, `Total Owed (#)`, and `Total Owed ($)` are the actual computed history from `Lead Sheet`.

4. `Outbound Account` is ambiguous.
   - The values are `1. Roofing` through `10. Roofing`.
   - This looks more like a routing slot or seat than an account label.

5. Airtable mixes lifecycle truth, CS truth, delivery truth, and billing truth in one table without clear boundaries.

## Recommended Mental Model

- Convex is the source of truth for:
  - client identity (`portalKey`)
  - billing model
  - prepaid credits
  - package commitment
  - delivered leads
  - approved credits / top-ups

- Airtable is the source of truth for:
  - operator views
  - manual workflows
  - simple summaries
  - day-to-day status coordination

## Recommended Field Intent

- `User ID`
  - Stable client identity.
  - Must always equal Convex `portalKey`.

- `Pricing Tier`
  - Short operator-facing plan type only.
  - It should describe the package archetype, not the lifetime accumulated balance.
  - Example: two separate 40-lead re-ups should still read `40 Lead Package`, not `80 Lead Package`.

- `Client Notes`
  - Best place to surface non-obvious billing terms until a dedicated billing-summary field exists.

- `Total Delivered`
  - Delivery history.

- `Total Credited`
  - Lifetime make-goods already granted.

- `Pending Credits`
  - Manual or formula-backed queue of credits still owed but not yet granted.

- `Remaining Leads`
  - Best operator balance field for package clients.
  - Formula concept:
  - `package commitment + total credited - total delivered`

- `Current Lead Commitment`
  - Current total lead commitment synced from Convex.
  - This is where cumulative package balance belongs.

- `Package Purchases`
  - Count of package purchase events recorded in Convex.
  - Best quick answer to “did this client re-up once or twice?”

## Recommended Schema Changes

### High Priority

1. Keep `User ID` required for every live client row.
2. Add `Custom Package` as a `Pricing Tier` option.
3. Rename `Credits Owed` to `Pending Credits`.
4. Add a dedicated `Billing Terms Summary` long-text field or formula-backed display field.
5. Add `Remaining Leads` as an explicit numeric/formula field for package clients.
6. Add `Current Lead Commitment` and `Package Purchases` so repeat package buys do not distort `Pricing Tier`.

### Medium Priority

1. Rename `Outbound Account` to `Outbound Seat` or `Routing Slot`.
2. Split lifecycle status from CS status more clearly in views and naming.
3. Review all views that currently filter on `Pricing Tier` exact labels.

## Safe Automated Fixes Applied In Repo

1. Airtable pricing sync now returns `Custom Package` when a package deal does not match the fixed `10/20/40/80` buckets.
2. Airtable onboarding sync now copies billing terms into `Client Notes` when the billing arrangement is non-obvious, especially for custom packages and non-standard billing models.
3. Airtable sync now also writes a dedicated `Billing Terms Summary` field so package terms do not have to live only in notes.

## Safe Live Data Fixes To Apply

1. Patch missing `User ID` values where a confident Convex match exists.
2. Correct misleading `Pricing Tier` values where Convex billing terms are already known.
3. Add billing terms note text to rows that would otherwise be hard to interpret from Airtable alone.

## Changes Executed

1. Renamed high-confusion Airtable fields for operator clarity:
   - `STATUS (drop down)` -> `Lifecycle Status`
   - `CS STATUS` -> `CS Status`
   - `Outbound Account (drop down)` -> `Outbound Seat (manual)`
   - `Credits Owed (drop down)` -> `Pending Credits (manual)`
   - `Total Credited` -> `Lifetime Credits Granted`
   - `Total Owed (#)` -> `Pending Credits Count`
   - `Total Owed ($)` -> `Pending Credits Value ($)`
   - `Lost Revenue On Credits` -> `Credits Granted Value ($)`
   - `How many leads per day?` -> `Target Leads / Day`
   - `User ID` -> `Portal Key (stable ID)`
   - `Lead Sheet 2` -> `Linked Leads`
   - `Client Portal Summary` -> `Billing Terms Summary`
2. Added `Custom Package` as a real `Pricing Tier` option in Airtable.
3. Filled missing stable IDs where the match was exact:
   - `Guardian Exteriors` -> `guardian-exteriors-13b8e6`
   - `FLT ENTERPRISES` -> `flt-enterprises-f95339`
4. Backfilled billing summaries into Airtable for all rows with confident Convex matches.
5. Corrected misleading pricing labels where Convex billing terms were already known.
6. Added live operator balance fields:
   - `Current Lead Commitment`
   - `Remaining Leads`
   - `Package Purchases`
7. Updated sync logic so repeated standard package purchases stay labeled by plan type instead of inflating `Pricing Tier`.

## Manual Follow-Up

1. Review views that group clients by `Pricing Tier`.
2. Update any Airtable views to surface `Remaining Leads`, `Current Lead Commitment`, and `Package Purchases` together.
3. Decide whether `Pending Credits` should stay manual or be driven from lead replacement workflow state.
