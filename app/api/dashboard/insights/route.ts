import { NextResponse } from "next/server"
import { auth0 } from "@/lib/auth0"

export const dynamic = "force-dynamic"
import { parseDashboardRegion } from "@/lib/dashboard-region"
import { fetchTrialsForRegion } from "@/lib/trials-for-region"
import { computeInsights } from "@/lib/insights-query"

export async function POST(req: Request) {
  const session = await auth0.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const region = parseDashboardRegion(body.region)
  const query = typeof body.query === "string" ? body.query.trim() : ""

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }

  if (query.length > 200) {
    return NextResponse.json({ error: "query too long" }, { status: 400 })
  }

  try {
    const trials = await fetchTrialsForRegion(region)
    const result = computeInsights(trials, query, region)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/dashboard/insights]", { region, query, err })
    return NextResponse.json({ error: "Failed to compute insights" }, { status: 500 })
  }
}
