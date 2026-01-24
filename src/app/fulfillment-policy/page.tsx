import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui'

// JSON-LD Schema for Fulfillment Policy Page
const fulfillmentSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Fulfillment Policy',
  description: 'Fulfillment policy for Obieo services. Covers service commencement, refund terms, and cancellation procedures.',
  url: 'https://obieo.com/fulfillment-policy',
  dateModified: '2026-01-04',
  inLanguage: 'en-US',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Obieo',
    url: 'https://obieo.com',
  },
}

export const metadata: Metadata = {
  title: 'Fulfillment Policy | Obieo',
  description: 'Fulfillment policy for Obieo services.',
}

export default function FulfillmentPolicyPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fulfillmentSchema) }}
      />

      <Section size="lg" className="pt-32">
      <Container size="md">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
          Fulfillment Policy
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-12">Effective Date: January 4, 2026</p>

        <div className="prose prose-lg max-w-none text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-headings:font-[family-name:var(--font-display)] prose-strong:text-[var(--text-primary)]">
          <h2>Service Commencement</h2>
          <p>
            Services begin after your onboarding call, where Obieo collects necessary information
            to deliver agreed services.
          </p>

          <h2>Proposal Contract</h2>
          <p>
            All service details, including terms, deliverables, and pricing, will be outlined in a
            formal proposal contract.
          </p>

          <h2>Refund Terms</h2>
          <p>
            Obieo maintains a strict no-refund policy. All payments made are final and
            non-refundable due to the nature of digital marketing work.
          </p>

          <h2>Ending Your Agreement</h2>
          <p>
            Clients must submit at least 30 days&apos; notice prior to your next billing cycle via
            email or established communication channels. Missing this deadline results in full
            charges for the upcoming month.
          </p>

          <h2>Results Disclaimer</h2>
          <p>
            We do not guarantee specific results from our services. Outcomes depend on variables
            like industry trends and platform algorithms beyond our control.
          </p>

          <h2>Liability Limits</h2>
          <p>
            Obieo disclaims responsibility for external issues (such as platform account
            suspensions) but commits to assisting clients at no additional cost to resolve such
            problems.
          </p>
          <p>
            Outcomes vary significantly based on market conditions, competition, budget, and client
            execution.
          </p>

          <h2>Contact</h2>
          <p>
            <a href="mailto:hello@obieo.com" className="text-[var(--accent)]">hello@obieo.com</a>
          </p>
        </div>
      </Container>
    </Section>
    </>
  )
}
