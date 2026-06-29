import { Auth0Client } from "@auth0/nextjs-auth0/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// Build a fresh Auth0Client per request using the actual incoming host,
// so the redirect_uri always matches the domain the user is on —
// regardless of what AUTH0_BASE_URL is set to in env vars.
function getClient(req: NextRequest): Auth0Client {
  const proto = req.headers.get("x-forwarded-proto") || "https"
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "phasexs.com"
  const baseURL = `${proto}://${host}`

  return new Auth0Client({
    domain: process.env.AUTH0_DOMAIN?.trim() ?? "",
    clientId: process.env.AUTH0_CLIENT_ID?.trim() ?? "",
    clientSecret: process.env.AUTH0_CLIENT_SECRET?.trim() ?? "",
    secret: process.env.AUTH0_SECRET?.trim() ?? "",
    baseURL,
    signInReturnToPath: "/dashboard",
  })
}

export function GET(req: NextRequest) {
  return getClient(req).handler(req)
}

export function POST(req: NextRequest) {
  return getClient(req).handler(req)
}
