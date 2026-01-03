import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { sanityConfig } from './config'

export const client = createClient({
  ...sanityConfig,
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(client)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source)
}

// Type-safe fetch helper
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
}: {
  query: string
  params?: Record<string, unknown>
  tags?: string[]
}): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {
      revalidate: process.env.NODE_ENV === 'development' ? 0 : 60,
      tags,
    },
  })
}
