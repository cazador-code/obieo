import Stripe from 'stripe'

let stripeClient: Stripe | null = null

const DEFAULT_STRIPE_API_VERSION = '2024-10-28.acacia'

export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return null
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      // Keep legacy metered usage records compatible with current billing flow.
      apiVersion: (process.env.STRIPE_API_VERSION || DEFAULT_STRIPE_API_VERSION) as Stripe.LatestApiVersion,
    })
  }

  return stripeClient
}
