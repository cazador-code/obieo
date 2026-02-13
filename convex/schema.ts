import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const billingModel = v.union(
  v.literal('package_40_paid_in_full'),
  v.literal('commitment_40_with_10_upfront'),
  v.literal('pay_per_lead_perpetual')
)

export default defineSchema({
  organizations: defineTable({
    companyId: v.optional(v.string()),
    portalKey: v.string(),
    name: v.optional(v.string()),
    serviceAreas: v.optional(v.array(v.string())),
    targetZipCodes: v.optional(v.array(v.string())),
    serviceTypes: v.optional(v.array(v.string())),
    desiredLeadVolumeDaily: v.optional(v.number()),
    operatingHoursStart: v.optional(v.string()),
    operatingHoursEnd: v.optional(v.string()),
    leadDeliveryPhones: v.optional(v.array(v.string())),
    leadDeliveryEmails: v.optional(v.array(v.string())),
    leadNotificationPhone: v.optional(v.string()),
    leadNotificationEmail: v.optional(v.string()),
    leadProspectEmail: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripeSubscriptionItemId: v.optional(v.string()),
    billingModel: v.optional(billingModel),
    prepaidLeadCredits: v.optional(v.number()),
    leadCommitmentTotal: v.optional(v.number()),
    initialChargeCents: v.optional(v.number()),
    leadChargeThreshold: v.optional(v.number()),
    leadUnitPriceCents: v.optional(v.number()),
    onboardingStatus: v.optional(v.string()),
    onboardingCompletedAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_portalKey', ['portalKey'])
    .index('by_stripeCustomerId', ['stripeCustomerId']),

  leadEvents: defineTable({
    organizationId: v.id('organizations'),
    portalKey: v.string(),
    source: v.string(),
    sourceExternalId: v.string(),
    idempotencyKey: v.string(),
    deliveredAt: v.number(),
    createdAt: v.number(),
    status: v.union(v.literal('delivered'), v.literal('credited'), v.literal('invalid')),
    quantity: v.number(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    creditedAt: v.optional(v.number()),
    creditedReason: v.optional(v.string()),
    stripeUsageRecorded: v.boolean(),
    stripeUsageRecordId: v.optional(v.string()),
    stripeSubscriptionItemId: v.optional(v.string()),
    billableQuantity: v.optional(v.number()),
    billingSkippedReason: v.optional(v.string()),
  })
    .index('by_portalKey', ['portalKey'])
    .index('by_portal_and_external', ['portalKey', 'sourceExternalId'])
    .index('by_portal_and_idempotency', ['portalKey', 'idempotencyKey']),

      billingEvents: defineTable({
    organizationId: v.optional(v.id('organizations')),
    portalKey: v.string(),
    kind: v.string(),
    status: v.optional(v.string()),
    referenceId: v.optional(v.string()),
    amountCents: v.optional(v.number()),
    createdAt: v.number(),
    payloadJson: v.optional(v.string()),
  })
    .index('by_portalKey', ['portalKey'])
    .index('by_portal_and_kind', ['portalKey', 'kind']),

  onboardingSubmissions: defineTable({
    organizationId: v.optional(v.id('organizations')),
    portalKey: v.string(),
    companyId: v.optional(v.string()),
    accountFirstName: v.optional(v.string()),
    accountLastName: v.optional(v.string()),
    accountLoginEmail: v.optional(v.string()),
    businessPhone: v.optional(v.string()),
    businessAddress: v.optional(v.string()),
    companyName: v.string(),
    serviceAreas: v.array(v.string()),
    targetZipCodes: v.optional(v.array(v.string())),
    serviceTypes: v.optional(v.array(v.string())),
    desiredLeadVolumeDaily: v.optional(v.number()),
    operatingHoursStart: v.optional(v.string()),
    operatingHoursEnd: v.optional(v.string()),
    leadRoutingPhones: v.array(v.string()),
    leadRoutingEmails: v.array(v.string()),
    leadNotificationPhone: v.optional(v.string()),
    leadNotificationEmail: v.optional(v.string()),
    leadProspectEmail: v.optional(v.string()),
    billingContactName: v.optional(v.string()),
    billingContactEmail: v.optional(v.string()),
    billingModel: v.optional(billingModel),
    prepaidLeadCredits: v.optional(v.number()),
    leadCommitmentTotal: v.optional(v.number()),
    initialChargeCents: v.optional(v.number()),
    leadChargeThreshold: v.number(),
    leadUnitPriceCents: v.number(),
    status: v.union(
      v.literal('submitted'),
      v.literal('processed'),
      v.literal('rejected')
    ),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
    rawPayloadJson: v.optional(v.string()),
  })
    .index('by_portalKey', ['portalKey'])
    .index('by_portal_and_status', ['portalKey', 'status']),

  leadReplacementRequests: defineTable({
    organizationId: v.id('organizations'),
    portalKey: v.string(),
    leadEventId: v.id('leadEvents'),
    sourceExternalId: v.string(),
    requestedAt: v.number(),
    status: v.union(
      v.literal('submitted'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('auto_rejected_policy')
    ),
    reason: v.union(
      v.literal('lead_not_needed'),
      v.literal('never_answered'),
      v.literal('out_of_service_area'),
      v.literal('invalid_contact_info'),
      v.literal('already_under_contract'),
      v.literal('wrong_service_requested'),
      v.literal('other_quality_issue')
    ),
    contactAttemptedAt: v.optional(v.number()),
    contactAttemptMethod: v.optional(v.string()),
    policyWithinOneWeek: v.boolean(),
    policyContactedWithin15m: v.boolean(),
    policyReasonEligible: v.boolean(),
    policyLeadStatusEligible: v.boolean(),
    evidenceNotes: v.optional(v.string()),
    evidenceUrls: v.optional(v.array(v.string())),
    requestedBy: v.optional(v.string()),
    resolutionNotes: v.optional(v.string()),
    resolvedBy: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
  })
    .index('by_portalKey', ['portalKey'])
    .index('by_portal_and_status', ['portalKey', 'status'])
    .index('by_portal_and_leadEvent', ['portalKey', 'leadEventId']),

  workflowNotifications: defineTable({
    organizationId: v.optional(v.id('organizations')),
    portalKey: v.optional(v.string()),
    kind: v.string(),
    channel: v.string(),
    recipient: v.string(),
    status: v.union(v.literal('pending'), v.literal('sent'), v.literal('failed')),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    payloadJson: v.optional(v.string()),
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
  })
    .index('by_status', ['status'])
    .index('by_portalKey', ['portalKey']),
})
