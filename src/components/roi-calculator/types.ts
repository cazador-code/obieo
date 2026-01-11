export interface CalculatorInputs {
  averageTicketSize: number
  closeRate: number // percentage (e.g., 35 for 35%)
  currentLeadsPerMonth: number
  grossProfitMargin: number // percentage (e.g., 40 for 40%)
}

export interface CalculatorResults {
  // Current state (derived from inputs)
  currentMonthlyRevenue: number
  currentAnnualRevenue: number
  currentMonthlyGrossProfit: number
  currentAnnualGrossProfit: number

  // SEO projections
  extraLeadsPerMonth: number
  additionalClosedJobs: number
  additionalMonthlyRevenue: number
  additionalAnnualRevenue: number
  additionalMonthlyGrossProfit: number
  additionalAnnualGrossProfit: number

  // EBITDA-based company valuation increase
  valueIncrease3x: number
  valueIncrease4x: number
  valueIncrease5x: number
}

export interface ROILeadData {
  name: string
  email: string
  company?: string
  inputs: CalculatorInputs
  results: CalculatorResults
}

export type CalculatorStep = 'input' | 'teaser' | 'gated'
