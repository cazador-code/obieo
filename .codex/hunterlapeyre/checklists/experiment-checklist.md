# Experiment Checklist (Safe + Cheap)

Use this before shipping experiments, one-off scripts, or “quick” changes in unfamiliar areas.

## Before You Code
- Define the smallest possible hypothesis (one sentence).
- Define a success metric and a failure metric (how we know it’s wrong).
- Set a cost/time cap (tokens, runtime, budget, or engineer-hours).
- Identify the blast radius (who/what could be affected).

## Due Diligence (Repo-First)
- Find existing patterns: similar features, toggles, endpoints, UI components.
- Identify owners/experts (CODEOWNERS, recent committers, docs).
- List top 5 ways this can go wrong and how we’d detect each.

## Implementation
- Keep the change minimal and reversible.
- Prefer feature flags or configuration toggles.
- Add logging/telemetry only if it answers the hypothesis.

## Verification
- Add/adjust automated tests when feasible.
- Run the narrowest test suite that gives confidence.
- Validate locally with a reproducible script or commands.

## Rollback Plan
- Ensure rollback is clear (revert commit, disable flag, config change).
- Confirm where to monitor after rollout (logs, dashboards, error tracker).

## Post-Run
- Record outcome, metrics, and learnings in `/.codex/hunterlapeyre/memory.md`.
- If repeatable, write a runbook in `/.codex/hunterlapeyre/runbooks/`.

