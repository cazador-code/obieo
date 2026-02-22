#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs'

const BILLING_MODELS = new Set([
  'package_40_paid_in_full',
  'commitment_40_with_10_upfront',
  'pay_per_lead_perpetual',
  'pay_per_lead_40_first_lead',
])

const PAYMENT_PROVIDERS = new Set(['whop', 'ignition', 'manual'])

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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function normalizeBaseUrl(value) {
  const trimmed = cleanString(value)
  if (!trimmed) return null
  return trimmed.replace(/\/+$/, '')
}

function printUsageAndExit() {
  console.error(`
Usage:
  node scripts/leadgen-initiate-paid-client.mjs \\
    --company-name "Chris Cohen LT" \\
    --billing-email "spike8080@gmail.com" \\
    [--billing-name "Chris Cohen"] \\
    [--payment-provider ignition|whop|manual] \\
    [--billing-model package_40_paid_in_full|commitment_40_with_10_upfront|pay_per_lead_40_first_lead|pay_per_lead_perpetual] \\
    [--payment-reference "invoice_123"] \\
    [--source "codex-manual-trigger"] \\
    [--force-resend] \\
    [--base-url "https://obieo.com"] \\
    [--auth-user "<internal-user>" --auth-pass "<internal-pass>"]

Notes:
  - This triggers the same initiation flow as the internal "Payment Confirmation & Onboarding Invite" UI.
  - Defaults payment provider to "manual".
  - If --auth-user/--auth-pass are omitted, env vars INTERNAL_LEADGEN_BASIC_AUTH_USER/PASS are used when available.
`)
  process.exit(1)
}

async function parseResponseJson(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

async function run() {
  loadEnvFile('.env.local')

  if (hasFlag('--help') || hasFlag('-h')) {
    printUsageAndExit()
  }

  const companyName = cleanString(arg('--company-name'))
  const billingEmail = cleanString(arg('--billing-email'))?.toLowerCase() || null
  const billingName = cleanString(arg('--billing-name')) || undefined
  const paymentProvider = cleanString(arg('--payment-provider', 'manual')) || 'manual'
  const billingModel = cleanString(arg('--billing-model')) || undefined
  const paymentReference = cleanString(arg('--payment-reference')) || undefined
  const source = cleanString(arg('--source', 'codex-manual-trigger')) || 'codex-manual-trigger'
  const forceResendInvitation = hasFlag('--force-resend')

  const baseUrl =
    normalizeBaseUrl(arg('--base-url')) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    'http://localhost:3000'

  const authUser = cleanString(arg('--auth-user', process.env.INTERNAL_LEADGEN_BASIC_AUTH_USER || ''))
  const authPass = cleanString(arg('--auth-pass', process.env.INTERNAL_LEADGEN_BASIC_AUTH_PASS || ''))

  if (!companyName || !billingEmail) {
    console.error('Missing required args: --company-name and --billing-email')
    printUsageAndExit()
  }
  if (!isValidEmail(billingEmail)) {
    console.error(`Invalid billing email: ${billingEmail}`)
    process.exit(1)
  }
  if (!PAYMENT_PROVIDERS.has(paymentProvider)) {
    console.error(`Invalid --payment-provider "${paymentProvider}". Allowed: whop, ignition, manual`)
    process.exit(1)
  }
  if (billingModel && !BILLING_MODELS.has(billingModel)) {
    console.error(
      `Invalid --billing-model "${billingModel}". Allowed: ${Array.from(BILLING_MODELS).join(', ')}`
    )
    process.exit(1)
  }
  if ((authUser && !authPass) || (!authUser && authPass)) {
    console.error('Provide both --auth-user and --auth-pass (or neither).')
    process.exit(1)
  }

  const endpoint = `${baseUrl}/api/internal/leadgen/payment-confirmation`
  const headers = { 'content-type': 'application/json' }
  if (authUser && authPass) {
    const encoded = Buffer.from(`${authUser}:${authPass}`, 'utf8').toString('base64')
    headers.authorization = `Basic ${encoded}`
  }

  const payload = {
    companyName,
    billingEmail,
    billingName,
    paymentProvider,
    billingModel,
    paymentReference,
    source,
    forceResendInvitation,
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  const data = await parseResponseJson(response)

  if (!response.ok || !data?.success) {
    console.error('Initiation failed')
    console.error(
      JSON.stringify(
        {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          response: data,
        },
        null,
        2
      )
    )
    process.exit(1)
  }

  console.log('Initiation succeeded')
  console.log(
    JSON.stringify(
      {
        endpoint,
        portalKey: data.portalKey,
        status: data.status,
        paymentProvider: data.paymentProvider,
        paymentReference: data.paymentReference,
        tokenExpiresAt: data.tokenExpiresAt,
        onboardingUrl: data.onboardingUrl,
        activation: data.activation,
      },
      null,
      2
    )
  )
}

run().catch((error) => {
  console.error('Leadgen initiation failed:', error instanceof Error ? error.message : String(error))
  process.exit(1)
})
