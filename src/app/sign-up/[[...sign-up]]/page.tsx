import { SignUp } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { userId } = await auth()
  const params = (await searchParams) || {}
  const raw = params.redirect_url
  const redirectUrl = Array.isArray(raw) ? raw[0] : raw

  // Prevent redirect loops when a signed-in user lands on /sign-up.
  if (userId) {
    redirect(typeof redirectUrl === 'string' && redirectUrl ? redirectUrl : '/portal')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-10">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
      />
    </main>
  )
}
