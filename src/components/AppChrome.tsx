'use client'

import { ReactNode } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CustomCursor } from '@/components/CustomCursor'
import { BookingModal } from '@/components/BookingModal'

interface AppChromeProps {
  children: ReactNode
}

export default function AppChrome({ children }: AppChromeProps) {
  return (
    <>
      <div className="fixed right-4 top-4 z-[70] hidden md:flex">
        <a
          href="https://app.obieo.com"
          className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] shadow-sm hover:text-[var(--text-primary)] transition-colors"
        >
          Client Login
        </a>
      </div>
      <SmoothScroll>
        <CustomCursor />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </SmoothScroll>
      <BookingModal />
    </>
  )
}
