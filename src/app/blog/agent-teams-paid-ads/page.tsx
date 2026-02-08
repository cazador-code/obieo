import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

const automateUrl = 'https://www.obieo.com/automate'

// JSON-LD Schema for SEO
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How I Run Paid Ads Like a Team of 5 (As a One-Person Company) Using Agent Teams in Claude Code',
  description:
    'Agent Teams in Claude Code lets you run multiple AI “specialists” in parallel. Here’s how I use it to ship landing pages, tracking QA, reporting, and automations faster.',
  image: 'https://www.obieo.com/og-default.png',
  datePublished: '2026-02-08',
  dateModified: '2026-02-08',
  author: {
    '@type': 'Person',
    name: 'Hunter Lapeyre',
    url: 'https://www.obieo.com/about',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Obieo',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.obieo.com/logo.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.obieo.com/blog/agent-teams-paid-ads',
  },
}

export const metadata: Metadata = {
  title: 'Agent Teams in Claude Code for Paid Ads',
  description:
    'How I use Agent Teams in Claude Code to ship paid-ads landing pages, tracking, reporting, and automations like a small team.',
  alternates: {
    canonical: '/blog/agent-teams-paid-ads',
  },
  openGraph: {
    title: 'How I Run Paid Ads Like a Team of 5 (Using Agent Teams in Claude Code)',
    description:
      'Parallelize landing pages, tracking QA, reporting, and automations. The setup and patterns that actually work.',
  },
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="relative my-12 md:my-16 py-8 md:py-12">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--accent)] to-[var(--accent)]/20" />
      <p className="pl-8 md:pl-12 text-2xl md:text-3xl font-[family-name:var(--font-display)] text-[var(--text-primary)] leading-snug font-medium">
        {children}
      </p>
    </blockquote>
  )
}

function Paragraph({ children, lead = false }: { children: React.ReactNode; lead?: boolean }) {
  return (
    <p
      className={`${
        lead ? 'text-xl md:text-2xl leading-relaxed' : 'text-lg leading-relaxed'
      } text-[var(--text-secondary)] mb-6`}
    >
      {children}
    </p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mt-16 md:mt-20 mb-6 md:mb-8 relative">
      <span className="absolute -left-4 md:-left-6 top-0 bottom-0 w-1 bg-[var(--accent)]" />
      {children}
    </h2>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl md:text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mt-10 mb-4">
      {children}
    </h3>
  )
}

function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[var(--accent)] font-medium border-b-2 border-[var(--accent)]/30 hover:border-[var(--accent)] transition-colors"
    >
      {children}
    </Link>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="my-8 p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] overflow-x-auto text-sm text-[var(--text-primary)]">
      <code>{children}</code>
    </pre>
  )
}

export default function AgentTeamsPaidAdsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <Section size="lg" className="pt-32">
        <Container size="md">
          <FadeInSection>
            <p className="text-sm font-semibold text-[var(--accent)] mb-4">
              Claude Code, Agent Teams, and paid ads ops
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-display)] text-[var(--text-primary)] leading-[1.06]">
              How I Run Paid Ads Like a Team of 5 (As a One-Person Company) Using Agent Teams in Claude Code
            </h1>
            <Paragraph lead>
              I’m Hunter, founder and CEO of Obieo. Most “marketing work” isn’t marketing. It’s the messy operations
              around marketing: landing pages, tracking QA, reporting, follow-up, and all the glue that gets rebuilt
              every time you launch.
            </Paragraph>
            <Paragraph lead>
              Agent Teams (an experimental Claude Code feature) is the first thing I’ve used that actually feels like
              having a small performance team in the room. Not for vibes. For output.
            </Paragraph>

            <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
              <p className="text-[var(--text-primary)] font-semibold">Want this set up done-for-you?</p>
              <p className="mt-2 text-[var(--text-secondary)]">
                I’ll help you set up Claude Code + automations for your paid ads workflow. Start here:{' '}
                <InlineLink href={automateUrl}>Automate with Obieo</InlineLink>
              </p>
            </div>
          </FadeInSection>

          <FadeInSection>
            <SectionHeading>What Agent Teams actually does</SectionHeading>
            <Paragraph>
              Agent Teams lets you coordinate multiple Claude Code instances on the same codebase. One session plays
              lead. Others work as specialists. They message each other, share a task list with dependencies, and avoid
              stepping on the same files.
            </Paragraph>
            <Paragraph>
              The difference from subagents is communication. Subagents report back to a main session. Agent Teams can
              coordinate peer-to-peer without you acting as the router.
            </Paragraph>
            <PullQuote>
              Subagents are contractors you send on errands. Agent Teams feels like a project team sitting in the same
              room.
            </PullQuote>
          </FadeInSection>

          <FadeInSection>
            <SectionHeading>System requirements and setup</SectionHeading>
            <SubHeading>1. Enable Agent Teams</SubHeading>
            <Paragraph>
              Add an environment variable. Agent Teams is experimental and off by default.
            </Paragraph>
            <CodeBlock>{`// ~/.claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}`}</CodeBlock>

            <Paragraph>Or export it in your shell:</Paragraph>
            <CodeBlock>{`export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`}</CodeBlock>

            <SubHeading>2. Optional: split panes</SubHeading>
            <Paragraph>
              Agent Teams works in a single terminal, but split panes make it easier to watch teammates work.
            </Paragraph>
            <CodeBlock>{`brew install tmux`}</CodeBlock>

            <SubHeading>3. Verify access</SubHeading>
            <CodeBlock>{`claude

Do you have access to agent teams?`}</CodeBlock>
          </FadeInSection>

          <FadeInSection>
            <SectionHeading>The use cases that actually win for paid ads</SectionHeading>
            <Paragraph>
              Agent Teams is more expensive in tokens, so I only use it when parallelization buys back real hours.
            </Paragraph>

            <SubHeading>1. Creative sprint + landing page build</SubHeading>
            <Paragraph>
              One teammate explores angles and hooks while another builds the landing page and a third audits tracking.
              The output is a coherent “ad promise → page proof → measurement” chain.
            </Paragraph>

            <SubHeading>2. Tracking and attribution triage</SubHeading>
            <Paragraph>
              When performance tanks, you need competing hypotheses in parallel: tracking break vs landing page issue vs
              audience drift vs creative fatigue.
            </Paragraph>

            <SubHeading>3. Reporting and alerts that don’t waste your week</SubHeading>
            <Paragraph>
              A teammate can wire automated reporting and drift alerts while others ship the next iteration. This is
              where “one person company” starts feeling real.
            </Paragraph>
          </FadeInSection>

          <FadeInSection>
            <SectionHeading>The prompt template I actually use</SectionHeading>
            <Paragraph>
              If you want a starting point, this is the prompt I use when I’m building marketing systems around paid
              ads.
            </Paragraph>
            <CodeBlock>{`Create an Agent Team for paid ads execution for [offer] targeting [audience] on [platform].

Spawn: angle-strategist, copy-variants, landing-page-builder, tracking-qa, ops-automation.

Output:
1) angles + hooks
2) ad copy variants grouped by angle
3) landing page updates in repo
4) tracking checklist + fixes
5) lightweight reporting/alert automation plan

Coordination rule: teammates message each other directly to resolve mismatches (promise, proof, tracking).`}</CodeBlock>
          </FadeInSection>

          <FadeInSection>
            <SectionHeading>If you want this done-for-you</SectionHeading>
            <Paragraph>
              If you’re a founder, marketer, or agency operator and you want Claude Code + automations wired into your
              workflow, I’ll help you set it up and make it usable on day one.
            </Paragraph>
            <Paragraph>
              Start here: <InlineLink href={automateUrl}>{automateUrl}</InlineLink>
            </Paragraph>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}

