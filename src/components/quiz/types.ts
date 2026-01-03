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
