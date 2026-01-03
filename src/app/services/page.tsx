import Link from "next/link";
import CalendlyButton from "@/components/CalendlyButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — Obieo | SEO & AEO for Home Service Businesses",
  description:
    "SEO Launchpad ($2,500 one-time) or Local Dominance Retainer ($2,000/mo). SEO and AEO services designed for home service businesses.",
};

const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-green-500 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  </svg>
);

export default function ServicesPage() {
  return (
    <div className="pt-16 sm:pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-b from-cream-100 to-cream-50 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                Services That Actually Move the Needle
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Two options: fix everything that&apos;s broken now, or partner
                for ongoing growth. Either way, you get hands-on work from
                someone who understands your business.
              </p>
            </div>
          </div>
        </section>

        {/* Launchpad Section */}
        <section id="launchpad" className="bg-cream-50 py-16 sm:py-24 scroll-mt-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-terracotta-500/10 text-terracotta-600 rounded-full text-xs font-semibold uppercase tracking-wide">
                  One-Time · $2,500
                </div>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  SEO Launchpad
                </h2>
                <p className="mt-4 text-slate-600 text-lg leading-relaxed">
                  A 2–4 week engagement to audit, fix, and set up your SEO
                  foundation. Technical fixes, on-page optimization, and Google
                  Business Profile setup — everything you need before ongoing
                  SEO can work.
                </p>

                <div className="mt-8 space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">
                      What&apos;s Included:
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Full website audit with prioritized action plan",
                        "Google Business Profile audit and optimization",
                        "Core page rewrites (homepage, top 3 services, contact) — conversion-focused copy",
                        "Tracking setup: GA4, Google Search Console, call/form tracking",
                        "AEO foundation: FAQ schema, structured data, snippet-ready content",
                        "Local SEO baseline: NAP consistency check, top citations submitted",
                        "One 45-minute kickoff call + async support via text/email",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckIcon />
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">
                      Timeline:
                    </h3>
                    <p className="text-slate-600">
                      2–4 weeks depending on the size of your site and scope of
                      fixes needed. You&apos;ll know the exact timeline before
                      we start.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">
                      Best For:
                    </h3>
                    <p className="text-slate-600">
                      Businesses with an existing website that&apos;s not
                      performing, or those wanting to test the waters before
                      committing to a retainer.
                    </p>
                  </div>
                </div>

                <CalendlyButton
                  className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Start Your Launchpad
                  <ArrowIcon />
                </CalendlyButton>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h3 className="font-semibold text-slate-900 text-lg mb-6">
                  What You&apos;ll Walk Away With:
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      title: "A site that converts",
                      desc: "Pages rewritten with clear messaging, proper CTAs, and content that speaks to your customers.",
                    },
                    {
                      title: "Tracking that works",
                      desc: "Know exactly where your leads come from. No more guessing if your marketing is working.",
                    },
                    {
                      title: "GBP optimized",
                      desc: "Your Google Business Profile fully built out with proper categories, photos, and posts.",
                    },
                    {
                      title: "AI-search ready",
                      desc: "Schema markup and content structured so you show up in ChatGPT, Perplexity, and Google AI Overviews.",
                    },
                    {
                      title: "A clear roadmap",
                      desc: "If you want to continue with ongoing work, you'll have a prioritized plan for next steps.",
                    },
                  ].map((item, i) => (
                    <div key={i}>
                      <h4 className="font-medium text-slate-900">{item.title}</h4>
                      <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dominance Section */}
        <section
          id="dominance"
          className="bg-slate-900 text-white py-16 sm:py-24 scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-terracotta-500/20 text-terracotta-300 rounded-full text-xs font-semibold uppercase tracking-wide">
                  Monthly · $2,000/mo
                </div>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  Local Dominance
                </h2>
                <p className="mt-4 text-slate-300 text-lg leading-relaxed">
                  Continuous SEO that compounds month over month. 6-month
                  minimum commitment — because SEO takes time to show real results.
                </p>

                <div className="mt-8 space-y-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">
                      Each Month You Get:
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "2–4 new or refreshed pages (service pages, city pages, blog content)",
                        "Google Business Profile management: posts, photos, Q&A, review responses",
                        "AEO optimization: AI-answer-ready content, schema updates, snippet targeting",
                        "On-page SEO: internal linking, meta updates, speed/UX improvements",
                        "Backlink building: only relevant, real-site links (no link farms)",
                        "Monthly report: traffic, rankings, leads, what we did, what's next",
                        "Direct access to Hunter via text, email, or Loom — no account managers",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckIcon />
                          <span className="text-slate-200">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">
                      Commitment:
                    </h3>
                    <p className="text-slate-300">
                      6-month minimum. SEO takes time — you need at least 6 months
                      to see meaningful, compounding results. After that, it&apos;s
                      month-to-month.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">Best For:</h3>
                    <p className="text-slate-300">
                      Businesses ready to invest in compounding organic growth.
                      Works best when your site foundation is already solid (or
                      after completing a Launchpad).
                    </p>
                  </div>
                </div>

                <CalendlyButton
                  className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Start Growing
                  <ArrowIcon />
                </CalendlyButton>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8">
                <h3 className="font-semibold text-white text-lg mb-6">
                  What Compounds Over Time:
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      title: "More pages ranking",
                      desc: "Each new service/city page is another entry point for customers to find you.",
                    },
                    {
                      title: "Stronger domain authority",
                      desc: "Quality backlinks build your site's credibility in Google's eyes.",
                    },
                    {
                      title: "Better conversion rates",
                      desc: "Ongoing testing and tweaks mean more of your visitors become leads.",
                    },
                    {
                      title: "AI search presence",
                      desc: "As AI search grows, your optimized content shows up in more answers.",
                    },
                    {
                      title: "Competitive advantage",
                      desc: "While competitors do nothing, you're consistently building an organic moat.",
                    },
                  ].map((item, i) => (
                    <div key={i}>
                      <h4 className="font-medium text-white">{item.title}</h4>
                      <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="bg-cream-50 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center">
              Not Sure Which to Choose?
            </h2>
            <p className="mt-4 text-slate-600 text-center text-lg max-w-2xl mx-auto">
              Most clients start with the Launchpad to fix foundations, then move
              to Local Dominance for ongoing growth. But here&apos;s a quick
              comparison:
            </p>

            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 text-lg">
                  Choose the Launchpad if...
                </h3>
                <ul className="mt-4 space-y-3 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-terracotta-500">→</span>
                    Your SEO foundation is broken and needs fixing first
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-terracotta-500">→</span>
                    You want to test before committing to 6 months
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-terracotta-500">→</span>
                    You have in-house resources for ongoing work
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-terracotta-500">→</span>
                    Budget is tight but you need SEO basics fixed now
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 text-lg">
                  Choose Local Dominance if...
                </h3>
                <ul className="mt-4 space-y-3 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-terracotta-500">→</span>
                    Your foundation is solid (or you just did a Launchpad)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-terracotta-500">→</span>
                    You want consistent, compounding SEO growth
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-terracotta-500">→</span>
                    You don&apos;t have time to manage SEO yourself
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-terracotta-500">→</span>
                    You&apos;re ready to dominate your local market
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-slate-600 mb-6">
                Still not sure? Let&apos;s talk. I&apos;ll give you my honest
                recommendation.
              </p>
              <CalendlyButton
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all cursor-pointer"
              >
                Book a Free Call
                <ArrowIcon />
              </CalendlyButton>
            </div>
          </div>
        </section>
    </div>
  );
}

