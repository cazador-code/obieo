import { ConvexHttpClient } from 'convex/browser'
import type { BillingModel } from '@/lib/billing-models'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

let convexClient: ConvexHttpClient | null = null

function getConvexUrl(): string | null {
  const url = process.env.CONVEX_URL
  if (!url || !url.trim()) return null
  return url.trim()
}

function getConvexAuthSecret(): string | null {
  const secret = process.env.CONVEX_AUTH_ADAPTER_SECRET
  if (!secret || !secret.trim()) return null
  return secret.trim()
}

function getConvexClient(): ConvexHttpClient | null {
  const url = getConvexUrl()
  if (!url) return null

  if (!convexClient) {
    convexClient = new ConvexHttpClient(url)
  }

  return convexClient
}

export interface RecordLeadDeliveryInConvexInput {
  portalKey: string
  sourceExternalId: string
  idempotencyKey: string
  deliveredAt?: number
  quantity?: number
  source?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  stripeSubscriptionItemId?: string
}

export interface RecordLeadDeliveryInConvexResult {
  duplicate: boolean
  leadEventId: string
  stripeUsageRecorded: boolean
  billableQuantity: number
  billingSkippedReason?: string | null
  stripeSubscriptionItemId: string | null
}

export async function recordLeadDeliveryInConvex(
  input: RecordLeadDeliveryInConvexInput
): Promise<RecordLeadDeliveryInConvexResult | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.mutation(api.leadLedger.recordLeadDelivery, {
      authSecret,
      ...input,
    })
    return result as RecordLeadDeliveryInConvexResult
  } catch (error) {
    console.error('Convex recordLeadDelivery failed:', error)
    return null
  }
}

export async function markLeadUsageRecordedInConvex(input: {
  leadEventId: string
  stripeUsageRecordId: string
  stripeSubscriptionItemId?: string
}): Promise<boolean> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return false

  try {
    await client.mutation(api.leadLedger.markLeadUsageRecorded, {
      authSecret,
      ...input,
      leadEventId: input.leadEventId as Id<'leadEvents'>,
    })
    return true
  } catch (error) {
    console.error('Convex markLeadUsageRecorded failed:', error)
    return false
  }
}

export async function upsertOrganizationInConvex(input: {
  companyId?: string
  portalKey: string
  name?: string
  serviceAreas?: string[]
  leadDeliveryPhones?: string[]
  leadDeliveryEmails?: string[]
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripeSubscriptionItemId?: string
  billingModel?: BillingModel
  prepaidLeadCredits?: number
  leadCommitmentTotal?: number
  initialChargeCents?: number
  leadChargeThreshold?: number
  leadUnitPriceCents?: number
  isActive?: boolean
}, opts?: { throwOnError?: boolean }) {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.mutation(api.leadLedger.upsertOrganization, {
      authSecret,
      ...input,
    })
    return result as { created: boolean; organizationId: string }
  } catch (error) {
    console.error('Convex upsertOrganization failed:', error)
    if (opts?.throwOnError) throw error
    return null
  }
}

export async function recordInvoiceEventInConvex(input: {
  portalKey: string
  invoiceId: string
  status: string
  amountCents?: number
  invoiceUrl?: string
}) {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  const result = await client.mutation(api.leadLedger.recordInvoiceEvent, {
    authSecret,
    ...input,
  })
  return result as { billingEventId: string }
}

export async function submitClientOnboardingInConvex(input: {
  companyId?: string
  portalKey: string
  accountFirstName?: string
  accountLastName?: string
  accountLoginEmail?: string
  businessPhone?: string
  businessAddress?: string
  companyName: string
  serviceAreas: string[]
  targetZipCodes?: string[]
  serviceTypes?: string[]
  desiredLeadVolumeDaily?: number
  operatingHoursStart?: string
  operatingHoursEnd?: string
  leadRoutingPhones: string[]
  leadRoutingEmails: string[]
  leadNotificationPhone?: string
  leadNotificationEmail?: string
  leadProspectEmail?: string
  billingContactName?: string
  billingContactEmail?: string
  billingModel?: BillingModel
  prepaidLeadCredits?: number
  leadCommitmentTotal?: number
  initialChargeCents?: number
  leadChargeThreshold: number
  leadUnitPriceCents: number
  notes?: string
}, opts?: { throwOnError?: boolean }) {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.mutation(api.leadLedger.submitClientOnboarding, {
      authSecret,
      ...input,
    })
    return result as { submissionId: string; organizationId: string; portalKey: string }
  } catch (error) {
    console.error('Convex submitClientOnboarding failed:', error)
    if (opts?.throwOnError) throw error
    return null
  }
}

export async function submitLeadReplacementRequestInConvex(input: {
  portalKey: string
  leadEventId?: string
  sourceExternalId?: string
  reason:
    | 'lead_not_needed'
    | 'never_answered'
    | 'out_of_service_area'
    | 'invalid_contact_info'
    | 'already_under_contract'
    | 'wrong_service_requested'
    | 'other_quality_issue'
  contactAttemptedAt?: number
  contactAttemptMethod?: string
  evidenceNotes?: string
  evidenceUrls?: string[]
  requestedBy?: string
}) {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  const result = await client.mutation(api.leadLedger.submitLeadReplacementRequest, {
    authSecret,
    ...input,
    leadEventId: input.leadEventId ? (input.leadEventId as Id<'leadEvents'>) : undefined,
  })
  return result as {
    requestId: string
    status: 'submitted' | 'auto_rejected_policy'
    eligibleForReview: boolean
    policy: {
      withinOneWeek: boolean
      contactedWithin15m: boolean
      reasonEligible: boolean
      leadStatusEligible: boolean
    }
    leadEventId: string
    sourceExternalId: string
  }
}

export async function resolveLeadReplacementRequestInConvex(input: {
  requestId: string
  decision: 'approve' | 'reject'
  resolutionNotes?: string
  resolvedBy?: string
}) {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  const result = await client.mutation(api.leadLedger.resolveLeadReplacementRequest, {
    authSecret,
    ...input,
    requestId: input.requestId as Id<'leadReplacementRequests'>,
  })
  return result as {
    updated: boolean
    reason?: string
    requestId?: string
    status?: 'approved' | 'rejected'
    leadEventId?: string
    amountCents?: number
  }
}
