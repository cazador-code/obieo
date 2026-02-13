#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs'
import Stripe from 'stripe'

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

function formatMoney(cents, currency = 'usd') {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) return 'N/A'
  const dollars = (cents / 100).toFixed(2)
  return `${currency.toUpperCase()} $${dollars}`
}

function toIso(tsSeconds) {
  if (!tsSeconds) return ''
  return new Date(tsSeconds * 1000).toISOString().slice(0, 10)
}

function pickNewest(items) {
  return [...items].sort((a, b) => (b.created || 0) - (a.created || 0))[0] || null
}

function printSection(title) {
  console.log(`\n=== ${title} ===`)
}

async function run() {
  loadEnvFile('.env.local')

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    console.error('Missing STRIPE_SECRET_KEY (set it in .env.local or env)')
    process.exit(1)
  }

  const stripeApiVersion = process.env.STRIPE_API_VERSION || DEFAULT_STRIPE_API_VERSION
  const stripe = new Stripe(stripeKey, { apiVersion: stripeApiVersion })

  const products = await stripe.products.list({ active: true, limit: 100 })

  const relevantKinds = new Set([
    'delivered_leads',
    'lead_card_verification',
    'lead_package_10_upfront_commitment_40',
    'lead_package_40_paid_in_full',
  ])

  const productRows = []
  for (const p of products.data) {
    const kind = p.metadata?.obieo_kind || ''
    const prices = await stripe.prices.list({ product: p.id, active: true, limit: 100 })
    const hasPrices = prices.data.length > 0

    productRows.push({
      id: p.id,
      name: p.name,
      created: p.created,
      kind,
      activePriceCount: prices.data.length,
      prices: prices.data.map((price) => ({
        id: price.id,
        active: price.active,
        currency: price.currency,
        unit_amount: price.unit_amount,
        recurring: price.recurring
          ? {
              interval: price.recurring.interval,
              usage_type: price.recurring.usage_type,
            }
          : null,
        metadata_kind: price.metadata?.obieo_kind || '',
      })),
      hasPrices,
    })
  }

  // Candidates
  const deliveredProducts = productRows.filter(
    (p) => p.kind === 'delivered_leads' || p.name.toLowerCase() === 'delivered leads'
  )

  function findMetered40Price(product) {
    const prices = product.prices || []
    return (
      prices.find(
        (price) =>
          price.currency === 'usd' &&
          price.unit_amount === 4000 &&
          price.recurring &&
          price.recurring.interval === 'month' &&
          price.recurring.usage_type === 'metered'
      ) || null
    )
  }

  const deliveredWithMetered = deliveredProducts
    .map((p) => ({ product: p, metered40: findMetered40Price(p) }))
    .filter((row) => Boolean(row.metered40))

  const canonicalDelivered = pickNewest(deliveredWithMetered.map((row) => row.product))
  const canonicalDeliveredPrice = canonicalDelivered ? findMetered40Price(canonicalDelivered) : null

  const cardVerificationProducts = productRows.filter(
    (p) => p.kind === 'lead_card_verification' || p.name.toLowerCase() === 'card verification charge'
  )
  const upfront10Products = productRows.filter(
    (p) => p.kind === 'lead_package_10_upfront_commitment_40' || p.name.toLowerCase().includes('10 lead upfront bundle')
  )

  function findOneTimePrice(product, expectedCents) {
    return (
      (product.prices || []).find(
        (price) => price.currency === 'usd' && price.unit_amount === expectedCents && !price.recurring
      ) || null
    )
  }

  const canonicalCardVerificationProduct = pickNewest(
    cardVerificationProducts.filter((p) => Boolean(findOneTimePrice(p, 100)))
  )
  const canonicalCardVerificationPrice = canonicalCardVerificationProduct
    ? findOneTimePrice(canonicalCardVerificationProduct, 100)
    : null

  const canonicalUpfront10Product = pickNewest(
    upfront10Products.filter((p) => Boolean(findOneTimePrice(p, 40000)))
  )
  const canonicalUpfront10Price = canonicalUpfront10Product
    ? findOneTimePrice(canonicalUpfront10Product, 40000)
    : null

  // Duplicates report
  const kindCounts = {}
  for (const row of productRows) {
    if (!row.kind) continue
    kindCounts[row.kind] = (kindCounts[row.kind] || 0) + 1
  }

  const duplicatesByKind = Object.entries(kindCounts)
    .filter(([kind, count]) => relevantKinds.has(kind) && count > 1)
    .map(([kind, count]) => ({ kind, count }))

  const noPriceProducts = productRows.filter((p) => !p.hasPrices)

  const output = {
    stripeApiVersion,
    recommendedEnv: {
      STRIPE_DEFAULT_LEAD_PRODUCT_ID: canonicalDelivered?.id || null,
      STRIPE_DEFAULT_LEAD_PRICE_ID: canonicalDeliveredPrice?.id || null,
      STRIPE_CARD_VERIFICATION_PRICE_ID: canonicalCardVerificationPrice?.id || null,
      STRIPE_UPFRONT_BUNDLE_PRICE_ID: canonicalUpfront10Price?.id || null,
    },
    findings: {
      duplicatesByKind,
      noPriceProducts: noPriceProducts.map((p) => ({ id: p.id, name: p.name, kind: p.kind, created: p.created })),
    },
  }

  if (hasFlag('--json')) {
    console.log(JSON.stringify(output, null, 2))
    return
  }

  printSection('Recommended Vercel Env Pins')
  console.log(`STRIPE_DEFAULT_LEAD_PRODUCT_ID=${output.recommendedEnv.STRIPE_DEFAULT_LEAD_PRODUCT_ID || '<<MISSING>>'}`)
  console.log(`STRIPE_DEFAULT_LEAD_PRICE_ID=${output.recommendedEnv.STRIPE_DEFAULT_LEAD_PRICE_ID || '<<MISSING>>'}`)
  console.log(`STRIPE_CARD_VERIFICATION_PRICE_ID=${output.recommendedEnv.STRIPE_CARD_VERIFICATION_PRICE_ID || '<<MISSING>>'}`)
  console.log(`STRIPE_UPFRONT_BUNDLE_PRICE_ID=${output.recommendedEnv.STRIPE_UPFRONT_BUNDLE_PRICE_ID || '<<MISSING>>'}`)

  printSection('Canonical Products (Human)')
  if (canonicalDelivered && canonicalDeliveredPrice) {
    console.log(`Delivered Leads: ${canonicalDelivered.name} (${canonicalDelivered.id})`) 
    console.log(`  Metered price: ${canonicalDeliveredPrice.id} (${formatMoney(canonicalDeliveredPrice.unit_amount)} per lead, monthly metered)`) 
  } else {
    console.log('Delivered Leads: <<Could not find a product+metered $40 price match>>')
  }

  if (canonicalCardVerificationProduct && canonicalCardVerificationPrice) {
    console.log(`Card Verification: ${canonicalCardVerificationProduct.name} (${canonicalCardVerificationProduct.id})`) 
    console.log(`  One-time price: ${canonicalCardVerificationPrice.id} (${formatMoney(canonicalCardVerificationPrice.unit_amount)})`) 
  } else {
    console.log('Card Verification: <<Could not find a $1 one-time price match>>')
  }

  if (canonicalUpfront10Product && canonicalUpfront10Price) {
    console.log(`Upfront Bundle: ${canonicalUpfront10Product.name} (${canonicalUpfront10Product.id})`) 
    console.log(`  One-time price: ${canonicalUpfront10Price.id} (${formatMoney(canonicalUpfront10Price.unit_amount)})`) 
  } else {
    console.log('Upfront Bundle: <<Could not find a $400 one-time price match>>')
  }

  if (duplicatesByKind.length) {
    printSection('Duplicates (by metadata.obieo_kind)')
    for (const d of duplicatesByKind) {
      console.log(`${d.kind}: ${d.count}`)
    }
  }

  if (noPriceProducts.length) {
    printSection('Active Products With No Active Prices (safe archive candidates)')
    for (const p of noPriceProducts.slice(0, 50)) {
      const kind = p.kind ? ` kind=${p.kind}` : ''
      console.log(`${p.id}  ${toIso(p.created)}  ${p.name}${kind}`)
    }
    if (noPriceProducts.length > 50) {
      console.log(`...and ${noPriceProducts.length - 50} more`) 
    }
  }

  printSection('Next Step')
  console.log('1) Add the recommended env vars to Vercel Production (pins canonical IDs; prevents future duplicates).')
  console.log('2) Archive any "No prices" duplicates you don\'t need in Stripe Dashboard.')
}

run().catch((error) => {
  console.error('Audit failed:', error)
  process.exit(1)
})
