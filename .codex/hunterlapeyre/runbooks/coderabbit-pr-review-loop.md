# CodeRabbit PR Review Loop

## Goal
Resolve review comments in focused batches until the PR is clear to merge, without introducing regressions.

## When to use
- A PR has CodeRabbit comments (or repeated comment rounds) and needs a reliable fix-verify-repeat workflow.

## Preconditions
- `gh` CLI is authenticated (`gh auth status`).
- Current branch is the PR head branch and tracks upstream.
- Local repo can run project verification (`npm run build` at minimum).

## Steps
1. Identify PR and current state:
- `gh pr view --json number,headRefName,baseRefName,reviewDecision,url`
- `gh pr checks <pr-number>`
2. Pull newest review feedback:
- `gh pr view --comments`
- If needed for line-level precision: `gh api repos/<owner>/<repo>/pulls/<pr-number>/comments --paginate`
3. Triage by root cause, not by comment order:
- Group related comments into one underlying fix area (validation, typing, shared parsing, UX copy, etc.).
- Skip outdated comments that refer to removed lines unless behavior still applies.
4. Implement the smallest root-cause fix:
- Prefer shared utilities/common paths over duplicating one-off fixes.
- Keep behavior changes explicit and preserve existing contracts.
5. Verify before pushing:
- `npm run build`
- Add any targeted checks relevant to changed files.
6. Commit and push:
- `git add <paths>`
- `git commit -m "<clear fix message>"`
- `git push origin <branch>`
7. Re-check and repeat:
- `gh pr view --comments`
- `gh pr checks <pr-number>`
- Repeat until no actionable CodeRabbit comments remain.

## Verification
- Command(s):
  - `gh pr view --comments`
  - `gh pr checks <pr-number>`
  - `git rev-list --left-right --count HEAD...@{u}`
- Expected result:
  - No actionable new CodeRabbit comments.
  - Required checks are passing.
  - Ahead/behind output is `0 0`.

## Rollback / Undo
- Revert only the last fix commit if needed:
  - `git revert <commit-sha>`
- Re-run build and checks, then push the revert commit.

## Notes
- Comment churn is lowest when fixes are structural (single canonical parser/validator) rather than local patches.
- Keep commits scoped so each review cycle has a clear before/after.
