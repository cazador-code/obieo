# Prompt Library (obieo)

These are prompt shapes for getting high-quality work from Codex without needing deep domain expertise.

## 1) Due Diligence Before Coding
**Prompt**
“Before writing code, do repo-first due diligence:
- find existing patterns and the most relevant files,
- summarize how the current flow works,
- list risks/gotchas,
- propose the smallest safe change,
- include an explicit verification plan (commands + expected results).
Only then implement.”

## 2) Second Opinion / Red Team
**Prompt**
“Give a second opinion on this change:
- top 5 ways it could be wrong,
- how we’d detect each failure,
- what minimal extra test/log would raise confidence,
- what rollback would look like.”

## 3) Minimal Patch + Tight Scope
**Prompt**
“Implement the smallest patch that achieves the goal. Avoid refactors unless necessary.
If you think a refactor is needed, stop and explain tradeoffs first.”

## 4) Repro-First Debugging
**Prompt**
“Don’t guess. First, reproduce:
- identify the shortest reproduction steps,
- add targeted logging only if needed,
- propose 2-3 likely root causes and how to falsify each,
- then fix and add a regression test.”

## 5) End-of-Session Compounding Notes
**Prompt**
“Update `/.codex/hunterlapeyre/memory.md` with:
- commands we used,
- patterns discovered,
- gotchas,
- a short ‘next time do this’ section.
If any workflow repeated, create/update a runbook under `/.codex/hunterlapeyre/runbooks/`.”

