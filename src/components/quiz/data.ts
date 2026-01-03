import { QuizQuestion } from './types'

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'industry',
    question: 'What type of home service business do you run?',
    options: [
      { label: 'Roofing', value: 'roofing', score: 10 },
      { label: 'HVAC', value: 'hvac', score: 10 },
      { label: 'Plumbing', value: 'plumbing', score: 10 },
      { label: 'Electrical', value: 'electrical', score: 10 },
      { label: 'Landscaping', value: 'landscaping', score: 10 },
      { label: 'Other', value: 'other', score: 10 },
    ],
  },
  {
    id: 'hasWebsite',
    question: 'Do you have a website currently?',
    options: [
      { label: "Yes, but it's outdated", value: 'outdated', score: 5 },
      { label: "Yes, it's decent but not great", value: 'decent', score: 15 },
      { label: 'Yes, professionally built', value: 'professional', score: 25 },
      { label: 'No website yet', value: 'none', score: 0 },
    ],
  },
  {
    id: 'leadSource',
    question: 'How are you getting leads right now?',
    options: [
      { label: 'Word of mouth only', value: 'referrals', score: 5 },
      { label: 'Some online, mostly referrals', value: 'mixed-referrals', score: 15 },
      { label: 'Paid ads (Google, Facebook)', value: 'paid', score: 10 },
      { label: 'Mix of organic and paid', value: 'balanced', score: 25 },
    ],
  },
  {
    id: 'frustration',
    question: "What's your biggest frustration with your online presence?",
    options: [
      { label: 'Not showing up on Google', value: 'seo', score: 5 },
      { label: 'Website looks unprofessional', value: 'design', score: 10 },
      { label: 'Getting traffic but no calls', value: 'conversion', score: 15 },
      { label: "Don't know what's wrong", value: 'unknown', score: 0 },
    ],
  },
  {
    id: 'goals',
    question: 'What would success look like in 6 months?',
    options: [
      { label: '2x my current leads', value: 'double', score: 20 },
      { label: 'Dominate local search', value: 'seo-dominant', score: 20 },
      { label: 'Look more professional than competitors', value: 'professional', score: 15 },
      { label: 'All of the above', value: 'all', score: 25 },
    ],
  },
]

export function calculateScore(answers: Record<string, string>): number {
  let total = 0
  quizQuestions.forEach((question) => {
    const answer = answers[question.id]
    const option = question.options.find((o) => o.value === answer)
    if (option) {
      total += option.score
    }
  })
  return total
}

export function getScoreCategory(score: number): 'poor' | 'needs-work' | 'good' | 'excellent' {
  if (score < 30) return 'poor'
  if (score < 55) return 'needs-work'
  if (score < 75) return 'good'
  return 'excellent'
}

export function getInsights(answers: Record<string, string>): string[] {
  const insights: string[] = []

  if (answers.hasWebsite === 'none' || answers.hasWebsite === 'outdated') {
    insights.push("Your website is your 24/7 salesperson—it needs to work harder for you.")
  }

  if (answers.leadSource === 'referrals') {
    insights.push("Relying solely on referrals limits your growth potential.")
  }

  if (answers.frustration === 'seo') {
    insights.push("If customers can't find you on Google, they're finding your competitors instead.")
  }

  if (answers.frustration === 'conversion') {
    insights.push("Traffic without conversions means your website isn't built to sell.")
  }

  if (answers.goals === 'all') {
    insights.push("You have ambitious goals—that's a great sign you're ready to invest in growth.")
  }

  // Always add a positive note
  if (insights.length === 0) {
    insights.push("You have a solid foundation—small improvements can drive big results.")
  }

  return insights.slice(0, 3) // Max 3 insights
}
