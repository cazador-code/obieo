import { NextRequest, NextResponse } from 'next/server'
import { enqueueSmsCampaignRun } from '@/lib/sms-campaign-runner/repository'
import type { SmsCampaignRunAction } from '@/lib/sms-campaign-runner/types'

function isRunAction(value: unknown): value is SmsCampaignRunAction {
  return value === 'extract_raw' || value === 'format_batches' || value === 'validate_lr_ready'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobKey: string }> },
) {
  try {
    const { jobKey } = await params
    const body = await request.json()
    if (!isRunAction(body.action)) {
      return NextResponse.json({ success: false, error: 'Invalid run action.' }, { status: 400 })
    }

    const result = enqueueSmsCampaignRun(jobKey, body.action)
    return NextResponse.json({
      success: true,
      alreadyRunning: result.alreadyRunning,
      run: result.run,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to queue run.',
      },
      { status: 400 },
    )
  }
}

