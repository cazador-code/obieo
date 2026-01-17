import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/uYeEUrkrjlAgGnhEu9Ts/webhook-trigger/abe6a2b5-4487-478f-a496-f55503f9d27d'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

interface QuizAnswers {
  industry?: string
  hasWebsite?: string
  leadSource?: string
  frustration?: string
  goals?: string
}

interface ROICalculatorData {
  averageTicketSize: number
  closeRate: number
  currentLeadsPerMonth: number
  grossProfitMargin: number
}

function formatQuizEmail(
  name: string,
  email: string,
  website: string | undefined,
  answers: QuizAnswers,
  score: number
): string {
  const scoreCategory = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Needs Major Work'

  return `
    <h2>New Quiz Lead: Website Score</h2>

    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${name || 'Not provided'}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${website ? `<p><strong>Website:</strong> ${website}</p>` : ''}

    <h3>Quiz Results</h3>
    <p><strong>Score:</strong> ${score}/100 (${scoreCategory})</p>

    <h3>Quiz Answers</h3>
    <ul>
      ${answers.industry ? `<li><strong>Industry:</strong> ${answers.industry}</li>` : ''}
      ${answers.hasWebsite ? `<li><strong>Has Website:</strong> ${answers.hasWebsite}</li>` : ''}
      ${answers.leadSource ? `<li><strong>Current Lead Source:</strong> ${answers.leadSource}</li>` : ''}
      ${answers.frustration ? `<li><strong>Biggest Frustration:</strong> ${answers.frustration}</li>` : ''}
      ${answers.goals ? `<li><strong>Goals:</strong> ${answers.goals}</li>` : ''}
    </ul>

    <hr />
    <p style="color: #666; font-size: 12px;">
      This lead completed the Website Score Quiz on obieo.com
    </p>
  `
}

async function sendToGHL(data: {
  name: string
  email: string
  website?: string
  source: string
  score: number
  answers: QuizAnswers
}) {
  try {
    const response = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
        website: data.website || '',
        source: data.source,
        score: data.score,
        quiz_industry: data.answers.industry || '',
        quiz_has_website: data.answers.hasWebsite || '',
        quiz_lead_source: data.answers.leadSource || '',
        quiz_frustration: data.answers.frustration || '',
        quiz_goals: data.answers.goals || '',
      }),
    })

    if (!response.ok) {
      console.error('GHL webhook failed:', response.status, await response.text())
    } else {
      console.log('Lead sent to GHL successfully')
    }
  } catch (error) {
    console.error('Error sending to GHL:', error)
  }
}

function formatROIEmail(
  name: string,
  email: string,
  company: string,
  data: ROICalculatorData,
  score: number
): string {
  const extraLeads = Math.round(data.currentLeadsPerMonth * 0.3)
  const additionalJobs = extraLeads * (data.closeRate / 100)
  const additionalRevenue = additionalJobs * data.averageTicketSize * 12
  const additionalProfit = additionalRevenue * (data.grossProfitMargin / 100)

  return `
    <h2>New ROI Calculator Lead</h2>

    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}

    <h3>Business Metrics Entered</h3>
    <ul>
      <li><strong>Average Ticket Size:</strong> $${data.averageTicketSize.toLocaleString()}</li>
      <li><strong>Close Rate:</strong> ${data.closeRate}%</li>
      <li><strong>Current Leads/Month:</strong> ${data.currentLeadsPerMonth}</li>
      <li><strong>Gross Profit Margin:</strong> ${data.grossProfitMargin}%</li>
    </ul>

    <h3>Calculated Results</h3>
    <ul>
      <li><strong>Extra Leads/Month:</strong> +${extraLeads}</li>
      <li><strong>Additional Annual Revenue:</strong> $${Math.round(additionalRevenue).toLocaleString()}</li>
      <li><strong>Additional Annual Profit:</strong> $${Math.round(additionalProfit).toLocaleString()}</li>
      <li><strong>Company Value Increase (4x EBITDA):</strong> $${Math.round(additionalProfit * 4).toLocaleString()}</li>
    </ul>

    <hr />
    <p style="color: #666; font-size: 12px;">
      This lead submitted the ROI Calculator on obieo.com
    </p>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, website, score, source } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const resend = getResendClient()

    if (!resend) {
      console.error('Resend not configured - RESEND_API_KEY missing')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    if (source === 'roi-calculator') {
      const emailResult = await resend.emails.send({
        from: 'Obieo <noreply@leads.obieo.com>',
        to: process.env.NOTIFICATION_EMAIL || 'hunter@obieo.com',
        subject: `New ROI Calculator Lead: ${name}`,
        html: formatROIEmail(name, email, website, body.quizAnswers, score),
      })
      console.log('Email sent:', emailResult)
    }

    if (source === 'quiz') {
      // Send email notification
      const emailResult = await resend.emails.send({
        from: 'Obieo <noreply@leads.obieo.com>',
        to: process.env.NOTIFICATION_EMAIL || 'hunter@obieo.com',
        subject: `New Quiz Lead: ${name || email} (Score: ${score}/100)`,
        html: formatQuizEmail(name, email, website, body.answers || {}, score),
      })
      console.log('Quiz email sent:', emailResult)

      // Send to GHL
      await sendToGHL({
        name,
        email,
        website,
        source,
        score,
        answers: body.answers || {},
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing lead:', error)
    return NextResponse.json(
      { error: 'Failed to process lead' },
      { status: 500 }
    )
  }
}
