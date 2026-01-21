import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { Resend } from 'resend'
import { leadsLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

// Security: Moved to environment variable
const GHL_WEBHOOK_URL = process.env.GHL_WEBHOOK_URL

// Facebook Conversions API config
const FB_PIXEL_ID = '290774033453771'
const FB_ACCESS_TOKEN = process.env.FB_CONVERSIONS_API_TOKEN

// Security: Escape HTML to prevent XSS in email clients
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

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
  const safeName = escapeHtml(name || 'Not provided')
  const safeEmail = escapeHtml(email)
  const safeWebsite = website ? escapeHtml(website) : ''

  return `
    <h2>New Quiz Lead: Website Score</h2>

    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    ${safeWebsite ? `<p><strong>Website:</strong> ${safeWebsite}</p>` : ''}

    <h3>Quiz Results</h3>
    <p><strong>Score:</strong> ${score}/100 (${scoreCategory})</p>

    <h3>Quiz Answers</h3>
    <ul>
      ${answers.industry ? `<li><strong>Industry:</strong> ${escapeHtml(answers.industry)}</li>` : ''}
      ${answers.hasWebsite ? `<li><strong>Has Website:</strong> ${escapeHtml(answers.hasWebsite)}</li>` : ''}
      ${answers.leadSource ? `<li><strong>Current Lead Source:</strong> ${escapeHtml(answers.leadSource)}</li>` : ''}
      ${answers.frustration ? `<li><strong>Biggest Frustration:</strong> ${escapeHtml(answers.frustration)}</li>` : ''}
      ${answers.goals ? `<li><strong>Goals:</strong> ${escapeHtml(answers.goals)}</li>` : ''}
    </ul>

    <hr />
    <p style="color: #666; font-size: 12px;">
      This lead completed the Website Score Quiz on obieo.com
    </p>
  `
}

// Facebook Conversions API - sends Lead event server-side
async function sendToFacebookCAPI(data: {
  email: string
  eventSourceUrl: string
  clientIp: string
  clientUserAgent: string
  contentName: string
}) {
  if (!FB_ACCESS_TOKEN) {
    console.warn('FB_CONVERSIONS_API_TOKEN not configured, skipping CAPI')
    return
  }

  try {
    // Hash email for privacy (required by Facebook)
    const hashedEmail = createHash('sha256')
      .update(data.email.toLowerCase().trim())
      .digest('hex')

    const eventData = {
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: data.eventSourceUrl,
          user_data: {
            em: [hashedEmail], // hashed email
            client_ip_address: data.clientIp,
            client_user_agent: data.clientUserAgent,
          },
          custom_data: {
            content_name: data.contentName,
          },
        },
      ],
    }

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }
    )

    if (response.ok) {
      const result = await response.json()
      console.log('Facebook CAPI Lead event sent:', result)
    } else {
      const error = await response.text()
      console.error('Facebook CAPI failed:', response.status, error)
    }
  } catch (error) {
    console.error('Error sending to Facebook CAPI:', error)
  }
}

async function sendToGHL(data: {
  name: string
  email: string
  website?: string
  source: string
  score: number
  answers: QuizAnswers
}) {
  if (!GHL_WEBHOOK_URL) {
    console.warn('GHL_WEBHOOK_URL not configured, skipping webhook')
    return
  }
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
  const safeName = escapeHtml(name || '')
  const safeEmail = escapeHtml(email)
  const safeCompany = company ? escapeHtml(company) : ''

  return `
    <h2>New ROI Calculator Lead</h2>

    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    ${safeCompany ? `<p><strong>Company:</strong> ${safeCompany}</p>` : ''}

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
  // Rate limiting
  const ip = getClientIp(request);
  const { success, remaining } = await leadsLimiter.limit(ip);
  if (!success) {
    return rateLimitResponse(remaining);
  }

  // Capture user agent for Facebook CAPI
  const userAgent = request.headers.get('user-agent') || ''

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

      // Send to GHL
      if (GHL_WEBHOOK_URL) {
        const roiData = body.quizAnswers as ROICalculatorData
        try {
          const response = await fetch(GHL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              name,
              company: website || '',
              source,
              roi_average_ticket: roiData.averageTicketSize,
              roi_close_rate: roiData.closeRate,
              roi_leads_per_month: roiData.currentLeadsPerMonth,
              roi_profit_margin: roiData.grossProfitMargin,
              roi_potential_revenue: score,
            }),
          })
          if (response.ok) {
            console.log('ROI lead sent to GHL successfully')
          } else {
            console.error('GHL webhook failed:', response.status)
          }
        } catch (error) {
          console.error('Error sending ROI lead to GHL:', error)
        }
      }
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

    // Send to Facebook Conversions API (server-side tracking)
    await sendToFacebookCAPI({
      email,
      eventSourceUrl: `https://obieo.com/${source === 'quiz' ? 'quiz' : 'roi-calculator'}`,
      clientIp: ip,
      clientUserAgent: userAgent,
      contentName: source === 'quiz' ? 'AI Visibility Quiz' : 'ROI Calculator',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing lead:', error)
    return NextResponse.json(
      { error: 'Failed to process lead' },
      { status: 500 }
    )
  }
}
