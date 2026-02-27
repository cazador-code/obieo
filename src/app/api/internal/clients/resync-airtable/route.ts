import { NextRequest, NextResponse } from 'next/server'
import type { BillingModel } from '@/lib/billing-models'
import {
  resolveAirtableClientCity,
  resolveAirtablePricingTier,
  cleanOptionalString,
} from '@/lib/airtable-client-mappers'
import { syncPortalProfileToAirtable } from '@/lib/airtable-client-zips'
import { getOrganizationSnapshotInConvex } from '@/lib/convex'

export const runtime = 'nodejs'

type ResyncPayload = {
  portalKey?: unknown
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
}

function toBillingModel(value: unknown): BillingModel | undefined {
  if (
    value === 'package_40_paid_in_full' ||
    value === 'commitment_40_with_10_upfront' ||
    value === 'pay_per_lead_perpetual' ||
    value === 'pay_per_lead_40_first_lead'
  ) {
    return value
  }
  return undefined
}

function getOrganizationRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export async function POST(request: NextRequest) {
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

  const snapshot = await getOrganizationSnapshotInConvex({ portalKey })
  if (!snapshot) {
    return NextResponse.json(
      { success: false, error: 'Could not load organization snapshot from Convex.' },
      { status: 502 }
    )
  }

  const organizationRecord = getOrganizationRecord(snapshot.organization)
  if (!organizationRecord) {
    return NextResponse.json(
      { success: false, error: `Organization not found for portalKey: ${portalKey}` },
      { status: 404 }
    )
  }

  const organizationName = cleanOptionalString(
    typeof organizationRecord.name === 'string' ? organizationRecord.name : undefined
  )
  const targetZipCodes = normalizeStringArray(organizationRecord.targetZipCodes)
  const leadDeliveryPhones = normalizeStringArray(organizationRecord.leadDeliveryPhones)
  const serviceTypes = normalizeStringArray(organizationRecord.serviceTypes)
  const serviceAreas = normalizeStringArray(organizationRecord.serviceAreas)
  const leadUnitPriceCentsRaw = organizationRecord.leadUnitPriceCents
  const leadUnitPriceCents =
    typeof leadUnitPriceCentsRaw === 'number' && Number.isFinite(leadUnitPriceCentsRaw)
      ? Math.floor(leadUnitPriceCentsRaw)
      : 4000
  const desiredLeadVolumeDailyRaw = organizationRecord.desiredLeadVolumeDaily
  const desiredLeadVolumeDaily =
    typeof desiredLeadVolumeDailyRaw === 'number' && Number.isFinite(desiredLeadVolumeDailyRaw)
      ? Math.floor(desiredLeadVolumeDailyRaw)
      : undefined
  const billingModel = toBillingModel(organizationRecord.billingModel)
  const pricingTier = resolveAirtablePricingTier({ billingModel, leadUnitPriceCents })
  const clientCity = resolveAirtableClientCity({
    businessAddress: cleanOptionalString(
      typeof organizationRecord.businessAddress === 'string' ? organizationRecord.businessAddress : undefined
    ),
    serviceAreas,
  })

  const syncResult = await syncPortalProfileToAirtable({
    portalKey,
    organizationName,
    ...(organizationName ? { businessName: organizationName } : {}),
    ...(targetZipCodes.length > 0 ? { targetZipCodes } : {}),
    ...(leadDeliveryPhones.length > 0 ? { leadDeliveryPhones } : {}),
    ...(cleanOptionalString(
      typeof organizationRecord.leadNotificationPhone === 'string'
        ? organizationRecord.leadNotificationPhone
        : undefined
    )
      ? {
          leadNotificationPhone: cleanOptionalString(
            typeof organizationRecord.leadNotificationPhone === 'string'
              ? organizationRecord.leadNotificationPhone
              : undefined
          ),
        }
      : {}),
    ...(cleanOptionalString(
      typeof organizationRecord.leadNotificationEmail === 'string'
        ? organizationRecord.leadNotificationEmail
        : undefined
    )
      ? {
          leadNotificationEmail: cleanOptionalString(
            typeof organizationRecord.leadNotificationEmail === 'string'
              ? organizationRecord.leadNotificationEmail
              : undefined
          ),
        }
      : {}),
    ...(cleanOptionalString(
      typeof organizationRecord.leadProspectEmail === 'string' ? organizationRecord.leadProspectEmail : undefined
    )
      ? {
          leadProspectEmail: cleanOptionalString(
            typeof organizationRecord.leadProspectEmail === 'string'
              ? organizationRecord.leadProspectEmail
              : undefined
          ),
        }
      : {}),
    ...(pricingTier ? { pricingTier } : {}),
    ...(typeof desiredLeadVolumeDaily === 'number' && desiredLeadVolumeDaily > 0
      ? { desiredLeadVolumeDaily }
      : {}),
    ...(serviceTypes.length > 0 ? { servicesOffered: serviceTypes } : {}),
    ...(clientCity ? { clientCity } : {}),
  })

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
  })
}
