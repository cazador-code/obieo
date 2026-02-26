export const MIN_TARGET_ZIP_COUNT = 5
export const MAX_TARGET_ZIP_COUNT = 10

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
  return dedupeStringList(normalizeFlexibleStringList(value))
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
