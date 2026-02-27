# Master Map: Sales to Offboarding

## Current Status

- Transcript source: in progress
- Process extraction: in progress
- SOP conversion: in progress
- Risk audit: in progress

## Lifecycle Chain

1. Sales and Close
2. Onboarding and Activation
3. Fulfillment and Delivery
4. Retention and Expansion
5. Churn and Offboarding

## Critical Control Points (fill as we process transcripts)

- Offer sold vs offer delivered match:
- Pricing and margin guardrails:
- Lead quality guardrails:
- Communication SLA: support escalates through Slack channel.
- Billing and credit policy:
- Churn trigger indicators:
- Offboarding checklist:
- Seat capacity governance:
  - Each sub-account has 5 seats maximum.
  - Prefer replacing off-boarded seat when full.
- Seat-to-routing integrity:
  - Seat index is position-sensitive.
  - Seat `N` custom values and slot `N` automation tag must match same client.
- Notification-field integrity:
  - Use only the dedicated lead-notification email/phone fields from client record.
- Daily scrape queue discipline:
  - Start each shift in `Error Table` and clear the `needs` queue in order.
  - Keep ZIP state accurate (`to target` vs `scraped`) after each run.
- Scrape volume guardrails:
  - Default list target 10k-15k rows.
  - Avoid oversized batches unless package capacity requires it.
- Data lineage and naming:
  - File naming must encode client + ZIP before handoff.
  - Final upload file must be traceable from source scrape to cleaned output.
- Compliance filter gate:
  - Landline Remover output must include line type + DNC type fields.
  - Litigators must be removed before Slack/GHL upload.
- Contact upload status discipline:
  - Use explicit status chain: `waiting for contacts` -> `needs help` -> `add KPI`.
  - Status changes are part of delivery completion, not optional admin work.
- Routing-tag integrity:
  - Every imported contact batch must include ZIP tag + legal business name tag.
  - Missing legal business name tag breaks client lead routing.
- Import schema gate:
  - CSV headers/mapping must validate before import starts.
  - Stuck `0%` imports indicate schema/mapping issue and require escalation.
- Outreach launch governance:
  - Verify imported count by ZIP tag before enrolling automation.
  - Default send window documented as Monday-Friday, 3pm-5pm Eastern (owner-controlled).
- Shift-start triage discipline:
  - First action each shift is ClickUp sweep for `waiting for contacts`.
  - Do not start lower-priority work before triage queue is built.
- Dual-signal depletion detection:
  - Primary: ClickUp CS status `waiting for contacts`.
  - Secondary: Slack `Zip Data Channel` tags during the day.
- Time-bound handoff:
  - Scrape CSV handoff required before 10:00 AM Eastern.
  - Missed handoff is an operational incident, not a soft miss.
- Slack ownership protocol:
  - Operator claims runout tasks with `eyes` reaction to avoid duplicate work.
  - Completion requires thread reply with CSV and manager tag.
- Scrape-to-upload handoff proof:
  - Final completion reply must include CSV attachment + final contact count.
  - Client must be moved to `needs help` and upload owner tagged in `submission team`.
- ZIP source-of-truth discipline:
  - Use `What area do you want us to scrape?` for next target.
  - Use `Zip codes already scrape` as do-not-repeat guardrail.
- Volume planning discipline:
  - Convert weekly appointment target into contact-volume target (about 1,000 per appointment target).
  - Split high-volume needs into chunked scrape runs instead of one oversized pull.
- DealMachine list integrity:
  - One client list active at a time; previous leads must be deleted first.
  - Apply standard property filters before build (`Year Built` less-than rule, `Living Area > 1200`).
- Scrape page-budget rule:
  - Set scrape ceiling to total pages minus 2 to avoid tail-page failures.
- Dual-pass extraction integrity:
  - Property and phone/name passes must run sequentially, never in parallel.
  - Page target and timing profile must be compatible across both passes.
- Octoparse timing discipline:
  - Default 10s wait; increase to 15s above 15k volume.
  - Wait-time under-allocation risks page-skip misses.
- Tooling version clarity:
  - Octoparse references are legacy process documentation.
  - Current default process runs through the revised internal scraper workflow.
- Merge and alignment verification:
  - Property CSV and phone CSV merge must be validated with random phone-to-address checks in DealMachine.
  - Any mismatch requires rerunning both passes, not just one.

## Biggest Failure Risks

- Undefined handoffs between stages
- Hidden tribal knowledge not documented
- Manual steps with no owner
- Conflicting client expectations at onboarding
- Churn signals spotted too late
- Wrong-seat replacement causes cross-client lead delivery.
- Old tags left in automation route leads to off-boarded clients.
- Litigator records slipping through into outreach creates legal risk.
- CSV schema drift causes bad imports and silent delivery issues.
- Missing legal-business-name tag causes leads to route to no one/wrong client.
- Missed status transition (`needs help` not moved to `add KPI`) hides launch readiness.
- Morning triage skipped, leaving overnight runouts unresolved.
- Mid-day channel tags ignored, causing silent contact depletion.
- No in-progress claim signal creates duplicate effort and conflicting uploads.
- Missing completion proof in thread delays manager verification and handoff.
- Missing contact-count proof in thread can hide underfilled runs.
- Oversized/unplanned contact pulls can overload automation and reduce delivery reliability.
- Multi-client residue in DealMachine list contaminates output and causes routing errors.
- Re-scraping same ZIPs due to bad field tracking wastes capacity and inflates duplicates.
- Inconsistent Octoparse pass settings break address-phone pairing and invalidate output.
- Team follows legacy Octoparse steps by mistake and diverges from the current revised scraper process.
- Skipping merge QA allows silent data corruption into outreach uploads.

## Decision Log

Use this section for major decisions so future-you can see why choices were made.

- YYYY-MM-DD:
  - Decision:
  - Why:
  - Owner:
- 2026-02-26:
  - Decision: Treat seat assignment + custom value update + tag update as a single atomic onboarding checklist.
  - Why: Transcript shows leads route by seat index and tag, so partial updates can leak leads to wrong clients.
  - Owner: Obieo ops
- 2026-02-26:
  - Decision: Add a mandatory pre-upload compliance gate on fulfillment files (litigator removal and standardized schema checks).
  - Why: Transcript shows legal/quality risk is concentrated at cleanup/filter stage before Slack/GHL handoff.
  - Owner: Obieo ops
- 2026-02-26:
  - Decision: Require dual-tag routing on every GHL contact import (ZIP + legal business name) before automation enrollment.
  - Why: Transcript shows routing reliability depends on these tags; missing tags make responses unusable.
  - Owner: Obieo ops
- 2026-02-26:
  - Decision: Treat 10:00 AM Eastern CSV submission as a hard fulfillment SLA tied to daily start-of-shift triage.
  - Why: Transcript defines this as required to keep same-day message sending continuity.
  - Owner: Obieo ops
- 2026-02-26:
  - Decision: Standardize runout task signaling in Slack (`eyes` to claim, threaded CSV + manager tag to close).
  - Why: Transcript shows this is the control mechanism for ownership clarity and completion verification.
  - Owner: Obieo ops
- 2026-02-26:
  - Decision: Use appointment-target-based contact planning plus chunked list builds, with one-client-only DealMachine lists and `pages minus 2` scrape budgeting.
  - Why: Transcript defines this as the practical control set to avoid automation breakage and scrape instability.
  - Owner: Obieo ops
- 2026-02-26:
  - Decision: Enforce Octoparse dual-pass sequencing with alignment QA and rerun-both policy on mismatch.
  - Why: Transcript shows the two-pass model can silently desync unless page/timing settings and QA checks are tightly controlled.
  - Owner: Obieo ops
- 2026-02-26:
  - Decision: Require scrape completion packet (`CSV + contact count`) plus explicit status handoff (`needs help` + upload owner tag).
  - Why: Transcript shows final delivery reliability depends on a verified handoff object, not just a silent file drop.
  - Owner: Obieo ops
- 2026-02-26:
  - Decision: Mark Octoparse process as legacy and keep revised internal scraper workflow as the default operating path.
  - Why: Prevents operator confusion between historical transcript steps and the current production process.
  - Owner: Obieo ops
