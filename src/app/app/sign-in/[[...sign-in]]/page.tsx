import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { userId } = await auth()
  const params = (await searchParams) || {}
  const raw = params.redirect_url
  const redirectUrl = Array.isArray(raw) ? raw[0] : raw
  const rawTicket = params.ticket ?? params.__clerk_ticket
  const ticket = Array.isArray(rawTicket) ? rawTicket[0] : rawTicket
  const resolvedRedirectUrl =
    typeof redirectUrl === 'string' && redirectUrl.startsWith('/') ? redirectUrl : '/portal'
  const signUpUrl =
    typeof ticket === 'string' && ticket.trim()
      ? `/sign-up?ticket=${encodeURIComponent(ticket)}`
      : '/sign-up'

  // Prevent redirect loops when a signed-in user lands on /sign-in.
  if (userId) {
    redirect(resolvedRedirectUrl)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-10">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl={signUpUrl}
        forceRedirectUrl={resolvedRedirectUrl}
        fallbackRedirectUrl="/portal"
        signUpForceRedirectUrl={resolvedRedirectUrl}
        signUpFallbackRedirectUrl="/portal"
      />
    </main>
  )
}
