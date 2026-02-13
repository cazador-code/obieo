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

function parseCsv(value) {
  if (!value) return undefined
  const items = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length > 0 ? items : undefined
}

function printUsageAndExit() {
  console.error(`
Usage:
  node scripts/stripe-upsert-org-subscription.mjs \\
    --company-id 2 \\
    --portal-key acme-roofing \\
    --email billing@acme.com \\
    --price-id price_123 \\
    [--name "ACME Roofing"] \\
    [--service-areas "Winter Haven,Lakeland"] \\
    [--lead-phones "8103204787,8104797789"] \\
    [--lead-emails "ops@acme.com,billing@acme.com"] \\
    [--threshold 10] \\
    [--unit-price-cents 4500]

What it does:
  1) Finds or creates Stripe customer.
  2) Creates metered subscription with usage threshold (usage_gte).
  3) Upserts org mapping in Convex (portalKey -> stripe IDs).
`)
  process.exit(1)
}

async function run() {
  loadEnvFile('.env.local')

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    console.error('Missing STRIPE_SECRET_KEY')
    process.exit(1)
  }
  const stripeApiVersion = process.env.STRIPE_API_VERSION || DEFAULT_STRIPE_API_VERSION

  const companyId = arg('--company-id')
  const portalKey = arg('--portal-key')
  const email = arg('--email')
  const name = arg('--name')
  const serviceAreas = parseCsv(arg('--service-areas'))
  const leadPhones = parseCsv(arg('--lead-phones'))
  const leadEmails = parseCsv(arg('--lead-emails'))
  const priceId = arg('--price-id')
  const threshold = Number(arg('--threshold', '10'))
  const unitPriceCentsArg = arg('--unit-price-cents')
  const unitPriceCents = unitPriceCentsArg ? Number(unitPriceCentsArg) : undefined

  if (!portalKey || !email || !priceId) {
    printUsageAndExit()
  }
  if (!Number.isFinite(threshold) || threshold < 1) {
    console.error('--threshold must be a positive integer')
    process.exit(1)
  }

  const stripe = new Stripe(stripeKey, { apiVersion: stripeApiVersion })

  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })
  const customer =
    existingCustomers.data[0] ||
    (await stripe.customers.create({
      email,
      ...(name ? { name } : {}),
      metadata: { portal_key: portalKey },
    }))

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    collection_method: 'charge_automatically',
    items: [
      {
        price: priceId,
        billing_thresholds: {
          usage_gte: Math.floor(threshold),
        },
      },
    ],
    metadata: {
      portal_key: portalKey,
    },
  })

  const subscriptionItemId = subscription.items.data[0]?.id
  if (!subscriptionItemId) {
    throw new Error('Stripe did not return a subscription item id')
  }

  const convexUrl = process.env.CONVEX_URL
  const authSecret = process.env.CONVEX_AUTH_ADAPTER_SECRET
  let convexResult = null

  if (convexUrl && authSecret) {
    const client = new ConvexHttpClient(convexUrl)
    convexResult = await client.mutation('leadLedger:upsertOrganization', {
      authSecret,
      companyId,
      portalKey,
      name,
      serviceAreas,
      leadDeliveryPhones: leadPhones,
      leadDeliveryEmails: leadEmails,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionItemId: subscriptionItemId,
      leadChargeThreshold: Math.floor(threshold),
      ...(Number.isFinite(unitPriceCents) ? { leadUnitPriceCents: Math.floor(unitPriceCents) } : {}),
      isActive: true,
    })
  } else {
    console.warn('Skipping Convex upsert (missing CONVEX_URL or CONVEX_AUTH_ADAPTER_SECRET)')
  }

  console.log('\nSubscription + org setup complete')
  console.log(JSON.stringify({
    portalKey,
    stripeCustomerId: customer.id,
    stripeSubscriptionId: subscription.id,
    stripeSubscriptionItemId: subscriptionItemId,
    usageThresholdLeads: Math.floor(threshold),
    convexResult,
  }, null, 2))
}

run().catch((error) => {
  console.error('Setup failed:', error)
  process.exit(1)
})
