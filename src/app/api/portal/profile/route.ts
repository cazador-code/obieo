import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { updatePortalProfileInConvex } from '@/lib/convex'
import { syncPortalProfileToAirtable } from '@/lib/airtable-client-zips'
import { sendPortalProfileChangeNotification } from '@/lib/portal-profile-notifications'
import { normalizePortalEditableProfile } from '@/lib/portal-profile'
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'

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

export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await auditLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { profile?: unknown }
  try {
    body = (await request.json()) as { profile?: unknown }
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = normalizePortalEditableProfile(body.profile)
  if (!validation.ok) {
    return NextResponse.json(
      {
        success: false,
        error: validation.errors[0] || 'Invalid profile payload',
        errors: validation.errors,
      },
      { status: 400 }
    )
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

  const result = await updatePortalProfileInConvex({
    portalKey,
    profile: validation.profile,
    actorType: 'client',
    actorUserId: userId,
    actorEmail: email || undefined,
  })

  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Could not update profile right now. Please try again.' },
      { status: 500 }
    )
  }

  try {
    const airtableSync = await syncPortalProfileToAirtable({
      portalKey,
      targetZipCodes: result.profile.targetZipCodes,
      leadDeliveryPhones: result.profile.leadDeliveryPhones,
      leadNotificationPhone: result.profile.leadNotificationPhone ?? null,
      leadNotificationEmail: result.profile.leadNotificationEmail ?? null,
      leadProspectEmail: result.profile.leadProspectEmail ?? null,
    })
    if (!airtableSync.synced && airtableSync.reason !== 'not_configured') {
      console.error('Airtable profile sync failed after portal update:', airtableSync)
    }
  } catch (error) {
    console.error('Unexpected Airtable profile sync error after portal update:', error)
  }

  try {
    await sendPortalProfileChangeNotification({
      portalKey,
      actorType: 'client',
      actorLabel: email || userId,
      changedKeys: result.changedKeys,
      addedZipCodes: result.addedTargetZipCodes,
      removedZipCodes: result.removedTargetZipCodes,
      savedAt: result.savedAt,
    })
  } catch (error) {
    console.error('Failed to send portal profile change notification:', error)
  }

  return NextResponse.json({
    success: true,
    portalKey,
    savedAt: result.savedAt,
    profile: result.profile,
    audit: {
      editId: result.editId,
      changedKeys: result.changedKeys,
      addedZipCodes: result.addedTargetZipCodes,
      removedZipCodes: result.removedTargetZipCodes,
    },
  })
}
