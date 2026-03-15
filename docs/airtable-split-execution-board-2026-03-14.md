# Airtable Split Execution Board

Date: 2026-03-14

## Goal

Split the current Airtable `Client Table` into a safer 3-part structure without breaking:

- `Lead Sheet` links
- Airtable-first lead history
- backfill from Airtable to Convex
- onboarding sync
- billing sync
- ZIP conflict checks

## Final Table Shape

This should be a hub-and-extension model, not 3 peer tables.

### 1. `Clients` (parent hub)

This remains the canonical Airtable row that `Lead Sheet` links to.

Keep on parent:

- `Business Name`
- `Portal Key (stable ID)`
- `Lifecycle Status`
- `Zip Codes to target`
- `Linked Leads`
- `Contractors Name` or renamed `Primary Contact Name`
- `Business Phone #`
- `Cell Phone # to receive Lead Notifications`
- `Email Address to receive Lead Notifications`
- `Email you want to use to Communicate with Prospects`
- `Services Offered`
- `CLIENT CITY (short text)`
- `Target Leads / Day`

Why these stay:

- They are used for matching, onboarding/profile sync, ZIP conflict review, or day-to-day client identity.
- `Lead Sheet` and future event tables should link here, not to extension tables.

### 2. `Client Metrics` (1:1 extension)

Move here:

- `Total Leads Sent`
- `Leads Today`
- `Lifetime Credits Granted`
- `Pending Credits Count`
- `Pending Credits Value ($)`
- `Credits Granted Value ($)`
- `Total Paid`
- `Failed Charges $`
- `Failed Charges Count`
- `Pricing Tier`
- `Billing Terms Summary`
- `Current Lead Commitment`
- `Remaining Leads`
- `Package Purchases`

Purpose:

- read-only or mostly automated metrics
- billing/package balance snapshot
- lead and credit reporting

### 3. `Client Ops` (1:1 extension)

Move here:

- `CS Status`
- `Outbound Seat (manual)`
- `Pending Credits (manual)`
- `Client Notes`
- `Zip Codes Scraped (short text)`
- `Monday Checkup`
- `Wednesday Checkup`
- `Friday Checkup`
- `Lead Sheet copy`

Purpose:

- manual workflows
- fulfillment status
- future team handoff fields

## Exact Field Source Rules

### Airtable-first lead truth

These remain Airtable-first today:

- `Lead Sheet`
- `Linked Leads`
- lead rollups derived from linked Airtable lead rows

### Convex-first client and billing truth

These should keep being synced from Convex:

- `Portal Key (stable ID)`
- `Pricing Tier`
- `Billing Terms Summary`
- `Current Lead Commitment`
- `Remaining Leads`
- `Package Purchases`
- onboarding-derived ZIP/contact/service fields

### Manual ops truth

These stay manual:

- `CS Status`
- `Outbound Seat (manual)`
- `Pending Credits (manual)`
- `Client Notes`
- future staffing/checkup fields

## Parallel Workstreams

### Workstream 0: Schema Freeze

Owner:

- Main rollout only

Definition of done:

- final field allocation approved
- no more debate about which table owns each field

Blocking:

- everything else

### Workstream 1: Airtable Schema Build

Owner:

- Schema Agent

Write scope:

- Airtable only

Tasks:

1. Create `Client Metrics`
2. Create `Client Ops`
3. Add 1:1 link from `Clients` -> `Client Metrics`
4. Add 1:1 link from `Clients` -> `Client Ops`
5. Add reciprocal links if helpful
6. Build clean views:
   - `Clients - Active`
   - `Clients - Ready to Launch`
   - `Clients - Launched`
   - `Metrics - Billing and Balance`
   - `Ops - Needs Attention`

Safe to run in parallel with:

- Workstream 2
- Workstream 3

### Workstream 2: Sync Refactor

Owner:

- Sync Agent

Primary files:

- [src/lib/airtable-client-zips.ts](/Users/hunterlapeyre/Developer/obieo/src/lib/airtable-client-zips.ts)
- [src/lib/airtable-billing-sync.ts](/Users/hunterlapeyre/Developer/obieo/src/lib/airtable-billing-sync.ts)
- [src/lib/convex.ts](/Users/hunterlapeyre/Developer/obieo/src/lib/convex.ts)

Tasks:

1. Keep parent client sync working exactly as today
2. Add `syncClientMetricsToAirtable`
3. Add `syncClientOpsToAirtable`
4. Add one orchestrator:
   - `syncClientBundleToAirtable`
5. Preserve exact `portalKey` matching
6. Do not change `Lead Sheet` link target

Needs from Workstream 1:

- new table IDs
- new field IDs

### Workstream 3: Onboarding Mapping Cleanup

Owner:

- Onboarding Mapping Agent

Primary files:

- [src/app/app/onboarding/LeadgenOnboardingClient.tsx](/Users/hunterlapeyre/Developer/obieo/src/app/app/onboarding/LeadgenOnboardingClient.tsx)
- [src/app/api/public/leadgen/onboarding-complete/route.ts](/Users/hunterlapeyre/Developer/obieo/src/app/api/public/leadgen/onboarding-complete/route.ts)
- [src/app/api/onboarding/clients/route.ts](/Users/hunterlapeyre/Developer/obieo/src/app/api/onboarding/clients/route.ts)
- [src/lib/convex.ts](/Users/hunterlapeyre/Developer/obieo/src/lib/convex.ts)

Tasks:

1. Clarify the contact-field destination map
2. Keep onboarding outputs stable while destinations change
3. Decide whether to rename these concepts in code/UI later:
   - `Contractors Name` -> `Primary Contact Name`
   - `Cell Phone # to receive Lead Notifications` -> `Lead Notification Phone`
   - `Email Address to receive Lead Notifications` -> `Lead Notification Email`
   - `Email you want to use to Communicate with Prospects` -> `Prospect Reply Email`

Safe to run in parallel with:

- Workstream 1

### Workstream 4: Migration / Backfill

Owner:

- Migration Agent

Primary files:

- new `scripts/airtable_split_client_table_backfill.mjs`
- maybe shared config in [src/lib/airtable-backfill-defaults.json](/Users/hunterlapeyre/Developer/obieo/src/lib/airtable-backfill-defaults.json)

Tasks:

1. For every parent `Clients` row:
   - create one `Client Metrics` row
   - create one `Client Ops` row
2. Link both extension rows back to parent
3. Copy current values from existing `Client Table`
4. Produce validation output

Validation rules:

- exactly one metrics row per parent client
- exactly one ops row per parent client
- zero changes to `Lead Sheet` client links

Can start after:

- Workstream 1 is done

Can run in parallel with:

- Workstream 2 once schema IDs are known

### Workstream 5: Lead-Link and Backfill Safety

Owner:

- Safety Agent

Primary files:

- [src/lib/airtable-client-links.ts](/Users/hunterlapeyre/Developer/obieo/src/lib/airtable-client-links.ts)
- [src/lib/airtable-lead-backfill.ts](/Users/hunterlapeyre/Developer/obieo/src/lib/airtable-lead-backfill.ts)
- [src/app/api/internal/clients/resync-airtable/route.ts](/Users/hunterlapeyre/Developer/obieo/src/app/api/internal/clients/resync-airtable/route.ts)

Tasks:

1. Confirm `Lead Sheet` still links to parent `Clients`
2. Confirm backfill still reads linked leads from parent `Clients`
3. Confirm manual resync still works
4. Confirm webhook-based Airtable client linking still resolves the parent table

This workstream must veto any attempt to move `Linked Leads` off the parent table.

### Workstream 6: Views and Hiding Old Columns

Owner:

- Views Agent

Tasks:

1. Hide moved columns from parent `Clients` views
2. Keep old columns temporarily for dual-write period
3. After validation, remove or archive duplicate fields from default views
4. Keep future-hire tables visible only in a secondary workspace area, not in the daily operating surface

Can start after:

- Workstream 1

Best finished after:

- Workstream 5 validates the cutover

## Required Sequential Order

1. Schema Freeze
2. Airtable Schema Build
3. Sync Refactor + Migration in parallel
4. Lead-Link and Backfill Safety validation
5. Hide old columns and cut views over

## Exact File Ownership

### Sync Agent

- [src/lib/airtable-client-zips.ts](/Users/hunterlapeyre/Developer/obieo/src/lib/airtable-client-zips.ts)
- [src/lib/airtable-billing-sync.ts](/Users/hunterlapeyre/Developer/obieo/src/lib/airtable-billing-sync.ts)
- [src/lib/convex.ts](/Users/hunterlapeyre/Developer/obieo/src/lib/convex.ts)

### Safety Agent

- [src/lib/airtable-client-links.ts](/Users/hunterlapeyre/Developer/obieo/src/lib/airtable-client-links.ts)
- [src/lib/airtable-lead-backfill.ts](/Users/hunterlapeyre/Developer/obieo/src/lib/airtable-lead-backfill.ts)
- [src/app/api/internal/clients/resync-airtable/route.ts](/Users/hunterlapeyre/Developer/obieo/src/app/api/internal/clients/resync-airtable/route.ts)

### Migration Agent

- new `scripts/airtable_split_client_table_backfill.mjs`
- maybe config updates in [src/lib/airtable-backfill-defaults.json](/Users/hunterlapeyre/Developer/obieo/src/lib/airtable-backfill-defaults.json)

### Onboarding Mapping Agent

- [src/app/app/onboarding/LeadgenOnboardingClient.tsx](/Users/hunterlapeyre/Developer/obieo/src/app/app/onboarding/LeadgenOnboardingClient.tsx)
- [src/app/api/public/leadgen/onboarding-complete/route.ts](/Users/hunterlapeyre/Developer/obieo/src/app/api/public/leadgen/onboarding-complete/route.ts)
- [src/app/api/onboarding/clients/route.ts](/Users/hunterlapeyre/Developer/obieo/src/app/api/onboarding/clients/route.ts)

## Immediate Next Move

Today, the fastest clean start is:

1. approve the field allocation above
2. create the two extension tables in Airtable
3. start the sync refactor and migration script in parallel

## Definition of Success

We are done when:

- `Lead Sheet` still links to the parent client row
- parent `Clients` rows still resolve by `portalKey`
- metrics live in `Client Metrics`
- manual workflow state lives in `Client Ops`
- onboarding and billing sync still work
- resync/backfill still work
- the default Airtable working surface is materially less cluttered
