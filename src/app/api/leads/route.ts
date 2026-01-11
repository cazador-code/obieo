import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing lead:', error)
    return NextResponse.json(
      { error: 'Failed to process lead' },
      { status: 500 }
    )
  }
}
