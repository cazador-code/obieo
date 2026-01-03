import { createClient, SanityClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Lazy client initialization to avoid build-time env validation errors
let _client: SanityClient | null = null
let _builder: ReturnType<typeof imageUrlBuilder> | null = null

// Validate projectId format (only a-z, 0-9, and dashes)
function isValidProjectId(id: string | undefined): id is string {
  if (!id) return false
  return /^[a-z0-9-]+$/.test(id)
}

function getClient(): SanityClient | null {
  if (!_client) {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
    const token = process.env.SANITY_API_TOKEN

    // Return null if projectId is not configured or invalid (e.g., placeholder values)
    if (!isValidProjectId(projectId)) {
      return null
    }

    _client = createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: process.env.NODE_ENV === 'production',
      token,
    })
  }
  return _client
}

function getBuilder(): ReturnType<typeof imageUrlBuilder> | null {
  const client = getClient()
  if (!client) return null

  if (!_builder) {
    _builder = imageUrlBuilder(client)
  }
  return _builder
}

// Placeholder builder for when Sanity is not configured
const placeholderBuilder = {
  url: () => '',
  width: () => placeholderBuilder,
  height: () => placeholderBuilder,
  fit: () => placeholderBuilder,
  auto: () => placeholderBuilder,
  quality: () => placeholderBuilder,
  format: () => placeholderBuilder,
  image: () => placeholderBuilder,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  const builder = getBuilder()
  if (!builder) {
    return placeholderBuilder
  }
  return builder.image(source)
}

// Type-safe fetch helper that returns empty/null when Sanity not configured
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  defaultValue,
}: {
  query: string
  params?: Record<string, unknown>
  tags?: string[]
  defaultValue?: T
}): Promise<T> {
  const client = getClient()

  // Return default value when Sanity is not configured (e.g., during build)
  if (!client) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    // Default to empty array for most queries
    return [] as unknown as T
  }

  return client.fetch<T>(query, params, {
    next: {
      revalidate: process.env.NODE_ENV === 'development' ? 0 : 60,
      tags,
    },
  })
}

// Export client getter for direct access if needed
export { getClient as client }
