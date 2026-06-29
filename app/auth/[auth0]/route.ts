import { Auth0Client } from "@auth0/nextjs-auth0/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

function getBaseURL(req: NextRequest): string {
  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const vercelUrl = process.env.VERCEL_URL
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https"
  const forwardedHost = req.headers.get("x-forwarded-host")
  const host = req.headers.get("host") || ""
  const envBaseURL = process.env.AUTH0_BASE_URL?.trim()

  console.info("[auth0/route] resolving baseURL", {
    VERCEL_PROJECT_PRODUCTION_URL: vercelProdUrl,
    VERCEL_URL: vercelUrl,
    "x-forwarded-proto": forwardedProto,
    "x-forwarded-host": forwardedHost,
    host,
    AUTH0_BASE_URL: envBaseURL,
  })

  if (vercelProdUrl) return `https://${vercelProdUrl}`
  if (vercelUrl) return `https://${vercelUrl}`
  if (forwardedHost && !forwardedHost.includes("localhost")) {
    return `${forwardedProto}://${forwardedHost}`
  }
  if (host && !host.includes("localhost")) {
    return `${forwardedProto}://${host}`
  }
  return envBaseURL || "http://localhost:3000"
}

function getClient(req: NextRequest): Auth0Client {
  const baseURL = getBaseURL(req)
  // Overwrite the env var so the SDK cannot fall back to a stale value
  process.env.AUTH0_BASE_URL = baseURL

  const config = {
    domain: process.env.AUTH0_DOMAIN?.trim() ?? "",
    clientId: process.env.AUTH0_CLIENT_ID?.trim() ?? "",
    clientSecret: process.env.AUTH0_CLIENT_SECRET ? "[set]" : "[MISSING]",
    secret: process.env.AUTH0_SECRET ? "[set]" : "[MISSING]",
    baseURL,
  }

  console.info("[auth0/route] creating Auth0Client", config)

  if (!process.env.AUTH0_DOMAIN?.trim()) console.error("[auth0/route] AUTH0_DOMAIN is not set")
  if (!process.env.AUTH0_CLIENT_ID?.trim()) console.error("[auth0/route] AUTH0_CLIENT_ID is not set")
  if (!process.env.AUTH0_CLIENT_SECRET?.trim()) console.error("[auth0/route] AUTH0_CLIENT_SECRET is not set")
  if (!process.env.AUTH0_SECRET?.trim()) console.error("[auth0/route] AUTH0_SECRET is not set")

  return new Auth0Client({
    domain: process.env.AUTH0_DOMAIN?.trim() ?? "",
    clientId: process.env.AUTH0_CLIENT_ID?.trim() ?? "",
    clientSecret: process.env.AUTH0_CLIENT_SECRET?.trim() ?? "",
    secret: process.env.AUTH0_SECRET?.trim() ?? "",
    baseURL,
    signInReturnToPath: "/dashboard",
  })
}

export async function GET(req: NextRequest) {
  console.info("[auth0/route] GET", req.nextUrl.pathname, req.nextUrl.search)
  try {
    return await getClient(req).handler(req)
  } catch (err) {
    console.error("[auth0/route] GET handler error", {
      pathname: req.nextUrl.pathname,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return new Response(`Auth error: ${err instanceof Error ? err.message : "unknown"}`, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.info("[auth0/route] POST", req.nextUrl.pathname)
  try {
    return await getClient(req).handler(req)
  } catch (err) {
    console.error("[auth0/route] POST handler error", {
      pathname: req.nextUrl.pathname,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return new Response(`Auth error: ${err instanceof Error ? err.message : "unknown"}`, { status: 500 })
  }
}
