export type BillingIdentityResolution =
  | { status: 'none'; portalKeys: string[] }
  | {
      status: 'unique'
      portalKey: string
      portalKeys: string[]
      latestIntentStatus: string | null
      latestIntentUpdatedAt: number | null
    }
  | { status: 'ambiguous'; portalKeys: string[] }

export type LeadgenClientDecision =
  | {
      kind: 'reuse_existing'
      portalKey: string
      source: 'requested_portal_key' | 'active_intent'
    }
  | {
      kind: 'create_new'
    }
  | {
      kind: 'manual_review'
      reason: 'requested_portal_key_mismatch' | 'ambiguous_billing_identity' | 'missing_stable_client_identifier'
      message: string
      candidatePortalKeys: string[]
    }

function cleanString(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function normalizePositiveInt(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const normalized = Math.floor(value)
  return normalized >= 0 ? normalized : null
}

export function resolveLeadgenClientDecision(input: {
  requestedPortalKey?: string | null
  activeIntentPortalKey?: string | null
  billingIdentity: BillingIdentityResolution
}): LeadgenClientDecision {
  const requestedPortalKey = cleanString(input.requestedPortalKey)
  const activeIntentPortalKey = cleanString(input.activeIntentPortalKey)

  if (
    requestedPortalKey &&
    input.billingIdentity.status === 'unique' &&
    input.billingIdentity.portalKey !== requestedPortalKey
  ) {
    return {
      kind: 'manual_review',
      reason: 'requested_portal_key_mismatch',
      message: `This billing profile is already tied to portalKey=${input.billingIdentity.portalKey}. Re-use that existing client instead of creating a new one.`,
      candidatePortalKeys: input.billingIdentity.portalKeys,
    }
  }

  if (
    requestedPortalKey &&
    input.billingIdentity.status === 'ambiguous' &&
    !input.billingIdentity.portalKeys.includes(requestedPortalKey)
  ) {
    return {
      kind: 'manual_review',
      reason: 'ambiguous_billing_identity',
      message:
        'Multiple existing clients match this billing email/company. Re-submit with the exact existing portalKey to confirm which client should receive the purchase.',
      candidatePortalKeys: input.billingIdentity.portalKeys,
    }
  }

  if (requestedPortalKey) {
    return {
      kind: 'reuse_existing',
      portalKey: requestedPortalKey,
      source: 'requested_portal_key',
    }
  }

  if (activeIntentPortalKey) {
    return {
      kind: 'reuse_existing',
      portalKey: activeIntentPortalKey,
      source: 'active_intent',
    }
  }

  if (input.billingIdentity.status === 'ambiguous') {
    return {
      kind: 'manual_review',
      reason: 'ambiguous_billing_identity',
      message:
        'Multiple existing clients match this billing email/company. Provide the exact existing portalKey so the re-up attaches to the right client.',
      candidatePortalKeys: input.billingIdentity.portalKeys,
    }
  }

  if (input.billingIdentity.status === 'unique') {
    return {
      kind: 'manual_review',
      reason: 'missing_stable_client_identifier',
      message: `This billing profile maps to existing portalKey=${input.billingIdentity.portalKey}. Re-submit with that exact portalKey so the re-up attaches to the correct existing client.`,
      candidatePortalKeys: input.billingIdentity.portalKeys,
    }
  }

  return { kind: 'create_new' }
}

export function rollForwardPurchaseTotals(input: {
  currentPrepaidLeadCredits?: number | null
  currentLeadCommitmentTotal?: number | null
  purchasePrepaidLeadCredits?: number | null
  purchaseLeadCommitmentTotal?: number | null
}) {
  const currentPrepaidLeadCredits = normalizePositiveInt(input.currentPrepaidLeadCredits) ?? 0
  const purchasePrepaidLeadCredits = normalizePositiveInt(input.purchasePrepaidLeadCredits) ?? 0
  const nextPrepaidLeadCredits = currentPrepaidLeadCredits + purchasePrepaidLeadCredits

  const currentLeadCommitmentTotal = normalizePositiveInt(input.currentLeadCommitmentTotal)
  const purchaseLeadCommitmentTotal = normalizePositiveInt(input.purchaseLeadCommitmentTotal)

  let nextLeadCommitmentTotal: number | null = null
  if (currentLeadCommitmentTotal === null && purchaseLeadCommitmentTotal === null) {
    nextLeadCommitmentTotal = null
  } else if (currentLeadCommitmentTotal === null) {
    nextLeadCommitmentTotal = purchaseLeadCommitmentTotal
  } else if (purchaseLeadCommitmentTotal === null) {
    nextLeadCommitmentTotal = currentLeadCommitmentTotal
  } else {
    nextLeadCommitmentTotal = currentLeadCommitmentTotal + purchaseLeadCommitmentTotal
  }

  return {
    currentPrepaidLeadCredits,
    currentLeadCommitmentTotal,
    purchasePrepaidLeadCredits,
    purchaseLeadCommitmentTotal,
    nextPrepaidLeadCredits,
    nextLeadCommitmentTotal,
  }
}
