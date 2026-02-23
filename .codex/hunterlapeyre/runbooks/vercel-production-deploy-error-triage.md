# Vercel Production Deploy Error Triage

## When to use
- GitHub push to `main` triggers Vercel production deploy that fails or stays in `Error`.

## Fast triage
1. List latest deploys:
- `npx vercel ls obieo --yes`
2. Inspect failed deployment logs:
- `npx vercel inspect <deployment-url-or-id> --logs`
3. Extract exact failing file + line + TS/runtime error.

## Fix + verify loop
1. Patch only the failing surface first (smallest safe fix).
2. Verify locally with production build:
- `npm run build`
3. Commit and push:
- `git add <files>`
- `git commit -m "<fix message>"`
- `git push origin main`
4. Watch new deployment:
- `npx vercel ls obieo --yes`
- `npx vercel inspect <new-deployment-url-or-id> --logs`

## Common gotchas
- Vercel project Node setting may say `24.x`, but repo `package.json` engines can force a different runtime (for this repo, `>=20 <23` -> Node `22.x` on Vercel).
- Local build success does not guarantee deploy success if a required file change was left unstaged.
- Use exact error text from `vercel inspect --logs`; avoid speculative fixes.
