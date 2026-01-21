# Facebook Pixel GTM Integration - Session Progress

**Date:** 2026-01-21
**Status:** Complete

---

## What Was Done

- Discovered Facebook Pixel was not configured in GTM (had been removed from code assuming GTM managed it)
- Created three Facebook Pixel tags in GTM via MCP API:
  - **Facebook Pixel - Base** (tagId: 20) - fires on All Pages, tracks PageView
  - **Facebook Pixel - Lead** (tagId: 21) - fires on Thank You page
  - **Facebook Pixel - Schedule** (tagId: 22) - fires on Thank You page
- Published GTM Version 5 "Add Facebook Pixel tags" to live
- Removed duplicate pixel code from `src/app/thank-you/page.tsx` (GTM now handles all pixel events)
- Verified all three events firing correctly via Meta Pixel Helper

## GTM Configuration

| Tag | Trigger | Event |
|-----|---------|-------|
| Facebook Pixel - Base | All Pages (2147479553) | PageView |
| Facebook Pixel - Lead | Thank You Page (5) | Lead |
| Facebook Pixel - Schedule | Thank You Page (5) | Schedule |

## Key Details

- **GTM Container:** GTM-TMBFS7H7
- **Facebook Pixel ID:** 290774033453771
- **Account ID:** 6332041739
- **Container ID:** 239581002

## Tracking Architecture

| Method | Purpose |
|--------|---------|
| Browser Pixel (GTM) | Users without ad blockers |
| Conversions API (CAPI) | All users, server-side |

Both methods fire the same events; Meta deduplicates automatically.

## Files Modified

- `src/app/thank-you/page.tsx` - Removed duplicate fbq calls (now managed by GTM)

## Next Steps

- None - Facebook Pixel tracking is fully operational
