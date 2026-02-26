export const MIN_TARGET_ZIP_COUNT = 5
export const MAX_TARGET_ZIP_COUNT = 10
const TARGET_ZIP_RE = /^\d{5}$/

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

export function dedupeStringList(values: string[]): string[] {
  return Array.from(new Set(values))
}

function normalizeFlexibleStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => cleanString(entry))
      .filter((entry): entry is string => Boolean(entry))
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  return []
}

export function normalizeTargetZipCodes(value: unknown): string[] {
  return parseTargetZipCodes(value).zipCodes
}

export function parseTargetZipCodes(value: unknown): {
  zipCodes: string[]
  invalidZipCodes: string[]
} {
  const rawZipCodes = normalizeFlexibleStringList(value)
  const validZipCodes: string[] = []
  const invalidZipCodes: string[] = []

  for (const zipCode of rawZipCodes) {
    if (TARGET_ZIP_RE.test(zipCode)) {
      validZipCodes.push(zipCode)
      continue
    }
    invalidZipCodes.push(zipCode)
  }

  return {
    zipCodes: dedupeStringList(validZipCodes),
    invalidZipCodes: dedupeStringList(invalidZipCodes),
  }
}

export function getInvalidTargetZipError(invalidZipCodes: string[]): string | null {
  if (invalidZipCodes.length === 0) return null
  if (invalidZipCodes.length === 1) {
    return `Invalid target ZIP code: ${invalidZipCodes[0]}. Use 5-digit ZIPs only.`
  }

  return `Invalid target ZIP codes: ${invalidZipCodes.join(', ')}. Use 5-digit ZIPs only.`
}

export function getTargetZipCountError(count: number): string | null {
  if (count < MIN_TARGET_ZIP_COUNT) {
    return `At least ${MIN_TARGET_ZIP_COUNT} unique target ZIP codes are required`
  }

  if (count > MAX_TARGET_ZIP_COUNT) {
    return `Maximum ${MAX_TARGET_ZIP_COUNT} unique target ZIP codes allowed`
  }

  return null
}
