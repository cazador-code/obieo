'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SMS_CAMPAIGN_DEFAULT_FORM } from './defaults'
import type { SmsCampaignChunkStrategy } from '@/lib/sms-campaign-runner/types'

interface CreateSmsCampaignJobFormProps {
  defaultSourceCsvPath: string
}

export default function CreateSmsCampaignJobForm({
  defaultSourceCsvPath,
}: CreateSmsCampaignJobFormProps) {
  const router = useRouter()
  const [clientName, setClientName] = useState('')
  const [targetZipCodes, setTargetZipCodes] = useState('')
  const [desiredLeadsPerDay, setDesiredLeadsPerDay] = useState(String(SMS_CAMPAIGN_DEFAULT_FORM.desiredLeadsPerDay))
  const [textsPerLead, setTextsPerLead] = useState(String(SMS_CAMPAIGN_DEFAULT_FORM.textsPerLead))
  const [sourceCsvPath, setSourceCsvPath] = useState(defaultSourceCsvPath)
  const [chunkStrategy, setChunkStrategy] = useState<SmsCampaignChunkStrategy>('daily')
  const [chunkSizeOverride, setChunkSizeOverride] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const targetContacts = useMemo(() => {
    const leads = Number(desiredLeadsPerDay)
    const texts = Number(textsPerLead)
    if (!Number.isFinite(leads) || !Number.isFinite(texts) || leads <= 0 || texts <= 0) {
      return null
    }
    return leads * texts
  }, [desiredLeadsPerDay, textsPerLead])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/internal/sms-campaigns/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          targetZipCodes,
          desiredLeadsPerDay: Number(desiredLeadsPerDay),
          textsPerLead: Number(textsPerLead),
          sourceCsvPath,
          chunkStrategy,
          chunkSizeOverride: chunkSizeOverride.trim() ? Number(chunkSizeOverride) : null,
        }),
      })
      const data = (await response.json()) as { success: boolean; error?: string; jobKey?: string }
      if (!response.ok || !data.success || !data.jobKey) {
        throw new Error(data.error || 'Failed to create campaign job.')
      }
      router.push(`/internal/sms-campaigns/${data.jobKey}`)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create campaign job.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <Input
        label="Client Name"
        value={clientName}
        onChange={(event) => setClientName(event.target.value)}
        placeholder="FLT Enterprises"
        required
      />
      <Input
        label="Source CSV Path"
        value={sourceCsvPath}
        onChange={(event) => setSourceCsvPath(event.target.value)}
        placeholder="/Users/hunterlapeyre/Downloads/merged.csv"
        required
      />
      <div className="flex flex-col gap-1.5 lg:col-span-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">Target ZIP Codes</label>
        <textarea
          value={targetZipCodes}
          onChange={(event) => setTargetZipCodes(event.target.value)}
          rows={4}
          placeholder="77001, 77002, 77003"
          className="min-h-[120px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        />
        <p className="text-xs text-[var(--text-muted)]">Comma or newline separated. All ZIPs are stored as selected ZIPs in V1.</p>
      </div>
      <Input
        label="Desired Leads / Day"
        type="number"
        min={1}
        value={desiredLeadsPerDay}
        onChange={(event) => setDesiredLeadsPerDay(event.target.value)}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-primary)]">Texts / Lead</label>
        <select
          value={textsPerLead}
          onChange={(event) => setTextsPerLead(event.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="500">500</option>
          <option value="750">750</option>
          <option value="1000">1000</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-primary)]">Chunk Strategy</label>
        <select
          value={chunkStrategy}
          onChange={(event) => setChunkStrategy(event.target.value as SmsCampaignChunkStrategy)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="daily">One file per day</option>
          <option value="zip">One file per ZIP</option>
          <option value="mixed">Mixed strategy</option>
        </select>
      </div>
      <Input
        label="Chunk Size Override"
        type="number"
        min={1}
        max={15000}
        value={chunkSizeOverride}
        onChange={(event) => setChunkSizeOverride(event.target.value)}
        placeholder="Optional"
      />
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)] lg:col-span-2">
        <div className="font-semibold text-[var(--text-primary)]">Pre-export plan snapshot</div>
        <div className="mt-2">Target contacts/day: {targetContacts?.toLocaleString() || 'N/A'}</div>
        <div>Planned proven status after creation: `planned`</div>
      </div>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:col-span-2">
          {error}
        </div>
      ) : null}
      <div className="lg:col-span-2">
        <Button type="submit" magnetic={false} disabled={submitting}>
          {submitting ? 'Creating job...' : 'Create job'}
        </Button>
      </div>
    </form>
  )
}

