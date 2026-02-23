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

  if (!userId) {
    const redirectUrl = token ? `/onboarding?token=${encodeURIComponent(token)}` : '/onboarding'
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`)
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
