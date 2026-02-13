import Stripe from 'stripe'
import { getStripeClient } from '@/lib/stripe'
import {
  BillingModel,
  getBillingModelDefaults,
} from '@/lib/billing-models'

const DEFAULT_CURRENCY = 'usd'

export interface LeadBillingProvisionInput {
  portalKey: string
  companyName: string
  billingEmail: string
  billingName?: string
  leadUnitPriceCents: number
  leadChargeThreshold: number
  billingModel: BillingModel
}

export interface LeadBillingProvisionResult {
  billingModel: BillingModel
  stripeCustomerId: string
  stripeProductId?: string
  stripePriceId?: string
  stripeSubscriptionId?: string
  stripeSubscriptionItemId?: string
  reusedSubscription?: boolean
  initialCheckoutUrl?: string
  initialCheckoutSessionId?: string
  initialCheckoutAmountCents?: number
}

function normalizePositiveInt(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  const intVal = Math.floor(value)
  return intVal > 0 ? intVal : fallback
}

function getCheckoutUrls() {
  const baseUrl =
    process.env.STRIPE_ONBOARDING_RETURN_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    'http://localhost:3000'

  return {
    successUrl:
      process.env.STRIPE_ONBOARDING_SUCCESS_URL?.trim() ||
      `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl:
      process.env.STRIPE_ONBOARDING_CANCEL_URL?.trim() ||
      `${baseUrl}/checkout/cancel`,
  }
}

async function resolveDeliveredLeadsProductId(stripe: Stripe): Promise<string> {
  const configured = process.env.STRIPE_DEFAULT_LEAD_PRODUCT_ID?.trim()
  if (configured) {
    return configured
  }

  const products = await stripe.products.list({ active: true, limit: 100 })
  const existing = products.data.find(
    (product) =>
      product.metadata?.obieo_kind === 'delivered_leads' ||
      product.name.toLowerCase() === 'delivered leads'
  )

  if (existing) {
    return existing.id
  }

  const created = await stripe.products.create({
    name: 'Delivered Leads',
    metadata: {
      obieo_kind: 'delivered_leads',
    },
  })

  return created.id
}

async function resolveOneTimePriceId(
  stripe: Stripe,
  input: {
    productKind: string
    productName: string
    unitAmountCents: number
  }
): Promise<{ productId: string; priceId: string }> {
  const products = await stripe.products.list({ active: true, limit: 100 })
  const existingProduct = products.data.find(
    (product) =>
      product.metadata?.obieo_kind === input.productKind ||
      product.name.toLowerCase() === input.productName.toLowerCase()
  )

  const productId =
    existingProduct?.id ||
    (
      await stripe.products.create({
        name: input.productName,
        metadata: {
          obieo_kind: input.productKind,
        },
      })
    ).id

  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  })

  const existingPrice = prices.data.find(
    (price) =>
      price.currency === DEFAULT_CURRENCY &&
      price.unit_amount === input.unitAmountCents &&
      !price.recurring
  )

  const priceId =
    existingPrice?.id ||
    (
      await stripe.prices.create({
        product: productId,
        currency: DEFAULT_CURRENCY,
        unit_amount: input.unitAmountCents,
        metadata: {
          obieo_kind: input.productKind,
        },
      })
    ).id

  return {
    productId,
    priceId,
  }
}

async function resolvePinnedOneTimePrice(
  stripe: Stripe,
  input: {
    envVar: string
    expectedAmountCents: number
  }
): Promise<{ productId: string; priceId: string } | null> {
  const priceId = process.env[input.envVar]?.trim()
  if (!priceId) return null

  const price = await stripe.prices.retrieve(priceId)
  if (!price || typeof price !== 'object') {
    throw new Error(`Stripe did not return a price for ${input.envVar}`)
  }

  const productId = typeof price.product === 'string' ? price.product : price.product?.id
  if (!productId) {
    throw new Error(`Pinned price ${priceId} is missing a product id`)
  }

  // Not a hard error because Stripe amount changes are sometimes expected during iteration.
  if (price.unit_amount !== input.expectedAmountCents) {
    console.warn(
      `Pinned Stripe price ${priceId} (from ${input.envVar}) has unit_amount=${price.unit_amount}, expected ${input.expectedAmountCents}`
    )
  }

  if (price.recurring) {
    console.warn(`Pinned Stripe price ${priceId} (from ${input.envVar}) is recurring; expected one-time`)
  }

  return { productId, priceId }
}

async function resolveMeteredPriceId(
  stripe: Stripe,
  productId: string,
  unitAmountCents: number
): Promise<string> {
  const configured = process.env.STRIPE_DEFAULT_LEAD_PRICE_ID?.trim()
  if (configured) {
    return configured
  }

  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  })

  const existing = prices.data.find(
    (price) =>
      price.currency === DEFAULT_CURRENCY &&
      price.unit_amount === unitAmountCents &&
      Boolean(price.recurring) &&
      price.recurring?.interval === 'month' &&
      price.recurring?.usage_type === 'metered'
  )

  if (existing) {
    return existing.id
  }

  const created = await stripe.prices.create({
    product: productId,
    currency: DEFAULT_CURRENCY,
    unit_amount: unitAmountCents,
    recurring: {
      interval: 'month',
      usage_type: 'metered',
    },
    metadata: {
      obieo_kind: 'delivered_leads',
    },
  })

  return created.id
}

async function resolveCustomer(
  stripe: Stripe,
  email: string,
  portalKey: string,
  companyName: string,
  billingName?: string
): Promise<string> {
  const list = await stripe.customers.list({ email, limit: 10 })
  const existing = list.data.find(
    (customer) => customer.metadata?.portal_key === portalKey
  ) || list.data[0]

  if (existing) {
    const nextMetadata: Record<string, string> = {
      ...(existing.metadata || {}),
      portal_key: portalKey,
      company_name: companyName,
    }

    await stripe.customers.update(existing.id, {
      ...(billingName ? { name: billingName } : {}),
      metadata: nextMetadata,
    })

    return existing.id
  }

  const created = await stripe.customers.create({
    email,
    ...(billingName ? { name: billingName } : {}),
    metadata: {
      portal_key: portalKey,
      company_name: companyName,
    },
  })

  return created.id
}

async function findPortalSubscription(
  stripe: Stripe,
  customerId: string,
  portalKey: string
): Promise<Stripe.Subscription | null> {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 100,
  })

  const matched = subs.data.find(
    (sub) => sub.metadata?.portal_key === portalKey && sub.status !== 'canceled'
  )

  return matched || null
}

async function upsertSubscriptionForPortal(
  stripe: Stripe,
  input: {
    customerId: string
    portalKey: string
    priceId: string
    threshold: number
    billingModel: BillingModel
  }
): Promise<{ subscriptionId: string; subscriptionItemId: string; reusedSubscription: boolean }> {
  const threshold = normalizePositiveInt(input.threshold, 10)
  const existing = await findPortalSubscription(stripe, input.customerId, input.portalKey)

  if (existing) {
    const item = existing.items.data[0]
    if (!item) {
      throw new Error('Existing subscription has no subscription item')
    }

    await stripe.subscriptionItems.update(item.id, {
      price: input.priceId,
      billing_thresholds: {
        usage_gte: threshold,
      },
    })

    await stripe.subscriptions.update(existing.id, {
      metadata: {
        ...(existing.metadata || {}),
        portal_key: input.portalKey,
        billing_model: input.billingModel,
      },
    })

    return {
      subscriptionId: existing.id,
      subscriptionItemId: item.id,
      reusedSubscription: true,
    }
  }

  const created = await stripe.subscriptions.create({
    customer: input.customerId,
    collection_method: 'charge_automatically',
    items: [
      {
        price: input.priceId,
        billing_thresholds: {
          usage_gte: threshold,
        },
      },
    ],
    metadata: {
      portal_key: input.portalKey,
      billing_model: input.billingModel,
    },
  })

  const itemId = created.items.data[0]?.id
  if (!itemId) {
    throw new Error('Stripe did not return subscription item id')
  }

  return {
    subscriptionId: created.id,
    subscriptionItemId: itemId,
    reusedSubscription: false,
  }
}

async function createInitialChargeCheckoutSession(
  stripe: Stripe,
  input: {
    customerId: string
    priceId: string
    amountCents: number
    portalKey: string
    companyName?: string
    billingModel: BillingModel
    savePaymentMethod: boolean
    chargeKind: 'paid_in_full' | 'upfront_bundle' | 'card_verification'
    journey?: string
    discount?: { coupon?: string; promotionCode?: string; allowPromotionCodes?: boolean }
  }
): Promise<{ url: string | null; sessionId: string }> {
  const { successUrl, cancelUrl } = getCheckoutUrls()

  // Internal QA convenience: allow $0 "test" checkouts in non-production environments
  // by hard-applying a coupon/promo code via env var (never in code).
  //
  // Why: We still want to exercise the webhook + activation pipeline end-to-end
  // without actually charging $400 in live mode during development.
  const isNonProd =
    process.env.VERCEL_ENV ? process.env.VERCEL_ENV !== 'production' : process.env.NODE_ENV !== 'production'
  const internalPromo = isNonProd
    ? {
        coupon: process.env.STRIPE_INTERNAL_TEST_COUPON_ID?.trim() || '',
        promotionCode: process.env.STRIPE_INTERNAL_TEST_PROMOTION_CODE_ID?.trim() || '',
      }
    : { coupon: '', promotionCode: '' }
  const internalDiscount =
    internalPromo.promotionCode
      ? ({ promotion_code: internalPromo.promotionCode } as Stripe.Checkout.SessionCreateParams.Discount)
      : internalPromo.coupon
        ? ({ coupon: internalPromo.coupon } as Stripe.Checkout.SessionCreateParams.Discount)
        : null

  const explicitDiscount =
    input.discount?.promotionCode
      ? ({ promotion_code: input.discount.promotionCode } as Stripe.Checkout.SessionCreateParams.Discount)
      : input.discount?.coupon
        ? ({ coupon: input.discount.coupon } as Stripe.Checkout.SessionCreateParams.Discount)
        : null

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: input.customerId,
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    // Helpful for local/preview testing (e.g. entering a 100% off promo code).
    ...(isNonProd || input.discount?.allowPromotionCodes ? { allow_promotion_codes: true } : {}),
    ...(explicitDiscount ? { discounts: [explicitDiscount] } : internalDiscount ? { discounts: [internalDiscount] } : {}),
    payment_intent_data: {
      ...(input.savePaymentMethod ? { setup_future_usage: 'off_session' as const } : {}),
      metadata: {
        portal_key: input.portalKey,
        ...(input.companyName ? { company_name: input.companyName } : {}),
        billing_model: input.billingModel,
        obieo_kind: input.chargeKind,
        ...(input.journey ? { obieo_journey: input.journey } : {}),
      },
    },
    metadata: {
      portal_key: input.portalKey,
      ...(input.companyName ? { company_name: input.companyName } : {}),
      billing_model: input.billingModel,
      obieo_kind: input.chargeKind,
      initial_charge_cents: String(input.amountCents),
      ...(input.journey ? { obieo_journey: input.journey } : {}),
    },
  })

  return {
    url: session.url,
    sessionId: session.id,
  }
}

export async function provisionLeadBillingForOnboarding(
  input: LeadBillingProvisionInput & {
    journey?: string
    discount?: { coupon?: string; promotionCode?: string; allowPromotionCodes?: boolean }
  }
): Promise<LeadBillingProvisionResult | null> {
  const stripe = getStripeClient()
  if (!stripe) return null

  const unitAmount = normalizePositiveInt(input.leadUnitPriceCents, 4000)
  const defaults = getBillingModelDefaults(input.billingModel, unitAmount)

  const customerId = await resolveCustomer(
    stripe,
    input.billingEmail,
    input.portalKey,
    input.companyName,
    input.billingName
  )

  if (input.billingModel === 'package_40_paid_in_full') {
    const upfrontPinned = await resolvePinnedOneTimePrice(stripe, {
      envVar: 'STRIPE_PAID_IN_FULL_PRICE_ID',
      expectedAmountCents: defaults.initialChargeCents,
    })
    const upfront = upfrontPinned || (await resolveOneTimePriceId(stripe, {
      productKind: 'lead_package_40_paid_in_full',
      productName: '40 Lead Package (Paid in Full)',
      unitAmountCents: defaults.initialChargeCents,
    }))
    const checkout = await createInitialChargeCheckoutSession(stripe, {
      customerId,
      priceId: upfront.priceId,
      amountCents: defaults.initialChargeCents,
      portalKey: input.portalKey,
      companyName: input.companyName,
      billingModel: input.billingModel,
      savePaymentMethod: false,
      chargeKind: 'paid_in_full',
      journey: input.journey,
      discount: input.discount,
    })

    return {
      billingModel: input.billingModel,
      stripeCustomerId: customerId,
      stripeProductId: upfront.productId,
      stripePriceId: upfront.priceId,
      initialCheckoutUrl: checkout.url || undefined,
      initialCheckoutSessionId: checkout.sessionId,
      initialCheckoutAmountCents: defaults.initialChargeCents,
    }
  }

  const threshold =
    input.billingModel === 'pay_per_lead_perpetual'
      ? 1
      : normalizePositiveInt(input.leadChargeThreshold, defaults.leadChargeThreshold)

  const meteredProductId = await resolveDeliveredLeadsProductId(stripe)
  const meteredPriceId = await resolveMeteredPriceId(stripe, meteredProductId, unitAmount)
  const subscription = await upsertSubscriptionForPortal(stripe, {
    customerId,
    portalKey: input.portalKey,
    priceId: meteredPriceId,
    threshold,
    billingModel: input.billingModel,
  })

  const upfront =
    input.billingModel === 'commitment_40_with_10_upfront'
      ? (await resolvePinnedOneTimePrice(stripe, {
          envVar: 'STRIPE_UPFRONT_BUNDLE_PRICE_ID',
          expectedAmountCents: defaults.initialChargeCents,
        })) ||
        (await resolveOneTimePriceId(stripe, {
          productKind: 'lead_package_10_upfront_commitment_40',
          productName: '10 Lead Upfront Bundle (40 Lead Commitment)',
          unitAmountCents: defaults.initialChargeCents,
        }))
      : (await resolvePinnedOneTimePrice(stripe, {
          envVar: 'STRIPE_CARD_VERIFICATION_PRICE_ID',
          expectedAmountCents: defaults.initialChargeCents,
        })) ||
        (await resolveOneTimePriceId(stripe, {
          productKind: 'lead_card_verification',
          productName: 'Card Verification Charge',
          unitAmountCents: defaults.initialChargeCents,
        }))

  const checkout = await createInitialChargeCheckoutSession(stripe, {
    customerId,
    priceId: upfront.priceId,
    amountCents: defaults.initialChargeCents,
    portalKey: input.portalKey,
    companyName: input.companyName,
    billingModel: input.billingModel,
    savePaymentMethod: true,
    chargeKind:
      input.billingModel === 'commitment_40_with_10_upfront'
        ? 'upfront_bundle'
        : 'card_verification',
    journey: input.journey,
    discount: input.discount,
  })

  return {
    billingModel: input.billingModel,
    stripeCustomerId: customerId,
    stripeProductId: meteredProductId,
    stripePriceId: meteredPriceId,
    stripeSubscriptionId: subscription.subscriptionId,
    stripeSubscriptionItemId: subscription.subscriptionItemId,
    reusedSubscription: subscription.reusedSubscription,
    initialCheckoutUrl: checkout.url || undefined,
    initialCheckoutSessionId: checkout.sessionId,
    initialCheckoutAmountCents: defaults.initialChargeCents,
  }
}
