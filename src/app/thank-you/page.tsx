'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Section, Container, Button } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

export default function ThankYouPage() {
  useEffect(() => {
    // Fire Google Analytics conversion event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        event_category: 'Lead',
        event_label: 'GHL Booking',
        value: 1,
      })
    }

    // Fire Facebook Pixel events with retry for timing issues
    const firePixelEvents = () => {
      if (typeof window !== 'undefined' && window.fbq) {
        // Schedule event - specific to booking appointments
        window.fbq('track', 'Schedule', {
          content_name: 'Strategy Call Booking',
        })
        // Lead event - for general conversion tracking
        window.fbq('track', 'Lead', {
          content_name: 'GHL Booking',
        })
        return true
      }
      return false
    }

    // Try immediately, then retry up to 5 times with 500ms delay
    if (!firePixelEvents()) {
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        if (firePixelEvents() || attempts >= 5) {
          clearInterval(interval)
        }
      }, 500)
    }
  }, [])

  return (
    <Section size="lg" className="pt-32 min-h-screen flex items-center">
      <Container className="text-center">
        <FadeInSection>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            You&apos;re All Set!
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-4">
            Thanks for booking a call. I&apos;ll see you soon.
          </p>

          <p className="text-[var(--text-muted)] max-w-xl mx-auto mb-10">
            Check your email for a calendar invite with the meeting details.
            If you need to reschedule, you can do that from the email as well.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg">Back to Home</Button>
            </Link>
            <Link href="/work">
              <Button variant="outline" size="lg">
                See Our Work
              </Button>
            </Link>
          </div>
        </FadeInSection>
      </Container>
    </Section>
  )
}
