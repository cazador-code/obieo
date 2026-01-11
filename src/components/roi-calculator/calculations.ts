import type { CalculatorInputs, CalculatorResults } from './types'

/**
 * SEO Lead Increase Assumption
 *
 * Industry data suggests SEO can deliver 20-50% more leads for local businesses.
 * Using 30% as a conservative midpoint estimate.
 *
 * Adjust this value based on your actual client results.
 */
const SEO_LEAD_INCREASE_RATE = 0.30

export function calculateROI(inputs: CalculatorInputs): CalculatorResults {
  const {
    averageTicketSize,
    closeRate,
    currentLeadsPerMonth,
    grossProfitMargin,
  } = inputs

  // Convert percentages to decimals
  const closeRateDecimal = closeRate / 100
  const marginDecimal = grossProfitMargin / 100

  // Current state calculations
  const currentClosedJobs = currentLeadsPerMonth * closeRateDecimal
  const currentMonthlyRevenue = currentClosedJobs * averageTicketSize
  const currentAnnualRevenue = currentMonthlyRevenue * 12
  const currentMonthlyGrossProfit = currentMonthlyRevenue * marginDecimal
  const currentAnnualGrossProfit = currentMonthlyGrossProfit * 12

  // SEO projection: Additional leads from improved visibility
  const extraLeadsPerMonth = Math.round(currentLeadsPerMonth * SEO_LEAD_INCREASE_RATE)

  // Additional metrics from SEO
  const additionalClosedJobs = extraLeadsPerMonth * closeRateDecimal
  const additionalMonthlyRevenue = additionalClosedJobs * averageTicketSize
  const additionalAnnualRevenue = additionalMonthlyRevenue * 12
  const additionalMonthlyGrossProfit = additionalMonthlyRevenue * marginDecimal
  const additionalAnnualGrossProfit = additionalMonthlyGrossProfit * 12

  // EBITDA multiples for company valuation increase
  // Home services typically valued at 3-5x EBITDA
  const valueIncrease3x = additionalAnnualGrossProfit * 3
  const valueIncrease4x = additionalAnnualGrossProfit * 4
  const valueIncrease5x = additionalAnnualGrossProfit * 5

  return {
    currentMonthlyRevenue,
    currentAnnualRevenue,
    currentMonthlyGrossProfit,
    currentAnnualGrossProfit,
    extraLeadsPerMonth,
    additionalClosedJobs,
    additionalMonthlyRevenue,
    additionalAnnualRevenue,
    additionalMonthlyGrossProfit,
    additionalAnnualGrossProfit,
    valueIncrease3x,
    valueIncrease4x,
    valueIncrease5x,
  }
}

/**
 * Format a number as USD currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Blur a currency string by replacing last 3 digits with X's
 * e.g., "$12,500" -> "$12,XXX"
 */
export function blurCurrency(value: number): string {
  const formatted = formatCurrency(value)
  // Replace last 3 digits before any trailing characters
  return formatted.replace(/\d{3}(?=[^\d]*$)/, 'XXX')
}
