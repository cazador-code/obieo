import { NextRequest, NextResponse } from 'next/server'
import { cleanOptionalString } from '@/lib/airtable-client-mappers'
import { backfillPortalLeadHistoryFromAirtable } from '@/lib/airtable-lead-backfill'
import { syncAirtableBillingSnapshotFromConvex } from '@/lib/airtable-billing-sync'
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'

type ResyncPayload = {
  portalKey?: unknown
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await auditLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  let body: ResyncPayload
  try {
    body = (await request.json()) as ResyncPayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const portalKey = cleanOptionalString(typeof body.portalKey === 'string' ? body.portalKey : undefined)
  if (!portalKey) {
    return NextResponse.json({ success: false, error: 'portalKey is required' }, { status: 400 })
  }

  try {
    const airtableSyncState = await syncAirtableBillingSnapshotFromConvex({ portalKey })
    if (!airtableSyncState.ok) {
      return NextResponse.json(
        { success: false, error: airtableSyncState.error },
        { status: airtableSyncState.status }
      )
    }

    const organizationRecord = airtableSyncState.organizationRecord
    const organizationName = cleanOptionalString(
      typeof organizationRecord.name === 'string' ? organizationRecord.name : undefined
    )
    const leadBackfill = await backfillPortalLeadHistoryFromAirtable({
      portalKey,
      organizationName: organizationName || undefined,
    })
    const syncResult = airtableSyncState.syncResult

    if (!syncResult.synced) {
      return NextResponse.json(
        {
          success: false,
          error: syncResult.message || 'Failed to sync Airtable row.',
          reason: syncResult.reason,
        },
        { status: syncResult.reason === 'client_not_found' ? 404 : 502 }
      )
    }

    return NextResponse.json({
      success: true,
      portalKey,
      airtableRecordId: syncResult.airtableRecordId,
      updatedFields: syncResult.updatedFields || [],
      created: Boolean(syncResult.created),
      leadBackfill,
    })
  } catch (error) {
    console.error('Failed to resync Airtable client', { portalKey, error })
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error while resyncing Airtable client.',
        reason: 'internal_error',
      },
      { status: 500 }
    )
  }
}
