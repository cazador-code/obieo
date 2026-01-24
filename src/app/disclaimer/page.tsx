import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui'

// JSON-LD Schema for Disclaimer Page
const disclaimerSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Disclaimer',
  description: 'Legal disclaimer for Obieo services and website. No guarantees of results, earnings, or specific outcomes.',
  url: 'https://obieo.com/disclaimer',
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
  title: 'Disclaimer | Obieo',
  description: 'Legal disclaimer for Obieo services and website.',
}

export default function DisclaimerPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(disclaimerSchema) }}
      />

      <Section size="lg" className="pt-32">
      <Container size="md">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
          Disclaimer
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-12">Last Updated: January 4, 2026</p>

        <div className="prose prose-lg max-w-none text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-headings:font-[family-name:var(--font-display)] prose-strong:text-[var(--text-primary)]">
          <h2>1. No Guarantees of Results</h2>
          <p>
            Any examples, case studies, results, testimonials, or success stories presented on this
            website represent extraordinary examples of what is possible. Your results will vary
            based on many factors.
          </p>

          <h2>2. No Professional or Financial Advice</h2>
          <p>
            Nothing on this website or provided through our services should be considered financial,
            legal, tax, or professional advice. Always consult with qualified professionals for
            specific advice.
          </p>

          <h2>3. Earnings & Performance Disclaimer</h2>
          <p>Obieo does not guarantee:</p>
          <ul>
            <li>Increases in revenue</li>
            <li>Higher rankings on Google</li>
            <li>Any specific financial outcome</li>
            <li>Specific lead volumes or conversion rates</li>
          </ul>

          <h2>4. Testimonials & Case Studies</h2>
          <p>
            Testimonials and case studies reflect the real experiences of actual clients; however,
            they are not typical, and results will differ based on your specific situation, market,
            and execution.
          </p>

          <h2>5. Not Responsible for Client Actions</h2>
          <p>
            Obieo disclaims responsibility for client business operations, sales processes, and lead
            follow-up execution. Your success depends heavily on your own actions and decisions.
          </p>

          <h2>6. No Guarantee of Service Availability</h2>
          <p>
            Obieo does not guarantee uninterrupted or error-free access to the website, dashboards,
            reports, software, or communication platforms. We strive for high availability but
            cannot guarantee it.
          </p>

          <h2>7. Affiliate Links</h2>
          <p>
            Affiliate commissions may be earned on promoted products or services. This does not
            affect the price you pay and helps support our business.
          </p>

          <h2>8. External Links</h2>
          <p>
            Third-party websites linked from this site are not endorsed or controlled by Obieo. We
            are not responsible for the content, privacy policies, or practices of external sites.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            Obieo is not liable for any direct, indirect, incidental, consequential, or punitive
            damages arising from the use of our services or website.
          </p>

          <h2>10. Changes to Disclaimer</h2>
          <p>
            These terms may be modified anytime without notice. Continued use of our services
            constitutes acceptance of any changes.
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
