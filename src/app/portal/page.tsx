import Link from 'next/link'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import LeadTopUpCard from './LeadTopUpCard'
import {
  getLeadgenIntentByBillingEmailInConvex,
  getLeadgenIntentByPortalKeyInConvex,
  getOrganizationSnapshotInConvex,
} from '@/lib/convex'
import { getStripeClient } from '@/lib/stripe'

export default async function PortalPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in?redirect_url=/portal')
  }

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const emailAddress =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    ''

  let portalKey =
    (typeof user.publicMetadata?.portalKey === 'string' && user.publicMetadata.portalKey.trim()) ||
    (typeof user.publicMetadata?.portal_key === 'string' && user.publicMetadata.portal_key.trim()) ||
    null

  // Self-heal: if the Clerk user is missing portalKey metadata (common if they created an account
  // before being invited), try mapping by billing email to a leadgen intent, then attach portalKey.
  if (!portalKey) {
    if (emailAddress) {
      const intent = await getLeadgenIntentByBillingEmailInConvex({ billingEmail: emailAddress })
      if (intent?.portalKey) {
        portalKey = intent.portalKey
        try {
          await clerk.users.updateUser(userId, {
            publicMetadata: {
              ...(user.publicMetadata || {}),
              portalKey,
            },
          })
        } catch (error) {
          console.warn('Failed to backfill Clerk portalKey metadata:', error)
        }
      }
    }
  }

  // Secondary self-heal path: map by Stripe customer metadata (works even if Convex isn't reachable).
  if (!portalKey && emailAddress) {
    const stripe = getStripeClient()
    if (stripe) {
      try {
        const list = await stripe.customers.list({ email: emailAddress, limit: 10 })
        const matched = list.data.find((customer) => customer.metadata?.portal_key)?.metadata?.portal_key?.trim()
        if (matched) {
          portalKey = matched
          try {
            await clerk.users.updateUser(userId, {
              publicMetadata: {
                ...(user.publicMetadata || {}),
                portalKey,
              },
            })
          } catch (error) {
            console.warn('Failed to backfill Clerk portalKey metadata from Stripe:', error)
          }
        }
      } catch (error) {
        console.warn('Failed to map portalKey from Stripe customer metadata:', error)
      }
    }
  }

  // If the user is signed in but still not linked, show a stable message instead of redirect looping.
  if (!portalKey) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Almost there</h1>
          <p className="mt-3 text-[var(--text-secondary)]">
            You&apos;re signed in{emailAddress ? ` as ${emailAddress}` : ''}, but your account isn&apos;t linked to a
            portal yet.
          </p>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            If you just accepted your invitation, wait a moment and refresh. Otherwise, open the original invitation
            email and click the button again, or reply to the payment email and we&apos;ll re-send the invite.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              Contact Support
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    )
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
