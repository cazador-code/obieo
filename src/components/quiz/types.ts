export interface QuizOption {
  label: string
  value: string
  score: number // Weight for scoring
}

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
}

export interface QuizAnswers {
  industry: string
  hasWebsite: string
  leadSource: string
  frustration: string
  goals: string
}

export interface QuizResult {
  score: number
  category: 'poor' | 'needs-work' | 'good' | 'excellent'
  insights: string[]
}

export interface LeadData {
  name: string
  email: string
  website?: string
  phone?: string
  answers: QuizAnswers
  score: number
}

// ============================================
// AI Visibility Quiz Types (New)
// ============================================

/** Google Places business data from autocomplete selection */
export interface VerifiedBusiness {
  name: string
  placeId: string
  formattedAddress: string
  city: string
  state?: string
  lat?: number
  lng?: number
}

/** User inputs collected during the quiz */
export interface AIQuizInputs {
  business: VerifiedBusiness
  websiteUrl: string
  targetKeyword: string
  leadSource: 'referrals' | 'mixed' | 'paid' | 'organic' | 'none'
  monthlyLeadGoal: 'under-10' | '10-25' | '25-50' | '50-plus'
  contact: {
    name: string
    email: string
    phone?: string
  }
}

/** Technical SEO data from PageSpeed/Lighthouse */
export interface TechnicalAnalysis {
  performanceScore: number // 0-100
  seoScore: number // 0-100
  accessibilityScore: number // 0-100
  bestPracticesScore: number // 0-100
  coreWebVitals: {
    lcp: number // Largest Contentful Paint (ms)
    cls: number // Cumulative Layout Shift
    inp: number // Interaction to Next Paint (ms)
  }
  loadTime: number // seconds
  mobileOptimized: boolean
}

/** HTML/content analysis results */
export interface ContentAnalysis {
  hasTitle: boolean
  titleLength: number
  titleContent?: string
  hasMetaDescription: boolean
  metaDescriptionLength: number
  metaDescriptionContent?: string
  hasH1: boolean
  h1Content?: string
  hasSchema: boolean
  schemaTypes: string[] // e.g., ['LocalBusiness', 'FAQPage']
  hasFAQSchema: boolean
  hasLocalBusinessSchema: boolean
  robotsTxtAllowsAI: boolean // Checks for GPTBot, ClaudeBot blocks
}

/** Competitor mentioned in AI responses */
export interface AICompetitor {
  name: string
  reason: string // Why they were cited
  website?: string
}

/** AI visibility analysis results */
export interface AIVisibilityAnalysis {
  keyword: string
  wasCited: boolean
  citationContext?: string // The AI response snippet
  competitors: AICompetitor[]
  whyNotCited: string[] // Reasons the business wasn't mentioned
  recommendations: string[]
  aiReadinessScore: number // 0-100, based on content signals
}

/** Complete analysis result */
export interface QuizAnalysisResult {
  technical: TechnicalAnalysis
  content: ContentAnalysis
  aiVisibility: AIVisibilityAnalysis
  overallScore: number // Weighted composite 0-100
  analyzedAt: string // ISO timestamp
}

/** Issue found during analysis */
export interface AnalysisIssue {
  severity: 'critical' | 'warning' | 'info'
  category: 'technical' | 'content' | 'ai-readiness'
  title: string
  description: string
  impact: string
}

/** Full lead data for CRM/storage */
export interface AIQuizLead {
  id?: string
  inputs: AIQuizInputs
  analysis: QuizAnalysisResult
  issues: AnalysisIssue[]
  source: 'ai-visibility-quiz'
  createdAt: string
  emailVerified: boolean
}

/** API response shape for /api/quiz/analyze */
export interface AnalyzeAPIResponse {
  success: boolean
  analysis?: QuizAnalysisResult
  issues?: AnalysisIssue[]
  error?: string
}
