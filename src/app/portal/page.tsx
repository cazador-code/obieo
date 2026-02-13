import Link from 'next/link'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import LeadTopUpCard from './LeadTopUpCard'
import { getLeadgenIntentByPortalKeyInConvex, getOrganizationSnapshotInConvex } from '@/lib/convex'

export default async function PortalPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in?redirect_url=/portal')
  }

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const portalKey =
    (typeof user.publicMetadata?.portalKey === 'string' && user.publicMetadata.portalKey.trim()) ||
    (typeof user.publicMetadata?.portal_key === 'string' && user.publicMetadata.portal_key.trim()) ||
    null
  if (!portalKey) {
    redirect('/sign-in?redirect_url=/portal')
  }

  const snapshot = await getOrganizationSnapshotInConvex({ portalKey })
  const org = snapshot?.organization as Record<string, unknown> | undefined
  const onboardingStatus = typeof org?.onboardingStatus === 'string' ? org.onboardingStatus : null
  if (onboardingStatus !== 'completed') {
    const intent = await getLeadgenIntentByPortalKeyInConvex({ portalKey })
    if (intent?.token) {
      redirect(`/leadgen/onboarding?token=${encodeURIComponent(intent.token)}`)
    }
  }

  let emailAddress = ''
  try {
    emailAddress = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress || ''
  } catch {
    emailAddress = ''
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Client Portal
        </h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          You are signed in{emailAddress ? ` as ${emailAddress}` : ''}.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Leads
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Lead feed wiring is in progress. This card will show delivered leads,
              timestamps, and lead status.
            </p>
          </section>

          <LeadTopUpCard />

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Lead Replacements
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Replacement requests will live here with policy checks for the
              15-minute contact and 7-day submission windows.
            </p>
          </section>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            Back to Obieo Home
          </Link>
        </div>
      </div>
    </main>
  )
}
