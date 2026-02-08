'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui'

const BOOKING_SOURCE = 'automate-with-obieo'
const GHL_TAG = 'lp-automate-with-obieo'

function buildCallHref(searchParams: ReturnType<typeof useSearchParams>): string {
  const params = new URLSearchParams(searchParams?.toString() || '')

  // Preserve whatever the ad platform sent, and add our own routing + tagging.
  params.set('source', BOOKING_SOURCE)
  params.set('ghl_tag', GHL_TAG)

  // If the visitor doesn't have a campaign param, set a stable default.
  if (!params.get('utm_campaign')) params.set('utm_campaign', BOOKING_SOURCE)

  return `/call?${params.toString()}`
}

export function AutomateCtas({ className = '' }: { className?: string }) {
  const searchParams = useSearchParams()
  const href = buildCallHref(searchParams)

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${className}`}>
      <Link href={href} className="w-full sm:w-auto">
        <Button size="lg" className="w-full sm:w-auto">
          Book a Call
        </Button>
      </Link>
      <Link href="/work" className="w-full sm:w-auto">
        <Button variant="outline" size="lg" className="w-full sm:w-auto">
          See Examples
        </Button>
      </Link>
    </div>
  )
}

export const automateGhlTag = GHL_TAG
export const automateBookingSource = BOOKING_SOURCE

