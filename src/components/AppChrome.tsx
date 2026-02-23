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

function PortalMenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5 10 4l7 5.5V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1V9.5Z" />
    </svg>
  )
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
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action label="manageAccount" />
              <UserButton.Link
                label="Portal"
                href="/portal"
                labelIcon={<PortalMenuIcon />}
              />
              <UserButton.Action label="signOut" />
            </UserButton.MenuItems>
          </UserButton>
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
