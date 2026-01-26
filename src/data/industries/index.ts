/**
 * Industry Data Index
 * Barrel export for all industry authority page data
 */

import { roofingData } from './roofing'
import { hvacData } from './hvac'
import { plumbingData } from './plumbing'
import { electricalData } from './electrical'
import { pestControlData } from './pest-control'
import { landscapingData } from './landscaping'
import { cleaningData } from './cleaning'
import { garageDoorsData } from './garage-doors'
import { paintingData } from './painting'
import { flooringData } from './flooring'
import type { IndustryAuthorityData } from './types'

// Export individual industry data
export { roofingData } from './roofing'
export { hvacData } from './hvac'
export { plumbingData } from './plumbing'
export { electricalData } from './electrical'
export { pestControlData } from './pest-control'
export { landscapingData } from './landscaping'
export { cleaningData } from './cleaning'
export { garageDoorsData } from './garage-doors'
export { paintingData } from './painting'
export { flooringData } from './flooring'

// Export types
export type { IndustryAuthorityData } from './types'

// Map of all industries by slug
export const industryDataMap: Record<string, IndustryAuthorityData> = {
  roofing: roofingData,
  hvac: hvacData,
  plumbing: plumbingData,
  electrical: electricalData,
  'pest-control': pestControlData,
  landscaping: landscapingData,
  cleaning: cleaningData,
  'garage-doors': garageDoorsData,
  painting: paintingData,
  flooring: flooringData,
}

// Get industry data by slug
export function getIndustryData(slug: string): IndustryAuthorityData | undefined {
  return industryDataMap[slug]
}

// Get all available industry slugs
export function getAllIndustrySlugs(): string[] {
  return Object.keys(industryDataMap)
}

// Check if industry exists
export function industryExists(slug: string): boolean {
  return slug in industryDataMap
}
