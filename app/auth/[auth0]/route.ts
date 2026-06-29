import { Auth0Client } from "@auth0/nextjs-auth0/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

function getBaseURL(req: NextRequest): string {
  if (process.env.VERCEL === "1") {
    const explicit = process.env.AUTH0_BASE_URL?.trim()
    if (explicit && !explicit.includes("localhost")) return explicit

    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      ""
    if (host && !host.includes("localhost")) return `https://${host}`

    return "https://phasexs.com"
  }
  return process.env.AUTH0_BASE_URL?.trim() || "http://localhost:3000"
}

function getClient(req: NextRequest): Auth0Client {
  const baseURL = getBaseURL(req)

  console.info("[auth0/route] GET", req.nextUrl.pathname, {
    baseURL,
    VERCEL: process.env.VERCEL,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    host: req.headers.get("host"),
    "x-forwarded-host": req.headers.get("x-forwarded-host"),
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN ? "[set]" : "[MISSING]",
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? "[set]" : "[MISSING]",
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ? "[set]" : "[MISSING]",
    AUTH0_SECRET: process.env.AUTH0_SECRET ? "[set]" : "[MISSING]",
  })

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
  try {
    return await getClient(req).handler(req)
  } catch (err) {
    console.error("[auth0/route] GET error", {
      pathname: req.nextUrl.pathname,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return new Response(`Auth error: ${err instanceof Error ? err.message : "unknown"}`, {
      status: 500,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    return await getClient(req).handler(req)
  } catch (err) {
    console.error("[auth0/route] POST error", {
      message: err instanceof Error ? err.message : String(err),
    })
    return new Response(`Auth error: ${err instanceof Error ? err.message : "unknown"}`, {
      status: 500,
    })
  }
}
