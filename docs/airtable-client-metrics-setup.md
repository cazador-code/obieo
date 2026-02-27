# Airtable Client Metrics Setup

This sets `Client Table` metrics to auto-populate from linked rows in:

- `Lead Sheet`
- `Failed Charges`

It also uses webhook + script support in this repo to keep those links populated.

## 1) Lead Sheet Helper Fields

Create these helper fields in `Lead Sheet`:

1. `Lead Is Today` (Formula)
   - Formula:
   - `IF(IS_SAME({Timestamp}, TODAY(), 'day'), 1, 0)`
2. `Lead Is Credited` (Formula)
   - Formula:
   - `IF({Lead Status}='Credit', 1, 0)`
3. `Lead Is Owed` (Formula)
   - Formula:
   - `IF({Lead Status}='Owed', 1, 0)`
4. `Lead Paid Amount` (Formula)
   - Formula:
   - `IF({Lead Status}='Charged', {Lead Value}, 0)`
5. `Lead Owed Amount` (Formula)
   - Formula:
   - `IF({Lead Status}='Owed', {Lead Value}, 0)`
6. `Lead Lost Revenue Amount` (Formula)
   - Formula:
   - `IF({Lead Status}='Credit', {Lead Value}, 0)`

## 2) Client Table Metrics Fields

Keep `Lead Sheet 2` and `Failed Charges` as linked-record fields.

Then wire metric fields like this:

1. `Total Leads Sent`
   - Type: `Count`
   - Linked field: `Lead Sheet 2`
2. `Leads Today`
   - Type: `Rollup`
   - Linked field: `Lead Sheet 2`
   - Field to roll up: `Lead Is Today`
   - Aggregation formula: `SUM(values)`
3. `Total Credited`
   - Type: `Rollup`
   - Linked field: `Lead Sheet 2`
   - Field to roll up: `Lead Is Credited`
   - Aggregation formula: `SUM(values)`
4. `Total Owed (#)`
   - Type: `Rollup`
   - Linked field: `Lead Sheet 2`
   - Field to roll up: `Lead Is Owed`
   - Aggregation formula: `SUM(values)`
5. `Total Paid`
   - Type: `Rollup`
   - Linked field: `Lead Sheet 2`
   - Field to roll up: `Lead Paid Amount`
   - Aggregation formula: `SUM(values)`
6. `Total Owed ($)`
   - Type: `Rollup`
   - Linked field: `Lead Sheet 2`
   - Field to roll up: `Lead Owed Amount`
   - Aggregation formula: `SUM(values)`
7. `Lost Revenue On Credits`
   - Type: `Rollup`
   - Linked field: `Lead Sheet 2`
   - Field to roll up: `Lead Lost Revenue Amount`
   - Aggregation formula: `SUM(values)`
8. `Failed Charges $`
   - Type: `Rollup`
   - Linked field: `Failed Charges`
   - Field to roll up: `Amount Failed $`
   - Aggregation formula: `SUM(values)`

## 3) Auto-Linking Webhooks

The app now supports automatic link synchronization:

1. Lead sheet link sync (existing route):
   - `POST /api/webhooks/airtable/lead-delivered`
   - Include in payload:
   - `recordId` (or `record_id`)
   - plus one of:
   - `portalKey`, or `businessName`, or `email`
2. Failed charge link sync (new route):
   - `POST /api/webhooks/airtable/failed-charge`
   - Include in payload:
   - `recordId` (or `failedChargeRecordId`)
   - plus one of:
   - `portalKey`, or `businessName`, or `email`

Auth:

- `Authorization: Bearer <secret>`
- Lead route secret: `AIRTABLE_LEAD_DELIVERED_WEBHOOK_SECRET`
- Failed-charge route secret: `AIRTABLE_FAILED_CHARGE_WEBHOOK_SECRET` (falls back to lead secret if unset)

## 4) Backfill Existing Unlinked Rows

Run:

```bash
node scripts/backfill-airtable-metrics-links.mjs --env-file /path/to/env --dry-run
node scripts/backfill-airtable-metrics-links.mjs --env-file /path/to/env --write
```

This script backfills:

- `Lead Sheet.Business Name` link (when a confident match exists)
- `Failed Charges.Client Link` link (via client name/email match)
