import CalendlyButton from "@/components/CalendlyButton";
import { ArrowRightIcon } from "@/components/ui";
import type { Metadata } from "next";

// JSON-LD Schema for About Page
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Hunter Lapeyre',
  jobTitle: 'Founder & SEO Strategist',
  url: 'https://www.obieo.com/about',
  worksFor: [
    {
      '@type': 'Organization',
      name: 'Obieo',
      url: 'https://www.obieo.com',
    },
    {
      '@type': 'Organization',
      name: 'Lapeyre Roofing',
      url: 'https://lapeyreroofing.com',
    },
  ],
  knowsAbout: [
    'SEO for Home Service Businesses',
    'Answer Engine Optimization (AEO)',
    'Local SEO',
    'Roofing Industry',
    'Home Services Marketing',
  ],
  description: 'Hunter Lapeyre owns and operates Lapeyre Roofing and founded Obieo to provide SEO services specifically for home service businesses. He brings real industry experience to digital marketing.',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who runs Obieo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Obieo is run by Hunter Lapeyre, who also owns and operates Lapeyre Roofing. This dual experience gives him unique insight into what actually works for home service businesses.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes Obieo different from other SEO agencies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Unlike typical agencies, Obieo is run by someone who owns a home service business. Hunter Lapeyre understands seasonality, emergency calls, local reputation, and the trust factor because he lives it every day with his roofing company.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: "About Hunter Lapeyre — Contractor Turned SEO Strategist",
  description:
    "I'm Hunter Lapeyre. I run Obieo and Lapeyre Roofing. That's why I understand home service businesses better than any agency.",
  alternates: {
    canonical: '/about',
  },
};

const differentiators = [
  { title: "I know your business.", description: 'Not from a case study — from running one. I understand seasonality, emergency calls, local reputation, and why "free estimate" matters.' },
  { title: "You work with me directly.", description: "No account managers, no sales team hand-offs. You text me. You email me. We talk." },
  { title: "I keep my client list small.", description: "I don't want 50 clients. I want a handful that I can actually help. That means I learn your specific market." },
  { title: "I'm ahead on AEO.", description: "AI search is changing how people find services. Most agencies haven't caught up. I've been optimizing for it since the beginning." },
  { title: "Better value, better attention.", description: "You get big agency tactics without the big agency price tag. Not because I cut corners — because I don't have their overhead." },
];

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="pt-16 sm:pt-20">
        {/* Hero */}
        <section className="bg-[var(--bg-secondary)] py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
                I Run a Home Service Company.
                <br />
                <span className="text-[var(--accent)]">That&apos;s the Difference.</span>
              </h1>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="bg-[var(--bg-primary)] py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-[var(--text-primary)] leading-relaxed">
                I&apos;m Hunter Lapeyre. I own and operate{" "}
                <strong>Lapeyre Roofing</strong> — a real roofing company that
                does real work for real customers.
              </p>

              <p className="text-[var(--text-secondary)] leading-relaxed">
                I started Obieo because I got tired of agencies treating home
                service businesses like they&apos;re all the same. They&apos;re
                not. A roofer isn&apos;t an e-commerce brand. An HVAC company
                isn&apos;t a SaaS startup.
              </p>

              <p className="text-[var(--text-secondary)] leading-relaxed">
                When you hire a typical SEO agency, you get account managers
                who&apos;ve never installed a roof, fixed a furnace, or dealt
                with a customer who needs emergency service at 6pm on a Friday.
                They don&apos;t understand the seasonality, the local
                competition, or the trust factor that matters in this industry.
              </p>

              <p className="text-[var(--text-secondary)] leading-relaxed">
                I do. Because I live it every day.
              </p>

              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mt-12 mb-4">
                Why I Started This
              </h2>

              <p className="text-[var(--text-secondary)] leading-relaxed">
                For my own roofing company, I had to learn SEO the hard way.
                Agencies burned me with junk backlinks. They wrote generic
                content that didn&apos;t convert. They charged $2,500/month for
                work I could barely measure.
              </p>

              <p className="text-[var(--text-secondary)] leading-relaxed">
                So I learned to do it myself. I figured out what actually moves
                the needle: good content that answers real questions, proper
                local optimization, clean technical foundations, and now — AEO
                (optimizing for AI search like ChatGPT and Perplexity).
              </p>

              <p className="text-[var(--text-secondary)] leading-relaxed">
                Now I offer that to other home service businesses. Small client
                list. Direct access. Half the price.
              </p>

              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mt-12 mb-4">
                What Makes Obieo Different
              </h2>

              <ul className="space-y-4 text-[var(--text-secondary)]">
                {differentiators.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold">
                      {i + 1}
                    </span>
                    <span>
                      <strong className="text-[var(--text-primary)]">{item.title}</strong>{" "}
                      {item.description}
                    </span>
                  </li>
                ))}
              </ul>

              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mt-12 mb-4">
                The Bottom Line
              </h2>

              <p className="text-[var(--text-secondary)] leading-relaxed">
                You&apos;ve probably been burned by an agency before. Or
                you&apos;ve watched competitors outrank you for years while
                wondering what they&apos;re doing differently.
              </p>

              <p className="text-[var(--text-secondary)] leading-relaxed">
                I can&apos;t guarantee rankings — anyone who does is lying. But
                I can guarantee honest work, clear communication, and strategies
                that have actually worked for my own business.
              </p>

              <p className="text-lg text-[var(--text-primary)] leading-relaxed mt-8">
                If that sounds like what you&apos;re looking for, let&apos;s
                talk.
              </p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <CalendlyButton
                source="about-page"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-lg transition-all cursor-pointer"
              >
                Book a Free Call
                <ArrowRightIcon />
              </CalendlyButton>
              <a
                href="mailto:hunter@obieo.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold rounded-lg border border-[var(--border)] transition-all"
              >
                Email Me Directly
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

