import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { contactLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

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

function formatContactEmail(data: {
  name: string
  email: string
  company: string
  phone: string
  website: string
  message: string
}): string {
  const safeName = escapeHtml(data.name)
  const safeEmail = escapeHtml(data.email)
  const safeCompany = data.company ? escapeHtml(data.company) : ''
  const safePhone = data.phone ? escapeHtml(data.phone) : ''
  const safeWebsite = data.website ? escapeHtml(data.website) : ''
  const safeMessage = escapeHtml(data.message)

  return `
    <h2>New Contact Form Submission</h2>

    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    ${safeCompany ? `<p><strong>Company:</strong> ${safeCompany}</p>` : ''}
    ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
    ${safeWebsite ? `<p><strong>Website:</strong> ${safeWebsite}</p>` : ''}

    <h3>Message</h3>
    <p>${safeMessage.replace(/\n/g, '<br />')}</p>

    <hr />
    <p style="color: #666; font-size: 12px;">
      This message was sent from the contact form on obieo.com
    </p>
  `
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await contactLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  try {
    const body = await request.json()
    const { name, email, company, phone, website, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
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

    const emailResult = await resend.emails.send({
      from: 'Obieo <noreply@leads.obieo.com>',
      to: process.env.NOTIFICATION_EMAIL || 'hunter@obieo.com',
      replyTo: email,
      subject: `Contact Form: ${name}${company ? ` (${company})` : ''}`,
      html: formatContactEmail({ name, email, company, phone, website, message }),
    })

    console.log('Contact email sent:', emailResult)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
