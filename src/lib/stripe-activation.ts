import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'
import { Resend } from 'resend'
import { getLeadgenIntentByPortalKeyInConvex, markLeadgenInvitedInConvex } from '@/lib/convex'

const ACTIVATION_CHARGE_KINDS = new Set([
  'paid_in_full',
  'upfront_bundle',
  'card_verification',
  'first_lead',
])

export interface ActivationCandidate {
  source: 'checkout' | 'invoice'
  sourceId: string
  customerId?: string
  email?: string
  portalKey?: string
  companyName?: string
  billingModel?: string
  chargeKind?: string
  journey?: string
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const cleaned = value.trim()
  return cleaned || undefined
}

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    'http://localhost:3000'
  )
}

export function getPortalLoginUrl(): string {
  return process.env.CLIENT_PORTAL_LOGIN_URL?.trim() || `${getAppBaseUrl()}/sign-in`
}

export function getInvitationRedirectUrl(): string {
  return process.env.CLERK_INVITATION_REDIRECT_URL?.trim() || `${getAppBaseUrl()}/portal`
}

function getOpsRecipients(): string[] {
  const raw =
    process.env.ONBOARDING_NOTIFICATION_EMAILS ||
    process.env.LEAD_OPS_NOTIFICATION_EMAILS ||
    process.env.NOTIFICATION_EMAIL ||
    ''

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function getActivationCandidateFromCheckout(
  session: Stripe.Checkout.Session
): ActivationCandidate | null {
  if (session.payment_status !== 'paid') {
    return null
  }

  const chargeKind = normalizeString(session.metadata?.obieo_kind)
  if (!chargeKind || !ACTIVATION_CHARGE_KINDS.has(chargeKind)) {
    return null
  }

  return {
    source: 'checkout',
    sourceId: session.id,
    customerId: typeof session.customer === 'string' ? session.customer : undefined,
    email: normalizeString(session.customer_details?.email) || normalizeString(session.customer_email),
    portalKey: normalizeString(session.metadata?.portal_key),
    companyName: normalizeString(session.metadata?.company_name),
    billingModel: normalizeString(session.metadata?.billing_model),
    chargeKind,
    journey: normalizeString(session.metadata?.obieo_journey),
  }
}

export function getActivationCandidateFromInvoice(invoice: Stripe.Invoice): ActivationCandidate | null {
  if (invoice.status !== 'paid') {
    return null
  }

  const portalKey = normalizeString(invoice.metadata?.portal_key)
  const explicitActivationFlag = normalizeString(invoice.metadata?.obieo_activate)
  if (!portalKey && explicitActivationFlag !== 'true') {
    return null
  }

  return {
    source: 'invoice',
    sourceId: invoice.id,
    customerId: typeof invoice.customer === 'string' ? invoice.customer : undefined,
    email: normalizeString(invoice.customer_email),
    portalKey,
    companyName: normalizeString(invoice.metadata?.company_name),
    billingModel: normalizeString(invoice.metadata?.billing_model),
    journey: normalizeString(invoice.metadata?.obieo_journey),
  }
}

async function getCustomer(stripe: Stripe, customerId?: string): Promise<Stripe.Customer | null> {
  if (!customerId) return null
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) return null
    return customer
  } catch (error) {
    console.error('Failed to retrieve Stripe customer for activation:', error)
    return null
  }
}

async function sendOpsActivationNotice(input: {
  email: string
  portalKey?: string
  companyName?: string
  source: 'checkout' | 'invoice'
  sourceId: string
  billingModel?: string
  chargeKind?: string
  loginUrl: string
  invitationId?: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const recipients = getOpsRecipients()
  if (!apiKey || recipients.length === 0) return

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@obieo.com',
    to: recipients,
    subject: `Customer activation triggered: ${input.companyName || input.email}`,
    html: `
      <h2>Customer Activation Triggered</h2>
      <p><strong>Email:</strong> ${input.email}</p>
      <p><strong>Company:</strong> ${input.companyName || 'N/A'}</p>
      <p><strong>Portal Key:</strong> ${input.portalKey || 'N/A'}</p>
      <p><strong>Source:</strong> ${input.source}</p>
      <p><strong>Source ID:</strong> ${input.sourceId}</p>
      <p><strong>Billing Model:</strong> ${input.billingModel || 'N/A'}</p>
      <p><strong>Charge Kind:</strong> ${input.chargeKind || 'N/A'}</p>
      <p><strong>Login URL:</strong> <a href="${input.loginUrl}">${input.loginUrl}</a></p>
      <p><strong>Clerk Invitation ID:</strong> ${input.invitationId || 'N/A'}</p>
    `,
  })
}

async function sendCustomerPaymentNotice(input: {
  email: string
  companyName?: string
  loginUrl: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@obieo.com',
    to: [input.email],
    subject: 'Payment received - your Obieo portal access is ready',
    html: `
      <p>Hi ${input.companyName || 'there'},</p>
      <p>We received your payment and have prepared your account.</p>
      <p>Please look for a separate account invitation email from Clerk to finish setup and create your password.</p>
      <p>After setup, you can log in here:</p>
      <p><a href="${input.loginUrl}">${input.loginUrl}</a></p>
      <p>If you don't see the invitation within a few minutes, reply to this email and we will resend it.</p>
    `,
  })
}

export async function activateCustomer(input: {
  stripe: Stripe
  candidate: ActivationCandidate
  forceResendInvitation?: boolean
}): Promise<{
  status: 'activated' | 'skipped'
  reason?: string
  email?: string
  portalKey?: string
  companyName?: string
  invitationId?: string
  loginUrl: string
}> {
  const customer = await getCustomer(input.stripe, input.candidate.customerId)

  const email =
    input.candidate.email ||
    normalizeString(customer?.email) ||
    normalizeString(customer?.metadata?.account_login_email)
  if (!email) {
    return {
      status: 'skipped',
      reason: 'No customer email available',
      loginUrl: getPortalLoginUrl(),
    }
  }

  const portalKey =
    input.candidate.portalKey ||
    normalizeString(customer?.metadata?.portal_key)
  const companyName =
    input.candidate.companyName ||
    normalizeString(customer?.metadata?.company_name)

  const alreadyInvitedAt = normalizeString(customer?.metadata?.obieo_activation_invite_sent_at)
  if (alreadyInvitedAt && !input.forceResendInvitation) {
    return {
      status: 'skipped',
      reason: 'Activation invite already sent',
      email,
      portalKey,
      companyName,
      loginUrl: getPortalLoginUrl(),
    }
  }

  if (!process.env.CLERK_SECRET_KEY?.trim()) {
    throw new Error('CLERK_SECRET_KEY is not configured')
  }

  const clerk = await clerkClient()

  // If we're explicitly resending, revoke the previous invitation (if we have it)
  // so Clerk will send a fresh invite email. This is intentionally only used by
  // explicit manual actions (e.g. the checkout success "resend" button).
  if (alreadyInvitedAt && input.forceResendInvitation && customer) {
    const priorInvitationId = normalizeString(customer.metadata?.obieo_activation_invitation_id)
    if (priorInvitationId) {
      try {
        await clerk.invitations.revokeInvitation(priorInvitationId)
      } catch (error) {
        console.warn('Failed to revoke prior Clerk invitation (continuing):', error)
      }
    }
  }

  // For payment-first leadgen, redirect invite to the onboarding form instead of the portal.
  let redirectUrl = getInvitationRedirectUrl()
  if (input.candidate.journey === 'leadgen_payment_first' && portalKey) {
    const intent = await getLeadgenIntentByPortalKeyInConvex({ portalKey })
    if (intent?.token) {
      redirectUrl = `${getAppBaseUrl()}/leadgen/onboarding?token=${encodeURIComponent(intent.token)}`
    }
  }

  const invitation = await clerk.invitations.createInvitation({
    emailAddress: email,
    ignoreExisting: true,
    notify: true,
    redirectUrl,
    publicMetadata: {
      portalKey: portalKey || null,
      companyName: companyName || null,
      source: input.candidate.source,
      sourceId: input.candidate.sourceId,
      billingModel: input.candidate.billingModel || null,
      chargeKind: input.candidate.chargeKind || null,
    },
  })

  if (input.candidate.journey === 'leadgen_payment_first' && portalKey) {
    await markLeadgenInvitedInConvex({ portalKey })
  }

  if (customer) {
    await input.stripe.customers.update(customer.id, {
      metadata: {
        ...(customer.metadata || {}),
        ...(portalKey ? { portal_key: portalKey } : {}),
        ...(companyName ? { company_name: companyName } : {}),
        obieo_activation_invite_sent_at: new Date().toISOString(),
        obieo_activation_invite_email: email,
        obieo_activation_invitation_id: invitation.id,
      },
    })
  }

  const loginUrl = getPortalLoginUrl()

  try {
    await sendCustomerPaymentNotice({
      email,
      companyName,
      loginUrl,
    })
  } catch (error) {
    console.error('Failed to send customer payment notice:', error)
  }

  try {
    await sendOpsActivationNotice({
      email,
      portalKey,
      companyName,
      source: input.candidate.source,
      sourceId: input.candidate.sourceId,
      billingModel: input.candidate.billingModel,
      chargeKind: input.candidate.chargeKind,
      loginUrl,
      invitationId: invitation.id,
    })
  } catch (error) {
    console.error('Failed to send ops activation notice:', error)
  }

  return {
    status: 'activated',
    email,
    portalKey,
    companyName,
    invitationId: invitation.id,
    loginUrl,
  }
}
