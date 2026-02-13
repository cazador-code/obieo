import { mutation, query } from './_generated/server'
import type { DatabaseReader, DatabaseWriter } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { v } from 'convex/values'

type OrganizationRecord = Doc<'organizations'>
type LeadEventRecord = Doc<'leadEvents'>

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

const CREDIT_REASON_VALUES = [
  'lead_not_needed',
  'never_answered',
  'out_of_service_area',
  'invalid_contact_info',
  'already_under_contract',
  'wrong_service_requested',
  'other_quality_issue',
] as const

const CREDIT_REASON_SET = new Set<string>(CREDIT_REASON_VALUES)
const BILLING_MODEL_VALIDATION = v.union(
  v.literal('package_40_paid_in_full'),
  v.literal('commitment_40_with_10_upfront'),
  v.literal('pay_per_lead_perpetual')
)

function assertAuthorized(authSecret: string) {
  const expected = process.env.CONVEX_AUTH_ADAPTER_SECRET
  if (!expected || authSecret !== expected) {
    throw new Error('Unauthorized')
  }
}

function getNotificationRecipients() {
  const raw =
    process.env.ONBOARDING_NOTIFICATION_EMAILS ||
    process.env.LEAD_OPS_NOTIFICATION_EMAILS ||
    process.env.NOTIFICATION_EMAIL ||
    'hello@obieo.com'

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

async function queueEmailNotifications(
  ctx: { db: DatabaseWriter },
  input: {
    organizationId?: Id<'organizations'>
    portalKey?: string
    kind: string
    subject: string
    body: string
    payload: Record<string, unknown>
  }
) {
  const recipients = getNotificationRecipients()
  const createdAt = Date.now()

  for (const recipient of recipients) {
    await ctx.db.insert('workflowNotifications', {
      organizationId: input.organizationId,
      portalKey: input.portalKey,
      kind: input.kind,
      channel: 'email',
      recipient,
      status: 'pending',
      subject: input.subject,
      body: input.body,
      payloadJson: JSON.stringify(input.payload),
      createdAt,
    })
  }
}

async function getOrganizationByPortalKey(
  ctx: { db: DatabaseReader },
  portalKey: string
) {
  return (await ctx.db
    .query('organizations')
    .withIndex('by_portalKey', (q) => q.eq('portalKey', portalKey))
    .first()) as OrganizationRecord | null
}

export const upsertOrganization = mutation({
  args: {
    authSecret: v.string(),
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
    billingModel: v.optional(BILLING_MODEL_VALIDATION),
    prepaidLeadCredits: v.optional(v.number()),
    leadCommitmentTotal: v.optional(v.number()),
    initialChargeCents: v.optional(v.number()),
    leadChargeThreshold: v.optional(v.number()),
    leadUnitPriceCents: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const now = Date.now()

    const existing = await getOrganizationByPortalKey(ctx, args.portalKey)
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.companyId !== undefined ? { companyId: args.companyId } : {}),
        ...(args.name !== undefined ? { name: args.name } : {}),
        ...(args.serviceAreas !== undefined ? { serviceAreas: args.serviceAreas } : {}),
        ...(args.targetZipCodes !== undefined ? { targetZipCodes: args.targetZipCodes } : {}),
        ...(args.serviceTypes !== undefined ? { serviceTypes: args.serviceTypes } : {}),
        ...(args.desiredLeadVolumeDaily !== undefined
          ? { desiredLeadVolumeDaily: args.desiredLeadVolumeDaily }
          : {}),
        ...(args.operatingHoursStart !== undefined ? { operatingHoursStart: args.operatingHoursStart } : {}),
        ...(args.operatingHoursEnd !== undefined ? { operatingHoursEnd: args.operatingHoursEnd } : {}),
        ...(args.leadDeliveryPhones !== undefined ? { leadDeliveryPhones: args.leadDeliveryPhones } : {}),
        ...(args.leadDeliveryEmails !== undefined ? { leadDeliveryEmails: args.leadDeliveryEmails } : {}),
        ...(args.leadNotificationPhone !== undefined
          ? { leadNotificationPhone: args.leadNotificationPhone }
          : {}),
        ...(args.leadNotificationEmail !== undefined
          ? { leadNotificationEmail: args.leadNotificationEmail }
          : {}),
        ...(args.leadProspectEmail !== undefined ? { leadProspectEmail: args.leadProspectEmail } : {}),
        ...(args.stripeCustomerId !== undefined ? { stripeCustomerId: args.stripeCustomerId } : {}),
        ...(args.stripeSubscriptionId !== undefined ? { stripeSubscriptionId: args.stripeSubscriptionId } : {}),
        ...(args.stripeSubscriptionItemId !== undefined
          ? { stripeSubscriptionItemId: args.stripeSubscriptionItemId }
          : {}),
        ...(args.billingModel !== undefined ? { billingModel: args.billingModel } : {}),
        ...(args.prepaidLeadCredits !== undefined ? { prepaidLeadCredits: args.prepaidLeadCredits } : {}),
        ...(args.leadCommitmentTotal !== undefined ? { leadCommitmentTotal: args.leadCommitmentTotal } : {}),
        ...(args.initialChargeCents !== undefined ? { initialChargeCents: args.initialChargeCents } : {}),
        ...(args.leadChargeThreshold !== undefined ? { leadChargeThreshold: args.leadChargeThreshold } : {}),
        ...(args.leadUnitPriceCents !== undefined ? { leadUnitPriceCents: args.leadUnitPriceCents } : {}),
        ...(args.isActive !== undefined ? { isActive: args.isActive } : {}),
        updatedAt: now,
      })

      return {
        created: false,
        organizationId: existing._id,
      }
    }

    const organizationId = await ctx.db.insert('organizations', {
      companyId: args.companyId,
      portalKey: args.portalKey,
      name: args.name,
      serviceAreas: args.serviceAreas,
      targetZipCodes: args.targetZipCodes,
      serviceTypes: args.serviceTypes,
      desiredLeadVolumeDaily: args.desiredLeadVolumeDaily,
      operatingHoursStart: args.operatingHoursStart,
      operatingHoursEnd: args.operatingHoursEnd,
      leadDeliveryPhones: args.leadDeliveryPhones,
      leadDeliveryEmails: args.leadDeliveryEmails,
      leadNotificationPhone: args.leadNotificationPhone,
      leadNotificationEmail: args.leadNotificationEmail,
      leadProspectEmail: args.leadProspectEmail,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripeSubscriptionItemId: args.stripeSubscriptionItemId,
      billingModel: args.billingModel,
      prepaidLeadCredits: args.prepaidLeadCredits,
      leadCommitmentTotal: args.leadCommitmentTotal,
      initialChargeCents: args.initialChargeCents,
      leadChargeThreshold: args.leadChargeThreshold,
      leadUnitPriceCents: args.leadUnitPriceCents,
      isActive: args.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    })

    return {
      created: true,
      organizationId,
    }
  },
})

export const submitClientOnboarding = mutation({
  args: {
    authSecret: v.string(),
    companyId: v.optional(v.string()),
    portalKey: v.string(),
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
    billingModel: v.optional(BILLING_MODEL_VALIDATION),
    prepaidLeadCredits: v.optional(v.number()),
    leadCommitmentTotal: v.optional(v.number()),
    initialChargeCents: v.optional(v.number()),
    leadChargeThreshold: v.number(),
    leadUnitPriceCents: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const now = Date.now()

    const existing = await getOrganizationByPortalKey(ctx, args.portalKey)
    let organizationId: Id<'organizations'>

    if (existing) {
      organizationId = existing._id
      await ctx.db.patch(existing._id, {
        ...(args.companyId !== undefined ? { companyId: args.companyId } : {}),
        name: args.companyName,
        serviceAreas: args.serviceAreas,
        ...(args.targetZipCodes !== undefined ? { targetZipCodes: args.targetZipCodes } : {}),
        ...(args.serviceTypes !== undefined ? { serviceTypes: args.serviceTypes } : {}),
        ...(args.desiredLeadVolumeDaily !== undefined
          ? { desiredLeadVolumeDaily: Math.floor(args.desiredLeadVolumeDaily) }
          : {}),
        ...(args.operatingHoursStart !== undefined ? { operatingHoursStart: args.operatingHoursStart } : {}),
        ...(args.operatingHoursEnd !== undefined ? { operatingHoursEnd: args.operatingHoursEnd } : {}),
        leadDeliveryPhones: args.leadRoutingPhones,
        leadDeliveryEmails: args.leadRoutingEmails,
        ...(args.leadNotificationPhone !== undefined
          ? { leadNotificationPhone: args.leadNotificationPhone }
          : {}),
        ...(args.leadNotificationEmail !== undefined
          ? { leadNotificationEmail: args.leadNotificationEmail }
          : {}),
        ...(args.leadProspectEmail !== undefined ? { leadProspectEmail: args.leadProspectEmail } : {}),
        ...(args.billingModel !== undefined ? { billingModel: args.billingModel } : {}),
        ...(args.prepaidLeadCredits !== undefined ? { prepaidLeadCredits: args.prepaidLeadCredits } : {}),
        ...(args.leadCommitmentTotal !== undefined ? { leadCommitmentTotal: args.leadCommitmentTotal } : {}),
        ...(args.initialChargeCents !== undefined ? { initialChargeCents: args.initialChargeCents } : {}),
        leadChargeThreshold: Math.floor(args.leadChargeThreshold),
        leadUnitPriceCents: Math.floor(args.leadUnitPriceCents),
        onboardingStatus: 'submitted',
        isActive: true,
        updatedAt: now,
      })
    } else {
      organizationId = await ctx.db.insert('organizations', {
        companyId: args.companyId,
        portalKey: args.portalKey,
        name: args.companyName,
        serviceAreas: args.serviceAreas,
        targetZipCodes: args.targetZipCodes,
        serviceTypes: args.serviceTypes,
        desiredLeadVolumeDaily:
          args.desiredLeadVolumeDaily !== undefined ? Math.floor(args.desiredLeadVolumeDaily) : undefined,
        operatingHoursStart: args.operatingHoursStart,
        operatingHoursEnd: args.operatingHoursEnd,
        leadDeliveryPhones: args.leadRoutingPhones,
        leadDeliveryEmails: args.leadRoutingEmails,
        leadNotificationPhone: args.leadNotificationPhone,
        leadNotificationEmail: args.leadNotificationEmail,
        leadProspectEmail: args.leadProspectEmail,
        billingModel: args.billingModel,
        prepaidLeadCredits: args.prepaidLeadCredits,
        leadCommitmentTotal: args.leadCommitmentTotal,
        initialChargeCents: args.initialChargeCents,
        leadChargeThreshold: Math.floor(args.leadChargeThreshold),
        leadUnitPriceCents: Math.floor(args.leadUnitPriceCents),
        onboardingStatus: 'submitted',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
    }

    const submissionId = await ctx.db.insert('onboardingSubmissions', {
      organizationId,
      portalKey: args.portalKey,
      companyId: args.companyId,
      accountFirstName: args.accountFirstName,
      accountLastName: args.accountLastName,
      accountLoginEmail: args.accountLoginEmail,
      businessPhone: args.businessPhone,
      businessAddress: args.businessAddress,
      companyName: args.companyName,
      serviceAreas: args.serviceAreas,
      targetZipCodes: args.targetZipCodes,
      serviceTypes: args.serviceTypes,
      desiredLeadVolumeDaily:
        args.desiredLeadVolumeDaily !== undefined ? Math.floor(args.desiredLeadVolumeDaily) : undefined,
      operatingHoursStart: args.operatingHoursStart,
      operatingHoursEnd: args.operatingHoursEnd,
      leadRoutingPhones: args.leadRoutingPhones,
      leadRoutingEmails: args.leadRoutingEmails,
      leadNotificationPhone: args.leadNotificationPhone,
      leadNotificationEmail: args.leadNotificationEmail,
      leadProspectEmail: args.leadProspectEmail,
      billingContactName: args.billingContactName,
      billingContactEmail: args.billingContactEmail,
      billingModel: args.billingModel,
      prepaidLeadCredits: args.prepaidLeadCredits,
      leadCommitmentTotal: args.leadCommitmentTotal,
      initialChargeCents: args.initialChargeCents,
      leadChargeThreshold: Math.floor(args.leadChargeThreshold),
      leadUnitPriceCents: Math.floor(args.leadUnitPriceCents),
      status: 'submitted',
      createdAt: now,
      rawPayloadJson: JSON.stringify({
        notes: args.notes,
      }),
    })

    await queueEmailNotifications(ctx, {
      organizationId,
      portalKey: args.portalKey,
      kind: 'onboarding_submitted',
      subject: `Client onboarding submitted: ${args.companyName}`,
      body: `Onboarding completed for ${args.companyName} (${args.portalKey}).`,
      payload: {
        submissionId,
        portalKey: args.portalKey,
        companyName: args.companyName,
        companyId: args.companyId,
        billingModel: args.billingModel,
        prepaidLeadCredits: args.prepaidLeadCredits,
        leadCommitmentTotal: args.leadCommitmentTotal,
        initialChargeCents: args.initialChargeCents,
        leadChargeThreshold: Math.floor(args.leadChargeThreshold),
        leadUnitPriceCents: Math.floor(args.leadUnitPriceCents),
      },
    })

    return {
      submissionId,
      organizationId,
      portalKey: args.portalKey,
    }
  },
})

export const recordLeadDelivery = mutation({
  args: {
    authSecret: v.string(),
    portalKey: v.string(),
    sourceExternalId: v.string(),
    source: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
    deliveredAt: v.optional(v.number()),
    quantity: v.optional(v.number()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    stripeSubscriptionItemId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const now = Date.now()

    const organization = await getOrganizationByPortalKey(ctx, args.portalKey)
    if (!organization) {
      throw new Error(`Unknown portal key: ${args.portalKey}`)
    }

    const source = args.source || 'ghl'
    const idempotencyKey = args.idempotencyKey || `${source}:${args.sourceExternalId}`

    const existingByIdempotency = (await ctx.db
      .query('leadEvents')
      .withIndex('by_portal_and_idempotency', (q) =>
        q.eq('portalKey', args.portalKey).eq('idempotencyKey', idempotencyKey)
      )
      .first()) as LeadEventRecord | null

    if (existingByIdempotency) {
      return {
        duplicate: true,
        leadEventId: existingByIdempotency._id,
        stripeUsageRecorded: existingByIdempotency.stripeUsageRecorded,
        billableQuantity:
          existingByIdempotency.billableQuantity !== undefined
            ? existingByIdempotency.billableQuantity
            : existingByIdempotency.quantity,
        stripeSubscriptionItemId:
          existingByIdempotency.stripeSubscriptionItemId || organization.stripeSubscriptionItemId || null,
      }
    }

    const existingByExternalId = (await ctx.db
      .query('leadEvents')
      .withIndex('by_portal_and_external', (q) =>
        q.eq('portalKey', args.portalKey).eq('sourceExternalId', args.sourceExternalId)
      )
      .first()) as LeadEventRecord | null

    if (existingByExternalId) {
      return {
        duplicate: true,
        leadEventId: existingByExternalId._id,
        stripeUsageRecorded: existingByExternalId.stripeUsageRecorded,
        billableQuantity:
          existingByExternalId.billableQuantity !== undefined
            ? existingByExternalId.billableQuantity
            : existingByExternalId.quantity,
        stripeSubscriptionItemId:
          existingByExternalId.stripeSubscriptionItemId || organization.stripeSubscriptionItemId || null,
      }
    }

    const quantity = args.quantity && args.quantity > 0 ? Math.floor(args.quantity) : 1
    const historicalLeadEvents = (await ctx.db
      .query('leadEvents')
      .withIndex('by_portalKey', (q) => q.eq('portalKey', args.portalKey))
      .collect()) as LeadEventRecord[]

    const deliveredBefore = historicalLeadEvents
      .filter((event) => event.status === 'delivered')
      .reduce((sum, event) => sum + (event.quantity || 1), 0)

    const commitmentTotal =
      typeof organization.leadCommitmentTotal === 'number' && Number.isFinite(organization.leadCommitmentTotal)
        ? Math.max(0, Math.floor(organization.leadCommitmentTotal))
        : null
    const prepaidLeadCredits =
      typeof organization.prepaidLeadCredits === 'number' && Number.isFinite(organization.prepaidLeadCredits)
        ? Math.max(0, Math.floor(organization.prepaidLeadCredits))
        : 0

    const commitmentRemaining =
      commitmentTotal === null ? quantity : Math.max(0, commitmentTotal - deliveredBefore)
    const eligibleQuantity = Math.min(quantity, commitmentRemaining)
    const prepaidRemaining = Math.max(0, prepaidLeadCredits - deliveredBefore)
    const billableQuantity = Math.max(0, eligibleQuantity - prepaidRemaining)
    const billingSkippedReason =
      eligibleQuantity <= 0
        ? 'commitment_reached'
        : billableQuantity <= 0 && prepaidRemaining > 0
          ? 'prepaid_credit'
          : undefined

    const leadEventId = await ctx.db.insert('leadEvents', {
      organizationId: organization._id,
      portalKey: args.portalKey,
      source,
      sourceExternalId: args.sourceExternalId,
      idempotencyKey,
      deliveredAt: args.deliveredAt || now,
      createdAt: now,
      status: 'delivered',
      quantity,
      name: args.name,
      email: args.email,
      phone: args.phone,
      address: args.address,
      city: args.city,
      state: args.state,
      zip: args.zip,
      stripeUsageRecorded: false,
      stripeUsageRecordId: undefined,
      stripeSubscriptionItemId: args.stripeSubscriptionItemId || organization.stripeSubscriptionItemId,
      billableQuantity,
      billingSkippedReason,
    })

    return {
      duplicate: false,
      leadEventId,
      stripeUsageRecorded: false,
      billableQuantity,
      billingSkippedReason: billingSkippedReason || null,
      stripeSubscriptionItemId: args.stripeSubscriptionItemId || organization.stripeSubscriptionItemId || null,
    }
  },
})

export const submitLeadReplacementRequest = mutation({
  args: {
    authSecret: v.string(),
    portalKey: v.string(),
    leadEventId: v.optional(v.id('leadEvents')),
    sourceExternalId: v.optional(v.string()),
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
    evidenceNotes: v.optional(v.string()),
    evidenceUrls: v.optional(v.array(v.string())),
    requestedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)

    if (!args.leadEventId && !args.sourceExternalId) {
      throw new Error('Must provide leadEventId or sourceExternalId')
    }

    const organization = await getOrganizationByPortalKey(ctx, args.portalKey)
    if (!organization) {
      throw new Error(`Unknown portal key: ${args.portalKey}`)
    }

    let leadEvent: LeadEventRecord | null = null

    if (args.leadEventId) {
      const fromId = (await ctx.db.get(args.leadEventId)) as LeadEventRecord | null
      if (fromId && fromId.portalKey === args.portalKey) {
        leadEvent = fromId
      }
    } else if (args.sourceExternalId) {
      const sourceExternalId = args.sourceExternalId
      leadEvent = (await ctx.db
        .query('leadEvents')
        .withIndex('by_portal_and_external', (q) =>
          q.eq('portalKey', args.portalKey).eq('sourceExternalId', sourceExternalId)
        )
        .first()) as LeadEventRecord | null
    }

    if (!leadEvent) {
      throw new Error('Lead not found for replacement request')
    }

    const now = Date.now()
    const contactAttemptedAt = args.contactAttemptedAt ?? now

    const policyWithinOneWeek = now - leadEvent.deliveredAt <= ONE_WEEK_MS
    const policyContactedWithin15m =
      contactAttemptedAt >= leadEvent.deliveredAt &&
      contactAttemptedAt <= leadEvent.deliveredAt + FIFTEEN_MINUTES_MS
    const policyReasonEligible = CREDIT_REASON_SET.has(args.reason)
    const policyLeadStatusEligible = leadEvent.status === 'delivered'

    const status =
      policyWithinOneWeek &&
      policyContactedWithin15m &&
      policyReasonEligible &&
      policyLeadStatusEligible
        ? 'submitted'
        : 'auto_rejected_policy'

    const requestId = await ctx.db.insert('leadReplacementRequests', {
      organizationId: organization._id,
      portalKey: args.portalKey,
      leadEventId: leadEvent._id,
      sourceExternalId: leadEvent.sourceExternalId,
      requestedAt: now,
      status,
      reason: args.reason,
      contactAttemptedAt,
      contactAttemptMethod: args.contactAttemptMethod,
      policyWithinOneWeek,
      policyContactedWithin15m,
      policyReasonEligible,
      policyLeadStatusEligible,
      evidenceNotes: args.evidenceNotes,
      evidenceUrls: args.evidenceUrls,
      requestedBy: args.requestedBy,
    })

    await ctx.db.insert('billingEvents', {
      organizationId: organization._id,
      portalKey: args.portalKey,
      kind: 'lead_replacement_request',
      status,
      referenceId: requestId,
      createdAt: now,
      payloadJson: JSON.stringify({
        leadEventId: leadEvent._id,
        sourceExternalId: leadEvent.sourceExternalId,
        reason: args.reason,
        policyWithinOneWeek,
        policyContactedWithin15m,
        policyReasonEligible,
        policyLeadStatusEligible,
      }),
    })

    if (status === 'submitted') {
      await queueEmailNotifications(ctx, {
        organizationId: organization._id,
        portalKey: args.portalKey,
        kind: 'lead_replacement_submitted',
        subject: `Lead replacement request: ${args.portalKey}`,
        body: `Replacement request submitted for lead ${leadEvent.sourceExternalId}.`,
        payload: {
          requestId,
          leadEventId: leadEvent._id,
          sourceExternalId: leadEvent.sourceExternalId,
          reason: args.reason,
        },
      })
    }

    return {
      requestId,
      status,
      eligibleForReview: status === 'submitted',
      policy: {
        withinOneWeek: policyWithinOneWeek,
        contactedWithin15m: policyContactedWithin15m,
        reasonEligible: policyReasonEligible,
        leadStatusEligible: policyLeadStatusEligible,
      },
      leadEventId: leadEvent._id,
      sourceExternalId: leadEvent.sourceExternalId,
    }
  },
})

export const resolveLeadReplacementRequest = mutation({
  args: {
    authSecret: v.string(),
    requestId: v.id('leadReplacementRequests'),
    decision: v.union(v.literal('approve'), v.literal('reject')),
    resolutionNotes: v.optional(v.string()),
    resolvedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)

    const request = await ctx.db.get(args.requestId)
    if (!request) {
      throw new Error('Replacement request not found')
    }

    if (request.status !== 'submitted') {
      return {
        updated: false,
        reason: 'Request is not in submitted status',
      }
    }

    const leadEvent = await ctx.db.get(request.leadEventId)
    if (!leadEvent) {
      throw new Error('Associated lead event not found')
    }

    const now = Date.now()
    const nextStatus = args.decision === 'approve' ? 'approved' : 'rejected'

    await ctx.db.patch(request._id, {
      status: nextStatus,
      resolutionNotes: args.resolutionNotes,
      resolvedBy: args.resolvedBy,
      resolvedAt: now,
    })

    if (args.decision === 'approve') {
      await ctx.db.patch(leadEvent._id, {
        status: 'credited',
        creditedAt: now,
        creditedReason: request.reason,
      })
    }

    const organization = await getOrganizationByPortalKey(ctx, request.portalKey)
    const amountCents =
      organization?.leadUnitPriceCents && leadEvent.quantity
        ? Math.floor(organization.leadUnitPriceCents * leadEvent.quantity)
        : undefined

    await ctx.db.insert('billingEvents', {
      organizationId: request.organizationId,
      portalKey: request.portalKey,
      kind: 'lead_replacement_resolved',
      status: nextStatus,
      referenceId: request._id,
      amountCents,
      createdAt: now,
      payloadJson: JSON.stringify({
        decision: args.decision,
        leadEventId: leadEvent._id,
        sourceExternalId: request.sourceExternalId,
        reason: request.reason,
      }),
    })

    await queueEmailNotifications(ctx, {
      organizationId: request.organizationId,
      portalKey: request.portalKey,
      kind: 'lead_replacement_resolved',
      subject: `Lead replacement ${nextStatus}: ${request.portalKey}`,
      body: `Replacement request ${request._id} was ${nextStatus}.`,
      payload: {
        requestId: request._id,
        decision: args.decision,
        leadEventId: leadEvent._id,
        sourceExternalId: request.sourceExternalId,
      },
    })

    return {
      updated: true,
      requestId: request._id,
      status: nextStatus,
      leadEventId: leadEvent._id,
      amountCents,
    }
  },
})

export const markLeadUsageRecorded = mutation({
  args: {
    authSecret: v.string(),
    leadEventId: v.id('leadEvents'),
    stripeUsageRecordId: v.string(),
    stripeSubscriptionItemId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)

    const leadEvent = await ctx.db.get(args.leadEventId)
    if (!leadEvent) {
      throw new Error('Lead event not found')
    }

    if (leadEvent.stripeUsageRecorded) {
      return {
        alreadyRecorded: true,
        leadEventId: leadEvent._id,
      }
    }

    await ctx.db.patch(leadEvent._id, {
      stripeUsageRecorded: true,
      stripeUsageRecordId: args.stripeUsageRecordId,
      ...(args.stripeSubscriptionItemId ? { stripeSubscriptionItemId: args.stripeSubscriptionItemId } : {}),
    })

    await ctx.db.insert('billingEvents', {
      organizationId: leadEvent.organizationId,
      portalKey: leadEvent.portalKey,
      kind: 'usage_recorded',
      status: 'recorded',
      referenceId: args.stripeUsageRecordId,
      createdAt: Date.now(),
      payloadJson: JSON.stringify({
        leadEventId: leadEvent._id,
        stripeSubscriptionItemId: args.stripeSubscriptionItemId || leadEvent.stripeSubscriptionItemId,
        quantity: leadEvent.quantity,
      }),
    })

    return {
      alreadyRecorded: false,
      leadEventId: leadEvent._id,
    }
  },
})

export const recordInvoiceEvent = mutation({
  args: {
    authSecret: v.string(),
    portalKey: v.string(),
    invoiceId: v.string(),
    status: v.string(),
    amountCents: v.optional(v.number()),
    invoiceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const organization = await getOrganizationByPortalKey(ctx, args.portalKey)

    const billingEventId = await ctx.db.insert('billingEvents', {
      organizationId: organization?._id,
      portalKey: args.portalKey,
      kind: 'invoice',
      status: args.status,
      referenceId: args.invoiceId,
      amountCents: args.amountCents,
      createdAt: Date.now(),
      payloadJson: JSON.stringify({
        invoiceUrl: args.invoiceUrl,
      }),
    })

    return { billingEventId }
  },
})

export const getOrganizationSnapshot = query({
  args: {
    authSecret: v.string(),
    portalKey: v.string(),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)

    const organization = await getOrganizationByPortalKey(ctx, args.portalKey)
    if (!organization) return null

    const leadEvents = await ctx.db
      .query('leadEvents')
      .withIndex('by_portalKey', (q) => q.eq('portalKey', args.portalKey))
      .collect()

    const billingEvents = await ctx.db
      .query('billingEvents')
      .withIndex('by_portalKey', (q) => q.eq('portalKey', args.portalKey))
      .collect()

    const replacementRequests = await ctx.db
      .query('leadReplacementRequests')
      .withIndex('by_portalKey', (q) => q.eq('portalKey', args.portalKey))
      .collect()

    const deliveredLeads = leadEvents.filter((event) => event.status === 'delivered')
    const usageRecordedLeads = deliveredLeads.filter((event) => event.stripeUsageRecorded)

    return {
      organization,
      leadCounts: {
        total: deliveredLeads.reduce((sum, event) => sum + (event.quantity || 1), 0),
        usageRecorded: usageRecordedLeads.reduce((sum, event) => sum + (event.quantity || 1), 0),
        unbilled:
          deliveredLeads.reduce((sum, event) => sum + (event.quantity || 1), 0) -
          usageRecordedLeads.reduce((sum, event) => sum + (event.quantity || 1), 0),
      },
      replacementRequests: replacementRequests
        .sort((a, b) => b.requestedAt - a.requestedAt)
        .slice(0, 50),
      billingEvents: billingEvents
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 25),
    }
  },
})
