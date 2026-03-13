'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ActiveRunPollerProps {
  enabled: boolean
}

export default function ActiveRunPoller({ enabled }: ActiveRunPollerProps) {
  const router = useRouter()

  useEffect(() => {
    if (!enabled) return
    const interval = window.setInterval(() => {
      router.refresh()
    }, 3000)

    return () => window.clearInterval(interval)
  }, [enabled, router])

  return null
}

