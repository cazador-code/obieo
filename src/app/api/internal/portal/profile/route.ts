import { NextRequest, NextResponse } from 'next/server'
import { updatePortalProfileInConvex } from '@/lib/convex'
import { syncPortalProfileToAirtable } from '@/lib/airtable-client-zips'
import { resolveInternalPortalPreviewToken } from '@/lib/internal-portal-preview'
import { sendPortalProfileChangeNotification } from '@/lib/portal-profile-notifications'
import { normalizePortalEditableProfile } from '@/lib/portal-profile'
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  return cleaned.length > 0 ? cleaned : null
}

function getBasicAuthUser(request: NextRequest): string | undefined {
  const header = request.headers.get('authorization') || ''
  if (!header.startsWith('Basic ')) return undefined

  const encoded = header.slice(6)
  let decoded = ''
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8')
  } catch {
    return undefined
  }

  const idx = decoded.indexOf(':')
  if (idx < 0) return undefined
  const user = decoded.slice(0, idx).trim()
  return user || undefined
}

export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await auditLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  let body: { previewToken?: unknown; profile?: unknown }
  try {
    body = (await request.json()) as { previewToken?: unknown; profile?: unknown }
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const previewToken = normalizeString(body.previewToken)
  if (!previewToken) {
    return NextResponse.json({ success: false, error: 'Missing preview token' }, { status: 400 })
  }

  const portalKey = await resolveInternalPortalPreviewToken(previewToken)
  if (!portalKey) {
    return NextResponse.json({ success: false, error: 'Invalid or expired preview token' }, { status: 403 })
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

  const internalUser = getBasicAuthUser(request)

  const result = await updatePortalProfileInConvex({
    portalKey,
    profile: validation.profile,
    actorType: 'admin_preview',
    actorInternalUser: internalUser,
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
      console.error('Airtable profile sync failed after internal portal update:', airtableSync)
    }
  } catch (error) {
    console.error('Unexpected Airtable profile sync error after internal portal update:', error)
  }

  try {
    await sendPortalProfileChangeNotification({
      portalKey,
      actorType: 'admin_preview',
      actorLabel: internalUser || 'internal_admin',
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
