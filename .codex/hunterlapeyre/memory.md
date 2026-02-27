# Codex Memory (obieo)

Use this file as durable, repo-specific “muscle memory”. Keep it concise and actionable.

## Working Agreements
- Prefer smallest change that is testable.
- Always leave a “how to verify” trail: exact commands, files, and expected output.
- Ask for a second opinion before merging anything risky (migrations, auth, billing, analytics, SEO changes).

## Repo Quickstart
- Install deps: `npm install`
- Dev server: `npm run dev`

## Common Commands
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`
- Deploy Convex functions/schema: `npm run convex:deploy`
- Vercel prod deploy (if CLI network allows): `vercel deploy --prod --yes`
- Check internal tool auth headers: `curl -I https://www.obieo.com/internal/leadgen/payment-link`
- Check internal tool auth (should return 200): `curl -u "USER:PASS" -I https://www.obieo.com/internal/leadgen/payment-link`
- Search (fallback when `rg` is unavailable): `grep -RIn "pattern" .`
- Find files: `find . -maxdepth 4 -type f -name "foo*"`

## Codebase Map (fill in over time)
- Frontend framework:
- Routing:
- State management:
- Analytics/tracking:
- Payments/billing:
  - Stripe Checkout + invoices
  - Webhook handler: `src/app/api/webhooks/stripe/route.ts`
  - Activation + Clerk invite: `src/lib/stripe-activation.ts`
  - Billing provisioning: `src/lib/stripe-onboarding.ts`
- CMS/content:
- Pay-per-lead landing page: `claim-area.obieo.com`

## Gotchas / Sharp Edges (fill in over time)
- Node version: local Node `v25.x` can break `next build` (webpack WasmHash crash). Use `nvm use` (see `.nvmrc` = 20).
- Internal tools Basic Auth:
  - `/internal/leadgen/payment-link` is protected via `middleware.ts` Basic Auth.
  - Requires Vercel env vars: `INTERNAL_LEADGEN_BASIC_AUTH_USER` + `INTERNAL_LEADGEN_BASIC_AUTH_PASS`.
  - Middleware is fail-closed: missing creds returns `503 Internal tools auth is not configured.`
- Stripe webhook 400s almost always mean `STRIPE_WEBHOOK_SECRET` mismatch. Fix by copying the endpoint signing secret (`whsec_...`) from Stripe and setting Vercel **Production** env var, then redeploy.
- Stripe webhook dedupe: re-sending the same event id returns `{ duplicate: true }` and will not re-run activation.
- Stripe coupons: the coupon “Name” shown in the dashboard is not the coupon ID. Prefer coupon ID (e.g. `aW0d883k`) or promo code ID (`promo_...`). The internal payment-link tool can now resolve a coupon name -> ID, but ID is still the most reliable.
- Clerk invites: if a Stripe customer already has `obieo_activation_invite_sent_at`, activation will normally skip. The `/checkout/success` “Resend invitation email” button forces a fresh invite (revokes prior invitation ID if present).
- Convex deploy can fail in some networks with `getaddrinfo ENOTFOUND o1192621.ingest.sentry.io` (Convex CLI telemetry). Retry on a different network/VPN or later.
- Vercel deploy may fail in restricted environments with `getaddrinfo ENOTFOUND api.vercel.com`. In that case, rely on Vercel's GitHub integration (push to `main`) to redeploy production.

## Reusable Verification (fill in over time)
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Unit tests:
- E2E:

## Session Notes (append, newest first)
### 2026-02-26 (session 3)
- What we did:
  - Tightened deterministic quality gates to enforce measure-twice behavior: `lint` now runs with `--max-warnings=0`, `verify` is present and used as the closure gate, and ESLint ignores were hardened for `.next`, `.worktrees`, and `convex/_generated`.
  - Applied a targeted lint exception for intentional external Mapbox static image rendering in `src/components/case-study-dashboard/GeographicMap.tsx`, then re-ran the full verify flow.
  - Ran mandatory analyzers for closure on current working-tree scope: security-reviewer `pass` (`high/medium/low=0/0/0`) and code-simplifier `warn` (`major/medium/minor=0/1/13`).
- Commands used:
  - `python3 "$HOME/.codex/skills/security-reviewer/scripts/run_security_review.py" --repo "$PWD" --pretty`
  - `python3 "$HOME/.codex/skills/code-simplifier/scripts/run_code_simplifier.py" --repo "$PWD" --pretty`
  - `npm run verify`
  - `git status --short`
  - `git remote -v`
  - `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
  - `git rev-list --left-right --count HEAD...@{u}`
- Patterns discovered:
  - Strict gates are reliable when lint scope is explicit (`src` + `convex`) and generated artifacts are globally ignored.
  - `--max-warnings=0` is safe once warning noise is intentionally resolved or explicitly documented inline.
  - Closure notes are highest-signal when analyzer + verify + git-sync evidence are recorded together.
- Gotchas:
  - `npm test --if-present` remains effectively optional in this repo because no test script currently emits output.
  - Workspace is still not commit-clean (modified tracked files and multiple untracked artifacts), even though upstream sync shows `HEAD...@{u} = 0 0`.
- Next-time start:
  - Begin with `npm run verify` immediately after any lint/config change to catch strict-gate regressions early.
  - If you want GitHub to reflect this gate-hardening work, run `git add package.json package-lock.json eslint.config.mjs src/components/case-study-dashboard/GeographicMap.tsx .codex/hunterlapeyre/memory.md && git commit -m "chore: enforce strict verify gates and closure notes" && git push`.
  - Decide whether to add a real `test` script so `verify` includes executable tests instead of optional skip behavior.

### 2026-02-26 (session 2)
- What we did:
  - Completed closure checks for the ZIP/Airtable/Convex merge follow-through after rerunning GitHub Actions `Deploy Convex (Production)` to success once `CONVEX_DEPLOY_KEY` was added.
  - Ran mandatory analyzers in analyze-only mode: security-reviewer `pass` (`high/medium/low=0/0/0`, 0 findings) and code-simplifier `warn` (`major/medium/minor=0/7/88`, mostly arrow-function consistency plus nested-ternary readability warnings across 5 files).
  - Ran deterministic gates per policy with fallback sequence because `verify` script is missing; `lint` failed while `typecheck` and `test` were no-op passes due missing scripts.
- Commands used:
  - `python3 "$HOME/.codex/skills/security-reviewer/scripts/run_security_review.py" --repo "$PWD" --pretty`
  - `python3 "$HOME/.codex/skills/code-simplifier/scripts/run_code_simplifier.py" --repo "$PWD" --pretty`
  - `node -e "const p=require('./package.json'); process.exit(p?.scripts?.verify ? 0 : 1)"`
  - `npm run lint --if-present`
  - `npm run typecheck --if-present`
  - `npm test --if-present`
  - `git status --short`
  - `git remote -v`
  - `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
  - `git rev-list --left-right --count HEAD...@{u}`
- Patterns discovered:
  - Convex production deploy failures with missing deploy key can be resolved fast with a fixed loop: create production deploy key in Convex, store as GitHub Actions secret `CONVEX_DEPLOY_KEY`, then rerun only the failed workflow.
  - Closure quality depends on logging analyzer status plus deterministic gates explicitly; warning-only analyzers are acceptable, but gate failures block closure.
  - `--if-present` can produce false confidence for `typecheck`/`test`; verify script existence first so skipped checks are visible in notes.
- Gotchas:
  - Deterministic gate failed: `npm run lint --if-present` returned exit code `1` with a very large report (`54680` problems, including `.next/` generated output), so closure cannot be marked complete.
  - GitHub sync is clean (`HEAD...@{u}` is `0 0` on `origin/codex/portal-zip-request-contact-roles`), but workspace is not commit-clean (`package.json`, `package-lock.json`, untracked scraper artifacts, and this memory update are present).
- Next-time start:
  - If closure must pass, first fix or scope lint (`npm run lint --if-present`) so generated `.next/` artifacts do not fail deterministic gates.
  - Confirm remote truth with `git rev-list --left-right --count HEAD...@{u}` before declaring done.
  - If you want closure-clean git state, run `git add <paths> && git commit -m "<message>" && git push`.

### 2026-02-26
- What we did:
  - Closed the portal PR review cycle with a reusable process for repeated CodeRabbit rounds and captured that process as a runbook.
  - Ran mandatory closure analyzers on current diff scope: security-reviewer `pass` (`high/medium/low=0/0/0`) and code-simplifier `warn` (`major/medium/minor=0/0/5`, all minor style findings in `src/app/app/internal/clients/page.tsx`).
  - Re-verified GitHub sync truth for the current branch: upstream is `origin/codex/portal-zip-request-contact-roles` and `git rev-list --left-right --count HEAD...@{u}` returned `0 0`.
- Commands used:
  - `python3 /Users/hunterlapeyre/.codex/skills/security-reviewer/scripts/run_security_review.py --repo "$PWD" --pretty`
  - `python3 /Users/hunterlapeyre/.codex/skills/code-simplifier/scripts/run_code_simplifier.py --repo "$PWD" --pretty`
  - `git remote -v`
  - `git status --short`
  - `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
  - `git rev-list --left-right --count HEAD...@{u}`
  - `ls -la .codex/hunterlapeyre/runbooks`
  - `rg -n "coderabbit|CodeRabbit|review loop|PR review" .codex/hunterlapeyre/runbooks .codex/hunterlapeyre/memory.md`
- Patterns discovered:
  - For bot-review loops, quality stays high when fixes target root cause (shared validation/parser path) instead of one-line localized patches.
  - A durable review cadence is: fetch newest comments, batch by root cause, implement once, run build checks, push, then re-check comments.
  - Closure quality improves when analyzer and git-sync evidence are logged in one place with exact command outputs.
- Gotchas:
  - Skill docs currently reference `/Users/hunter/.codex/...`; this machine uses `/Users/hunterlapeyre/.codex/...`.
  - Working tree is intentionally not closure-clean (`package.json`, `package-lock.json`, `src/app/app/internal/clients/page.tsx`, untracked scraper artifacts, plus this memory update).
- Next-time start:
  - Use runbook: `.codex/hunterlapeyre/runbooks/coderabbit-pr-review-loop.md`.
  - Start with `gh pr view --json number,headRefName,baseRefName,reviewDecision,url` and `gh pr view --comments`, then fix by root cause before pushing.
  - Before declaring done, always confirm `git rev-list --left-right --count HEAD...@{u}` is `0 0` and PR checks/comments are clear.

### 2026-02-25
- What we did:
  - Reviewed `feat/zip-change-approval` findings and translated all three issues into plain-language risk/impact.
  - Patched and verified the ZIP approval/auth flow in worktree `/Users/hunterlapeyre/Developer/obieo/.worktrees/feat-zip-change-approval`: strict internal Basic Auth on `/api/internal/zip-change-request/resolve`, added middleware protection for that route, removed hardcoded browser `admin:admin`, and fail-closed client coverage lock in `/api/portal/profile`.
  - Ran `npm run build` in the feature worktree (pass), then committed/pushed `55fa860` (security/auth/lock fix) and `b2d94e8` (lockfile metadata) to `origin/feat/zip-change-approval`.
  - Ran mandatory closure analyzers (analyze-only): security-reviewer `pass` (`high/medium/low=0/0/0`, summary `No scoped code changes found for security review.`, scope `mode=none`, `files=[]`); code-simplifier `pass` (`major/medium/minor=0/0/0`, summary `No scoped code changes found.`, scope `mode=none`, `files=[]`).
- Commands used:
  - `python3 /Users/hunterlapeyre/.codex/skills/security-reviewer/scripts/run_security_review.py --repo "/Users/hunterlapeyre/Developer/obieo/.worktrees/feat-zip-change-approval" --pretty`
  - `python3 /Users/hunterlapeyre/.codex/skills/code-simplifier/scripts/run_code_simplifier.py --repo "/Users/hunterlapeyre/Developer/obieo/.worktrees/feat-zip-change-approval" --pretty`
  - `npm run build`
  - `git add src/app/api/internal/zip-change-request/resolve/route.ts src/app/api/portal/profile/route.ts src/app/app/internal/clients/ZipRequestActions.tsx src/proxy.ts`
  - `git commit -m "fix(portal): harden zip approval auth and lock coverage edits"`
  - `git push -u origin feat/zip-change-approval`
  - `git add package-lock.json`
  - `git commit -m "chore: sync package-lock metadata"`
  - `git push`
  - `git -C /Users/hunterlapeyre/Developer/obieo rev-list --left-right --count HEAD...@{u}`
  - `git -C /Users/hunterlapeyre/Developer/obieo/.worktrees/feat-zip-change-approval rev-list --left-right --count HEAD...@{u}`
- Patterns discovered:
  - When a feature branch is already checked out in a linked worktree, patch there directly; file-path mismatches in root checkout are a quick signal you are on the wrong tree.
  - Internal endpoints should reuse the same auth env contract (`INTERNAL_LEADGEN_BASIC_AUTH_USER/PASS`) as existing protected internal routes to avoid split-brain security behavior.
  - Keep security/code fixes and lockfile churn in separate commits for review clarity and safer rollback.
- Gotchas:
  - Skill docs still reference `/Users/hunter/.codex/...`; this environment uses `/Users/hunterlapeyre/.codex/...`.
  - Analyzer scope mode returned `none` on a clean committed tree; if diff-scoped findings are needed, run analyzers before final commit.
  - Root workspace git state is not closure-clean: `git -C /Users/hunterlapeyre/Developer/obieo status --short` has local changes, and `git -C /Users/hunterlapeyre/Developer/obieo rev-list --left-right --count HEAD...@{u}` is `1 0` (ahead by one commit).
- Next-time start:
  - If branch switch fails with “already used by worktree,” jump to the linked tree: `cd /Users/hunterlapeyre/Developer/obieo/.worktrees/feat-zip-change-approval`.
  - Verify pushed feature branch truth first: `git -C /Users/hunterlapeyre/Developer/obieo/.worktrees/feat-zip-change-approval rev-list --left-right --count HEAD...@{u}` (expect `0 0`).
  - To sync root `main` ahead commit to GitHub, run: `git -C /Users/hunterlapeyre/Developer/obieo push origin main`.
  - To clear root uncommitted files, then run: `git -C /Users/hunterlapeyre/Developer/obieo add <paths> && git -C /Users/hunterlapeyre/Developer/obieo commit -m "<message>" && git -C /Users/hunterlapeyre/Developer/obieo push origin main`.

### 2026-02-24
- What we did:
  - Implemented Client Portal Profile Editing v1 end-to-end: added `/portal` edit UI, client save API (`PATCH /api/portal/profile`), admin save API (`PATCH /api/internal/portal/profile`), shared profile normalization/validation, Convex `updatePortalProfile` mutation, and `portalProfileEdits` audit table.
  - Added internal notification helper for every successful profile save and wired internal Basic Auth protection for `/api/internal/portal/profile` in `src/proxy.ts`.
  - Verified with `npm run build`, then committed and pushed implementation as `40f8b07` to `origin/main`.
  - Ran mandatory closure analyzers: security-reviewer `pass` (`high/medium/low = 0/0/0`), code-simplifier `warn` (`major/medium/minor = 0/0/5`, minor style warnings only).
- Commands used:
  - `python3 /Users/hunterlapeyre/.codex/skills/security-reviewer/scripts/run_security_review.py --repo "$PWD" --pretty`
  - `python3 /Users/hunterlapeyre/.codex/skills/code-simplifier/scripts/run_code_simplifier.py --repo "$PWD" --pretty`
  - `npm run build`
  - `git add convex/leadLedger.ts convex/schema.ts src/app/app/portal/page.tsx src/lib/convex.ts src/proxy.ts src/app/api/portal/profile/route.ts src/app/api/internal/portal/profile/route.ts src/app/app/portal/PortalProfileEditor.tsx src/lib/portal-profile-notifications.ts src/lib/portal-profile.ts`
  - `git commit -m "feat(portal): add editable lead settings with audit trail"`
  - `git push origin main`
  - `git status --short`
  - `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
  - `git rev-list --left-right --count HEAD...@{u}`
- Patterns discovered:
  - Split endpoint auth model works cleanly for this repo: Clerk-authenticated client saves and Basic Auth + preview-token internal saves can share one validation + Convex write path.
  - Keeping profile normalization in one shared module prevents drift between UI, client API, and internal admin API.
  - Convex audit logging as before/after snapshots plus ZIP deltas provides durable expansion history without altering onboarding lifecycle state.
- Gotchas:
  - Avoid using `submitClientOnboarding` for portal edits; it sets onboarding state to `submitted` and can regress client lifecycle.
  - Closure analyzer scope is `staged+unstaged`; current warnings reference `src/app/app/internal/clients/page.tsx` style nits outside the just-pushed portal commit.
  - Working tree remains intentionally dirty after closure checks (`.codex/hunterlapeyre/memory.md`, `src/app/app/internal/clients/page.tsx`, untracked manual-onboarding paths/screenshot script).
- Next-time start:
  - Run `npm run convex:deploy` before validating portal profile saves in deployed environments so the new schema/mutation are live.
  - Smoke test both paths: client self-edit at `/portal` and admin edit via `/internal/clients` -> `View Client Portal`.
  - If you want this closure note committed too, run: `git add .codex/hunterlapeyre/memory.md && git commit -m "docs: add session closure notes" && git push origin main`.

### 2026-02-24
- What we did:
  - Added a new internal manual-assisted onboarding flow so ops can record customer onboarding answers when clients are not tech-enabled.
  - Implemented secure API endpoint `POST /api/internal/leadgen/manual-onboarding` with internal JWT auth, rate limiting, normalization, and Convex persistence via `submitClientOnboardingInConvex`.
  - Added UI at `/internal/leadgen/manual-onboarding` with internal password gate and simple operator-first form (comma/newline list inputs for service areas, ZIPs, routing phones/emails).
  - Added "Manual Entry" shortcut button to `/internal/clients` header.
  - Verified quality gates: lint and production build both passed.
- Commands used:
  - `npm run lint -- src/app/api/internal/leadgen/manual-onboarding/route.ts src/app/app/internal/leadgen/manual-onboarding/page.tsx src/app/app/internal/clients/page.tsx`
  - `npm run build`
  - `git status --short`
- Patterns discovered:
  - For assisted intake, fastest implementation is a thin internal API + simplified operator UI that still writes through the same Convex onboarding mutation for consistent downstream behavior.
  - Logging capture context in notes (manual intake + capture method) improves auditability without changing schema.
- Gotchas:
  - Existing memory updates will keep git status dirty by design unless explicitly committed.
- Next-time start:
  - Use `/internal/leadgen/manual-onboarding` for phone-call or chat-assisted intake, then confirm record presence from `/internal/clients`.

### 2026-02-23
- What we did:
  - Ran session-closure checks again after the app-subdomain hotfix rollout to capture final closure evidence.
  - Re-ran mandatory analyzers on latest commit scope (`src/proxy.ts`): security-reviewer `pass`; code-simplifier `warn` (1 medium, 2 minor; readability/style only).
  - Re-verified git truth state for `origin/main`: upstream configured and `HEAD...@{u}` is `0 0`; only local working-tree change is this memory file update.
- Commands used:
  - `python3 /Users/hunterlapeyre/.codex/skills/security-reviewer/scripts/run_security_review.py --repo "$PWD" --pretty`
  - `python3 /Users/hunterlapeyre/.codex/skills/code-simplifier/scripts/run_code_simplifier.py --repo "$PWD" --pretty`
  - `git status --short`
  - `git remote -v`
  - `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
  - `git rev-list --left-right --count HEAD...@{u}`
- Patterns discovered:
  - For this repo, closure quality stays highest when analyzers and git-sync checks are executed in the same pass and logged with exact outputs.
  - Re-running closure after production incident resolution helps prevent drift between deployment truth and memory notes.
- Gotchas:
  - `code-simplifier` warnings on `src/proxy.ts` are non-blocking style/readability nits, but they can look alarming if not explicitly labeled as `warn` (not `fail`).
  - `git status --short` will remain non-empty during closure because memory updates are intentionally uncommitted until the user requests a commit.
- Next-time start:
  - Run the two analyzers first, then git checks (`status`, upstream, ahead/behind) before writing closure text.
  - If user wants closure committed, run `git add .codex/hunterlapeyre/memory.md && git commit -m "docs: update session closure notes" && git push origin main`.

### 2026-02-23
- What we did:
  - Reproduced `app.obieo.com` application error (`Digest: 994294254`) and confirmed app routes were returning `500` while marketing routes stayed healthy.
  - Identified proxy behavior issue where app-subdomain page rewrites bypassed Clerk middleware and where internal basic-auth guard returned early before rewrite.
  - Shipped fix in `src/proxy.ts` to run Clerk middleware as wrapper and keep rewrite flow after internal auth validation; committed and pushed `92532c8`.
  - Verified new production deployment `obieo-2aygeult8-...` reached `Ready`, and confirmed post-fix behavior: `/sign-in` returns `200`, `/portal` redirects signed-out users to sign-in instead of throwing `500`.
  - Closure analyzers: security-reviewer `pass` (`high/medium/low = 0/0/0`); code-simplifier `warn` (`major/medium/minor = 0/1/2`, scope `src/proxy.ts`, no gate failure).
- Commands used:
  - `curl -i https://app.obieo.com/portal`
  - `npx vercel logs obieo-mssypuafb-cazador-codes-projects.vercel.app`
  - `npx vercel inspect obieo-2aygeult8-cazador-codes-projects.vercel.app --logs`
  - `npm run build`
  - `git commit -m "fix: run Clerk middleware for app subdomain rewrites"`
  - `git push origin main`
  - `npx vercel ls obieo --yes`
  - `python3 /Users/hunterlapeyre/.codex/skills/security-reviewer/scripts/run_security_review.py --repo "$PWD" --pretty`
  - `python3 /Users/hunterlapeyre/.codex/skills/code-simplifier/scripts/run_code_simplifier.py --repo "$PWD" --pretty`
  - `git status --short`
  - `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
  - `git rev-list --left-right --count HEAD...@{u}`
- Patterns discovered:
  - For subdomain route groups with Clerk, middleware order matters: rewrite logic must still execute under Clerk middleware for app pages.
  - Fastest live incident loop remains: reproduce via `curl` -> inspect Vercel runtime/build logs -> patch smallest surface -> verify deployment status + endpoint behavior.
  - `x-matched-path` + response codes are reliable for proving rewrite/auth behavior in production.
- Gotchas:
  - App-router error responses can surface opaque digests without message text; use Vercel logs plus controlled `curl` hits to isolate route-level failures.
  - Network/DNS hiccups can intermittently fail repeated `curl` probes; rerun before concluding environmental issues.
  - Deployment can show `Building` even after compile/typecheck/static generation succeed; wait for final `Ready` before validating endpoints.
- Next-time start:
  - If `app.obieo.com` shows digest errors, immediately run: `curl -i https://app.obieo.com/portal`, `npx vercel ls obieo --yes`, `npx vercel inspect <latest-deploy> --logs`.
  - Validate fix with these exact checks: `/sign-in` => `200`, `/portal` => `307` to sign-in when signed out, `/` => `307` to `/portal`.
  - Keep git closure truth strict: only mark done when `git status --short` is empty and `git rev-list --left-right --count HEAD...@{u}` is `0 0`.

### 2026-02-23
- What we did:
  - Migrated approved app-subdomain architecture from nested repo copy (`/obieo/obieo` branch `feat/app-subdomain`) into the main working repo, including route moves to `src/app/app/*`, proxy hostname rewrite, marketing/app layout split, and cross-domain login links.
  - Preserved newer portal lead-feed UI improvements during move and patched high-risk routing gaps (`/app` root redirect to `/portal`, stale `/leadgen/onboarding` links switched to `/onboarding` in API/lib callsites).
  - Committed and pushed migration commit `1490ecc`, then triaged failed Vercel production deploy via `vercel inspect --logs`, identified exact TypeScript export mismatch, and shipped hotfix commit `288e9b1` (`src/lib/convex.ts`) that restored production to `Ready`.
  - Closure analyzers: security-reviewer `pass` (`high/medium/low = 0/0/0`); code-simplifier `warn` (`major/medium/minor = 0/3/35`, scope `convex/leadLedger.ts`, no gate failure).
- Commands used:
  - `git diff --name-status 333e5da..51cdfe5`
  - `npx next build`
  - `git commit -m "feat: migrate app routes to app subdomain and update onboarding links"`
  - `git push origin main`
  - `npx vercel ls obieo --yes`
  - `npx vercel inspect obieo-jxyxarhs2-cazador-codes-projects.vercel.app --logs`
  - `npm run build`
  - `git commit -m "fix: export portal lead snapshot types for production build"`
  - `git push origin main`
  - `python3 /Users/hunterlapeyre/.codex/skills/security-reviewer/scripts/run_security_review.py --repo "$PWD" --pretty`
  - `python3 /Users/hunterlapeyre/.codex/skills/code-simplifier/scripts/run_code_simplifier.py --repo "$PWD" --pretty`
  - `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
  - `git rev-list --left-right --count HEAD...@{u}`
- Patterns discovered:
  - When one repo is nested inside another, treat migration as controlled file-port + targeted merge (not blind copy) to preserve in-flight edits.
  - Fastest production incident path for Vercel is: `vercel ls` -> `vercel inspect --logs` -> fix exact failing file/line -> rebuild locally -> push.
  - Deployment can fail from omitted staged files even when branch-level change appears complete; always verify staged set vs required imports before final push.
- Gotchas:
  - Local `npx tsc --noEmit` can show stale `.next/dev/types` route errors immediately after route moves; rely on fresh `npm run build` / Vercel build truth.
  - Vercel Project Settings showing Node `24.x` is overridden by repo engines (`>=20 <23`), resulting in Node `22.x` in production build logs.
  - Current working tree remains intentionally dirty after closure (`.env.example`, `convex/leadLedger.ts`, docs/memory, plus untracked `obieo/` and `src/app/api/webhooks/airtable/`).
- Next-time start:
  - If production deploy fails, start with `npx vercel ls obieo --yes` then `npx vercel inspect <failed-deploy> --logs`; patch only the exact failing symbol/file.
  - Before announcing done, run git truth checks and include exact state: `git status --short`, `git rev-parse --abbrev-ref --symbolic-full-name @{u}`, `git rev-list --left-right --count HEAD...@{u}`.
  - To cleanly publish remaining local work in this repo, use: `git add -A && git commit -m "<message>" && git push origin main`.

### 2026-02-23
- What we did:
  - Shipped four production onboarding UX/auth hotfixes on `main`: (1) added public onboarding `Save & Complete Later` draft save/restore, (2) changed save action to redirect to `/portal?resume_onboarding=1` and show `Finish Setup` CTA in portal, (3) forced Clerk sign-in/sign-up post-auth redirects to `/portal` by default (while honoring safe internal `redirect_url`), and (4) added `Portal` item to Clerk user menu plus custom-cursor fallback when Clerk modal/popover is open.
  - Ran closure analyzers on latest commit scope (`src/components/AppChrome.tsx`, `src/components/CustomCursor.tsx`): security-reviewer `pass`; code-simplifier `warn` (16 minor arrow-function style warnings, 0 medium/major).
  - Verified latest work is committed and pushed (`origin/main`, `HEAD...@{u}` = `0 0`).
- Commands used:
  - `npm run lint -- src/app/leadgen/onboarding/LeadgenOnboardingClient.tsx`
  - `npm run lint -- src/app/leadgen/onboarding/LeadgenOnboardingClient.tsx src/app/portal/page.tsx`
  - `npm run lint -- 'src/app/sign-in/[[...sign-in]]/page.tsx' 'src/app/sign-up/[[...sign-up]]/page.tsx'`
  - `npm run lint -- src/components/AppChrome.tsx src/components/CustomCursor.tsx`
  - `git commit -m "Add save-and-complete-later to public onboarding"`
  - `git commit -m "Redirect saved onboarding users to portal resume state"`
  - `git commit -m "Force Clerk auth redirects to portal by default"`
  - `git commit -m "Add portal link to Clerk menu and fix cursor over Clerk UI"`
  - `git push origin main`
  - `python3 /Users/hunterlapeyre/.codex/skills/security-reviewer/scripts/run_security_review.py --repo "$PWD" --pretty`
  - `python3 /Users/hunterlapeyre/.codex/skills/code-simplifier/scripts/run_code_simplifier.py --repo "$PWD" --pretty`
- Patterns discovered:
  - During live onboarding calls, quickest stable rollout path is small scoped fixes + immediate push-to-main (Vercel GitHub auto-deploy), with each fix focused on one user-visible blocker.
  - `resume_onboarding=1` is an effective escape hatch to avoid portal->onboarding forced redirects while still preserving the setup-completion guardrail.
  - Custom cursor systems should auto-disable when third-party modals/popovers render above app layers (for Clerk specifically).
- Gotchas:
  - Skill docs still referenced `/Users/hunter/.codex/...`; actual analyzer paths here are `/Users/hunterlapeyre/.codex/...`.
  - `eslint --file` is invalid with this flat config; use `npm run lint -- <path>`.
  - Local repo contains ongoing uncommitted docs/memory edits by design (`.codex/hunterlapeyre/memory.md`, `.codex/hunterlapeyre/runbooks/payment-first-onboarding-prod.md`).
- Next-time start:
  - If a customer reports onboarding friction, first validate this sequence on prod: sign in -> `/portal` -> Clerk avatar menu has `Portal` -> `Save & Complete Later` lands on `/portal?resume_onboarding=1` -> `Finish Setup` returns to tokenized onboarding form with restored draft.
  - Re-run analyzers and git truth checks before closure to confirm pass/warn status and upstream sync.

### 2026-02-22
- What we did:
  - Diagnosed customer confusion where payment email emphasized login while onboarding required ZIP-code form completion.
  - Confirmed initiation pipeline health by triggering live payment-first activation for Chris via `ignition`, then force-resending Clerk invite to verify re-initiation.
  - Added manual initiation CLI `scripts/leadgen-initiate-paid-client.mjs` and npm shortcut `leadgen:initiate-paid` to trigger Clerk + Convex onboarding flow directly from terminal.
  - Simplified activation emails in `src/lib/stripe-activation.ts` so customer notice now leads with a direct onboarding (ZIP-code) URL and clear step-by-step instructions; ops notice now includes onboarding URL for quick support handoff.
  - Committed and pushed `a4e29e9` to `origin/main`.
  - Closure analyzers: security-reviewer `pass`; code-simplifier `warn` (0 medium, 1 minor: arrow-function style preference in `src/lib/stripe-activation.ts`).
- Commands used:
  - `npm run leadgen:initiate-paid -- --company-name "Chris Cohen LT" --billing-email "spike8080@gmail.com" --payment-provider ignition --source "codex-manual-trigger"`
  - `npm run leadgen:initiate-paid -- --company-name "Chris Cohen LT" --billing-email "spike8080@gmail.com" --payment-provider ignition --source "codex-manual-trigger" --force-resend`
  - `git add package.json src/lib/stripe-activation.ts scripts/leadgen-initiate-paid-client.mjs`
  - `git commit -m "Simplify onboarding emails and add paid-initiation CLI"`
  - `git push origin main`
  - `python3 /Users/hunterlapeyre/.codex/skills/security-reviewer/scripts/run_security_review.py --repo "$PWD" --pretty`
  - `python3 /Users/hunterlapeyre/.codex/skills/code-simplifier/scripts/run_code_simplifier.py --repo "$PWD" --pretty`
- Patterns discovered:
  - Payment-first onboarding is operationally stable when initiated from `/api/internal/leadgen/payment-confirmation`; confusion risk is primarily email UX, not initiation backend reliability.
  - Including the exact onboarding token URL in both customer and ops emails removes the "where do I enter ZIP codes?" support loop.
  - A terminal-first initiation command materially reduces time-to-unblock for sales/onboarding during live conversations.
- Gotchas:
  - The skill prompt script paths using `/Users/hunter/...` were stale in this environment; correct paths are under `/Users/hunterlapeyre/.codex/skills/...`.
  - Running commit and push in parallel can race; rerun push after commit to guarantee GitHub sync.
  - code-simplifier minor warning is non-blocking style only.
- Next-time start:
  - For "client paid but no ZIP prompt" reports, run `npm run leadgen:initiate-paid ... --payment-provider ignition --force-resend`, then send the returned onboarding URL directly.
  - If email confusion persists, verify latest deployment includes `src/lib/stripe-activation.ts` onboarding-first customer copy.

### 2026-02-22
- What we did:
  - Diagnosed Mark Roesel onboarding failures with live Clerk API checks and confirmed two separate causes: wrong domain typo (`bestchouce...`) and missing Clerk `public_metadata.portalKey` on the created user.
  - Applied immediate production unblock by patching Clerk metadata for `user_3A2El5h1NBMdWVcZvxRoA9nb2ww` to `portalKey=roofs-by-mark-48913e`.
  - Shipped permanent backend self-heal in `src/app/api/public/leadgen/onboarding-complete/route.ts`: when `portalKey` metadata is missing, validate signed-in primary email against intent billing email, then backfill `portalKey` and continue.
  - Built and verified, then committed and pushed `61d253c` to `origin/main`.
  - Closure analyzers: security-reviewer `pass`; code-simplifier `warn` (2 medium, 3 minor) on `src/app/api/public/leadgen/onboarding-complete/route.ts`.
- Commands used:
  - `curl -sS -H "Authorization: Bearer $CLERK_SECRET_KEY" "https://api.clerk.com/v1/users?email_address=..."`
  - `curl -sS -H "Authorization: Bearer $CLERK_SECRET_KEY" "https://api.clerk.com/v1/invitations?limit=500&offset=0"`
  - `curl -sS -X PATCH -H "Authorization: Bearer $CLERK_SECRET_KEY" -H "Content-Type: application/json" "https://api.clerk.com/v1/users/<user_id>/metadata" --data '{"public_metadata":{"portalKey":"..."}}'`
  - `npm run build`
  - `git add src/app/api/public/leadgen/onboarding-complete/route.ts`
  - `git commit -m "Fix onboarding account link fallback for Clerk metadata gaps"`
  - `git push origin main`
  - `python3 /Users/hunterlapeyre/.codex/skills/security-reviewer/scripts/run_security_review.py --repo "$PWD" --pretty`
  - `python3 /Users/hunterlapeyre/.codex/skills/code-simplifier/scripts/run_code_simplifier.py --repo "$PWD" --pretty`
- Patterns discovered:
  - `Account is not linked to this organization` can be a metadata-link drift issue even when the user is correctly invited and authenticated; matching by primary email to paid intent is a safe self-heal gate.
  - For onboarding incidents, fastest truth path is: Clerk users by email -> Clerk invitations by email -> user `public_metadata.portalKey` -> intent `portalKey`.
- Gotchas:
  - Invite typo domains create real divergence (`bestchouce` vs `bestchoice`) and look like OTP failures from user perspective.
  - Existing API behavior previously hard-failed when `public_metadata.portalKey` was empty, even with valid login and token.
  - code-simplifier still flags readability nits in the updated route (non-blocking).
- Next-time start:
  - For any onboarding-link report, run the four-step truth sequence (user, invite, metadata, intent) before UI debugging.
  - Keep the self-heal guardrails: only backfill portal metadata when signed-in primary email equals intent billing email.

### 2026-02-21
- What we did:
  - Built internal clients dashboard at `/internal/clients` with Convex + Clerk aggregated status rows and lifecycle summary cards.
  - Added internal portal preview authority: dashboard now issues signed `preview_token` links and `/portal` can render in preview mode for a target `portalKey`.
  - Hardened `/portal` preview behavior with explicit expired/invalid preview-link handling instead of fallback redirects.
  - Fixed production build break in `src/proxy.ts` by passing `NextFetchEvent` to `clerkProxy(request, event)`; `npm run build` succeeded after patch and commit `b90fec4` was pushed to `origin/main`.
  - Closure analyzers: security-reviewer `pass`; code-simplifier `warn` (1 medium, 1 minor in `src/proxy.ts`).
- Commands used:
  - `npm run lint`
  - `npm run build`
  - `git status --short`
  - `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
  - `git rev-list --left-right --count HEAD...@{u}`
  - `git commit -m "Fix Clerk proxy middleware signature for production build"`
  - `git push origin main`
  - `pkill -f "next dev" || true && rm -f .next/dev/lock`
- Patterns discovered:
  - For this app/router setup, internal route auth should be handled before Clerk middleware in `src/proxy.ts`; misordered auth handling causes unstable proxy behavior and local request resets.
  - Vercel build failures are fastest to resolve by reproducing with local `npm run build` first, then patching from the exact TS error.
  - Internal dashboard pages should degrade gracefully when Clerk listing APIs fail (return partial data, avoid 500).
- Gotchas:
  - Clerk production keys are domain-locked (`obieo.com`), so local `127.0.0.1` browser usage can fail in `ClerkProvider` with origin/domain mismatch even when app code is correct.
  - `next dev` lock conflicts recur if prior processes are still alive; killing only one port is insufficient when another dev server still holds `.next/dev/lock`.
  - code-simplifier warning remained on `src/proxy.ts` (readability/style only, non-blocking).
- Next-time start:
  - Verify deployment from latest `main` commit first, then validate `/internal/clients` and one `View Client Portal` click on production domain where Clerk keys are valid.
  - For local debugging, use test/dev Clerk keys before portal UX checks to avoid false failures from domain restrictions.

### YYYY-MM-DD
- What we did:
- What we learned:
- Next time, do:
### 2026-02-15
- What we did:
  - Added corporate pay-per-lead offering: `pay_per_lead_40_first_lead` ($40 first lead, then $40 per delivered lead).
  - Added Basic Auth protection to internal payment-link generator via `middleware.ts`.
  - Fixed Vercel build type error by updating Convex validation union for the new billing model.
  - Switched middleware to fail-closed so missing auth env vars cannot silently expose the internal tool.
- What we learned:
  - If Basic Auth "does nothing", verify you're not relying on a permissive fallback: missing `INTERNAL_LEADGEN_BASIC_AUTH_*` should return 503.
  - Some environments cannot reach Vercel's API via CLI (DNS); pushing to `main` is the reliable prod redeploy path.
- Next time, do:
  - After setting Vercel env vars, validate Basic Auth from an incognito window or with `curl -I` / `curl -u`.
  - If you need local access to the internal tool, set `INTERNAL_LEADGEN_BASIC_AUTH_USER/PASS` in `.env.local` (middleware is fail-closed).
### 2026-02-13
- What we did:
  - Shipped production payment-first onboarding: internal payment link -> Stripe Checkout -> webhook -> Clerk invite -> `/leadgen/onboarding` -> `/portal`.
  - Added internal-only “test discount” support for Checkout to run $0 end-to-end tests.
  - Fixed production Stripe webhook failures by aligning `STRIPE_WEBHOOK_SECRET` with Stripe endpoint signing secret.
  - Fixed a sign-in redirect loop by removing Clerk `forceRedirectUrl` and adding portalKey recovery/backfill (Convex by email + Stripe customer metadata fallback).
  - Added a forced “resend invitation” path from `/checkout/success`.
- What we learned:
  - Stripe event resends are idempotent in our handler (KV dedupe); use a new event/session to re-trigger, or use the explicit resend flow.
  - Clerk redirects should respect `redirect_url` for onboarding; `forceRedirectUrl` can override and cause loops.
- Next time, do:
  - For a clean smoke test, use a brand-new billing email (or plus alias) so Stripe customer metadata is fresh.
  - Verify the 3-system handshake: Stripe event delivery 200 + Stripe customer metadata invite fields + Clerk user `publicMetadata.portalKey` + Convex org `onboardingStatus=completed`.
### 2026-02-12
- What we did:
  - Configured production Stripe webhook destination `obieo-prod-stripe-activation-webhook` for `https://www.obieo.com/api/webhooks/stripe` with 4 activation events.
  - Updated local env: `STRIPE_WEBHOOK_SECRET` is set in `.env.local`.
- What we learned:
  - Stripe Dashboard destinations require public URLs; localhost requires Stripe CLI forwarding.
- Next time, do:
  - Mirror this webhook config in production environment variables and send one test checkout to confirm invite email flow.
