# Airtable Holistic Client Database Audit

Date: 2026-03-14
Base: `Obieo SMS Fulfillment Tracker`
Base ID: `appqsVEAHr4AaaBAt`

## Why this audit exists

The current Airtable base mixes three different jobs into one place:

1. source-of-truth client data
2. operator-facing workflow views
3. historical event logging

That is the main reason the base feels redundant and column-heavy.

The cleanest long-term shape is:

- Airtable = source of truth for lead history under the current GHL -> n8n -> Airtable flow
- Convex = canonical app-side database for client identity, billing, package balance, lifecycle state, and portal workflows
- Airtable `Client Table` = operator UI and reporting layer fed by syncs from Convex plus a small amount of manual workflow state

## Live findings from Airtable

### Table usage

- `Client Table`: 9 records, actively used
- `Lead Sheet`: 113 records, actively used
- `Successful Charges`: 0 records
- `Failed Charges`: 0 records
- `Daily Client Success Updates`: 0 records
- `Daily Call Updates`: 0 records
- `Daily End of Day Updates`: 0 records

### Active automation pattern

The live automation is concentrated in two places:

- `Client Table` holds the operator-facing client snapshot
- `Lead Sheet` holds delivered lead history linked back to clients

The repo sync paths already support this model:

- Airtable row sync from Convex billing/org snapshot
- Airtable client row matching by `Portal Key (stable ID)`
- Airtable lead linking from the lead-delivered webhook

### What is actually derived today

These `Client Table` fields are already behaving like derived metrics or synced snapshot fields:

- `Total Leads Sent`
- `Leads Today`
- `Lifetime Credits Granted`
- `Pending Credits Count`
- `Pending Credits Value ($)`
- `Credits Granted Value ($)`
- `Billing Terms Summary`
- `Current Lead Commitment`
- `Remaining Leads`
- `Package Purchases`

These should not be treated like manual data-entry fields.

### What looks redundant or weakly modeled

#### 1. Duplicate contact fields

Several rows currently repeat the same value across:

- `Business Phone #`
- `Cell Phone # to receive Lead Notifications`

And the same email is often repeated across:

- `Email Address to receive Lead Notifications`
- `Email you want to use to Communicate with Prospects`

This means the base is storing multiple concepts as flat columns even when they collapse to the same real-world contact.

#### 2. Billing duplicated in multiple places

Billing context is currently spread across:

- `Pricing Tier`
- `Billing Terms Summary`
- `Client Notes`
- package rollup metrics

`Pricing Tier` is useful as a short operator label, but it is not enough to explain custom deals.
`Billing Terms Summary` is the right operator-facing display field.
`Client Notes` should not also carry billing truth unless there is a true exception note.

#### 3. Manual workflow state mixed with canonical state

These are manual workflow fields:

- `Lifecycle Status`
- `CS Status`
- `Outbound Seat (manual)`
- `Pending Credits (manual)`

Those are fine as operator controls, but they should be clearly separated from synced truth. Right now they sit beside canonical metrics in one flat table, which makes the table feel noisy and ambiguous.

#### 4. Dead tables are creating fake optionality

These tables are currently empty:

- `Successful Charges`
- `Failed Charges`
- `Daily Client Success Updates`
- `Daily Call Updates`
- `Daily End of Day Updates`

Because they are empty, the related `Client Table` metrics for payments and failed charges are structurally present but operationally dead.

If a table has zero rows and no active write path, it is not a database asset yet. It is just schema overhead.

#### 5. Text-log tables are not normalized

If `Daily Call Updates` is revived later, `Client Name` should not be a plain text field. It should link to `Client Table` by record ID or `Portal Key`.

Right now the design would allow:

- misspelled client names
- duplicate client identities
- no safe rollups back to a single client

## Recommended target model

### 1. Use a hybrid source-of-truth model

Use Airtable as the current truth for:

- delivered lead history in `Lead Sheet`
- client-linked lead rollups and recovery/backfill inputs

Use Convex as the current truth for:

- `portalKey`
- company name
- billing model
- package purchases
- current commitment
- remaining leads
- credit/replacement event history
- onboarding status
- target ZIPs
- service areas
- client contacts

This matches the repo more closely:

- the internal clients dashboard is built from Convex and Clerk
- lead-history recovery currently flows from Airtable back into Convex

### 2. Reduce Airtable to three practical jobs

Keep Airtable as:

1. `Clients`
   - one row per client snapshot
   - mostly synced from Convex
   - a few manual workflow columns
2. `Lead Events`
   - one row per delivered or credited lead
   - linked to client
3. optional `Client Activity`
   - only if the team will actually log calls / issues
   - linked to client, not free-text client name

### 3. Collapse or archive unused tables

Archive unless you immediately wire them into production:

- `Successful Charges`
- `Failed Charges`
- `Daily Client Success Updates`
- `Daily Call Updates`
- `Daily End of Day Updates`

If you later need payment history in Airtable, create a single `Billing Events` table synced from Convex or Stripe instead of separate “successful” and “failed” tables.

### 4. Split fields into three sections inside `Client Table`

#### Section A: Canonical synced snapshot

- `Business Name`
- `Portal Key (stable ID)`
- `Pricing Tier`
- `Billing Terms Summary`
- `Current Lead Commitment`
- `Remaining Leads`
- `Package Purchases`
- `Target Leads / Day`
- `Services Offered`
- `CLIENT CITY (short text)`
- `Zip Codes to target`

These should be written by syncs, not by hand in normal operation.

#### Section B: Derived metrics

- `Total Leads Sent`
- `Leads Today`
- `Lifetime Credits Granted`
- `Pending Credits Count`
- `Pending Credits Value ($)`
- `Credits Granted Value ($)`

These should be grouped visually and treated as read-only dashboard fields.

#### Section C: Manual ops fields

- `Lifecycle Status`
- `CS Status`
- `Outbound Seat (manual)`
- `Pending Credits (manual)`
- `Client Notes`

These are the only fields that should regularly need human editing.

## Field-by-field recommendations

### Keep

- `Business Name`
- `Portal Key (stable ID)`
- `Lifecycle Status`
- `CS Status`
- `Pricing Tier`
- `Billing Terms Summary`
- `Target Leads / Day`
- `Client Notes`
- `Services Offered`
- `CLIENT CITY (short text)`
- `Zip Codes to target`
- derived lead/package metrics

### Keep but clarify

- `Contractors Name`
  - Keep only if this means the primary human contact.
  - Rename to `Primary Contact Name` if that is the real use.

- `Business Phone #`
  - Keep if it means public company phone.

- `Cell Phone # to receive Lead Notifications`
  - Keep if it means ops notification line.
  - Rename to `Lead Notification Phone`.

- `Email Address to receive Lead Notifications`
  - Keep if it means ops notification inbox.
  - Rename to `Lead Notification Email`.

- `Email you want to use to Communicate with Prospects`
  - Keep if it really differs from notification email.
  - Rename to `Prospect Reply Email`.

### Remove or archive

- `Lead Sheet copy`
  - This field does not belong in a normalized client table.

- `Monday Checkup`
- `Wednesday Checkup`
- `Friday Checkup`
  - Archive unless the team is actually using them weekly.
  - They are the kind of checkbox that creates static noise without durable value.

### Convert to fully automated or hide from default views

- `Total Paid`
- `Failed Charges $`
- `Failed Charges Count`

Do not keep these visible as first-class columns unless you restore a real billing-events sync into Airtable.

## Highest-leverage architecture move

The most important shift is not another Airtable cleanup.

The most important shift is:

- keep Airtable as the lead-history source of truth for now
- stop using one giant `Client Table` row as the place every other concern lives
- let Convex own the app-side client, billing, and onboarding truth
- let Airtable become a cleaner operator-facing mirror around that hybrid model

That gives you:

- one canonical client ID
- one place for billing/package truth
- one place for lead-event truth
- fewer manual corrections
- fewer duplicate columns
- safer automation

## Recommended implementation order

### Phase 1: Clean the Airtable surface

1. Archive the 5 empty tables.
2. Hide or archive dead columns:
   - `Lead Sheet copy`
   - checkup checkboxes
3. Rename contact fields so each one has one clear purpose.
4. Group `Client Table` views into:
   - Synced Snapshot
   - Derived Metrics
   - Manual Ops

### Phase 2: Make Convex the real client database

1. Ensure every client row maps to a `portalKey`.
2. Keep package balance, billing model, purchase events, and lead counts canonical in Convex.
3. Continue syncing only the snapshot fields Airtable operators need.
4. Stop using Airtable as the place where billing truth is manually interpreted.

### Phase 3: Reintroduce only the tables you can auto-fill

Only add or keep a table if the app or automation writes to it automatically.

Good examples:

- `Lead Events`
- `Billing Events`
- `Client Activity`

Bad examples:

- daily check-in tables no one fills out
- split payment tables with no sync path
- free-text client logs without linked client identity

## Bottom line

The live base is not suffering from too little schema. It is suffering from too many mixed purposes.

Right now:

- `Client Table` + `Lead Sheet` are the real system
- five other tables are dead weight
- several contact and billing columns overlap
- Convex is already the better candidate for the backend database

So the right move is:

- simplify Airtable into an ops mirror
- keep only a small set of manual workflow fields
- let Convex own the real client database
