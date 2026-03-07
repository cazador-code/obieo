# VA SOP: Data Collection to GHL Campaign Launch

**Version:** 1.0  
**Last Updated:** 2026-03-05  
**Owner:** Obieo Ops Lead

## 1) Purpose (Plain English)

This SOP shows exactly how we turn raw contact data into a live GHL outreach campaign.

If you follow this step-by-step, every client should move cleanly through:

`waiting for contacts` -> `needs help` -> `add KPI`

## 2) The Data Flow (What Happens to the Data)

1. We identify who needs contacts in Airtable/ClickUp (`waiting for contacts`).
2. We pull target ZIPs and build a list in DealMachine.
3. We run the scraper and create a raw CSV.
4. We clean/normalize that CSV in a spreadsheet.
5. We run phone compliance cleanup in Landline Remover.
6. We post the cleaned CSV + proof in Slack (`submission team`).
7. We import into the correct GHL sub-account.
8. We add required tags (ZIP + legal business name).
9. We launch Outreach automation.
10. We verify count and close status to `add KPI` (or route back to `waiting for contacts` if low volume).

## 3) Tools You Use

1. Airtable/ClickUp: queue, ZIP tracking, and status updates.
2. DealMachine: source list building by ZIP.
3. Scraper CLI: exports raw contact CSV from DealMachine list.
4. Spreadsheet (Google Sheets/Excel): clean and normalize columns.
5. Landline Remover: remove unusable/risky phone numbers.
6. Slack (`ZIP Data Channel`, `submission team`): handoffs and proof.
7. GHL: import contacts, apply tags, launch automation.

## 4) Non-Negotiable Rules

1. Exact status order only: `waiting for contacts` -> `needs help` -> `add KPI`.
2. No launch without both tags in GHL:
   - ZIP tag.
   - Legal business name tag.
3. No completion without thread proof in Slack:
   - CSV attached.
   - Final contact count.
   - Owner tagged.
4. No ZIP work without conflict check against active assignments.
5. No upload if compliance cleanup is not complete.

## 5) Daily Step-by-Step Workflow

### A) Start-of-Shift Triage

1. Open Airtable/ClickUp.
2. Find all clients in `waiting for contacts`.
3. Build your queue in order.
4. Keep `ZIP Data Channel` open in Slack for same-day runout tags.
5. Claim new tagged runouts with `eyes` to prevent duplicate work.
6. Target first CSV handoff before 10:00 AM Eastern.

### B) Pick ZIP + Plan Volume

1. Open client record.
2. Pull next ZIP from `What area do you want us to scrape?`.
3. Check `ZIP codes already scrape` so you do not repeat.
4. Confirm no ZIP conflict with another active client.
5. Plan run volume:
   - Default: 10,000-15,000 rows.
   - If bigger need: split into chunks (do not do one giant run).

### C) Build DealMachine List

1. Delete prior client list first (one-client-only rule).
2. Start new ZIP list (ZIP mode, no spaces in ZIP input).
3. Apply default filters unless documented override:
   - Year Built < 2005
   - Living Area > 1200
4. Build list.
5. Record total pages `N`.
6. Set scrape budget to `N - 2` pages.

### D) Run Scraper

1. Open terminal in the approved scraper workspace.
2. Run approved command with `--max-pages` set to `N - 2`.
3. Use filename format: `clientname_zip_raw.csv`.
4. Wait for full completion.
5. Confirm output file exists and has real rows (not only headers).

Current onboarding standard command:

```bash
node scripts/dealmachine-scraper-hardened.js --max-pages <N_MINUS_2> --output "clientname_zip_raw.csv"
```

Legacy notes may show `node shrek.js`. If command names conflict, follow the currently approved command from Ops.

### E) Clean + Compliance (Hard Gate)

1. Open raw CSV in spreadsheet.
2. Split and normalize fields:
   - First Name / Last Name.
   - Address / City / State / ZIP.
3. Standardize headers for GHL mapping.
4. Ensure names are Proper Case (no ALL CAPS).
5. Run Landline Remover on phone column.
6. Bring results back and remove:
   - Landlines.
   - DNC-flagged numbers.
   - Litigators.
   - Invalid placeholder rows.
7. Save cleaned file as `clientname_zip_clean.csv`.

### F) Slack Handoff (Proof Required)

1. Go to `submission team` thread for that client.
2. Upload cleaned CSV.
3. Post handoff message with:
   - Client name.
   - ZIP batch.
   - Final count.
   - Filename.
   - Status updated to `needs help`.
4. Tag upload owner.
5. Move client status to `needs help`.

### G) GHL Import + Launch

1. Open correct GHL sub-account (never guess).
2. Go to Contacts -> Import.
3. Upload cleaned CSV.
4. Validate field mapping before import.
5. Add both required tags:
   - ZIP tag.
   - Legal business name tag.
6. Start import and monitor progress.
7. If stuck at 0%:
   - Pause/unpause once.
   - If still stuck, escalate immediately.
8. After import, filter by ZIP tag and verify count.
9. If count is below about 2,000:
   - Move back to `waiting for contacts`.
   - Request another batch.
10. If count is acceptable:
   - Add contacts to `Outreach` automation in drip mode.
   - Use default cadence unless documented override:
     - 15 every 60 seconds.
     - Monday-Friday.
     - 3pm-5pm Eastern.
   - Move status `needs help` -> `add KPI`.
   - Mark Slack thread as `ready`.

## 6) Copy/Paste Slack Templates

### Handoff Template (Scrape Complete)

```text
CSV is scraped and verified.
Client: [client name]
ZIP batch: [ZIP codes]
Final count: [number of contacts]
File: [filename]
Status updated: needs help
```

### Launch Completion Template

```text
Import + launch complete.
Client: [client name]
Sub-account: [sub-account name or ID]
Imported count: [count]
Tags applied: [ZIP tag], [legal business name tag]
Automation: Outreach drip started
Status updated: add KPI
Thread marked: ready
```

## 7) Escalate Immediately If Any of These Happen

1. Import is stuck at 0% after one pause/unpause.
2. Legal business name tag or ZIP tag is unclear.
3. You cannot confirm correct GHL sub-account.
4. Data is misaligned (phone/address/name columns do not match).
5. Status options are broken or cannot be moved correctly.
6. ZIP ownership conflict appears.

Escalation message must include:

1. Client name.
2. Exact step where it broke.
3. What you already tried.
4. Screenshot when possible.

## 8) Definition of Done

A client job is only complete when all are true:

1. Clean CSV posted in Slack thread.
2. Final contact count posted.
3. Client moved to correct status.
4. Contacts imported into correct GHL sub-account.
5. ZIP + legal business tags applied.
6. Outreach automation launched.
7. Slack thread marked ready.

## Source Docs

- `docs/seller-operating-system/03-fulfillment-and-delivery.md`
- `docs/seller-operating-system/06-rip-ready-operating-map.md`
- `docs/plans/2026-02-27-va-loom-onboarding-series.md`
