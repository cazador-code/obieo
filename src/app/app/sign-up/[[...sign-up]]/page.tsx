import { SignUp } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { buildAuthUrl, extractTicket, resolveRedirectUrl } from '../../auth/auth-redirect'

export const dynamic = 'force-dynamic'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { userId } = await auth()
  const params = (await searchParams) || {}
  const ticket = extractTicket(params)
  const resolvedRedirectUrl = resolveRedirectUrl(params.redirect_url)
  const signInUrl = buildAuthUrl('/sign-in', ticket)

  // Prevent redirect loops when a signed-in user lands on /sign-up.
  if (userId) {
    redirect(resolvedRedirectUrl)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-10">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl={signInUrl}
        forceRedirectUrl={resolvedRedirectUrl}
        fallbackRedirectUrl="/portal"
        signInForceRedirectUrl={resolvedRedirectUrl}
        signInFallbackRedirectUrl="/portal"
      />
    </main>
  )
}
