#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api.js'

const BILLING_MODELS = new Set([
  'package_40_paid_in_full',
  'commitment_40_with_10_upfront',
  'pay_per_lead_perpetual',
  'pay_per_lead_40_first_lead',
])

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

function hasFlag(flag) {
  return process.argv.includes(flag)
}

function cleanString(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function normalizePositiveInt(value, fallback) {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return fallback
  const normalized = Math.floor(parsed)
  return normalized > 0 ? normalized : fallback
}

function getBillingDefaults(model, leadUnitPriceCents) {
  const unit = normalizePositiveInt(leadUnitPriceCents, 4000)

  if (model === 'package_40_paid_in_full') {
    return {
      prepaidLeadCredits: 40,
      leadCommitmentTotal: 40,
      initialChargeCents: unit * 40,
      leadChargeThreshold: 10,
      leadUnitPriceCents: unit,
    }
  }

  if (model === 'commitment_40_with_10_upfront') {
    return {
      prepaidLeadCredits: 10,
      leadCommitmentTotal: 40,
      initialChargeCents: unit * 10,
      leadChargeThreshold: 10,
      leadUnitPriceCents: unit,
    }
  }

  if (model === 'pay_per_lead_perpetual') {
    return {
      prepaidLeadCredits: 0,
      leadCommitmentTotal: null,
      initialChargeCents: 100,
      leadChargeThreshold: 1,
      leadUnitPriceCents: unit,
    }
  }

  return {
    prepaidLeadCredits: 1,
    leadCommitmentTotal: null,
    initialChargeCents: unit,
    leadChargeThreshold: 1,
    leadUnitPriceCents: unit,
  }
}

function requireEnv(name) {
  const value = cleanString(process.env[name])
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function printUsageAndExit() {
  console.error(`
Usage:
  node scripts/record-convex-package-purchase.mjs \\
    --portal-key "oz-home-services-d4f6e8" \\
    --company-name "Oz Home Services" \\
    --purchase-key "manual:oz-second-40-2026-03-14" \\
    [--billing-model package_40_paid_in_full] \\
    [--prepaid-lead-credits 40] \\
    [--lead-commitment-total 40] \\
    [--initial-charge-cents 160000] \\
    [--lead-charge-threshold 10] \\
    [--lead-unit-price-cents 4000]
`)
  process.exit(1)
}

async function run() {
  loadEnvFile('.env.local')

  if (hasFlag('--help') || hasFlag('-h')) {
    printUsageAndExit()
  }

  const portalKey = cleanString(arg('--portal-key'))
  const companyName = cleanString(arg('--company-name')) || undefined
  const purchaseKey = cleanString(arg('--purchase-key'))
  const billingModel = cleanString(arg('--billing-model', 'package_40_paid_in_full')) || 'package_40_paid_in_full'

  if (!portalKey || !purchaseKey) {
    printUsageAndExit()
  }
  if (!BILLING_MODELS.has(billingModel)) {
    throw new Error(`Invalid billing model: ${billingModel}`)
  }

  const defaults = getBillingDefaults(billingModel, arg('--lead-unit-price-cents', 4000))
  const prepaidLeadCredits = normalizePositiveInt(arg('--prepaid-lead-credits'), defaults.prepaidLeadCredits)
  const leadCommitmentTotal =
    defaults.leadCommitmentTotal === null
      ? null
      : normalizePositiveInt(arg('--lead-commitment-total'), defaults.leadCommitmentTotal)
  const initialChargeCents = normalizePositiveInt(arg('--initial-charge-cents'), defaults.initialChargeCents)
  const leadChargeThreshold = normalizePositiveInt(arg('--lead-charge-threshold'), defaults.leadChargeThreshold)
  const leadUnitPriceCents = normalizePositiveInt(arg('--lead-unit-price-cents'), defaults.leadUnitPriceCents)

  const client = new ConvexHttpClient(requireEnv('CONVEX_URL'))
  const authSecret = requireEnv('CONVEX_AUTH_ADAPTER_SECRET')

  const purchase = await client.mutation(api.leadLedger.applyConfirmedPurchase, {
    authSecret,
    portalKey,
    purchaseKey,
    companyName,
    billingModel,
    prepaidLeadCredits,
    ...(leadCommitmentTotal !== null ? { leadCommitmentTotal } : {}),
    initialChargeCents,
    leadChargeThreshold,
    leadUnitPriceCents,
    payloadJson: JSON.stringify({
      source: 'codex_manual_reconciliation',
      purchaseKey,
      billingModel,
      prepaidLeadCredits,
      leadCommitmentTotal,
      initialChargeCents,
      leadChargeThreshold,
      leadUnitPriceCents,
    }),
  })

  const snapshot = await client.query(api.leadLedger.getOrganizationSnapshot, {
    authSecret,
    portalKey,
  })

  console.log(
    JSON.stringify(
      {
        purchase,
        snapshot: snapshot
          ? {
              organization: {
                portalKey: snapshot.organization?.portalKey,
                name: snapshot.organization?.name,
                billingModel: snapshot.organization?.billingModel,
                prepaidLeadCredits: snapshot.organization?.prepaidLeadCredits,
                leadCommitmentTotal: snapshot.organization?.leadCommitmentTotal,
                leadUnitPriceCents: snapshot.organization?.leadUnitPriceCents,
              },
              leadCounts: snapshot.leadCounts,
              billingEventCount: Array.isArray(snapshot.billingEvents) ? snapshot.billingEvents.length : 0,
            }
          : null,
      },
      null,
      2
    )
  )
}

run().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error))
  process.exit(1)
})
