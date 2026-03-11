import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import LeadgenOnboardingClient from './LeadgenOnboardingClient'

export const runtime = 'nodejs'

export default async function LeadgenOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { userId } = await auth()
  const params = await searchParams
  const tokenParam = params.token
  const token = typeof tokenParam === 'string' ? tokenParam : Array.isArray(tokenParam) ? tokenParam[0] : ''
  const ticketParam = params.ticket ?? params.__clerk_ticket
  const ticket = typeof ticketParam === 'string' ? ticketParam : Array.isArray(ticketParam) ? ticketParam[0] : ''

  if (!userId) {
    const onboardingSearchParams = new URLSearchParams()
    for (const [key, rawValue] of Object.entries(params)) {
      if (typeof rawValue === 'string') {
        onboardingSearchParams.set(key, rawValue)
        continue
      }
      if (Array.isArray(rawValue)) {
        for (const value of rawValue) {
          onboardingSearchParams.append(key, value)
        }
      }
    }
    const redirectUrl = onboardingSearchParams.size > 0 ? `/onboarding?${onboardingSearchParams.toString()}` : '/onboarding'
    const authSearchParams = new URLSearchParams()
    authSearchParams.set('redirect_url', redirectUrl)
    if (ticket) authSearchParams.set('ticket', ticket)
    redirect(`/${ticket ? 'sign-up' : 'sign-in'}?${authSearchParams.toString()}`)
  }

  if (!token) {
    redirect('/portal')
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <LeadgenOnboardingClient token={token} />
      </div>
    </main>
  )
}
