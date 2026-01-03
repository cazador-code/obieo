import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { sanityConfig } from './config'

export const client = createClient({
  ...sanityConfig,
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}
