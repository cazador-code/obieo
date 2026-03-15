# Runbook: Whop Payment -> Airtable Intake -> Obieo Onboarding Sync

## Goal
Turn a paid client into a campaign-ready onboarding flow with as little manual work as possible.

## What This Covers
- Whop sends a payment event to Obieo.
- Obieo verifies the payment and can send the Airtable intake form.
- Airtable form writes to `Onboarding Submissions`.
- Airtable automation updates `Client Table`, marks the submission processed, and posts the payload back to Obieo.

## Core Pieces
- Whop webhook endpoint:
  - `https://app.obieo.com/api/webhooks/whop`
- Airtable onboarding-submitted endpoint:
  - `https://app.obieo.com/api/webhooks/airtable/onboarding-submitted`
- Airtable automation:
  - `Onboarding Form Submission`

## Required Airtable Pieces
- Form source table: `Onboarding Submissions`
- Client-facing form: `Obieo Client Intake Form`
- Current visible required fields:
  - `Primary Contact Name`
  - `Portal Login Email`
  - `Legal Business Name`
  - `Business Phone #`
  - `Best Cell for Lead Notifications`
  - `Best Email for Lead Notifications`
  - `Email Used To Communicate With Prospects`
  - `Desired Leads Per Day (Minimum 2)`
  - `Lead Delivery Preference`
  - `Full Business Address`
  - `Service Areas`
  - `Service Types Offered`
  - `Target ZIP Codes (5-10 to start)`
  - `Operating Hours Start`
  - `Operating Hours End`

## Required Secrets / Env
- Vercel:
  - `WHOP_API_KEY`
  - `WHOP_WEBHOOK_SECRET`
  - `WHOP_COMPANY_ID`
  - `WHOP_WEBHOOK_API_VERSION=v1`
  - `AIRTABLE_ONBOARDING_SUBMITTED_WEBHOOK_SECRET`
- Airtable automation secret:
  - `webhookSecret`
  - must exactly match `AIRTABLE_ONBOARDING_SUBMITTED_WEBHOOK_SECRET`

## Airtable Automation Shape
1. Trigger:
   - `When a form is submitted`
2. Find client:
   - `Find records` in `Client Table`
3. Branch:
   - run only if `Find records -> Airtable record ID is not empty`
4. Update client row:
   - map intake fields into `Client Table`
5. Update submission row:
   - `Submission Status = processed`
   - link `Client`
   - optional `Automation Notes`
6. Run script:
   - POST submission payload to `https://app.obieo.com/api/webhooks/airtable/onboarding-submitted`

## Current Temporary Matching Rule
- Current Airtable test-safe matcher:
  - `Business Name = Legal Business Name`
- Production-safe matcher should be:
  - `Portal Key (stable ID) = Portal Key`

## Important Gotchas
- Airtable script secrets must use:
  - `input.secret('webhookSecret')`
  - not `input.config().webhookSecret`
- If the Airtable script says `portalKey and companyName are required`, the usual cause is:
  - the submission row has a blank `Portal Key`
- A successful test in the Airtable editor is not live until you click:
  - `Update`
- Form share setting should be:
  - `Anyone on the web`
  - no password

## Verification
- Whop health:
  - `curl -s https://app.obieo.com/api/webhooks/whop`
- Airtable onboarding health:
  - `curl -s https://app.obieo.com/api/webhooks/airtable/onboarding-submitted`
- Repo gates:
  - `npm run verify`
  - `python3 "$HOME/.codex/skills/security-reviewer/scripts/run_security_review.py" --repo "$PWD" --pretty`
  - `python3 "$HOME/.codex/skills/code-simplifier/scripts/run_code_simplifier.py" --repo "$PWD" --pretty`

## Next Improvement
- Replace the temporary Airtable business-name match with prefilled hidden `Portal Key` in the intake form link so the whole flow is deterministic.
