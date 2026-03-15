import crypto from 'crypto'
import { getBillingModelDefaults, normalizeBillingModel } from '@/lib/billing-models'
import {
  applyConfirmedPurchaseInConvex,
  createLeadgenIntentInConvex,
  findActiveLeadgenIntentInConvex,
  getLeadgenIntentByPortalKeyInConvex,
  getOrganizationSnapshotInConvex,
  markLeadgenPaidInConvex,
  queueLeadgenManualReviewInConvex,
  resolveClientIdentityByBillingInConvex,
} from '@/lib/convex'
import { syncAirtableBillingSnapshotFromConvex } from '@/lib/airtable-billing-sync'
import { resolveLeadgenClientDecision } from '@/lib/leadgen-repeat-purchase'
import { activateCustomer } from '@/lib/stripe-activation'

export type PaymentProvider = 'whop' | 'ignition' | 'manual'

export type LeadgenPaymentConfirmationRequest = {
  portalKey?: unknown
  companyName?: unknown
  billingEmail?: unknown
  billingName?: unknown
  billingModel?: unknown
  paymentProvider?: unknown
  paymentReference?: unknown
  source?: unknown
  utmSource?: unknown
  utmCampaign?: unknown
  utmMedium?: unknown
  utmContent?: unknown
  leadUnitPriceCents?: unknown
  prepaidLeadCredits?: unknown
  leadCommitmentTotal?: unknown
  initialChargeCents?: unknown
  forceResendInvitation?: unknown
}

export type LeadgenPaymentConfirmationSuccess = {
  success: true
  portalKey: string
  status: string
  tokenExpiresAt: number
  paymentProvider: PaymentProvider
  paymentReference: string | null
  onboardingUrl: string
  activation: Awaited<ReturnType<typeof activateCustomer>>
  purchaseRecorded: boolean
}

export type LeadgenPaymentConfirmationFailure = {
  success: false
  error: string
  manualReviewRequired?: boolean
  candidatePortalKeys?: string[]
}

export type LeadgenPaymentConfirmationResult = {
  status: number
  body: LeadgenPaymentConfirmationSuccess | LeadgenPaymentConfirmationFailure
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function normalizePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  const intVal = Math.floor(value)
  return intVal > 0 ? intVal : fallback
}

function normalizeOptionalPositiveInt(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const intVal = Math.floor(value)
  return intVal > 0 ? intVal : undefined
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function toPortalKeyBase(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function generatePortalKey(companyName: string, requestedPortalKey?: string | null): string {
  const requested = requestedPortalKey ? toPortalKeyBase(requestedPortalKey) : ''
  if (requested) return requested

  const base = toPortalKeyBase(companyName) || 'client'
  const suffix = crypto.randomBytes(3).toString('hex')
  return `${base}-${suffix}`
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

export function getPaymentProvider(value: unknown): PaymentProvider | null {
  const normalized = cleanString(value)?.toLowerCase()
  if (!normalized) return 'manual'
  if (normalized === 'whop' || normalized === 'ignition' || normalized === 'manual') return normalized
  return null
}

function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
}

function hashForLog(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12)
}

function redactEmailForLog(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null
  const atIndex = normalized.indexOf('@')
  if (atIndex <= 0) return `email:sha256:${hashForLog(normalized)}`
  return `email:${normalized.slice(atIndex + 1)}:sha256:${hashForLog(normalized)}`
}

function redactPortalKeyForLog(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const normalized = value.trim()
  if (!normalized) return null
  return `pk:sha256:${hashForLog(normalized)}`
}

function sanitizePaymentConfirmationLogDetails(details: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(details)) {
    const normalizedKey = key.toLowerCase()
    if (normalizedKey.includes('billingemail') || normalizedKey === 'email') {
      sanitized[key] = redactEmailForLog(value)
      continue
    }
    if (normalizedKey.includes('portalkey')) {
      sanitized[key] = Array.isArray(value) ? value.map((entry) => redactPortalKeyForLog(entry)) : redactPortalKeyForLog(value)
      continue
    }
    sanitized[key] = value
  }
  return sanitized
}

function logPaymentConfirmation(event: string, details: Record<string, unknown>) {
  console.info(`[leadgen-payment-confirmation] ${event}`, sanitizePaymentConfirmationLogDetails(details))
}

export async function confirmLeadgenPayment(
  body: LeadgenPaymentConfirmationRequest
): Promise<LeadgenPaymentConfirmationResult> {
  const companyName = cleanString(body.companyName)
  const billingEmailRaw = cleanString(body.billingEmail)
  const billingEmail = billingEmailRaw ? billingEmailRaw.toLowerCase() : null
  const billingName = cleanString(body.billingName) || undefined
  const billingModel = normalizeBillingModel(body.billingModel)
  const paymentProvider = getPaymentProvider(body.paymentProvider)
  const paymentReference = cleanString(body.paymentReference)
  const requestedPortalKey = cleanString(body.portalKey)
  const forceResendInvitation = body.forceResendInvitation === true
  const leadUnitPriceCentsInput = normalizePositiveInt(body.leadUnitPriceCents, 4000)
  const prepaidLeadCreditsOverride = normalizeOptionalPositiveInt(body.prepaidLeadCredits)
  const leadCommitmentTotalOverride = normalizeOptionalPositiveInt(body.leadCommitmentTotal)
  const initialChargeCentsOverride = normalizeOptionalPositiveInt(body.initialChargeCents)

  if (!companyName || !billingEmail) {
    return {
      status: 400,
      body: { success: false, error: 'companyName and billingEmail are required' },
    }
  }

  if (!isValidEmail(billingEmail)) {
    return {
      status: 400,
      body: { success: false, error: 'billingEmail must be a valid email address' },
    }
  }

  if (!paymentProvider) {
    return {
      status: 400,
      body: { success: false, error: 'paymentProvider must be one of: whop, ignition, manual' },
    }
  }

  if (!paymentReference) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'paymentReference is required so payment confirmations stay idempotent.',
      },
    }
  }

  const purchaseKey = `${paymentProvider}:${paymentReference}`
  const activeIntent = await findActiveLeadgenIntentInConvex({ billingEmail, companyName })
  const billingIdentity = await resolveClientIdentityByBillingInConvex({ billingEmail, companyName })
  if (!billingIdentity) {
    logPaymentConfirmation('billing_identity_resolution_unavailable', {
      paymentEventId: purchaseKey,
      requestedPortalKey,
      billingEmail,
      companyName,
    })
    return {
      status: 503,
      body: {
        success: false,
        error:
          'Unable to verify the existing client identity right now. Please retry or route this payment to manual review.',
      },
    }
  }

  const clientDecision = resolveLeadgenClientDecision({
    requestedPortalKey,
    activeIntentPortalKey: activeIntent?.portalKey || null,
    billingIdentity,
  })

  logPaymentConfirmation('received', {
    paymentEventId: purchaseKey,
    requestedPortalKey,
    billingEmail,
    companyName,
    activeIntentPortalKey: activeIntent?.portalKey || null,
    billingIdentityStatus: billingIdentity.status,
    billingIdentityPortalKeys: billingIdentity.portalKeys,
    clientDecision: clientDecision.kind,
  })

  if (clientDecision.kind === 'manual_review') {
    const manualReviewRecord = await queueLeadgenManualReviewInConvex({
      paymentEventId: purchaseKey,
      portalKey: requestedPortalKey || undefined,
      companyName,
      billingEmail,
      reason: clientDecision.reason,
      details: clientDecision.message,
      payloadJson: JSON.stringify({
        companyName,
        billingEmail,
        billingModel,
        paymentProvider,
        paymentReference,
        requestedPortalKey,
        billingIdentity,
      }),
    })
    if (!manualReviewRecord?.queued) {
      logPaymentConfirmation('manual_review_queue_failed', {
        paymentEventId: purchaseKey,
        reason: clientDecision.reason,
      })
      return {
        status: 500,
        body: { success: false, error: 'Failed to queue manual review. Please retry.' },
      }
    }

    logPaymentConfirmation('manual_review_required', {
      paymentEventId: purchaseKey,
      reason: clientDecision.reason,
      candidatePortalKeys: clientDecision.candidatePortalKeys,
    })

    return {
      status: 409,
      body: {
        success: false,
        error: clientDecision.message,
        manualReviewRequired: true,
        candidatePortalKeys: clientDecision.candidatePortalKeys,
      },
    }
  }

  const portalKey =
    clientDecision.kind === 'reuse_existing' ? clientDecision.portalKey : generatePortalKey(companyName)

  const portalIntent =
    activeIntent?.portalKey === portalKey ? activeIntent : await getLeadgenIntentByPortalKeyInConvex({ portalKey })
  const existingOrganization =
    clientDecision.kind === 'reuse_existing' && clientDecision.source === 'requested_portal_key'
      ? await getOrganizationSnapshotInConvex({ portalKey })
      : null

  if (
    clientDecision.kind === 'reuse_existing' &&
    clientDecision.source === 'requested_portal_key' &&
    !portalIntent &&
    !existingOrganization?.organization
  ) {
    const details = `The submitted portalKey=${portalKey} does not match any existing client record. Re-submit with the exact existing stable client identifier.`
    const manualReviewRecord = await queueLeadgenManualReviewInConvex({
      paymentEventId: purchaseKey,
      portalKey,
      companyName,
      billingEmail,
      reason: 'missing_stable_client_identifier',
      details,
      payloadJson: JSON.stringify({
        companyName,
        billingEmail,
        billingModel,
        paymentProvider,
        paymentReference,
        requestedPortalKey,
      }),
    })
    if (!manualReviewRecord?.queued) {
      logPaymentConfirmation('manual_review_queue_failed', {
        paymentEventId: purchaseKey,
        reason: 'missing_stable_client_identifier',
      })
      return {
        status: 500,
        body: { success: false, error: 'Failed to queue manual review. Please retry.' },
      }
    }

    logPaymentConfirmation('manual_review_required', {
      paymentEventId: purchaseKey,
      reason: 'missing_stable_client_identifier',
      portalKey,
    })

    return {
      status: 409,
      body: {
        success: false,
        error: details,
        manualReviewRequired: true,
        candidatePortalKeys: [],
      },
    }
  }

  const token = portalIntent?.token || generateToken()
  const tokenExpiresAt = portalIntent?.tokenExpiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000

  if (!portalIntent) {
    const created = await createLeadgenIntentInConvex({
      portalKey,
      companyName,
      billingEmail,
      billingName,
      billingModel,
      token,
      tokenExpiresAt,
      source: cleanString(body.source) || `external-payment-${paymentProvider}`,
      utmSource: cleanString(body.utmSource) || undefined,
      utmCampaign: cleanString(body.utmCampaign) || undefined,
      utmMedium: cleanString(body.utmMedium) || undefined,
      utmContent: cleanString(body.utmContent) || undefined,
    })

    if (!created) {
      return {
        status: 500,
        body: { success: false, error: 'Failed to create leadgen intent. Check Convex config.' },
      }
    }
  }

  const defaults = getBillingModelDefaults(billingModel, leadUnitPriceCentsInput)
  const customPackageRequested =
    prepaidLeadCreditsOverride !== undefined ||
    leadCommitmentTotalOverride !== undefined ||
    initialChargeCentsOverride !== undefined

  if (customPackageRequested && billingModel !== 'package_40_paid_in_full') {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Custom package terms are currently only supported for paid-in-full packages.',
      },
    }
  }

  let prepaidLeadCredits = defaults.prepaidLeadCredits
  let leadCommitmentTotal = defaults.leadCommitmentTotal || undefined
  let initialChargeCents = defaults.initialChargeCents
  let leadUnitPriceCents = defaults.leadUnitPriceCents

  if (customPackageRequested) {
    if (!prepaidLeadCreditsOverride || !initialChargeCentsOverride) {
      return {
        status: 400,
        body: { success: false, error: 'Custom package terms require included leads and amount collected.' },
      }
    }

    const resolvedCommitment = leadCommitmentTotalOverride ?? prepaidLeadCreditsOverride
    if (resolvedCommitment < prepaidLeadCreditsOverride) {
      return {
        status: 400,
        body: {
          success: false,
          error: 'Total package commitment must be greater than or equal to the included leads.',
        },
      }
    }

    prepaidLeadCredits = prepaidLeadCreditsOverride
    leadCommitmentTotal = resolvedCommitment
    initialChargeCents = initialChargeCentsOverride
    leadUnitPriceCents = Math.max(100, Math.round(initialChargeCentsOverride / prepaidLeadCreditsOverride))
  }

  const purchaseApplication = await applyConfirmedPurchaseInConvex({
    portalKey,
    purchaseKey,
    companyName,
    billingModel,
    prepaidLeadCredits,
    leadCommitmentTotal,
    initialChargeCents,
    leadChargeThreshold: defaults.leadChargeThreshold,
    leadUnitPriceCents,
    payloadJson: JSON.stringify({
      billingEmail,
      billingModel,
      companyName,
      initialChargeCents,
      paymentProvider,
      paymentReference,
      prepaidLeadCredits,
      leadCommitmentTotal,
      source: cleanString(body.source) || `external-payment-${paymentProvider}`,
    }),
  })
  if (!purchaseApplication) {
    return {
      status: 500,
      body: { success: false, error: 'Failed to apply purchase to organization. Check Convex config.' },
    }
  }

  const paidIntent = await markLeadgenPaidInConvex({
    portalKey,
  })
  if (!paidIntent) {
    return {
      status: 500,
      body: { success: false, error: 'Failed to mark leadgen intent as paid. Check Convex config.' },
    }
  }

  const activation = await activateCustomer({
    candidate: {
      source: paymentProvider,
      sourceId: purchaseKey,
      email: billingEmail,
      portalKey,
      companyName,
      billingModel,
      chargeKind: 'external_payment',
      journey: 'leadgen_payment_first',
    },
    forceResendInvitation,
  })

  logPaymentConfirmation('purchase_applied', {
    paymentEventId: purchaseKey,
    portalKey,
    existingClientFound: clientDecision.kind === 'reuse_existing',
    clientResolutionSource: clientDecision.kind === 'reuse_existing' ? clientDecision.source : 'new_client',
    organizationCreated: purchaseApplication.organizationCreated,
    purchaseRowCreated: !purchaseApplication.alreadyApplied,
    prepaidLeadCredits: purchaseApplication.prepaidLeadCredits,
    leadCommitmentTotal: purchaseApplication.leadCommitmentTotal,
  })

  const airtableBillingSync = await syncAirtableBillingSnapshotFromConvex({ portalKey })
  if (!airtableBillingSync.ok) {
    logPaymentConfirmation('airtable_sync_after_purchase_failed', {
      paymentEventId: purchaseKey,
      portalKey,
      status: airtableBillingSync.status,
      error: airtableBillingSync.error,
    })
  } else if (!airtableBillingSync.syncResult.synced && airtableBillingSync.syncResult.reason !== 'not_configured') {
    logPaymentConfirmation('airtable_sync_after_purchase_failed', {
      paymentEventId: purchaseKey,
      portalKey,
      reason: airtableBillingSync.syncResult.reason,
      error: airtableBillingSync.syncResult.message,
    })
  }

  const onboardingUrl = `${getAppBaseUrl()}/onboarding?token=${encodeURIComponent(token)}`

  return {
    status: 200,
    body: {
      success: true,
      portalKey,
      status: paidIntent.status,
      tokenExpiresAt,
      paymentProvider,
      paymentReference,
      onboardingUrl,
      activation,
      purchaseRecorded: !purchaseApplication.alreadyApplied,
    },
  }
}
