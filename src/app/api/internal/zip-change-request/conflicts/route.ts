import { NextRequest, NextResponse } from 'next/server'
import { checkAirtableZipConflictsForApproval } from '@/lib/airtable-client-zips'
import { getOrganizationSnapshotInConvex, getZipChangeRequestForOpsInConvex } from '@/lib/convex'
import { auditLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'

type CheckZipConflictPayload = {
  requestId?: unknown
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

async function parseRequestBody(request: NextRequest): Promise<CheckZipConflictPayload | null> {
  try {
    return (await request.json()) as CheckZipConflictPayload
  } catch {
    return null
  }
}

function hasJsonContentType(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type') || ''
  return contentType.toLowerCase().includes('application/json')
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success, remaining } = await auditLimiter.limit(ip)
  if (!success) {
    return rateLimitResponse(remaining)
  }

  if (!hasJsonContentType(request)) {
    return NextResponse.json(
      { success: false, error: 'Unsupported Media Type: application/json required.' },
      { status: 415 }
    )
  }

  const body = await parseRequestBody(request)
  if (!body) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const requestId = cleanString(body.requestId)
  if (!requestId) {
    return NextResponse.json({ success: false, error: 'requestId is required.' }, { status: 400 })
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

  const conflicts = conflictCheck.conflicts
  const conflictingZipCodes = Array.from(new Set(conflicts.map((item) => item.zipCode))).sort()

  return NextResponse.json({
    success: true,
    requestId,
    portalKey: zipRequest.portalKey,
    checkedAt: Date.now(),
    conflict: conflictingZipCodes.length > 0,
    conflictingZipCodes,
    conflicts: conflicts.slice(0, 20),
    conflictCount: conflicts.length,
  })
}
