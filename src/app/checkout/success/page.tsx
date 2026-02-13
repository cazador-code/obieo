import Link from 'next/link'
import { ActivateFromStripeSession } from './success_client'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = (await searchParams) || {}
  const raw = params.session_id
  const sessionId = Array.isArray(raw) ? raw[0] : raw

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/95 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payment received</h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          You’re all set. We’re preparing your account now.
        </p>
        <p className="mt-3 text-[var(--text-secondary)]">
          You should receive an account invitation email shortly (that’s where you’ll create your password).
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)]/70 p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Didn’t get the email?</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Click below to resend the invitation.
          </p>
          <ActivateFromStripeSession sessionId={sessionId || null} />
        </div>

        <div className="mt-6">
          <Link
            href="/sign-in"
            className="inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            Go to login
          </Link>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            If you just paid, give it 1-2 minutes for the invite to arrive.
          </p>
        </div>
      </div>
    </div>
  )
}
