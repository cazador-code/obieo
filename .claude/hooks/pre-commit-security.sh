#!/bin/bash
# Pre-commit security hook for Claude Code
# Runs tsc, lint, and gitleaks before git commits

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only intercept git commit commands
if ! echo "$COMMAND" | grep -q "^git commit"; then
  exit 0
fi

ERRORS=""

# TypeScript compilation check
if ! npx tsc --noEmit 2>/dev/null; then
  ERRORS="${ERRORS}TypeScript compilation errors found.\n"
fi

# Lint check
if ! npm run lint --silent 2>/dev/null; then
  ERRORS="${ERRORS}Lint errors found.\n"
fi

# Gitleaks secret scanning
if command -v gitleaks &>/dev/null || npx gitleaks --version &>/dev/null 2>&1; then
  if ! npx gitleaks detect --source . --no-banner 2>/dev/null; then
    ERRORS="${ERRORS}Potential secrets detected by gitleaks.\n"
  fi
fi

if [ -n "$ERRORS" ]; then
  REASON=$(echo -e "$ERRORS" | tr '\n' ' ')
  echo "BLOCKED: ${REASON}" >&2
  exit 2
fi

exit 0
