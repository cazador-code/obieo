# Facebook Pixel Duplicate Events Fix - Session Progress

**Date:** 2026-01-24
**Status:** Complete

---

## What Was Done

- Diagnosed root cause of duplicate Facebook Pixel Schedule events (4 events firing with 0 actual bookings)
- Created new GTM variable "Query - booked" to capture URL parameter
- Created new GTM trigger "Trigger - Thank You Page - Confirmed Booking" requiring both `/thank-you` path AND `booked=true` parameter
- Updated Facebook Pixel - Lead tag to use validated trigger and `oncePerLoad`
- Updated Facebook Pixel - Schedule tag to use validated trigger and `oncePerLoad`
- Updated Facebook Pixel - Base tag to `oncePerLoad` (fixes SPA duplicate PageViews)
- Published GTM Version 6: "Fix Facebook Pixel duplicate events"
- Updated GHL calendar redirect URL to `https://www.obieo.com/thank-you?booked=true`
- Removed duplicate Meta pixel ID from GHL calendar settings (was causing second Schedule event)
- Verified fix: 1 Lead, 1 Schedule event per booking

## Key Decisions

- **Gold Standard approach**: Validation via URL parameter rather than relying on page visits
- **Removed GHL native pixel**: GTM now handles all Facebook tracking to prevent duplicates
- **oncePerLoad vs oncePerEvent**: Changed all Facebook tags to `oncePerLoad` to prevent SPA navigation duplicates

## Technical Details

| GTM Asset | ID | Change |
|-----------|-----|--------|
| Variable: Query - booked | 23 | Created (URL Query type) |
| Trigger: Confirmed Booking | 24 | Created (requires booked=true) |
| Tag: Facebook Pixel - Base | 20 | Changed to oncePerLoad |
| Tag: Facebook Pixel - Lead | 21 | New trigger + oncePerLoad |
| Tag: Facebook Pixel - Schedule | 22 | New trigger + oncePerLoad |

## Next Steps

- Monitor Facebook Datasets over next few days to confirm no duplicates
- Optional: Add server-side CAPI Schedule event via GHL webhook for redundancy
