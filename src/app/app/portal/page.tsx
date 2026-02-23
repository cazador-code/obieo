import Link from 'next/link'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import LeadTopUpCard from './LeadTopUpCard'
import {
  getLeadgenIntentByBillingEmailInConvex,
  getLeadgenIntentByPortalKeyInConvex,
  getOrganizationSnapshotInConvex,
  type LeadEventSnapshot,
} from '@/lib/convex'
import { resolveInternalPortalPreviewToken } from '@/lib/internal-portal-preview'
import { getStripeClient } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>

function getFirstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

const leadDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatLeadTimestamp(timestampMs: number): string {
  return leadDateFormatter.format(new Date(timestampMs))
}

function formatLeadSummary(lead: LeadEventSnapshot): string {
  const pieces = [lead.name || '', lead.city || '', lead.state || ''].filter(Boolean)
  return pieces.length > 0 ? pieces.join(' - ') : lead.sourceExternalId
}

export default async function PortalPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const params = (await searchParams) || {}
  const previewToken = getFirstParam(params.preview_token).trim()
  const resumeOnboarding = getFirstParam(params.resume_onboarding).trim() === '1'
  const previewPortalKey = previewToken ? await resolveInternalPortalPreviewToken(previewToken) : null
  const isPreviewRequest = Boolean(previewToken)
  const isPreviewMode = Boolean(previewPortalKey)

  const { userId } = await auth()
  if (isPreviewRequest && !isPreviewMode) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Preview Link Expired</h1>
          <p className="mt-3 text-[var(--text-secondary)]">
            This internal preview link is invalid or expired. Open the client dashboard and click
            <span className="font-semibold"> View Client Portal </span>
            again to generate a fresh link.
          </p>
          <div className="mt-6">
            <Link
              href="/internal/clients"
              className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              Back to Clients Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!userId && !isPreviewMode) {
    redirect('/sign-in?redirect_url=/portal')
  }

  const clerk = await clerkClient()
  let emailAddress = ''
  let portalKey: string | null = previewPortalKey
  let userPublicMetadata: Record<string, unknown> | null = null

  if (userId) {
    const user = await clerk.users.getUser(userId)
    userPublicMetadata = (user.publicMetadata as Record<string, unknown> | null) || null
    emailAddress =
      user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ||
      user.emailAddresses[0]?.emailAddress ||
      ''

    if (!portalKey) {
      portalKey =
        (typeof userPublicMetadata?.portalKey === 'string' && userPublicMetadata.portalKey.trim()) ||
        (typeof userPublicMetadata?.portal_key === 'string' && userPublicMetadata.portal_key.trim()) ||
        null

      // Self-heal: if the Clerk user is missing portalKey metadata (common if they created an account
      // before being invited), try mapping by billing email to a leadgen intent, then attach portalKey.
      if (!portalKey && emailAddress) {
        const intent = await getLeadgenIntentByBillingEmailInConvex({ billingEmail: emailAddress })
        if (intent?.portalKey) {
          portalKey = intent.portalKey
          try {
            await clerk.users.updateUser(userId, {
              publicMetadata: {
                ...(userPublicMetadata || {}),
                portalKey,
              },
            })
          } catch (error) {
            console.warn('Failed to backfill Clerk portalKey metadata:', error)
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
                    ...(userPublicMetadata || {}),
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
            <a
              href="https://www.obieo.com/contact"
              className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              Contact Support
            </a>
            <a
              href="https://www.obieo.com"
              className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    )
  }

  const snapshot = await getOrganizationSnapshotInConvex({ portalKey })
  const org = snapshot?.organization as Record<string, unknown> | undefined
  const leadCounts = snapshot?.leadCounts || { total: 0, usageRecorded: 0, unbilled: 0 }
  const recentLeadEvents = snapshot?.recentLeadEvents || []
  const onboardingStatus = typeof org?.onboardingStatus === 'string' ? org.onboardingStatus : null
  let onboardingIntentToken: string | null = null
  if (onboardingStatus !== 'completed') {
    const intent = await getLeadgenIntentByPortalKeyInConvex({ portalKey })
    onboardingIntentToken = intent?.token || null
    if (intent?.token) {
      if (!resumeOnboarding) {
        redirect(`/onboarding?token=${encodeURIComponent(intent.token)}`)
      }
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Client Portal
        </h1>
        {isPreviewMode ? (
          <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            Internal preview mode. You are viewing this portal as <code>{portalKey}</code>.
          </p>
        ) : (
          <p className="mt-3 text-[var(--text-secondary)]">
            You are signed in{emailAddress ? ` as ${emailAddress}` : ''}.
          </p>
        )}

        {onboardingStatus !== 'completed' && onboardingIntentToken ? (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">Setup paused</p>
            <p className="mt-1 text-sm text-amber-800">
              Your onboarding draft is saved. Click below whenever you&apos;re ready to finish setup.
            </p>
            <div className="mt-3">
              <Link
                href={`/onboarding?token=${encodeURIComponent(onboardingIntentToken)}`}
                className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white hover:bg-[var(--accent-hover)]"
              >
                Finish Setup
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Leads
            </h2>
            <dl className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Total</dt>
                <dd className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{leadCounts.total}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Billed</dt>
                <dd className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{leadCounts.usageRecorded}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Unbilled</dt>
                <dd className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{leadCounts.unbilled}</dd>
              </div>
            </dl>
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

        <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Leads</h2>
          {recentLeadEvents.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              No leads yet. New leads will appear here automatically as they are delivered.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              {recentLeadEvents.slice(0, 25).map((lead) => (
                <li key={lead._id} className="px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{formatLeadSummary(lead)}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {lead.source.toUpperCase()} - {lead.sourceExternalId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                        {lead.status}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                        Qty {lead.quantity}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {formatLeadTimestamp(lead.deliveredAt || lead.createdAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-8">
          <a
            href="https://www.obieo.com"
            className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            Back to Obieo Home
          </a>
        </div>
      </div>
    </main>
  )
}
