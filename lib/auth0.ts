import { Auth0Client } from "@auth0/nextjs-auth0/server"

function requireAuth0Secret(): string {
  const secret = process.env.AUTH0_SECRET?.trim()
  if (!secret) {
    throw new Error(
      "AUTH0_SECRET is missing or empty. It is not from Auth0—generate a random secret " +
        "(e.g. `openssl rand -hex 32`, or run Node: randomBytes(32).toString('hex')).",
    )
  }
  return secret
}

function resolveAuth0Domain(): string | undefined {
  const direct = process.env.AUTH0_DOMAIN?.trim()
  if (direct) return direct

  const issuer = process.env.AUTH0_ISSUER_BASE_URL?.trim()
  if (!issuer) return undefined

  try {
    const url = issuer.includes("://") ? new URL(issuer) : new URL(`https://${issuer}`)
    return url.hostname || undefined
  } catch {
    return undefined
  }
}

function resolveBaseURL(): string | undefined {
  return (
    process.env.AUTH0_BASE_URL?.trim() ||
    process.env.APP_BASE_URL?.trim() ||
    undefined
  )
}

function createClient(): Auth0Client {
  const domain = resolveAuth0Domain()
  const baseURL = resolveBaseURL()
  return new Auth0Client({
    secret: requireAuth0Secret(),
    ...(domain ? { domain } : {}),
    ...(baseURL ? { baseURL } : {}),
    signInReturnToPath: "/dashboard",
  })
}

// Lazy singleton — client is only instantiated on the first method call (at request
// time), never at module-load time (build time). This prevents the build from failing
// when AUTH0_SECRET is not yet set in the CI/Vercel environment.
let _instance: Auth0Client | null = null

export const auth0 = new Proxy({} as Auth0Client, {
  get(_target, prop) {
    if (!_instance) _instance = createClient()
    const val = (_instance as unknown as Record<string | symbol, unknown>)[prop]
    return typeof val === "function" ? (val as (...a: unknown[]) => unknown).bind(_instance) : val
  },
})
