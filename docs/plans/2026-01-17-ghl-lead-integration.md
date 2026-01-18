# GHL Lead Integration

**Date:** 2026-01-17

## Summary

Added GoHighLevel (GHL) integration for quiz and ROI calculator form submissions.

## What was done

1. **Quiz form** (`/quiz`) now sends:
   - Email notification via Resend
   - Contact data to GHL inbound webhook

2. **ROI Calculator** (`/roi-calculator`) now sends:
   - Email notification via Resend (already existed)
   - Contact data to GHL inbound webhook (added)

## GHL Webhook

**URL:** `https://services.leadconnectorhq.com/hooks/uYeEUrkrjlAgGnhEu9Ts/webhook-trigger/abe6a2b5-4487-478f-a496-f55503f9d27d`

**Fields sent (Quiz):**
- `email`, `name`, `website`, `source` ("quiz"), `score`
- `quiz_industry`, `quiz_has_website`, `quiz_lead_source`, `quiz_frustration`, `quiz_goals`

**Fields sent (ROI Calculator):**
- `email`, `name`, `company`, `source` ("roi-calculator")
- `roi_average_ticket`, `roi_close_rate`, `roi_leads_per_month`, `roi_profit_margin`, `roi_potential_revenue`

## Files changed

- `src/app/api/leads/route.ts` - Added GHL webhook calls and quiz email notifications

## GHL Workflow Setup

1. Create workflow with "Inbound Webhook" trigger
2. Add "Create Contact" action
3. Map fields from webhook data (e.g., `{{inboundWebhookRequest.email}}`)
4. Publish workflow
