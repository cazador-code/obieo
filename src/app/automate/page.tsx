import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'
import { AutomateCtas, automateBookingSource, automateGhlTag } from './AutomateCtas'

export const metadata: Metadata = {
  title: 'Automate Your Paid Ads Ops',
  description:
    'I help marketers and operators automate the messy work around paid ads: landing pages, tracking QA, reporting, alerts, and follow-up workflows.',
  alternates: {
    canonical: '/automate',
  },
  openGraph: {
    title: 'Automate Your Paid Ads Ops | Obieo',
    description:
      'Stop losing weeks to landing pages, tracking QA, reporting, and follow-up. I set up Claude Code + automations so you can ship faster and measure cleanly.',
    url: 'https://www.obieo.com/automate',
  },
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <div className="text-sm text-[var(--text-muted)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[var(--text-secondary)] leading-relaxed">
      <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)] flex-shrink-0" />
      <span>{children}</span>
    </li>
  )
}

function AutomateCtasFallback() {
  const params = new URLSearchParams({
    source: automateBookingSource,
    ghl_tag: automateGhlTag,
    utm_campaign: automateBookingSource,
  })
  const href = `/call?${params.toString()}`

  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2'

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <Link
        href={href}
        className={`${base} px-8 py-4 text-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:scale-[1.02]`}
      >
        Book a Call
      </Link>
      <Link
        href="/work"
        className={`${base} px-8 py-4 text-lg border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white`}
      >
        See Examples
      </Link>
    </div>
  )
}

export default function AutomateWithObieoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Automate Your Paid Ads Ops',
            url: 'https://www.obieo.com/automate',
            description:
              'Done-for-you Claude Code setup + automations for paid ads and marketing operations.',
            isPartOf: {
              '@type': 'WebSite',
              name: 'Obieo',
              url: 'https://www.obieo.com',
            },
          }),
        }}
      />

      {/* Hero */}
      <Section size="lg" className="pt-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-[380px] w-[380px] rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 h-[420px] w-[420px] rounded-full bg-[var(--accent)]/10 blur-3xl" />
        </div>

        <Container>
          <FadeInSection>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-wide text-[var(--accent)]">
                Built for marketers, founders, and operators running paid ads
              </p>
              <h1 className="mt-4 text-4xl md:text-6xl font-bold font-[family-name:var(--font-display)] text-[var(--text-primary)] leading-[1.05]">
                Automate the work around paid ads.
                <br />
                Keep the leverage.
              </h1>
              <p className="mt-6 text-xl text-[var(--text-secondary)] leading-relaxed">
                I’m Hunter, founder of Obieo. If you’re spending more time rebuilding landing pages, fixing tracking,
                and stitching reports together than actually shipping campaigns, I can help.
              </p>

              <div className="mt-8">
                <Suspense fallback={<AutomateCtasFallback />}>
                  <AutomateCtas />
                </Suspense>
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  This routes through our booking flow with <code className="px-1 py-0.5 rounded bg-[var(--bg-secondary)]">source={automateBookingSource}</code>{' '}
                  and tags leads in GHL with{' '}
                  <code className="px-1 py-0.5 rounded bg-[var(--bg-secondary)]">{automateGhlTag}</code>.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Stat label="Typical timeline" value="7 to 14 days" />
                <Stat label="What you get" value="Systems + automations" />
                <Stat label="Best fit" value="Active spend" />
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* What Gets Automated */}
      <Section>
        <Container>
          <FadeInSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]">
                  What I automate (so you can focus on the actual marketing)
                </h2>
                <p className="mt-4 text-lg text-[var(--text-secondary)] leading-relaxed">
                  I’m not selling “AI strategy.” I’m setting up the boring stuff that makes paid media and growth feel
                  clean again.
                </p>
                <ul className="mt-6 space-y-3">
                  <Bullet>
                    Landing pages that match the ad, load fast, and don’t break tracking every time you ship a change
                  </Bullet>
                  <Bullet>
                    Tracking QA: UTMs, click IDs, pixels, server events, form events, thank-you events
                  </Bullet>
                  <Bullet>
                    Reporting that answers the real questions (what changed, what worked, what to do next)
                  </Bullet>
                  <Bullet>
                    Alerts when things drift: CPA spikes, conversion drops, broken forms, 404s, attribution anomalies
                  </Bullet>
                  <Bullet>
                    Lead follow-up automations and routing (so good leads don’t sit in limbo)
                  </Bullet>
                </ul>

                <p className="mt-8 text-[var(--text-muted)]">
                  Already have a stack? Great. We adapt to it. If you’re starting from scratch, I’ll recommend the
                  smallest setup that actually works.
                </p>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-7 md:p-8">
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">The outcome</h3>
                <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
                  You end up with a repeatable “launch lane” where creative, landing pages, tracking, and follow-up are
                  coordinated. Your next campaign takes hours, not weeks.
                </p>

                <div className="mt-6 border-t border-[var(--border)] pt-6">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">If you’re wondering if this is for you:</p>
                  <ul className="mt-4 space-y-2 text-[var(--text-secondary)]">
                    <li>1. You run paid ads and you’re tired of measurement whack-a-mole.</li>
                    <li>2. You’ve got too many manual steps between “new idea” and “launched.”</li>
                    <li>3. You want systems, not a monthly retainer that hides behind dashboards.</li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Suspense fallback={<AutomateCtasFallback />}>
                    <AutomateCtas />
                  </Suspense>
                </div>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* How It Works */}
      <Section variant="alternate">
        <Container>
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]">
              How it works
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: 'Quick audit',
                  body: 'We map your current funnel, tracking, and handoffs. I’m looking for where data breaks or time gets wasted.',
                },
                {
                  step: '2',
                  title: 'Build the system',
                  body: 'I set up Claude Code workflows + automations and wire them into your existing tools.',
                },
                {
                  step: '3',
                  title: 'Make it repeatable',
                  body: 'You get templates, checklists, and an operating rhythm your team can actually follow.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-semibold">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">{item.title}</h3>
                  <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Prefer email?</p>
                <p className="text-[var(--text-secondary)]">
                  You can also reach me at{' '}
                  <Link className="text-[var(--accent)] font-medium hover:underline" href="/contact">
                    the contact page
                  </Link>
                  .
                </p>
              </div>
              <Suspense fallback={<AutomateCtasFallback />}>
                <AutomateCtas />
              </Suspense>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container>
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)]">
              FAQ
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  q: 'Do you run my ads?',
                  a: 'Not usually. I build the systems around your ads: landing pages, tracking, reporting, and automations. If you have a media buyer, they move faster. If you are the media buyer, you stop getting buried.',
                },
                {
                  q: 'Is this “Agent Teams / multi-agent” stuff required?',
                  a: 'No. It is a tool, not the product. If it helps your workflow, I set it up. If it adds complexity, we skip it.',
                },
                {
                  q: 'What do I need before we start?',
                  a: 'A real offer and a real funnel. If you have current traffic, even better. If you have nothing yet, we can still set up the baseline (but the fastest wins come from active campaigns).',
                },
                {
                  q: 'How does tracking work?',
                  a: 'We keep UTMs and click IDs intact, verify client and server events, and set up alerts so we know when attribution breaks. Leads from this page also get a dedicated GHL tag.',
                },
              ].map((item) => (
                <div key={item.q} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{item.q}</h3>
                  <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}
