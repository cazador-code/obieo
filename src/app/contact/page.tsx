import CalendlyButton from "@/components/CalendlyButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Obieo | Book a Free Audit Call",
  description:
    "Book a free 20-minute call to discuss your SEO needs. Or email Hunter directly.",
};

export default function ContactPage() {
  return (
    <div className="pt-16 sm:pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-b from-cream-100 to-cream-50 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                Let&apos;s Talk About Your Business
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Book a free 20-minute call. I&apos;ll ask about your business,
                take a quick look at your site, and give you honest feedback —
                no pitch, no pressure.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="bg-cream-50 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Calendar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-slate-900">
                  Book a Call
                </h2>
                <p className="mt-2 text-slate-600">
                  Pick a time that works for you. 20 minutes, no obligation.
                </p>

                {/* Calendly Popup Button */}
                <div className="mt-6">
                  <CalendlyButton
                    className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all cursor-pointer text-lg"
                  >
                    Schedule Your Free Call
                  </CalendlyButton>
                  <p className="text-slate-400 text-xs mt-3 text-center">
                    Click to open the scheduling popup
                  </p>
                </div>
              </div>

              {/* Direct Contact */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                  <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-slate-900">
                    Or Reach Out Directly
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Prefer email? I respond to everything personally.
                  </p>

                  <div className="mt-6">
                    <a
                      href="mailto:hunter@obieo.com"
                      className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                    >
                      <div className="w-12 h-12 bg-terracotta-500/10 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-terracotta-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-terracotta-600 transition-colors">
                          hunter@obieo.com
                        </p>
                        <p className="text-sm text-slate-500">
                          I reply within 24 hours
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* What to Expect */}
                <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white">
                  <h3 className="font-semibold text-lg">
                    What to Expect on the Call
                  </h3>
                  <ul className="mt-4 space-y-3 text-slate-300 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 bg-terracotta-500/20 text-terracotta-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                        1
                      </span>
                      I&apos;ll ask about your business, services, and goals
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 bg-terracotta-500/20 text-terracotta-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                        2
                      </span>
                      We&apos;ll look at your current site and GBP together
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 bg-terracotta-500/20 text-terracotta-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                        3
                      </span>
                      I&apos;ll point out obvious issues (free mini-audit)
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 bg-terracotta-500/20 text-terracotta-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                        4
                      </span>
                      If it seems like a fit, we talk next steps
                    </li>
                  </ul>
                  <p className="mt-4 text-slate-400 text-sm">
                    No high-pressure sales. If I don&apos;t think I can help,
                    I&apos;ll tell you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Contact Form - Placeholder */}
        <section className="bg-cream-100 py-16 sm:py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-slate-900">
                Send a Message
              </h2>
              <p className="mt-2 text-slate-600">
                Don&apos;t want to schedule yet? Just drop me a note.
              </p>
            </div>

            <form className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 transition-colors outline-none"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 transition-colors outline-none"
                    placeholder="Smith Roofing"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 transition-colors outline-none"
                    placeholder="john@smithroofing.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 transition-colors outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Your Website (if you have one)
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 transition-colors outline-none"
                  placeholder="https://smithroofing.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  What can I help with?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 transition-colors outline-none resize-none"
                  placeholder="Tell me a bit about your business and what you're looking for..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all"
              >
                Send Message
              </button>

              <p className="text-xs text-slate-500 text-center">
                This form is a placeholder. Connect it to Formspree, Netlify
                Forms, or similar.
              </p>
            </form>
          </div>
        </section>
    </div>
  );
}

