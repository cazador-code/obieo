import type { BillingModel } from '@/lib/billing-models'

export function cleanOptionalString(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const cleaned = value.trim()
  return cleaned || undefined
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
}): string | undefined {
  if (!input.billingModel) return undefined

  if (input.billingModel === 'package_40_paid_in_full' || input.billingModel === 'commitment_40_with_10_upfront') {
    return '40 Lead Package'
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
