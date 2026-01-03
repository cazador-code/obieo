import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries We Serve — Obieo | SEO for Home Service Businesses",
  description:
    "SEO and AEO services for roofing, HVAC, plumbing, electrical, pest control, landscaping, and other home service businesses.",
};

const industries = [
  {
    name: "Roofing",
    slug: "roofing",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    description: "Residential and commercial roofing contractors. Storm damage, repairs, replacements, and new installations.",
    painPoints: ["Seasonal demand swings", "Storm chaser competition", "High-ticket sales cycle"],
  },
  {
    name: "HVAC",
    slug: "hvac",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    description: "Heating, ventilation, and air conditioning. Installations, repairs, maintenance, and emergency service.",
    painPoints: ["Emergency call volume", "Seasonal peaks", "Maintenance contract competition"],
  },
  {
    name: "Plumbing",
    slug: "plumbing",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    description: "Residential and commercial plumbing. Drain cleaning, water heaters, pipe repair, and repiping.",
    painPoints: ["24/7 emergency expectations", "Local pack competition", "Trust factor for in-home service"],
  },
  {
    name: "Electrical",
    slug: "electrical",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    description: "Licensed electricians. Panel upgrades, wiring, lighting, EV charger installations, and repairs.",
    painPoints: ["Licensing trust signals", "New construction vs. service", "EV charger market growth"],
  },
  {
    name: "Pest Control",
    slug: "pest-control",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    description: "Residential and commercial pest management. Termites, rodents, insects, and wildlife control.",
    painPoints: ["Recurring service model", "Seasonal pest spikes", "Reputation management"],
  },
  {
    name: "Landscaping",
    slug: "landscaping",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    description: "Lawn care, hardscaping, irrigation, and landscape design. Residential and commercial properties.",
    painPoints: ["Seasonal business model", "Crew scalability", "Design vs. maintenance balance"],
  },
  {
    name: "Cleaning Services",
    slug: "cleaning",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    description: "House cleaning, janitorial, carpet cleaning, and move-out cleans. Recurring and one-time services.",
    painPoints: ["Low barrier to entry", "Recurring client retention", "Trust for in-home access"],
  },
  {
    name: "Garage Doors",
    slug: "garage-doors",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    description: "Garage door installation, repair, and opener services. Springs, panels, and full replacements.",
    painPoints: ["Emergency repair demand", "Same-day service expectations", "Parts inventory management"],
  },
  {
    name: "Painting",
    slug: "painting",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    description: "Interior and exterior painting. Residential repaints, new construction, and commercial projects.",
    painPoints: ["Estimate-to-close ratio", "Crew scheduling", "Weather dependency for exteriors"],
  },
  {
    name: "Flooring",
    slug: "flooring",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
    description: "Hardwood, tile, LVP, carpet, and epoxy flooring. Installation, refinishing, and repairs.",
    painPoints: ["Material lead times", "Subcontractor quality", "Showroom vs. in-home sales"],
  },
];

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

export default function IndustriesPage() {
  return (
    <>
      <Header />
      <main className="pt-16 sm:pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-b from-cream-100 to-cream-50 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                Industries I Serve
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                I specialize in home service businesses. These are the trades I
                know best — because I run one myself and have studied the others
                inside and out.
              </p>
            </div>
          </div>
        </section>

        {/* Industries Grid */}
        <section className="bg-cream-50 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {industries.map((industry) => (
                <div
                  key={industry.slug}
                  className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 hover:shadow-lg hover:shadow-slate-200/50 transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-terracotta-500/10 text-terracotta-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      {industry.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-slate-900">
                        {industry.name}
                      </h2>
                      <p className="mt-2 text-slate-600 leading-relaxed">
                        {industry.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Common Challenges
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {industry.painPoints.map((point, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 text-white py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Don&apos;t See Your Industry?
            </h2>
            <p className="mt-4 text-slate-300 text-lg">
              If you run a home service business, there&apos;s a good chance I
              can help. Let&apos;s talk about your specific situation.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg transition-all"
              >
                Book a Free Call
                <ArrowIcon />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition-all"
              >
                View Services
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

