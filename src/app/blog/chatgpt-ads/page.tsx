import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container } from '@/components/ui'
import { FadeInSection } from '@/components/animations'

export const metadata: Metadata = {
  title: "ChatGPT Is Adding Ads. Here's What It Means for You | Obieo",
  description: "OpenAI announced ads in ChatGPT. For businesses, being the organic answer AI cites just became 10x more valuable. Here's what to do about it.",
  openGraph: {
    title: "ChatGPT Is Adding Ads. Here's What It Means for Your Business",
    description: "OpenAI is putting ads in ChatGPT. The businesses AI naturally recommends will now stand out even more. Learn why AEO matters.",
  },
}

// Editorial Components
function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="relative my-12 md:my-16 py-8 md:py-12">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--accent)] to-[var(--accent)]/20" />
      <div className="absolute -left-4 top-6 w-12 h-12 text-[var(--accent)]/10">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      <p className="pl-8 md:pl-12 text-2xl md:text-3xl lg:text-4xl font-[family-name:var(--font-display)] text-[var(--text-primary)] leading-snug font-medium">
        {children}
      </p>
    </blockquote>
  )
}

function KeyInsight({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="my-10 md:my-14 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10 border border-[var(--accent)]/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider">{title}</span>
        </div>
        <div className="text-lg md:text-xl text-[var(--text-primary)] leading-relaxed font-medium">
          {children}
        </div>
      </div>
    </div>
  )
}

function DataCard({
  label,
  value,
  subtext,
  variant = 'default'
}: {
  label: string
  value: string
  subtext?: string
  variant?: 'default' | 'highlight' | 'warning'
}) {
  const variantStyles = {
    default: 'bg-[var(--bg-secondary)] border-[var(--border)]',
    highlight: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30',
  }
  const valueStyles = {
    default: 'text-[var(--text-primary)]',
    highlight: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
  }
  return (
    <div className={`p-5 md:p-6 rounded-xl border ${variantStyles[variant]} transition-transform hover:scale-[1.02]`}>
      <p className="text-sm text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] ${valueStyles[variant]}`}>{value}</p>
      {subtext && <p className="text-sm text-[var(--text-secondary)] mt-2">{subtext}</p>}
    </div>
  )
}

function Paragraph({ children, lead = false }: { children: React.ReactNode; lead?: boolean }) {
  return (
    <p className={`${lead ? 'text-xl md:text-2xl leading-relaxed' : 'text-lg leading-relaxed'} text-[var(--text-secondary)] mb-6`}>
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

function InlineLink({ href, external = false, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[var(--accent)] font-medium border-b-2 border-[var(--accent)]/30 hover:border-[var(--accent)] transition-colors"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </Link>
  )
}

export default function ChatGPTAdsPage() {
  return (
    <>
      {/* Hero */}
      <Section size="lg" className="pt-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-20 right-0 w-[500px] h-[500px] text-[var(--accent)] opacity-[0.03]" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="currentColor" />
          </svg>
          <svg className="absolute -bottom-32 -left-32 w-96 h-96 text-[var(--accent)] opacity-[0.04]" viewBox="0 0 200 200">
            <rect x="20" y="20" width="160" height="160" rx="20" fill="currentColor" />
          </svg>
        </div>

        <Container size="md" className="relative">
          <FadeInSection>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8 group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--accent)] text-white uppercase tracking-wide">
                AI Search
              </span>
              <span className="text-sm text-[var(--text-muted)]">January 17, 2026</span>
              <span className="text-sm text-[var(--text-muted)]">&bull;</span>
              <span className="text-sm text-[var(--text-muted)]">8 min read</span>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8 leading-[1.1]">
              ChatGPT Is Adding Ads. Here&apos;s What That Means for Your Business.
            </h1>
          </FadeInSection>

          <FadeInSection delay={0.3}>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              AI assistants are becoming advertising platforms. <strong className="text-[var(--text-primary)]">Being the organic answer just became 10x more valuable.</strong>
            </p>
          </FadeInSection>

          <FadeInSection delay={0.4}>
            <div className="flex items-center gap-4 mt-10 pt-8 border-t border-[var(--border)]">
              <div className="w-14 h-14 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[var(--accent)]/20">
                HL
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Hunter Lapeyre</p>
                <p className="text-sm text-[var(--text-muted)]">Founder, Obieo & Lapeyre Roofing</p>
              </div>
            </div>
          </FadeInSection>
        </Container>
      </Section>

      {/* Article Body */}
      <Section className="pt-8 md:pt-12">
        <Container size="md">
          <FadeInSection>
            <article>
              <Paragraph lead>
                OpenAI just announced they&apos;re putting ads in ChatGPT. If you&apos;ve been paying attention to AI search, this was inevitable. But the implications for business owners are bigger than most people realize.
              </Paragraph>

              <Paragraph>
                Here&apos;s the short version: AI assistants are becoming advertising platforms. That means being the <em>organic answer</em> that AI naturally cites and recommends just became significantly more valuable.
              </Paragraph>

              <Paragraph>
                I&apos;ve been tracking <InlineLink href="/blog/generative-engine-optimization-guide">AI search optimization</InlineLink> since ChatGPT first started answering questions about local businesses. I&apos;ve tested what works on my own roofing company. And I can tell you: the businesses that figure this out early will have a massive advantage over those who wait.
              </Paragraph>

              <SectionHeading>What OpenAI Actually Announced</SectionHeading>

              <Paragraph>
                On January 16, 2026, OpenAI published their approach to advertising in ChatGPT. Here&apos;s what&apos;s happening.
              </Paragraph>

              <SubHeading>The Basics</SubHeading>

              <Paragraph>
                OpenAI is introducing ads to ChatGPT&apos;s free tier and their new ChatGPT Go subscription ($8/month). Testing starts in the coming weeks, initially in the U.S.
              </Paragraph>

              <Paragraph>
                The paid tiers &mdash; Pro ($20/month), Business, and Enterprise &mdash; will remain ad-free.
              </Paragraph>

              <div className="grid md:grid-cols-3 gap-4 my-8">
                <DataCard
                  label="ChatGPT Go"
                  value="$8/mo"
                  subtext="Will include ads"
                />
                <DataCard
                  label="ChatGPT Pro"
                  value="$20/mo"
                  subtext="Remains ad-free"
                  variant="highlight"
                />
                <DataCard
                  label="Testing"
                  value="U.S."
                  subtext="Starting in coming weeks"
                />
              </div>

              <SubHeading>How the Ads Will Work</SubHeading>

              <Paragraph>
                According to OpenAI, ads will appear at the bottom of ChatGPT&apos;s answers when there&apos;s a relevant sponsored product or service. They&apos;ll be clearly labeled as &quot;sponsored&quot; and separated from the organic answer.
              </Paragraph>

              <Paragraph>
                The key detail: <strong className="text-[var(--text-primary)]">ads will be influenced by your conversation</strong>, but OpenAI claims the actual answers won&apos;t be influenced by advertisers. Your conversation with ChatGPT helps determine which ads you see, but supposedly not what ChatGPT tells you.
              </Paragraph>

              <SubHeading>OpenAI&apos;s Stated Principles</SubHeading>

              <div className="my-10 p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <ul className="space-y-4 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">1.</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Mission alignment</strong>
                      <p className="mt-1">Advertising supports broader access to AI</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">2.</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Answer independence</strong>
                      <p className="mt-1">Ads don&apos;t influence the answers</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">3.</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Conversation privacy</strong>
                      <p className="mt-1">Data never sold to advertisers</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">4.</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Choice and control</strong>
                      <p className="mt-1">Users can opt out of personalization</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">5.</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Long-term value</strong>
                      <p className="mt-1">Not optimizing for time spent in ChatGPT</p>
                    </div>
                  </li>
                </ul>
              </div>

              <Paragraph>
                They also noted that ads won&apos;t appear for users under 18 or near sensitive topics like health, mental health, or politics.
              </Paragraph>

              <SubHeading>A Note of Healthy Skepticism</SubHeading>

              <Paragraph>
                These principles sound reasonable. But I remember when Google made similar promises about keeping ads separate from organic results.
              </Paragraph>

              <Paragraph>
                Today, the top of most Google search results are ads. The line between paid and organic has blurred. Featured snippets compete with sponsored content. And billions of advertising dollars have fundamentally shaped how search works.
              </Paragraph>

              <Paragraph>
                I&apos;m not saying OpenAI will go the same route. But history suggests we should watch what happens, not just what&apos;s promised.
              </Paragraph>

              <SectionHeading>Why This Changes the AI Search Game</SectionHeading>

              <SubHeading>The Google Parallel</SubHeading>

              <Paragraph>
                Remember when Google search was almost entirely organic results? You&apos;d type a query, and Google would show you the most relevant pages. No ads at the top. No sponsored listings in the middle.
              </Paragraph>

              <Paragraph>
                That era is long gone.
              </Paragraph>

              <Paragraph>
                Today, for commercial queries, the top 3-4 results are often ads. You might scroll past multiple sponsored listings before seeing an organic result. The same shift is starting with AI.
              </Paragraph>

              <SubHeading>Two Types of AI Recommendations</SubHeading>

              <Paragraph>
                When someone asks ChatGPT &quot;who should I call to fix my roof?&quot;, there will now be two types of answers:
              </Paragraph>

              <div className="my-10 grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)] text-lg mb-2">The Organic Answer</h4>
                  <p className="text-[var(--text-secondary)]">
                    What ChatGPT naturally recommends based on its training data, information access, and assessment of authority and relevance.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)] text-lg mb-2">The Sponsored Answer</h4>
                  <p className="text-[var(--text-secondary)]">
                    What advertisers pay to appear alongside the organic response. Labeled as &quot;sponsored.&quot;
                  </p>
                </div>
              </div>

              <KeyInsight title="The Shift">
                When AI search was ad-free, being recommended by ChatGPT was valuable but not differentiated. Now there&apos;s a distinction. Businesses that AI naturally recommends will stand out from businesses that paid to appear.
              </KeyInsight>

              <Paragraph>
                This is exactly what happened with Google. Organic rankings became more valuable <em>because</em> paid ads existed. Users learned to skip the ads and trust the organic results. Businesses that ranked organically got higher click-through rates than those paying for the same position.
              </Paragraph>

              <Paragraph>
                The same dynamic is coming to AI search.
              </Paragraph>

              <SectionHeading>The Business Case for Being the Organic Answer</SectionHeading>

              <Paragraph>
                Let&apos;s talk math. Because that&apos;s how you should make marketing decisions.
              </Paragraph>

              <SubHeading>Organic vs. Paid: The Long-Term Math</SubHeading>

              <div className="my-10 overflow-hidden rounded-2xl border border-[var(--border)]">
                <table className="w-full text-left">
                  <thead className="bg-[var(--bg-secondary)]">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-[var(--text-primary)]">Factor</th>
                      <th className="px-6 py-4 font-semibold text-[var(--text-primary)]">Paid AI Ads</th>
                      <th className="px-6 py-4 font-semibold text-[var(--text-primary)]">Organic AI Citations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">Cost Structure</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">Per impression/click</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">Upfront investment</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">When You Stop Paying</td>
                      <td className="px-6 py-4 text-amber-600 dark:text-amber-400">Leads stop</td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">Leads continue</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">Long-Term Cost/Lead</td>
                      <td className="px-6 py-4 text-amber-600 dark:text-amber-400">Scales with volume</td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">Approaches zero</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">Compounding Effect</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">None</td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">More authority = more citations</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Paragraph>
                This is the same math that makes <InlineLink href="/blog/contractor-lead-generation-guide">SEO the highest-ROI lead source</InlineLink> for home service businesses. The upfront investment is real. But the long-term economics are dramatically better than renting attention forever.
              </Paragraph>

              <SubHeading>The SEO Parallel</SubHeading>

              <Paragraph>
                I&apos;ve seen this movie before with traditional search.
              </Paragraph>

              <Paragraph>
                Businesses that invested in SEO early &mdash; back when it seemed optional &mdash; now dominate their markets. They get leads for essentially free while competitors pay $50, $100, $200 per click just to show up.
              </Paragraph>

              <PullQuote>
                The contractors who said &quot;I&apos;ll just run Google Ads&quot; are now trapped. Their cost per lead keeps rising. They can&apos;t turn off the ads without losing all their leads.
              </PullQuote>

              <Paragraph>
                Meanwhile, the businesses with strong organic rankings are laughing. They built an asset. They own their traffic.
              </Paragraph>

              <Paragraph>
                The same dynamic is emerging with AI search. The window to build organic AI authority is open now. It won&apos;t stay open forever.
              </Paragraph>

              <SectionHeading>What to Do About It</SectionHeading>

              <Paragraph>
                If you&apos;re convinced organic AI presence matters, here&apos;s where to start.
              </Paragraph>

              <SubHeading>Step 1: Check Your Current AI Visibility</SubHeading>

              <Paragraph>
                Open ChatGPT (or Claude, or Perplexity) and search for your services in your area. Ask questions like:
              </Paragraph>

              <div className="my-8 p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)]">&bull;</span>
                    &quot;Who is the best [your service] company in [your city]?&quot;
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)]">&bull;</span>
                    &quot;Can you recommend a [your service] near [your location]?&quot;
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)]">&bull;</span>
                    &quot;What should I look for when hiring a [your service] company?&quot;
                  </li>
                </ul>
              </div>

              <Paragraph>
                See if you appear. See if your competitors appear. This is your baseline.
              </Paragraph>

              <Paragraph>
                When I did this for <InlineLink href="/work/lapeyre-roofing">Lapeyre Roofing</InlineLink>, I was surprised to find us recommended alongside companies that had been in business for 40-50 years. That doesn&apos;t happen by accident.
              </Paragraph>

              <SubHeading>Step 2: Build Content That AI Cites</SubHeading>

              <Paragraph>
                AI assistants recommend businesses they consider authoritative and trustworthy. That authority comes from:
              </Paragraph>

              <div className="my-10 p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <ul className="space-y-4 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">&bull;</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Structured, factual content</strong>
                      <p className="mt-1">Clear information about your services, service areas, credentials, and expertise. AI needs to extract facts to make recommendations.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">&bull;</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Genuine expertise signals</strong>
                      <p className="mt-1">Reviews, credentials, industry certifications, years in business. AI looks for trust indicators.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] mt-1 text-xl">&bull;</span>
                    <div>
                      <strong className="text-[var(--text-primary)]">Content that answers real questions</strong>
                      <p className="mt-1">When you publish content that answers the questions homeowners actually ask, AI learns to cite you as a source.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <Paragraph>
                This is what we call <InlineLink href="/blog/generative-engine-optimization-guide">Generative Engine Optimization (GEO)</InlineLink>. It&apos;s the AI equivalent of SEO. And the fundamentals are similar: build genuine authority, and the algorithms reward you.
              </Paragraph>

              <SubHeading>Step 3: Don&apos;t Wait for the Perfect Strategy</SubHeading>

              <Paragraph>
                Here&apos;s the honest truth: nobody has AI search completely figured out yet. It&apos;s too new. The landscape is shifting.
              </Paragraph>

              <Paragraph>
                But that&apos;s exactly why moving now matters.
              </Paragraph>

              <KeyInsight title="The Window">
                The businesses that experiment early &mdash; that build content, track what works, and iterate &mdash; will be miles ahead when this becomes mainstream. The ones who wait for certainty will be playing catch-up.
              </KeyInsight>

              <Paragraph>
                I&apos;d rather be wrong about some tactics than miss the window entirely.
              </Paragraph>

              <SectionHeading>The Bottom Line</SectionHeading>

              <Paragraph>
                OpenAI introducing ads to ChatGPT isn&apos;t surprising. Every free platform eventually monetizes through advertising.
              </Paragraph>

              <Paragraph>
                But the implication for businesses is clear: <strong className="text-[var(--text-primary)]">being the organic answer AI naturally recommends just became more valuable.</strong>
              </Paragraph>

              <div className="my-10 p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <h4 className="font-semibold text-[var(--text-primary)] text-lg mb-4">The Playbook</h4>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] font-bold">1.</span>
                    Check if AI currently recommends you
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] font-bold">2.</span>
                    Build content and authority that makes you citable
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] font-bold">3.</span>
                    Start now, before your competitors figure this out
                  </li>
                </ul>
              </div>

              <Paragraph>
                This is exactly the kind of shift that creates winners and losers. The businesses that adapt will have a structural advantage. The ones that ignore it will pay for attention forever.
              </Paragraph>

              <Paragraph>
                If you&apos;re a home service business owner who wants to get ahead of this, that&apos;s what we focus on at Obieo. We help contractors build organic presence that compounds &mdash; whether that&apos;s traditional SEO or the emerging world of AI search optimization.
              </Paragraph>

              {/* Related Content */}
              <div className="my-16 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4 font-[family-name:var(--font-display)]">
                  Want to Go Deeper on AI Search?
                </h3>
                <Paragraph>
                  This article covers the news and what it means. If you want the full technical breakdown of how to optimize for AI search, read our complete guide:
                </Paragraph>
                <Link
                  href="/blog/generative-engine-optimization-guide"
                  className="inline-flex items-center gap-2 text-[var(--accent)] font-semibold hover:gap-3 transition-all"
                >
                  The Complete Guide to Generative Engine Optimization
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Author Box */}
              <div className="my-16 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-[var(--accent)]/20">
                    HL
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] text-lg">Hunter Lapeyre</p>
                    <p className="text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Hunter owns <InlineLink href="/">Obieo</InlineLink> (SEO and AI search optimization for home service businesses) and <InlineLink href="/work/lapeyre-roofing">Lapeyre Roofing</InlineLink>. Every strategy he recommends has been tested on his own business first.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </FadeInSection>
        </Container>
      </Section>

      {/* CTA */}
      <Section variant="alternate" className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-0 left-1/4 w-64 h-64 text-[var(--accent)] opacity-[0.05]" viewBox="0 0 200 200">
            <polygon points="100,10 190,190 10,190" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 right-1/4 w-48 h-48 text-[var(--accent)] opacity-[0.05]" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="currentColor" />
          </svg>
        </div>

        <Container size="md" className="relative">
          <FadeInSection>
            <div className="text-center">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-[var(--accent)] text-white mb-6">
                Free Strategy Call
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                Ready to See Where You Stand with AI Search?
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto leading-relaxed">
                I&apos;ll show you exactly how AI assistants currently see your business &mdash; and what it would take to become their recommended answer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/call"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-all hover:scale-105 shadow-lg shadow-[var(--accent)]/25"
                >
                  Book a Strategy Call
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-6">
                20 minutes. No pitch deck. No pressure.
              </p>
            </div>
          </FadeInSection>
        </Container>
      </Section>
    </>
  )
}
