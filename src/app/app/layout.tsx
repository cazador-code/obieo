import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/nextjs'
import Link from 'next/link'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ThemeProvider>
          <header className="border-b border-[var(--border)] bg-[var(--bg-card)]">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
              <Link
                href="/"
                className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]"
              >
                Obieo
              </Link>
              <div className="flex items-center gap-3">
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </div>
    </ClerkProvider>
  )
}
