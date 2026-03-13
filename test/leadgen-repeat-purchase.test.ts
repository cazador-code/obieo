import test from 'node:test'
import assert from 'node:assert/strict'
import {
  resolveLeadgenClientDecision,
  rollForwardPurchaseTotals,
  type BillingIdentityResolution,
} from '../src/lib/leadgen-repeat-purchase.ts'

test('first purchase creates a new client when no billing identity exists', () => {
  const billingIdentity: BillingIdentityResolution = { status: 'none', portalKeys: [] }

  const decision = resolveLeadgenClientDecision({
    requestedPortalKey: null,
    activeIntentPortalKey: null,
    billingIdentity,
  })

  assert.deepEqual(decision, { kind: 'create_new' })
})

test('repeat purchase without an exact portal key fails closed even when billing identity is unique', () => {
  const billingIdentity: BillingIdentityResolution = {
    status: 'unique',
    portalKey: 'oz-home-services-d4f6e8',
    portalKeys: ['oz-home-services-d4f6e8'],
    latestIntentStatus: 'onboarding_completed',
    latestIntentUpdatedAt: 1,
  }

  const decision = resolveLeadgenClientDecision({
    requestedPortalKey: null,
    activeIntentPortalKey: null,
    billingIdentity,
  })

  assert.equal(decision.kind, 'manual_review')
  if (decision.kind !== 'manual_review') {
    throw new Error('Expected manual review decision')
  }
  assert.equal(decision.reason, 'missing_stable_client_identifier')
  assert.deepEqual(decision.candidatePortalKeys, ['oz-home-services-d4f6e8'])
})

test('repeat purchase with the exact existing portal key reuses the original client', () => {
  const billingIdentity: BillingIdentityResolution = {
    status: 'unique',
    portalKey: 'oz-home-services-d4f6e8',
    portalKeys: ['oz-home-services-d4f6e8'],
    latestIntentStatus: 'onboarding_completed',
    latestIntentUpdatedAt: 1,
  }

  const decision = resolveLeadgenClientDecision({
    requestedPortalKey: 'oz-home-services-d4f6e8',
    activeIntentPortalKey: null,
    billingIdentity,
  })

  assert.deepEqual(decision, {
    kind: 'reuse_existing',
    portalKey: 'oz-home-services-d4f6e8',
    source: 'requested_portal_key',
  })
})

test('active intent portal key reuses the original client even without a submitted portal key', () => {
  const billingIdentity: BillingIdentityResolution = {
    status: 'unique',
    portalKey: 'oz-home-services-d4f6e8',
    portalKeys: ['oz-home-services-d4f6e8'],
    latestIntentStatus: 'checkout_created',
    latestIntentUpdatedAt: 1,
  }

  const decision = resolveLeadgenClientDecision({
    requestedPortalKey: null,
    activeIntentPortalKey: 'oz-home-services-d4f6e8',
    billingIdentity,
  })

  assert.deepEqual(decision, {
    kind: 'reuse_existing',
    portalKey: 'oz-home-services-d4f6e8',
    source: 'active_intent',
  })
})

test('ambiguous billing identity can still reuse when the submitted portal key exactly matches a candidate', () => {
  const billingIdentity: BillingIdentityResolution = {
    status: 'ambiguous',
    portalKeys: ['alpha-123', 'beta-456'],
  }

  const decision = resolveLeadgenClientDecision({
    requestedPortalKey: 'beta-456',
    activeIntentPortalKey: null,
    billingIdentity,
  })

  assert.deepEqual(decision, {
    kind: 'reuse_existing',
    portalKey: 'beta-456',
    source: 'requested_portal_key',
  })
})

test('ambiguous repeat purchase fails closed into manual review', () => {
  const billingIdentity: BillingIdentityResolution = {
    status: 'ambiguous',
    portalKeys: ['alpha-123', 'beta-456'],
  }

  const decision = resolveLeadgenClientDecision({
    requestedPortalKey: null,
    activeIntentPortalKey: null,
    billingIdentity,
  })

  assert.equal(decision.kind, 'manual_review')
  if (decision.kind !== 'manual_review') {
    throw new Error('Expected manual review decision')
  }
  assert.equal(decision.reason, 'ambiguous_billing_identity')
  assert.deepEqual(decision.candidatePortalKeys, ['alpha-123', 'beta-456'])
})

test('mismatched requested portal key fails closed into manual review', () => {
  const billingIdentity: BillingIdentityResolution = {
    status: 'unique',
    portalKey: 'canonical-portal',
    portalKeys: ['canonical-portal'],
    latestIntentStatus: 'paid',
    latestIntentUpdatedAt: 1,
  }

  const decision = resolveLeadgenClientDecision({
    requestedPortalKey: 'wrong-portal',
    activeIntentPortalKey: null,
    billingIdentity,
  })

  assert.equal(decision.kind, 'manual_review')
  if (decision.kind !== 'manual_review') {
    throw new Error('Expected manual review decision')
  }
  assert.equal(decision.reason, 'requested_portal_key_mismatch')
})

test('first purchase rollup initializes prepaid and commitment totals', () => {
  const totals = rollForwardPurchaseTotals({
    currentPrepaidLeadCredits: 0,
    currentLeadCommitmentTotal: null,
    purchasePrepaidLeadCredits: 40,
    purchaseLeadCommitmentTotal: 40,
  })

  assert.equal(totals.nextPrepaidLeadCredits, 40)
  assert.equal(totals.nextLeadCommitmentTotal, 40)
})

test('repeat purchase rollup adds onto the original client totals', () => {
  const totals = rollForwardPurchaseTotals({
    currentPrepaidLeadCredits: 12,
    currentLeadCommitmentTotal: 40,
    purchasePrepaidLeadCredits: 40,
    purchaseLeadCommitmentTotal: 40,
  })

  assert.equal(totals.nextPrepaidLeadCredits, 52)
  assert.equal(totals.nextLeadCommitmentTotal, 80)
})
