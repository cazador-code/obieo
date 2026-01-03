import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import CalendlyButton from "@/components/CalendlyButton";

// Icons as inline SVGs to keep it simple
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

const XIcon = () => (
  <svg
    className="w-5 h-5 text-slate-400 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
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

export default function Home() {
  return (
    <>
      <Header />
      <main className="pt-16 sm:pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-100 to-cream-50">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="max-w-3xl">
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                Get 20+ Organic Leads/Month Without Paying for Ads
                <span className="text-terracotta-500">
                  {" "}
                  — From Someone Who Actually Knows Your Trade
                </span>
          </h1>

              <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
                SEO, AEO, and website optimization for home service businesses.{" "}
                <strong className="text-slate-900">
                  Half the price of big agencies. Twice the attention.
                </strong>
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <CalendlyButton className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-terracotta-500/20 cursor-pointer">
                  Book a Free Audit Call
                  <ArrowIcon />
                </CalendlyButton>
                <a
                  href="tel:5551234567"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-all"
                >
                  Or Text: (555) 123-4567
                </a>
              </div>

              <p className="mt-6 text-sm text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-terracotta-400 rounded-full" />I also
                run Lapeyre Roofing — I know this business.
              </p>
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="bg-slate-900 text-white py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Tired of Agencies That Don&apos;t Deliver?
              </h2>

              <div className="mt-8 space-y-4">
                {[
                  "Paying $2,000–$3,000/month for \"SEO\" with no leads to show for it",
                  "Generic pages, junk backlinks, zero understanding of your trade",
                  "You're just another ticket in their queue",
                  "They put the wrong logo on your site (yes, this actually happened)",
                ].map((pain, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                  >
                    <span className="flex-shrink-0 w-8 h-8 bg-terracotta-500/20 text-terracotta-400 rounded-full flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                      {pain}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-slate-400 text-lg">
                You&apos;re not crazy. Most SEO agencies are built to churn, not
                to actually help.
              </p>
            </div>
          </div>
        </section>

        {/* SOLUTION SECTION */}
        <section className="bg-cream-50 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Here&apos;s What Actually Works
              </h2>
              <p className="mt-4 text-slate-600 text-lg leading-relaxed">
                A clear process: audit everything, fix the foundations, then
                compound growth month over month. Plus, optimization for both
                Google <em>and</em> AI search like ChatGPT and Perplexity (that&apos;s
                AEO).
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* Sprint Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-shadow">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-terracotta-500/10 text-terracotta-600 rounded-full text-xs font-semibold uppercase tracking-wide">
                  One-Time
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-slate-900">
                  Fix & Foundation Sprint
                </h3>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  $2,500
                </p>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  A 2–4 week engagement to audit, fix, and set up the
                  fundamentals your site is missing.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Full website + GBP audit",
                    "Core page rewrites (conversion-focused)",
                    "Tracking setup (GA4, Search Console)",
                    "AEO foundation: schema, FAQ, snippets",
                    "Local SEO baseline + citations",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckIcon />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services#sprint"
                  className="mt-6 inline-flex items-center gap-2 text-terracotta-600 font-semibold text-sm hover:text-terracotta-700 transition-colors"
                >
                  Learn more <ArrowIcon />
                </Link>
              </div>

              {/* Retainer Card */}
              <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta-500/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-terracotta-500/20 text-terracotta-300 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Monthly
                  </div>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold">
                    Ongoing Growth Retainer
                  </h3>
                  <p className="mt-1 text-3xl font-bold text-white">
                    $1,250<span className="text-lg font-normal text-slate-400">/mo</span>
                  </p>
                  <p className="mt-4 text-slate-300 leading-relaxed">
                    Continuous improvements that compound. 3-month minimum, then
                    month-to-month.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      "2–4 new/refreshed pages per month",
                      "GBP management (posts, photos, reviews)",
                      "AEO optimization + schema updates",
                      "Quality backlink building",
                      "Monthly report: traffic, rankings, leads",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <CheckIcon />
                        <span className="text-slate-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/services#retainer"
                    className="mt-6 inline-flex items-center gap-2 text-terracotta-400 font-semibold text-sm hover:text-terracotta-300 transition-colors"
                  >
                    Learn more <ArrowIcon />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY OBIEO / COMPARISON SECTION */}
        <section className="bg-cream-100 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-center">
              Why Obieo?
            </h2>
            <p className="mt-4 text-slate-600 text-center text-lg max-w-2xl mx-auto">
              Here&apos;s how working with me compares to the typical agency
              experience.
            </p>

            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[600px] bg-white rounded-xl overflow-hidden shadow-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-4 sm:p-6 font-semibold text-slate-900"></th>
                    <th className="text-left p-4 sm:p-6 font-semibold text-terracotta-600 bg-terracotta-500/5">
                      Obieo
                    </th>
                    <th className="text-left p-4 sm:p-6 font-semibold text-slate-500">
                      Typical Agency
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ["Who you work with", "Owner-to-owner", "Junior account managers"],
                    ["Industry knowledge", "I learn YOUR market first", "They ask you to teach them"],
                    ["Content quality", "Quality pages that convert", "10 thin pages/month"],
                    ["AI search ready", "AEO-optimized", "Stuck on 2019 SEO"],
                    ["Backlinks", "Real, relevant links", "Link farm junk"],
                    ["Monthly cost", "$1,250/month", "$2,500+/month"],
                  ].map(([label, obieo, agency], i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 sm:p-6 text-slate-600 font-medium">
                        {label}
                      </td>
                      <td className="p-4 sm:p-6 bg-terracotta-500/5">
                        <span className="flex items-center gap-2 text-slate-900 font-medium">
                          <CheckIcon /> {obieo}
                        </span>
                      </td>
                      <td className="p-4 sm:p-6 text-slate-500">
                        <span className="flex items-center gap-2">
                          <XIcon /> {agency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* WHO THIS IS FOR / NOT FOR */}
        <section className="bg-cream-50 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
              {/* For */}
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                  <span className="w-10 h-10 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
                    <CheckIcon />
                  </span>
                  Who This Is For
                </h2>
                <ul className="mt-8 space-y-4">
                  {[
                    "Home service owners (roofing, HVAC, plumbing, electrical, pest control, landscaping)",
                    "Doing $500K–$5M/year in revenue",
                    "Want more organic leads without ad spend",
                    "Frustrated with past agency experiences",
                    "Ready to invest in long-term growth",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not For */}
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                  <span className="w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center">
                    <XIcon />
                  </span>
                  Who This Is NOT For
                </h2>
                <ul className="mt-8 space-y-4">
                  {[
                    "Anyone expecting guaranteed rankings (that's a red flag)",
                    "Anyone expecting results in 30 days (SEO takes time)",
                    "Owners who won't provide access or feedback",
                    "Businesses looking for the cheapest option possible",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <XIcon />
                      <span className="text-slate-500">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-slate-900 text-white py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-center">
              How It Works
            </h2>
            <p className="mt-4 text-slate-400 text-center text-lg max-w-xl mx-auto">
              Simple, straightforward process. No mystery, no runaround.
            </p>

            <div className="mt-12 grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Book a 20-Min Call",
                  desc: "I'll ask about your business, what's working, and what's not. No pitch, just questions.",
                },
                {
                  step: "02",
                  title: "Get a Free Audit",
                  desc: "I'll do a quick audit of your site and GBP — free — so you can see exactly what's broken.",
                },
                {
                  step: "03",
                  title: "We Start (If It's a Fit)",
                  desc: "Sprint or Retainer, your call. Either way, you'll know the plan before we begin.",
                },
              ].map((item, i) => (
                <div key={i} className="relative">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-700 to-transparent" />
                  )}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 h-full">
                    <span className="font-[family-name:var(--font-display)] text-4xl font-bold text-terracotta-500">
                      {item.step}
                    </span>
                    <h3 className="mt-4 text-xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-slate-400 leading-relaxed">
                      {item.desc}
          </p>
        </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="bg-cream-50 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-center">
              Frequently Asked Questions
            </h2>

            <div className="mt-12 space-y-6">
              {[
                {
                  q: "Do you guarantee leads or rankings?",
                  a: "No — and you should run from anyone who does. SEO is competitive and depends on many factors. What I guarantee is the work: quality pages, real backlinks, proper optimization, and honest reporting.",
                },
                {
                  q: "How is this different from [big agency]?",
                  a: "Three things: I keep a small client list so you're never just a ticket number. I actually understand home services because I run one. And I'm half the price with no junior account managers.",
                },
                {
                  q: "What if I just need a one-time fix?",
                  a: "That's exactly what the Sprint is for. $2,500, 2–4 weeks, and you'll have a solid foundation. Many clients start there and upgrade to the retainer once they see the difference.",
                },
                {
                  q: "Can you help with Google Ads?",
                  a: "Paid ads aren't my focus — I specialize in organic. But I can refer you to someone good if that's what you need.",
                },
                {
                  q: "What markets do you work in?",
                  a: "US-wide. I learn your specific market first — competitors, search volume, local factors — before building your strategy.",
                },
                {
                  q: "What's AEO?",
                  a: "Answer Engine Optimization. It's optimizing your content to show up in AI search results (ChatGPT, Perplexity, Google AI Overviews). The future of search is here and most agencies haven't caught up.",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-6"
                >
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {faq.q}
                  </h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CASE STUDY PLACEHOLDER */}
        {/* TODO: Add case study/proof section once testimonials and results are available */}

        {/* FINAL CTA */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 sm:py-24 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-terracotta-500/5 rounded-full blur-3xl" />

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Stop Wasting Money on SEO That Doesn&apos;t Work?
            </h2>
            <p className="mt-4 text-slate-300 text-lg max-w-xl mx-auto">
              Let&apos;s talk about your business. 20 minutes, no pitch, no pressure.
              Just an honest conversation about what&apos;s broken and how to fix it.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <CalendlyButton className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-terracotta-500/30 text-lg cursor-pointer">
                Book Your Free Audit Call
                <ArrowIcon />
              </CalendlyButton>
            </div>

            <p className="mt-6 text-slate-400">
              Or text me directly:{" "}
              <a
                href="tel:5551234567"
                className="text-terracotta-400 hover:text-terracotta-300 font-semibold transition-colors"
              >
                (555) 123-4567
              </a>
            </p>
        </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
