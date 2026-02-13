#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs'
import Stripe from 'stripe'
import { ConvexHttpClient } from 'convex/browser'

const DEFAULT_STRIPE_API_VERSION = '2024-10-28.acacia'

function loadEnvFile(path) {
  if (!existsSync(path)) return
  const envContent = readFileSync(path, 'utf-8')
  for (const rawLine of envContent.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function arg(flag, fallback = undefined) {
  const idx = process.argv.indexOf(flag)
  if (idx === -1) return fallback
  return process.argv[idx + 1] ?? fallback
}

function parseAmountCents() {
  const amountCentsArg = arg('--amount-cents')
  if (amountCentsArg) {
    const parsed = Number(amountCentsArg)
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed)
  }

  const amountArg = arg('--amount')
  if (!amountArg) return null
  const parsed = Number(amountArg)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return Math.round(parsed * 100)
}

function printUsageAndExit() {
  console.error(`
Usage:
  node scripts/stripe-send-invoice.mjs \\
    --customer-email billing@acme.com \\
    --amount 4200 \\
    --description "Lead generation services - February" \\
    [--customer-name "ACME Roofing"] \\
    [--days-until-due 7] \\
    [--portal-key acme-roofing]

Notes:
  - Use either --amount (USD dollars) or --amount-cents.
  - This script sends a Stripe-hosted invoice email to the customer.
  - Include --portal-key to trigger account activation after payment via /api/webhooks/stripe.
`)
  process.exit(1)
}

async function maybeRecordInvoiceInConvex({ portalKey, invoiceId, status, amountCents, invoiceUrl }) {
  if (!portalKey) return
  const convexUrl = process.env.CONVEX_URL
  const authSecret = process.env.CONVEX_AUTH_ADAPTER_SECRET
  if (!convexUrl || !authSecret) return

  try {
    const client = new ConvexHttpClient(convexUrl)
    await client.mutation('leadLedger:recordInvoiceEvent', {
      authSecret,
      portalKey,
      invoiceId,
      status,
      amountCents,
      invoiceUrl,
    })
  } catch (error) {
    console.warn('Could not record invoice event in Convex:', error?.message || error)
  }
}

async function run() {
  loadEnvFile('.env.local')

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    console.error('Missing STRIPE_SECRET_KEY')
    process.exit(1)
  }
  const stripeApiVersion = process.env.STRIPE_API_VERSION || DEFAULT_STRIPE_API_VERSION

  const customerEmail = arg('--customer-email')
  const customerName = arg('--customer-name')
  const description = arg('--description', 'Lead generation invoice')
  const daysUntilDue = Number(arg('--days-until-due', '7'))
  const portalKey = arg('--portal-key')
  const amountCents = parseAmountCents()

  if (!customerEmail || !amountCents || !description) {
    printUsageAndExit()
  }

  const stripe = new Stripe(stripeKey, { apiVersion: stripeApiVersion })

  const existingCustomers = await stripe.customers.list({
    email: customerEmail,
    limit: 1,
  })
  const customer =
    existingCustomers.data[0] ||
    (await stripe.customers.create({
      email: customerEmail,
      ...(customerName ? { name: customerName } : {}),
    }))

  await stripe.invoiceItems.create({
    customer: customer.id,
    amount: amountCents,
    currency: 'usd',
    description,
  })

  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: 'send_invoice',
    days_until_due: Number.isFinite(daysUntilDue) && daysUntilDue > 0 ? Math.floor(daysUntilDue) : 7,
    auto_advance: true,
    metadata: {
      ...(portalKey ? { portal_key: portalKey, obieo_activate: 'true' } : {}),
      ...(customerName ? { company_name: customerName } : {}),
    },
  })

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id)
  const sent = await stripe.invoices.sendInvoice(finalized.id)

  await maybeRecordInvoiceInConvex({
    portalKey,
    invoiceId: sent.id,
    status: sent.status || 'open',
    amountCents: sent.amount_due ?? amountCents,
    invoiceUrl: sent.hosted_invoice_url || undefined,
  })

  console.log('\nInvoice sent successfully')
  console.log(JSON.stringify({
    customerId: customer.id,
    invoiceId: sent.id,
    status: sent.status,
    amountDueCents: sent.amount_due,
    hostedInvoiceUrl: sent.hosted_invoice_url,
    invoicePdf: sent.invoice_pdf,
  }, null, 2))
}

run().catch((error) => {
  console.error('Failed to send invoice:', error)
  process.exit(1)
})
