import { NextRequest, NextResponse } from 'next/server'
import {
  getOrganizationSnapshotInConvex,
  getZipChangeRequestForOpsInConvex,
  resolveZipChangeRequestInConvex,
  submitZipChangeRequestInConvex,
} from '@/lib/convex'
import { checkAirtableZipConflictsForApproval, syncApprovedZipCodesToAirtable } from '@/lib/airtable-client-zips'

export const runtime = 'nodejs'

type ResolveZipChangePayload = {
  requestId?: unknown
  decision?: unknown
  resolutionNotes?: unknown
  resolvedBy?: unknown
  portalKey?: unknown
  addZipCodes?: unknown
  removeZipCodes?: unknown
  note?: unknown
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

async function parseRequestBody(request: NextRequest): Promise<ResolveZipChangePayload | null> {
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    try {
      return (await request.json()) as ResolveZipChangePayload
    } catch {
      return null
    }
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    try {
      const formData = await request.formData()
      return {
        requestId: formData.get('requestId'),
        decision: formData.get('decision'),
        resolutionNotes: formData.get('resolutionNotes'),
        resolvedBy: formData.get('resolvedBy'),
        portalKey: formData.get('portalKey'),
        addZipCodes: formData.get('addZipCodes'),
        removeZipCodes: formData.get('removeZipCodes'),
        note: formData.get('note'),
      }
    } catch {
      return null
    }
  }

  return null
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => cleanString(entry))
      .filter((entry): entry is string => Boolean(entry))
  }

  if (typeof value === 'string') {
    return value
      .split(/[\s,;]+/g)
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  return []
}

export async function POST(request: NextRequest) {
  const body = await parseRequestBody(request)
  if (!body) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  let requestId = cleanString(body.requestId)
  if (!requestId) {
    const portalKey = cleanString(body.portalKey)
    const addZipCodes = normalizeStringArray(body.addZipCodes)
    const removeZipCodes = normalizeStringArray(body.removeZipCodes)

    if (!portalKey || (addZipCodes.length === 0 && removeZipCodes.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'requestId is required, or provide portalKey plus addZipCodes/removeZipCodes.',
        },
        { status: 400 }
      )
    }

    const created = await submitZipChangeRequestInConvex({
      portalKey,
      requestedAddZipCodes: addZipCodes,
      requestedRemoveZipCodes: removeZipCodes,
      note: cleanString(body.note) || undefined,
      requestedBy: cleanString(body.resolvedBy) || 'internal_owner',
    })

    if (!created) {
      return NextResponse.json(
        { success: false, error: 'Could not create ZIP request for approval.' },
        { status: 500 }
      )
    }

    if (!created.submitted && created.reason !== 'already_pending') {
      return NextResponse.json(
        { success: false, error: created.message || 'Could not create ZIP request for approval.' },
        { status: 400 }
      )
    }

    requestId = created.requestId || created.existingRequestId || null
    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Could not resolve a pending request ID for this portal.' },
        { status: 500 }
      )
    }
  }

  const decision = cleanString(body.decision)
  if (decision !== 'approve' && decision !== 'reject') {
    return NextResponse.json(
      { success: false, error: "decision must be 'approve' or 'reject'" },
      { status: 400 }
    )
  }

  const zipRequest = await getZipChangeRequestForOpsInConvex({ requestId })
  if (!zipRequest) {
    return NextResponse.json({ success: false, error: 'ZIP change request not found.' }, { status: 404 })
  }

  if (zipRequest.status !== 'pending') {
    return NextResponse.json(
      { success: false, error: `ZIP request is already ${zipRequest.status}.` },
      { status: 409 }
    )
  }

  const snapshot = await getOrganizationSnapshotInConvex({ portalKey: zipRequest.portalKey })
  const orgName =
    snapshot?.organization && typeof snapshot.organization.name === 'string'
      ? snapshot.organization.name
      : undefined

  if (decision === 'approve') {
    const conflictCheck = await checkAirtableZipConflictsForApproval({
      portalKey: zipRequest.portalKey,
      organizationName: orgName,
      requestedAddZipCodes: zipRequest.addedZipCodes,
    })

    if (!conflictCheck.checked) {
      return NextResponse.json(
        {
          success: false,
          error:
            conflictCheck.message ||
            'Airtable conflict check could not run. Configure Airtable settings before approving.',
          reason: conflictCheck.reason,
        },
        { status: 503 }
      )
    }

    if (conflictCheck.conflicts.length > 0) {
      const zipList = Array.from(new Set(conflictCheck.conflicts.map((item) => item.zipCode))).sort()
      const sample = conflictCheck.conflicts.slice(0, 8).map((item) => ({
        zipCode: item.zipCode,
        businessName: item.businessName,
        status: item.status,
      }))

      return NextResponse.json(
        {
          success: false,
          error: `Conflict detected: ${zipList.join(', ')} already assigned to active clients.`,
          reason: 'zip_conflict',
          conflictingZipCodes: zipList,
          conflicts: sample,
          conflictCount: conflictCheck.conflicts.length,
        },
        { status: 409 }
      )
    }
  }

  const resolvedBy = cleanString(body.resolvedBy) || 'internal_owner'
  const resolutionNotes = cleanString(body.resolutionNotes) || undefined

  const resolveResult = await resolveZipChangeRequestInConvex(
    {
      requestId,
      decision,
      resolvedBy,
      resolutionNotes,
    },
    { throwOnError: true }
  ).catch((error) => {
    console.error('Failed to resolve ZIP change request in Convex:', error)
    return null
  })

  if (!resolveResult) {
    return NextResponse.json(
      { success: false, error: 'Could not resolve ZIP change request in Convex.' },
      { status: 500 }
    )
  }

  if (!resolveResult.updated) {
    return NextResponse.json(
      { success: false, error: resolveResult.message || 'Request could not be resolved.' },
      { status: 409 }
    )
  }

  if (decision === 'approve') {
    const syncResult = await syncApprovedZipCodesToAirtable({
      portalKey: zipRequest.portalKey,
      organizationName: orgName,
      targetZipCodes: resolveResult.requestedZipCodes || zipRequest.requestedZipCodes,
    })

    if (!syncResult.synced) {
      return NextResponse.json(
        {
          success: false,
          error:
            syncResult.message ||
            'Approved in Convex, but failed to sync target ZIPs into Airtable client table.',
          reason: syncResult.reason,
          approvedInConvex: true,
          requestId,
          portalKey: zipRequest.portalKey,
          targetZipCodes: resolveResult.requestedZipCodes || zipRequest.requestedZipCodes,
        },
        { status: 502 }
      )
    }
  }

  return NextResponse.json({
    success: true,
    requestId,
    portalKey: zipRequest.portalKey,
    decision,
    resolvedBy,
    targetZipCodes: resolveResult.requestedZipCodes || zipRequest.requestedZipCodes,
    addedZipCodes: resolveResult.addedZipCodes || zipRequest.addedZipCodes,
    removedZipCodes: resolveResult.removedZipCodes || zipRequest.removedZipCodes,
  })
}
