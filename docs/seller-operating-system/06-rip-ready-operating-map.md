# Rip-Ready Operating Map: Seller v1 vs Your v2

## Purpose

This document gives you one clear map of how the seller operated, how your current stack now operates, where they differ, what is inconsistent, and what to simplify so you can scale without hidden breakpoints.

## Evidence Confidence

1. High-confidence (transcript-backed):
   - Onboarding seat assignment and tag routing in sub-accounts.
   - Daily fulfillment workflow: ClickUp queue, DealMachine scrape, cleaning, Landline Remover, Slack handoff, GHL import.
   - Status chain: `waiting for contacts` -> `needs help` -> `add KPI`.
2. Medium-confidence (derived from current implementation and live checks):
   - ZIP request approval flow between Portal, Convex, and Airtable.
   - Conflict check logic and sync behavior.
3. Low-confidence (not enough transcript evidence yet):
   - Sales process details.
   - Retention/expansion and churn/offboarding specifics.

## Seller v1 Map (How He Ran It)

1. Onboarding (seat-based model):
   - Airtable `All Client Types` is intake list.
   - Each sub-account has 5 seats.
   - If full, replace off-boarded seat first.
   - Update seat-specific custom values (lead email + phone).
   - Update matching automation slot tag to new business name.
2. Fulfillment queue:
   - Shift starts in ClickUp with `waiting for contacts`.
   - Midday runouts come through Slack `Zip Data Channel`.
   - Operator claims task with `eyes` reaction.
3. Data sourcing:
   - Pull next ZIP from remaining targets.
   - Build list in DealMachine with filtering.
   - Keep typical run volume in 10k-15k bands.
4. Data extraction and prep:
   - Legacy path: Octoparse dual-pass (property then phone/name) with page/time tuning.
   - Current path in transcripts also references local script (`node shrek.js`).
   - Normalize in Google Sheets.
   - Run Landline Remover.
   - Remove litigators and other disallowed numbers.
5. Handoff:
   - Upload final CSV to Slack `submission team`.
   - Include contact count and completion note.
   - Move client to `needs help` for uploader.
6. Upload and launch:
   - Import CSV to GHL sub-account.
   - Require two tags: ZIP + legal business name.
   - Add records to outreach automation.
   - Move status to `add KPI`.

## Your v2 Map (How It Should Run Now)

1. Client-facing control plane:
   - Client submits ZIP change request in portal.
   - Request lands in Convex as `pending`.
2. Internal ops control plane:
   - Internal dashboard shows pending ZIP request.
   - On approve path:
     - Conflict check against Airtable active clients.
     - If no conflicts, approve in Convex and sync approved ZIPs to Airtable.
3. Data systems:
   - Convex is operational source for portal state and ZIP request lifecycle.
   - Airtable is active-client conflict reference and fulfillment tracker.
4. Scraping system:
   - Octoparse is legacy reference only.
   - Revised internal scraper flow is default.
5. Execution model:
   - Preserve explicit ownership handoffs (`eyes`, CSV with count, status transitions).
   - Preserve compliance gate before upload.

## Key Delta: Seller v1 vs Your v2

1. v1 relied on operator memory and seat ordering as primary control.
2. v2 adds explicit state transitions and approvals through Convex APIs.
3. v1 allowed tool drift (Octoparse plus local script mixed).
4. v2 sets one default scraper path and treats Octoparse as historical fallback.
5. v1 used business-name matching informally.
6. v2 uses portal key plus env mapping, and now explicit Airtable field-ID handling.

## Inconsistencies You Should Treat as Risks

1. Tool ambiguity:
   - Training references both Octoparse and local script paths.
2. Identity ambiguity:
   - Business-name tagging and matching is typo-sensitive.
3. Status vocabulary drift:
   - Different casing/phrasing can break queue logic (`Waiting For Contacts` vs `waiting for contacts`).
4. Capacity heuristics vs package promises:
   - 10k-15k practical band vs larger package expectations can conflict without explicit run plan.
5. Spreadsheet-heavy transformation:
   - Manual sheet operations are high-friction and error-prone.
6. Legacy seat index dependence:
   - Position-based seat logic is brittle during reorder/replacement.
7. Compliance messaging inconsistency:
   - In transcripts, DNC handling language is inconsistent while litigator filtering is strict.

## Simplifications (Highest Leverage)

1. Canonical identity everywhere:
   - Use `portalKey` as primary key across Convex, Airtable, and automations.
   - Keep business name as display label only.
2. Single scraper path:
   - Default to revised internal scraper.
   - Keep Octoparse only in archive docs.
3. Single handoff object:
   - Every completed scrape must produce one payload:
     - `portalKey`, `zipBatch`, `recordCount`, `csvPath`, `owner`, `completedAt`.
4. Single status dictionary:
   - Freeze allowed states and casing.
   - Reject unknown state variants.
5. Scripted transform contract:
   - Replace most manual Sheets transforms with one script-generated CSV schema.
6. Approval as transaction:
   - Conflict check pass -> Convex approve -> Airtable sync -> success response.
   - If Airtable sync fails, surface alert immediately.

## Improvements (Priority Stack)

1. P0: Reliability and data integrity
   - Enforce canonical status enum across tools.
   - Add schema validation at CSV intake and before GHL import.
   - Alert on missing `CSV + contact count + needs help handoff`.
   - Enforce that every ZIP approval event has matching Convex and Airtable final ZIP set.
2. P1: Remove repetitive manual work
   - Build one transformation script for address/name/phone normalization and bad-row removal.
   - Auto-generate completion message template in Slack with required fields.
   - Auto-update ClickUp status from import completion webhook where possible.
3. P2: Scale and observability
   - Add daily ops dashboard:
     - queue depth,
     - time to claim,
     - time to complete,
     - import success rate,
     - compliance failure rate.
   - Add weekly anomaly report:
     - repeated ZIPs,
     - low record-count batches,
     - stalled statuses.

## Rip-Ready Daily Operating Sequence

1. Triage:
   - Build queue from `waiting for contacts` plus Slack runouts.
2. Claim:
   - Post ownership signal (`eyes`) for each runout.
3. Scrape:
   - Run default scraper path with planned volume.
4. Normalize:
   - Apply schema contract and compliance filters.
5. Handoff:
   - Post CSV + count in thread.
   - Set `needs help`.
   - Tag uploader.
6. Upload:
   - Import with ZIP + legal business tag.
   - Launch outreach.
   - Set `add KPI`.
7. Close:
   - Confirm thread marked ready and status updated.

## Rip-Ready ZIP Governance Sequence

1. Client submits ZIP add/remove request in portal.
2. Request lands in Convex `pending`.
3. Ops runs conflict check against Airtable active clients.
4. If conflict-free, approve request.
5. System writes final ZIP list to Convex org and Airtable client row.
6. Ops verifies both stores match.

## Minimum Non-Negotiable Controls

1. No upload without compliance pass.
2. No launch without ZIP tag + legal business name tag.
3. No completion without thread payload (CSV + count + owner).
4. No ZIP approval without conflict check pass.
5. No documentation drift: legacy tools must be marked historical.

## Open Gaps to Close Next

1. Sales, retention, and churn maps still need transcript evidence.
2. Seat-based onboarding should be moved from position-based routing to explicit client-seat IDs if possible.
3. End-to-end automation should reduce dependence on manual Google Sheets operations.

## Final Read

You are now in a stronger operating posture than seller v1 because you have explicit state, explicit approval, and clearer controls. The remaining work is simplification and automation, not architecture invention.
