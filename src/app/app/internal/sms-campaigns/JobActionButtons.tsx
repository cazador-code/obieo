'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import type { SmsCampaignRunAction } from '@/lib/sms-campaign-runner/types'

interface JobActionButtonsProps {
  jobKey: string
  activeRunAction: string | null
  canFormat: boolean
  canValidate: boolean
}

export default function JobActionButtons({
  jobKey,
  activeRunAction,
  canFormat,
  canValidate,
}: JobActionButtonsProps) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<SmsCampaignRunAction | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function trigger(action: SmsCampaignRunAction) {
    setLoadingAction(action)
    setError(null)
    try {
      const response = await fetch(`/api/internal/sms-campaigns/${jobKey}/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = (await response.json()) as { success: boolean; error?: string }
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to queue run.')
      }
      router.refresh()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to queue run.')
    } finally {
      setLoadingAction(null)
    }
  }

  const disabled = Boolean(activeRunAction) || Boolean(loadingAction)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button
          magnetic={false}
          onClick={() => trigger('extract_raw')}
          disabled={disabled}
        >
          {loadingAction === 'extract_raw' ? 'Queueing extraction...' : 'Run extraction'}
        </Button>
        <Button
          magnetic={false}
          variant="secondary"
          onClick={() => trigger('format_batches')}
          disabled={disabled || !canFormat}
        >
          {loadingAction === 'format_batches' ? 'Queueing format...' : 'Format batches'}
        </Button>
        <Button
          magnetic={false}
          variant="outline"
          onClick={() => trigger('validate_lr_ready')}
          disabled={disabled || !canValidate}
        >
          {loadingAction === 'validate_lr_ready' ? 'Queueing validation...' : 'Validate LR-ready'}
        </Button>
      </div>
      {activeRunAction ? (
        <p className="text-sm text-[var(--text-secondary)]">
          Current run in progress: <span className="font-semibold text-[var(--text-primary)]">{activeRunAction}</span>
        </p>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  )
}

