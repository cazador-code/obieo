import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { submitZipChangeRequestInConvex } from '@/lib/convex'

export const runtime = 'nodejs'

const ZIP_RE = /^\d{5}$/

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned.length > 0 ? cleaned : null
}

function getPortalKeyFromMetadata(meta: Record<string, unknown> | null | undefined): string | null {
  if (!meta) return null
  return normalizeString(meta.portalKey) || normalizeString(meta.portal_key)
}

function getPrimaryEmail(user: {
  emailAddresses: Array<{ id: string; emailAddress: string }>
  primaryEmailAddressId: string | null
}): string | null {
  const primary = user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)
  return normalizeString(primary?.emailAddress || user.emailAddresses[0]?.emailAddress || '')
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { requestedZipCodes?: unknown; reason?: unknown }
  try {
    body = (await request.json()) as { requestedZipCodes?: unknown; reason?: unknown }
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!Array.isArray(body.requestedZipCodes)) {
    return NextResponse.json({ success: false, error: 'requestedZipCodes must be an array' }, { status: 400 })
  }

  const zips = body.requestedZipCodes
    .map((z: unknown) => (typeof z === 'string' ? z.trim() : ''))
    .filter(Boolean)
  const uniqueZips = [...new Set(zips)]

  if (uniqueZips.length < 5) {
    return NextResponse.json({ success: false, error: 'At least 5 ZIP codes required.' }, { status: 400 })
  }
  if (uniqueZips.length > 200) {
    return NextResponse.json({ success: false, error: 'Maximum 200 ZIP codes allowed.' }, { status: 400 })
  }

  const invalidZip = uniqueZips.find((zip) => !ZIP_RE.test(zip))
  if (invalidZip) {
    return NextResponse.json({ success: false, error: `ZIP must be 5 digits: ${invalidZip}` }, { status: 400 })
  }

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const portalKey = getPortalKeyFromMetadata((user.publicMetadata as Record<string, unknown> | null) || null)
  if (!portalKey) {
    return NextResponse.json(
      { success: false, error: 'Portal is missing organization mapping. Please contact support.' },
      { status: 400 }
    )
  }

  const email = getPrimaryEmail({
    emailAddresses: user.emailAddresses.map((entry) => ({ id: entry.id, emailAddress: entry.emailAddress })),
    primaryEmailAddressId: user.primaryEmailAddressId,
  })

  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 500) : undefined

  try {
    const result = await submitZipChangeRequestInConvex({
      portalKey,
      requestedZipCodes: uniqueZips,
      reason: reason || undefined,
      requestedBy: userId,
      requestedByEmail: email || undefined,
    })

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Could not submit request right now. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      requestId: result.requestId,
      status: result.status,
      addedZipCodes: result.addedZipCodes,
      removedZipCodes: result.removedZipCodes,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not submit request.'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
