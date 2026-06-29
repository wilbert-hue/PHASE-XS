import type { NextRequest, NextResponse } from "next/server"
import { auth0 } from "@/lib/auth0"

export async function middleware(request: NextRequest): Promise<Response | NextResponse> {
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

  // Auth routes are handled entirely by app/auth/[auth0]/route.ts — skip here
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    const { NextResponse } = await import("next/server")
    return NextResponse.next()
  }

  // Session refresh for all other routes (dashboard, API, etc.)
  return auth0.middleware(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
