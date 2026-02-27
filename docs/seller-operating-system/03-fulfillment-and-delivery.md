# Stage 3: Fulfillment and Delivery

**Version:** 1.1  
**Last Updated:** 2026-02-27  
**Owner:** Obieo Ops Lead (currently Hunter Lapeyre)  
**Related:** [Stage 2: Onboarding and Activation](./02-onboarding-and-activation.md) | [Stage 4: Retention and Expansion](./04-retention-and-expansion.md)

## Operating Parameters (Source of Truth)

- Default DealMachine property filters:
  - `Year Built` -> `is less than 2005`
  - `Living Area` -> `greater than 1200`
- Override path:
  - If a client has a documented exception, use the value in ClickUp client notes (`List Build Overrides`) first.
  - If no override is documented, use the defaults above.
- Change control:
  - If these defaults change, update this section first, then update all SOP references in this file.

## Versioning Note

- `Octoparse` appears in seller transcripts as the prior scraping stack.
- Current default stack is the internal scraper workflow we revised (`node shrek.js` and related updated scripts).
- Use Octoparse steps in this file as historical reference only unless explicitly reactivated.

## What Seller Did (from transcript evidence)

- Transcript `T002` (client scripting process):
  - Start every shift in `Error Table` and work the `needs` column one client at a time.
  - Pull next ZIP from `ZIP Codes to target`, build list in DealMachine, and keep list sizes controlled.
  - Run local scraper via terminal command (`node shrek.js`) in the DealMachine folder.
  - Export scrape CSV, clean/normalize in Google Sheets, and standardize columns.
  - Run Landline Remover enrichment, then filter out risky/unwanted records.
  - Upload cleaned file to Slack `submission team`, then upload to GHL/workflow.
- Transcript `T003` (uploading contacts made easy):
  - Upload queue is status-driven: `waiting for contacts` -> `needs help` -> `add KPI`.
  - Operator pulls ready CSV from Slack thread and imports into the client's assigned GHL sub-account.
  - Import must include two routing tags: first ZIP + legal business name.
  - Import mapping/header integrity is a hard gate; bad headers can stall at 0%.
  - After upload, operator verifies count by ZIP tag, adds contacts to outreach automation, and closes loop in ClickUp/Slack.
- Transcript `T004` (start of day data scraping procedure):
  - Every shift starts in bookmarked ClickUp main view before any other task.
  - Scrape queue is driven by CS status `waiting for contacts`.
  - Monitoring is two-channel:
    - Morning ClickUp sweep for overnight runouts.
    - Mid-day Slack `ZIP Data Channel` tags for new runouts.
  - CSV handoff has a hard timing requirement: before 10:00 AM Eastern.
- Transcript `T005` (part 2 scraping workflow and operator signaling):
  - Mid-day runout work starts with Slack acknowledgment (`eyes` emoji) to claim ownership.
  - Completion requires:
    - remove in-progress reaction,
    - mark completed,
    - reply in thread with CSV uploaded and manager tag (`CSV is scraped and verified`).
  - ZIP source fields are explicit in ClickUp:
    - `What area do you want us to scrape?` (remaining targets),
    - `ZIP codes already scrape` (already completed areas).
- Transcript `T006` (data scraping guide part 3):
  - Contact volume target is derived from weekly appointment goal (about 1,000 contacts per appointment target).
  - Practical scrape batching is split runs (typically 10k-15k; avoid oversized one-shot pulls).
  - DealMachine build must run with ZIP-mode search and defined property filters.
  - One-client-only lead table rule: previous leads fully deleted before building new list.
  - Scrape page budget rule given: scrape total pages minus 2 to avoid end-of-list failures.
  - Every ZIP used in list build must be moved from `not scraped` tracking to `already scraped`.
- Transcript `T007` (data scraping guide part 4):
  - Octoparse execution is two-pass per list:
    - property scrape first,
    - phone/name scrape second.
  - Runs are sequential only; export first pass before second pass.
  - Use same page settings (and practical timing profile) across both passes so rows align.
  - Wait timing rule:
    - 10s default,
    - 15s when contact volume is above 15k.
  - Exports follow ZIP-labeled naming for property vs phone outputs.
  - Post-run process requires sheet normalization and phone-address alignment QA checks in DealMachine.
- Transcript `T008` (data scraping guide part 5):
  - Download cleaned sheet and run Landline Remover on the `Phone Number` column.
  - Import verifier output back into sheet and remove litigator-classified rows before handoff.
  - Final handoff proof must include CSV attachment + contact count in Slack thread.
  - Close scrape ownership signal, then move client to `needs help` and tag next owner for upload.

## Delivery Flow

1. Daily/weekly operating rhythm:
   - Daily start: open bookmarked ClickUp view and sweep clients marked `waiting for contacts`.
   - Then open `Error Table` and clear `needs` queue client-by-client.
   - Through the day, monitor Slack `ZIP Data Channel` for runout tags and handle immediately.
   - On any Slack runout alert, claim it with `eyes` reaction before scraping.
   - On completion, post threaded completion with CSV + manager tag.
   - Morning handoff target: submit scrape CSV by 10:00 AM Eastern.
2. Lead sourcing and cleaning:
   - In ClickUp client details, use fields intentionally:
     - `What area do you want us to scrape?` = next ZIP/area source.
     - `ZIP codes already scrape` = do-not-repeat reference.
   - In client row, copy next ZIP from `ZIP Codes to target`.
   - In DealMachine, delete prior scrape list before starting next one.
   - Keep one-client-only active list in DealMachine at all times.
   - Build list for ZIP target.
   - List-size guardrail:
     - Typical target: 10k-15k.
     - Avoid >20k unless intentionally doing larger package volume.
     - For 40-lead package clients, larger total volume can be run, but usually in 10k-15k chunks.
   - If ZIP volume is low, combine with additional ZIP.
   - Volume planning rule from transcript:
     - Use `appointments per week` as planning input.
     - Estimate around 1,000 contacts per weekly appointment target.
     - Split large requirements across multiple runs (example in transcript: 30k as two 15k runs).
   - DealMachine list build setup:
     - Paste ZIPs with no spaces and select `zip` search type.
     - Apply property filters:
       - `Year Built` with `is less than 2005`.
       - `Living Area` greater than `1200`.
     - Build list and capture resulting page count.
   - Tracking hygiene:
     - For each ZIP added to build, move it from remaining/not-scraped to already-scraped field.
3. Campaign launch steps:
   - Update tracking by moving processed ZIP from `to target` to `scraped`.
   - In terminal, run scraper from DealMachine folder: `node shrek.js`.
   - Let scraper run through all pages (about 10 seconds between pages).
   - Apply page-limit guardrail from transcript:
     - If list has `N` pages, scrape up to `N - 2` pages.
   - Octoparse run order and settings:
     - Run `DealMachine Property` first.
     - Set loop pages and wait timing.
     - Export CSV and confirm output count.
     - Run `DealMachine Phone Scrape Page by Page` second.
     - Reuse matching page count/timing profile to preserve row alignment.
   - Operational guardrails:
     - Do not run both tasks at the same time.
     - Keep the active run window stable during execution (avoid actions that degrade run reliability).
   - Save output CSV with client+ZIP naming convention.
   - Naming convention:
     - `ZIP Full Property Scrape.csv`
     - `ZIP Full Phone Scrape.csv`
   - Import CSV into Google Sheets and clean structure:
     - Keep core fields only.
     - Split full name to first/last.
     - Split city/state/ZIP into separate fields.
     - Rename headers to standardized schema.
   - Two-sheet merge procedure:
     - Property CSV goes in base sheet and is normalized first.
     - Phone CSV is imported into adjacent sheet.
     - Phone column data is copied into main sheet carefully (to avoid duplication artifacts).
   - Alignment QA:
     - Pick random phone numbers from merged sheet.
     - Search in DealMachine by phone.
     - Confirm address matches the merged row.
     - If mismatch appears, rerun both passes with consistent settings.
4. QA checkpoints:
   - Filter out blank/invalid first-name rows.
   - Run Landline Remover bulk upload on phone column.
   - Ensure output includes line type and DNC type (`all`) for filtering visibility.
   - Remove flagged records per process, with special attention to litigators.
   - Confirm final sheet has clean headers and cleaned rows only.
   - Confirm no rows with missing phone placeholders remain after filter cleanup.
5. Lead delivery method:
  - Download cleaned CSV.
  - Upload final file to Slack `submission team`.
  - Upload into GHL and apply workflow setup (referenced in separate training video).
  - Contact upload sequence in GHL:
    - Import contacts into assigned sub-account.
    - Confirm field mapping is correct before import.
    - Add import tags:
      - ZIP tag from uploaded file.
      - Legal business name tag (required for lead routing).
    - Start bulk import and verify progress is moving.
    - If stuck at `0%`, pause/unpause once; if still stuck, escalate as header/schema issue.
  - Post-import launch:
    - Filter by uploaded ZIP tag and verify imported count.
    - If count is low (around <2,000), mark client back to `waiting for contacts` for refill.
    - Select imported records and add to `Outreach` automation in drip mode.
    - Default cadence shown in transcript:
      - 15 records every 60 seconds.
      - Monday-Friday.
      - 3pm-5pm Eastern window.
  - Completion loop:
    - Scrape operator:
      - Run final Landline Remover validation import.
      - Remove litigator rows and download final CSV.
      - Reply in Slack thread with CSV + final contact count.
      - Remove in-progress claim signal and mark scrape task completed.
      - Move client to `needs help` and tag upload owner in `submission team`.
    - Upload operator:
    - Update ClickUp status `needs help` -> `add KPI`.
    - Mark Slack submission thread item as `ready`.
6. Exception handling:
   - If scraper must be stopped, use `Ctrl + C`.
   - If output formatting breaks, re-run split and header standardization before upload.

## Internal Roles and Ownership

- Who owned each step:
  - Fulfillment operator runs queue, scrape, cleanup, and submission.
- Manual steps:
  - ZIP selection, list sizing decision, column cleanup, compliance filtering, Slack/GHL upload.
  - Import mapping checks, routing tag assignment, automation enrollment, status updates.
- Automated steps:
  - Browser scrape pagination once script is running.
  - Landline Remover enrichment output generation.
- Escalation path:
  - Support via Slack channel (per transcript guidance).
  - Escalate mapping/header issues to supervisor/operator owner.

## Metrics to Track

- Leads delivered per client:
  - Daily cleaned contacts submitted by client.
- Cost per delivered lead:
  - Track by list size and cleanup yield (post-filter records).
- Lead acceptance/replacement rate:
  - Monitor rejection causes tied to bad contact quality.
- SLA adherence:
  - Time from `needs` queue item to Slack/GHL submission.
- Additional operational metrics from transcript:
  - `needs` queue clear rate per shift.
  - Percent removed for litigators/invalid/VoIP/toll-free.
  - Scrape run completion rate without interruption.
  - Import completion rate without 0% stall.
  - Percent of uploads meeting >=2,000 contact threshold.
  - Status transition latency (`needs help` to `add KPI`).
  - Morning coverage rate: percent of `waiting for contacts` clients processed at shift start.
  - Mid-day response latency from `ZIP Data Channel` tag to scrape start.
  - On-time CSV submission rate before 10:00 AM Eastern.
  - Claim latency: time from Slack tag to `eyes` ownership reaction.
  - Completion proof rate: percent of jobs with threaded CSV + manager tag confirmation.
  - Contacts planned vs weekly appointment target ratio.
  - Percent of runs following page-budget guardrail (`pages minus 2`).
  - Duplicate ZIP reuse rate (should trend near zero).
  - Property/phone pass alignment success rate.
  - Octoparse rerun rate caused by page/timing mismatch.

## Failure Modes

- Lead quality drift
- Silent delivery failures
- No visibility into bottlenecks
- Previous DealMachine list not cleared, causing mixed output.
- Over-sized scrape lists create long cycle times and delay fulfillment.
- Incomplete name/address parsing causes broken imports.
- Missing litigator filtering creates legal/compliance risk.
- Wrong file naming causes cross-client data mix-up.
- Missing legal-business-name tag breaks downstream lead routing.
- Duplicate/incorrect ZIP tag causes mis-segmented outreach.
- Client left in wrong status (`needs help` not moved) delays launch visibility.
- Mid-day `waiting for contacts` updates missed because Slack channel is not actively monitored.
- CSV handoff after 10:00 AM Eastern causes same-day delivery delays.
- No `eyes` claim reaction leads to duplicate parallel scraping by multiple operators.
- Missing completion thread makes status ambiguous and delays downstream upload/launch.
- Leaving prior client list in DealMachine contaminates current client scrape output.
- Ignoring page-budget guardrail increases risk of scrape errors on tail pages.
- Mismatch between property-pass and phone-pass settings breaks row alignment and forces full rerun.
- Skipping phone-to-address QA can let silent data mismatch into outreach.

## Your Updated SOP (draft)

### SOP: Daily Client Scripting and Submission

1. Open `Error Table` and process each client in `needs`.
2. Select next ZIP from `ZIP Codes to target`.
3. In DealMachine, clear prior list and build new ZIP list.
4. Keep list size in guardrail range unless intentionally running larger package capacity.
5. Move processed ZIP from target list to scraped list.
6. Run scraper: `node shrek.js`; wait until full completion.
7. Export CSV and rename with clear ZIP + client identifier.
8. Import to Google Sheets and clean:
   - Keep required columns.
   - Split names.
   - Split city/state/ZIP.
   - Normalize headers.
9. Filter out bad/incomplete rows.
10. Run Landline Remover output and import cleaned results.
11. Apply final compliance filtering (especially litigators).
12. Download final CSV.
13. Upload to Slack `submission team`.
14. Upload to GHL and apply workflow.

### SOP: DealMachine List Build and Page Budget

1. Open client details and read:
   - remaining targets (`What area do you want us to scrape?`)
   - already scraped log (`ZIP codes already scrape`)
   - weekly appointment target.
2. Plan contact requirement:
   - target about 1,000 contacts per weekly appointment goal.
   - split into chunks (usually 10k-15k per run).
3. In DealMachine, confirm previous client list is deleted.
4. Paste target ZIP(s) with no spaces and choose `zip` mode.
5. Apply standard filters:
   - `Year Built` -> `is less than 2005` (unless ClickUp `List Build Overrides` specifies another value),
   - `Living Area` -> `> 1200`.
6. If one ZIP is too small, add additional ZIPs until planned volume is met.
7. Click `Build List`.
8. Note total pages `N` and set scrape plan to `N - 2`.
9. Move each used ZIP from remaining list to already-scraped log in ClickUp.

### List-Build Gate

- [ ] Weekly appointment target converted into contact-volume plan
- [ ] Previous client list deleted from DealMachine
- [ ] ZIP mode selected and ZIPs pasted without spaces
- [ ] Standard filters applied
- [ ] Page budget set to `N - 2`
- [ ] Used ZIPs moved to already-scraped tracking

### SOP: Legacy Octoparse Dual-Pass Run and Merge (Historical Reference)

1. Confirm one-client list state and final page budget (`N - 2`).
2. Open Octoparse task `DealMachine Property`.
3. Set loop item pages to target and apply timing:
   - 10s default,
   - 15s if volume >15,000.
4. Run in standard/local mode and wait until complete.
5. Export all rows to CSV named `ZIP Full Property Scrape.csv`.
6. Open Octoparse task `DealMachine Phone Scrape Page by Page`.
7. Apply same page target and compatible timing profile.
8. Run to completion and export `ZIP Full Phone Scrape.csv`.
9. Import property CSV into base sheet and normalize address columns.
10. Import phone CSV into adjacent sheet and merge phone/name data into base sheet.
11. Run alignment QA:
   - sample random phone near lower rows,
   - search DealMachine by phone,
   - verify returned address matches sheet row.
12. If alignment fails, rerun both passes with matched settings.

### Dual-Pass Gate

- [ ] Property pass completed and exported
- [ ] Phone pass completed and exported
- [ ] Matching page target used across both passes
- [ ] Timing profile reviewed for volume threshold
- [ ] Property and phone data merged without duplicate-copy artifact
- [ ] Phone-to-address QA spot checks passed

### SOP: Start-of-Shift Triage and Alert Monitoring

1. At shift start, open bookmarked ClickUp main view.
2. Filter/scan CS status for `waiting for contacts`.
3. Build scrape priority list from those clients first.
4. Start scrape workflow for top-priority runouts.
5. Confirm CSV handoff is scheduled to complete before 10:00 AM Eastern.
6. Keep Slack `ZIP Data Channel` open for mid-day runout tags.
7. On any new tag:
   - Confirm client moved to `waiting for contacts`.
   - Add to active scrape queue immediately.
8. Recheck ClickUp status board before end of shift to catch misses.

### Triage Gate (must pass each shift)

- [ ] ClickUp morning sweep completed
- [ ] All `waiting for contacts` clients acknowledged
- [ ] CSV handoff completed before 10:00 AM Eastern
- [ ] Slack `ZIP Data Channel` monitored during shift
- [ ] Mid-day runout tags converted into active scrape tasks

### SOP: Slack Claim and Completion Protocol

1. When tagged in `ZIP Data Channel`, react with `eyes` to claim the task.
2. Open client in ClickUp and pull next target from `What area do you want us to scrape?`.
3. Cross-check `ZIP codes already scrape` to avoid duplicate area pulls.
4. Complete scraping and generate CSV per scrape SOP.
5. Remove in-progress signal and mark task completed in channel workflow.
6. Reply in thread with CSV upload and tag manager/supervisor.
7. Use completion phrase standard: `CSV is scraped and verified`.
8. Include final contact count in the completion reply.
9. Move client status to `needs help` and tag upload owner in `submission team`.

### Claim/Completion Gate

- [ ] `eyes` reaction posted when work starts
- [ ] ZIP selected from `What area do you want us to scrape?`
- [ ] `ZIP codes already scrape` checked before scrape
- [ ] Threaded CSV uploaded at completion
- [ ] Manager/supervisor tagged in completion reply
- [ ] Final contact count included in completion message
- [ ] Client moved to `needs help` for upload handoff

### Compliance Gate (must pass before upload)

- [ ] Final file has standardized headers
- [ ] No blank/placeholder first names
- [ ] Litigators removed
- [ ] Invalid/toll-free/VoIP removed per policy
- [ ] File name clearly maps to client + ZIP
- [ ] Upload target (Slack + GHL account) matches client

### SOP: Upload Ready Contacts and Launch Outreach

1. In SMS client sheet, identify next client marked `needs help`.
2. Confirm client sub-account ID and open matching GHL sub-account.
3. In Slack `submission team`, open client thread and download ready CSV.
4. Import CSV into GHL Contacts.
5. Verify field mapping is correct before continuing; escalate if not.
6. Add required import tags:
   - ZIP tag (first ZIP from file).
   - Legal business name tag (exact legal business value).
7. Start bulk import and monitor progress.
8. If stuck at `0%`, pause/unpause once; if still stuck, escalate as header mismatch.
9. After import, filter by ZIP tag and verify imported count.
10. If imported count is below target (around 2,000), set client back to `waiting for contacts`.
11. Select imported records and add to `Outreach` automation in drip mode.
12. Apply cadence defaults unless the client's account manager or designated client owner has documented an override in ClickUp notes or GHL account notes:
    - 15 every 60 seconds.
    - Monday-Friday.
    - 3pm-5pm Eastern.
13. Update ClickUp status `needs help` -> `add KPI`.
14. Mark Slack thread item `ready`.

### Launch Gate (must pass before automation starts)

- [ ] CSV import mapped correctly
- [ ] ZIP tag added and verified
- [ ] Legal business name tag added and verified
- [ ] Import completed (not stuck at 0%)
- [ ] Imported count reviewed
- [ ] ClickUp status updated to `add KPI`
- [ ] Slack submission item marked `ready`
