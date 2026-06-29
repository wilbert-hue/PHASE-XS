import type { NextRequest } from "next/server"
import { Auth0Client } from "@auth0/nextjs-auth0/server"

export async function middleware(request: NextRequest) {
  // Strip stale Clerk query params from bookmarks/history
  const url = new URL(request.url)
  let changed = false
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("__clerk")) {
      url.searchParams.delete(key)
      changed = true
    }
  }
  if (changed) {
    return Response.redirect(url, 307)
  }

  // Derive the real base URL from the incoming request (never localhost on production)
  const forwardedHost = request.headers.get("x-forwarded-host")
  const host = request.headers.get("host") || ""
  const actualHost = forwardedHost || host
  const isLocalhost = actualHost.includes("localhost") || actualHost.includes("127.0.0.1")

  let baseURL: string
  if (!isLocalhost && actualHost) {
    const proto = request.headers.get("x-forwarded-proto") || "https"
    baseURL = `${proto}://${actualHost}`
  } else {
    baseURL = process.env.AUTH0_BASE_URL?.trim() || "http://localhost:3000"
  }

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
