import 'server-only'

import {
  cleanOptionalString,
  resolveAirtableBillingState,
  resolveAirtableClientCity,
} from '@/lib/airtable-client-mappers'
import {
  syncPortalProfileToAirtable,
  type AirtableZipSyncResult,
} from '@/lib/airtable-client-zips'
import { getOrganizationSnapshotInConvex, type OrganizationSnapshotInConvex } from '@/lib/convex'
import type { BillingModel } from '@/lib/billing-models'

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

export async function syncAirtableBillingSnapshotFromConvex(input: {
  portalKey: string
  createIfMissing?: boolean
}): Promise<
  | {
      ok: true
      snapshot: OrganizationSnapshotInConvex
      organizationRecord: Record<string, unknown>
      syncResult: AirtableZipSyncResult
    }
  | {
      ok: false
      status: number
      error: string
    }
> {
  const snapshot = await getOrganizationSnapshotInConvex({ portalKey: input.portalKey })
  if (!snapshot) {
    return {
      ok: false,
      status: 502,
      error: 'Could not load organization snapshot from Convex.',
    }
  }

  const organizationRecord = getOrganizationRecord(snapshot.organization)
  if (!organizationRecord) {
    return {
      ok: false,
      status: 404,
      error: `Organization not found for portalKey: ${input.portalKey}`,
    }
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
  const leadCommitmentTotalRaw = organizationRecord.leadCommitmentTotal
  const leadCommitmentTotal =
    typeof leadCommitmentTotalRaw === 'number' && Number.isFinite(leadCommitmentTotalRaw)
      ? Math.floor(leadCommitmentTotalRaw)
      : undefined
  const prepaidLeadCreditsRaw = organizationRecord.prepaidLeadCredits
  const prepaidLeadCredits =
    typeof prepaidLeadCreditsRaw === 'number' && Number.isFinite(prepaidLeadCreditsRaw)
      ? Math.floor(prepaidLeadCreditsRaw)
      : undefined
  const initialChargeCentsRaw = organizationRecord.initialChargeCents
  const initialChargeCents =
    typeof initialChargeCentsRaw === 'number' && Number.isFinite(initialChargeCentsRaw)
      ? Math.floor(initialChargeCentsRaw)
      : undefined
  const leadChargeThresholdRaw = organizationRecord.leadChargeThreshold
  const leadChargeThreshold =
    typeof leadChargeThresholdRaw === 'number' && Number.isFinite(leadChargeThresholdRaw)
      ? Math.floor(leadChargeThresholdRaw)
      : undefined

  const billingState = resolveAirtableBillingState({
    billingModel,
    leadUnitPriceCents,
    prepaidLeadCredits,
    leadCommitmentTotal,
    initialChargeCents,
    leadChargeThreshold,
    billingEvents: snapshot.billingEvents,
    deliveredLeadCount: snapshot.leadCounts?.total ?? null,
  })

  const businessAddress = cleanOptionalString(
    typeof organizationRecord.businessAddress === 'string' ? organizationRecord.businessAddress : undefined
  )
  const clientCity = resolveAirtableClientCity({
    businessAddress,
    serviceAreas,
  })
  const leadNotificationPhone = cleanOptionalString(
    typeof organizationRecord.leadNotificationPhone === 'string'
      ? organizationRecord.leadNotificationPhone
      : undefined
  )
  const leadNotificationEmail = cleanOptionalString(
    typeof organizationRecord.leadNotificationEmail === 'string'
      ? organizationRecord.leadNotificationEmail
      : undefined
  )
  const leadProspectEmail = cleanOptionalString(
    typeof organizationRecord.leadProspectEmail === 'string' ? organizationRecord.leadProspectEmail : undefined
  )

  const syncResult = await syncPortalProfileToAirtable({
    portalKey: input.portalKey,
    organizationName,
    ...(organizationName ? { businessName: organizationName } : {}),
    ...(input.createIfMissing ? { createIfMissing: true } : {}),
    ...(targetZipCodes.length > 0 ? { targetZipCodes } : {}),
    ...(leadDeliveryPhones.length > 0 ? { leadDeliveryPhones } : {}),
    ...(leadNotificationPhone ? { leadNotificationPhone } : {}),
    ...(leadNotificationEmail ? { leadNotificationEmail } : {}),
    ...(leadProspectEmail ? { leadProspectEmail } : {}),
    ...(billingState.pricingTier ? { pricingTier: billingState.pricingTier } : {}),
    ...(billingState.billingTermsSummary ? { billingTermsSummary: billingState.billingTermsSummary } : {}),
    ...(typeof billingState.currentLeadCommitment === 'number'
      ? { currentLeadCommitment: billingState.currentLeadCommitment }
      : {}),
    ...(typeof billingState.remainingLeads === 'number'
      ? { remainingLeads: billingState.remainingLeads }
      : {}),
    ...(typeof billingState.packagePurchaseCount === 'number'
      ? { packagePurchaseCount: billingState.packagePurchaseCount }
      : {}),
    ...(typeof desiredLeadVolumeDaily === 'number' && desiredLeadVolumeDaily > 0
      ? { desiredLeadVolumeDaily }
      : {}),
    ...(serviceTypes.length > 0 ? { servicesOffered: serviceTypes } : {}),
    ...(clientCity ? { clientCity } : {}),
  })

  return {
    ok: true,
    snapshot,
    organizationRecord,
    syncResult,
  }
}
