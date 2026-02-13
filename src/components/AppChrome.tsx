'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CustomCursor } from '@/components/CustomCursor'
import { BookingModal } from '@/components/BookingModal'

interface AppChromeProps {
  children: ReactNode
}

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname()
  const isInternalRoute = pathname.startsWith('/internal')

  if (isInternalRoute) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <>
      <div className="fixed right-4 top-4 z-[70] hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 shadow-sm md:flex">
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
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
