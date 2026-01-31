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

interface AIQuizData {
  business: {
    name: string
    placeId: string
    city: string
    formattedAddress: string
  }
  websiteUrl: string
  targetKeyword: string
  leadSource: string
  monthlyLeadGoal: string
  contact: {
    name: string
    email: string
    phone?: string
  }
}

interface AIAnalysisResults {
  overallScore: number
  technical: {
    performanceScore: number
    seoScore: number
  }
  aiVisibility: {
    wasCited: boolean
    aiReadinessScore: number
    competitors: Array<{ name: string; reason: string }>
    whyNotCited: string[]
  }
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

function formatAIQuizEmail(
  data: AIQuizData,
  analysis: AIAnalysisResults
): string {
  const safeName = escapeHtml(data.contact.name || 'Not provided')
  const safeEmail = escapeHtml(data.contact.email)
  const safeBusinessName = escapeHtml(data.business.name)
  const safeKeyword = escapeHtml(data.targetKeyword)
  const safeWebsite = escapeHtml(data.websiteUrl)

  const scoreColor = analysis.overallScore >= 70 ? '#22c55e' : analysis.overallScore >= 50 ? '#f59e0b' : '#ef4444'
  const citedStatus = analysis.aiVisibility.wasCited ? '✓ Appearing' : '✗ NOT Appearing'
  const citedColor = analysis.aiVisibility.wasCited ? '#22c55e' : '#ef4444'

  return `
    <h2 style="color: #1a1a2e;">🔍 New AI Visibility Quiz Lead</h2>

    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #334155;">Contact Information</h3>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      ${data.contact.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.contact.phone)}</p>` : ''}
    </div>

    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #334155;">Business Details</h3>
      <p><strong>Business:</strong> ${safeBusinessName}</p>
      <p><strong>Location:</strong> ${escapeHtml(data.business.city || data.business.formattedAddress)}</p>
      <p><strong>Website:</strong> <a href="${safeWebsite}">${safeWebsite}</a></p>
      <p><strong>Target Keyword:</strong> "${safeKeyword}"</p>
    </div>

    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #334155;">Analysis Results</h3>
      <p style="font-size: 24px; margin: 0;">
        <strong style="color: ${scoreColor};">${analysis.overallScore}/100</strong>
        <span style="color: #64748b; font-size: 14px;"> Overall AI Visibility Score</span>
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 12px 0;" />
      <p><strong>Performance:</strong> ${analysis.technical.performanceScore}/100</p>
      <p><strong>SEO:</strong> ${analysis.technical.seoScore}/100</p>
      <p><strong>AI Readiness:</strong> ${analysis.aiVisibility.aiReadinessScore}/100</p>
      <p style="margin-top: 12px;">
        <strong>AI Search Status:</strong>
        <span style="color: ${citedColor}; font-weight: bold;"> ${citedStatus}</span>
        <span style="color: #64748b;"> for "${safeKeyword}"</span>
      </p>
    </div>

    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #334155;">Qualification Data</h3>
      <p><strong>Current Lead Source:</strong> ${escapeHtml(data.leadSource)}</p>
      <p><strong>Monthly Lead Goal:</strong> ${escapeHtml(data.monthlyLeadGoal)}</p>
    </div>

    ${analysis.aiVisibility.competitors.length > 0 ? `
    <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #991b1b;">Competitors Being Cited Instead</h3>
      <ul>
        ${analysis.aiVisibility.competitors.slice(0, 3).map(c =>
          `<li><strong>${escapeHtml(c.name)}</strong> - ${escapeHtml(c.reason)}</li>`
        ).join('')}
      </ul>
    </div>
    ` : ''}

    ${analysis.aiVisibility.whyNotCited.length > 0 ? `
    <div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #92400e;">Why They're Not Appearing</h3>
      <ul>
        ${analysis.aiVisibility.whyNotCited.slice(0, 3).map(r =>
          `<li>${escapeHtml(r)}</li>`
        ).join('')}
      </ul>
    </div>
    ` : ''}

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
    <p style="color: #666; font-size: 12px;">
      This lead completed the AI Visibility Quiz on obieo.com<br/>
      Google Place ID: ${escapeHtml(data.business.placeId || 'N/A')}
    </p>
  `
}

function formatROIEmail(
  name: string,
  email: string,
  company: string,
  data: ROICalculatorData,
  _score: number
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

    // Handle AI Visibility Quiz leads
    if (source === 'ai-visibility-quiz') {
      const aiQuizData = body.aiQuizData as AIQuizData
      const analysisResults = body.analysisResults as AIAnalysisResults

      // Send detailed email notification
      const emailResult = await resend.emails.send({
        from: 'Obieo <noreply@leads.obieo.com>',
        to: process.env.NOTIFICATION_EMAIL || 'hunter@obieo.com',
        subject: `🔥 AI Quiz Lead: ${aiQuizData?.business?.name || name} (Score: ${score}/100)`,
        html: formatAIQuizEmail(aiQuizData, analysisResults),
      })
      console.log('AI Quiz email sent:', emailResult)

      // Send to GHL with enriched data
      if (GHL_WEBHOOK_URL) {
        try {
          const response = await fetch(GHL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              name,
              phone: aiQuizData?.contact?.phone || '',
              company: aiQuizData?.business?.name || '',
              website: website || aiQuizData?.websiteUrl || '',
              source: 'ai-visibility-quiz',
              // Scores
              ai_visibility_score: score,
              ai_readiness_score: analysisResults?.aiVisibility?.aiReadinessScore || 0,
              performance_score: analysisResults?.technical?.performanceScore || 0,
              seo_score: analysisResults?.technical?.seoScore || 0,
              // AI Status
              ai_cited: analysisResults?.aiVisibility?.wasCited ? 'Yes' : 'No',
              // Business data
              business_city: aiQuizData?.business?.city || '',
              business_place_id: aiQuizData?.business?.placeId || '',
              target_keyword: aiQuizData?.targetKeyword || '',
              // Qualification
              current_lead_source: aiQuizData?.leadSource || '',
              monthly_lead_goal: aiQuizData?.monthlyLeadGoal || '',
              // Competitors (for sales context)
              top_competitor: analysisResults?.aiVisibility?.competitors?.[0]?.name || '',
            }),
          })
          if (response.ok) {
            console.log('AI Quiz lead sent to GHL successfully')
          } else {
            console.error('GHL webhook failed:', response.status)
          }
        } catch (error) {
          console.error('Error sending AI Quiz lead to GHL:', error)
        }
      }
    }

    // Handle Call Page leads
    if (source === 'call-page') {
      const answers = body.answers || {}
      const safeCompany = escapeHtml(answers.companyName || '')
      const safeName = escapeHtml(name || '')
      const safeEmail = escapeHtml(email)
      const safePhone = body.phone ? escapeHtml(body.phone) : ''

      const emailResult = await resend.emails.send({
        from: 'Obieo <noreply@leads.obieo.com>',
        to: process.env.NOTIFICATION_EMAIL || 'hunter@obieo.com',
        subject: `New Call Booking Lead: ${answers.companyName || name}`,
        html: `
          <h2>New Call Page Lead</h2>
          <h3>Contact</h3>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
          <h3>Business Info</h3>
          <p><strong>Company:</strong> ${safeCompany}</p>
          <p><strong>Has Website:</strong> ${escapeHtml(answers.hasWebsite || 'N/A')}</p>
          ${answers.websiteUrl ? `<p><strong>Website:</strong> ${escapeHtml(answers.websiteUrl)}</p>` : ''}
          ${answers.revenue ? `<p><strong>Revenue:</strong> ${escapeHtml(answers.revenue)}</p>` : ''}
          <hr />
          <p style="color: #666; font-size: 12px;">This lead submitted the booking form on obieo.com/call</p>
        `,
      })
      console.log('Call page email sent:', emailResult)

      // Send to GHL
      if (GHL_WEBHOOK_URL) {
        try {
          const response = await fetch(GHL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              name,
              phone: body.phone || '',
              company: answers.companyName || '',
              website: website || answers.websiteUrl || '',
              source: 'call-page',
              call_has_website: answers.hasWebsite || '',
            }),
          })
          if (response.ok) {
            console.log('Call page lead sent to GHL successfully')
          } else {
            console.error('GHL webhook failed:', response.status)
          }
        } catch (error) {
          console.error('Error sending call lead to GHL:', error)
        }
      }
    }

    // Handle Partial Call Page leads (drop-off capture)
    if (source === 'call-page-partial') {
      const answers = body.answers || {}
      const safeCompany = escapeHtml(answers.companyName || '')
      const safeName = escapeHtml(name || '')
      const safeEmail = escapeHtml(email)
      const safePhone = body.phone ? escapeHtml(body.phone) : ''

      const emailResult = await resend.emails.send({
        from: 'Obieo <noreply@leads.obieo.com>',
        to: process.env.NOTIFICATION_EMAIL || 'hunter@obieo.com',
        subject: `[Partial] Call Page Lead: ${answers.companyName || name || email}`,
        html: `
          <h2>⚠️ Partial Call Page Lead (Drop-off)</h2>
          <p style="color: #666;">This person started the booking form but didn't complete verification.</p>
          <h3>Contact</h3>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
          <h3>Business Info</h3>
          <p><strong>Company:</strong> ${safeCompany}</p>
          <p><strong>Has Website:</strong> ${escapeHtml(answers.hasWebsite || 'N/A')}</p>
          ${answers.websiteUrl ? `<p><strong>Website:</strong> ${escapeHtml(answers.websiteUrl)}</p>` : ''}
          <hr />
          <p style="color: #666; font-size: 12px;">Partial lead from obieo.com/call — user dropped off before completing SMS verification</p>
        `,
      })
      console.log('Partial call page email sent:', emailResult)

      // Send to GHL for CRM segmentation
      if (GHL_WEBHOOK_URL) {
        try {
          const response = await fetch(GHL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              name,
              phone: body.phone || '',
              company: answers.companyName || '',
              website: website || answers.websiteUrl || '',
              source: 'call-page-partial',
              call_has_website: answers.hasWebsite || '',
            }),
          })
          if (response.ok) {
            console.log('Partial call lead sent to GHL successfully')
          } else {
            console.error('GHL webhook failed:', response.status)
          }
        } catch (error) {
          console.error('Error sending partial call lead to GHL:', error)
        }
      }
    }

    // Send to Facebook Conversions API (server-side tracking) — skip partials
    const sourceUrls: Record<string, string> = {
      'quiz': 'quiz',
      'ai-visibility-quiz': 'quiz',
      'roi-calculator': 'roi-calculator',
      'call-page': 'call',
    }
    const contentNames: Record<string, string> = {
      'quiz': 'Website Score Quiz',
      'ai-visibility-quiz': 'AI Visibility Quiz',
      'roi-calculator': 'ROI Calculator',
      'call-page': 'Call Booking Form',
    }
    if (source !== 'call-page-partial') {
      await sendToFacebookCAPI({
        email,
        eventSourceUrl: `https://obieo.com/${sourceUrls[source] || source}`,
        clientIp: ip,
        clientUserAgent: userAgent,
        contentName: contentNames[source] || source,
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
