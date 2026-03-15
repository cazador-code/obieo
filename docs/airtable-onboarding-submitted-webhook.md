# Airtable Onboarding Submitted Webhook

Use this after the `Onboarding Form Submission` automation updates Airtable successfully.

## Endpoint

- `POST /api/webhooks/airtable/onboarding-submitted`

## Auth

Send:

```text
Authorization: Bearer <AIRTABLE_ONBOARDING_SUBMITTED_WEBHOOK_SECRET>
```

If `AIRTABLE_ONBOARDING_SUBMITTED_WEBHOOK_SECRET` is not set, the route falls back to:

1. `CLIENT_ONBOARDING_API_SECRET`
2. `AIRTABLE_LEAD_DELIVERED_WEBHOOK_SECRET`

## What it does

This route:

1. accepts the Airtable submission payload
2. normalizes the form fields into the Obieo onboarding shape
3. stores onboarding data in Convex
4. preserves the existing billing/package settings already attached to the org
5. marks onboarding as completed in Convex

## Airtable Automation Script

Use a `Run script` action after the two Airtable `Update record` steps.

Pass the submission fields as automation inputs, then use this script:

```javascript
const inputConfig = input.config()

const endpoint = 'https://app.obieo.com/api/webhooks/airtable/onboarding-submitted'
const secret = inputConfig.webhookSecret

const payload = {
  submissionRecordId: inputConfig.submissionRecordId,
  portalKey: inputConfig.portalKey,
  companyName: inputConfig.legalBusinessName,
  primaryContactName: inputConfig.primaryContactName,
  businessPhone: inputConfig.businessPhone,
  leadNotificationPhone: inputConfig.leadNotificationPhone,
  leadNotificationEmail: inputConfig.leadNotificationEmail,
  accountLoginEmail: inputConfig.portalLoginEmail,
  leadProspectEmail: inputConfig.leadProspectEmail,
  businessAddress: inputConfig.businessAddress,
  serviceAreas: inputConfig.serviceAreas,
  targetZipCodes: inputConfig.targetZipCodes,
  serviceTypes: inputConfig.serviceTypes,
  desiredLeadVolumeDaily: inputConfig.desiredLeadVolumeDaily,
  operatingHoursStart: inputConfig.operatingHoursStart,
  operatingHoursEnd: inputConfig.operatingHoursEnd,
  leadDeliveryPreference: inputConfig.leadDeliveryPreference,
  billingEmail: inputConfig.billingEmail,
  paymentProvider: inputConfig.paymentProvider,
  paymentReference: inputConfig.paymentReference,
}

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${secret}`,
  },
  body: JSON.stringify(payload),
})

const result = await response.json()

if (!response.ok) {
  throw new Error(result?.error || `Webhook failed with status ${response.status}`)
}

output.set('result', result)
```

## Suggested Airtable Script Inputs

Map these from the triggering `Onboarding Submissions` record:

- `webhookSecret`
- `submissionRecordId`
- `portalKey`
- `legalBusinessName`
- `primaryContactName`
- `businessPhone`
- `leadNotificationPhone`
- `leadNotificationEmail`
- `portalLoginEmail`
- `leadProspectEmail`
- `businessAddress`
- `serviceAreas`
- `targetZipCodes`
- `serviceTypes`
- `desiredLeadVolumeDaily`
- `operatingHoursStart`
- `operatingHoursEnd`
- `leadDeliveryPreference`
- `billingEmail`
- `paymentProvider`
- `paymentReference`

## Good enough for now

The Airtable lookup automation is currently matching `Business Name = Legal Business Name` for easier setup/testing.

Long term, the production-safe version should match on:

- `Portal Key (stable ID)` = `Portal Key`

That avoids duplicate-name collisions.
