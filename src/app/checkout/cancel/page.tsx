import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/95 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payment canceled</h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          No worries. You can go back and complete checkout whenever you’re ready.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            Return to site
          </Link>
        </div>
      </div>
    </div>
  )
}
