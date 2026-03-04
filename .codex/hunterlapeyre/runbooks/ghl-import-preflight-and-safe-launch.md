# Runbook: GHL Import Preflight and Safe Launch

## Goal
Import contacts into the correct GHL sub-account without accidental mass enrollment, broken routing, or low-quality personalization.

## When To Use This
- Any time a CSV is being imported into GHL for outreach.
- Any time tags, workflow branches, or notification routing were recently edited.
- Any time the batch came from Landline Remover or manual spreadsheet cleanup.

## Preconditions
- Correct GHL sub-account is open.
- Final CSV is ready for import and already cleaned.
- Required tags are known:
  - ZIP tag (for this upload).
  - Legal business name tag (exact client routing tag).

## Steps
1. CSV preflight before upload:
   - Confirm first/last names are Proper Case (no ALL CAPS rows).
   - Confirm required columns map cleanly (first, last, phone, address, city, state, zip).
   - Confirm no blank first names in launch file.
2. Workflow preflight before import:
   - Open `SMS 1 - Outreach` and confirm trigger is present and intended.
   - Confirm cadence settings are correct (`15 every 60 seconds`, weekday/time window as assigned).
   - Confirm you are not in a test workflow/sub-account.
3. Import settings safety check:
   - In import verify step, set `Create contacts`.
   - Add both tags: ZIP + legal business name.
   - Do not start import until mappings are green.
4. Post-import launch check:
   - Filter contacts by ZIP tag and verify imported count.
   - Spot-check 5 contacts for name casing + correct tags.
   - Enroll only filtered/tagged contacts in Outreach.

## Verification
- Command(s):
  - `python3 "$HOME/.codex/skills/security-reviewer/scripts/run_security_review.py" --repo "$PWD" --pretty`
  - `python3 "$HOME/.codex/skills/code-simplifier/scripts/run_code_simplifier.py" --repo "$PWD" --pretty`
  - `npm run verify`
- Expected result:
  - Security analyzer: `status=pass`.
  - Simplifier analyzer: `status=pass` or `warn` with understood findings.
  - Verify gate: lint/typecheck pass.
  - GHL contact sample shows no ALL CAPS first/last names.
  - ZIP + business-name tags are present on imported contacts.

## Rollback / Undo
- If wrong tags were applied, bulk-filter by the bad tag and remove it.
- If wrong workflow enrollment happened, immediately stop/pause workflow and remove affected contacts from the workflow.
- Re-import only after preflight checklist is fully re-verified.

## Notes
- Most expensive failure mode is accidental immediate enrollment during import.
- Most common routing failure mode is missing legal business name tag.
- Most common quality failure mode is ALL CAPS names in personalization tokens.
