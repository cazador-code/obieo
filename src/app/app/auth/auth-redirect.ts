export type AuthPageSearchParams = Record<string, string | string[] | undefined>

export function getFirstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

export function extractTicket(params: AuthPageSearchParams): string {
  return getFirstParam(params.ticket ?? params.__clerk_ticket).trim()
}

export function resolveRedirectUrl(value: string | string[] | undefined): string {
  const redirectUrl = getFirstParam(value)
  return redirectUrl.startsWith('/') ? redirectUrl : '/portal'
}

export function buildPathWithSearch(path: string, params: AuthPageSearchParams): string {
  const searchParams = new URLSearchParams()

  for (const [key, rawValue] of Object.entries(params)) {
    if (typeof rawValue === 'string') {
      searchParams.set(key, rawValue)
      continue
    }
    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        searchParams.append(key, value)
      }
    }
  }

  return searchParams.size > 0 ? `${path}?${searchParams.toString()}` : path
}

export function buildAuthUrl(path: '/sign-in' | '/sign-up', ticket: string): string {
  return ticket ? `${path}?ticket=${encodeURIComponent(ticket)}` : path
}
