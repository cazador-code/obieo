'use client'

import { useState } from 'react'
import CalendlyButton from '@/components/CalendlyButton'
import { CheckIcon, XIcon, WarningIcon, ChevronDownIcon, LightningIcon, ArrowRightIcon } from '@/components/ui'

const testPrompts = [
  {
    prompt: "Recommend a [YOUR SERVICE] in [YOUR CITY]",
    example: "Recommend a plumber in Phoenix",
    what_to_look_for: "Does your business name appear? Are you in the top 3?"
  },
  {
    prompt: "What's the best [YOUR SERVICE] company in [YOUR CITY]?",
    example: "What's the best HVAC company in Dallas?",
    what_to_look_for: "AI often picks ONE business as 'best' - is it you?"
  },
  {
    prompt: "Who should I call for [SPECIFIC PROBLEM] in [YOUR CITY]?",
    example: "Who should I call for a clogged drain in Houston?",
    what_to_look_for: "Problem-specific queries show if AI trusts you for emergencies"
  },
  {
    prompt: "[YOUR COMPETITOR NAME] vs alternatives in [YOUR CITY]",
    example: "Smith Electric vs alternatives in Denver",
    what_to_look_for: "See if you come up as a recommended alternative"
  }
]

const aiFactors = [
  {
    title: "Machine-Readable Structure",
    description: "AI needs structured data to understand your business. LocalBusiness schema, Service schema, FAQ markup, and AggregateRating schema help AI parse who you are, what you do, and how customers rate you.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    title: "Intent-Matched Content",
    description: "AI interprets queries as intents. Your content needs to answer real questions directly. Front-load descriptions with: who you serve, what problem you solve, and what makes you different.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: "Review Sentiment & Volume",
    description: "AI reads review content to make natural-language recommendations. Reviews mentioning specific outcomes ('fixed the leak same day', 'explained everything clearly') give AI reasons to recommend you for those needs.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  },
  {
    title: "Consistent Data Across Platforms",
    description: "AI pulls from three sources: your website, crawled data across the web, and third-party platforms. Your name, address, phone, services, and hours must match exactly everywhere or AI gets confused about who you are.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: "Authoritative Citations",
    description: "Being featured in expert reviews, local news, industry publications, and authoritative directories builds credibility. AI prioritizes trustworthy sources. If credible sites mention you, AI trusts you more.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    )
  },
  {
    title: "Verified Trust Signals",
    description: "Certifications, licenses, BBB accreditation, manufacturer partnerships, and verified credentials act as factual entities AI can reference. 'Licensed and insured', 'BBB A+ rated', 'Carrier Factory Authorized' are signals AI uses to establish authority.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  }
]

const faqs = [
  {
    question: "Why does AI only recommend 2-3 businesses instead of 10?",
    answer: "Unlike Google which shows multiple options, AI assistants are designed to give direct answers. When someone asks for a recommendation, AI picks the businesses it has the most confidence in based on its training data. If you're not in that small group, you're invisible to AI-assisted searches."
  },
  {
    question: "What's the difference between SEO, AEO, and GEO?",
    answer: "SEO (Search Engine Optimization) is how you rank in Google's list of results. AEO (Answer Engine Optimization) is about providing clear, accurate data that AI can interpret. GEO (Generative Engine Optimization) is about building credibility so AI views you as authoritative. You need all three now: SEO for traditional search, AEO and GEO for AI recommendations."
  },
  {
    question: "Does this mean SEO doesn't matter anymore?",
    answer: "Traditional SEO still matters for Google rankings. But AI visibility is becoming a separate channel. Many businesses ranking #1 on Google aren't being recommended by ChatGPT or other AI tools. The businesses winning in AI search are optimizing for both."
  },
  {
    question: "Can I pay to show up in AI recommendations?",
    answer: "No. Unlike Google Ads, you cannot pay for placement in ChatGPT, Claude, or Perplexity recommendations. AI recommendations are based on the information available in the AI's training data and what it can find on the web. This is why early movers have a significant advantage. There's no way to buy your way in later."
  },
  {
    question: "How often does AI update what it recommends?",
    answer: "AI models have knowledge cutoffs (when their training data stops), but many now also search the web in real-time. This means your current web presence matters. Building consistent authority signals over time is key."
  },
  {
    question: "What if my competitor shows up but I don't?",
    answer: "This means they have stronger signals in the areas AI weighs: more web mentions, better structured content, more reviews, or clearer authority signals. An audit can identify exactly where the gaps are and what it would take to close them."
  }
]

const statusCards = [
  {
    status: 'green',
    title: "You're Being Recommended",
    description: "Great. You're ahead of most competitors. But AI recommendations change as new data comes in. The question now is how to maintain and strengthen your position.",
    Icon: CheckIcon,
    colors: { bg: 'bg-green-50', border: 'border-green-200', iconBg: 'bg-green-500', title: 'text-green-900', text: 'text-green-800' }
  },
  {
    status: 'amber',
    title: "You Show Up Sometimes",
    description: "AI has some information about you, but not enough to consistently recommend you. You're on the edge. Specific improvements could push you into the top recommendations.",
    Icon: WarningIcon,
    colors: { bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-500', title: 'text-amber-900', text: 'text-amber-800' }
  },
  {
    status: 'red',
    title: "You're Not Showing Up",
    description: "AI doesn't have enough trust signals to recommend you. Every time a homeowner asks AI for a recommendation in your service area, you're invisible. Your competitors are getting those calls.",
    Icon: XIcon,
    colors: { bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-500', title: 'text-red-900', text: 'text-red-800' }
  }
]

const actionSteps = [
  {
    title: "Audit All Three Data Sources",
    description: "AI pulls from your website, crawled data across the web, and third-party platforms. Check each one:",
    bullets: [
      { bold: "Your website:", text: "Is every service page complete? Do you have FAQ content?" },
      { bold: "Google Business Profile:", text: "All categories, services, hours, photos filled in?" },
      { bold: "Directories:", text: "Yelp, BBB, Angi, HomeAdvisor, Thumbtack. Is the info consistent everywhere?" }
    ]
  },
  {
    title: "Structure Content for Intent",
    description: "AI interprets queries as intents. Structure your content to match how people actually ask:",
    bullets: [
      { bold: "Front-load benefits:", text: "Who you serve, what problem you solve, what makes you different" },
      { bold: "Add use-case context:", text: "\"Best for emergency repairs\" or \"Specializing in homes built before 1980\"" },
      { bold: "Mirror real queries:", text: "Create headings like \"How much does a water heater replacement cost in [City]?\"" },
      { bold: "Write descriptive titles:", text: "\"24/7 Emergency Plumber in Phoenix | Licensed & Same-Day Service\"" }
    ]
  },
  {
    title: "Build Authoritative Citations",
    description: "AI prioritizes trustworthy sources. Get mentioned on sites AI already trusts:",
    bullets: [
      { text: "Local news features or \"best of\" lists" },
      { text: "Industry publications and trade associations" },
      { text: "Chamber of commerce and business associations" },
      { text: "Manufacturer partner pages (if you're a certified installer)" }
    ]
  },
  {
    title: "Generate Reviews That Give AI Reasons",
    description: "AI reads review content to make natural-language recommendations. Reviews with specific outcomes help:",
    bullets: [
      { text: "\"Fixed the leak same day\" → AI recommends you for emergency calls" },
      { text: "\"Explained everything before starting\" → AI recommends you for transparency" },
      { text: "\"Fair price, no hidden fees\" → AI recommends you for honest pricing" },
      { text: "\"Showed up exactly when they said\" → AI recommends you for reliability" }
    ]
  }
]

export default function AIVisibilityGuidePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="pt-16 sm:pt-20">
      {/* Hero */}
      <section className="bg-cream-100 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-terracotta-500/10 text-terracotta-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <LightningIcon className="w-4 h-4" />
            Free AI Visibility Check
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 mb-6">
            Is ChatGPT Recommending You or Your Competitors?
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
            Homeowners are asking AI for recommendations. AI doesn't show 10 results. It picks 2-3 businesses. Here's how to check if you're one of them.
          </p>
        </div>
      </section>

      {/* The Reality Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-stone-900 mb-6">
            The Shift That's Already Happening
          </h2>
          <div className="prose prose-lg prose-stone max-w-none">
            <p>
              When someone Googles "plumber near me," they see a list of options. They compare, click around, maybe check a few websites.
            </p>
            <p>
              When someone asks ChatGPT "recommend a plumber in Phoenix," they get 2-3 names. That's it. The AI picks who it trusts, and the person calls those businesses.
            </p>
            <p>
              <strong>If you're not one of those 2-3 names, you never had a chance.</strong>
            </p>
            <p>
              This isn't about ads. These businesses aren't paying for placement. They're showing up because AI has decided they're the answer.
            </p>
          </div>

          {/* AEO vs SEO callout */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="bg-stone-100 rounded-xl p-6">
              <h3 className="font-[family-name:var(--font-display)] font-bold text-stone-900 mb-2">Traditional SEO</h3>
              <p className="text-stone-600 text-sm">How you won in search. Optimizing to rank in a list of 10 results.</p>
            </div>
            <div className="bg-terracotta-50 rounded-xl p-6 border border-terracotta-200">
              <h3 className="font-[family-name:var(--font-display)] font-bold text-terracotta-900 mb-2">AEO & GEO</h3>
              <p className="text-terracotta-800 text-sm">How you win the recommendation. Optimizing to be the answer AI gives.</p>
            </div>
          </div>
          <p className="text-stone-500 text-sm mt-4">
            <strong>AEO</strong> (Answer Engine Optimization) and <strong>GEO</strong> (Generative Engine Optimization) are the new disciplines. The game has shifted from generating traffic to earning influence: being the business AI trusts enough to recommend.
          </p>
        </div>
      </section>

      {/* Test Prompts Section */}
      <section className="bg-cream-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Step 1: Check Your AI Visibility Right Now
          </h2>
          <p className="text-lg text-stone-600 mb-8">
            Open ChatGPT, Claude, or Perplexity and try these prompts with your service and city:
          </p>

          <div className="space-y-4">
            {testPrompts.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-stone-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-terracotta-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-sm bg-stone-100 px-3 py-2 rounded mb-2 text-stone-800">
                      "{item.prompt}"
                    </p>
                    <p className="text-sm text-stone-500 mb-2">
                      Example: <span className="text-stone-700">{item.example}</span>
                    </p>
                    <p className="text-sm text-terracotta-600 font-medium">
                      {item.what_to_look_for}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-stone-900 rounded-xl text-white">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">
              Pro Tip: Test Your Competitors Too
            </h3>
            <p className="text-stone-300">
              Search for your top 3 competitors by name. See who AI recommends as alternatives. This shows you exactly who you're losing to in AI search.
            </p>
          </div>
        </div>
      </section>

      {/* Understanding Results Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Step 2: Understanding What You Find
          </h2>
          <p className="text-lg text-stone-600 mb-8">
            After running those tests, you'll fall into one of three categories:
          </p>

          <div className="grid gap-6">
            {statusCards.map((card) => (
              <div key={card.status} className={`${card.colors.bg} border ${card.colors.border} rounded-xl p-6`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${card.colors.iconBg} rounded-full flex items-center justify-center`}>
                    <card.Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`font-[family-name:var(--font-display)] text-xl font-bold ${card.colors.title}`}>{card.title}</h3>
                </div>
                <p className={card.colors.text}>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What AI Looks For Section */}
      <section className="bg-stone-900 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-white mb-4">
            Step 3: How AI Decides Who to Recommend
          </h2>
          <p className="text-lg text-stone-400 mb-6">
            When someone asks "recommend a plumber in Phoenix," AI doesn't just search. It reasons. It breaks down the query, looks for commercial signals, checks contextual relevance, and formulates a response with explanations.
          </p>
          <p className="text-stone-400 mb-12">
            AI pulls from three data sources: <span className="text-white">your website</span>, <span className="text-white">crawled data across the web</span>, and <span className="text-white">third-party platforms</span> (Google Business, Yelp, directories). Here's what it weighs:
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {aiFactors.map((factor, index) => (
              <div key={index} className="bg-stone-800 rounded-xl p-6">
                <div className="w-12 h-12 bg-terracotta-500/20 rounded-xl flex items-center justify-center text-terracotta-400 mb-4">
                  {factor.icon}
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white mb-2">
                  {factor.title}
                </h3>
                <p className="text-stone-400 text-sm">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Step 4: What You Can Do About It
          </h2>
          <p className="text-lg text-stone-600 mb-8">
            Improving AI visibility isn't a quick fix. It requires building genuine authority signals across the web. Here's the honest breakdown:
          </p>

          {/* Completeness callout */}
          <div className="bg-stone-900 text-white rounded-xl p-6 mb-8">
            <p className="text-lg font-medium">
              "Completeness beats cleverness. Businesses with more filled-in fields and complete information rank higher. Period."
            </p>
            <p className="text-stone-400 text-sm mt-2">
              Most businesses already have the information they need. It's just buried, incomplete, or inconsistent across platforms.
            </p>
          </div>

          <div className="space-y-8">
            {actionSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-terracotta-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-stone-900 mb-2">{step.title}</h3>
                  <p className="text-stone-600 mb-3">{step.description}</p>
                  <ul className="text-stone-600 text-sm space-y-1 ml-4">
                    {step.bullets.map((bullet, i) => (
                      <li key={i}>
                        • {'bold' in bullet && <strong>{bullet.bold}</strong>} {bullet.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-cream-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-stone-900 mb-8">
            Common Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-[family-name:var(--font-display)] font-semibold text-stone-900">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-stone-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-stone-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-terracotta-500 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-white mb-4">
            Want a Deeper Analysis?
          </h2>
          <p className="text-lg text-terracotta-100 mb-8 max-w-2xl mx-auto">
            We'll audit your AI visibility across ChatGPT, Claude, and Perplexity. We'll identify the specific gaps keeping you out of recommendations. No pitch, just data.
          </p>
          <CalendlyButton
            source="ai-visibility-guide"
            className="inline-flex items-center gap-2 bg-white text-terracotta-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-terracotta-50 transition-colors"
          >
            Get Your Free AI Visibility Audit
            <ArrowRightIcon className="w-5 h-5" />
          </CalendlyButton>
          <p className="text-terracotta-200 text-sm mt-4">
            15-minute call • No obligation • See exactly where you stand
          </p>
        </div>
      </section>
    </div>
  )
}
