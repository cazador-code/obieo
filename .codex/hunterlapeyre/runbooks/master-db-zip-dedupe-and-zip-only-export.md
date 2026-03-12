# Runbook: Master DB ZIP Dedupe and ZIP-Only Export

## Goal
Build client outreach lists from the DealMachine master export, remove any phones already used in prior sends, and deliver final CSVs where each file contains exactly one ZIP code.

## When To Use This
- A repeat customer needs a fresh “round 2” or later outreach list.
- ZIP priority matters and each final upload file should map to one ZIP only.
- Source data is the master export at `/Users/hunterlapeyre/Downloads/merged.csv`.

## Preconditions
- Requested ZIPs are confirmed and ordered by priority.
- Prior client send files are available so history dedupe can run.
- DuckDB CLI is available locally.
- Final delivery folder should include a readable `00_README.txt` plus summaries/reports.

## Steps
1. Build the raw candidate pool from the master export:
   - Query `/Users/hunterlapeyre/Downloads/merged.csv` with DuckDB using explicit column types plus `ignore_errors=true` and `strict_mode=false`.
   - Extract ZIP from `propertyAddress`.
   - Pick the first wireless phone in priority order and dedupe on phone number.
   - Order rows by the client’s ZIP priority list before export.
2. Remove already-used history:
   - Run `scripts/dedupe_sms_candidates.py` against the raw candidate CSV.
   - Pass each prior client GHL-ready CSV with repeated `--history`.
   - For older GHL exports, pass `--history-phone-column "Phone Number"` explicitly.
3. Format delivery files:
   - Convert names to Proper Case.
   - Split address into street, city, state, and zip.
   - Use the minimal final schema: `First Name`, `Last Name`, `Phone Number`, `Street Address`, `City`, `State`, `Zip Code`.
   - Group rows by ZIP first, then chunk oversized ZIPs into 5,000-contact parts.
4. Build operator-friendly folder structure:
   - `00_README.txt`
   - `01_final_5000_contact_lists/`
   - `02_source_and_reports/`
   - Include ZIP summary and file summary reports.
5. If replacing an already-delivered folder:
   - Rename the older folder to a sibling backup path first.
   - Move the rebuilt ZIP-only folder into place only after verification passes.

## Verification
- Confirm every final CSV contains exactly one distinct ZIP code.
- Confirm row counts per ZIP and per file match the summary CSVs.
- Confirm names are Proper Case and address columns are split correctly.
- Confirm dedupe report shows history duplicates removed.
- Confirm the Desktop delivery path exists and includes the backup folder when a replacement happened.

## Gotchas
- A plain 5,000-row chunking pass can still cross ZIP boundaries even when rows are sorted by ZIP priority; that is not acceptable for ZIP-specific uploads.
- Older GHL-ready exports often use `Phone Number`, not `phoneNumber`.
- Some requested ZIPs can legitimately return zero fresh wireless inventory under the first-wireless workflow.

## Notes
- This workflow is upstream of GHL import; use `ghl-import-preflight-and-safe-launch.md` after the ZIP-only files are ready.
