import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'

// Create client lazily to avoid build-time validation errors
function getSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_TOKEN

  if (!projectId) {
    throw new Error('Sanity project ID not configured')
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: false,
    token,
  })
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

interface ROICalculatorData {
  averageTicketSize: number
  closeRate: number
  currentLeadsPerMonth: number
  grossProfitMargin: number
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
    const { name, email, website, phone, answers, score, source } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get client at runtime
    const client = getSanityClient()

    // Create lead in Sanity
    const lead = await client.create({
      _type: 'lead',
      name: name || '',
      email,
      website: website || '',
      phone: phone || '',
      source: source || 'quiz',
      quizAnswers: answers || {},
      score: score || 0,
      status: 'new',
      createdAt: new Date().toISOString(),
    })

    // Send email notification if Resend is configured
    const resend = getResendClient()
    if (resend && source === 'roi-calculator') {
      try {
        await resend.emails.send({
          from: 'Obieo <noreply@leads.obieo.com>',
          to: process.env.NOTIFICATION_EMAIL || 'hunter@obieo.com',
          subject: `New ROI Calculator Lead: ${name}`,
          html: formatROIEmail(name, email, website, body.quizAnswers, score),
        })
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, id: lead._id })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    )
  }
}
