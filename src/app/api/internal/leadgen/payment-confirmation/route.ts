import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
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

export const runtime = 'nodejs'

type PaymentProvider = 'whop' | 'ignition' | 'manual'

type RequestBody = {
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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

function decodeBasicAuthHeader(value: string): { user: string; pass: string } | null {
  const [scheme, encoded] = value.split(' ')
  if (scheme !== 'Basic' || !encoded) return null
  let decoded = ''
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8')
  } catch {
    return null
  }
  const idx = decoded.indexOf(':')
  if (idx < 0) return null
  return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) }
}

function requireBasicAuthInProd(request: NextRequest): NextResponse | null {
  const isProd = process.env.VERCEL_ENV === 'production'
  if (!isProd) return null

  const expectedUser = process.env.INTERNAL_LEADGEN_BASIC_AUTH_USER || ''
  const expectedPass = process.env.INTERNAL_LEADGEN_BASIC_AUTH_PASS || ''
  if (!expectedUser || !expectedPass) {
    return NextResponse.json(
      { success: false, error: 'Internal leadgen auth is not configured.' },
      { status: 503 }
    )
  }

  const creds = decodeBasicAuthHeader(request.headers.get('authorization') || '')
  if (!creds) {
    return new NextResponse('Authorization required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Obieo Internal", charset="UTF-8"' },
    })
  }

  const ok = timingSafeEqual(creds.user, expectedUser) && timingSafeEqual(creds.pass, expectedPass)
  if (!ok) {
    return new NextResponse('Authorization required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Obieo Internal", charset="UTF-8"' },
    })
  }

  return null
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
  const suffix = crypto.randomBytes(3).toString('hex') // 6 chars
  return `${base}-${suffix}`
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

function getPaymentProvider(value: unknown): PaymentProvider | null {
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
      if (Array.isArray(value)) {
        sanitized[key] = value.map((entry) => redactPortalKeyForLog(entry))
      } else {
        sanitized[key] = redactPortalKeyForLog(value)
      }
      continue
    }
    sanitized[key] = value
  }
  return sanitized
}

function logPaymentConfirmation(event: string, details: Record<string, unknown>) {
  console.info(`[leadgen-payment-confirmation] ${event}`, sanitizePaymentConfirmationLogDetails(details))
}

export async function POST(request: NextRequest) {
  try {
    const authResponse = requireBasicAuthInProd(request)
    if (authResponse) return authResponse

    const ip = getClientIp(request)
    const { success, remaining } = await auditLimiter.limit(ip)
    if (!success) {
      return rateLimitResponse(remaining)
    }

    if (process.env.LEADGEN_PAYMENT_FIRST_ENABLED?.trim() !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Leadgen payment-first flow is disabled.' },
        { status: 403 }
      )
    }

    let body: RequestBody
    try {
      body = (await request.json()) as RequestBody
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

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
      return NextResponse.json(
        { success: false, error: 'companyName and billingEmail are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(billingEmail)) {
      return NextResponse.json({ success: false, error: 'billingEmail must be a valid email address' }, { status: 400 })
    }

    if (!paymentProvider) {
      return NextResponse.json(
        { success: false, error: 'paymentProvider must be one of: whop, ignition, manual' },
        { status: 400 }
      )
    }

    if (!paymentReference) {
      return NextResponse.json(
        {
          success: false,
          error: 'paymentReference is required so payment confirmations stay idempotent.',
        },
        { status: 400 }
      )
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
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to verify the existing client identity right now. Please retry or route this payment to manual review.',
        },
        { status: 503 }
      )
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
        return NextResponse.json(
          { success: false, error: 'Failed to queue manual review. Please retry.' },
          { status: 500 }
        )
      }

      logPaymentConfirmation('manual_review_required', {
        paymentEventId: purchaseKey,
        reason: clientDecision.reason,
        candidatePortalKeys: clientDecision.candidatePortalKeys,
      })

      return NextResponse.json(
        {
          success: false,
          error: clientDecision.message,
          manualReviewRequired: true,
          candidatePortalKeys: clientDecision.candidatePortalKeys,
        },
        { status: 409 }
      )
    }

    const portalKey =
      clientDecision.kind === 'reuse_existing'
        ? clientDecision.portalKey
        : generatePortalKey(companyName)

    const portalIntent =
      activeIntent?.portalKey === portalKey
        ? activeIntent
        : await getLeadgenIntentByPortalKeyInConvex({ portalKey })
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
        return NextResponse.json(
          { success: false, error: 'Failed to queue manual review. Please retry.' },
          { status: 500 }
        )
      }

      logPaymentConfirmation('manual_review_required', {
        paymentEventId: purchaseKey,
        reason: 'missing_stable_client_identifier',
        portalKey,
      })

      return NextResponse.json(
        {
          success: false,
          error: details,
          manualReviewRequired: true,
          candidatePortalKeys: [],
        },
        { status: 409 }
      )
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
        return NextResponse.json(
          { success: false, error: 'Failed to create leadgen intent. Check Convex config.' },
          { status: 500 }
        )
      }
    }

    const defaults = getBillingModelDefaults(billingModel, leadUnitPriceCentsInput)
    const customPackageRequested =
      prepaidLeadCreditsOverride !== undefined ||
      leadCommitmentTotalOverride !== undefined ||
      initialChargeCentsOverride !== undefined

    if (customPackageRequested && billingModel !== 'package_40_paid_in_full') {
      return NextResponse.json(
        { success: false, error: 'Custom package terms are currently only supported for paid-in-full packages.' },
        { status: 400 }
      )
    }

    let prepaidLeadCredits = defaults.prepaidLeadCredits
    let leadCommitmentTotal = defaults.leadCommitmentTotal || undefined
    let initialChargeCents = defaults.initialChargeCents
    let leadUnitPriceCents = defaults.leadUnitPriceCents

    if (customPackageRequested) {
      if (!prepaidLeadCreditsOverride || !initialChargeCentsOverride) {
        return NextResponse.json(
          { success: false, error: 'Custom package terms require included leads and amount collected.' },
          { status: 400 }
        )
      }

      const resolvedCommitment = leadCommitmentTotalOverride ?? prepaidLeadCreditsOverride
      if (resolvedCommitment < prepaidLeadCreditsOverride) {
        return NextResponse.json(
          { success: false, error: 'Total package commitment must be greater than or equal to the included leads.' },
          { status: 400 }
        )
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
      return NextResponse.json(
        { success: false, error: 'Failed to apply purchase to organization. Check Convex config.' },
        { status: 500 }
      )
    }

    const paidIntent = await markLeadgenPaidInConvex({
      portalKey,
    })
    if (!paidIntent) {
      return NextResponse.json(
        { success: false, error: 'Failed to mark leadgen intent as paid. Check Convex config.' },
        { status: 500 }
      )
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

    return NextResponse.json({
      success: true,
      portalKey,
      status: paidIntent.status,
      tokenExpiresAt,
      paymentProvider,
      paymentReference,
      onboardingUrl,
      activation,
      purchaseRecorded: !purchaseApplication.alreadyApplied,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Internal payment confirmation failed:', msg)
    return NextResponse.json({ success: false, error: `Server error: ${msg}` }, { status: 500 })
  }
}
