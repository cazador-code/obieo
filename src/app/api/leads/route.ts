import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

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

    // TODO: Send email notification (integrate with Resend, SendGrid, etc.)
    // await sendNotificationEmail({ name, email, score, answers })

    return NextResponse.json({ success: true, id: lead._id })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    )
  }
}
