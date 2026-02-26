import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getOrganizationSnapshotInConvex, submitZipChangeRequestInConvex } from '@/lib/convex'
import { sendPortalZipChangeRequestNotification } from '@/lib/portal-profile-notifications'

export const runtime = 'nodejs'

const ZIP_RE = /^\d{5}$/
const MAX_ZIPS_PER_LIST = 100
const MAX_NOTE_LENGTH = 2000

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned.length > 0 ? cleaned : null
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  const output: string[] = []
  for (const entry of value) {
    const cleaned = normalizeString(entry)
    if (!cleaned) continue
    if (seen.has(cleaned)) continue
    seen.add(cleaned)
    output.push(cleaned)
  }
  return output
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

function hasZipRequestNotificationConfig(): boolean {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const recipientsRaw =
    process.env.ONBOARDING_NOTIFICATION_EMAILS ||
    process.env.LEAD_OPS_NOTIFICATION_EMAILS ||
    process.env.NOTIFICATION_EMAIL ||
    ''
  const recipients = recipientsRaw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  return Boolean(apiKey && recipients.length > 0)
}

function cleanErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { addZipCodes?: unknown; removeZipCodes?: unknown; note?: unknown }
  try {
    body = (await request.json()) as { addZipCodes?: unknown; removeZipCodes?: unknown; note?: unknown }
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const addZipCodes = normalizeStringArray(body.addZipCodes)
  const removeZipCodes = normalizeStringArray(body.removeZipCodes)
  const note = normalizeString(body.note) || undefined

  if (addZipCodes.length > MAX_ZIPS_PER_LIST || removeZipCodes.length > MAX_ZIPS_PER_LIST) {
    return NextResponse.json(
      { success: false, error: `Limit ${MAX_ZIPS_PER_LIST} ZIPs per add/remove list.` },
      { status: 400 }
    )
  }

  if (note && note.length > MAX_NOTE_LENGTH) {
    return NextResponse.json(
      { success: false, error: `Note must be ${MAX_NOTE_LENGTH} characters or fewer.` },
      { status: 400 }
    )
  }

  if (!hasZipRequestNotificationConfig()) {
    return NextResponse.json(
      {
        success: false,
        error: 'ZIP change requests are temporarily unavailable. Please contact support.',
      },
      { status: 503 }
    )
  }

  if (addZipCodes.length === 0 && removeZipCodes.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Add at least one ZIP to add or remove.' },
      { status: 400 }
    )
  }

  const invalidAddZip = addZipCodes.find((zip) => !ZIP_RE.test(zip))
  if (invalidAddZip) {
    return NextResponse.json(
      { success: false, error: `ZIP must be 5 digits: ${invalidAddZip}` },
      { status: 400 }
    )
  }

  const invalidRemoveZip = removeZipCodes.find((zip) => !ZIP_RE.test(zip))
  if (invalidRemoveZip) {
    return NextResponse.json(
      { success: false, error: `ZIP must be 5 digits: ${invalidRemoveZip}` },
      { status: 400 }
    )
  }

  const removeZipSet = new Set(removeZipCodes)
  const overlap = addZipCodes.find((zip) => removeZipSet.has(zip))
  if (overlap) {
    return NextResponse.json(
      { success: false, error: `ZIP cannot be both add and remove in the same request: ${overlap}` },
      { status: 400 }
    )
  }

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId).catch((error) => {
    console.error('Failed to load Clerk user for ZIP change request:', error)
    return null
  })
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unable to fetch user from Clerk' },
      { status: 502 }
    )
  }

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

  const snapshot = await getOrganizationSnapshotInConvex({ portalKey })
  const org = snapshot?.organization as Record<string, unknown> | undefined
  const existingTargetZipCodes = Array.isArray(org?.targetZipCodes)
    ? org.targetZipCodes.filter((zip): zip is string => typeof zip === 'string')
    : []

  const submitResult = await submitZipChangeRequestInConvex(
    {
      portalKey,
      requestedAddZipCodes: addZipCodes,
      requestedRemoveZipCodes: removeZipCodes,
      note,
      requestedBy: userId,
      requestedByEmail: email || undefined,
    },
    { throwOnError: true }
  ).catch((error) => {
    console.error('Failed to create ZIP change request in Convex:', cleanErrorMessage(error))
    return null
  })

  if (!submitResult) {
    return NextResponse.json(
      { success: false, error: 'Could not submit ZIP change request right now. Please try again.' },
      { status: 500 }
    )
  }

  if (!submitResult.submitted) {
    if (submitResult.reason === 'already_pending') {
      return NextResponse.json(
        { success: false, error: submitResult.message || 'A ZIP change request is already pending for this client.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: submitResult.message || 'Could not submit ZIP change request.' },
      { status: 400 }
    )
  }

  try {
    await sendPortalZipChangeRequestNotification({
      portalKey,
      actorType: 'client',
      actorLabel: email || userId,
      requestedAddZipCodes: submitResult.addedZipCodes || addZipCodes,
      requestedRemoveZipCodes: submitResult.removedZipCodes || removeZipCodes,
      existingTargetZipCodes,
      note: note ? `${note}\n\nRequest ID: ${submitResult.requestId}` : `Request ID: ${submitResult.requestId}`,
      requestedAt: submitResult.requestedAt || Date.now(),
    })
  } catch (error) {
    console.error('Failed to send portal ZIP change request notification:', error)
    return NextResponse.json(
      { success: false, error: 'Could not submit ZIP change request right now. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    portalKey,
    requestId: submitResult.requestId,
    requested: {
      addZipCodes: submitResult.addedZipCodes || addZipCodes,
      removeZipCodes: submitResult.removedZipCodes || removeZipCodes,
      note,
    },
    message: 'ZIP change request submitted. Support will review and confirm updates.',
  })
}
