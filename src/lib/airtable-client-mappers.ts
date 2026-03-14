import {
  formatBillingTermsSummary,
  type BillingModel,
} from '@/lib/billing-models'

export function cleanOptionalString(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const cleaned = value.trim()
  return cleaned || undefined
}

function normalizePositiveInt(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  const normalized = Math.floor(value)
  return normalized >= 0 ? normalized : null
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

type ParsedExternalPaymentEvent = {
  amountCents: number | null
  purchasePrepaidLeadCredits: number | null
  purchaseLeadCommitmentTotal: number | null
}

function parseExternalPaymentEvent(value: unknown): ParsedExternalPaymentEvent | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (record.kind !== 'external_payment') return null

  const amountCents = normalizePositiveInt(
    typeof record.amountCents === 'number' ? record.amountCents : null
  )

  let payload: Record<string, unknown> | null = null
  if (typeof record.payloadJson === 'string' && record.payloadJson.trim()) {
    try {
      const parsed = JSON.parse(record.payloadJson) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        payload = parsed as Record<string, unknown>
      }
    } catch {
      payload = null
    }
  }

  return {
    amountCents,
    purchasePrepaidLeadCredits: normalizePositiveInt(
      typeof payload?.prepaidPurchased === 'number' ? payload.prepaidPurchased : null
    ),
    purchaseLeadCommitmentTotal: normalizePositiveInt(
      typeof payload?.commitmentPurchased === 'number' ? payload.commitmentPurchased : null
    ),
  }
}

function getPackagePurchaseEvents(values: unknown[] | null | undefined): ParsedExternalPaymentEvent[] {
  if (!Array.isArray(values)) return []
  return values
    .map((value) => parseExternalPaymentEvent(value))
    .filter((value): value is ParsedExternalPaymentEvent => value !== null)
}

function countStandardPaidInFullEvents(values: ParsedExternalPaymentEvent[]): number {
  return values.filter(
    (value) => value.purchasePrepaidLeadCredits === 40 && value.purchaseLeadCommitmentTotal === 40
  ).length
}

function countStandardCommitmentEvents(values: ParsedExternalPaymentEvent[]): number {
  return values.filter(
    (value) => value.purchasePrepaidLeadCredits === 10 && value.purchaseLeadCommitmentTotal === 40
  ).length
}

function inferStandardPaidInFullPurchaseCount(input: {
  prepaidLeadCredits?: number | null
  leadCommitmentTotal?: number | null
  explicitStandardEventCount: number
}): number | null {
  if (input.explicitStandardEventCount <= 0) return null
  const prepaidLeadCredits = normalizePositiveInt(input.prepaidLeadCredits)
  const leadCommitmentTotal = normalizePositiveInt(input.leadCommitmentTotal)
  if (!prepaidLeadCredits || !leadCommitmentTotal) return null
  if (prepaidLeadCredits !== leadCommitmentTotal) return null
  if (leadCommitmentTotal % 40 !== 0) return null
  return Math.max(input.explicitStandardEventCount, leadCommitmentTotal / 40)
}

function inferStandardCommitmentPurchaseCount(input: {
  prepaidLeadCredits?: number | null
  leadCommitmentTotal?: number | null
  explicitStandardEventCount: number
}): number | null {
  if (input.explicitStandardEventCount <= 0) return null
  const prepaidLeadCredits = normalizePositiveInt(input.prepaidLeadCredits)
  const leadCommitmentTotal = normalizePositiveInt(input.leadCommitmentTotal)
  if (prepaidLeadCredits === null || !leadCommitmentTotal) return null
  if (leadCommitmentTotal % 40 !== 0) return null
  const inferredCount = leadCommitmentTotal / 40
  if (prepaidLeadCredits !== inferredCount * 10) return null
  return Math.max(input.explicitStandardEventCount, inferredCount)
}

function isStandardPaidInFullPackage(input: {
  prepaidLeadCredits?: number | null
  leadCommitmentTotal?: number | null
  packagePurchaseCount?: number | null
}): boolean {
  const purchaseCount = normalizePositiveInt(input.packagePurchaseCount)
  const prepaidLeadCredits = normalizePositiveInt(input.prepaidLeadCredits)
  const leadCommitmentTotal = normalizePositiveInt(input.leadCommitmentTotal)
  if (!purchaseCount || !prepaidLeadCredits || !leadCommitmentTotal) return false
  return prepaidLeadCredits === purchaseCount * 40 && leadCommitmentTotal === purchaseCount * 40
}

function isStandardCommitmentPackage(input: {
  prepaidLeadCredits?: number | null
  leadCommitmentTotal?: number | null
  packagePurchaseCount?: number | null
}): boolean {
  const purchaseCount = normalizePositiveInt(input.packagePurchaseCount)
  const prepaidLeadCredits = normalizePositiveInt(input.prepaidLeadCredits)
  const leadCommitmentTotal = normalizePositiveInt(input.leadCommitmentTotal)
  if (!purchaseCount || prepaidLeadCredits === null || !leadCommitmentTotal) return false
  return prepaidLeadCredits === purchaseCount * 10 && leadCommitmentTotal === purchaseCount * 40
}

export function buildContractorName(input: {
  accountFirstName?: string
  accountLastName?: string
  billingContactName?: string
}): string | undefined {
  const firstName = cleanOptionalString(input.accountFirstName)
  const lastName = cleanOptionalString(input.accountLastName)
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  return cleanOptionalString(input.billingContactName)
}

export function resolveAirtablePricingTier(input: {
  billingModel?: BillingModel
  leadUnitPriceCents: number
  prepaidLeadCredits?: number | null
  leadCommitmentTotal?: number | null
  packagePurchaseCount?: number | null
}): string | undefined {
  if (!input.billingModel) return undefined

  if (input.billingModel === 'package_40_paid_in_full') {
    if (
      input.packagePurchaseCount &&
      input.packagePurchaseCount > 1 &&
      isStandardPaidInFullPackage(input)
    ) {
      return '40 Lead Package'
    }

    const packageSize =
      typeof input.leadCommitmentTotal === 'number' && Number.isFinite(input.leadCommitmentTotal)
        ? Math.max(1, Math.floor(input.leadCommitmentTotal))
        : 40

    const packageMap: Record<number, string> = {
      10: '10 Lead Package',
      20: '20 Lead Package',
      40: '40 Lead Package',
      80: '80 Lead Package',
    }

    return packageMap[packageSize] || 'Custom Package'
  }

  if (input.billingModel === 'commitment_40_with_10_upfront') {
    if (
      input.packagePurchaseCount &&
      input.packagePurchaseCount > 1 &&
      isStandardCommitmentPackage(input)
    ) {
      return '40 Lead Package'
    }

    const packageSize =
      typeof input.leadCommitmentTotal === 'number' && Number.isFinite(input.leadCommitmentTotal)
        ? Math.max(1, Math.floor(input.leadCommitmentTotal))
        : 40

    const packageMap: Record<number, string> = {
      10: '10 Lead Package',
      20: '20 Lead Package',
      40: '40 Lead Package',
      80: '80 Lead Package',
    }

    return packageMap[packageSize] || 'Custom Package'
  }

  if (input.billingModel !== 'pay_per_lead_perpetual' && input.billingModel !== 'pay_per_lead_40_first_lead') {
    return undefined
  }

  const priceMap: Record<number, string> = {
    4500: 'PPL ($45)',
    4700: 'PPL ($47)',
    5000: 'PPL ($50)',
    5500: 'PPL ($55)',
    6000: 'PPL ($60)',
    6500: 'PPL ($65)',
    7000: 'PPL ($70)',
  }
  return priceMap[input.leadUnitPriceCents]
}

export function resolveAirtableBillingState(input: {
  billingModel?: BillingModel
  leadUnitPriceCents: number
  prepaidLeadCredits?: number | null
  leadCommitmentTotal?: number | null
  initialChargeCents?: number | null
  leadChargeThreshold?: number | null
  billingEvents?: unknown[] | null
  deliveredLeadCount?: number | null
}): {
  pricingTier?: string
  billingTermsSummary?: string | null
  currentLeadCommitment?: number | null
  remainingLeads?: number | null
  packagePurchaseCount?: number | null
} {
  const purchaseEvents = getPackagePurchaseEvents(input.billingEvents)
  const standardPaidInFullEventCount = countStandardPaidInFullEvents(purchaseEvents)
  const standardCommitmentEventCount = countStandardCommitmentEvents(purchaseEvents)
  let packagePurchaseCount = purchaseEvents.length > 0 ? purchaseEvents.length : null
  const currentLeadCommitment = normalizePositiveInt(input.leadCommitmentTotal)
  const deliveredLeadCount = normalizePositiveInt(input.deliveredLeadCount)
  const remainingLeads =
    currentLeadCommitment !== null && deliveredLeadCount !== null
      ? Math.max(0, currentLeadCommitment - deliveredLeadCount)
      : null

  if (input.billingModel === 'package_40_paid_in_full') {
    packagePurchaseCount =
      inferStandardPaidInFullPurchaseCount({
        prepaidLeadCredits: input.prepaidLeadCredits,
        leadCommitmentTotal: input.leadCommitmentTotal,
        explicitStandardEventCount: standardPaidInFullEventCount,
      }) ?? packagePurchaseCount
  }

  if (input.billingModel === 'commitment_40_with_10_upfront') {
    packagePurchaseCount =
      inferStandardCommitmentPurchaseCount({
        prepaidLeadCredits: input.prepaidLeadCredits,
        leadCommitmentTotal: input.leadCommitmentTotal,
        explicitStandardEventCount: standardCommitmentEventCount,
      }) ?? packagePurchaseCount
  }

  const pricingTier = resolveAirtablePricingTier({
    billingModel: input.billingModel,
    leadUnitPriceCents: input.leadUnitPriceCents,
    prepaidLeadCredits: input.prepaidLeadCredits,
    leadCommitmentTotal: input.leadCommitmentTotal,
    packagePurchaseCount,
  })

  if (
    input.billingModel === 'package_40_paid_in_full' &&
    packagePurchaseCount &&
    packagePurchaseCount > 1 &&
    isStandardPaidInFullPackage({
      prepaidLeadCredits: input.prepaidLeadCredits,
      leadCommitmentTotal: input.leadCommitmentTotal,
      packagePurchaseCount,
    })
  ) {
    const totalAmountCents = packagePurchaseCount * input.leadUnitPriceCents * 40
    return {
      pricingTier,
      billingTermsSummary: `${packagePurchaseCount} x 40 Lead Packages purchased${
        totalAmountCents > 0 ? ` (${formatCurrency(totalAmountCents)} total)` : ''
      }`,
      currentLeadCommitment,
      remainingLeads,
      packagePurchaseCount,
    }
  }

  if (
    input.billingModel === 'commitment_40_with_10_upfront' &&
    packagePurchaseCount &&
    packagePurchaseCount > 1 &&
    isStandardCommitmentPackage({
      prepaidLeadCredits: input.prepaidLeadCredits,
      leadCommitmentTotal: input.leadCommitmentTotal,
      packagePurchaseCount,
    })
  ) {
    const totalAmountCents = packagePurchaseCount * input.leadUnitPriceCents * 10
    return {
      pricingTier,
      billingTermsSummary: `${packagePurchaseCount} x 40 Lead Commitments purchased${
        totalAmountCents > 0 ? ` (${formatCurrency(totalAmountCents)} upfront total)` : ''
      }`,
      currentLeadCommitment,
      remainingLeads,
      packagePurchaseCount,
    }
  }

  return {
    pricingTier,
    billingTermsSummary: input.billingModel
      ? formatBillingTermsSummary({
          billingModel: input.billingModel,
          prepaidLeadCredits: input.prepaidLeadCredits,
          leadCommitmentTotal: input.leadCommitmentTotal,
          initialChargeCents: input.initialChargeCents,
          leadChargeThreshold: input.leadChargeThreshold,
          leadUnitPriceCents: input.leadUnitPriceCents,
        })
      : null,
    currentLeadCommitment,
    remainingLeads,
    packagePurchaseCount,
  }
}

export function resolveAirtableClientCity(input: {
  businessAddress?: string
  serviceAreas?: string[]
}): string | undefined {
  const address = cleanOptionalString(input.businessAddress)
  if (address) {
    const parts = address
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    if (parts.length >= 3) {
      return parts[parts.length - 2]
    }
    if (parts.length === 2) {
      const [first, second] = parts
      return /\d/.test(first) ? second : first
    }
  }

  const firstServiceArea =
    Array.isArray(input.serviceAreas) && input.serviceAreas.length > 0
      ? cleanOptionalString(input.serviceAreas[0])
      : undefined
  if (!firstServiceArea) return undefined

  const [city] = firstServiceArea.split(',').map((part) => part.trim()).filter(Boolean)
  return city || firstServiceArea
}
