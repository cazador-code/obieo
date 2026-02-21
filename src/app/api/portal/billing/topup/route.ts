import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getStripeClient } from '@/lib/stripe'
import { getOrganizationSnapshotInConvex, recordInvoiceEventInConvex } from '@/lib/convex'

export const runtime = 'nodejs'

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned ? cleaned : null
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const intVal = Math.floor(value)
    return intVal > 0 ? intVal : null
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return null
    const intVal = Math.floor(parsed)
    return intVal > 0 ? intVal : null
  }
  return null
}

function getPortalKeyFromUser(user: { publicMetadata?: Record<string, unknown> }): string | null {
  const meta = user.publicMetadata || {}
  const portalKey =
    normalizeString(meta.portalKey) ||
    normalizeString(meta.portal_key) ||
    normalizeString(meta.portal) ||
    null
  return portalKey
}

function isLeadgenStripeActive(): boolean {
  return process.env.LEADGEN_STRIPE_ACTIVE?.trim() === 'true'
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!isLeadgenStripeActive()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Self-serve Stripe top-ups are currently disabled. Please contact support to reorder lead packages.',
      },
      { status: 409 }
    )
  }

  const stripe = getStripeClient()
  if (!stripe) {
    return NextResponse.json(
      { success: false, error: 'STRIPE_SECRET_KEY is not configured' },
      { status: 500 }
    )
  }

  let leads: number | null = null
  try {
    const body = (await request.json()) as { leads?: unknown }
    leads = parsePositiveInt(body.leads)
  } catch {
    leads = null
  }

  if (!leads) {
    return NextResponse.json(
      { success: false, error: 'Invalid request. Provide { leads: <positive integer> }' },
      { status: 400 }
    )
  }

  // Guardrails: keep this sane for now.
  if (leads > 400) {
    return NextResponse.json(
      { success: false, error: 'Lead quantity too large. Please contact support.' },
      { status: 400 }
    )
  }

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const portalKey = getPortalKeyFromUser(user)
  if (!portalKey) {
    return NextResponse.json(
      { success: false, error: 'Portal is missing organization mapping. Please contact support.' },
      { status: 400 }
    )
  }

  const snapshot = await getOrganizationSnapshotInConvex({ portalKey })
  const organization = snapshot?.organization as Record<string, unknown> | undefined

  const stripeCustomerId = normalizeString(organization?.stripeCustomerId)
  if (!stripeCustomerId) {
    return NextResponse.json(
      { success: false, error: 'Billing is not configured for this account yet.' },
      { status: 400 }
    )
  }

  const unitPriceCentsRaw = organization?.leadUnitPriceCents
  const unitPriceCents =
    typeof unitPriceCentsRaw === 'number' && Number.isFinite(unitPriceCentsRaw) && unitPriceCentsRaw > 0
      ? Math.floor(unitPriceCentsRaw)
      : 4000

  const amountCents = unitPriceCents * leads
  const description = `Lead credits top-up: ${leads} leads @ $${(unitPriceCents / 100).toFixed(2)}/lead`

  // Create the invoice first, then attach the line item to this invoice.
  // This avoids accidentally bundling any other pending invoice items for the customer.
  const invoice = await stripe.invoices.create({
    customer: stripeCustomerId,
    collection_method: 'send_invoice',
    days_until_due: 7,
    auto_advance: false,
    metadata: {
      portal_key: portalKey,
      obieo_kind: 'lead_credit_topup',
      obieo_lead_credits: String(leads),
      lead_unit_price_cents: String(unitPriceCents),
      // Activation webhook listens for portal_key and invoice paid. Activation will be skipped if already invited.
      obieo_activate: 'true',
    },
  })

  await stripe.invoiceItems.create({
    customer: stripeCustomerId,
    invoice: invoice.id,
    amount: amountCents,
    currency: 'usd',
    description,
    metadata: {
      portal_key: portalKey,
      obieo_kind: 'lead_credit_topup',
      obieo_lead_credits: String(leads),
      lead_unit_price_cents: String(unitPriceCents),
    },
  })

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id)
  const sent = await stripe.invoices.sendInvoice(finalized.id)

  await recordInvoiceEventInConvex({
    portalKey,
    invoiceId: sent.id,
    status: sent.status || 'open',
    amountCents: sent.amount_due ?? amountCents,
    invoiceUrl: sent.hosted_invoice_url || undefined,
  })

  return NextResponse.json({
    success: true,
    portalKey,
    leads,
    unitPriceCents,
    amountCents,
    invoiceId: sent.id,
    hostedInvoiceUrl: sent.hosted_invoice_url,
    invoicePdf: sent.invoice_pdf,
    status: sent.status,
  })
}
