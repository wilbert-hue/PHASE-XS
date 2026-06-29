import { Auth0Client } from "@auth0/nextjs-auth0/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

function getBaseURL(req: NextRequest): string {
  // On Vercel production, use the custom domain automatically
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  // On Vercel preview deployments, use the deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Fallback: read from request headers
  const proto = req.headers.get("x-forwarded-proto") || "https"
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || ""
  if (host && !host.includes("localhost")) {
    return `${proto}://${host}`
  }
  // Local dev fallback
  return process.env.AUTH0_BASE_URL?.trim() || "http://localhost:3000"
}

function getClient(req: NextRequest): Auth0Client {
  const baseURL = getBaseURL(req)
  // Force the SDK env var to match so it cannot fall back to a stale value
  process.env.AUTH0_BASE_URL = baseURL

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
