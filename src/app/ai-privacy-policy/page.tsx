import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui'

// JSON-LD Schema for AI Privacy Policy Page
const aiPrivacySchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'AI Privacy Policy',
  description: 'How Obieo uses AI tools and protects your data. Learn about our responsible AI practices and data handling.',
  url: 'https://obieo.com/ai-privacy-policy',
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
  title: 'AI Privacy Policy | Obieo',
  description: 'How Obieo uses AI tools and protects your data.',
}

export default function AIPrivacyPolicyPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aiPrivacySchema) }}
      />

      <Section size="lg" className="pt-32">
      <Container size="md">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--text-primary)] mb-4">
          AI Privacy Policy
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-12">
          Effective Date: January 4, 2026 | Last Updated: January 4, 2026
        </p>

        <div className="prose prose-lg max-w-none text-[var(--text-secondary)] prose-headings:text-[var(--text-primary)] prose-headings:font-[family-name:var(--font-display)] prose-strong:text-[var(--text-primary)]">
          <h2>1. Our Approach to AI</h2>
          <p>
            Obieo leverages AI-powered tools to enhance work across marketing, design, web
            development, content creation, and project management. These tools assist with:
          </p>
          <ul>
            <li>Improving efficiency in brainstorming and drafting</li>
            <li>Accelerating internal workflows</li>
            <li>Transcribing and summarizing meetings</li>
            <li>Generating creative inspiration and concepts</li>
            <li>Analyzing patterns and providing insights</li>
          </ul>
          <p>
            <strong>AI tools are used to assist—not replace—our human expertise.</strong> Every
            client-facing deliverable receives review and approval from a qualified team member
            before delivery.
          </p>

          <h2>2. Data Privacy & Confidentiality</h2>
          <p>We treat your data carefully when using AI tools:</p>
          <ul>
            <li>
              No sensitive client data (passwords, financial information, personal identifiers)
              enters public AI systems
            </li>
            <li>Input data is anonymized or generalized where possible</li>
            <li>
              Only enterprise-grade or vetted AI tools with strong privacy commitments are used
            </li>
          </ul>
          <p>
            Examples of tools we may use include: OpenAI (ChatGPT), Claude, Microsoft CoPilot,
            Gemini, Jasper, Grammarly, and Adobe AI tools.
          </p>

          <h2>3. Client Transparency</h2>
          <p>
            Clients receive clear communication about AI tool usage and maintain the right to
            inquire about specific tools and processes used in their projects.
          </p>

          <h2>4. Your Rights & Choices</h2>
          <p>As a client, you can:</p>
          <ul>
            <li>Request clarity on how AI is used in your projects</li>
            <li>Inquire about specific tools employed</li>
            <li>Request summaries of our internal privacy practices</li>
            <li>Opt out of AI-assisted work (may affect timelines and pricing)</li>
          </ul>

          <h2>5. Updates to This Policy</h2>
          <p>
            This policy may be updated as AI technologies evolve. Changes will be reflected with new
            effective dates.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about our AI practices? Reach out at{' '}
            <a href="mailto:hello@obieo.com" className="text-[var(--accent)]">hello@obieo.com</a>
          </p>
        </div>
      </Container>
    </Section>
    </>
  )
}
