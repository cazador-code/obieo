import { NextRequest, NextResponse } from 'next/server'
import { parseTargetZipCodes } from '@/lib/leadgen-target-zips'
import {
  createOrFindSmsCampaignJob,
  storeUploadedSmsCampaignSourceCsv,
} from '@/lib/sms-campaign-runner/repository'
import { SMS_CAMPAIGN_UPLOADED_SOURCE_PROFILE } from '@/lib/sms-campaign-runner/constants'
import type { SmsCampaignChunkStrategy } from '@/lib/sms-campaign-runner/types'

function isChunkStrategy(value: unknown): value is SmsCampaignChunkStrategy {
  return value === 'daily' || value === 'zip' || value === 'mixed'
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const targetZipCodes = readString(formData, 'targetZipCodes')
    const { zipCodes, invalidZipCodes } = parseTargetZipCodes(targetZipCodes)
    if (invalidZipCodes.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid ZIP codes: ${invalidZipCodes.join(', ')}` },
        { status: 400 },
      )
    }

    const uploadedSource = formData.get('sourceCsvFile')
    const sourceCsvPathValue = readString(formData, 'sourceCsvPath')
    let sourceCsvPath = sourceCsvPathValue
    let sourceType = 'duckdb'
    let sourceProfile = undefined as string | undefined

    if (uploadedSource instanceof File && uploadedSource.size > 0) {
      const storedUpload = storeUploadedSmsCampaignSourceCsv({
        fileName: uploadedSource.name,
        bytes: new Uint8Array(await uploadedSource.arrayBuffer()),
      })
      sourceCsvPath = storedUpload.sourceCsvPath
      sourceType = 'upload'
      sourceProfile = SMS_CAMPAIGN_UPLOADED_SOURCE_PROFILE
    }

    const chunkStrategyValue = readString(formData, 'chunkStrategy')
    const chunkStrategy = isChunkStrategy(chunkStrategyValue) ? chunkStrategyValue : 'daily'
    const chunkSizeOverrideValue = readString(formData, 'chunkSizeOverride').trim()
    const desiredLeadsPerDay = Number(readString(formData, 'desiredLeadsPerDay'))
    const textsPerLead = Number(readString(formData, 'textsPerLead'))

    const result = createOrFindSmsCampaignJob({
      clientName: readString(formData, 'clientName'),
      sourceCsvPath,
      sourceType,
      sourceProfile,
      desiredLeadsPerDay,
      textsPerLead,
      selectedZipCodes: zipCodes,
      chunkStrategy,
      chunkSizeOverride: chunkSizeOverrideValue === '' ? null : Number(chunkSizeOverrideValue),
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create campaign job.',
      },
      { status: 400 },
    )
  }
}
