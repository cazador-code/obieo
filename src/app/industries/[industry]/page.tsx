/**
 * Industry Authority Page
 * Dynamic route for comprehensive SEO/GEO optimized industry content
 * Path: /industries/[industry]
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  AuthorityPageLayout,
  generateAuthorityPageMetadata,
} from '@/components/authority-page'
import {
  getIndustryData,
  getAllIndustrySlugs,
} from '@/data/industries'

interface PageProps {
  params: Promise<{ industry: string }>
}

// Generate static params for all industries
export async function generateStaticParams() {
  const slugs = getAllIndustrySlugs()
  return slugs.map((industry) => ({ industry }))
}

// Generate metadata for each industry page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { industry } = await params
  const data = getIndustryData(industry)

  if (!data) {
    return {
      title: 'Industry Not Found',
    }
  }

  return generateAuthorityPageMetadata(data)
}

// Industry Authority Page Component
export default async function IndustryAuthorityPage({ params }: PageProps) {
  const { industry } = await params
  const data = getIndustryData(industry)

  if (!data) {
    notFound()
  }

  return <AuthorityPageLayout data={data} />
}
