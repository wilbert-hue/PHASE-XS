import type { NextRequest } from "next/server"
import { Auth0Client } from "@auth0/nextjs-auth0/server"

function makeClient(): Auth0Client {
  return new Auth0Client({
    domain: process.env.AUTH0_DOMAIN?.trim(),
    clientId: process.env.AUTH0_CLIENT_ID?.trim(),
    clientSecret: process.env.AUTH0_CLIENT_SECRET?.trim(),
    secret: process.env.AUTH0_SECRET?.trim(),
    // appBaseUrl is read from APP_BASE_URL env var automatically by the SDK.
    // On Vercel that env var is set to https://phasexs.com so the SDK always
    // uses the correct domain without needing to infer from request headers.
    appBaseUrl: process.env.APP_BASE_URL?.trim() || undefined,
    signInReturnToPath: "/dashboard",
  })
}

export async function middleware(request: NextRequest) {
  // Strip stale Clerk params from old bookmarks
  const url = new URL(request.url)
  let changed = false
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("__clerk")) {
      url.searchParams.delete(key)
      changed = true
    }
  }
  if (changed) return Response.redirect(url, 307)

  return makeClient().middleware(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
