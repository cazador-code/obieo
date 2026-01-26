/**
 * Authority Page Layout Component
 * Main container for industry authority pages
 * Handles schema injection and overall page structure
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import type { IndustryAuthorityData } from '@/data/industries/types'
import { SchemaScripts } from './SchemaScripts'
import { TLDRBlock } from './TLDRBlock'
import { TableOfContents } from './TableOfContents'
import { DefinitionSection } from './DefinitionSection'
import { StatsTable } from './StatsTable'
import { IndustryLandscape } from './IndustryLandscape'
import { PainPointsSection } from './PainPointsSection'
import { StrategiesSection } from './StrategiesSection'
import { KeywordsSection } from './KeywordsSection'
import { ComparisonTable } from './ComparisonTable'
import { FAQSection } from './FAQSection'
import { AuthorBio } from './AuthorBio'
import { AuthorityCTA } from './AuthorityCTA'
import { RelatedIndustries } from '@/components/RelatedIndustries'

interface AuthorityPageLayoutProps {
  data: IndustryAuthorityData
}

// Table of contents items
const tocItems = [
  { id: 'what-is', label: 'What Is It?' },
  { id: 'statistics', label: 'Key Statistics' },
  { id: 'industry-landscape', label: 'Industry Landscape' },
  { id: 'pain-points', label: 'Common Challenges' },
  { id: 'strategies', label: 'Proven Strategies' },
  { id: 'keywords', label: 'Essential Keywords' },
  { id: 'seo-vs-ads', label: 'SEO vs. Ads' },
  { id: 'faq', label: 'FAQ' },
  { id: 'author', label: 'About the Author' },
]

export function AuthorityPageLayout({ data }: AuthorityPageLayoutProps) {
  return (
    <>
      {/* JSON-LD Schema Scripts */}
      <SchemaScripts data={data} />

      <main className="min-h-screen bg-[var(--bg-primary)]">
        {/* Hero Section */}
        <header className="bg-[var(--bg-secondary)] py-12 md:py-16 pt-24 md:pt-28">
          <div className="max-w-4xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-[var(--text-muted)] mb-6">
              <Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/industries" className="hover:text-[var(--accent)] transition-colors">Industries</Link>
              <span className="mx-2">/</span>
              <span className="text-[var(--text-primary)]">{data.name} SEO</span>
            </nav>

            <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
              {data.title}
            </h1>

            <p className="text-lg text-[var(--text-secondary)] mb-6">{data.description}</p>

            <p className="text-sm text-[var(--text-muted)]">
              Last updated: {new Date(data.lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* TL;DR */}
          <TLDRBlock content={data.tldr} accentColor={data.accentColor} />

          {/* Table of Contents */}
          <TableOfContents items={tocItems} />

          {/* Definition */}
          <DefinitionSection
            industryName={data.name}
            direct={data.definition.direct}
            expanded={data.definition.expanded}
          />

          {/* Statistics */}
          <StatsTable stats={data.stats} />

          {/* Industry Landscape */}
          <IndustryLandscape
            industryName={data.name}
            marketSize={data.landscape.marketSize}
            marketSizeSource={data.landscape.marketSizeSource}
            growth={data.landscape.growth}
            trends={data.landscape.trends}
            seasonal={data.landscape.seasonal}
          />

          {/* Pain Points */}
          <PainPointsSection
            industryName={data.name}
            painPoints={data.painPoints}
            accentColor={data.accentColor}
          />

          {/* Strategies */}
          <StrategiesSection
            industryName={data.name}
            strategies={data.strategies}
            accentColor={data.accentColor}
          />

          {/* Keywords */}
          <KeywordsSection industryName={data.name} keywords={data.keywords} />

          {/* SEO vs Ads Comparison */}
          <ComparisonTable
            industryName={data.name}
            comparisons={data.seoVsAdsComparison}
          />

          {/* FAQ */}
          <FAQSection industryName={data.name} faqs={data.faqs} />

          {/* Author Bio */}
          <AuthorBio industryName={data.name} />

          {/* CTA */}
          <AuthorityCTA
            industryName={data.name}
            landingPageSlug={data.landingPageSlug}
            accentColor={data.accentColor}
          />

          {/* Related Industries */}
          <div className="bg-[#1a1612] rounded-xl -mx-4 px-4 py-8 md:-mx-8 md:px-8">
            <RelatedIndustries
              currentSlug={data.slug}
              heading={`Related to ${data.name}`}
              subheading="Explore SEO strategies for similar home service industries"
              showServices={false}
            />
          </div>
        </article>
      </main>
    </>
  )
}

/**
 * Generate metadata for authority pages
 */
export function generateAuthorityPageMetadata(data: IndustryAuthorityData): Metadata {
  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'article',
      publishedTime: data.lastUpdated,
      modifiedTime: data.lastUpdated,
      authors: ['Hunter Lapeyre'],
      images: [`/og/${data.slug}-seo.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: [`/og/${data.slug}-seo.png`],
    },
  }
}
