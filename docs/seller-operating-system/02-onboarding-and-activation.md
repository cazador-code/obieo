# Stage 2: Onboarding and Activation

## What Seller Did (from transcript evidence)

- Transcript `T001` (new client seat onboarding):
  - Each sub-account has 5 seats.
  - New client is assigned by industry into the matching sub-account.
  - If full, replace an existing seat, prioritizing an off-boarded client.
  - Seat index is controlled by top-to-bottom ordering.
  - Onboarding requires updating seat-level custom values (email + phone).
  - Final activation step is updating automation route tag for that seat to the new business name.

## Onboarding Flow

1. Post-sale handoff:
   - New client row appears in Airtable `All Client Types`.
   - Operator identifies industry and target sub-account.
2. Data collection:
   - Pull from new client Airtable fields only:
     - `Email Address to receive lead notifications`
     - `Cell phone to receive lead notifications`
3. Account setup:
   - Check seat availability in industry sub-account (max 5).
   - Decision:
     - If seat open: use open slot.
     - If full: replace off-boarded seat first.
   - Align ordering so selected client corresponds to intended seat number.
4. Tool connections:
   - In sub-account custom values:
     - Update seat `N` email value.
     - Update seat `N` phone value.
   - In automation:
     - Go to `SMS Campaign Workflows > Fulfillment Notifications Leads Notify Client and Charge Card`.
     - Open client slot `N`.
     - Remove prior tag.
     - Add new tag = new client's business name.
     - Save action.
5. First-value milestone:
   - Test lead should route to new seat and notify via updated email/SMS values.
6. Go-live criteria:
   - Correct seat selected.
   - Custom values updated for that exact seat.
   - Workflow tag updated and saved for that exact seat.
   - Old client tag removed.

## Client Expectations Set Upfront

- Timeline promised:
  - Not explicitly stated in transcript.
- Deliverables promised:
  - Lead notifications routed correctly via assigned seat.
- Client responsibilities:
  - Provide correct lead-notification email and cell number.
- Communication cadence:
  - Escalation/support via Slack channel.

## Metrics to Track

- Time to launch:
  - Minutes from seat assignment to completed custom value + tag update.
- Onboarding completion rate:
  - Percent of new clients fully activated with all seat fields and tags updated.
- Days to first lead delivered:
  - Keep as primary activation KPI.
- Setup error rate:
  - Wrong-seat assignment rate.
  - Tag mismatch incidents (old client still tagged).
  - Contact-field mismatch incidents (wrong email/phone).

## Failure Modes

- Missing data from client blocks launch
- Setup work done without checklist
- No definition of "onboarding complete"
- Seat ordering changed incorrectly, causing routing to wrong client.
- Old automation tag not removed, causing cross-client lead leakage.
- Custom values updated in one seat but tag updated in a different seat.

## Your Updated SOP (draft)

### SOP: Seat-Based Onboarding in Sub-Accounts

1. Find new client in Airtable and confirm industry.
2. Open matching industry sub-account and identify seat to use:
   - Prefer open seat.
   - If none open, replace off-boarded seat first.
3. Confirm seat index (`N`) from ordered list.
4. Update custom values for seat `N`:
   - Email from `Email Address to receive lead notifications`.
   - Phone from `Cell phone to receive lead notifications`.
5. Update automation for client slot `N`:
   - Remove old client tag.
   - Add new client business-name tag.
   - Save action.
6. Run verification:
   - Seat `N` custom values match new client record.
   - Slot `N` tag matches new client business name.
   - Old client tag no longer present.

### Control Checklist (must pass)

- [ ] Industry matched correctly
- [ ] Correct seat chosen
- [ ] Off-boarded client prioritized for replacement when full
- [ ] Email custom value updated from correct field
- [ ] Phone custom value updated from correct field
- [ ] Tag replaced in matching slot
- [ ] Save confirmed in automation
