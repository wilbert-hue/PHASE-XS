import type { NextRequest } from "next/server"
import { Auth0Client } from "@auth0/nextjs-auth0/server"

function getBaseURL(request: NextRequest): string {
  // On Vercel (any deployment), never use localhost
  if (process.env.VERCEL === "1") {
    // Use the explicit override if set correctly
    const explicit = process.env.AUTH0_BASE_URL?.trim()
    if (explicit && !explicit.includes("localhost")) return explicit

    // Read the actual request host (always correct on Vercel)
    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      ""
    if (host && !host.includes("localhost")) {
      return `https://${host}`
    }

    // Final hardcoded fallback for production
    return "https://phasexs.com"
  }

  // Local dev
  return process.env.AUTH0_BASE_URL?.trim() || "http://localhost:3000"
}

export async function middleware(request: NextRequest) {
  // Strip stale Clerk query params
  const url = new URL(request.url)
  let changed = false
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("__clerk")) {
      url.searchParams.delete(key)
      changed = true
    }
  }
  if (changed) return Response.redirect(url, 307)

  const baseURL = getBaseURL(request)
  console.info("[middleware] baseURL resolved to", baseURL, {
    VERCEL: process.env.VERCEL,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    host: request.headers.get("host"),
    "x-forwarded-host": request.headers.get("x-forwarded-host"),
  })

  const client = new Auth0Client({
    domain: process.env.AUTH0_DOMAIN?.trim() ?? "",
    clientId: process.env.AUTH0_CLIENT_ID?.trim() ?? "",
    clientSecret: process.env.AUTH0_CLIENT_SECRET?.trim() ?? "",
    secret: process.env.AUTH0_SECRET?.trim() ?? "",
    baseURL,
  })

  return client.middleware(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
