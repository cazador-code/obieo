---
name: session-wrapup
description: End-of-session wrap-up that audits, simplifies, and prepares code for commit/push. Use when the user says "wrap up", "wrap it up", "session done", "let's finish up", "end of session", "sign off", "close out", "ship it", or "/wrapup". Also use when the user is done coding and wants to ensure everything is clean before committing.
---

# Session Wrap-Up

Run all steps sequentially. Do not skip steps. Ask the user for input only where marked **[ASK]**.

## Step 1: Assess Changes

Run `git status` and `git diff --stat` to understand the scope of this session's work.

If there are no changes (clean working tree), inform the user and stop.

## Step 2: Security Scan

Run all three checks and report results:

```bash
npx tsc --noEmit                            # TypeScript errors
npm run lint --silent                       # Lint errors
npx gitleaks detect --source . --no-banner  # Secret leaks
```

If tsc or lint fails, fix the errors automatically before proceeding. For gitleaks findings, **[ASK]** the user whether the detected item is a real secret or a false positive.

## Step 3: Code Simplifier

Run the code-simplifier agent on files changed in this session. Focus on files from `git diff --name-only`.

Present a summary of simplifications made. If no changes needed, note that and move on.

## Step 4: Final Verification

Re-run security checks from Step 2 to confirm simplification didn't break anything:

```bash
npx tsc --noEmit && npm run lint --silent
```

If failures appear, fix and re-verify.

## Step 5: Stage and Commit

**[ASK]** the user:
- Show the full list of changed files
- Recommend which to stage (exclude `.env`, scratch files, large binaries)
- Draft a commit message based on the session's work

Commit format:

```
<type>: <concise description>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Step 6: Push Decision

**[ASK]** the user: "Push to remote?" — options: Yes (current branch), No (local only), New branch (create + push).

## Step 7: Session Summary

```
## Session Complete

**Changes**: X files modified, X files added
**Security**: All checks passed
**Simplified**: <files touched by code-simplifier, or "No changes needed">
**Commit**: <hash> — <message>
**Branch**: <branch>
**Pushed**: Yes/No
```
