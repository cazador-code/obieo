import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui'

// JSON-LD Schema for Terms and Conditions Page
const termsSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms and Conditions',
  description: 'Terms and conditions for using Obieo services. Covers refund policy, billing authorization, cancellation, and legal protections.',
  url: 'https://obieo.com/terms-and-conditions',
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
  title: 'Terms and Conditions | Obieo',
  description: 'Terms and conditions for using Obieo services.',
}

export default function TermsAndConditionsPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }}
      />

      <Section size="lg" className="pt-32">
      <Container size="md">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
          Terms & Conditions
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-12">Last Updated: January 4, 2026</p>

        <div className="prose prose-lg max-w-none text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-headings:font-[family-name:var(--font-display)] prose-strong:text-[var(--text-primary)]">
          <h2>Overview</h2>
          <p>
            These foundational rules apply to website use and purchases. Service-specific details
            appear exclusively in individual signed proposals.
          </p>

          <h2>1. Refund Policy</h2>
          <p>Custom B2B marketing services are generally non-refundable after a billing cycle starts.</p>
          <p>Refunds or credits are provided for:</p>
          <ul>
            <li>Duplicate charges</li>
            <li>Incorrect billing amounts</li>
            <li>Charges processed after valid cancellation</li>
            <li>Clear billing mistakes by Obieo</li>
          </ul>
          <p>Consult your signed proposal for complete details.</p>

          <h2>2. Recurring Billing Authorization</h2>
          <p>
            For recurring fees, you authorize Obieo and payment processors (like Stripe) to
            automatically charge your payment method per your proposal terms.
          </p>
          <p>Your proposal specifies:</p>
          <ul>
            <li>Billing frequency and amounts</li>
            <li>Start dates</li>
            <li>Minimum contract terms</li>
            <li>Early termination fees</li>
            <li>Required notice periods</li>
          </ul>
          <p>Billing continues until cancelled per your proposal instructions.</p>

          <h2>3. Cancellation Method</h2>
          <p>
            Cancel services anytime using instructions in your proposal, or email:{' '}
            <a href="mailto:hello@obieo.com" className="text-[var(--accent)]">hello@obieo.com</a>
          </p>
          <p>Cancellation takes effect upon receipt and follows your proposal&apos;s terms.</p>

          <h2>4. General Legal Protections</h2>
          <p>
            <strong>No Guarantees:</strong> Obieo does not guarantee specific results such as search
            rankings, lead volume, conversions, or revenue.
          </p>
          <p>
            <strong>Liability Limit:</strong> Maximum liability equals fees paid during the most
            recent billing period; excludes indirect or consequential damages.
          </p>
          <p>
            <strong>Business Use:</strong> Services are for business purposes only.
          </p>
          <p>
            <strong>Governing Law:</strong> Louisiana state law applies.
          </p>

          <h2>5. Privacy Policy Reference</h2>
          <p>
            The Privacy Policy governs data handling and is binding upon service use.
          </p>

          <h2>6. Priority of Terms</h2>
          <p>
            Signed proposals control service specifics in any conflict with these terms.
          </p>

          <p className="mt-12">
            <strong>Contact:</strong>{' '}
            <a href="mailto:hello@obieo.com" className="text-[var(--accent)]">hello@obieo.com</a>
          </p>
        </div>
      </Container>
    </Section>
    </>
  )
}
