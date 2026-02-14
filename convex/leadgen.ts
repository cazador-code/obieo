import { mutation, query } from './_generated/server'
import type { DatabaseReader } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { v } from 'convex/values'

type LeadgenIntentRecord = Doc<'leadgenIntents'>

const BILLING_MODELS = [
  'package_40_paid_in_full',
  'commitment_40_with_10_upfront',
  'pay_per_lead_perpetual',
  'pay_per_lead_40_first_lead',
] as const

type BillingModel = (typeof BILLING_MODELS)[number]

function normalizeBillingModel(value: unknown): BillingModel {
  if (typeof value !== 'string') return 'package_40_paid_in_full'
  const trimmed = value.trim() as BillingModel
  return BILLING_MODELS.includes(trimmed) ? trimmed : 'package_40_paid_in_full'
}

function assertAuthorized(authSecret: string) {
  const expected = process.env.CONVEX_AUTH_ADAPTER_SECRET
  if (!expected || authSecret !== expected) {
    throw new Error('Unauthorized')
  }
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

async function getIntentByPortalKey(ctx: { db: DatabaseReader }, portalKey: string) {
  return (await ctx.db
    .query('leadgenIntents')
    .withIndex('by_portalKey', (q) => q.eq('portalKey', portalKey))
    .first()) as LeadgenIntentRecord | null
}

async function getIntentByToken(ctx: { db: DatabaseReader }, token: string) {
  return (await ctx.db
    .query('leadgenIntents')
    .withIndex('by_token', (q) => q.eq('token', token))
    .first()) as LeadgenIntentRecord | null
}

export const getLeadgenIntentByBillingEmail = query({
  args: {
    authSecret: v.string(),
    billingEmail: v.string(),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const billingEmail = normalizeString(args.billingEmail)
    if (!billingEmail) return null

    const now = Date.now()
    const candidates = (await ctx.db
      .query('leadgenIntents')
      .withIndex('by_billingEmail', (q) => q.eq('billingEmail', billingEmail))
      .collect()) as LeadgenIntentRecord[]

    const filtered = candidates.filter((intent) => intent.tokenExpiresAt > now)
    if (filtered.length === 0) return null
    return filtered.reduce((latest, cur) => (cur.createdAt > latest.createdAt ? cur : latest))
  },
})

export const findActiveLeadgenIntent = query({
  args: {
    authSecret: v.string(),
    billingEmail: v.string(),
    companyName: v.string(),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const billingEmail = normalizeString(args.billingEmail)
    const companyName = normalizeString(args.companyName)
    if (!billingEmail || !companyName) return null

    const now = Date.now()
    const candidates = (await ctx.db
      .query('leadgenIntents')
      .withIndex('by_billingEmail', (q) => q.eq('billingEmail', billingEmail))
      .collect()) as LeadgenIntentRecord[]

    // Prefer the most recent non-completed intent for this email+company.
    const filtered = candidates
      .filter((intent) => intent.companyName === companyName)
      .filter((intent) => intent.status !== 'onboarding_completed')
      .filter((intent) => intent.tokenExpiresAt > now)

    if (filtered.length === 0) return null
    return filtered.reduce((latest, cur) => (cur.createdAt > latest.createdAt ? cur : latest))
  },
})

export const createLeadgenIntent = mutation({
  args: {
    authSecret: v.string(),
    portalKey: v.string(),
    companyName: v.string(),
    billingEmail: v.string(),
    billingName: v.optional(v.string()),
    billingModel: v.optional(v.string()),
    token: v.string(),
    tokenExpiresAt: v.number(),
    source: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const now = Date.now()

    const existing = await getIntentByPortalKey(ctx, args.portalKey)
    if (existing) {
      return existing
    }

    const id = await ctx.db.insert('leadgenIntents', {
      portalKey: args.portalKey,
      companyName: args.companyName,
      billingEmail: args.billingEmail,
      billingName: args.billingName,
      billingModel: normalizeBillingModel(args.billingModel),
      token: args.token,
      tokenExpiresAt: Math.floor(args.tokenExpiresAt),
      status: 'checkout_created',
      source: args.source,
      utmSource: args.utmSource,
      utmCampaign: args.utmCampaign,
      utmMedium: args.utmMedium,
      utmContent: args.utmContent,
      createdAt: now,
      updatedAt: now,
    })

    return (await ctx.db.get(id)) as LeadgenIntentRecord
  },
})

export const updateLeadgenCheckoutDetails = mutation({
  args: {
    authSecret: v.string(),
    portalKey: v.string(),
    stripeCustomerId: v.optional(v.string()),
    checkoutSessionId: v.optional(v.string()),
    checkoutUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const intent = await getIntentByPortalKey(ctx, args.portalKey)
    if (!intent) throw new Error('Leadgen intent not found')

    const now = Date.now()
    await ctx.db.patch(intent._id, {
      ...(args.stripeCustomerId !== undefined ? { stripeCustomerId: args.stripeCustomerId } : {}),
      ...(args.checkoutSessionId !== undefined ? { checkoutSessionId: args.checkoutSessionId } : {}),
      ...(args.checkoutUrl !== undefined ? { checkoutUrl: args.checkoutUrl } : {}),
      updatedAt: now,
    })

    return (await ctx.db.get(intent._id)) as LeadgenIntentRecord
  },
})

export const markLeadgenPaid = mutation({
  args: {
    authSecret: v.string(),
    portalKey: v.string(),
    checkoutSessionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const intent = await getIntentByPortalKey(ctx, args.portalKey)
    if (!intent) throw new Error('Leadgen intent not found')

    const now = Date.now()
    if (intent.status === 'paid' || intent.status === 'invited' || intent.status === 'onboarding_completed') {
      return intent
    }

    await ctx.db.patch(intent._id, {
      status: 'paid',
      paidAt: now,
      ...(args.checkoutSessionId ? { checkoutSessionId: args.checkoutSessionId } : {}),
      ...(args.stripeCustomerId ? { stripeCustomerId: args.stripeCustomerId } : {}),
      updatedAt: now,
    })

    return (await ctx.db.get(intent._id)) as LeadgenIntentRecord
  },
})

export const markLeadgenInvited = mutation({
  args: {
    authSecret: v.string(),
    portalKey: v.string(),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const intent = await getIntentByPortalKey(ctx, args.portalKey)
    if (!intent) throw new Error('Leadgen intent not found')

    const now = Date.now()
    if (intent.status === 'invited' || intent.status === 'onboarding_completed') {
      return intent
    }

    await ctx.db.patch(intent._id, {
      status: 'invited',
      invitedAt: now,
      updatedAt: now,
    })

    return (await ctx.db.get(intent._id)) as LeadgenIntentRecord
  },
})

export const markLeadgenOnboardingCompleted = mutation({
  args: {
    authSecret: v.string(),
    portalKey: v.string(),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const intent = await getIntentByPortalKey(ctx, args.portalKey)
    if (!intent) throw new Error('Leadgen intent not found')

    const now = Date.now()
    if (intent.status === 'onboarding_completed') {
      return intent
    }

    await ctx.db.patch(intent._id, {
      status: 'onboarding_completed',
      onboardingCompletedAt: now,
      updatedAt: now,
    })

    return (await ctx.db.get(intent._id)) as LeadgenIntentRecord
  },
})

export const getLeadgenIntentByToken = query({
  args: {
    authSecret: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const token = normalizeString(args.token)
    if (!token) return null

    const intent = await getIntentByToken(ctx, token)
    if (!intent) return null

    const now = Date.now()
    if (intent.tokenExpiresAt <= now) return null

    return intent
  },
})

export const getLeadgenIntentByPortalKey = query({
  args: {
    authSecret: v.string(),
    portalKey: v.string(),
  },
  handler: async (ctx, args) => {
    assertAuthorized(args.authSecret)
    const portalKey = normalizeString(args.portalKey)
    if (!portalKey) return null

    const intent = await getIntentByPortalKey(ctx, portalKey)
    if (!intent) return null

    const now = Date.now()
    if (intent.tokenExpiresAt <= now) return null

    return intent
  },
})
