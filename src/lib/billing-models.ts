export const BILLING_MODEL_VALUES = [
  'package_40_paid_in_full',
  'commitment_40_with_10_upfront',
  'pay_per_lead_perpetual',
  'pay_per_lead_40_first_lead',
] as const

export type BillingModel = (typeof BILLING_MODEL_VALUES)[number]

export const DEFAULT_BILLING_MODEL: BillingModel = 'commitment_40_with_10_upfront'

export interface BillingModelDefaults {
  leadUnitPriceCents: number
  leadChargeThreshold: number
  prepaidLeadCredits: number
  leadCommitmentTotal: number | null
  initialChargeCents: number
}

function normalizePositiveInt(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const normalized = Math.floor(value)
  return normalized > 0 ? normalized : null
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export const BILLING_MODEL_LABELS: Record<BillingModel, string> = {
  package_40_paid_in_full: '$1,600 paid in full (40 leads)',
  commitment_40_with_10_upfront: '$400 upfront, then billed per 10 leads (40 total)',
  pay_per_lead_perpetual: '$40 pay-per-lead with $1 card verification',
  pay_per_lead_40_first_lead: '$40 first lead, then $40 per lead (perpetual)',
}

export function normalizeBillingModel(value: unknown): BillingModel {
  if (typeof value !== 'string') return DEFAULT_BILLING_MODEL
  const normalized = value.trim() as BillingModel
  return BILLING_MODEL_VALUES.includes(normalized) ? normalized : DEFAULT_BILLING_MODEL
}

export function getBillingModelDefaults(
  model: BillingModel,
  leadUnitPriceCents: number
): BillingModelDefaults {
  const unit = Number.isFinite(leadUnitPriceCents) && leadUnitPriceCents > 0
    ? Math.floor(leadUnitPriceCents)
    : 4000

  if (model === 'package_40_paid_in_full') {
    return {
      leadUnitPriceCents: unit,
      leadChargeThreshold: 10,
      prepaidLeadCredits: 40,
      leadCommitmentTotal: 40,
      initialChargeCents: unit * 40,
    }
  }

  if (model === 'commitment_40_with_10_upfront') {
    return {
      leadUnitPriceCents: unit,
      leadChargeThreshold: 10,
      prepaidLeadCredits: 10,
      leadCommitmentTotal: 40,
      initialChargeCents: unit * 10,
    }
  }

  if (model === 'pay_per_lead_perpetual') {
    return {
      leadUnitPriceCents: unit,
      leadChargeThreshold: 1,
      prepaidLeadCredits: 0,
      leadCommitmentTotal: null,
      initialChargeCents: 100,
    }
  }

  return {
    leadUnitPriceCents: unit,
    leadChargeThreshold: 1,
    prepaidLeadCredits: 1,
    leadCommitmentTotal: null,
    initialChargeCents: unit,
  }
}

export function formatBillingTermsSummary(input: {
  billingModel?: BillingModel | string | null
  prepaidLeadCredits?: number | null
  leadCommitmentTotal?: number | null
  initialChargeCents?: number | null
  leadChargeThreshold?: number | null
  leadUnitPriceCents?: number | null
}): string | null {
  if (!input.billingModel) return null

  const billingModel =
    typeof input.billingModel === 'string' ? normalizeBillingModel(input.billingModel) : input.billingModel
  const leadUnitPriceCents = normalizePositiveInt(input.leadUnitPriceCents) || 4000
  const defaults = getBillingModelDefaults(billingModel, leadUnitPriceCents)

  const prepaidLeadCredits = normalizePositiveInt(input.prepaidLeadCredits) ?? defaults.prepaidLeadCredits
  const leadCommitmentTotal = normalizePositiveInt(input.leadCommitmentTotal) ?? defaults.leadCommitmentTotal
  const initialChargeCents = normalizePositiveInt(input.initialChargeCents) ?? defaults.initialChargeCents
  const leadChargeThreshold = normalizePositiveInt(input.leadChargeThreshold) ?? defaults.leadChargeThreshold
  const unitPriceCents = normalizePositiveInt(input.leadUnitPriceCents) ?? defaults.leadUnitPriceCents

  const matchesDefaults =
    prepaidLeadCredits === defaults.prepaidLeadCredits &&
    (leadCommitmentTotal ?? null) === (defaults.leadCommitmentTotal ?? null) &&
    initialChargeCents === defaults.initialChargeCents &&
    leadChargeThreshold === defaults.leadChargeThreshold &&
    unitPriceCents === defaults.leadUnitPriceCents

  if (matchesDefaults) {
    return BILLING_MODEL_LABELS[billingModel]
  }

  if (billingModel === 'package_40_paid_in_full') {
    return `Custom paid-in-full package: ${prepaidLeadCredits} prepaid leads, ${formatCurrency(initialChargeCents)} upfront, ${leadCommitmentTotal ?? prepaidLeadCredits} total commitment, ${formatCurrency(unitPriceCents)}/lead`
  }

  if (billingModel === 'commitment_40_with_10_upfront') {
    return `Custom commitment package: ${prepaidLeadCredits} prepaid leads, ${formatCurrency(initialChargeCents)} upfront, ${leadCommitmentTotal ?? prepaidLeadCredits} total commitment, ${formatCurrency(unitPriceCents)}/lead, billed every ${leadChargeThreshold} leads`
  }

  if (billingModel === 'pay_per_lead_perpetual') {
    return `Pay-per-lead: ${formatCurrency(unitPriceCents)}/lead with ${formatCurrency(initialChargeCents)} verification, billed every ${leadChargeThreshold} lead${leadChargeThreshold === 1 ? '' : 's'}`
  }

  return `Pay-per-lead: ${formatCurrency(unitPriceCents)}/lead with ${formatCurrency(initialChargeCents)} first charge, billed every ${leadChargeThreshold} lead${leadChargeThreshold === 1 ? '' : 's'}`
}
