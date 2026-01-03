import Link from "next/link";
import CalendlyButton from "@/components/CalendlyButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Obieo | Hunter Lapeyre",
  description:
    "I'm Hunter Lapeyre. I run Obieo and Lapeyre Roofing. That's why I understand home service businesses better than any agency.",
};

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

export default function AboutPage() {
  return (
    <div className="pt-16 sm:pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-b from-cream-100 to-cream-50 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                I Run a Home Service Company.
                <br />
                <span className="text-terracotta-500">That&apos;s the Difference.</span>
              </h1>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="bg-cream-50 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg prose-slate max-w-none">
              <p className="text-xl text-slate-700 leading-relaxed">
                I&apos;m Hunter Lapeyre. I own and operate{" "}
                <strong>Lapeyre Roofing</strong> — a real roofing company that
                does real work for real customers.
              </p>

              <p className="text-slate-600 leading-relaxed">
                I started Obieo because I got tired of agencies treating home
                service businesses like they&apos;re all the same. They&apos;re
                not. A roofer isn&apos;t an e-commerce brand. An HVAC company
                isn&apos;t a SaaS startup.
              </p>

              <p className="text-slate-600 leading-relaxed">
                When you hire a typical SEO agency, you get account managers
                who&apos;ve never installed a roof, fixed a furnace, or dealt
                with a customer who needs emergency service at 6pm on a Friday.
                They don&apos;t understand the seasonality, the local
                competition, or the trust factor that matters in this industry.
              </p>

              <p className="text-slate-600 leading-relaxed">
                I do. Because I live it every day.
              </p>

              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900 mt-12 mb-4">
                Why I Started This
              </h2>

              <p className="text-slate-600 leading-relaxed">
                For my own roofing company, I had to learn SEO the hard way.
                Agencies burned me with junk backlinks. They wrote generic
                content that didn&apos;t convert. They charged $2,500/month for
                work I could barely measure.
              </p>

              <p className="text-slate-600 leading-relaxed">
                So I learned to do it myself. I figured out what actually moves
                the needle: good content that answers real questions, proper
                local optimization, clean technical foundations, and now — AEO
                (optimizing for AI search like ChatGPT and Perplexity).
              </p>

              <p className="text-slate-600 leading-relaxed">
                Now I offer that to other home service businesses. Small client
                list. Direct access. Half the price.
              </p>

              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900 mt-12 mb-4">
                What Makes Obieo Different
              </h2>

              <ul className="space-y-4 text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-terracotta-500/10 text-terracotta-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold">
                    1
                  </span>
                  <span>
                    <strong className="text-slate-900">
                      I know your business.
                    </strong>{" "}
                    Not from a case study — from running one. I understand
                    seasonality, emergency calls, local reputation, and why
                    &quot;free estimate&quot; matters.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-terracotta-500/10 text-terracotta-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold">
                    2
                  </span>
                  <span>
                    <strong className="text-slate-900">
                      You work with me directly.
                    </strong>{" "}
                    No account managers, no sales team hand-offs. You text me.
                    You email me. We talk.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-terracotta-500/10 text-terracotta-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold">
                    3
                  </span>
                  <span>
                    <strong className="text-slate-900">
                      I keep my client list small.
                    </strong>{" "}
                    I don&apos;t want 50 clients. I want a handful that I can
                    actually help. That means I learn your specific market.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-terracotta-500/10 text-terracotta-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold">
                    4
                  </span>
                  <span>
                    <strong className="text-slate-900">
                      I&apos;m ahead on AEO.
                    </strong>{" "}
                    AI search is changing how people find services. Most
                    agencies haven&apos;t caught up. I&apos;ve been optimizing
                    for it since the beginning.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-terracotta-500/10 text-terracotta-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold">
                    5
                  </span>
                  <span>
                    <strong className="text-slate-900">
                      Half the price, better attention.
                    </strong>{" "}
                    $1,250/month vs $2,500+ at typical agencies. Not because I
                    cut corners — because I don&apos;t have their overhead.
                  </span>
                </li>
              </ul>

              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900 mt-12 mb-4">
                The Bottom Line
              </h2>

              <p className="text-slate-600 leading-relaxed">
                You&apos;ve probably been burned by an agency before. Or
                you&apos;ve watched competitors outrank you for years while
                wondering what they&apos;re doing differently.
              </p>

              <p className="text-slate-600 leading-relaxed">
                I can&apos;t guarantee rankings — anyone who does is lying. But
                I can guarantee honest work, clear communication, and strategies
                that have actually worked for my own business.
              </p>

              <p className="text-lg text-slate-700 leading-relaxed mt-8">
                If that sounds like what you&apos;re looking for, let&apos;s
                talk.
              </p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <CalendlyButton
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all cursor-pointer"
              >
                Book a Free Call
                <ArrowIcon />
              </CalendlyButton>
              <a
                href="mailto:hunter@obieo.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-all"
              >
                Email Me Directly
              </a>
            </div>
          </div>
        </section>
    </div>
  );
}

