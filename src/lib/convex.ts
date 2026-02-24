import { ConvexHttpClient } from 'convex/browser'
import type { BillingModel } from '@/lib/billing-models'
import type { PortalEditableProfile } from '@/lib/portal-profile'
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
  onboardingStatus?: string
  onboardingCompletedAt?: number
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

export async function grantLeadCreditsFromInvoiceInConvex(input: {
  portalKey: string
  invoiceId: string
  credits: number
  amountCents?: number
  invoiceUrl?: string
}): Promise<{ alreadyGranted: boolean; prepaidLeadCredits: number; leadCommitmentTotal: number | null } | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.mutation(api.leadLedger.grantLeadCreditsFromInvoice, {
      authSecret,
      ...input,
    })
    return result as { alreadyGranted: boolean; prepaidLeadCredits: number; leadCommitmentTotal: number | null }
  } catch (error) {
    console.error('Convex grantLeadCreditsFromInvoice failed:', error)
    return null
  }
}

export interface LeadEventSnapshot {
  _id: string
  source: string
  sourceExternalId: string
  deliveredAt: number
  createdAt: number
  status: 'delivered' | 'credited' | 'invalid'
  quantity: number
  billableQuantity?: number
  name?: string
  email?: string
  phone?: string
  city?: string
  state?: string
}

export interface OrganizationSnapshotInConvex {
  organization: Record<string, unknown>
  leadCounts: { total: number; usageRecorded: number; unbilled: number }
  recentLeadEvents: LeadEventSnapshot[]
  replacementRequests: unknown[]
  billingEvents: unknown[]
}

export async function getOrganizationSnapshotInConvex(input: {
  portalKey: string
}): Promise<OrganizationSnapshotInConvex | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.query(api.leadLedger.getOrganizationSnapshot, {
      authSecret,
      portalKey: input.portalKey,
    })
    return result as OrganizationSnapshotInConvex | null
  } catch (error) {
    console.error('Convex getOrganizationSnapshot failed:', error)
    return null
  }
}

export interface OrganizationRecordForOps {
  _id: string
  portalKey: string
  name?: string
  billingModel?: BillingModel
  onboardingStatus?: string
  onboardingCompletedAt?: number
  prepaidLeadCredits?: number
  leadCommitmentTotal?: number
  leadUnitPriceCents?: number
  leadChargeThreshold?: number
  stripeCustomerId?: string
  isActive?: boolean
  createdAt: number
  updatedAt: number
}

export interface UpdatePortalProfileInConvexInput {
  portalKey: string
  profile: PortalEditableProfile
  actorType: 'client' | 'admin_preview'
  actorUserId?: string
  actorEmail?: string
  actorInternalUser?: string
}

export interface UpdatePortalProfileInConvexResult {
  editId: string
  portalKey: string
  changedKeys: string[]
  addedTargetZipCodes: string[]
  removedTargetZipCodes: string[]
  savedAt: number
  profile: PortalEditableProfile
}

export async function updatePortalProfileInConvex(
  input: UpdatePortalProfileInConvexInput
): Promise<UpdatePortalProfileInConvexResult | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await (client as any).mutation('leadLedger:updatePortalProfile', {
      authSecret,
      portalKey: input.portalKey,
      serviceAreas: input.profile.serviceAreas,
      targetZipCodes: input.profile.targetZipCodes,
      leadDeliveryPhones: input.profile.leadDeliveryPhones,
      leadDeliveryEmails: input.profile.leadDeliveryEmails,
      leadNotificationPhone: input.profile.leadNotificationPhone,
      leadNotificationEmail: input.profile.leadNotificationEmail,
      leadProspectEmail: input.profile.leadProspectEmail,
      actorType: input.actorType,
      actorUserId: input.actorUserId,
      actorEmail: input.actorEmail,
      actorInternalUser: input.actorInternalUser,
    })
    return result as UpdatePortalProfileInConvexResult
  } catch (error) {
    console.error('Convex updatePortalProfile failed:', error)
    return null
  }
}

export async function listOrganizationsForOpsInConvex(input?: {
  limit?: number
}): Promise<OrganizationRecordForOps[]> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return []

  try {
    const result = await client.query(api.leadLedger.listOrganizationsForOps, {
      authSecret,
      ...(input?.limit ? { limit: input.limit } : {}),
    })
    return result as OrganizationRecordForOps[]
  } catch (error) {
    console.error('Convex listOrganizationsForOps failed:', error)
    return []
  }
}

export type LeadgenIntentStatus = 'checkout_created' | 'paid' | 'invited' | 'onboarding_completed'

export interface LeadgenIntentSnapshot {
  portalKey: string
  companyName: string
  billingEmail: string
  billingName?: string
  billingModel: BillingModel
  token: string
  tokenExpiresAt: number
  status: LeadgenIntentStatus
  checkoutSessionId?: string
  checkoutUrl?: string
  stripeCustomerId?: string
  paidAt?: number
  invitedAt?: number
  onboardingCompletedAt?: number
  source?: string
  utmSource?: string
  utmCampaign?: string
  utmMedium?: string
  utmContent?: string
  createdAt: number
  updatedAt: number
}

export async function listLeadgenIntentsForOpsInConvex(input?: {
  limit?: number
}): Promise<LeadgenIntentSnapshot[]> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return []

  try {
    const result = await client.query(api.leadgen.listLeadgenIntentsForOps, {
      authSecret,
      ...(input?.limit ? { limit: input.limit } : {}),
    })
    return result as LeadgenIntentSnapshot[]
  } catch (error) {
    console.error('Convex listLeadgenIntentsForOps failed:', error)
    return []
  }
}

export async function findActiveLeadgenIntentInConvex(input: {
  billingEmail: string
  companyName: string
}): Promise<LeadgenIntentSnapshot | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.query(api.leadgen.findActiveLeadgenIntent, {
      authSecret,
      ...input,
    })
    return result as LeadgenIntentSnapshot | null
  } catch (error) {
    console.error('Convex findActiveLeadgenIntent failed:', error)
    return null
  }
}

export async function createLeadgenIntentInConvex(input: {
  portalKey: string
  companyName: string
  billingEmail: string
  billingName?: string
  billingModel?: BillingModel
  token: string
  tokenExpiresAt: number
  source?: string
  utmSource?: string
  utmCampaign?: string
  utmMedium?: string
  utmContent?: string
}): Promise<LeadgenIntentSnapshot | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.mutation(api.leadgen.createLeadgenIntent, {
      authSecret,
      ...input,
    })
    return result as LeadgenIntentSnapshot
  } catch (error) {
    console.error('Convex createLeadgenIntent failed:', error)
    return null
  }
}

export async function updateLeadgenCheckoutDetailsInConvex(input: {
  portalKey: string
  stripeCustomerId?: string
  checkoutSessionId?: string
  checkoutUrl?: string
}): Promise<LeadgenIntentSnapshot | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.mutation(api.leadgen.updateLeadgenCheckoutDetails, {
      authSecret,
      ...input,
    })
    return result as LeadgenIntentSnapshot
  } catch (error) {
    console.error('Convex updateLeadgenCheckoutDetails failed:', error)
    return null
  }
}

export async function markLeadgenPaidInConvex(input: {
  portalKey: string
  checkoutSessionId?: string
  stripeCustomerId?: string
}): Promise<LeadgenIntentSnapshot | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.mutation(api.leadgen.markLeadgenPaid, {
      authSecret,
      ...input,
    })
    return result as LeadgenIntentSnapshot
  } catch (error) {
    console.error('Convex markLeadgenPaid failed:', error)
    return null
  }
}

export async function markLeadgenInvitedInConvex(input: {
  portalKey: string
}): Promise<LeadgenIntentSnapshot | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.mutation(api.leadgen.markLeadgenInvited, {
      authSecret,
      ...input,
    })
    return result as LeadgenIntentSnapshot
  } catch (error) {
    console.error('Convex markLeadgenInvited failed:', error)
    return null
  }
}

export async function markLeadgenOnboardingCompletedInConvex(input: {
  portalKey: string
}): Promise<LeadgenIntentSnapshot | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.mutation(api.leadgen.markLeadgenOnboardingCompleted, {
      authSecret,
      ...input,
    })
    return result as LeadgenIntentSnapshot
  } catch (error) {
    console.error('Convex markLeadgenOnboardingCompleted failed:', error)
    return null
  }
}

export async function getLeadgenIntentByTokenInConvex(input: {
  token: string
}): Promise<LeadgenIntentSnapshot | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.query(api.leadgen.getLeadgenIntentByToken, {
      authSecret,
      ...input,
    })
    return result as LeadgenIntentSnapshot | null
  } catch (error) {
    console.error('Convex getLeadgenIntentByToken failed:', error)
    return null
  }
}

export async function getLeadgenIntentByPortalKeyInConvex(input: {
  portalKey: string
}): Promise<LeadgenIntentSnapshot | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.query(api.leadgen.getLeadgenIntentByPortalKey, {
      authSecret,
      ...input,
    })
    return result as LeadgenIntentSnapshot | null
  } catch (error) {
    console.error('Convex getLeadgenIntentByPortalKey failed:', error)
    return null
  }
}

export async function getLeadgenIntentByBillingEmailInConvex(input: {
  billingEmail: string
}): Promise<LeadgenIntentSnapshot | null> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return null

  try {
    const result = await client.query(api.leadgen.getLeadgenIntentByBillingEmail, {
      authSecret,
      ...input,
    })
    return result as LeadgenIntentSnapshot | null
  } catch (error) {
    console.error('Convex getLeadgenIntentByBillingEmail failed:', error)
    return null
  }
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

export interface OnboardingSubmissionForOps {
  _id: string
  portalKey: string
  companyName: string
  accountLoginEmail?: string
  billingContactEmail?: string
  billingModel?: BillingModel
  status: 'submitted' | 'processed' | 'rejected'
  createdAt: number
  processedAt?: number
}

export async function listOnboardingSubmissionsForOpsInConvex(input?: {
  limit?: number
}): Promise<OnboardingSubmissionForOps[]> {
  const client = getConvexClient()
  const authSecret = getConvexAuthSecret()
  if (!client || !authSecret) return []

  try {
    const result = await client.query(api.leadLedger.listOnboardingSubmissionsForOps, {
      authSecret,
      ...(input?.limit ? { limit: input.limit } : {}),
    })
    return result as OnboardingSubmissionForOps[]
  } catch (error) {
    console.error('Convex listOnboardingSubmissionsForOps failed:', error)
    return []
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
