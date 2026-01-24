import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui'

// JSON-LD Schema for Privacy Policy Page
const privacySchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy',
  description: 'Privacy policy for Obieo services and website. Learn how we handle your data, SMS communications, and security practices.',
  url: 'https://obieo.com/privacy-policy',
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
  title: 'Privacy Policy | Obieo',
  description: 'Privacy policy for Obieo services and website.',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }}
      />

      <Section size="lg" className="pt-32">
      <Container size="md">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-12">Last Updated: January 4, 2026</p>

        <div className="prose prose-lg max-w-none text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-headings:font-[family-name:var(--font-display)] prose-strong:text-[var(--text-primary)]">
          <h2>About Obieo</h2>
          <p>
            Obieo operates as a digital marketing agency that provides SEO and web services for
            local home service businesses. This policy covers both our website and client marketing
            services.
          </p>

          <h2>Mobile Communications and Text Message Policy</h2>
          <h3>SMS/Text Message Program</h3>
          <p>
            We may send text messages directly or on behalf of clients. By providing a phone number
            and opting in, users consent to receive communications related to the services you
            inquired about. These may include appointment confirmations, reminders, follow-ups, and
            customer service updates.
          </p>

          <h3>Message Frequency and Charges</h3>
          <ul>
            <li>Message frequency varies by service</li>
            <li>Data rates may apply</li>
            <li>Major carriers supported (AT&T, T-Mobile, Verizon, Sprint, others)</li>
            <li>Delivery is not guaranteed</li>
          </ul>

          <h3>Opt-Out Instructions</h3>
          <p>
            Users can unsubscribe by replying &quot;STOP&quot; or &quot;QUIT, END, CANCEL, or
            UNSUBSCRIBE&quot; to messages, or emailing{' '}
            <a href="mailto:hello@obieo.com" className="text-[var(--accent)]">hello@obieo.com</a>.
            Users can reply &quot;HELP&quot; for assistance.
          </p>

          <h2>Marketing Services and Data Collection</h2>
          <h3>Client Data Processing</h3>
          <p>
            We handle data for social media campaigns, ad campaigns, website analytics, email
            marketing, SEO, and SMS/call communications.
          </p>

          <h3>Third-Party Tools</h3>
          <p>
            Services include Google Analytics, Meta tools, email platforms, SEO software, social
            media tools, and CRM systems.
          </p>

          <h2>Data Security and Compliance</h2>
          <h3>Standards</h3>
          <p>
            Compliance includes CAN-SPAM regulations, platform guidelines, and advertising standards.
          </p>

          <h3>Security Measures</h3>
          <p>Our security practices encompass:</p>
          <ul>
            <li>Encrypted data transmission</li>
            <li>Secure platform access</li>
            <li>Regular audits</li>
            <li>Employee training</li>
            <li>Restricted access</li>
            <li>Multi-factor authentication</li>
          </ul>

          <h2>Client Rights</h2>
          <p>
            Clients may access data, request exports, modify campaigns, terminate services, and
            request deletion documentation.
          </p>

          <h2>International Data Processing</h2>
          <p>
            Data processing occurs globally through international platforms and cloud-based tools.
          </p>

          <h2>Contact Information</h2>
          <p>
            <a href="mailto:hello@obieo.com" className="text-[var(--accent)]">hello@obieo.com</a>
          </p>
        </div>
      </Container>
    </Section>
    </>
  )
}
