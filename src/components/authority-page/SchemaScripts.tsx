/**
 * Schema Scripts Component
 * Renders JSON-LD structured data for authority pages
 * Uses Next.js Script component for safe injection
 */

'use client'

import Script from 'next/script'
import type { IndustryAuthorityData } from '@/data/industries/types'
import { generateAllSchemas } from '@/lib/schema'

interface SchemaScriptsProps {
  data: IndustryAuthorityData
}

export function SchemaScripts({ data }: SchemaScriptsProps) {
  const schemas = generateAllSchemas(data)

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={`schema-${index}`}
          id={`schema-${data.slug}-${index}`}
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(schema)}
        </Script>
      ))}
    </>
  )
}
