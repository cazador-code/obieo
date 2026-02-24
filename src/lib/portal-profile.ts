export interface PortalEditableProfile {
  serviceAreas: string[]
  targetZipCodes: string[]
  leadDeliveryPhones: string[]
  leadDeliveryEmails: string[]
  leadNotificationPhone?: string
  leadNotificationEmail?: string
  leadProspectEmail?: string
}

export interface PortalProfileValidationResult {
  ok: boolean
  errors: string[]
  profile: PortalEditableProfile
}

const ZIP_RE = /^\d{5}$/

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function unique(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    if (seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const cleaned = value
    .map((entry) => cleanString(entry))
    .filter((entry): entry is string => Boolean(entry))
  return unique(cleaned)
}

function normalizeEmailArray(value: unknown): string[] {
  return unique(
    normalizeStringArray(value)
      .map((entry) => entry.toLowerCase())
      .filter(Boolean)
  )
}

function normalizeOptionalString(value: unknown): string | undefined {
  const cleaned = cleanString(value)
  return cleaned || undefined
}

function normalizeOptionalEmail(value: unknown): string | undefined {
  const cleaned = cleanString(value)
  return cleaned ? cleaned.toLowerCase() : undefined
}

export function normalizePortalEditableProfile(input: unknown): PortalProfileValidationResult {
  const data = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>

  const profile: PortalEditableProfile = {
    serviceAreas: normalizeStringArray(data.serviceAreas),
    targetZipCodes: normalizeStringArray(data.targetZipCodes),
    leadDeliveryPhones: normalizeStringArray(data.leadDeliveryPhones),
    leadDeliveryEmails: normalizeEmailArray(data.leadDeliveryEmails),
    leadNotificationPhone: normalizeOptionalString(data.leadNotificationPhone),
    leadNotificationEmail: normalizeOptionalEmail(data.leadNotificationEmail),
    leadProspectEmail: normalizeOptionalEmail(data.leadProspectEmail),
  }

  const errors: string[] = []

  if (profile.serviceAreas.length < 1) {
    errors.push('Add at least 1 service area.')
  }

  if (profile.targetZipCodes.length < 5) {
    errors.push('Add at least 5 target ZIP codes.')
  }

  if (profile.targetZipCodes.length > 200) {
    errors.push('Maximum 200 target ZIP codes allowed.')
  }

  const invalidZip = profile.targetZipCodes.find((zip) => !ZIP_RE.test(zip))
  if (invalidZip) {
    errors.push(`ZIP must be 5 digits: ${invalidZip}`)
  }

  if (profile.leadDeliveryPhones.length === 0 && profile.leadDeliveryEmails.length === 0) {
    errors.push('Add at least 1 lead routing phone or email.')
  }

  return {
    ok: errors.length === 0,
    errors,
    profile,
  }
}

export function profileFromOrganization(organization: Record<string, unknown> | undefined): PortalEditableProfile {
  const source = organization || {}
  return {
    serviceAreas: normalizeStringArray(source.serviceAreas),
    targetZipCodes: normalizeStringArray(source.targetZipCodes),
    leadDeliveryPhones: normalizeStringArray(source.leadDeliveryPhones),
    leadDeliveryEmails: normalizeEmailArray(source.leadDeliveryEmails),
    leadNotificationPhone: normalizeOptionalString(source.leadNotificationPhone),
    leadNotificationEmail: normalizeOptionalEmail(source.leadNotificationEmail),
    leadProspectEmail: normalizeOptionalEmail(source.leadProspectEmail),
  }
}

export function splitMultiline(value: string): string[] {
  return unique(
    value
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  )
}

export function splitCsvOrLines(value: string): string[] {
  return unique(
    value
      .split(/[\n,]/)
      .map((entry) => entry.trim())
      .filter(Boolean)
  )
}
