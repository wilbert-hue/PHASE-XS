import { NextResponse } from "next/server"
import { auth0 } from "@/lib/auth0"
import { parseDashboardRegion, type DashboardRegion } from "@/lib/dashboard-region"
import { fetchTrialDetailForRegion } from "@/lib/trials-for-region"

export async function GET(
  req: Request,
  context: { params: Promise<{ nctId: string }> },
) {
  const session = await auth0.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { nctId } = await context.params
  const id = decodeURIComponent(nctId || "").trim()
  if (!id) {
    return NextResponse.json({ error: "Missing trial ID" }, { status: 400 })
  }

  const url = new URL(req.url)
  const region: DashboardRegion = parseDashboardRegion(url.searchParams.get("region"))

  try {
    const trial = await fetchTrialDetailForRegion(region, id)
    if (!trial) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({
      ...trial,
      sourceFields: trial.sourceFields ?? {},
    })
  } catch (err) {
    console.error("[api/dashboard/trial]", { region, err })
    return NextResponse.json({ error: "Failed to load trial" }, { status: 500 })
  }
}
