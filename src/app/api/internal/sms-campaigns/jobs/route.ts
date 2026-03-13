import { NextRequest, NextResponse } from 'next/server'
import { parseTargetZipCodes } from '@/lib/leadgen-target-zips'
import { createOrFindSmsCampaignJob } from '@/lib/sms-campaign-runner/repository'
import type { SmsCampaignChunkStrategy } from '@/lib/sms-campaign-runner/types'

function isChunkStrategy(value: unknown): value is SmsCampaignChunkStrategy {
  return value === 'daily' || value === 'zip' || value === 'mixed'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { zipCodes, invalidZipCodes } = parseTargetZipCodes(body.targetZipCodes)
    if (invalidZipCodes.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid ZIP codes: ${invalidZipCodes.join(', ')}` },
        { status: 400 },
      )
    }

    const chunkStrategy = isChunkStrategy(body.chunkStrategy) ? body.chunkStrategy : 'daily'
    const result = createOrFindSmsCampaignJob({
      clientName: typeof body.clientName === 'string' ? body.clientName : '',
      sourceCsvPath: typeof body.sourceCsvPath === 'string' ? body.sourceCsvPath : '',
      desiredLeadsPerDay: Number(body.desiredLeadsPerDay),
      textsPerLead: Number(body.textsPerLead),
      selectedZipCodes: zipCodes,
      chunkStrategy,
      chunkSizeOverride: body.chunkSizeOverride == null || body.chunkSizeOverride === ''
        ? null
        : Number(body.chunkSizeOverride),
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

