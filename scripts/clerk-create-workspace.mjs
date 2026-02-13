#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs'
import { createClerkClient } from '@clerk/backend'

function loadEnvFile(path) {
  if (!existsSync(path)) return
  const envContent = readFileSync(path, 'utf-8')
  for (const rawLine of envContent.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function arg(flag, fallback = undefined) {
  const idx = process.argv.indexOf(flag)
  if (idx === -1) return fallback
  return process.argv[idx + 1] ?? fallback
}

function printUsageAndExit() {
  console.error(`
Usage:
  node scripts/clerk-create-workspace.mjs \\
    --name "Obieo Internal Workspace" \\
    [--slug obieo-internal] \\
    [--created-by user_123]

Notes:
  - Requires CLERK_SECRET_KEY in .env.local.
  - If --slug is omitted, workspace is created without a slug.
  - If a provided slug already exists, the existing workspace is returned.
`)
  process.exit(1)
}

async function run() {
  loadEnvFile('.env.local')

  const clerkSecretKey = process.env.CLERK_SECRET_KEY
  if (!clerkSecretKey) {
    console.error('Missing CLERK_SECRET_KEY in .env.local')
    process.exit(1)
  }

  const name = arg('--name', 'Obieo Internal Workspace')
  const slug = arg('--slug')
  const createdBy = arg('--created-by')

  if (!name) {
    printUsageAndExit()
  }

  const clerk = createClerkClient({ secretKey: clerkSecretKey })

  if (slug) {
    try {
      const existing = await clerk.organizations.getOrganization({ slug })
      console.log('Workspace already exists')
      console.log(
        JSON.stringify(
          {
            id: existing.id,
            name: existing.name,
            slug: existing.slug,
            status: 'existing',
          },
          null,
          2
        )
      )
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const isNotFound =
        message.includes('404') ||
        message.toLowerCase().includes('resource_not_found') ||
        message.toLowerCase().includes('not found')
      if (!isNotFound) throw error
    }
  }

  const created = await clerk.organizations.createOrganization({
    name,
    ...(slug ? { slug } : {}),
    ...(createdBy ? { createdBy } : {}),
  })

  console.log('Workspace created')
  console.log(
    JSON.stringify(
      {
        id: created.id,
        name: created.name,
        slug: created.slug,
        status: 'created',
      },
      null,
      2
    )
  )
}

run().catch((error) => {
  console.error('Failed to create workspace')
  if (error && typeof error === 'object') {
    const anyError = error
    if ('code' in anyError) console.error('Clerk code:', anyError.code)
    if ('status' in anyError) console.error('Clerk status:', anyError.status)
    if ('message' in anyError) console.error('Clerk message:', anyError.message)
    if ('longMessage' in anyError) console.error('Clerk longMessage:', anyError.longMessage)
    if ('docsUrl' in anyError) console.error('Clerk docsUrl:', anyError.docsUrl)
    if ('errors' in anyError) {
      try {
        console.error('Clerk errors:', JSON.stringify(anyError.errors))
      } catch {}
    }
  }
  process.exit(1)
})
