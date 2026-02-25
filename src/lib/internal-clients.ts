import 'server-only'

import { clerkClient } from '@clerk/nextjs/server'
import type { BillingModel } from '@/lib/billing-models'
import {
  type LeadgenIntentSnapshot,
  type OnboardingSubmissionForOps,
  type OrganizationRecordForOps,
  type ZipChangeRequestSnapshot,
  listLeadgenIntentsForOpsInConvex,
  listOnboardingSubmissionsForOpsInConvex,
  listOrganizationsForOpsInConvex,
  listPendingZipChangeRequestsForOpsInConvex,
} from '@/lib/convex'

type ClientStage = 'active' | 'invited' | 'paid' | 'checkout' | 'onboarding' | 'setup'

export interface InternalClientRow {
  portalKey: string
  companyName: string | null
  billingEmail: string | null
  billingModel: BillingModel | null
  stage: ClientStage
  stageLabel: string
  intentStatus: LeadgenIntentSnapshot['status'] | null
  intentSource: string | null
  onboardingStatus: string | null
  organizationActive: boolean | null
  prepaidLeadCredits: number | null
  leadCommitmentTotal: number | null
  leadUnitPriceCents: number | null
  clerkUserCount: number
  pendingInvitationCount: number
  clerkUsers: string[]
  invitationEmails: string[]
  lastUpdatedAt: number | null
  onboardingLink: string | null
  pendingZipRequest: ZipChangeRequestSnapshot | null
}

export interface InternalClientsSummary {
  total: number
  active: number
  invited: number
  paid: number
  checkout: number
  onboarding: number
  pendingZipRequests: number
}

export interface InternalClientsDashboardData {
  rows: InternalClientRow[]
  summary: InternalClientsSummary
}

type ClerkUserLike = {
  id: string
  emailAddresses?: Array<{ id: string; emailAddress: string }>
  primaryEmailAddressId?: string | null
  publicMetadata?: Record<string, unknown> | null
  createdAt?: number
  updatedAt?: number
}

type ClerkInvitationLike = {
  id: string
  emailAddress: string
  status: string
  publicMetadata?: Record<string, unknown> | null
  createdAt: number
  updatedAt: number
}

type ClientAccumulator = {
  portalKey: string
  organization: OrganizationRecordForOps | null
  intent: LeadgenIntentSnapshot | null
  latestSubmission: OnboardingSubmissionForOps | null
  clerkUsers: Set<string>
  invitationEmails: Set<string>
  pendingInvitationCount: number
  userLastUpdatedAt: number | null
  invitationLastUpdatedAt: number | null
}

function getPortalKeyFromMetadata(metadata: Record<string, unknown> | null | undefined): string | null {
  if (!metadata) return null
  const keyCandidates = [metadata.portalKey, metadata.portal_key]
  for (const candidate of keyCandidates) {
    if (typeof candidate !== 'string') continue
    const cleaned = candidate.trim()
    if (cleaned) return cleaned
  }
  return null
}

function getPrimaryEmail(user: ClerkUserLike): string | null {
  const emailAddresses = Array.isArray(user.emailAddresses) ? user.emailAddresses : []
  if (emailAddresses.length === 0) return null
  const primary = emailAddresses.find((item) => item.id === user.primaryEmailAddressId)
  return (primary?.emailAddress || emailAddresses[0]?.emailAddress || '').trim() || null
}

function deriveStage(intentStatus: LeadgenIntentSnapshot['status'] | null, onboardingStatus: string | null): {
  stage: ClientStage
  stageLabel: string
} {
  if (onboardingStatus === 'completed' || intentStatus === 'onboarding_completed') {
    return { stage: 'active', stageLabel: 'Active' }
  }
  if (intentStatus === 'invited') return { stage: 'invited', stageLabel: 'Invited' }
  if (intentStatus === 'paid') return { stage: 'paid', stageLabel: 'Paid' }
  if (intentStatus === 'checkout_created') return { stage: 'checkout', stageLabel: 'Checkout Created' }
  if (onboardingStatus === 'submitted' || onboardingStatus === 'processed') {
    return { stage: 'onboarding', stageLabel: 'Onboarding Submitted' }
  }
  return { stage: 'setup', stageLabel: 'Setup Incomplete' }
}

function getStageSortWeight(stage: ClientStage): number {
  switch (stage) {
    case 'active':
      return 0
    case 'invited':
      return 1
    case 'paid':
      return 2
    case 'checkout':
      return 3
    case 'onboarding':
      return 4
    case 'setup':
      return 5
    default:
      return 6
  }
}

async function listAllClerkUsers(): Promise<ClerkUserLike[]> {
  try {
    const clerk = await clerkClient()
    const users: ClerkUserLike[] = []
    const limit = 100
    let offset = 0

    while (true) {
      const page = await clerk.users.getUserList({ limit, offset })
      const batch = (Array.isArray((page as { data?: unknown[] }).data)
        ? (page as { data: ClerkUserLike[] }).data
        : []) as ClerkUserLike[]

      users.push(...batch)
      if (batch.length < limit) break
      offset += limit
      if (offset > 5000) break
    }

    return users
  } catch (error) {
    console.warn('Internal clients dashboard: failed to list Clerk users.', error)
    return []
  }
}

async function listAllClerkInvitations(): Promise<ClerkInvitationLike[]> {
  try {
    const clerk = await clerkClient()
    const invitations: ClerkInvitationLike[] = []
    const limit = 100
    let offset = 0

    while (true) {
      const page = await clerk.invitations.getInvitationList({ limit, offset })
      const batch = (Array.isArray((page as { data?: unknown[] }).data)
        ? (page as { data: ClerkInvitationLike[] }).data
        : []) as ClerkInvitationLike[]

      invitations.push(...batch)
      if (batch.length < limit) break
      offset += limit
      if (offset > 5000) break
    }

    return invitations
  } catch (error) {
    console.warn('Internal clients dashboard: failed to list Clerk invitations.', error)
    return []
  }
}

export async function getInternalClientsDashboardData(): Promise<InternalClientsDashboardData> {
  const [organizations, intents, submissions, users, invitations, pendingZipRequests] = await Promise.all([
    listOrganizationsForOpsInConvex({ limit: 1000 }),
    listLeadgenIntentsForOpsInConvex({ limit: 1000 }),
    listOnboardingSubmissionsForOpsInConvex({ limit: 1000 }),
    listAllClerkUsers(),
    listAllClerkInvitations(),
    listPendingZipChangeRequestsForOpsInConvex(),
  ])

  const zipRequestByPortalKey = new Map<string, ZipChangeRequestSnapshot>()
  for (const req of pendingZipRequests) {
    zipRequestByPortalKey.set(req.portalKey, req)
  }

  const byPortalKey = new Map<string, ClientAccumulator>()

  const ensure = (portalKey: string): ClientAccumulator => {
    const existing = byPortalKey.get(portalKey)
    if (existing) return existing
    const created: ClientAccumulator = {
      portalKey,
      organization: null,
      intent: null,
      latestSubmission: null,
      clerkUsers: new Set<string>(),
      invitationEmails: new Set<string>(),
      pendingInvitationCount: 0,
      userLastUpdatedAt: null,
      invitationLastUpdatedAt: null,
    }
    byPortalKey.set(portalKey, created)
    return created
  }

  for (const organization of organizations) {
    if (!organization.portalKey) continue
    ensure(organization.portalKey).organization = organization
  }

  for (const intent of intents) {
    if (!intent.portalKey) continue
    ensure(intent.portalKey).intent = intent
  }

  for (const submission of submissions) {
    if (!submission.portalKey) continue
    const row = ensure(submission.portalKey)
    if (!row.latestSubmission || submission.createdAt > row.latestSubmission.createdAt) {
      row.latestSubmission = submission
    }
  }

  const emailToPortal = new Map<string, string>()
  for (const row of byPortalKey.values()) {
    const candidateEmails = [
      row.intent?.billingEmail,
      row.latestSubmission?.billingContactEmail,
      row.latestSubmission?.accountLoginEmail,
    ]
    for (const email of candidateEmails) {
      if (!email) continue
      const normalized = email.toLowerCase().trim()
      if (!normalized) continue
      if (!emailToPortal.has(normalized)) emailToPortal.set(normalized, row.portalKey)
    }
  }

  for (const user of users) {
    const email = getPrimaryEmail(user)
    const metadataPortal = getPortalKeyFromMetadata(user.publicMetadata)
    const fallbackPortal = email ? emailToPortal.get(email.toLowerCase()) || null : null
    const portalKey = metadataPortal || fallbackPortal
    if (!portalKey || !email) continue

    const row = ensure(portalKey)
    row.clerkUsers.add(email.toLowerCase())
    row.userLastUpdatedAt = Math.max(row.userLastUpdatedAt || 0, user.updatedAt || user.createdAt || 0)
  }

  for (const invitation of invitations) {
    const email = invitation.emailAddress?.toLowerCase().trim() || null
    const metadataPortal = getPortalKeyFromMetadata(invitation.publicMetadata)
    const fallbackPortal = email ? emailToPortal.get(email) || null : null
    const portalKey = metadataPortal || fallbackPortal
    if (!portalKey || !email) continue

    const row = ensure(portalKey)
    row.invitationEmails.add(email)
    if (invitation.status === 'pending') {
      row.pendingInvitationCount += 1
    }
    row.invitationLastUpdatedAt = Math.max(
      row.invitationLastUpdatedAt || 0,
      invitation.updatedAt || invitation.createdAt || 0
    )
  }

  const rows = Array.from(byPortalKey.values()).map<InternalClientRow>((row) => {
    const companyName =
      row.organization?.name ||
      row.intent?.companyName ||
      row.latestSubmission?.companyName ||
      null

    const billingEmail =
      row.intent?.billingEmail ||
      row.latestSubmission?.billingContactEmail ||
      row.latestSubmission?.accountLoginEmail ||
      Array.from(row.clerkUsers.values())[0] ||
      Array.from(row.invitationEmails.values())[0] ||
      null

    const billingModel =
      row.organization?.billingModel ||
      row.intent?.billingModel ||
      row.latestSubmission?.billingModel ||
      null

    const onboardingStatus = row.organization?.onboardingStatus || row.latestSubmission?.status || null
    const intentStatus = row.intent?.status || null
    const { stage, stageLabel } = deriveStage(intentStatus, onboardingStatus)

    const lastUpdatedAt = Math.max(
      row.organization?.updatedAt || 0,
      row.intent?.updatedAt || row.intent?.createdAt || 0,
      row.latestSubmission?.createdAt || 0,
      row.userLastUpdatedAt || 0,
      row.invitationLastUpdatedAt || 0
    )

    const onboardingToken = row.intent?.token?.trim()

    return {
      portalKey: row.portalKey,
      companyName,
      billingEmail,
      billingModel,
      stage,
      stageLabel,
      intentStatus,
      intentSource: row.intent?.source || null,
      onboardingStatus,
      organizationActive: typeof row.organization?.isActive === 'boolean' ? row.organization.isActive : null,
      prepaidLeadCredits:
        typeof row.organization?.prepaidLeadCredits === 'number' ? row.organization.prepaidLeadCredits : null,
      leadCommitmentTotal:
        typeof row.organization?.leadCommitmentTotal === 'number' ? row.organization.leadCommitmentTotal : null,
      leadUnitPriceCents:
        typeof row.organization?.leadUnitPriceCents === 'number' ? row.organization.leadUnitPriceCents : null,
      clerkUserCount: row.clerkUsers.size,
      pendingInvitationCount: row.pendingInvitationCount,
      clerkUsers: Array.from(row.clerkUsers.values()).sort(),
      invitationEmails: Array.from(row.invitationEmails.values()).sort(),
      lastUpdatedAt: Number.isFinite(lastUpdatedAt) && lastUpdatedAt > 0 ? lastUpdatedAt : null,
      onboardingLink: onboardingToken ? `/onboarding?token=${encodeURIComponent(onboardingToken)}` : null,
      pendingZipRequest: zipRequestByPortalKey.get(row.portalKey) || null,
    }
  })

  rows.sort((a, b) => {
    const stageDiff = getStageSortWeight(a.stage) - getStageSortWeight(b.stage)
    if (stageDiff !== 0) return stageDiff
    return (b.lastUpdatedAt || 0) - (a.lastUpdatedAt || 0)
  })

  const summary: InternalClientsSummary = {
    total: rows.length,
    active: rows.filter((row) => row.stage === 'active').length,
    invited: rows.filter((row) => row.stage === 'invited').length,
    paid: rows.filter((row) => row.stage === 'paid').length,
    checkout: rows.filter((row) => row.stage === 'checkout').length,
    onboarding: rows.filter((row) => row.stage === 'onboarding').length,
    pendingZipRequests: pendingZipRequests.length,
  }

  return { rows, summary }
}
