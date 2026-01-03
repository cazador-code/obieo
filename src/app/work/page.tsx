import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container, Button } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Our Work | Obieo',
  description: 'See how we help home service businesses grow with websites that convert.',
}

export default function WorkPage() {
  return (
    <>
      {/* Hero */}
      <Section size="lg" className="pt-32">
        <Container>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-6">
            Our Work
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl">
            Results that speak for themselves. See how we&apos;ve helped home service businesses
            grow with websites built to convert.
          </p>
        </Container>
      </Section>

      {/* Featured Project Placeholder */}
      <Section variant="alternate">
        <Container>
          <div
            data-cursor="view"
            className="bg-[var(--bg-card)] rounded-2xl p-8 md:p-12 border border-[var(--border)] cursor-pointer"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-sm font-medium text-[var(--accent)] mb-2">
                  Featured Case Study
                </p>
                <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
                  Lapeyre Roofing
                </h2>
                <p className="text-[var(--text-secondary)] mb-6">
                  From invisible online to the top roofer in Baton Rouge.
                  See how we transformed their digital presence.
                </p>
                <div className="flex gap-6 mb-8">
                  <div>
                    <p className="text-3xl font-semibold text-[var(--accent)]">+147%</p>
                    <p className="text-sm text-[var(--text-secondary)]">Organic Leads</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-[var(--accent)]">#1</p>
                    <p className="text-sm text-[var(--text-secondary)]">Google Ranking</p>
                  </div>
                </div>
                <Link href="/work/lapeyre-roofing">
                  <Button>View Case Study</Button>
                </Link>
              </div>
              <div className="aspect-video bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center">
                <p className="text-[var(--text-muted)]">Project Image</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* More Projects Placeholder */}
      <Section>
        <Container>
          <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-8">
            More Projects
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                data-cursor="view"
                className="aspect-[4/3] bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center border border-[var(--border)] cursor-pointer"
              >
                <p className="text-[var(--text-muted)]">Coming Soon</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section variant="alternate">
        <Container className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
            Ready for results like these?
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Let&apos;s talk about how we can transform your online presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz">
              <Button size="lg">Get Your Free Website Score</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Book a Call</Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
