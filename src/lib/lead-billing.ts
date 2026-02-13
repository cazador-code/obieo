type LeadBillingMapValue = string | { subscriptionItemId?: string }

export interface LeadBillingLookupInput {
  clientKey?: string
  clientEmail?: string
  clientCompany?: string
}

function normalizeLookupKey(value: string | undefined): string | null {
  if (!value) return null
  const cleaned = value.trim().toLowerCase()
  return cleaned || null
}

function extractSubscriptionItemId(value: LeadBillingMapValue | undefined): string | null {
  if (!value) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || null
  }

  if (typeof value.subscriptionItemId === 'string') {
    const trimmed = value.subscriptionItemId.trim()
    return trimmed || null
  }

  return null
}

function parseLeadBillingMap(): Record<string, LeadBillingMapValue> {
  const raw = process.env.STRIPE_LEAD_BILLING_MAP_JSON
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    const normalized: Record<string, LeadBillingMapValue> = {}
    for (const [key, value] of Object.entries(parsed as Record<string, LeadBillingMapValue>)) {
      const normalizedKey = normalizeLookupKey(key)
      if (!normalizedKey) continue
      normalized[normalizedKey] = value
    }
    return normalized
  } catch (error) {
    console.error('Invalid STRIPE_LEAD_BILLING_MAP_JSON:', error)
    return {}
  }
}

export function resolveLeadBillingSubscriptionItemId({
  clientKey,
  clientEmail,
  clientCompany,
}: LeadBillingLookupInput): string | null {
  const mapping = parseLeadBillingMap()
  if (Object.keys(mapping).length === 0) return null

  const keysToTry = [
    normalizeLookupKey(clientKey),
    normalizeLookupKey(clientEmail),
    normalizeLookupKey(clientCompany),
  ].filter((value): value is string => Boolean(value))

  for (const key of keysToTry) {
    const value = mapping[key]
    const subscriptionItemId = extractSubscriptionItemId(value)
    if (subscriptionItemId) {
      return subscriptionItemId
    }
  }

  return null
}
