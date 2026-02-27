# Seller Operating System Breakdown

This folder is your source of truth for dissecting the seller's operating system end to end.

## Goal

Capture how the business was actually run in practice, then turn that into:

- reliable SOPs,
- clear handoff rules,
- fewer mistakes during transition.

## How We Will Use This

1. Drop raw Loom transcript chunks into `99-transcript-inbox.md`.
2. We tag each chunk to a lifecycle stage.
3. We distill the chunk into the stage file with:
   - what they did,
   - why it worked,
   - what can break,
   - what your version should be.
4. We keep the big-picture view updated in `00-master-map.md`.

## File Map

- `00-master-map.md`: one-page map of the whole operation.
- `01-sales-and-close.md`: sales process and close mechanics.
- `02-onboarding-and-activation.md`: first 7-14 day setup and launch.
- `03-fulfillment-and-delivery.md`: day-to-day service delivery.
- `04-retention-and-expansion.md`: keeping clients happy and growing value.
- `05-churn-and-offboarding.md`: churn prevention, exits, and post-exit ops.
- `99-transcript-inbox.md`: raw transcript staging area.

## Working Rule

Do not edit raw transcript text for meaning. Keep quotes intact in the inbox, then summarize in stage files.

## Tooling Note (Important)

- Some transcript steps reference legacy tooling from the previous operator stack.
- `Octoparse` references are historical unless explicitly re-enabled.
- Current state: use the internal scraper workflow we revised (for example `node shrek.js`) as the default source-of-truth process.
