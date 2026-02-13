#!/usr/bin/env bash
set -euo pipefail

# Sync the shared auth secret used by Next.js -> Convex HTTP mutations.
#
# Requirements:
# - `.env.local` contains `CONVEX_AUTH_ADAPTER_SECRET=...`
# - You are authenticated for the target Convex deployment (via `CONVEX_DEPLOY_KEY`
#   env var or `npx convex dev` login).
#
# This script does NOT print the secret value.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.local"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}"
  exit 1
fi

# Load only the one var we need, without echoing.
CONVEX_AUTH_ADAPTER_SECRET="$(
  node -e "const fs=require('fs');const s=fs.readFileSync(process.argv[1],'utf8');const m=s.match(/^CONVEX_AUTH_ADAPTER_SECRET=(.*)$/m);process.stdout.write((m&&m[1]?m[1]:'').trim());" "${ENV_FILE}"
)"

if [[ -z "${CONVEX_AUTH_ADAPTER_SECRET}" ]]; then
  echo "CONVEX_AUTH_ADAPTER_SECRET is missing in .env.local"
  echo "Add it to ${ENV_FILE} (and keep it the same in Convex)."
  exit 1
fi

echo "Setting CONVEX_AUTH_ADAPTER_SECRET in Convex deployment (value hidden)..."
printf "%s" "${CONVEX_AUTH_ADAPTER_SECRET}" | npx convex env set CONVEX_AUTH_ADAPTER_SECRET
echo "Done."

